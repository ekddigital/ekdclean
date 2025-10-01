# EKD Clean - QA Checklist

**Built by EKD Digital**

## Pre-Release Testing Checklist

### 🔧 Build & Installation

- [ ] Application builds successfully on macOS
- [ ] Application builds successfully on Windows
- [ ] Application builds successfully on Linux
- [ ] Installer/DMG launches correctly
- [ ] Application icon displays correctly
- [ ] App name and version are correct
- [ ] No console errors on startup

### 🔍 Scanner Functionality

#### System Junk Scanner
- [ ] Detects application caches correctly
- [ ] Finds temporary files older than 24 hours
- [ ] Identifies development artifacts (npm, yarn, pip)
- [ ] Does not scan protected directories
- [ ] Progress bar updates during scan
- [ ] Results display with correct sizes
- [ ] Dry-run mode works (no files deleted)
- [ ] Actual cleaning removes correct files
- [ ] Files are quarantined by default

#### Trash Bins Scanner
- [ ] Detects trash on macOS (`~/.Trash`)
- [ ] Detects recycle bin on Windows
- [ ] Detects trash on Linux (`~/.local/share/Trash`)
- [ ] Calculates total trash size correctly
- [ ] Empty trash functionality works
- [ ] Respects quarantine option
- [ ] Multi-volume trash detection works

#### Large & Old Files Scanner
- [ ] Configurable size threshold works
- [ ] Configurable age threshold works
- [ ] Custom search paths can be set
- [ ] Skips hidden files and system directories
- [ ] Sorts results by size/age
- [ ] Progress updates during deep scan
- [ ] Does not suggest deletion of recent files
- [ ] Respects user Documents/Downloads protection

#### Photo Junk Scanner
- [ ] Detects duplicate photos by content
- [ ] Finds photo app caches
- [ ] Identifies thumbnail files
- [ ] Groups duplicates correctly
- [ ] Suggests keeping newest version
- [ ] Hash calculation is accurate
- [ ] Handles large photo libraries efficiently
- [ ] Does not flag unique photos

#### Mail Attachments Scanner
- [ ] Detects Apple Mail attachments (macOS)
- [ ] Detects Outlook attachments
- [ ] Detects Thunderbird attachments
- [ ] Shows attachment sizes correctly
- [ ] Only suggests old/large attachments
- [ ] Does not break mail database
- [ ] Forces quarantine for mail files
- [ ] Warns user about mail impact

#### Privacy Scanner
- [ ] Detects browser caches (Chrome, Safari, Firefox)
- [ ] Finds browser history and cookies
- [ ] Identifies log files correctly
- [ ] Detects recent files lists
- [ ] Does NOT suggest password stores
- [ ] Explains privacy impact clearly
- [ ] Warns before clearing history
- [ ] Respects browser-specific paths

### 🛡️ Safety Features

#### Quarantine System
- [ ] Files are copied before deletion
- [ ] Quarantine directory created correctly
- [ ] SHA-256 checksums are calculated
- [ ] Metadata is stored properly
- [ ] Quarantine list displays all items
- [ ] Restore functionality works
- [ ] Restored files match original checksums
- [ ] Clear old quarantine items works
- [ ] Quarantine survives app restart

#### Whitelist System
- [ ] Can add path-based rules
- [ ] Can add glob pattern rules
- [ ] Can add hash-based rules
- [ ] Rules are persisted correctly
- [ ] Whitelisted files are never suggested
- [ ] Rules display in settings
- [ ] Can remove whitelist rules
- [ ] Whitelist survives app restart

#### Protected Paths
- [ ] System directories are never suggested
- [ ] User Documents are protected by default
- [ ] User Desktop is protected by default
- [ ] User Pictures/Music/Videos are protected
- [ ] Downloads folder requires explicit user choice
- [ ] Protected path violations are logged
- [ ] Clear warnings for protected areas

### 🎨 UI/UX

#### General UI
- [ ] Application loads within 3 seconds
- [ ] No flickering or visual glitches
- [ ] Animations are smooth (60fps)
- [ ] Dark mode toggle works (if applicable)
- [ ] Responsive to window resizing
- [ ] Sidebar navigation works
- [ ] All icons display correctly
- [ ] Font rendering is crisp

#### Dashboard/Smart Scan
- [ ] Circular scan button displays correctly
- [ ] Progress ring animates smoothly
- [ ] Smart scan runs all scanners
- [ ] Results grouped by category
- [ ] Can drill down into categories
- [ ] Summary statistics are accurate
- [ ] Recent activity displays correctly

#### Scanner Views
- [ ] Each scanner has dedicated view
- [ ] Scan button is prominent and clear
- [ ] Progress indicators are visible
- [ ] Results display in scrollable list
- [ ] Item selection works (checkboxes)
- [ ] Select all/none functionality works
- [ ] Selected items count is accurate
- [ ] Total size calculation is correct
- [ ] Clean button appears when items selected
- [ ] Confidence indicators display correctly
- [ ] Safety warnings are visible

#### Quarantine View
- [ ] Quarantined items list loads
- [ ] Items display with metadata
- [ ] Restore button works per item
- [ ] Clear old items button works
- [ ] Empty state displays correctly
- [ ] File paths are readable
- [ ] Timestamps are formatted correctly

#### Settings View
- [ ] Whitelist rules display
- [ ] Add rule form works
- [ ] Rule type dropdown works
- [ ] Pattern input validates
- [ ] Reason field is required
- [ ] Rules save correctly
- [ ] Remove rule button works
- [ ] Empty state displays correctly

### ⚡ Performance

- [ ] Scanning 1000+ files completes in <30 seconds
- [ ] UI remains responsive during scan
- [ ] Memory usage stays under 500MB
- [ ] CPU usage is reasonable (<50% per core)
- [ ] Large file operations don't freeze UI
- [ ] No memory leaks after multiple scans
- [ ] Background operations don't block UI

### 🔐 Security

- [ ] No sensitive data in logs
- [ ] User confirmation required for all deletions
- [ ] Checksums verified on restore
- [ ] File permissions respected
- [ ] No unauthorized privilege escalation
- [ ] Quarantine directory has proper permissions
- [ ] Config files have proper permissions

### 📱 Cross-Platform

#### macOS Specific
- [ ] Menu bar integration works
- [ ] System tray icon displays
- [ ] Dock icon displays
- [ ] Native file dialogs work
- [ ] Keyboard shortcuts work
- [ ] Full Disk Access prompt appears
- [ ] Retina display support

#### Windows Specific
- [ ] Installer works correctly
- [ ] Start menu shortcut created
- [ ] System tray icon displays
- [ ] Native file dialogs work
- [ ] Administrator elevation prompts
- [ ] Windows Defender doesn't flag app
- [ ] High DPI support

#### Linux Specific
- [ ] .deb package installs correctly
- [ ] .rpm package installs correctly
- [ ] AppImage runs without installation
- [ ] Desktop file created correctly
- [ ] File permissions correct
- [ ] Dependencies resolved

### 🐛 Error Handling

- [ ] Graceful handling of permission errors
- [ ] Clear error messages for users
- [ ] Network unavailable handled
- [ ] Disk full scenario handled
- [ ] Invalid paths handled
- [ ] Corrupted config files handled
- [ ] Missing directories handled
- [ ] File in use errors handled
- [ ] Errors logged appropriately

### ♿ Accessibility

- [ ] Keyboard navigation works throughout
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Screen reader compatible (test basic flows)
- [ ] High contrast mode supported
- [ ] Font size is readable
- [ ] Color-blind friendly (no color-only indicators)
- [ ] ARIA labels present

### 📊 Logging & Monitoring

- [ ] All operations are logged
- [ ] Log levels are appropriate
- [ ] Logs rotate at 10MB
- [ ] Sensitive data not logged
- [ ] Timestamps are accurate
- [ ] Log format is parseable
- [ ] Errors include stack traces

### 🔄 Data Integrity

- [ ] Scan results are accurate
- [ ] File sizes match actual sizes
- [ ] Checksums are correct
- [ ] Dates/timestamps are accurate
- [ ] No data loss during operations
- [ ] Quarantine preserves file data
- [ ] Restore recovers exact original

## Manual Testing Scenarios

### Scenario 1: First-Time User
1. Install application
2. Launch for first time
3. Run Smart Scan
4. Review results
5. Clean safe items only
6. Verify files removed
7. Check quarantine
8. Restore one item
9. Verify restore successful

### Scenario 2: Power User
1. Configure custom scan paths
2. Add whitelist rules
3. Run individual scanners
4. Select specific items
5. Clean with quarantine
6. Review quarantine
7. Clear old quarantine items
8. Verify protected paths respected

### Scenario 3: Error Recovery
1. Disconnect internet during scan
2. Fill disk during clean
3. Deny file permissions
4. Kill app mid-operation
5. Corrupt config file
6. Verify graceful recovery

### Scenario 4: Safety Verification
1. Add important file to scan location
2. Whitelist the file
3. Run scanner
4. Verify file not suggested
5. Remove from whitelist
6. Run scanner again
7. Verify file now appears

## Regression Testing

After each update, verify:
- [ ] Previous scan results still work
- [ ] Existing whitelist rules still apply
- [ ] Quarantined items still restorable
- [ ] Settings are preserved
- [ ] No performance degradation
- [ ] UI/UX improvements don't break functionality

## Release Criteria

✅ **Must Pass All**:
- [ ] No critical bugs
- [ ] All core features work
- [ ] Safety features tested
- [ ] Cross-platform builds successful
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version number incremented
- [ ] Code reviewed

🎯 **Optional (Nice to Have)**:
- [ ] Performance benchmarks documented
- [ ] User testing feedback incorporated
- [ ] Demo video recorded
- [ ] Blog post prepared

## Testing Tools & Commands

```bash
# Build for testing
npm run build

# Run in development
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Run tests (when implemented)
npm test

# Build distributable
npm run package
```

## Known Issues / Limitations

Document any known issues that don't block release:

- [ ] Issue 1: Description
- [ ] Issue 2: Description
- [ ] Issue 3: Description

## Sign-Off

- [ ] Development Complete: _________ (Date)
- [ ] QA Testing Complete: _________ (Date)
- [ ] Documentation Review: _________ (Date)
- [ ] Security Review: _________ (Date)
- [ ] Ready for Release: _________ (Date)

**Tested By**: _________________________

**Date**: _________________________

**Version**: _________________________

**Platform**: _________________________

**Notes**: _________________________
