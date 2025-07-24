class SpeechfireSettings {
  constructor() {
    this.volumeSlider = document.getElementById("volumeSlider");
    this.volumePercentage = document.getElementById("volumePercentage");
    this.languageDropdown = document.getElementById("languageDropdown");
    this.serverUrlInput = document.getElementById("serverUrl");

    this.initEventListeners();
    this.restoreSettings();
  }

  initEventListeners() {
    this.volumeSlider.addEventListener("input", () => this.handleVolumeChange());
    this.languageDropdown.addEventListener("change", () => this.handleLanguageChange());
    this.serverUrlInput.addEventListener("input", () => this.handleServerUrlChange());
    document.addEventListener("DOMContentLoaded", () => this.updateVolumePercentage());
    document.addEventListener("DOMContentLoaded", () => this.updateSliderBackground()); // Update on page load
  }

  handleVolumeChange() {
    const volume = this.volumeSlider.value / 100;
    this.updateVolumePercentage();
    this.updateSliderBackground();
    this.saveSettings();
    this.sendMessageToBackground({ action: "updateVolume", volume });
  }

  handleLanguageChange() {
    const selectedLanguage = this.languageDropdown.value;
    this.saveSettings();
    this.sendMessageToBackground({ action: "updateLanguage", language: selectedLanguage });
  }

  handleServerUrlChange() {
    this.saveSettings();
    this.sendMessageToBackground({ action: "updateServerUrl", serverUrl: this.serverUrlInput.value });
  }

  updateVolumePercentage() {
    this.volumePercentage.textContent = `${this.volumeSlider.value}%`;
  }

  updateSliderBackground() {
    const value = this.volumeSlider.value;
    const percentage = (value / 100) * 100;
    this.volumeSlider.style.background = `linear-gradient(to right, var(--accent) ${percentage}%, var(--slider-bg) ${percentage}%)`;
  }

  saveSettings() {
    const settings = {
      volume: this.volumeSlider.value / 100,
      language: this.languageDropdown.value,
      serverUrl: this.serverUrlInput.value || "http://127.0.0.1:5000",
    };

    chrome.storage.local.set(settings, () => {
      console.log("Settings saved:", settings);
    });
  }

  restoreSettings() {
    chrome.storage.local.get(["volume", "language", "serverUrl"], (data) => {
      if (data.volume !== undefined) {
        this.volumeSlider.value = data.volume * 100;
      }

      if (data.language !== undefined) {
        this.languageDropdown.value = data.language;
      }

      if (data.serverUrl !== undefined) {
        this.serverUrlInput.value = data.serverUrl;
      } else {
        this.serverUrlInput.value = "http://127.0.0.1:5000";
      }

      this.updateVolumePercentage();
      this.updateSliderBackground(); // Update background when restoring settings
      console.log("Settings restored:", data);
    });
  }

  sendMessageToBackground(message) {
    chrome.runtime.sendMessage(message);
  }
}

new SpeechfireSettings();
