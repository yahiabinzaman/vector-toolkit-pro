#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
TARGET_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions/com.colorlab.vectortoolkit"

echo "=========================================================="
echo " Vector Toolkit Pro - 1-Click Installer for Mac          "
echo " Developed by Yahia Bin Zaman                           "
echo "=========================================================="
echo ""

defaults write com.adobe.CSXS.9 PlayerDebugMode 1
defaults write com.adobe.CSXS.10 PlayerDebugMode 1
defaults write com.adobe.CSXS.11 PlayerDebugMode 1
defaults write com.adobe.CSXS.12 PlayerDebugMode 1
defaults write com.adobe.CSXS.13 PlayerDebugMode 1
defaults write com.adobe.CSXS.14 PlayerDebugMode 1
defaults write com.adobe.CSXS.15 PlayerDebugMode 1
defaults write com.adobe.CSXS.16 PlayerDebugMode 1

mkdir -p "$HOME/Library/Application Support/Adobe/CEP/extensions"
rm -rf "$TARGET_DIR"

cp -R "$DIR" "$TARGET_DIR"

echo "=========================================================="
echo " [SUCCESS] Vector Toolkit Pro installed successfully!"
echo " Restart Adobe Illustrator and open:"
echo " Window > Extensions > Vector Toolkit Pro"
echo "=========================================================="
read -p "Press Enter to exit..."
