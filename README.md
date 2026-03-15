<div align="center">

# 🎨 PixelCraft

**A powerful desktop pixel art converter and editor**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)](https://www.rust-lang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2.1-24C8DB.svg)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)

[English](#) | [中文](README-zh.md)

![PixelCraft Screenshot](docs/screenshots/screenshot-main.png)

**Convert images to pixel art and edit them with professional tools**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Development](#-development) • [Contributing](#-contributing)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Usage](#-usage)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Development](#-development)
- [Project Structure](#-project-structure)
- [Technology Stack](#-technology-stack)
- [Building](#-building)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

## 🎯 About

PixelCraft is a modern, cross-platform desktop application that transforms regular images into pixel art and provides a comprehensive editing suite. Built with Tauri 2, React, and Rust, it combines the power of native performance with a beautiful, responsive user interface.

### Why PixelCraft?

- **🖼️ High-Quality Conversion**: Advanced algorithms for color quantization and dithering
- **🖌️ Full-Featured Editor**: Professional pixel art editing tools
- **💾 Project Management**: Save and load your work as `.pixproj` files
- **🌍 Cross-Platform**: Works on Windows, macOS, and Linux
- **⚡ Native Performance**: Built with Rust for fast image processing
- **🎨 Modern UI**: Clean, intuitive interface with dark/light themes

## ✨ Features

### Core Functionality

- **🖼️ Image to Pixel Art Conversion**
  - Support for JPG and PNG formats
  - Customizable resolution (width × height)
  - Color palette quantization (2-256 colors)
  - Floyd-Steinberg error diffusion dithering
  - Nearest-neighbor resizing algorithm

- **🎨 Advanced Pixel Editor**
  - **Brush Tool**: Paint pixels with customizable size
  - **Eraser Tool**: Remove pixels with precision
  - **Eyedropper Tool**: Pick colors from the canvas
  - **Paint Bucket Tool**: Fill areas with flood fill algorithm
  - **Selection Tool**: Select and manipulate pixel regions
  - **Mirror Drawing**: Horizontal and vertical mirror modes

- **💾 Project Management**
  - Save projects as `.pixproj` files
  - Load and restore previous work
  - Recent projects list
  - Unsaved changes indicator
  - File association support (double-click to open)

- **📤 Export Options**
  - Export as PNG (with transparency support)
  - Export as JPG (with quality control)
  - Custom export sizes
  - Preview before export

### User Experience

- **🌓 Theme Support**: Dark and light themes with system preference detection
- **⌨️ Customizable Shortcuts**: Fully customizable keyboard shortcuts
- **🌍 Internationalization**: English and Chinese (Simplified) support
- **📐 Window State Memory**: Automatically saves and restores window position and size
- **📝 Command Line Support**: Open files via command line arguments
- **💬 Toast Notifications**: User-friendly feedback system
- **📊 Status Bar**: Real-time information display

### Desktop Integration

- **📁 File Association**: Double-click `.pixproj` files to open
- **📝 Command Line**: Open files from terminal/command prompt
- **🪟 Window Management**: Remember window state across sessions

## 📸 Screenshots

### Main Interface
![Main Interface](docs/screenshots/screenshot-main.png)

### Editor View
![Editor View](docs/screenshots/screenshot-editor.png)

### Export Dialog
![Export Dialog](docs/screenshots/screenshot-export.png)

## 📦 Installation

### Windows

1. Download the latest release from [Releases](https://github.com/Huangjp0915/PixelCraft/releases)
2. Run the installer (`.msi` or `.exe`)
3. Follow the installation wizard
4. Launch PixelCraft from the Start menu

## 🚀 Usage

### Basic Workflow

1. **Import an Image**
   - Click the "Import Image" button
   - Or drag and drop an image file into the window
   - Supported formats: JPG, PNG

2. **Adjust Parameters**
   - **Resolution**: Set the target pixel art dimensions
   - **Pixel Size**: Control how large each pixel appears on canvas
   - **Palette Count**: Choose the number of colors (2-256)
   - **Dithering**: Enable/disable error diffusion dithering
   - **Background**: Choose transparent or solid color background

3. **Generate Pixel Art**
   - Click "Generate Pixel Art" button
   - Wait for processing to complete
   - The pixel art will appear in the editor

4. **Edit Your Art**
   - Use tools from the left toolbar:
     - **B** - Brush tool
     - **E** - Eraser tool
     - **I** - Eyedropper tool
     - **P** - Paint bucket tool
     - **S** - Selection tool
   - Select colors from the palette
   - Use zoom and pan to navigate

5. **Save Your Work**
   - **Save Project** (Ctrl+S): Save as `.pixproj` file
   - **Save As** (Ctrl+Shift+S): Save to a new location
   - **Export** (Ctrl+E): Export as PNG or JPG

### Advanced Features

#### Project Files
- Save your work as `.pixproj` files
- Includes source image path, transform settings, and pixel document
- Double-click `.pixproj` files to open in PixelCraft

#### Customizable Shortcuts
- Press **F1** to open the help dialog
- View all available shortcuts
- Customize shortcuts in Settings (coming soon)

#### Theme Switching
- Toggle between dark and light themes
- Theme preference is saved automatically

## ⌨️ Keyboard Shortcuts

| Action | Shortcut | Description |
|--------|----------|-------------|
| **File Operations** |
| New Project | `Ctrl+N` | Create a new project |
| Open Project | `Ctrl+O` | Open an existing project |
| Save Project | `Ctrl+S` | Save current project |
| Save As | `Ctrl+Shift+S` | Save project to new location |
| Export | `Ctrl+E` | Export as image |
| **Edit Operations** |
| Undo | `Ctrl+Z` | Undo last action |
| Redo | `Ctrl+Y` | Redo last action |
| Delete | `Delete` | Delete selected pixels |
| **Tools** |
| Brush | `B` | Switch to brush tool |
| Eraser | `E` | Switch to eraser tool |
| Eyedropper | `I` | Switch to eyedropper tool |
| Paint Bucket | `P` | Switch to paint bucket tool |
| Select | `S` | Switch to selection tool |
| **View** |
| Zoom In | `Ctrl+=` | Zoom in canvas |
| Zoom Out | `Ctrl+-` | Zoom out canvas |
| Reset Zoom | `Ctrl+0` | Reset zoom to 100% |
| Toggle Grid | `G` | Show/hide pixel grid |
| Pan Canvas | `Space + Drag` | Pan the canvas |
| **Help** |
| Help Dialog | `F1` | Open help dialog |

## 🛠️ Development

### Prerequisites

- **Node.js** 18+ and npm
- **Rust** 1.70+ ([rustup](https://rustup.rs/))
- **Tauri CLI**: `npm install -g @tauri-apps/cli@latest`

### Platform-Specific Requirements

#### Windows
- Microsoft Visual C++ Build Tools or Visual Studio 2019+
- Windows SDK

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Huangjp0915/PixelCraft.git
   cd PixelCraft
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run tauri dev
   ```

4. **Build for production**
   ```bash
   npm run tauri build
   ```

### Development Scripts

```bash
# Development
npm run dev          # Start Vite dev server
npm run tauri dev    # Start Tauri dev mode

# Building
npm run build        # Build frontend only
npm run tauri build  # Build complete application

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Project Structure

```
PixelCraft/
├── src/                    # Frontend source code
│   ├── app/               # Main app component
│   ├── components/        # React components
│   │   ├── about/         # About dialog
│   │   ├── common/        # Common UI components
│   │   ├── editor/        # Editor components
│   │   ├── export/        # Export dialog
│   │   ├── help/          # Help dialog
│   │   ├── import/        # Import components
│   │   ├── layout/        # Layout components
│   │   ├── palette/       # Palette editor
│   │   └── transform/     # Transform controls
│   ├── hooks/             # React hooks
│   ├── locales/           # Internationalization
│   ├── services/          # Service layer
│   ├── store/             # Zustand stores
│   ├── styles/            # Global styles
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── commands/      # Tauri commands
│   │   ├── errors/        # Error types
│   │   ├── image_core/    # Image processing
│   │   ├── models/        # Data models
│   │   └── main.rs        # Entry point
│   ├── icons/             # Application icons
│   ├── capabilities/      # Tauri capabilities
│   └── tauri.conf.json    # Tauri configuration
├── docs/                  # Documentation
├── scripts/               # Build scripts
└── package.json           # Node.js dependencies
```

## 🏗️ Technology Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.5** - Type safety
- **Vite 5.4** - Build tool and dev server
- **Konva 10.0** - 2D canvas library
- **React Konva 18.2** - React bindings for Konva
- **Zustand 5.0** - State management
- **React Router 6.26** - Routing (if needed)

### Backend
- **Rust 1.70+** - System programming
- **Tauri 2.1** - Desktop framework
- **image 0.25** - Image processing
- **color_quant 1.1** - Color quantization (NeuQuant)
- **serde 1.0** - Serialization

### Development Tools
- **ESLint** - Linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## 🔨 Building

### Build for All Platforms
```bash
npm run tauri build
```

### Build for Specific Platform

#### Windows
```bash
npm run tauri build -- --target x86_64-pc-windows-msvc
```

#### macOS
```bash
# Intel
npm run tauri build -- --target x86_64-apple-darwin

# Apple Silicon
npm run tauri build -- --target aarch64-apple-darwin
```

#### Linux
```bash
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

### Output Locations

- **Windows**: `src-tauri/target/release/bundle/msi/` or `nsis/`
- **macOS**: `src-tauri/target/release/bundle/macos/`
- **Linux**: `src-tauri/target/release/bundle/appimage/` or `deb/`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features (if applicable)
- Update documentation as needed
- Ensure all checks pass before submitting PR

### Reporting Issues

If you find a bug or have a feature request, please open an issue on [GitHub Issues](https://github.com/Huangjp0915/PixelCraft/issues).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tauri Team** - For the amazing desktop framework
- **React Team** - For the UI framework
- **Konva Team** - For the canvas library
- **Rust Community** - For excellent crates and tools
- All contributors and users who have supported this project

## 📞 Contact & Links

- **GitHub**: [@Huangjp0915](https://github.com/Huangjp0915)
- **Repository**: [PixelCraft](https://github.com/Huangjp0915/PixelCraft)
- **Issues**: [Report a Bug](https://github.com/Huangjp0915/PixelCraft/issues)

---

<div align="center">

**Made with ❤️ by PixelCraft Team**

[⭐ Star this repo](https://github.com/Huangjp0915/PixelCraft) if you find it helpful!

</div>
