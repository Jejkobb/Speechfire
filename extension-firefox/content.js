// content.js
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let mediaStream = null;

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message) => {
    console.log(`Message received: ${message.command}`); // Log message for debugging
    if (message.command === "start_stop_transcription") {
        if (isRecording) {
            console.log("Stopping recording...");
            mediaRecorder.stop();
            isRecording = false;
            
            // Release microphone by stopping all tracks
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => {
                    track.stop();
                    console.log("Released microphone track");
                });
                mediaStream = null;
            }
        } else {
            console.log("Starting recording...");
            startRecording();
        }
    }
});

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaStream = stream; // Store stream reference for cleanup
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            console.log("MediaRecorder started");

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                console.log("MediaRecorder stopped");
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                audioChunks = [];
                sendAudioForTranscription(audioBlob);
                
                // Release microphone after processing
                if (mediaStream) {
                    mediaStream.getTracks().forEach(track => {
                        track.stop();
                        console.log("Released microphone track after recording");
                    });
                    mediaStream = null;
                }
            };

            isRecording = true;
        })
        .catch(error => {
            console.error('Error accessing audio:', error);
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
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log("Transcription received:", data.transcription); // Log transcription for debugging
            if (data.transcription) {
                pasteTranscription(data.transcription);
            }
        })
        .catch(error => console.error('Error:', error));
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
