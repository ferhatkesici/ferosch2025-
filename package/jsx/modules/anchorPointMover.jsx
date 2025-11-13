// Anchor Point Mover fonksiyonları

function moveAnchorPoint(xPercent, yPercent) {
    if (!(app.project.activeItem && app.project.activeItem instanceof CompItem)) {
        return "No composition selected";
    }

    var comp = app.project.activeItem;
    if (comp.selectedLayers.length === 0) {
        return "No layer selected";
    }

    app.beginUndoGroup("Move Anchor Point");
    
    try {
        for (var i = 0; i < comp.selectedLayers.length; i++) {
            var layer = comp.selectedLayers[i];
            
            // Katmanın boyutlarını al
            var width, height;
            
            if (layer instanceof ShapeLayer || layer instanceof TextLayer) {
                // Shape ve Text katmanları için sourceRectAtTime kullan
                var rect = layer.sourceRectAtTime(comp.time, false);
                width = rect.width;
                height = rect.height;
                
                // Anchor point'i hesapla (rect'in sol üst köşesine göre)
                var newX = rect.left + (width * xPercent / 100);
                var newY = rect.top + (height * yPercent / 100);
                
                // Anchor point'i ayarla
                layer.transform.anchorPoint.setValue([newX, newY]);
            } 
            else if (layer.source) {
                // Diğer katmanlar için source boyutlarını kullan
                width = layer.source.width;
                height = layer.source.height;
                
                // Anchor point'i hesapla
                var newX = width * xPercent / 100;
                var newY = height * yPercent / 100;
                
                // 3D katmanı kontrolü
                if (layer.threeDLayer) {
                    layer.transform.anchorPoint.setValue([newX, newY, 0]);
                } else {
                    layer.transform.anchorPoint.setValue([newX, newY]);
                }
            }
        }
        
        return "Anchor point moved successfully";
    } catch (error) {
        return "Error: " + error.toString();
    } finally {
        app.endUndoGroup();
    }
}

function resetAnchorPoint() {
    if (!(app.project.activeItem && app.project.activeItem instanceof CompItem)) {
        return "No composition selected";
    }

    var comp = app.project.activeItem;
    if (comp.selectedLayers.length === 0) {
        return "No layer selected";
    }

    app.beginUndoGroup("Reset Anchor Point");
    
    try {
        for (var i = 0; i < comp.selectedLayers.length; i++) {
            var layer = comp.selectedLayers[i];
            
            // Katmanın boyutlarını al
            var width, height;
            
            if (layer instanceof ShapeLayer || layer instanceof TextLayer) {
                // Shape ve Text katmanları için sourceRectAtTime kullan
                var rect = layer.sourceRectAtTime(comp.time, false);
                width = rect.width;
                height = rect.height;
                
                // Anchor point'i hesapla (rect'in sol üst köşesine göre)
                var centerX = rect.left + (width / 2);
                var centerY = rect.top + (height / 2);
                
                // Anchor point'i ayarla
                layer.transform.anchorPoint.setValue([centerX, centerY]);
            } 
            else if (layer.source) {
                // Diğer katmanlar için source boyutlarını kullan
                width = layer.source.width;
                height = layer.source.height;
                
                // Anchor point'i hesapla
                var centerX = width / 2;
                var centerY = height / 2;
                
                // 3D katmanı kontrolü
                if (layer.threeDLayer) {
                    layer.transform.anchorPoint.setValue([centerX, centerY, 0]);
                } else {
                    layer.transform.anchorPoint.setValue([centerX, centerY]);
                }
            }
        }
        
        return "Anchor point reset to center";
    } catch (error) {
        return "Error: " + error.toString();
    } finally {
        app.endUndoGroup();
    }
}