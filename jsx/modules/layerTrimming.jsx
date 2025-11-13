// Layer kırpma fonksiyonları

function findFirstKeyframeTime(layer) {
    var firstKeyTime = layer.outPoint;
    
    // Transform properties
    var transformProps = ["position", "scale", "rotation", "opacity", "anchorPoint"];
    for (var i = 0; i < transformProps.length; i++) {
        var prop = layer.transform[transformProps[i]];
        if (prop.numKeys > 0) {
            firstKeyTime = Math.min(firstKeyTime, prop.keyTime(1));
        }
    }
    
    // Effects
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

    // Shape properties
    if (layer instanceof ShapeLayer && layer.content) {
        for (var i = 1; i <= layer.content.numProperties; i++) {
            var group = layer.content.property(i);
            if (group.numProperties) {
                for (var j = 1; j <= group.numProperties; j++) {
                    var prop = group.property(j);
                    if (prop.numKeys > 0) {
                        firstKeyTime = Math.min(firstKeyTime, prop.keyTime(1));
                    }
                }
            }
        }
    }
    
    return firstKeyTime;
}

function findLastKeyframeTime(layer) {
    var lastKeyTime = layer.inPoint;
    
    // Transform properties
    var transformProps = ["position", "scale", "rotation", "opacity", "anchorPoint"];
    for (var i = 0; i < transformProps.length; i++) {
        var prop = layer.transform[transformProps[i]];
        if (prop.numKeys > 0) {
            lastKeyTime = Math.max(lastKeyTime, prop.keyTime(prop.numKeys));
        }
    }
    
    // Effects
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

    // Shape properties
    if (layer instanceof ShapeLayer && layer.content) {
        for (var i = 1; i <= layer.content.numProperties; i++) {
            var group = layer.content.property(i);
            if (group.numProperties) {
                for (var j = 1; j <= group.numProperties; j++) {
                    var prop = group.property(j);
                    if (prop.numKeys > 0) {
                        lastKeyTime = Math.max(lastKeyTime, prop.keyTime(prop.numKeys));
                    }
                }
            }
        }
    }
    
    return lastKeyTime;
}

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