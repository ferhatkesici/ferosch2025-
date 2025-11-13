#!/bin/bash
echo "Creating self-signed certificate..."
./ZXPSignCmd -selfSignedCert US Istanbul "ferosch" "ferosch" "ferosch" 1460 certificate.p12 "ferosch"

echo "Signing and creating ZXP package..."
./ZXPSignCmd -sign "package" "dist/ferosch.zxp" certificate.p12 "ferosch" -tsa http://timestamp.digicert.com/

echo "Cleaning up..."
rm certificate.p12

echo "Done! ZXP package created at dist/ferosch.zxp"
read -p "Press Enter to continue..."