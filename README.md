## 🚀 Web Extension README

This web extension is a JavaScript-based tool that can be installed on your browser to enhance your browsing experience. The extension is built using manifest v2 and currently supports the following browsers: Mozilla Firefox, Google Chrome, and Microsoft Edge.

## Installation Instructions

### Mozilla Firefox 🔥

1. Download the extension package.
2. Open Mozilla Firefox and navigate to about:debugging.
3. Click on the "This Firefox" button in the upper right corner of the screen.
4. Select "Load Temporary Add-on..." from the dropdown menu.
5. Navigate to the folder where you downloaded the extension package and select the manifest.json file.
6. You should now see the extension added to the list of installed extensions.

### Google Chrome 🌐

1. Download the extension package.
2. Open Google Chrome and navigate to chrome://extensions.
3. Enable Developer Mode by toggling the switch in the upper right corner of the screen.
4. Click on the "Load unpacked" button in the upper left corner of the screen.
5. Navigate to the folder where you downloaded the extension package and select it.
6. You should now see the extension added to the list of installed extensions.

### Microsoft Edge 🌊

1. Download the extension package.
2. Open Microsoft Edge and navigate to edge://extensions/.
3. Enable Developer Mode by toggling the switch in the lower left corner of the screen.
4. Click on the "Load unpacked" button in the lower left corner of the screen.
5. Navigate to the folder where you downloaded the extension package and select it.
6. You should now see the extension added to the list of installed extensions.

## Usage Instructions 📖

Once the extension is installed, you can start using it immediately. Simply click on the extension icon in your browser toolbar to access its features. The specific
functionality of the extension will depend on its purpose, so please refer to its documentation for more information.

## Contributing 🤝

Contributions are always welcome! If you would like to contribute to the development of this web extension, please follow these steps:

1. Fork the repository to your own GitHub account.
2. Clone the forked repository to your local machine.
3. Make the changes you want in your local copy of the repository.
4. Test your changes to make sure they work as expected.
5. Submit a pull request to the original repository and explain the changes you made.

I would recommend `web-ext` for development in Firefox, it significantly decrease development times. Devs can install it using `npm install --global web-ext`.

## Development

1. Make sure you use `yarn` and not `npm` while installing the packages
2. Webpack is configured for the project
3. Do not edit the manifest.json, webpack.config.js files
4. Clone the repo
5. Run `yarn` in the terminal to install the required dependencies
6. Run `yarn dev` to test the extension. A new firefox window will open with the extension loaded.

## License:

This project is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0).

Under this license, you are free to:

- Share: copy and redistribute the material in any medium or format
- Adapt: remix, transform, and build upon the material

Under the following terms:

- Attribution: You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way
  that suggests the licensor endorses you or your use.
- NonCommercial: You may not use the material for commercial purposes.
- ShareAlike: If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

For more details, please refer to the full license text at https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.

## Resources 🔍

- [Google Chrome Developer Documentation](https://developer.chrome.com/docs/extensions/)
- [Mozilla Firefox Extension Workshop](https://extensionworkshop.com/)
- [Microsoft Edge Extension Documentation](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/)
- [Mozilla Extension Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Microsoft Edge Getting Started](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/)
- [Google Forms API](https://developers.google.com/forms/api/guides)