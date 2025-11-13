// FPS and Duration functionality
function updateLayerKeyframes(layer, oldDuration, newDuration, oldFPS, newFPS) {
    // Transform özellikleri
    var props = ["Position", "Scale", "Rotation", "Opacity", "Anchor Point"];
    
    for (var i = 0; i < props.length; i++) {
        var prop = layer.transform[props[i]];
        if (prop.numKeys > 0) {
            // Tüm keyframe'leri yeni süreye göre yeniden konumlandır
            var keys = [];
            for (var k = 1; k <= prop.numKeys; k++) {
                keys.push({
                    time: prop.keyTime(k),
                    value: prop.keyValue(k),
                    inInterp: prop.keyInInterpolationType(k),
                    outInterp: prop.keyOutInterpolationType(k),
                    inTemporalEase: prop.keyInTemporalEase(k),
                    outTemporalEase: prop.keyOutTemporalEase(k)
                });
            }
            
            // Mevcut keyframe'leri sil
            while (prop.numKeys > 0) {
                prop.removeKey(1);
            }
            
            // Keyframe'leri yeni pozisyonlarına ekle
            for (var k = 0; k < keys.length; k++) {
                var oldKey = keys[k];
                var newTime = (oldKey.time * newDuration) / oldDuration;
                var newKeyIndex = prop.addKey(newTime);
                
                prop.setValueAtKey(newKeyIndex, oldKey.value);
                prop.setTemporalEaseAtKey(newKeyIndex, oldKey.inTemporalEase, oldKey.outTemporalEase);
                prop.setInterpolationTypeAtKey(newKeyIndex, oldKey.inInterp, oldKey.outInterp);
            }
        }
    }
    
    // Effects için de aynı işlemi yap
    if (layer.Effects) {
        for (var e = 1; e <= layer.Effects.numProperties; e++) {
            var effect = layer.Effects.property(e);
            for (var p = 1; p <= effect.numProperties; p++) {
                var effectProp = effect.property(p);
                if (effectProp.numKeys > 0) {
                    // Effect keyframe'lerini güncelle
                    var effectKeys = [];
                    for (var k = 1; k <= effectProp.numKeys; k++) {
                        effectKeys.push({
                            time: effectProp.keyTime(k),
                            value: effectProp.keyValue(k)
                        });
                    }
                    
                    while (effectProp.numKeys > 0) {
                        effectProp.removeKey(1);
                    }
                    
                    for (var k = 0; k < effectKeys.length; k++) {
                        var oldKey = effectKeys[k];
                        var newTime = (oldKey.time * newDuration) / oldDuration;
                        var newKeyIndex = effectProp.addKey(newTime);
                        effectProp.setValueAtKey(newKeyIndex, oldKey.value);
                    }
                }
            }
        }
    }
}

function updateCompSettings(newFPS, newDuration) {
    if (!(app.project.activeItem && app.project.activeItem instanceof CompItem)) {
        return "No composition selected";
    }

    app.beginUndoGroup("Update Composition Settings");
    
    try {
        var comp = app.project.activeItem;
        var oldFPS = comp.frameRate;
        var oldDuration = comp.duration;
        
        // FPS değişimi için oran hesapla
        var fpsRatio = newFPS / oldFPS;
        
        // Comp ayarlarını güncelle
        comp.frameRate = newFPS;
        comp.duration = newDuration / newFPS; // Saniyeye çevir
        
        // Her layer için süre ve keyframe ayarlamaları
        for (var j = 1; j <= comp.numLayers; j++) {
            var layer = comp.layer(j);
            
            // Layer süresini güncelle
            if (layer.stretch !== undefined) {
                layer.stretch *= fpsRatio;
            }
            
            // Layer'ın in/out noktalarını güncelle
            var newInPoint = (layer.inPoint * newDuration) / oldDuration;
            var newOutPoint = (layer.outPoint * newDuration) / oldDuration;
            
            layer.inPoint = newInPoint;
            layer.outPoint = newOutPoint;
            
            // Keyframe'leri güncelle
            updateLayerKeyframes(layer, oldDuration, newDuration, oldFPS, newFPS);
        }
        
        return "Composition settings updated successfully";
    } catch (err) {
        return "Error: " + err.toString();
    } finally {
        app.endUndoGroup();
    }
}