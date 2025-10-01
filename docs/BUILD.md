# EKD Clean Build Guide

This guide provides detailed instructions for building EKD Clean from source for development and distribution.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Build](#development-build)
- [Production Build](#production-build)
- [Platform-Specific Builds](#platform-specific-builds)
- [Build Configuration](#build-configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

1. **Node.js 22.16.0 or higher**
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **npm 9.0.0 or higher**
   - Comes with Node.js
   - Verify: `npm --version`

3. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify: `git --version`

### Platform-Specific Requirements

#### Windows

```bash
# Install Windows Build Tools
npm install --global windows-build-tools

# Or install Visual Studio Build Tools manually
# https://visualstudio.microsoft.com/downloads/
```

Required:
- Visual Studio 2019 or later (Community Edition works)
- Windows SDK
- Python 3.x

#### macOS

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Verify installation
xcode-select -p
```

Required:
- Xcode Command Line Tools
- For code signing: Apple Developer account and certificates

#### Linux

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install build-essential libssl-dev

# Fedora/RHEL
sudo dnf install gcc-c++ make openssl-devel

# Arch Linux
sudo pacman -S base-devel openssl
```

## Development Build

### 1. Clone the Repository

```bash
git clone https://github.com/ekddigital/ekdclean.git
cd ekdclean
```

### 2. Install Dependencies

```bash
# Root dependencies
npm install

# Renderer dependencies
cd packages/renderer
npm install
cd ../..
```

### 3. Start Development Environment

```bash
# Option 1: Using convenience script (macOS/Linux)
./start.sh

# Option 2: Using npm scripts
npm run dev

# Option 3: Manual start
npm run dev:main  # Terminal 1: Build main process
npm run dev:renderer  # Terminal 2: Start renderer with hot-reload
```

The development server will:
- Watch for changes in the main process (TypeScript)
- Hot-reload the renderer process (React/Vite)
- Start Electron with DevTools enabled

### 4. Verify Development Build

1. The application should launch automatically
2. Check for console errors in DevTools
3. Test hot-reload by modifying a React component

## Production Build

### 1. Clean Previous Builds

```bash
npm run clean
```

### 2. Build All Packages

```bash
npm run build
```

This will:
- Compile TypeScript for the main process
- Build and optimize the renderer with Vite
- Output to `dist/` and `packages/renderer/dist/`

### 3. Test the Production Build

```bash
npm start
```

## Platform-Specific Builds

### Build for Current Platform

```bash
npm run package
```

Output location: `release/`

### Build for Specific Platforms

#### macOS

```bash
npm run package:mac
```

Produces:
- `EKD-Clean-{version}.dmg` - Installer
- `EKD-Clean-{version}-mac.zip` - Portable archive
- Universal binary (x64 + arm64)

#### Windows

```bash
npm run package:win
```

Produces:
- `EKD-Clean-{version}-x64-Setup.exe` - 64-bit installer
- `EKD-Clean-{version}-ia32-Setup.exe` - 32-bit installer
- `EKD-Clean-{version}-x64-portable.exe` - Portable executable

#### Linux

```bash
npm run package:linux
```

Produces:
- `EKD-Clean-{version}.AppImage` - Universal Linux package
- `EKD-Clean-{version}.deb` - Debian/Ubuntu package
- `EKD-Clean-{version}.rpm` - Fedora/RHEL package

### Build for All Platforms

```bash
npm run package:all
```

**Note**: Cross-platform builds may require additional setup. See [electron-builder multi-platform build docs](https://www.electron.build/multi-platform-build).

## Build Configuration

### Electron Builder Configuration

Edit `package.json` → `build` section:

```json
{
  "build": {
    "appId": "com.ekddigital.ekdclean",
    "productName": "EKD Clean",
    "directories": {
      "buildResources": "assets",
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "packages/renderer/dist/**/*"
    ]
  }
}
```

### Custom Build Options

#### Change App Icon

1. Replace `assets/logo.png` with your icon (512x512 or higher)
2. For macOS: Use `.icns` format
3. For Windows: Use `.ico` format
4. For Linux: Use `.png` format (256x256 or higher)

#### Modify Build Output Directory

```json
{
  "build": {
    "directories": {
      "output": "build-output"
    }
  }
}
```

#### Enable Code Signing (macOS)

```bash
# Set environment variables
export CSC_LINK=/path/to/certificate.p12
export CSC_KEY_PASSWORD=your_password

# Build with signing
npm run package:mac
```

#### Enable Code Signing (Windows)

```bash
# Using certificate file
export CSC_LINK=/path/to/certificate.pfx
export CSC_KEY_PASSWORD=your_password

# Build with signing
npm run package:win
```

## Advanced Build Options

### Debug Build

```bash
# Build without minification
DEBUG=electron-builder npm run package

# Enable verbose logging
npm run package -- --publish never --debug
```

### Build with Custom Configuration

```bash
# Use custom electron-builder config
npm run package -- --config custom-builder-config.yml
```

### Build Only for Specific Architecture

```bash
# macOS ARM64 only
npm run package:mac -- --arm64

# Windows 64-bit only
npm run package:win -- --x64

# Linux ARM
npm run package:linux -- --arm64
```

## CI/CD Builds

The project includes GitHub Actions workflows for automated builds:

### Continuous Integration

Triggers on push/PR to main/develop:
- `.github/workflows/build.yml` - Builds on all platforms
- `.github/workflows/test.yml` - Runs linting and type checks

### Automated Releases

Triggers on version tags (e.g., `v1.0.0`):
- `.github/workflows/release.yml` - Builds and publishes releases

#### Creating a Release

```bash
# Update version in package.json
npm version patch  # or minor, major

# Push tags
git push --follow-tags

# GitHub Actions will automatically build and create release
```

## Build Performance

### Speed Up Builds

1. **Use SSD** for better I/O performance
2. **Increase Node memory**:
   ```bash
   export NODE_OPTIONS=--max-old-space-size=4096
   ```
3. **Enable parallel builds** (already configured in package.json)
4. **Use local caching**:
   ```bash
   # electron-builder cache
   export ELECTRON_BUILDER_CACHE=~/.cache/electron-builder
   ```

### Build Time Estimates

- Development build: 10-30 seconds
- Production build: 1-3 minutes
- Package build (one platform): 3-5 minutes
- Package build (all platforms): 10-15 minutes

## Troubleshooting

### Common Issues

#### 1. TypeScript Compilation Errors

```bash
# Clear TypeScript cache
rm -rf packages/*/tsconfig.tsbuildinfo

# Rebuild
npm run build
```

#### 2. Missing Dependencies

```bash
# Remove all node_modules
rm -rf node_modules packages/*/node_modules

# Clean install
npm ci
cd packages/renderer && npm ci && cd ../..
```

#### 3. electron-builder Fails

```bash
# Clear electron-builder cache
rm -rf ~/.cache/electron-builder

# Try building again
npm run package
```

#### 4. Code Signing Fails (macOS)

```bash
# Verify certificate
security find-identity -v -p codesigning

# Build without signing (development only)
npm run package -- --publish never
```

#### 5. Native Module Build Fails

```bash
# Rebuild native modules
npm rebuild

# Or rebuild specific modules
npm rebuild better-sqlite3
```

### Platform-Specific Issues

#### Windows
- **Error**: `node-gyp` failures
  - Solution: Install Visual Studio Build Tools
  - Or: `npm install --global windows-build-tools`

#### macOS
- **Error**: Code signing timeout
  - Solution: Increase timeout: `export CSC_IDENTITY_AUTO_DISCOVERY=false`

#### Linux
- **Error**: Missing libraries
  ```bash
  sudo apt-get install libgconf-2-4 libatk1.0-0 libatk-bridge2.0-0 \
    libgdk-pixbuf2.0-0 libgtk-3-0 libgbm-dev
  ```

### Getting Help

If you encounter build issues:

1. Check [existing issues](https://github.com/ekddigital/ekdclean/issues)
2. Review [electron-builder docs](https://www.electron.build/)
3. [Open a new issue](https://github.com/ekddigital/ekdclean/issues/new) with:
   - Your OS and version
   - Node.js and npm versions
   - Full error output
   - Steps to reproduce

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder Documentation](https://www.electron.build/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Built with ❤️ by [EKD Digital](https://github.com/ekddigital)**
