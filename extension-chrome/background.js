console.log("Background script loaded");

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

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab && isAllowedUrl(tab.url)) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ["content.js"],
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error("Error injecting content script:", chrome.runtime.lastError);
          } else {
            chrome.tabs.sendMessage(tab.id, {
              action: "toggleRecording",
              isRecording,
              volume: volumeLevel,
            });
          }
        }
      );
    } else {
      console.log("Cannot inject script into this page:", tab?.url || "No active tab");
    }
  });
}

function isAllowedUrl(url) {
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("file://");
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
