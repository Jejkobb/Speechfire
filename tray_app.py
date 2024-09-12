import pystray
from PIL import Image
import subprocess
import os
import signal
import logging
import sys

# Set up logging
logging.basicConfig(filename='tray_app.log', level=logging.DEBUG, 
                    format='%(asctime)s - %(levelname)s - %(message)s')

# Change the working directory to the script's directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Add the script's directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

logging.info("Tray app started")

flask_process = None

def start_server():
    global flask_process
    if flask_process is None:
        logging.info("Starting Flask server")
        # Get the path to the Python interpreter in the virtual environment
        venv_python = sys.executable
        # Run the Flask server using the virtual environment's Python
        flask_process = subprocess.Popen([venv_python, 'app.py'], creationflags=subprocess.CREATE_NO_WINDOW)

def stop_server():
    global flask_process
    if flask_process:
        logging.info("Stopping Flask server")
        os.kill(flask_process.pid, signal.SIGTERM)
        flask_process = None

def on_clicked(icon, item):
    if str(item) == "Start Server":
        start_server()
    elif str(item) == "Stop Server":
        stop_server()
    elif str(item) == "Exit":
        logging.info("Exiting tray app")
        stop_server()
        icon.stop()

try:
    image = Image.open("./whisper-extension/icon.png")
    menu = pystray.Menu(
        pystray.MenuItem("Start Server", on_clicked),
        pystray.MenuItem("Stop Server", on_clicked),
        pystray.MenuItem("Exit", on_clicked)
    )

    icon = pystray.Icon("name", image, "Speech-to-Fire", menu)
    logging.info("Starting icon")
    icon.run()
except Exception as e:
    logging.exception("An error occurred: %s", str(e))