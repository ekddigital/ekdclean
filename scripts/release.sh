#!/bin/bash

# EKD Clean Release Script
# Built by EKD Digital

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   EKD Clean - Release Script          ║${NC}"
echo -e "${BLUE}║   Built by EKD Digital                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if version is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Version number required${NC}"
    echo -e "${YELLOW}Usage: ./release.sh <version>${NC}"
    echo -e "${YELLOW}Example: ./release.sh 1.0.1${NC}"
    exit 1
fi

VERSION=$1
TAG="v${VERSION}"

# Validate version format
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${RED}❌ Error: Invalid version format${NC}"
    echo -e "${YELLOW}Version should be in format: X.Y.Z (e.g., 1.0.1)${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Release Information${NC}"
echo -e "   Version: ${GREEN}${VERSION}${NC}"
echo -e "   Tag: ${GREEN}${TAG}${NC}"
echo ""

# Check if tag already exists
if git rev-parse "$TAG" >/dev/null 2>&1; then
    echo -e "${RED}❌ Error: Tag ${TAG} already exists${NC}"
    echo -e "${YELLOW}Please use a different version number or delete the existing tag:${NC}"
    echo -e "${YELLOW}   git tag -d ${TAG}${NC}"
    echo -e "${YELLOW}   git push origin :refs/tags/${TAG}${NC}"
    exit 1
fi

# Confirm release
echo -e "${YELLOW}⚠️  This will create a new release: ${TAG}${NC}"
read -p "Do you want to continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Release cancelled${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔍 Pre-release checks...${NC}"

# Check if on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Warning: You are not on main branch (current: ${CURRENT_BRANCH})${NC}"
    read -p "Do you want to continue anyway? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Release cancelled${NC}"
        exit 1
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}❌ Error: You have uncommitted changes${NC}"
    echo -e "${YELLOW}Please commit or stash your changes before creating a release${NC}"
    git status --short
    exit 1
fi

echo -e "${GREEN}✓ All checks passed${NC}"
echo ""

# Update package.json version
echo -e "${BLUE}📝 Updating package.json version...${NC}"
npm version $VERSION --no-git-tag-version
echo -e "${GREEN}✓ package.json updated${NC}"

# Update README download links
echo -e "${BLUE}📝 Updating README download links...${NC}"
sed -i.bak "s|download/v[0-9]*\.[0-9]*\.[0-9]*|download/${TAG}|g" README.md
sed -i.bak "s|Latest Release: v[0-9]*\.[0-9]*\.[0-9]*|Latest Release: ${TAG}|g" README.md
rm -f README.md.bak
echo -e "${GREEN}✓ README updated${NC}"

# Commit version changes
echo -e "${BLUE}📦 Committing version changes...${NC}"
git add package.json package-lock.json README.md
git commit -m "chore: bump version to ${VERSION}"
echo -e "${GREEN}✓ Changes committed${NC}"

# Create and push tag
echo -e "${BLUE}🏷️  Creating git tag...${NC}"
git tag -a "$TAG" -m "Release ${TAG}

## What's New in ${TAG}

- Improved system cleaning performance
- Enhanced UI/UX with smoother animations
- Bug fixes and stability improvements
- Updated dependencies for better security

## Downloads

Download EKD Clean for your platform:
- macOS: https://github.com/ekddigital/ekdclean/releases/download/${TAG}/EKD-Clean-${VERSION}-mac.dmg
- Windows: https://github.com/ekddigital/ekdclean/releases/download/${TAG}/EKD-Clean-${VERSION}-win-x64-Setup.exe
- Linux: https://github.com/ekddigital/ekdclean/releases/download/${TAG}/EKD-Clean-${VERSION}.AppImage

Built by EKD Digital - Superior to CleanMyMac"

echo -e "${GREEN}✓ Tag created${NC}"

echo ""
echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
git push origin main
git push origin "$TAG"
echo -e "${GREEN}✓ Pushed to GitHub${NC}"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Release ${TAG} Created Successfully! ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📦 GitHub Actions will now:${NC}"
echo -e "   1. Build EKD Clean for all platforms"
echo -e "   2. Create release with installers"
echo -e "   3. Update download links automatically"
echo ""
echo -e "${BLUE}🔗 Monitor the release progress:${NC}"
echo -e "   https://github.com/ekddigital/ekdclean/actions"
echo ""
echo -e "${BLUE}🎉 Once complete, your release will be available at:${NC}"
echo -e "   https://github.com/ekddigital/ekdclean/releases/tag/${TAG}"
echo ""
