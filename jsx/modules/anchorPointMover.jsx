// Anchor Point Mover fonksiyonları

function getMaskBounds(layer, time) {
    if (!layer.mask || layer.mask.numProperties === 0) {
        return layer.sourceRectAtTime(time, false);
    }

    var bounds = {
        left: Number.MAX_VALUE,
        top: Number.MAX_VALUE,
        right: -Number.MAX_VALUE,
        bottom: -Number.MAX_VALUE
    };

    for (var i = 1; i <= layer.mask.numProperties; i++) {
        var maskPath = layer.mask(i).maskPath;
        var maskShape = maskPath.valueAtTime(time, false);
        var vertices = maskShape.vertices;

        for (var j = 0; j < vertices.length; j++) {
            bounds.left = Math.min(bounds.left, vertices[j][0]);
            bounds.top = Math.min(bounds.top, vertices[j][1]);
            bounds.right = Math.max(bounds.right, vertices[j][0]);
            bounds.bottom = Math.max(bounds.bottom, vertices[j][1]);
        }
    }

    return {
        left: bounds.left,
        top: bounds.top,
        width: bounds.right - bounds.left,
        height: bounds.bottom - bounds.top
    };
}

function moveAnchorPoint(position) {
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        alert("Lütfen bir kompozisyon seçin!");
        return;
    }

    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length === 0) {
        alert("Lütfen en az bir katman seçin!");
        return;
    }

    app.beginUndoGroup("Anchor Point Değiştir");

    for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];
        var rect = getMaskBounds(layer, comp.time);
        var x, y;

        // Pozisyon hesaplama
        switch(position) {
            case "center":
                x = rect.left + rect.width/2;
                y = rect.top + rect.height/2;
                break;
            case "topLeft":
                x = rect.left;
                y = rect.top;
                break;
            case "topCenter":
                x = rect.left + rect.width/2;
                y = rect.top;
                break;
            case "topRight":
                x = rect.left + rect.width;
                y = rect.top;
                break;
            case "centerLeft":
                x = rect.left;
                y = rect.top + rect.height/2;
                break;
            case "centerRight":
                x = rect.left + rect.width;
                y = rect.top + rect.height/2;
                break;
            case "bottomLeft":
                x = rect.left;
                y = rect.top + rect.height;
                break;
            case "bottomCenter":
                x = rect.left + rect.width/2;
                y = rect.top + rect.height;
                break;
            case "bottomRight":
                x = rect.left + rect.width;
                y = rect.top + rect.height;
                break;
        }

        // Anchor point'i değiştir
        if (layer.anchorPoint.isTimeVarying) {
            layer.anchorPoint.setValueAtTime(comp.time, [x, y]);
        } else {
            var oldAnchor = layer.anchorPoint.value;
            var xOffset = (x - oldAnchor[0]) * (layer.scale.value[0] / 100);
            var yOffset = (y - oldAnchor[1]) * (layer.scale.value[1] / 100);

            // Pozisyon düzeltmesi için geçici katman oluştur
            var tempLayer = layer.duplicate();
            var oldParent = layer.parent;
            tempLayer.moveToEnd();
            tempLayer.scale.setValue([100, 100]);

            layer.parent = tempLayer;
            layer.anchorPoint.setValue([x, y]);

            // Pozisyonu düzelt
            if (layer.position.isTimeVarying) {
                for (var k = 1; k <= layer.position.numKeys; k++) {
                    var pos = layer.position.keyValue(k);
                    pos[0] += xOffset;
                    pos[1] += yOffset;
                    layer.position.setValueAtKey(k, pos);
                }
            } else {
                var pos = layer.position.value;
                layer.position.setValue([pos[0] + xOffset, pos[1] + yOffset, pos[2]]);
            }

            layer.parent = oldParent;
            tempLayer.remove();
        }
    }

    app.endUndoGroup();
}

