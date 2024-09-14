# 🔥 Speechfire

**Offline multilingual speech-to-text Firefox extension**

## Overview

Speechfire is a Firefox extension that provides offline speech-to-text functionality. It uses a local server for processing and supports multiple languages.

### Key Features

- 🦊 Firefox extension for easy access
- 🖥️ Local server for offline processing
- 🌐 Multilingual support
- ⌨️ Hotkey (`ctrl+alt+s`) to start/stop recording

## Installation

1. **Set up Python environment**

   ```bash
   python -m venv speechfire
   source speechfire/bin/activate  # On Windows: speechfire\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Install Firefox Extension**
   - Open `extension.xpi` in Firefox

## Usage

1. **Start the server**

   ```bash
   python server.py
   ```

   Or use the system tray icon:

   ```bash
   # On Windows:
   python system-tray/start_tray_windows.py
   # On Linux:
   python system-tray/start_tray_linux.py
   ```

   After launching the system tray application:

   1. Right-click on the tray icon
   2. Select "Start Server" from the menu

2. **Use the extension**

   - Focus on a text field in Firefox
   - Press `ctrl+alt+s` to start/stop recording
   - Transcription will appear in the focused field

3. **Stop the server**
   - Press `ctrl+c` in the terminal
   - Or use the system tray icon menu

## Icon Guide

- Firefox Extension:
  - <img src="extension/icon/icon-red.png" alt="Red Icon" width="16" height="16"> Recording
  - <img src="extension/icon/icon.png" alt="White Icon" width="16" height="16"> Not recording
- System Tray:
  - <img src="extension/icon/icon-green.png" alt="Green Icon" width="16" height="16"> Server running
  - <img src="extension/icon/icon.png" alt="White Icon" width="16" height="16"> Server not running

## Additional Notes

- For Linux system tray support:
  ```bash
  sudo apt install python3-gi python3-gi-cairo gir1.2-gtk-3.0 gir1.2-appindicator3-0.1
  pip install PyGObject
  ```
