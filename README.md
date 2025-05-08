# Converse

Converse is a desktop application that allows you to interact with various AI language models through a clean, intuitive interface. It's designed to make AI assistance accessible right from your desktop without the need to use web interfaces.

![Main window](./app/screenshots/screenshot_v0.1.0_main.png)

## Features

- **Multiple AI Models**: Connect to OpenAI, Anthropic, Mistral, and OpenRouter with your API keys
- **Chat History**: Keep track of all your conversations and easily reference them later
- **Task Templates**: Create custom templates for your most common AI interactions
- **Dark Mode**: Easy on the eyes with automatic dark mode support
- **Markdown Support**: Rich text formatting for both input and output
- **Code Highlighting**: Syntax highlighting for programming languages

## Supported AI Models

- **OpenAI** (GPT-3.5, GPT-4)
- **Mistral AI**
- **Anthropic** (Claude)
- **Open Router**

## Screenshots

<div align="center">
  <img src="./app/screenshots/screenshot_v0.1.0_main.png" alt="Main window" width="80%" />
  <p><em>Main interface with task templates</em></p>
  
  <img src="./app/screenshots/screenshot_v0.1.0_chat_mode.png" alt="Chat mode" width="80%" />
  <p><em>Chat mode interface</em></p>
  
  <img src="./app/screenshots/screenshot_v0.1.0_craft_mail_darkmode.png" alt="Text mode in dark mode" width="80%" />
  <p><em>Text mode with dark theme</em></p>
</div>

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/louisdecharson/converse.git
   cd converse
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Rebuild sqlite3 for Electron:
   ```bash
   ./node_modules/.bin/electron-rebuild -f -w sqlite3
   ```

### Running the App Locally

Start the application in development mode:
```bash
npm start
```

### API Keys

To use Converse, you'll need to provide your own API keys for the AI services you want to use. These can be configured in the app's settings menu.

## Building the App

### Compile CSS

Generate the Tailwind CSS file:
```bash
npx @tailwindcss/cli -i ./src/renderer/css/index.css -o ./public/output.css
```

### Build for Distribution

Create a distributable package for your platform:
```bash
npm run app:dist
```

## Privacy

Converse stores your conversation history locally on your computer. Your API keys and conversations never leave your device except when sent directly to the AI provider's API. We have no servers and collect no data.

## Technology Stack

- [Electron JS](http://electronjs.org/) - Cross-platform desktop app framework
- [Tailwind CSS](http://tailwindcss.com) - Utility-first CSS framework
- SQLite - Local database storage

## Development

Contributions are welcome! Feel free to submit issues or pull requests.

### Project Structure

- `app/src/main` - Main process code
- `app/public` - Renderer process code and assets
- `app/src/renderer` - Source files for the renderer

## License

This project is open source.

## FAQ

### Do I need to pay for using Converse?

Converse itself is free and open-source. However, you'll need to provide your own API keys for the AI services you want to use, and those services typically charge based on usage.

### How do I get started?

Download the application, install it, and launch it. You'll be prompted to enter API keys for the services you want to use. Once set up, you can start creating tasks and chatting with AI models right away.
