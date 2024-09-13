# 🎙️ Speechfire 🔥

**An offline multilingual speech-to-text extension for Firefox**

## At a Glance

- 🦊 Firefox extension icon:
  - <img src="extension/icon/icon-red.png" alt="Red Icon" width="16" height="16"> Recording in progress
  - <img src="extension/icon/icon.png" alt="White Icon" width="16" height="16"> Not recording
- System tray icon:

  - <img src="extension/icon/icon-green.png" alt="Green Icon" width="16" height="16"> Server is running
  - <img src="extension/icon/icon.png" alt="White Icon" width="16" height="16"> Server is not running

`ctrl+alt+s` to start/stop recording for transcription.

## Installation 💻

### 1. Create a virtual environment:

```bash
# venv
python -m venv speechfire

# or conda
conda create -n speechfire
```

### 2. Activate the virtual environment:

```bash
# venv
## Windows:
speechfire\Scripts\activate

## macOS/Linux:
source speechfire/bin/activate

# or conda
conda activate speechfire
```

### 3. Install python packages

```bash
pip install -r requirements.txt
# or for specific versions that are known to work:
pip install -r requirements-lock.txt
```

### 4. Install Extension in Firefox

Open extension.xpi in Firefox and it will install the extension for you.

## Usage 📝

### 1. Start the server (don't forget to activate the environment first)

#### Directly

```bash
python app.py
```

#### By creating a system tray icon

This has only been tested on Windows and Pop_OS! (Ubuntu), but should work on any Linux system that supports the `appindicator3` library. You also need to install the following dependencies:

- **Linux:** `sudo apt install python3-gi python3-gi-cairo gir1.2-gtk-3.0 gir1.2-appindicator3-0.1 && pip install PyGObject`

```bash
python system-tray/start_tray_linux.py
# or
python system-tray/start_tray_windows.py
```

Locate the tray icon in your system tray, right click it and select "Start Server".

### 2. Record audio

- Place your cursor on a text field in Firefox.
- Press `ctrl+alt+s` to start recording.
- Press `ctrl+alt+s` to stop recording.
- The transcription will be displayed in the focused text field.

### 3. Stop the server when you're done

#### Directly

```bash
ctrl+c
```

#### By stopping the system tray icon

Right click the system tray icon and select "Stop Server". To stop the process, right click the icon and select "Exit".
