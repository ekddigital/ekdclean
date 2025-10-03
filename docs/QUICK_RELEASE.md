# 🚀 Quick Start - GitHub Workflow for EKD Clean

**TL;DR**: Push to `main` = auto build & test. Push a tag = auto release with installers.

---

## For Regular Development

### 1. Make changes and commit
```bash
git add .
git commit -m "feat: your awesome feature"
git push origin main
```

**What happens**: GitHub Actions will automatically build and test on all platforms (Windows, macOS, Linux).

---

## For Creating a Release

### Option 1: Use the Automated Script (Recommended)

```bash
./scripts/release.sh 1.0.1
```

That's it! 🎉

### Option 2: Manual Release

```bash
# 1. Update version
npm version 1.0.1 --no-git-tag-version

# 2. Commit
git add package.json package-lock.json
git commit -m "chore: bump version to 1.0.1"
git push origin main

# 3. Create and push tag
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

**What happens**: 
- ✅ Builds for macOS (Intel & ARM)
- ✅ Builds for Windows (x64 & x86)
- ✅ Builds for Linux (AppImage, deb, rpm)
- ✅ Creates GitHub Release with all installers
- ✅ Auto-updates download links in README

---

## Monitoring Builds

Watch the magic happen:
```
https://github.com/ekddigital/ekdclean/actions
```

---

## Download Links

After release completes, installers are available at:
```
https://github.com/ekddigital/ekdclean/releases/latest
```

Direct links:
- **macOS**: `...releases/download/v1.0.1/EKD-Clean-1.0.1-mac.dmg`
- **Windows**: `...releases/download/v1.0.1/EKD-Clean-1.0.1-win-x64-Setup.exe`
- **Linux**: `...releases/download/v1.0.1/EKD-Clean-1.0.1.AppImage`

---

## Version Numbering

- **1.0.1** → Bug fix
- **1.1.0** → New feature
- **2.0.0** → Breaking change

---

**Need more details?** See [RELEASE_GUIDE.md](./RELEASE_GUIDE.md)
