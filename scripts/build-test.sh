#!/bin/bash

# PixelCraft 构建测试脚本
# 用于测试各平台的安装包构建

set -e  # 遇到错误立即退出

echo "=========================================="
echo "PixelCraft 构建测试脚本"
echo "=========================================="

# 检查依赖
echo "检查依赖..."
if ! command -v npm &> /dev/null; then
    echo "错误: 未找到 npm"
    exit 1
fi

if ! command -v cargo &> /dev/null; then
    echo "错误: 未找到 cargo (Rust)"
    exit 1
fi

# 安装依赖
echo "安装依赖..."
npm install

# 构建前端
echo "构建前端..."
npm run build

# 检测当前平台
PLATFORM=$(uname -s)
ARCH=$(uname -m)

echo "当前平台: $PLATFORM $ARCH"

# 构建 Tauri 应用
echo "构建 Tauri 应用..."
npm run tauri build

# 检查构建结果
echo "检查构建结果..."

if [ "$PLATFORM" = "Linux" ]; then
    if [ -f "src-tauri/target/release/bundle/appimage/pixelcraft_*.AppImage" ]; then
        echo "✓ AppImage 构建成功"
    fi
    if [ -f "src-tauri/target/release/bundle/deb/pixelcraft_*.deb" ]; then
        echo "✓ DEB 包构建成功"
    fi
elif [ "$PLATFORM" = "Darwin" ]; then
    if [ -d "src-tauri/target/release/bundle/macos/PixelCraft.app" ]; then
        echo "✓ macOS 应用构建成功"
    fi
    if [ -f "src-tauri/target/release/bundle/dmg/pixelcraft_*.dmg" ]; then
        echo "✓ DMG 安装包构建成功"
    fi
elif [[ "$PLATFORM" == MINGW* ]] || [[ "$PLATFORM" == MSYS* ]] || [[ "$PLATFORM" == CYGWIN* ]]; then
    if [ -f "src-tauri/target/release/bundle/msi/pixelcraft_*.msi" ]; then
        echo "✓ MSI 安装包构建成功"
    fi
    if [ -d "src-tauri/target/release/bundle/nsis/pixelcraft_*.exe" ]; then
        echo "✓ NSIS 安装包构建成功"
    fi
fi

echo "=========================================="
echo "构建测试完成！"
echo "=========================================="
