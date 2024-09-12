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
        // Play the start recording sound
        startSound.play();

        // Change icon
        browser.browserAction.setIcon({ path: "icon-red.png" });
        isRecording = true;
    } else {
        // Play the stop recording sound
        stopSound.play();

        // Stop recording
        browser.browserAction.setIcon({ path: "icon.png" });
        isRecording = false;
    }
}
