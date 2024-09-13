import subprocess
import os
import signal
import logging
import sys

# Set up logging
logging.basicConfig(filename='tray_app.log', level=logging.DEBUG, 
                    format='%(asctime)s - %(levelname)s - %(message)s')

# Get the absolute path to the project root directory
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Change the working directory to the project root
os.chdir(project_root)

# Add the project root to the Python path
sys.path.append(project_root)

flask_process = None

def start_server():
    global flask_process
    if flask_process is None:
        logging.info("Starting Flask server")
        venv_python = sys.executable
        app_path = os.path.join(project_root, 'app.py')
        flask_process = subprocess.Popen([venv_python, app_path])

def stop_server():
    global flask_process
    if flask_process:
        logging.info("Stopping Flask server")
        os.kill(flask_process.pid, signal.SIGTERM)
        flask_process = None

def exit_app():
    logging.info("Exiting tray app")
    stop_server()

def is_server_running():
    global flask_process
    return flask_process is not None and flask_process.poll() is None