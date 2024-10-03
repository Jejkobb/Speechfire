// content.js
console.log("Content script loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "ping") {
    sendResponse({ success: true });
    return;
  }

  if (message.action === "toggleRecording") {
    console.log(`Toggle recording command received: ${message.isRecording ? "Start" : "Stop"}`);
    if (message.isRecording) {
      startRecording();
      playSound("start", message.volume);
    } else {
      stopRecording();
      playSound("stop", message.volume);
    }
    sendResponse({ success: true });
  }

  sendResponse({ success: false, message: "Unknown action" });
});

const startSound = new Audio(chrome.runtime.getURL("sounds/start.mp3"));
const stopSound = new Audio(chrome.runtime.getURL("sounds/stop.mp3"));

let mediaRecorder;
let audioChunks = [];

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
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        audioChunks = [];
        sendAudioForTranscription(audioBlob);
      };
    })
    .catch((error) => {
      console.error("Error accessing audio:", error);
    });
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    console.log("MediaRecorder stopped");
  }
}

function sendAudioForTranscription(audioBlob) {
  console.log("Sending audio for transcription");
  chrome.runtime.sendMessage({ action: "getLanguage" }, (response) => {
    const selectedLanguage = response.language || "English";

    const formData = new FormData();
    formData.append("audio_data", audioBlob, "audio.wav");

    fetch(`http://127.0.0.1:5000/transcribe?lang=${encodeURIComponent(selectedLanguage)}`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.transcription) {
          pasteTranscription(data.transcription);
        }
      })
      .catch((error) => console.error("Transcription error:", error));
  });
}

function pasteTranscription(text) {
  const activeElement = document.activeElement;

  if (
    activeElement &&
    (activeElement.isContentEditable ||
      activeElement.tagName.toLowerCase() === "input" ||
      activeElement.tagName.toLowerCase() === "textarea")
  ) {
    if (activeElement.isContentEditable) {
      activeElement.textContent += text;
    } else {
      const start = activeElement.selectionStart;
      const end = activeElement.selectionEnd;
      const currentValue = activeElement.value;
      activeElement.value = currentValue.substring(0, start) + text + currentValue.substring(end);
      activeElement.selectionStart = activeElement.selectionEnd = start + text.length;
    }
    console.log("Transcription inserted successfully");
  } else {
    console.log("No suitable element for inserting transcription");
  }
}

function playSound(soundType, volume) {
  const sound = soundType === "start" ? startSound : stopSound;
  sound.volume = volume;
  sound
    .play()
    .then(() => console.log(`${soundType} sound played successfully`))
    .catch((error) => console.error(`Error playing ${soundType} sound:`, error));
}

console.log("Content script setup complete");
