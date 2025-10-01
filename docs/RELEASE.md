# Release Guide for EKD Clean

This document describes the release process for EKD Clean maintainers.

## Release Workflow

EKD Clean uses automated releases via GitHub Actions. Creating a new release is simple:

### 1. Prepare the Release

#### Update Version

```bash
# For a patch release (1.0.0 → 1.0.1)
npm version patch

# For a minor release (1.0.0 → 1.1.0)
npm version minor

# For a major release (1.0.0 → 2.0.0)
npm version major
```

This will:
- Update `package.json` version
- Create a git commit
- Create a git tag (e.g., `v1.0.1`)

#### Update CHANGELOG.md

Edit `CHANGELOG.md` to document changes:

```markdown
## [1.0.1] - 2024-XX-XX

### Added
- New feature X
- New feature Y

### Fixed
- Bug fix A
- Bug fix B

### Changed
- Improvement C
```

Commit the changes:

```bash
git add CHANGELOG.md
git commit -m "docs: update CHANGELOG for v1.0.1"
```

### 2. Push the Release

```bash
# Push commits and tags
git push origin main
git push origin --tags
```

### 3. Automated Build & Release

Once the tag is pushed, GitHub Actions will automatically:

1. **Trigger the Release Workflow** (`.github/workflows/release.yml`)
2. **Build for all platforms**:
   - Windows (x64, ia32)
   - macOS (universal: x64 + arm64)
   - Linux (AppImage, .deb, .rpm)
3. **Create a GitHub Release** with all artifacts
4. **Publish release notes** from CHANGELOG.md

### 4. Monitor the Release

1. Go to [Actions tab](https://github.com/ekddigital/ekdclean/actions)
2. Watch the "Release" workflow
3. Typical build time: 15-20 minutes for all platforms

### 5. Verify the Release

Once complete:

1. Check [Releases page](https://github.com/ekddigital/ekdclean/releases)
2. Verify all platform builds are present:
   - Windows: `.exe` and `.msi` files
   - macOS: `.dmg` and `.zip` files
   - Linux: `.AppImage`, `.deb`, and `.rpm` files
3. Test downloads on each platform
4. Verify installation and basic functionality

### 6. Announce the Release

- Update project README if needed
- Announce on social media / project website
- Notify users via appropriate channels

## Release Checklist

Before creating a release, ensure:

- [ ] All tests pass: `npm test`
- [ ] Code is linted: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] CHANGELOG.md is updated
- [ ] Version number follows [Semantic Versioning](https://semver.org/)
- [ ] No uncommitted changes
- [ ] On the correct branch (usually `main`)

## Manual Release (Fallback)

If automated releases fail, you can build manually:

### Build Locally

```bash
# Clean previous builds
npm run clean

# Install dependencies
npm ci
cd packages/renderer && npm ci && cd ../..

# Build for all platforms
npm run package:all
```

### Create GitHub Release

1. Go to [Releases](https://github.com/ekddigital/ekdclean/releases)
2. Click "Draft a new release"
3. Choose the tag (e.g., `v1.0.1`)
4. Title: "EKD Clean v1.0.1"
5. Description: Copy from CHANGELOG.md
6. Upload files from `release/` directory
7. Click "Publish release"

## Pre-releases

For beta versions:

```bash
# Create a pre-release tag
npm version prerelease --preid=beta
# Results in: 1.0.0-beta.0

# Push
git push origin main --tags
```

In the GitHub Release:
- Check "This is a pre-release"
- Title: "EKD Clean v1.0.0-beta.0 (Beta)"

## Hotfix Releases

For urgent fixes:

```bash
# Create hotfix branch from tag
git checkout -b hotfix/1.0.1 v1.0.0

# Make fixes
git commit -m "fix: critical bug"

# Version bump
npm version patch

# Merge back to main
git checkout main
git merge hotfix/1.0.1

# Push
git push origin main --tags
```

## Release Notes Template

```markdown
# EKD Clean v1.0.1

## 🎉 What's New

- Feature A: Description
- Feature B: Description

## 🐛 Bug Fixes

- Fixed issue X
- Fixed issue Y

## 🔧 Improvements

- Performance improvement A
- UX enhancement B

## 📦 Downloads

Download for your platform:

- **Windows**: [Setup.exe](link) | [Portable](link)
- **macOS**: [DMG](link) | [ZIP](link)
- **Linux**: [AppImage](link) | [DEB](link) | [RPM](link)

## 📖 Documentation

- [Installation Guide](https://github.com/ekddigital/ekdclean/blob/main/docs/INSTALLATION.md)
- [Changelog](https://github.com/ekddigital/ekdclean/blob/main/CHANGELOG.md)

## 💬 Feedback

Found a bug? [Report it here](https://github.com/ekddigital/ekdclean/issues/new?template=bug_report.md)

Have a feature request? [Let us know](https://github.com/ekddigital/ekdclean/issues/new?template=feature_request.md)

---

**Full Changelog**: https://github.com/ekddigital/ekdclean/compare/v1.0.0...v1.0.1
```

## Versioning Strategy

Follow [Semantic Versioning](https://semver.org/):

- **Major (X.0.0)**: Breaking changes
- **Minor (1.X.0)**: New features (backward compatible)
- **Patch (1.0.X)**: Bug fixes (backward compatible)

Examples:
- `1.0.0` → `1.0.1`: Bug fixes
- `1.0.0` → `1.1.0`: New features
- `1.0.0` → `2.0.0`: Breaking changes

## Release Frequency

Recommended schedule:
- **Patch releases**: As needed for critical bugs
- **Minor releases**: Monthly or bi-monthly
- **Major releases**: When significant changes accumulate

## Code Signing

### macOS

```bash
# Set signing credentials
export CSC_LINK=/path/to/cert.p12
export CSC_KEY_PASSWORD=your_password

# Build with signing
npm run package:mac
```

### Windows

```bash
# Set signing credentials
export CSC_LINK=/path/to/cert.pfx
export CSC_KEY_PASSWORD=your_password

# Build with signing
npm run package:win
```

For GitHub Actions, add secrets:
- `CSC_LINK` (base64 encoded certificate)
- `CSC_KEY_PASSWORD`

## Troubleshooting

### Release Workflow Fails

1. Check [Actions logs](https://github.com/ekddigital/ekdclean/actions)
2. Common issues:
   - Missing dependencies
   - Code signing failures
   - Build errors

### Assets Not Uploaded

- Verify release files exist in `release/` directory
- Check `release.yml` file patterns
- Ensure `GITHUB_TOKEN` has correct permissions

### Build Fails on Specific Platform

- Test build locally on that platform
- Check platform-specific dependencies
- Review electron-builder configuration

## Post-Release Tasks

After a successful release:

1. [ ] Update main README if needed
2. [ ] Close related issues/PRs
3. [ ] Update documentation
4. [ ] Monitor for bug reports
5. [ ] Plan next release

## Resources

- [Semantic Versioning](https://semver.org/)
- [GitHub Releases Documentation](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [electron-builder Publishing](https://www.electron.build/configuration/publish)
- [Keep a Changelog](https://keepachangelog.com/)

---

**Built with ❤️ by [EKD Digital](https://github.com/ekddigital)**
