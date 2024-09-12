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

### 1. Start the server

```bash
run_server.bat
```

### 2. Record audio

- Press `ctrl+alt+s` to start recording.
- Press `ctrl+alt+s` to stop recording.
- The transcription will be displayed in the focused text field.