# PixelCraft 构建指南

本文档介绍如何构建 PixelCraft 桌面应用程序的安装包。

## 前置要求

### 通用要求
- Node.js 18+ 和 npm
- Rust 1.70+ (通过 [rustup](https://rustup.rs/) 安装)
- Tauri CLI: `npm install -g @tauri-apps/cli@latest`

### Windows 构建要求
- Microsoft Visual C++ Build Tools 或 Visual Studio 2019+
- Windows SDK

### macOS 构建要求
- Xcode Command Line Tools: `xcode-select --install`
- macOS 10.13+

### Linux 构建要求
- `libwebkit2gtk-4.0-dev`
- `build-essential`
- `curl`
- `wget`
- `libssl-dev`
- `libgtk-3-dev`
- `libayatana-appindicator3-dev`
- `librsvg2-dev`

安装依赖（Ubuntu/Debian）:
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

## 开发模式

运行开发服务器：
```bash
npm run tauri dev
```

## 构建安装包

### 构建所有平台
```bash
npm run tauri build
```

### 构建特定平台

#### Windows
```bash
npm run tauri build -- --target x86_64-pc-windows-msvc
```

#### macOS
```bash
npm run tauri build -- --target x86_64-apple-darwin
# 或 Apple Silicon
npm run tauri build -- --target aarch64-apple-darwin
```

#### Linux
```bash
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

## 输出位置

构建完成后，安装包位于：
- **Windows**: `src-tauri/target/release/bundle/msi/` 或 `src-tauri/target/release/bundle/nsis/`
- **macOS**: `src-tauri/target/release/bundle/macos/`
- **Linux**: `src-tauri/target/release/bundle/appimage/` 或 `src-tauri/target/release/bundle/deb/`

## 代码签名（可选）

### Windows
需要代码签名证书。在 `tauri.conf.json` 中配置 `bundle.windows.certificateThumbprint`。

### macOS
需要 Apple Developer 证书。配置 `bundle.macOS.signingIdentity`。

## 故障排除

### Windows
- 如果遇到链接错误，确保安装了 Visual C++ Build Tools
- 如果遇到权限问题，以管理员身份运行

### macOS
- 如果遇到代码签名问题，检查证书配置
- 如果遇到 Gatekeeper 问题，需要公证（notarization）

### Linux
- 如果遇到 GTK 相关错误，确保安装了所有依赖
- 如果遇到 WebKit 错误，更新系统包

## 性能优化

构建发布版本时，确保：
1. 使用 `npm run build` 构建优化的前端代码
2. Rust 代码使用 `--release` 标志（Tauri 自动处理）
3. 检查 `tauri.conf.json` 中的优化设置

## 版本管理

更新版本号：
1. `package.json` 中的 `version`
2. `src-tauri/Cargo.toml` 中的 `version`
3. `src-tauri/tauri.conf.json` 中的 `version`
