# PixelCraft 构建测试脚本 (PowerShell)
# 用于测试 Windows 平台的安装包构建

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "PixelCraft 构建测试脚本" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 检查依赖
Write-Host "检查依赖..." -ForegroundColor Yellow
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "错误: 未找到 npm" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Host "错误: 未找到 cargo (Rust)" -ForegroundColor Red
    exit 1
}

# 安装依赖
Write-Host "安装依赖..." -ForegroundColor Yellow
npm install

# 构建前端
Write-Host "构建前端..." -ForegroundColor Yellow
npm run build

# 构建 Tauri 应用
Write-Host "构建 Tauri 应用..." -ForegroundColor Yellow
npm run tauri build

# 检查构建结果
Write-Host "检查构建结果..." -ForegroundColor Yellow

$msiFiles = Get-ChildItem -Path "src-tauri\target\release\bundle\msi\*.msi" -ErrorAction SilentlyContinue
$nsisFiles = Get-ChildItem -Path "src-tauri\target\release\bundle\nsis\*.exe" -ErrorAction SilentlyContinue

if ($msiFiles) {
    Write-Host "MSI 安装包构建成功: $($msiFiles[0].Name)" -ForegroundColor Green
}

if ($nsisFiles) {
    Write-Host "NSIS 安装包构建成功: $($nsisFiles[0].Name)" -ForegroundColor Green
}

if (-not $msiFiles -and -not $nsisFiles) {
    Write-Host "警告: 未找到安装包文件" -ForegroundColor Yellow
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "构建测试完成！" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
