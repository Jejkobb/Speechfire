from infi.systray import SysTrayIcon
from PIL import Image
import os
from tray_helper import start_server, stop_server, exit_app, is_server_running

class TrayIcon:
    def __init__(self):
        self.menu_options = (
            ("Start Server", None, self.toggle_server),
        )
        self.systray = SysTrayIcon(self.get_icon_path(False), "Speech-to-Fire", self.menu_options, on_quit=self.exit_app)
        self.systray.start()

    def get_icon_path(self, is_active):
        icon_name = "icon-green.png" if is_active else "icon.png"
        icon_path = os.path.abspath(f"./whisper-extension/{icon_name}")
        ico_path = os.path.abspath(f"./whisper-extension/{icon_name.replace('.png', '.ico')}")
        
        # Convert PNG to ICO for Windows compatibility
        img = Image.open(icon_path)
        img.save(ico_path, format="ICO", sizes=[(32, 32)])
        return ico_path

    def toggle_server(self, systray):
        if is_server_running():
            stop_server()
            self.update_icon_and_menu(False)
        else:
            start_server()
            self.update_icon_and_menu(True)

    def update_icon_and_menu(self, is_active):
        new_icon = self.get_icon_path(is_active)
        new_menu_options = (
            ("Stop Server" if is_active else "Start Server", None, self.toggle_server),
        )
        self.systray.update(hover_text="Speech-to-Fire", icon=new_icon, menu_options=new_menu_options)

    def exit_app(self, systray):
        exit_app()

def main():
    TrayIcon()

if __name__ == "__main__":
    main()