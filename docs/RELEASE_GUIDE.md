# 🚀 Release Guide for EKD Clean

**Built by EKD Digital**

This guide explains how to create releases for EKD Clean with automated builds for Windows, macOS, and Linux.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Release Process](#quick-release-process)
- [Manual Release Process](#manual-release-process)
- [GitHub Actions Workflow](#github-actions-workflow)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Prerequisites

Before creating a release, ensure:

1. ✅ You have push access to the repository
2. ✅ All tests are passing
3. ✅ Code is committed and pushed to `main` branch
4. ✅ You have Git configured with your credentials
5. ✅ The `GITHUB_TOKEN` secret is available (automatic in GitHub Actions)

---

## Quick Release Process

### Using the Release Script (Recommended)

The easiest way to create a release is using our automated script:

```bash
# Navigate to project root
cd /Users/ekd/Documents/coding_env/multi/ekdclean

# Run the release script with the new version number
./scripts/release.sh 1.0.1
```

**The script will automatically:**

1. ✅ Validate version format
2. ✅ Check for uncommitted changes
3. ✅ Update `package.json` version
4. ✅ Update README download links
5. ✅ Commit version changes
6. ✅ Create a Git tag
7. ✅ Push everything to GitHub
8. ✅ Trigger GitHub Actions to build installers

**What happens next:**

- GitHub Actions will automatically build for:
  - 🍎 macOS (Intel & Apple Silicon)
  - 🪟 Windows (x64 & x86)
  - 🐧 Linux (AppImage, deb, rpm)
- Release will be created with all installers
- Download links will be auto-updated

---

## Manual Release Process

If you prefer to create releases manually:

### Step 1: Update Version

```bash
# Update package.json version
npm version 1.0.1 --no-git-tag-version

# Update package-lock.json
npm install
```

### Step 2: Update README

Edit `README.md` and update:
- Version number in download section
- All download links to new version

```markdown
### Latest Release: v1.0.1

[![Download for macOS](...)download/v1.0.1/EKD-Clean-1.0.1-mac.dmg)
```

### Step 3: Commit Changes

```bash
git add package.json package-lock.json README.md
git commit -m "chore: bump version to 1.0.1"
git push origin main
```

### Step 4: Create Git Tag

```bash
# Create annotated tag
git tag -a v1.0.1 -m "Release v1.0.1

## What's New
- Feature 1
- Feature 2
- Bug fixes

Built by EKD Digital"

# Push tag to GitHub
git push origin v1.0.1
```

### Step 5: Wait for GitHub Actions

Once the tag is pushed, GitHub Actions will automatically:

1. Build the app for all platforms
2. Create installers
3. Create a GitHub Release
4. Upload all installers to the release

Monitor progress at: `https://github.com/ekddigital/ekdclean/actions`

---

## GitHub Actions Workflow

### Workflow Overview

The `.github/workflows/build-and-release.yml` workflow has 4 jobs:

#### 1. **Build and Test** (Always runs)
- Runs on: Push to `main`, `develop`, or PRs
- Tests on: Ubuntu, macOS, Windows
- Actions:
  - Install dependencies
  - Lint code
  - Build main and renderer processes
  - Upload build artifacts

#### 2. **Release** (Only on tags)
- Runs on: Tags matching `v*.*.*` (e.g., `v1.0.1`)
- Builds for: macOS, Windows, Linux
- Actions:
  - Build and package for each platform
  - Create installers (.dmg, .exe, .AppImage, .deb, .rpm)
  - Upload to GitHub Release

#### 3. **Update README** (Only on tags)
- Runs after: Release job completes
- Actions:
  - Update download links in README
  - Commit and push changes back to `main`

#### 4. **Create Update Manifest** (Only on tags)
- Runs after: Release job completes
- Actions:
  - Create `latest.json` with version info
  - Upload to release for auto-update feature

### Workflow Triggers

```yaml
on:
  push:
    branches: [main, develop]    # Build on every push
    tags: ['v*.*.*']             # Release on version tags
  pull_request:
    branches: [main]              # Build on PRs to main
```

---

## Troubleshooting

### Problem: Release script fails with "Tag already exists"

**Solution:**
```bash
# Delete local tag
git tag -d v1.0.1

# Delete remote tag
git push origin :refs/tags/v1.0.1

# Try release again
./scripts/release.sh 1.0.1
```

### Problem: GitHub Actions build fails

**Solution:**

1. Check the Actions tab: `https://github.com/ekddigital/ekdclean/actions`
2. Click on the failed workflow run
3. Review the error logs
4. Common issues:
   - **Missing dependencies**: Add to `package.json`
   - **Build errors**: Fix locally first, then re-tag
   - **Permission issues**: Check `GITHUB_TOKEN` permissions

### Problem: Installers are not created

**Solution:**

1. Verify `electron-builder` configuration in `package.json`
2. Check that `release/` directory is in `.gitignore`
3. Ensure platform-specific assets exist (icons, etc.)
4. Review electron-builder logs in GitHub Actions

### Problem: Download links in README are wrong

**Solution:**

The workflow automatically updates README. If manual fix needed:

```bash
# Update links manually in README.md
# Commit and push
git add README.md
git commit -m "docs: fix download links"
git push origin main
```

---

## Best Practices

### Versioning

Follow **Semantic Versioning** (SemVer):

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): New features (backward compatible)
- **PATCH** (0.0.X): Bug fixes

Examples:
- `1.0.0` → First stable release
- `1.1.0` → New feature added
- `1.1.1` → Bug fix
- `2.0.0` → Breaking change

### Release Checklist

Before creating a release:

- [ ] All features are complete and tested
- [ ] Changelog is updated
- [ ] Version number follows SemVer
- [ ] README is updated with new features
- [ ] All tests pass locally
- [ ] Code is reviewed
- [ ] No uncommitted changes
- [ ] On `main` branch

### Release Notes

Write clear, user-friendly release notes:

```markdown
## What's New in v1.1.0

### ✨ New Features
- Added dark mode support
- New scanner for mail attachments

### 🐛 Bug Fixes
- Fixed icon alignment in scanner views
- Improved color contrast in light mode

### 🔧 Improvements
- Better performance on large file scans
- Updated dependencies for security

### 📚 Documentation
- Updated installation instructions
- Added troubleshooting guide
```

### Testing Before Release

```bash
# 1. Clean install and build
npm ci
npm run build

# 2. Test the app
npm start

# 3. Test packaging (local)
npm run package

# 4. Verify installers work
# Install and test on each platform
```

---

## Creating Pre-releases

For beta/alpha releases:

```bash
# Create a pre-release tag
git tag -a v1.1.0-beta.1 -m "Beta release 1.1.0-beta.1"
git push origin v1.1.0-beta.1
```

In GitHub Release settings, mark as "Pre-release".

---

## Automated Deployments

### On Every Push to Main
- Builds are created and tested
- Artifacts are saved for 7 days
- No release is created

### On Tag Push (v*.*.*)
- Full release is created
- Installers for all platforms
- GitHub Release with notes
- README auto-updated

---

## Platform-Specific Notes

### macOS
- Universal binaries (Intel + Apple Silicon)
- Code signing disabled by default (set `CSC_IDENTITY_AUTO_DISCOVERY: false`)
- Formats: `.dmg` and `.zip`

### Windows
- Targets: x64 and x86
- NSIS installer (customizable)
- Portable version included
- Formats: `.exe` and `.msi`

### Linux
- Universal AppImage
- Debian package (`.deb`)
- Red Hat package (`.rpm`)
- Works on most distributions

---

## Support

If you encounter issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Review GitHub Actions logs
3. Open an issue on GitHub
4. Contact EKD Digital support

---

## Quick Reference

```bash
# Create new release
./scripts/release.sh 1.0.1

# Check release status
git tag -l
git log --oneline -5

# View GitHub Actions
open https://github.com/ekddigital/ekdclean/actions

# View releases
open https://github.com/ekddigital/ekdclean/releases

# Test local build
npm run build
npm start

# Create installer locally
npm run package
```

---

**Built by EKD Digital** | **Superior to CleanMyMac** | **Cross-Platform Excellence**
