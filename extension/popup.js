// Function to save the settings to storage
function saveSettings(volume, language) {
    chrome.storage.local.set({
        volume: volume,
        language: language
    }, () => {
        console.log('Settings saved:', { volume, language });
    });
}

// Function to restore settings from storage
function restoreSettings() {
    chrome.storage.local.get(['volume', 'language'], (data) => {
        if (data.volume !== undefined) {
            volumeSlider.value = data.volume * 100;  // scale back to 0-100
        }

        if (data.language !== undefined) {
            languageDropdown.value = data.language;
        }

        console.log('Settings restored:', data);

        // Update the volume percentage display after restoring settings
        updateVolumePercentage();
    });
}

// Volume slider change event
const volumeSlider = document.getElementById("volumeSlider");
const volumePercentage = document.getElementById('volumePercentage');

// Function to update the volume percentage display
function updateVolumePercentage() {
    volumePercentage.textContent = volumeSlider.value + '%';
}

volumeSlider.addEventListener("input", () => {
    const volume = volumeSlider.value / 100;
    chrome.runtime.sendMessage({ action: "updateVolume", volume: volume });
    saveSettings(volume, languageDropdown.value);

    // Update the volume percentage display when the slider changes
    updateVolumePercentage();
});

// Language dropdown change event
const languageDropdown = document.getElementById("languageDropdown");
languageDropdown.addEventListener("change", () => {
    const selectedLanguage = languageDropdown.value;
    chrome.runtime.sendMessage({ action: "updateLanguage", language: selectedLanguage });
    saveSettings(volumeSlider.value / 100, selectedLanguage);
    console.log(`Selected language: ${selectedLanguage}`);
});

// When the popup loads, restore the settings from storage
document.addEventListener("DOMContentLoaded", () => {
    restoreSettings();

    // Initialize the volume percentage display
    updateVolumePercentage();
});
