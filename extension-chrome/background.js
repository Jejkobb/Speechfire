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

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      if (isAllowedUrl(tabs[0].url)) {
        ensureContentScriptInjected(tabs[0].id, () => {
          sendMessageToContentScript(
            tabs[0].id,
            { action: "playSound", sound: isRecording ? "start" : "stop", volume: volumeLevel },
            (response) => {
              if (response && response.success) {
                console.log("Sound played successfully");
                sendMessageToContentScript(tabs[0].id, { action: "toggleRecording", isRecording: isRecording }, (response) => {
                  if (response && response.success) {
                    console.log("Recording toggled in content script");
                  } else {
                    console.error("Error toggling recording:", response ? response.error : "Unknown error");
                  }
                });
              } else {
                console.error("Error playing sound:", response ? response.error : "Unknown error");
              }
            }
          );
        });
      } else {
        console.log("Cannot inject script into this page:", tabs[0].url);
        // Optionally, you can show a notification to the user here
      }
    } else {
      console.log("No active tab found for playing sound and toggling recording");
    }
  });
}

function isAllowedUrl(url) {
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("file://");
}

function ensureContentScriptInjected(tabId, callback) {
  chrome.tabs.sendMessage(tabId, { action: "ping" }, (response) => {
    if (chrome.runtime.lastError || !response) {
      console.log("Content script not found, injecting...");
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          files: ["content.js"],
        },
        (injectionResults) => {
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

function handleSoundResponse(response) {
  if (response && response.success) {
    console.log("Sound played successfully");
    // Now send the toggleRecording message
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleRecording", isRecording: isRecording }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error toggling recording:", chrome.runtime.lastError);
          } else {
            console.log("Recording toggled in content script");
          }
        });
      }
    });
  } else {
    console.error("Error playing sound:", response ? response.error : "Unknown error");
  }
}

function injectContentScript(tabId, callback) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ["content.js"],
    },
    (injectionResults) => {
      if (chrome.runtime.lastError) {
        console.error("Error injecting content script:", chrome.runtime.lastError);
      } else {
        console.log("Content script injected successfully");
        if (callback) callback();
      }
    }
  );
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
