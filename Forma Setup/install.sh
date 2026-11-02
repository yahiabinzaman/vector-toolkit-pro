#!/usr/bin/env bash
# ==============================================================================
# ColorLab Forma Setup Pro - Automated 1-Line Installer for macOS
# Developed by Yahia Bin Zaman | https://github.com/yahiabinzaman
# ==============================================================================

set -e

echo ""
echo -e "\033[1;36m==========================================================\033[0m"
echo -e "\033[1;32m ColorLab Forma Setup Pro - Automated Installer (macOS)   \033[0m"
echo -e "\033[1;33m Developed by Yahia Bin Zaman                             \033[0m"
echo -e "\033[1;36m==========================================================\033[0m"
echo ""

# 1. Enable PlayerDebugMode in macOS defaults for Adobe CSXS
echo -e "\033[0;37m[1/4] Configuring Adobe CEP PlayerDebugMode...\033[0m"
for ver in 9 10 11 12 13 14 15 16 17 18 19 20; do
    defaults write com.adobe.CSXS.$ver PlayerDebugMode 1 2>/dev/null || true
done

# 2. Target Directory
TARGET_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions/com.colorlab.formasetup"
mkdir -p "$HOME/Library/Application Support/Adobe/CEP/extensions"

# 3. Check if running locally or via pipe/web
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]:-$0}" )" >/dev/null 2>&1 && pwd )"
if [ -f "$SCRIPT_DIR/CSXS/manifest.xml" ]; then
    echo -e "\033[0;37m[2/4] Installing from local source files...\033[0m"
    rm -rf "$TARGET_DIR"
    mkdir -p "$TARGET_DIR"
    shopt -s dotglob 2>/dev/null || true
    cp -R "$SCRIPT_DIR/"* "$TARGET_DIR/" 2>/dev/null || true
else
    echo -e "\033[1;36m[2/4] Downloading latest Forma Setup from GitHub...\033[0m"
    TEMP_DIR=$(mktemp -d)
    curl -fsSL "https://github.com/yahiabinzaman/Forma-Setup/archive/refs/heads/main.zip" -o "$TEMP_DIR/forma.zip"
    echo -e "\033[0;37m[3/4] Extracting and deploying extension...\033[0m"
    unzip -q -o "$TEMP_DIR/forma.zip" -d "$TEMP_DIR"
    rm -rf "$TARGET_DIR"
    mkdir -p "$TARGET_DIR"
    EXTRACTED_FOLDER=$(find "$TEMP_DIR" -mindepth 1 -maxdepth 1 -type d | head -n 1)
    if [ -d "$EXTRACTED_FOLDER" ]; then
        cp -R "$EXTRACTED_FOLDER/"* "$TARGET_DIR/" 2>/dev/null || true
        cp -R "$EXTRACTED_FOLDER/".* "$TARGET_DIR/" 2>/dev/null || true
    fi
    rm -rf "$TEMP_DIR"
fi

# 4. Copy standalone JSX script to Illustrator Presets
echo -e "\033[0;37m[4/4] Registering standalone menu scripts...\033[0m"
if [ -f "$TARGET_DIR/Forma_Setup_Pro_QuickRun.jsx" ]; then
    for app_dir in /Applications/Adobe\ Illustrator*; do
        if [ -d "$app_dir" ]; then
            for s_dir in "$app_dir"/Presets.localized/*/Scripts "$app_dir"/Presets/*/Scripts; do
                if [ -d "$s_dir" ]; then
                    cp -f "$TARGET_DIR/Forma_Setup_Pro_QuickRun.jsx" "$s_dir/" 2>/dev/null || true
                fi
            done
        fi
    done
fi

echo ""
echo -e "\033[1;32m==========================================================\033[0m"
echo -e "\033[1;32m [SUCCESS] ColorLab Forma Setup Pro installed successfully!\033[0m"
echo -e "\033[1;33m Restart Adobe Illustrator and open:\033[0m"
echo -e "\033[1;37m Window > Extensions > ColorLab Forma Setup Pro\033[0m"
echo -e "\033[1;37m (Or File > Scripts > Forma_Setup_Pro_QuickRun)\033[0m"
echo -e "\033[1;32m==========================================================\033[0m"
echo ""

# Native macOS notification
osascript -e 'display notification "Forma Setup Pro extension installed! Restart Illustrator to use." with title "ColorLab Forma Setup Pro"' 2>/dev/null || true

