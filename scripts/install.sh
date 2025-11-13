#!/bin/bash
echo "Installing ferosch extension..."

# macOS installation path
EXTENSION_PATH="$HOME/Library/Application Support/Adobe/CEP/extensions/com.solid.layer.creator"

# Create directory if it doesn't exist
mkdir -p "$EXTENSION_PATH"

# Copy all files to the extension directory
cp -R ./* "$EXTENSION_PATH"

echo ""
echo "Installation complete!"
echo ""
echo "Please restart After Effects to use the extension."
echo "The extension will be available under Window > Extensions > ferosch"
echo ""
read -p "Press Enter to continue..."