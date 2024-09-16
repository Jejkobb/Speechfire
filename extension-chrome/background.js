console.log("Background script loaded");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Whisper Live Transcription Extension Installed");
});

let isRecording = false;
let volumeLevel = 1.0;
let selectedLanguage = "English";

console.log("Initial state:", { isRecording, volumeLevel, selectedLanguage });

// Add this line to explicitly register the command
chrome.commands.onCommand.addListener((command) => {
  console.log(`Command received: ${command}`);

  if (command === "start_stop_transcription") {
    console.log("Toggling recording");
    toggleRecording();
  }
});

function toggleRecording() {
  isRecording = !isRecording;
  console.log("Recording toggled:", isRecording);

  const iconPath = isRecording ? chrome.runtime.getURL("icon/icon-red.png") : chrome.runtime.getURL("icon/icon-128.png");

  console.log("Setting icon:", iconPath);
  chrome.action.setIcon({ path: iconPath }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error setting icon:", chrome.runtime.lastError);
    } else {
      console.log("Icon set successfully");
    }
  });

  // Notify content script to start/stop recording
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      console.log("Sending toggleRecording message to content script");
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggleRecording", isRecording: isRecording }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending toggleRecording message:", chrome.runtime.lastError);
          // If content script is not ready, inject it
          chrome.scripting.executeScript(
            {
              target: { tabId: tabs[0].id },
              files: ["content.js"],
            },
            () => {
              if (chrome.runtime.lastError) {
                console.error("Error injecting content script:", chrome.runtime.lastError);
              } else {
                console.log("Content script injected, retrying message");
                // Retry sending the message after a short delay
                setTimeout(() => {
                  chrome.tabs.sendMessage(tabs[0].id, { action: "toggleRecording", isRecording: isRecording }, (response) => {
                    if (chrome.runtime.lastError) {
                      console.error("Error sending toggleRecording message after injection:", chrome.runtime.lastError);
                    } else {
                      console.log("ToggleRecording message sent after injection, response:", response);
                    }
                  });
                }, 100);
              }
            }
          );
        } else {
          console.log("ToggleRecording message sent, response:", response);
        }
      });
    } else {
      console.log("No active tab found for toggling recording");
    }
  });
}

// Load settings from chrome storage when the background script starts
console.log("Loading settings from storage");
chrome.storage.local.get(["volume", "language"], (data) => {
  console.log("Storage data received:", data);
  if (data.volume !== undefined) {
    volumeLevel = data.volume;
    console.log("Volume restored:", volumeLevel);
  } else {
    console.log("No volume stored, using default:", volumeLevel);
  }

  if (data.language !== undefined) {
    selectedLanguage = data.language;
    console.log("Language restored:", selectedLanguage);
  } else {
    console.log("No language stored, using default:", selectedLanguage);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background:", message);
  if (message.action === "getLanguage") {
    console.log("Sending language:", selectedLanguage);
    sendResponse({ language: selectedLanguage });
  } else if (message.action === "updateVolume") {
    volumeLevel = message.volume;
    console.log("Volume updated:", volumeLevel);
  } else if (message.action === "updateLanguage") {
    selectedLanguage = message.language;
    console.log("Language updated:", selectedLanguage);
  }
});

console.log("Background script setup complete");
