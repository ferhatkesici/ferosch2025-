# ferosch Installation Guide

## Requirements
- Adobe After Effects 2022 or newer

## Installation Methods

### Method 1: Using ZXP Installer (Recommended)

1. Download a ZXP installer like [Anastasiy's Extension Manager](https://install.anastasiy.com/) or [ZXP Installer](https://zxpinstaller.com/)
2. Open the ZXP installer
3. Drag and drop the `ferosch.zxp` file into the installer
4. Follow the prompts to complete installation
5. Restart After Effects

### Method 2: Manual Installation

#### Windows:
1. Extract the contents of the ZIP file
2. Run the `install.bat` script by double-clicking it
3. Restart After Effects

#### macOS:
1. Extract the contents of the ZIP file
2. Open Terminal
3. Navigate to the extracted folder: `cd /path/to/extracted/folder`
4. Make the install script executable: `chmod +x install.sh`
5. Run the install script: `./install.sh`
6. Restart After Effects

### Method 3: Manual Installation (Alternative)

If the scripts don't work, you can manually install the extension:

#### Windows:
1. Extract the contents of the ZIP file
2. Copy all files to: `%APPDATA%\Adobe\CEP\extensions\com.solid.layer.creator\`
3. Restart After Effects

#### macOS:
1. Extract the contents of the ZIP file
2. Copy all files to: `~/Library/Application Support/Adobe/CEP/extensions/com.solid.layer.creator/`
3. Restart After Effects

## Troubleshooting

If the extension doesn't appear in After Effects:

1. Make sure you're using After Effects 2022 or newer
2. Check that the extension is properly installed in the correct location
3. Try enabling unsigned extensions:
   - Create a file named `.debug` in the extension folder with the following content:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <ExtensionList>
       <Extension Id="com.solid.layer.creator.panel">
           <HostList>
               <Host Name="AEFT" Port="8088"/>
           </HostList>
       </Extension>
   </ExtensionList>
   ```
4. Restart After Effects

## Accessing the Extension

After installation, you can access the extension in After Effects:

1. Open After Effects
2. Go to Window > Extensions > ferosch