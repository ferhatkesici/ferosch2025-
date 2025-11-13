// Crop composition functionality
function cropComp() {
    if (!(app.project.activeItem && app.project.activeItem instanceof CompItem)) {
        return "No composition selected";
    }

    var mainComp = app.project.activeItem;
    
    if (mainComp.selectedLayers.length === 0) {
        return "Please select a precomp layer";
    }
    
    var selectedLayer = mainComp.selectedLayers[0];
    
    if (!(selectedLayer.source instanceof CompItem)) {
        return "Please select a precomp layer";
    }
    
    app.beginUndoGroup("Crop Composition");
    
    try {
        var precomp = selectedLayer.source;
        
        // Precomp'un orijinal boyutlarını ve pozisyonunu kaydet
        var originalWidth = precomp.width;
        var originalHeight = precomp.height;
        var originalPrecompPos = selectedLayer.transform.position.value;
        var originalScale = selectedLayer.transform.scale.value;
        var originalAnchor = selectedLayer.transform.anchorPoint.value;
        
        // Sınırları bulmak için değişkenler
        var bounds = {
            left: Number.MAX_VALUE,
            right: -Number.MAX_VALUE,
            top: Number.MAX_VALUE,
            bottom: -Number.MAX_VALUE
        };
        
        // Önce mask var mı kontrol et
        if (selectedLayer.mask && selectedLayer.mask.numProperties > 0) {
            for (var i = 1; i <= selectedLayer.mask.numProperties; i++) {
                var mask = selectedLayer.mask(i);
                if (mask.enabled) {
                    var maskPath = mask.property("ADBE Mask Shape").value;
                    var vertices = maskPath.vertices;
                    
                    // Scale faktörlerini hesapla
                    var scaleX = originalScale[0] / 100;
                    var scaleY = originalScale[1] / 100;
                    
                    // Her vertex için
                    for (var j = 0; j < vertices.length; j++) {
                        var x = vertices[j][0];
                        var y = vertices[j][1];
                        
                        // Scale'i uygula
                        x = x / scaleX;
                        y = y / scaleY;
                        
                        // Anchor point'e göre düzelt
                        x += originalWidth / 2;
                        y += originalHeight / 2;
                        
                        // Sınırları güncelle
                        bounds.left = Math.min(bounds.left, x);
                        bounds.right = Math.max(bounds.right, x);
                        bounds.top = Math.min(bounds.top, y);
                        bounds.bottom = Math.max(bounds.bottom, y);
                    }
                }
            }
            
            // Sınırları precomp içinde tut
            bounds.left = Math.max(0, Math.floor(bounds.left));
            bounds.right = Math.min(originalWidth, Math.ceil(bounds.right));
            bounds.top = Math.max(0, Math.floor(bounds.top));
            bounds.bottom = Math.min(originalHeight, Math.ceil(bounds.bottom));
            
        } else {
            // Normal layer sınırlarını kullan
            for (var i = 1; i <= precomp.numLayers; i++) {
                var layer = precomp.layer(i);
                if (!layer.enabled) continue;
                
                var rect = layer.sourceRectAtTime(precomp.time, false);
                var pos = layer.transform.position.value;
                var anchor = layer.transform.anchorPoint.value;
                
                bounds.left = Math.min(bounds.left, pos[0] - anchor[0] + rect.left);
                bounds.right = Math.max(bounds.right, pos[0] - anchor[0] + rect.left + rect.width);
                bounds.top = Math.min(bounds.top, pos[1] - anchor[1] + rect.top);
                bounds.bottom = Math.max(bounds.bottom, pos[1] - anchor[1] + rect.top + rect.height);
            }
        }
        
        // Yeni boyutları hesapla
        var newWidth = Math.ceil(bounds.right - bounds.left);
        var newHeight = Math.ceil(bounds.bottom - bounds.top);
        
        if (newWidth <= 0 || newHeight <= 0) {
            return "Invalid crop dimensions";
        }
        
        // Precomp boyutlarını güncelle
        precomp.width = newWidth;
        precomp.height = newHeight;
        
        // İçerideki layerların pozisyonlarını güncelle
        for (var i = 1; i <= precomp.numLayers; i++) {
            var layer = precomp.layer(i);
            var pos = layer.transform.position.value;
            
            if (layer.threeDLayer) {
                layer.transform.position.setValue([
                    pos[0] - bounds.left,
                    pos[1] - bounds.top,
                    pos[2]
                ]);
            } else {
                layer.transform.position.setValue([
                    pos[0] - bounds.left,
                    pos[1] - bounds.top
                ]);
            }
        }
        
        // Ana comp'taki precomp layer'ının pozisyonunu düzelt
        var offsetX = (bounds.left + bounds.right) / 2 - originalWidth / 2;
        var offsetY = (bounds.top + bounds.bottom) / 2 - originalHeight / 2;
        
        if (selectedLayer.threeDLayer) {
            selectedLayer.transform.position.setValue([
                originalPrecompPos[0] + offsetX,
                originalPrecompPos[1] + offsetY,
                originalPrecompPos[2]
            ]);
        } else {
            selectedLayer.transform.position.setValue([
                originalPrecompPos[0] + offsetX,
                originalPrecompPos[1] + offsetY
            ]);
        }
        
        return "Composition cropped successfully";
        
    } catch (err) {
        return "Error: " + err.toString();
    } finally {
        app.endUndoGroup();
    }
}