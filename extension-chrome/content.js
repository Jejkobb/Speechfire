// content.js
console.log("Content script loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in content script:", message);

  if (message.action === "ping") {
    sendResponse({ success: true });
    return;
  }

  if (message.action === "toggleRecording") {
    console.log("Toggle recording command received");
    if (message.isRecording) {
      console.log("Starting recording...");
      startRecording();
    } else {
      console.log("Stopping recording...");
      stopRecording();
    }
    sendResponse({ received: true });
  } else if (message.action === "playSound") {
    console.log("Play sound command received:", message.sound);
    const sound = message.sound === "start" ? startSound : stopSound;
    sound.volume = message.volume;
    sound
      .play()
      .then(() => {
        console.log("Sound played successfully");
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("Error playing sound:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Indicates that the response will be sent asynchronously
  }

  // Send a response to acknowledge receipt of the message
  sendResponse({ received: true });
});

const startSound = new Audio(chrome.runtime.getURL("sounds/start.mp3"));
const stopSound = new Audio(chrome.runtime.getURL("sounds/stop.mp3"));

console.log("Audio objects created");

let mediaRecorder;
let audioChunks = [];
let isRecording = false;

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in content script:", message);

  if (message.action === "ping") {
    sendResponse({ success: true });
    return;
  }

  if (message.action === "toggleRecording") {
    console.log("Toggle recording command received");
    if (message.isRecording) {
      console.log("Starting recording...");
      startRecording();
    } else {
      console.log("Stopping recording...");
      stopRecording();
    }
    sendResponse({ received: true });
  } else if (message.action === "playSound") {
    console.log("Play sound command received:", message.sound);
    const sound = message.sound === "start" ? startSound : stopSound;
    sound.volume = message.volume;
    sound
      .play()
      .then(() => {
        console.log("Sound played successfully");
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("Error playing sound:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Indicates that the response will be sent asynchronously
  }

  // Send a response to acknowledge receipt of the message
  sendResponse({ received: true });
});

function startRecording() {
  console.log("Requesting media access");
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      console.log("Media access granted");
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      console.log("MediaRecorder started");

      mediaRecorder.ondataavailable = (event) => {
        console.log("Data available from MediaRecorder");
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        console.log("MediaRecorder stopped");
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        audioChunks = [];
        sendAudioForTranscription(audioBlob);
      };

      isRecording = true;
    })
    .catch((error) => {
      console.error("Error accessing audio:", error);
    });
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    isRecording = false;
  }
}

function sendAudioForTranscription(audioBlob) {
  console.log("Sending audio for transcription");
  // Request the selected language from background.js
  chrome.runtime.sendMessage({ action: "getLanguage" }, (response) => {
    console.log("Language received from background:", response);
    const selectedLanguage = response.language || "English";

    const formData = new FormData();
    formData.append("audio_data", audioBlob, "audio.wav");

    console.log("Sending transcription request to server");
    fetch(`http://127.0.0.1:5000/transcribe?lang=${encodeURIComponent(selectedLanguage)}`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Transcription received:", data.transcription);
        if (data.transcription) {
          pasteTranscription(data.transcription);
        }
      })
      .catch((error) => console.error("Error:", error));
  });
}

function pasteTranscription(text) {
  console.log("Pasting transcription:", text);
  const activeElement = document.activeElement;

  if (
    activeElement &&
    (activeElement.isContentEditable ||
      activeElement.tagName.toLowerCase() === "input" ||
      activeElement.tagName.toLowerCase() === "textarea")
  ) {
    if (activeElement.isContentEditable) {
      // For contenteditable elements
      activeElement.textContent += text;
    } else {
      // For input and textarea elements
      const start = activeElement.selectionStart;
      const end = activeElement.selectionEnd;
      const currentValue = activeElement.value;
      activeElement.value = currentValue.substring(0, start) + text + currentValue.substring(end);
      activeElement.selectionStart = activeElement.selectionEnd = start + text.length;
    }
    console.log("Text inserted successfully");
  } else {
    console.log("No suitable active element found for inserting text");
  }
}

console.log("Content script setup complete");
