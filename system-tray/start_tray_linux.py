import gi
gi.require_version('Gtk', '3.0')
gi.require_version('AppIndicator3', '0.1')
from gi.repository import Gtk, AppIndicator3, GLib
import os
from tray_helper import start_server, stop_server, exit_app, is_server_running

# Sets the application name for the tray icon
GLib.set_application_name("Speech-to-Fire")

class TrayIcon:
    def __init__(self):
        icon_path = os.path.abspath("./extension/icon")
        self.indicator = AppIndicator3.Indicator.new(
            "speech-to-fire",
            self.get_icon_name(False),
            AppIndicator3.IndicatorCategory.APPLICATION_STATUS)
        self.indicator.set_icon_theme_path(icon_path)
        self.indicator.set_status(AppIndicator3.IndicatorStatus.ACTIVE)
        self.menu = self.build_menu()
        self.indicator.set_menu(self.menu)
        self.indicator.set_icon_full(self.get_icon_name(False), "Speech-to-Fire")

    def get_icon_name(self, is_active):
        return "icon-green" if is_active else "icon"

    def build_menu(self):
        menu = Gtk.Menu()
        self.item_toggle = Gtk.MenuItem(label="Start Server")
        self.item_toggle.connect('activate', self.toggle_server)
        menu.append(self.item_toggle)

        item_exit = Gtk.MenuItem(label="Exit")
        item_exit.connect('activate', self.exit_app)
        menu.append(item_exit)

        menu.show_all()
        return menu

    def toggle_server(self, widget):
        if is_server_running():
            stop_server()
            self.item_toggle.set_label("Start Server")
            self.indicator.set_icon_full(self.get_icon_name(False), "Speech-to-Fire (Inactive)")
        else:
            start_server()
            self.item_toggle.set_label("Stop Server")
            self.indicator.set_icon_full(self.get_icon_name(True), "Speech-to-Fire (Active)")

    def exit_app(self, widget):
        exit_app()
        Gtk.main_quit()

def main():
    TrayIcon()
    Gtk.main()

if __name__ == "__main__":
    main()