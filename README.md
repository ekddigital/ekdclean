# EKD Clean

<div align="center">

![EKD Clean Logo](./assets/logo.png)

**A Robust Cross-Platform System Optimization Tool**

[![Build Status](https://github.com/ekddigital/ekdclean/workflows/Build%20and%20Release/badge.svg)](https://github.com/ekddigital/ekdclean/actions)
[![Release](https://img.shields.io/github/v/release/ekddigital/ekdclean?color=blue)](https://github.com/ekddigital/ekdclean/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/ekddigital/ekdclean/total?color=success)](https://github.com/ekddigital/ekdclean/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue.svg)](https://github.com/ekddigital/ekdclean)

_Superior system optimization with stunning UI/UX • Built by EKD Digital_

[Download](#-download) • [Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📥 Download

<div align="center">

### Latest Release: v1.0.0

Get EKD Clean for your operating system:

[![Download for macOS](https://img.shields.io/badge/macOS-Download-blue?style=for-the-badge&logo=apple)](https://github.com/ekddigital/ekdclean/releases/download/v1.0.0/EKD-Clean-1.0.0-mac.dmg)
[![Download for Windows](https://img.shields.io/badge/Windows-Download-blue?style=for-the-badge&logo=windows)](https://github.com/ekddigital/ekdclean/releases/download/v1.0.0/EKD-Clean-1.0.0-win-x64-Setup.exe)
[![Download for Linux](https://img.shields.io/badge/Linux-Download-blue?style=for-the-badge&logo=linux)](https://github.com/ekddigital/ekdclean/releases/download/v1.0.0/EKD-Clean-1.0.0.AppImage)

**All Releases**: [View all versions](https://github.com/ekddigital/ekdclean/releases)

</div>

### Installation Instructions

#### 🍎 macOS

1. Download the `.dmg` file
2. Open the file and drag EKD Clean to Applications
3. Launch from Applications folder

#### 🪟 Windows

1. Download the `.exe` installer
2. Run the installer (may need administrator privileges)
3. Follow the installation wizard
4. Launch from Start Menu or Desktop shortcut

#### 🐧 Linux

1. Download the `.AppImage` file
2. Make it executable: `chmod +x EKD-Clean-*.AppImage`
3. Run: `./EKD-Clean-*.AppImage`

**Alternative formats**: `.deb` for Debian/Ubuntu, `.rpm` for Fedora/RHEL

---

## ✨ Features

- 🧹 **Smart System Cleaning** - Intelligently removes temporary files, caches, and junk
- 🔍 **Duplicate File Finder** - Identifies and removes duplicate files to free up space
- 🛡️ **Malware Scanner** - Advanced security scanning with real-time protection
- 📊 **System Monitor** - Real-time monitoring of CPU, memory, and disk usage
- 🎨 **Beautiful UI** - Cinematic animations with 120fps smooth interactions
- 🌓 **Dark/Light Themes** - Gorgeous themes with seamless transitions
- 🚀 **Lightning Fast** - Hardware-accelerated animations and instant feedback
- 🌍 **Cross-Platform** - Works on Windows, macOS, and Linux

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 22.16.0 or higher ([Download](https://nodejs.org/))
- **npm**: Comes with Node.js (version 9.0.0 or higher recommended)
- **Git**: For cloning the repository ([Download](https://git-scm.com/))

### Platform-Specific Requirements

#### Windows

- **Windows 10** or higher
- **Visual Studio Build Tools** (for native modules)
  ```bash
  npm install --global windows-build-tools
  ```

#### macOS

- **macOS 10.13** (High Sierra) or higher
- **Xcode Command Line Tools**
  ```bash
  xcode-select --install
  ```

#### Linux

- **Ubuntu 18.04+** / **Debian 10+** / **Fedora 32+** or equivalent
- Development tools:

  ```bash
  # Ubuntu/Debian
  sudo apt-get install build-essential libssl-dev

  # Fedora/RHEL
  sudo dnf install gcc-c++ make openssl-devel
  ```

## 🚀 Quick Start

### For Users

Want to use EKD Clean? See the [Installation Guide](./docs/INSTALLATION.md) for downloading and installing pre-built binaries for your platform.

_Note: Pre-built binaries will be available once the first release is published._

### For Developers

Want to contribute or build from source? Follow these steps:

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ekddigital/ekdclean.git
   cd ekdclean
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Install renderer dependencies**
   ```bash
   cd packages/renderer
   npm install
   cd ../..
   ```

### Development

Start the development environment with hot-reload:

```bash
# Using the start script (recommended)
./start.sh

# Or using npm scripts
npm run dev
```

This will:

- Clean previous builds
- Install dependencies
- Build the main process
- Start Electron with hot-reload

### Building

Build the application for production:

```bash
npm run build
```

This compiles:

- Main process (Electron backend)
- Renderer process (React frontend)

### Running

After building, run the application:

```bash
npm start
```

## 📦 Building Distributable Packages

Build platform-specific installers and packages:

### For Your Current Platform

```bash
npm run package
```

### Platform-Specific Builds

```bash
# macOS (.dmg, .app)
npm run package -- --mac

# Windows (.exe, .msi)
npm run package -- --win

# Linux (.AppImage, .deb, .rpm)
npm run package -- --linux
```

### Build for All Platforms

```bash
npm run package -- --mac --win --linux
```

**Note**: Building for specific platforms may require that platform's environment. See [electron-builder documentation](https://www.electron.build/multi-platform-build) for cross-platform building.

## 🏗️ Project Structure

```
ekd-clean/
├── packages/
│   ├── main/              # Electron main process (Node.js backend)
│   ├── renderer/          # React frontend with cinematic UI
│   ├── shared/            # Shared types & utilities
│   ├── native/            # Native optimization modules
│   ├── ui-system/         # EKD Digital design system
│   └── animations/        # Framer Motion animation library
├── assets/                # Icons, images, and branding
├── docs/                  # Documentation
├── .github/               # GitHub Actions workflows
│   └── workflows/         # CI/CD pipelines
├── start.sh               # Development start script
└── package.json           # Root package configuration
```

## 🛠️ Available Scripts

| Script            | Description                                   |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start development environment with hot-reload |
| `npm run build`   | Build for production                          |
| `npm start`       | Run the built application                     |
| `npm run package` | Create distributable packages                 |
| `npm run clean`   | Remove build artifacts                        |
| `npm run lint`    | Lint source code                              |
| `npm run format`  | Format code with Prettier                     |

## 🧪 Testing

```bash
# Run linting
npm run lint

# Format code
npm run format

# Type checking (renderer)
cd packages/renderer && npm run type-check
```

## 🔧 Configuration

### Electron Builder

The build configuration can be customized in `package.json` under the `build` key. See the [electron-builder documentation](https://www.electron.build/configuration/configuration) for all options.

### Environment Variables

Create a `.env` file in the root directory for custom configuration:

```env
# Development settings
NODE_ENV=development
ELECTRON_ENABLE_LOGGING=true
```

## 🐛 Troubleshooting

### Build Issues

**Problem**: Build fails with TypeScript errors

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

**Problem**: Electron doesn't start

```bash
# Ensure all dependencies are installed
npm install
cd packages/renderer && npm install && cd ../..
npm run build
```

### Platform-Specific Issues

#### Windows

- **Error**: `node-gyp` build failures
  - Solution: Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/)

#### macOS

- **Error**: Code signing issues
  - Solution: See [electron-builder code signing guide](https://www.electron.build/code-signing)

#### Linux

- **Error**: Missing dependencies
  ```bash
  # Install required libraries
  sudo apt-get install libgconf-2-4 libatk1.0-0 libatk-bridge2.0-0 libgdk-pixbuf2.0-0 libgtk-3-0 libgbm-dev libnss3-dev libxss-dev
  ```

### Common Issues

**Issue**: Port 3000 already in use

```bash
# The renderer uses port 3000 by default
# Change in packages/renderer/vite.config.ts
```

**Issue**: Dependencies out of sync

```bash
# Remove all node_modules and reinstall
rm -rf node_modules packages/*/node_modules
npm install
cd packages/renderer && npm install && cd ../..
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Run linting before committing: `npm run lint`
- Format code: `npm run format`
- Test on your target platform before submitting PR
- Update documentation for new features

## 📖 Documentation

- **User Guides**
  - [Installation Guide](./docs/INSTALLATION.md) - Detailed installation instructions for all platforms
  - [User Manual](./ekdclean.md) - Complete feature guide and usage instructions

- **Developer Guides**
  - [Build Guide](./docs/BUILD.md) - Comprehensive build instructions
  - [Contributing Guidelines](./CONTRIBUTING.md) - How to contribute to the project
  - [Implementation Roadmap](./docs/IMPLEMENTATION_ROADMAP.md) - Development roadmap
  - [CleanMyMac Style Reference](./docs/CleanMyMac-Style-Reference.md) - UI/UX design reference

- **Project Information**
  - [Changelog](./CHANGELOG.md) - Release history and changes
  - [License](./LICENSE) - MIT License details

## 🎨 Technology Stack

- **Frontend**: React 18+, TypeScript 5.6+, Tailwind CSS 4.x
- **Desktop**: Electron 32+
- **Animations**: Framer Motion 11.x, React Spring
- **UI Library**: Mantine 7.x
- **Build Tools**: Vite 5.x, Turbo, TypeScript
- **Native Modules**: Node.js 22.16.0

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 About EKD Digital

**EKD Digital** is a forward-thinking technology company specializing in innovative software solutions and digital products. EKD Clean represents our expansion into desktop application development, leveraging our web technology expertise to create superior cross-platform tools.

### Our Expertise

- Modern Web Applications (Next.js, React, TypeScript)
- Full-Stack Development
- Cross-Platform Solutions
- Enterprise Software
- Digital Innovation

---

<div align="center">

**Built with ❤️ by [EKD Digital](https://github.com/ekddigital)**

[Report Bug](https://github.com/ekddigital/ekdclean/issues) • [Request Feature](https://github.com/ekddigital/ekdclean/issues)

</div>
