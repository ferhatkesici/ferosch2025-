// Layer kırpma fonksiyonları

function trimLeft() {
    if (!(app.project.activeItem && app.project.activeItem instanceof CompItem)) {
        return "No composition selected";
    }

    var comp = app.project.activeItem;
    if (comp.selectedLayers.length === 0) {
        return "No layers selected";
    }

    app.beginUndoGroup("Trim Left");
    try {
        for (var i = 0; i < comp.selectedLayers.length; i++) {
            var layer = comp.selectedLayers[i];
            var firstKeyTime = findFirstKeyframeTime(layer);
            if (firstKeyTime < layer.outPoint) {
                layer.inPoint = firstKeyTime;
            }
        }
        return "Layers trimmed from left";
    } catch (error) {
        return "Error trimming layers";
    } finally {
        app.endUndoGroup();
    }
}

function trimRight() {
    if (!(app.project.activeItem && app.project.activeItem instanceof CompItem)) {
        return "No composition selected";
    }

    var comp = app.project.activeItem;
    if (comp.selectedLayers.length === 0) {
        return "No layers selected";
    }

    app.beginUndoGroup("Trim Right");
    try {
        for (var i = 0; i < comp.selectedLayers.length; i++) {
            var layer = comp.selectedLayers[i];
            var lastKeyTime = findLastKeyframeTime(layer);
            if (lastKeyTime > layer.inPoint) {
                layer.outPoint = lastKeyTime;
            }
        }
        return "Layers trimmed from right";
    } catch (error) {
        return "Error trimming layers";
    } finally {
        app.endUndoGroup();
    }
}

function trimBoth() {
    if (!(app.project.activeItem && app.project.activeItem instanceof CompItem)) {
        return "No composition selected";
    }

    var comp = app.project.activeItem;
    if (comp.selectedLayers.length === 0) {
        return "No layers selected";
    }

    app.beginUndoGroup("Trim Both");
    try {
        for (var i = 0; i < comp.selectedLayers.length; i++) {
            var layer = comp.selectedLayers[i];
            var firstKeyTime = findFirstKeyframeTime(layer);
            var lastKeyTime = findLastKeyframeTime(layer);
            if (firstKeyTime < lastKeyTime) {
                layer.inPoint = firstKeyTime;
                layer.outPoint = lastKeyTime;
            }
        }
        return "Layers trimmed from both sides";
    } catch (error) {
        return "Error trimming layers";
    } finally {
        app.endUndoGroup();
    }
}

function findFirstKeyframeTime(layer) {
    var firstKeyTime = layer.outPoint;
    
    var transformProps = ["position", "scale", "rotation", "opacity", "anchorPoint"];
    for (var i = 0; i < transformProps.length; i++) {
        var prop = layer.transform[transformProps[i]];
        if (prop.numKeys > 0) {
            firstKeyTime = Math.min(firstKeyTime, prop.keyTime(1));
        }
    }
    
    if (layer.effect) {
        for (var e = 1; e <= layer.effect.numProperties; e++) {
            var effect = layer.effect(e);
            for (var p = 1; p <= effect.numProperties; p++) {
                var prop = effect(p);
                if (prop.numKeys > 0) {
                    firstKeyTime = Math.min(firstKeyTime, prop.keyTime(1));
                }
            }
        }
    }
    
    return firstKeyTime;
}

function findLastKeyframeTime(layer) {
    var lastKeyTime = layer.inPoint;
    
    var transformProps = ["position", "scale", "rotation", "opacity", "anchorPoint"];
    for (var i = 0; i < transformProps.length; i++) {
        var prop = layer.transform[transformProps[i]];
        if (prop.numKeys > 0) {
            lastKeyTime = Math.max(lastKeyTime, prop.keyTime(prop.numKeys));
        }
    }
    
    if (layer.effect) {
        for (var e = 1; e <= layer.effect.numProperties; e++) {
            var effect = layer.effect(e);
            for (var p = 1; p <= effect.numProperties; p++) {
                var prop = effect(p);
                if (prop.numKeys > 0) {
                    lastKeyTime = Math.max(lastKeyTime, prop.keyTime(prop.numKeys));
                }
            }
        }
    }
    
    return lastKeyTime;
}