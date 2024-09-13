class SpeechfireSettings {
  constructor() {
    this.volumeSlider = document.getElementById("volumeSlider");
    this.volumePercentage = document.getElementById("volumePercentage");
    this.languageDropdown = document.getElementById("languageDropdown");

    this.initEventListeners();
    this.restoreSettings();
  }

  initEventListeners() {
    this.volumeSlider.addEventListener("input", () => this.handleVolumeChange());
    this.languageDropdown.addEventListener("change", () => this.handleLanguageChange());
    document.addEventListener("DOMContentLoaded", () => this.updateVolumePercentage());
  }

  handleVolumeChange() {
    const volume = this.volumeSlider.value / 100;
    this.updateVolumePercentage();
    this.saveSettings();
    this.sendMessageToBackground({ action: "updateVolume", volume });
  }

  handleLanguageChange() {
    const selectedLanguage = this.languageDropdown.value;
    this.saveSettings();
    this.sendMessageToBackground({ action: "updateLanguage", language: selectedLanguage });
  }

  updateVolumePercentage() {
    this.volumePercentage.textContent = `${this.volumeSlider.value}%`;
  }

  saveSettings() {
    const settings = {
      volume: this.volumeSlider.value / 100,
      language: this.languageDropdown.value,
    };

    chrome.storage.local.set(settings, () => {
      console.log("Settings saved:", settings);
    });
  }

  restoreSettings() {
    chrome.storage.local.get(["volume", "language"], (data) => {
      if (data.volume !== undefined) {
        this.volumeSlider.value = data.volume * 100;
      }

      if (data.language !== undefined) {
        this.languageDropdown.value = data.language;
      }

      this.updateVolumePercentage();
      console.log("Settings restored:", data);
    });
  }

  sendMessageToBackground(message) {
    chrome.runtime.sendMessage(message);
  }
}

new SpeechfireSettings();
