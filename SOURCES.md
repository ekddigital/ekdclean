# EKD Clean - OS-Specific Implementation Sources

This document lists the credible sources and research used to implement platform-specific functionality in EKD Clean.

## macOS Implementation Sources

### System Paths & Caches

- **Apple Developer Documentation**: [File System Programming Guide](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/)
- **Library Directories**: `~/Library/Caches`, `~/Library/Logs`, `~/Library/Application Support`
- **Launch Agents**: `~/Library/LaunchAgents`, `/Library/LaunchAgents`, `/Library/LaunchDaemons`
- **Trash Location**: `~/.Trash` and mount-specific `.Trashes` directories

### Browser Cache Locations (macOS)

- **Chrome**: `~/Library/Application Support/Google/Chrome/Default/Cache`
- **Safari**: `~/Library/Caches/com.apple.Safari`
- **Firefox**: `~/Library/Caches/Firefox/Profiles`

### Mail Attachments

- **Apple Mail**: `~/Library/Mail/V*/MailData/Attachments`
- **Outlook for Mac**: `~/Library/Group Containers/UBF8T346G9.Office/Outlook`

### Photo Cache Locations

- **Photos.app**: `~/Library/Caches/com.apple.Photos`
- **iPhoto**: `~/Library/Caches/com.apple.iPhoto`

### Protected System Paths

- `/System`
- `/Library/System`
- `/usr/bin`
- `/usr/sbin`

## Windows Implementation Sources

### System Paths

- **Microsoft Docs**: [Known Folders](https://docs.microsoft.com/en-us/windows/win32/shell/knownfolderid)
- **Temp Files**: `%TEMP%`, `C:\Windows\Temp`
- **App Data**: `%APPDATA%`, `%LOCALAPPDATA%`

### Browser Cache Locations (Windows)

- **Chrome**: `%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache`
- **Edge**: `%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache`
- **Firefox**: `%APPDATA%\Mozilla\Firefox\Profiles\*\cache2`

### Startup Items

- **User Startup**: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`
- **All Users Startup**: `C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup`
- **Registry Run Keys**:
  - `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run`
  - `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run`

### Recycle Bin

- **Location**: `C:\$Recycle.Bin\{SID}`
- **Reference**: [Shell32 Recycle Bin APIs](https://docs.microsoft.com/en-us/windows/win32/api/shellapi/)

### Protected System Paths

- `C:\Windows\System32`
- `C:\Windows\SysWOW64`
- `C:\Program Files`
- `C:\Program Files (x86)`

## Linux Implementation Sources

### System Paths

- **FreeDesktop.org**: [XDG Base Directory Specification](https://specifications.freedesktop.org/basedir-spec/latest/)
- **Cache**: `~/.cache`
- **Config**: `~/.config`
- **Local Data**: `~/.local/share`

### Browser Cache Locations (Linux)

- **Chrome**: `~/.cache/google-chrome/Default/Cache`
- **Firefox**: `~/.cache/mozilla/firefox/*.default-release/cache2`
- **Chromium**: `~/.cache/chromium/Default/Cache`

### Trash Location

- **FreeDesktop Trash**: `~/.local/share/Trash`
- **Specification**: [FreeDesktop Trash Specification](https://specifications.freedesktop.org/trash-spec/trashspec-latest.html)
- Structure:
  - `files/` - Actual trashed files
  - `info/` - Metadata (.trashinfo files)

### Autostart

- **User Autostart**: `~/.config/autostart`
- **System Autostart**: `/etc/xdg/autostart`
- **Desktop Entry Format**: [Desktop Entry Specification](https://specifications.freedesktop.org/desktop-entry-spec/latest/)

### systemd Services

- **User Services**: `~/.config/systemd/user`
- **System Services**: `/etc/systemd/system`, `/usr/lib/systemd/system`
- **Reference**: [systemd Documentation](https://www.freedesktop.org/software/systemd/man/systemd.service.html)

### Protected System Paths

- `/bin`
- `/sbin`
- `/usr/bin`
- `/usr/sbin`
- `/etc`
- `/boot`

## General Best Practices & Safety

### File Deletion Safety

- **Source**: [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- Always preview before delete
- Implement quarantine/undo mechanism
- Validate file paths to prevent directory traversal
- Never delete without user confirmation

### Permission Handling

- **Principle of Least Privilege**: Request only necessary permissions
- **macOS**: Full Disk Access for system directories
- **Windows**: UAC elevation for Program Files and system directories
- **Linux**: sudo for system-level operations

### Performance Considerations

- **Batch Operations**: Process files in chunks to avoid UI blocking
- **Async I/O**: Use non-blocking file operations
- **Progress Reporting**: Update UI at reasonable intervals (not per file)
- **Memory Management**: Stream large files instead of loading into memory

## Testing References

### Unit Testing

- **Jest Documentation**: [https://jestjs.io/](https://jestjs.io/)
- **Testing Library**: [https://testing-library.com/](https://testing-library.com/)

### E2E Testing

- **Playwright**: [https://playwright.dev/](https://playwright.dev/)
- **Electron Testing**: [Spectron (deprecated), migrated to Playwright](https://www.electronjs.org/docs/latest/tutorial/automated-testing)

## Security & Privacy

### GDPR Compliance

- **Source**: [GDPR Guidelines](https://gdpr.eu/)
- No data collection without explicit consent
- Clear privacy policy
- User control over data deletion

### Code Signing

- **macOS**: [Apple Developer - Code Signing](https://developer.apple.com/support/code-signing/)
- **Windows**: [Microsoft - Code Signing](https://docs.microsoft.com/en-us/windows/win32/seccrypto/cryptography-tools)

## Community Resources

### CleanMyMac-like UI Inspiration

- **CleanMyMac X**: Design patterns and UX flows
- **Tailwind UI**: Component styling patterns
- **Framer Motion**: Animation guidelines

### Electron Best Practices

- **Electron Security**: [https://www.electronjs.org/docs/latest/tutorial/security](https://www.electronjs.org/docs/latest/tutorial/security)
- **IPC Best Practices**: [https://www.electronjs.org/docs/latest/tutorial/ipc](https://www.electronjs.org/docs/latest/tutorial/ipc)
- **Context Isolation**: Always enable for security

## Contribution Guidelines

When adding new platform-specific features:

1. Research official OS documentation first
2. Test on actual hardware (not just VMs)
3. Document sources in this file
4. Include fallbacks for edge cases
5. Add unit tests for platform-specific code

## Version History

- **v1.0.0** (2025-09-05): Initial implementation with macOS, Windows, Linux support
- All sources verified as of September 2025
- Review and update quarterly to ensure accuracy

---

**Note**: This document should be updated whenever new platform-specific functionality is added. Always prefer official documentation over community sources for critical system operations.
