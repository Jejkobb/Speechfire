chrome.runtime.onInstalled.addListener(() => {
    console.log("Whisper Live Transcription Extension Installed");
});

// background.js
chrome.commands.onCommand.addListener((command) => {
    console.log(`Command received: ${command}`); // Log command for debugging

    // Toggle global extension settings like icon changes
    if (command === "start_stop_transcription") {
        toggleRecording();
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { command: command });
    });
});


let isRecording = false;

// Paths to your sound files
const startSound = new Audio(browser.runtime.getURL("sounds/start.mp3"));
const stopSound = new Audio(browser.runtime.getURL("sounds/stop.mp3"));

function toggleRecording() {
    if (!isRecording) {
        // Set the volume of the start sound and play it
        startSound.volume = volumeLevel;
        startSound.play();

        // Change icon
        browser.browserAction.setIcon({ path: "icon-red.png" });
        isRecording = true;
    } else {
        // Play the stop recording sound
        stopSound.volume = volumeLevel;
        stopSound.play();

        // Stop recording
        browser.browserAction.setIcon({ path: "icon.png" });
        isRecording = false;
    }
}

// Variable to store volume level (0 to 1)
let volumeLevel = 1.0;
let selectedLanguage = "English"; // Default language

// Load settings from chrome storage when the background script starts
chrome.storage.local.get('volume', (data) => {
    if (data.volume !== undefined) {
        volumeLevel = data.volume;
        console.log('Volume restored:', data.volume);
    } else {
        console.log('No volume stored, using default.');
    }
});

chrome.storage.local.get('language', (data) => {
    if (data.language !== undefined) {
        selectedLanguage = data.language;
        console.log('Language restored:', data.language);
    } else {
        console.log('No language stored, using default.');
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getLanguage") {
        sendResponse({ language: selectedLanguage });
    } else if (message.action === "updateVolume") {
        volumeLevel = message.volume;
        console.log(`Volume updated: ${volumeLevel}`);
    } else if (message.action === "updateLanguage") {
        selectedLanguage = message.language;
        console.log(`Language updated: ${selectedLanguage}`);
    }
});
