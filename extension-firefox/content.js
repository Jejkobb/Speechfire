// content.js
let mediaRecorder;
let audioChunks = [];
let isRecording = false;

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message) => {
    console.log(`Message received: ${message.command}`); // Log message for debugging
    if (message.command === "start_stop_transcription") {
        if (isRecording) {
            console.log("Stopping recording...");
            mediaRecorder.stop();
            isRecording = false;
        } else {
            console.log("Starting recording...");
            startRecording();
        }
    }
});

function startRecording() {
    // Test server connection first
    testServerConnection()
        .then(serverAvailable => {
            if (!serverAvailable) {
                showErrorNotification("Cannot connect to Speechfire server. Please ensure it's running on http://127.0.0.1:5000");
                // Tell background script recording failed
                chrome.runtime.sendMessage({ action: "recordingFailed" });
                return;
            }

            // Server is available, proceed with recording
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    mediaRecorder = new MediaRecorder(stream);
                    mediaRecorder.start();
                    console.log("MediaRecorder started");
                    
                    // Tell background script recording actually started
                    chrome.runtime.sendMessage({ action: "recordingStarted" });

                    mediaRecorder.ondataavailable = (event) => {
                        audioChunks.push(event.data);
                    };

                    mediaRecorder.onstop = () => {
                        console.log("MediaRecorder stopped");
                        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                        audioChunks = [];
                        sendAudioForTranscription(audioBlob);
                        
                        // Tell background script recording stopped
                        chrome.runtime.sendMessage({ action: "recordingStopped" });
                    };

                    isRecording = true;
                })
                .catch(error => {
                    console.error('Error accessing audio:', error);
                    showErrorNotification("Cannot access microphone. Please check permissions.");
                    // Tell background script recording failed
                    chrome.runtime.sendMessage({ action: "recordingFailed" });
                });
        });
}

function sendAudioForTranscription(audioBlob) {
    // Request the selected language from background.js
    chrome.runtime.sendMessage({ action: "getLanguage" }, (response) => {
        const selectedLanguage = response.language || 'English'; // Default to English if no language is received

        const formData = new FormData();
        formData.append('audio_data', audioBlob, 'audio.wav');

        // Send the language as a query string parameter
        fetch(`http://127.0.0.1:5000/transcribe?lang=${encodeURIComponent(selectedLanguage)}`, {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(30000) // 30 second timeout for transcription
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                showErrorNotification(`Transcription failed: ${data.error}`);
                return;
            }
            console.log("Transcription received:", data.transcription); // Log transcription for debugging
            if (data.transcription) {
                pasteTranscription(data.transcription);
            } else {
                showErrorNotification("No transcription received from server");
            }
        })
        .catch(error => {
            console.error('Transcription error:', error);
            
            // Determine error type and show appropriate message
            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
                showErrorNotification("Request timed out. Please check if the Speechfire server is running.");
            } else if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
                showErrorNotification("Cannot connect to Speechfire server. Please ensure it's running on http://127.0.0.1:5000");
            } else if (error.message.includes('Server error')) {
                showErrorNotification(error.message);
            } else {
                showErrorNotification(`Transcription failed: ${error.message}`);
            }
        });
    });
}

function testServerConnection() {
    return fetch('http://127.0.0.1:5000/', {
        method: 'GET',
        signal: AbortSignal.timeout(100)
    })
    .then(response => {
        return response.ok;
    })
    .catch(error => {
        console.log('Server connection test failed:', error);
        return false;
    });
}

function simulatePaste(text) {
    const activeElement = document.activeElement;

    if (activeElement && (activeElement.tagName === "TEXTAREA" || (activeElement.tagName === "INPUT" && activeElement.type === "text"))) {
        // Handle input and textarea elements
        const start = activeElement.selectionStart;
        const end = activeElement.selectionEnd;

        // Insert the text at the cursor position
        activeElement.value = activeElement.value.substring(0, start) + text + activeElement.value.substring(end);

        // Restore cursor position
        activeElement.selectionStart = activeElement.selectionEnd = start + text.length;

        // Trigger the input event to update any listeners or UI updates
        const event = new Event('input', { bubbles: true });
        activeElement.dispatchEvent(event);

    } else if (activeElement && activeElement.isContentEditable) {
        // Handle contenteditable elements like divs
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);

        // Delete the selected content if any
        range.deleteContents();

        // Insert the new text
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);

        // Move the cursor to the end of the inserted text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);

        // Dispatch an input event to notify any listeners
        const event = new Event('input', { bubbles: true });
        activeElement.dispatchEvent(event);
    }
}

function pasteTranscription(text) {
    simulatePaste(text);
}

function showErrorNotification(message) {
    // Remove any existing error notifications
    const existingNotification = document.getElementById('speechfire-error-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create error notification element
    const notification = document.createElement('div');
    notification.id = 'speechfire-error-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 350px;
        line-height: 1.4;
        cursor: pointer;
        transition: opacity 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 10px;">
            <div style="flex-shrink: 0; font-size: 16px;">🔥</div>
            <div style="flex: 1;">
                <div style="font-weight: 600; margin-bottom: 4px;">Speechfire Error</div>
                <div style="margin-bottom: 8px;">${message}</div>
                <a href="https://github.com/Jejkobb/Speechfire?tab=readme-ov-file#overview" 
                   target="_blank" 
                   style="color: #ffffff; text-decoration: underline; font-size: 12px; opacity: 0.9;">
                   📖 View Setup Instructions
                </a>
            </div>
            <div style="flex-shrink: 0; font-size: 18px; opacity: 0.7;">×</div>
        </div>
    `;

    // Add click to dismiss (but not for links)
    notification.addEventListener('click', (e) => {
        if (e.target.tagName !== 'A') {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }
    });

    // Add to page
    document.body.appendChild(notification);

    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 8000);
}
