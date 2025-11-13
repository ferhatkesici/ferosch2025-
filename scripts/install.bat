@echo off
echo Installing ferosch extension...
set ExtensionPath="%APPDATA%\Adobe\CEP\extensions\com.solid.layer.creator"
if not exist %ExtensionPath% mkdir %ExtensionPath%
xcopy /E /Y "." %ExtensionPath%
echo.
echo Installation complete!
echo.
echo Please restart After Effects to use the extension.
echo The extension will be available under Window > Extensions > ferosch
echo.
pause