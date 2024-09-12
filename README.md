# 🎙️ Speech-to-Fire 🔥

**An offline speech-to-text extension for Firefox**

## Installation 💻

### 1. Create a virtual environment:
```bash
# venv
python -m venv whisper-env

# or conda
conda create -n whisper-env
```

### 2. Activate the virtual environment:

```bash
# venv
## Windows:
whisper-env\Scripts\activate

## macOS/Linux:
source whisper-env/bin/activate

# or conda
conda activate whisper-env
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

```bash
python tray_app.py
```
Locate the tray icon in your system tray, right click it and select "Start Server"

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

Right click the system tray icon and select "Stop Server".
