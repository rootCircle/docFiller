<p align="center">
  <img src="./public/assets/icons/icon-form-96.png" alt="docFiller logo">
<h1 align="center">🚀 docFiller</h1>
  <p align="center">
    <img src="https://ForTheBadge.com/images/badges/built-with-love.svg">
    <br><br>
    <a align="center" href="https://discord.gg/Sa4JPe4FWT">
      <img src="https://img.shields.io/discord/1129752670287184022?style=for-the-badge&logo=discord&logoColor=D9E0EE"></a>&nbsp;
    <img src="https://img.shields.io/github/actions/workflow/status/rootCircle/docFiller/lint-check.yml?style=for-the-badge&logo=github&logoColor=D9E0EE&labelColor=292324)"/>&nbsp;
    <img src="https://img.shields.io/github/package-json/v/rootCircle/docFiller/dev?label=version&style=for-the-badge&logo=github&logoColor=D9E0EE&labelColor=292324)"/>
    <br><br>
    <img src="https://img.shields.io/github/stars/rootcircle/docFiller?style=for-the-badge&logo=andela&color=CAC992&logoColor=D9E0EE&labelColor=292324)"/>&nbsp;
    <img src="https://img.shields.io/github/license/rootcircle/docFiller?style=for-the-badge&logo=libreofficewriter&color=FFB686&logoColor=D9E0EE&labelColor=292324)"/>&nbsp;
    <img src="https://img.shields.io/github/issues/rootcircle/docFiller?style=for-the-badge&logo=git&color=CCE8E9&logoColor=D9E0EE&labelColor=292324)"/>&nbsp;
    <img src="https://img.shields.io/badge/PR-Welcome-green?style=for-the-badge&color=CCE8E9&logoColor=D9E0EE&labelColor=292324)"/>
  </p>
<p align="center">Automated <em>Google Forms</em> filling web extension using GenAI. Making boring form filling easy!</p>
</p>

<div align="center">

|     Browser      |                                                                          Firefox & Firefox Android                                                                          |                                                                                                Chrome                                                                                                 |                                                                                                                                             Edge                                                                                                                                              |
| :--------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| **Installation** | [![Firefox](https://user-images.githubusercontent.com/585534/107280546-7b9b2a00-6a26-11eb-8f9f-f95932f4bfec.png)](https://addons.mozilla.org/en-US/firefox/addon/docfiller) | [![Chrome](https://user-images.githubusercontent.com/585534/107280622-91a8ea80-6a26-11eb-8d07-77c548b28665.png)](https://chromewebstore.google.com/detail/docfiller/goibiampjlgcdjdfakjepniopldpijcd) |                                         [![Edge](https://user-images.githubusercontent.com/585534/107280673-a5ece780-6a26-11eb-9cc7-9fa9f9f81180.png)](https://microsoftedge.microsoft.com/addons/detail/docfiller/hkcldpodmllikgghmplcbbocikadoljl)                                          |
|   **Version**    |          ![Firefox version](https://img.shields.io/amo/v/docfiller?label=version&logo=firefox&style=for-the-badge&color=CAC992logoColor=D9E0EE&labelColor=292324)           |   ![Chrome version](https://img.shields.io/chrome-web-store/v/goibiampjlgcdjdfakjepniopldpijcd?label=version&logo=google-chrome&style=for-the-badge&color=CAC992logoColor=D9E0EE&labelColor=292324)   |  ![Edge version](https://img.shields.io/badge/dynamic/json?style=for-the-badge&color=CAC992logoColor=D9E0EE&labelColor=292324&label=version&prefix=v&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fhkcldpodmllikgghmplcbbocikadoljl)  |
|  **Downloads**   |              ![Firefox downloads](https://img.shields.io/amo/users/docfiller?logo=firefox&style=for-the-badge&color=CAC992logoColor=D9E0EE&labelColor=292324)               |       ![Chrome downloads](https://img.shields.io/chrome-web-store/users/goibiampjlgcdjdfakjepniopldpijcd?logo=google-chrome&style=for-the-badge&color=CAC992logoColor=D9E0EE&labelColor=292324)       | ![Edge downloads](https://img.shields.io/badge/dynamic/json?style=for-the-badge&color=CAC992logoColor=D9E0EE&labelColor=292324&label=users&query=%24.activeInstallCount&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fhkcldpodmllikgghmplcbbocikadoljl) |
|  **Maintainer**  |                                                                [@rootCircle](https://github.com/rootCircle)                                                                 |                                                                             [@Gyan172004](https://github.com/Gyan172004)                                                                              |                                                                                                                         [@rootCircle](https://github.com/rootCircle)                                                                                                                          |

</div>
<br>

<video src="https://github.com/user-attachments/assets/55691cdf-6065-42bd-81fc-008be7422071" controls></video>

## Project Overview

### Features

- **Automated Google Forms Filling**: Fill Google forms automatically with predefined data using AI.
- **Cross-Browser Compatibility**: Supports major browsers including Mozilla Firefox, Google Chrome, and Microsoft Edge.
- **Customizable**: Easily configurable to adapt to different use cases and requirements.

### How It Works

The Web Extension simplifies the process of filling Google forms by automating repetitive tasks. Users can configure the extension with predefined data and settings, allowing them to quickly populate Google forms without manual input.

### Use Cases

- **Form Filling**: Ideal for individuals or organizations that frequently fill out standardized forms or templates in Google Forms.
- **Data Entry Automation**: Streamline data entry processes by automating the input of common information into Google Forms.

## Installation

For detailed installation instructions, please refer to the [INSTALL.md](docs/INSTALL.md) file.

For development setup, see instructions in [CONTRIBUTING.md](./docs/CONTRIBUTING.md#development) file.

## Usage

Once the extension is installed, you can start using it immediately. Simply click on the extension icon in your browser toolbar to access its features. For usage instructions and additional details, please refer to the [documentation](docs).

> [!NOTE]
> When running Ollama, make sure `qwen3:4b` is installed and run ollama using `OLLAMA_ORIGINS=* HOME=/var/lib/ollama OLLAMA_MODELS=/var/lib/ollama ollama serve` or `set OLLAMA_ORIGINS=* && ollama serve` in Linux & Windows CMD respectively!

## Contributing

We welcome contributions! If you would like to contribute to the development of this web extension, please follow the guidelines outlined in the [CONTRIBUTING.md](docs/CONTRIBUTING.md) file.

## Meta

| **Category**     | **Description**                                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Architecture** | For our project architecture, please refer to the [ARCHITECTURE.md](docs/ARCHITECTURE.md) file.                                                 |
| **License**      | This project is licensed under the [GNU GPL 3.0](LICENSE).                                                                                      |
| **Security**     | For information about our security policy, please refer to the [SECURITY.md](docs/SECURITY.md) file.                                            |
| **Support**      | For support, bug reports, and feature requests, please refer to the [SUPPORT.md](docs/SUPPORT.md) file.                                         |
| **Governance**   | To understand the governance model and decision-making processes for our project, please refer to the [GOVERNANCE.md](docs/GOVERNANCE.md) file. |

## Resources 🔍

- [Google Chrome Developer Documentation](https://developer.chrome.com/docs/extensions/)
- [Mozilla Firefox Extension Workshop](https://extensionworkshop.com/)
- [Microsoft Edge Extension Documentation](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/)
- [Mozilla Extension Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Microsoft Edge Getting Started](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/)
- [Google Forms API](https://developers.google.com/forms/api/guides)

## ✨ Contributors

<a href="https://github.com/rootCircle/docFiller/graphs/contributors">
  <img alt="Grid of profile icons of the contributors" src="https://contrib.rocks/image?repo=rootCircle/docFiller" />
</a>
<!--  https://contrib.rocks -->
