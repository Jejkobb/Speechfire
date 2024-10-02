console.log("Background script loaded");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Whisper Live Transcription Extension Installed");
});

let isRecording = false;
let volumeLevel = 1.0;
let selectedLanguage = "English";

chrome.commands.onCommand.addListener((command) => {
  if (command === "start_stop_transcription") {
    toggleRecording();
  }
});

function toggleRecording() {
  isRecording = !isRecording;
  const iconPath = isRecording ? "icon/icon-red-128.png" : "icon/icon-128.png";

  chrome.action.setIcon({ path: iconPath }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error setting icon:", chrome.runtime.lastError);
    } else {
      console.log("Extension icon updated");
    }
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && isAllowedUrl(tabs[0].url)) {
      ensureContentScriptInjected(tabs[0].id, () => {
        sendMessageToContentScript(
          tabs[0].id,
          { action: "playSound", sound: isRecording ? "start" : "stop", volume: volumeLevel },
          (response) => {
            if (response && response.success) {
              sendMessageToContentScript(tabs[0].id, { action: "toggleRecording", isRecording }, (resp) => {
                if (resp && resp.success) {
                  console.log("Recording state updated in content script");
                } else {
                  console.error("Failed to update recording state:", resp ? resp.error : "Unknown error");
                }
              });
            } else {
              console.error("Failed to play sound:", response ? response.error : "Unknown error");
            }
          }
        );
      });
    } else {
      console.log("Cannot inject script into this page:", tabs[0]?.url || "No active tab");
    }
  });
}

function isAllowedUrl(url) {
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("file://");
}

function ensureContentScriptInjected(tabId, callback) {
  chrome.tabs.sendMessage(tabId, { action: "ping" }, (response) => {
    if (chrome.runtime.lastError || !response) {
      chrome.scripting.executeScript(
        {
          target: { tabId },
          files: ["content.js"],
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error("Error injecting content script:", chrome.runtime.lastError);
          } else {
            console.log("Content script injected successfully");
            callback();
          }
        }
      );
    } else {
      console.log("Content script already present");
      callback();
    }
  });
}

function sendMessageToContentScript(tabId, message, callback) {
  chrome.tabs.sendMessage(tabId, message, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error sending message:", chrome.runtime.lastError);
      callback({ success: false, error: chrome.runtime.lastError.message });
    } else {
      callback(response);
    }
  });
}

// Load settings from chrome storage on startup
chrome.storage.local.get(["volume", "language"], (data) => {
  if (data.volume !== undefined) {
    volumeLevel = data.volume;
  }
  if (data.language !== undefined) {
    selectedLanguage = data.language;
  }
  console.log("Settings loaded:", { volumeLevel, selectedLanguage });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getLanguage") {
    sendResponse({ language: selectedLanguage });
  } else if (message.action === "updateVolume") {
    volumeLevel = message.volume;
    console.log("Volume updated to:", volumeLevel);
  } else if (message.action === "updateLanguage") {
    selectedLanguage = message.language;
    console.log("Language updated to:", selectedLanguage);
  }
  return false;
});

console.log("Background script setup complete");
