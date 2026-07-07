# Installation Instructions

This document provides instructions for installing the Web Extension on various browsers. If you're developer look under [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup.

## Mozilla Firefox 🔥

1. **Download the extension package**: Clone the project and run `bun run build:firefox`. The package will be created in `build/` directory.
2. **Open Mozilla Firefox and navigate to about:debugging**: Enter `about:debugging` in the address bar of Firefox and press Enter.
3. **Load the extension**: Click on the "This Firefox" button in the upper right corner of the screen, then select "Load Temporary Add-on..." from the dropdown menu.
4. **Select the extension package**: Navigate to the folder where you downloaded the extension package and select the generated `manifest.json` file.
5. **Confirm installation**: You should now see the extension added to the list of installed extensions.

## Google Chrome 🌐

1. **Download the extension package**: Clone the project and run `bun run build:chromium`. The package will be created in `build/` directory.
2. **Open Google Chrome and navigate to chrome://extensions**: Enter `chrome://extensions` in the address bar of Chrome and press Enter.
3. **Enable Developer Mode**: Toggle the switch in the upper right corner of the screen to enable Developer Mode.
4. **Load the extension**: Click on the "Load unpacked" button in the upper left corner of the screen.
5. **Select the extension package**: Navigate to the folder where you downloaded the extension package and select it.
6. **Confirm installation**: You should now see the extension added to the list of installed extensions.

## Microsoft Edge 🌊

1. **Download the extension package**: Clone the project and run `bun run build:chromium`. The package will be created in `build/` directory.
2. **Open Microsoft Edge and navigate to edge://extensions/**: Enter `edge://extensions/` in the address bar of Edge and press Enter.
3. **Enable Developer Mode**: Toggle the switch in the lower left corner of the screen to enable Developer Mode.
4. **Load the extension**: Click on the "Load unpacked" button in the lower left corner of the screen.
5. **Select the extension package**: Navigate to the folder where you downloaded the extension package and select it.
6. **Confirm installation**: You should now see the extension added to the list of installed extensions.

## Orion Browser (iOS / macOS)

1. **Download the extension package**: Download the Firefox release artifact (`docfiller-...-firefox.zip`) from the [GitHub Releases](https://github.com/rootCircle/docFiller/releases) page. Alternatively, clone the project and run `bun run build:firefox` to build it locally.
2. **Open Orion Browser**: On your iOS or macOS device, open the Orion Browser.
3. **Install from file**: Go to Settings -> Extensions -> Install from File (or tap the `+` icon to install from file).
4. **Select the Firefox artifact**: Choose the `docfiller-...-firefox.zip` file you downloaded.
5. **Confirm installation**: The extension should now be installed and ready to use in Orion!

## Usage Instructions

Once the extension is installed, you can start using it immediately. Open any google form link in the browser and check the magic of docFiller auto-filling all forms by default. The specific functionality of the extension will depend on its purpose, so please refer to its documentation for more information.
