// Layer oluşturma fonksiyonları

function createSolidLayer() {
    if (!(app.project.activeItem && app.project.activeItem instanceof CompItem)) {
        return "No composition selected";
    }

    app.beginUndoGroup("Create Solid Layer");
    try {
        var comp = app.project.activeItem;
        var selectedLayers = comp.selectedLayers;
        var inPoint = 0;
        var outPoint = comp.duration;

        // Eğer seçili layer varsa, onun in/out noktalarını kullan
        if (selectedLayers.length > 0) {
            inPoint = selectedLayers[0].inPoint;
            outPoint = selectedLayers[0].outPoint;
        }

        var solid = comp.layers.addSolid([0,0,0], "Solid Layer", comp.width, comp.height, 1);
        solid.label = 1; // Red label
        solid.inPoint = inPoint;
        solid.outPoint = outPoint;
        return "Solid layer created";
    } catch (error) {
        return "Error creating solid layer";
    } finally {
        app.endUndoGroup();
    }
}

function createAdjustmentLayer() {
    if (!(app.project.activeItem && app.project.activeItem instanceof CompItem)) {
        return "No composition selected";
    }

    app.beginUndoGroup("Create Adjustment Layer");
    try {
        var comp = app.project.activeItem;
        var selectedLayers = comp.selectedLayers;
        var inPoint = 0;
        var outPoint = comp.duration;

        // Eğer seçili layer varsa, onun in/out noktalarını kullan
        if (selectedLayers.length > 0) {
            inPoint = selectedLayers[0].inPoint;
            outPoint = selectedLayers[0].outPoint;
        }

        var adj = comp.layers.addSolid([1,1,1], "Adjustment Layer", comp.width, comp.height, 1);
        adj.adjustmentLayer = true;
        adj.label = 13; // Purple label
        adj.inPoint = inPoint;
        adj.outPoint = outPoint;
        return "Adjustment layer created";
    } catch (error) {
        return "Error creating adjustment layer";
    } finally {
        app.endUndoGroup();
    }
}

function createNullLayer() {
    if (!(app.project.activeItem && app.project.activeItem instanceof CompItem)) {
        return "No composition selected";
    }

    app.beginUndoGroup("Create Null Layer");
    try {
        var comp = app.project.activeItem;
        var selectedLayers = comp.selectedLayers;
        
        // Eğer seçili layer yoksa, normal null oluştur
        if (selectedLayers.length === 0) {
            var nullLayer = comp.layers.addNull();
            nullLayer.name = "Null Controller";
            nullLayer.label = 9; // Green label
            return "Null layer created";
        }

        // En üstteki layer'ı ve zaman aralığını bul
        var topMostLayer = selectedLayers[0];
        var bottomMostLayer = selectedLayers[0];
        var inPoint = selectedLayers[0].inPoint;
        var outPoint = selectedLayers[0].outPoint;
        
        // Seçili layerların en üst ve en alttakini bul
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            if (layer.index < topMostLayer.index) {
                topMostLayer = layer;
            }
            if (layer.index > bottomMostLayer.index) {
                bottomMostLayer = layer;
            }
            inPoint = Math.min(inPoint, layer.inPoint);
            outPoint = Math.max(outPoint, layer.outPoint);
        }
        
        // Null layer oluştur
        var nullLayer = comp.layers.addNull();
        nullLayer.name = "Controller_" + bottomMostLayer.name;
        nullLayer.label = 9; // Green label
        
        // Null'un zamanlamasını ayarla
        nullLayer.startTime = inPoint;
        nullLayer.outPoint = outPoint;
        
        // Ortalama pozisyon ve rotasyon değerlerini hesapla
        var avgPosition = [0, 0, 0];
        var avgRotation = [0, 0, 0];
        var needs3D = false;
        var rotationCount = 0;
        
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            var pos = layer.transform.position.value;
            
            // 3D layer kontrolü
            if (layer.threeDLayer) {
                needs3D = true;
                avgPosition[0] += pos[0];
                avgPosition[1] += pos[1];
                avgPosition[2] += pos[2];
                
                // Rotasyon değerlerini topla
                if (layer.transform.xRotation !== undefined) {
                    avgRotation[0] += layer.transform.xRotation.value;
                    avgRotation[1] += layer.transform.yRotation.value;
                    avgRotation[2] += layer.transform.zRotation.value;
                    rotationCount++;
                }
            } else {
                avgPosition[0] += pos[0];
                avgPosition[1] += pos[1];
            }
        }
        
        // Ortalama değerleri hesapla
        avgPosition[0] /= selectedLayers.length;
        avgPosition[1] /= selectedLayers.length;
        
        if (needs3D) {
            avgPosition[2] /= selectedLayers.length;
            nullLayer.threeDLayer = true;
            
            if (rotationCount > 0) {
                avgRotation[0] /= rotationCount;
                avgRotation[1] /= rotationCount;
                avgRotation[2] /= rotationCount;
                
                nullLayer.transform.xRotation.setValue(avgRotation[0]);
                nullLayer.transform.yRotation.setValue(avgRotation[1]);
                nullLayer.transform.zRotation.setValue(avgRotation[2]);
            }
            
            nullLayer.transform.position.setValue(avgPosition);
        } else {
            nullLayer.transform.position.setValue([avgPosition[0], avgPosition[1]]);
        }
        
        // Anchor point'i merkezle
        nullLayer.transform.anchorPoint.setValue([
            nullLayer.source.width / 2,
            nullLayer.source.height / 2,
            0
        ]);
        
        // Null'u en üste taşı
        nullLayer.moveBefore(topMostLayer);
        
        // Seçili layerları null'a parent'la
        for (var i = 0; i < selectedLayers.length; i++) {
            selectedLayers[i].parent = nullLayer;
        }
        
        return "Null layer created and layers parented";
    } catch (error) {
        return "Error creating null layer: " + error.toString();
    } finally {
        app.endUndoGroup();
    }
}