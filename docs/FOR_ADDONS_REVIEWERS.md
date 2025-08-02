# For Addons/Extension Reviewers

> [!WARNING]
> docFiller requires API keys, so get one from ChatGPT/Gemini/Claude/Mistral or use local models like Ollama, ChromeAI.

## Setting Up docFiller

1. Clone the repository and navigate to the project folder:

   ```bash
   git clone https://github.com/rootCircle/docFiller.git
   cd docFiller
   ```

2. Install dependencies:

   ```bash
   bun i
   ```

## Running docFiller on Different Browsers

- **For Firefox:**

  ```bash
  bun dev:firefox
  ```

- **For Chromium-based browsers:**

  ```bash
  bun dev:chromium
  ```

## Packaging the Extension

To package the extension, run:

```bash
bun package:firefox
```

The packaged extension will be saved in the `web-ext-artifacts` directory.

## Modifying for Chromium Browsers

For Chromium-based browsers, follow these steps:

```bash
bun package:chromium
```

## Using docFiller

1. Open any Google Form (e.g., [this dummy form](https://docs.google.com/forms/d/e/1FAIpQLSd-Qz6EaprQiTza30v5tJezdt-xUfV2ALzeYt3EClXWN3mxXA/viewform?usp=sf_link)).
2. Open the popup and enter your API keys as instructed.
3. Reload the page.

You should see the form automatically filled by docFiller.
