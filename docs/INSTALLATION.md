# EKD Clean Installation Guide

This guide provides detailed instructions for installing and running EKD Clean on different operating systems.

## Download

### Official Releases

Download the latest release for your platform from the [Releases](https://github.com/ekddigital/ekdclean/releases) page:

- **Windows**: Download `EKD-Clean-{version}-x64-Setup.exe` or `EKD-Clean-{version}-ia32-Setup.exe`
- **macOS**: Download `EKD-Clean-{version}.dmg` or `EKD-Clean-{version}.zip`
- **Linux**: Download `EKD-Clean-{version}.AppImage`, `.deb`, or `.rpm`

### Platform-Specific Installation

## Windows

### Option 1: Installer (.exe)

1. Download the `.exe` installer from the releases page
2. Double-click the installer
3. Follow the installation wizard
4. Choose installation directory (optional)
5. Click "Install"
6. Launch EKD Clean from the Start Menu or Desktop shortcut

### Option 2: Portable (.exe)

1. Download the portable `.exe` from the releases page
2. No installation required - just run the executable
3. Ideal for USB drives or systems without admin rights

### System Requirements
- Windows 10 or higher
- 4GB RAM (8GB recommended)
- 500MB free disk space
- .NET Framework 4.7.2 or higher (usually pre-installed)

### Troubleshooting Windows
- **SmartScreen Warning**: Click "More info" → "Run anyway" (first-time run only)
- **Antivirus False Positive**: Add EKD Clean to your antivirus exclusions
- **Permission Errors**: Run as Administrator for system-level cleaning

## macOS

### Installation from DMG

1. Download the `.dmg` file from the releases page
2. Double-click to mount the DMG
3. Drag "EKD Clean" to your Applications folder
4. Eject the DMG
5. Open EKD Clean from Applications or Launchpad

### First Launch

On first launch, you may see "Cannot open because it is from an unidentified developer":

1. Right-click (or Control-click) the app
2. Select "Open" from the context menu
3. Click "Open" in the dialog
4. The app will now open and be trusted

Alternatively, from Terminal:
```bash
xattr -cr /Applications/EKD\ Clean.app
```

### System Requirements
- macOS 10.13 (High Sierra) or higher
- 4GB RAM (8GB recommended)
- 500MB free disk space
- Full Disk Access (for comprehensive cleaning)

### Granting Full Disk Access

For complete system scanning:

1. Open **System Preferences** → **Security & Privacy** → **Privacy**
2. Select **Full Disk Access** from the left sidebar
3. Click the lock icon and authenticate
4. Click the **+** button
5. Navigate to Applications and select **EKD Clean**
6. Restart EKD Clean

### Troubleshooting macOS
- **App Damaged Error**: Run `xattr -cr /Applications/EKD\ Clean.app` in Terminal
- **Permissions Issues**: Grant Full Disk Access as described above
- **Can't Move to Trash**: Use Activity Monitor to quit any running instances

## Linux

### Ubuntu/Debian (.deb)

```bash
# Download the .deb file, then:
sudo dpkg -i EKD-Clean-*.deb

# If dependencies are missing:
sudo apt-get install -f

# Launch from terminal or application menu
ekd-clean
```

### Fedora/RHEL/CentOS (.rpm)

```bash
# Download the .rpm file, then:
sudo rpm -i EKD-Clean-*.rpm

# Or using dnf:
sudo dnf install EKD-Clean-*.rpm

# Launch
ekd-clean
```

### AppImage (Universal)

```bash
# Download the .AppImage file
chmod +x EKD-Clean-*.AppImage

# Run directly (no installation needed)
./EKD-Clean-*.AppImage
```

To integrate with your system:

```bash
# Move to a system directory
sudo mv EKD-Clean-*.AppImage /opt/ekd-clean/ekd-clean

# Create desktop entry
cat > ~/.local/share/applications/ekd-clean.desktop << EOF
[Desktop Entry]
Name=EKD Clean
Exec=/opt/ekd-clean/ekd-clean
Type=Application
Categories=Utility;System;
Icon=ekd-clean
Terminal=false
EOF
```

### System Requirements
- Ubuntu 18.04+ / Debian 10+ / Fedora 32+ or equivalent
- 4GB RAM (8GB recommended)
- 500MB free disk space
- X11 or Wayland display server

### Required Dependencies

Most dependencies are bundled, but you may need:

```bash
# Ubuntu/Debian
sudo apt-get install libgconf-2-4 libatk1.0-0 libatk-bridge2.0-0 \
  libgdk-pixbuf2.0-0 libgtk-3-0 libgbm-dev libnss3 libxss1

# Fedora/RHEL
sudo dnf install GConf2 atk at-spi2-atk gtk3 libXScrnSaver nss
```

### Troubleshooting Linux
- **AppImage Won't Run**: Install FUSE: `sudo apt install fuse libfuse2`
- **Permission Denied**: Make the file executable: `chmod +x EKD-Clean-*.AppImage`
- **Missing Libraries**: Install dependencies as shown above
- **Wayland Issues**: Try setting `GDK_BACKEND=x11` before launching

## Building from Source

If you prefer to build from source, see the [README.md](../README.md) for detailed instructions.

### Quick Build

```bash
# Clone repository
git clone https://github.com/ekddigital/ekdclean.git
cd ekdclean

# Install dependencies
npm install
cd packages/renderer && npm install && cd ../..

# Build
npm run build

# Run
npm start
```

## Updating EKD Clean

### Auto-Updates (Recommended)

EKD Clean includes an auto-update feature:

1. The app checks for updates on launch
2. If an update is available, you'll be notified
3. Click "Download Update" to install
4. The app will restart with the new version

### Manual Updates

Download and install the latest version from the [Releases](https://github.com/ekddigital/ekdclean/releases) page. Your settings and preferences will be preserved.

## Uninstalling

### Windows
- Control Panel → Programs → Uninstall EKD Clean
- Or use the uninstaller in the installation directory

### macOS
- Drag EKD Clean from Applications to Trash
- Remove preferences: `~/Library/Application Support/ekd-clean/`

### Linux
```bash
# Debian/Ubuntu
sudo apt remove ekd-clean

# Fedora/RHEL
sudo dnf remove ekd-clean

# AppImage: Just delete the file
rm /opt/ekd-clean/ekd-clean
```

## Support

If you encounter issues:

1. Check the [Troubleshooting section in README](../README.md#troubleshooting)
2. Search [existing issues](https://github.com/ekddigital/ekdclean/issues)
3. [Open a new issue](https://github.com/ekddigital/ekdclean/issues/new) with:
   - Your OS and version
   - EKD Clean version
   - Steps to reproduce
   - Error messages or logs

## Privacy & Security

EKD Clean:
- ✅ Runs entirely on your device
- ✅ No data collection or telemetry (unless opt-in)
- ✅ Open source - inspect the code yourself
- ✅ Respects system permissions
- ✅ Safe cleaning algorithms with user confirmation

---

**Built with ❤️ by [EKD Digital](https://github.com/ekddigital)**
