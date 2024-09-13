import subprocess
import os
import signal
import logging
import sys
import psutil
import time

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
        app_path = os.path.join(project_root, 'server.py')
        flask_process = subprocess.Popen([venv_python, app_path])

def stop_server():
    global flask_process
    if flask_process:
        logging.info("Stopping Flask server")
        parent = psutil.Process(flask_process.pid)
        children = parent.children(recursive=True)
        
        for child in children:
            child.terminate()
        
        parent.terminate()
        
        gone, alive = psutil.wait_procs(children + [parent], timeout=5)
        
        for p in alive:
            p.kill()
        
        flask_process = None
        time.sleep(1)  # Give some time for ports to be released

def exit_app():
    logging.info("Exiting tray app")
    stop_server()

def is_server_running():
    global flask_process
    return flask_process is not None and flask_process.poll() is None