#!/bin/bash
# ==============================================================================
# ColorLab Forma Setup Pro - 1-Click Installer (macOS)
# Developed by Yahia Bin Zaman
# ==============================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
TARGET_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions/com.colorlab.formasetup"

echo "=========================================================="
echo " ColorLab Forma Setup Pro - 1-Click Installer for Mac    "
echo " Developed by Yahia Bin Zaman                           "
echo "=========================================================="
echo ""

# Enable CEP PlayerDebugMode for all CSXS versions
for ver in 9 10 11 12 13 14 15 16; do
    defaults write com.adobe.CSXS.$ver PlayerDebugMode 1 2>/dev/null || true
done

# Ensure CEP directory exists
mkdir -p "$HOME/Library/Application Support/Adobe/CEP/extensions"
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

# Copy all extension files (including hidden dotfiles)
shopt -s dotglob
cp -R "$DIR/"* "$TARGET_DIR/" 2>/dev/null || true
shopt -u dotglob

# Copy standalone JSX script to Illustrator Presets if accessible
if [ -f "$DIR/Forma_Setup_Pro_QuickRun.jsx" ]; then
    for app_dir in /Applications/Adobe\ Illustrator*; do
        if [ -d "$app_dir" ]; then
            for script_dir in "$app_dir"/Presets.localized/*/Scripts "$app_dir"/Presets/*/Scripts; do
                if [ -d "$script_dir" ]; then
                    cp -f "$DIR/Forma_Setup_Pro_QuickRun.jsx" "$script_dir/" 2>/dev/null || true
                fi
            done
        fi
    done
fi

echo "=========================================================="
echo " [SUCCESS] ColorLab Forma Setup Pro installed successfully!"
echo " Restart Adobe Illustrator and open:"
echo " Window > Extensions > ColorLab Forma Setup Pro"
echo " (Or File > Scripts > Forma_Setup_Pro_QuickRun)"
echo "=========================================================="

# Show native macOS notification
osascript -e 'display notification "Forma Setup Pro extension installed! Restart Illustrator to use." with title "ColorLab Forma Setup Pro"' 2>/dev/null || true

read -p "Press Enter to exit..."
