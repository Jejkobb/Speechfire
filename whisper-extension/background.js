chrome.runtime.onInstalled.addListener(() => {
    console.log("Whisper Live Transcription Extension Installed");
});

// background.js
chrome.commands.onCommand.addListener((command) => {
    console.log(`Command received: ${command}`); // Log command for debugging
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { command: command });
    });
});
