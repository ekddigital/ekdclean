#!/bin/bash

# EKD Clean - Development Start Script
# Built by EKD Digital

echo "🚀 Starting EKD Clean Development Environment..."
echo "=================================================="

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist packages/*/dist

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build main process
echo "⚡ Building main process..."
cd packages/main && npx tsc && cd ../..

# Start Electron
echo "🖥️  Starting EKD Clean..."
npm run start
