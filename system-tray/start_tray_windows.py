import pystray
from PIL import Image
import os
from tray_helper import start_server, stop_server, exit_app, is_server_running
import sys
import logging

# Set up logging
logging.basicConfig(filename='tray_app.log', level=logging.DEBUG, 
                    format='%(asctime)s - %(levelname)s - %(message)s')

# Change the working directory to the script's directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Add the script's directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

logging.info("Tray app started")

def on_clicked(icon, item):
    if str(item) == "Start Server" or str(item) == "Stop Server":
        if is_server_running():
            stop_server()
        else:
            start_server()
        update_icon_and_menu(icon)
    elif str(item) == "Exit":
        stop_server()
        icon.stop()

def create_menu():
    return pystray.Menu(
        pystray.MenuItem("Start Server", on_clicked),
        pystray.MenuItem("Exit", on_clicked)
    )

def update_icon_and_menu(icon):
    is_running = is_server_running()
    icon.menu = pystray.Menu(
        pystray.MenuItem("Stop Server" if is_running else "Start Server", on_clicked),
        pystray.MenuItem("Exit", on_clicked)
    )
    icon_name = "icon-green.png" if is_running else "icon.png"
    icon_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'extension-firefox/icon', icon_name)
    icon.icon = Image.open(icon_path)
    icon.update_menu()

try:
    icon_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'extension-firefox/icon', 'icon.png')
    image = Image.open(icon_path)
    icon = pystray.Icon("name", image, "Speechfire", menu=create_menu())
    
    # Update icon and menu initially
    update_icon_and_menu(icon)
    
    icon.run()
except Exception as e:
    logging.error(f"An error occurred: {str(e)}")