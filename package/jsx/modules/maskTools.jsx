// Mask işleme fonksiyonları

function masksToLayers() {
    if (!(app.project.activeItem && app.project.activeItem instanceof CompItem)) {
        return "No composition selected";
    }

    var comp = app.project.activeItem;
    if (comp.selectedLayers.length === 0) {
        return "No layer selected";
    }

    app.beginUndoGroup("Masks to Layers");
    try {
        var layer = comp.selectedLayers[0];
        if (!layer.mask || layer.mask.numProperties === 0) {
            return "No masks found";
        }

        for (var i = 1; i <= layer.mask.numProperties; i++) {
            var newLayer = layer.duplicate();
            for (var j = newLayer.mask.numProperties; j >= 1; j--) {
                if (j !== i) {
                    newLayer.mask(j).remove();
                }
            }
            newLayer.name = layer.name + " - " + layer.mask(i).name;
        }

        layer.enabled = false;
        return "Masks converted to layers";
    } catch (error) {
        return "Error converting masks to layers";
    } finally {
        app.endUndoGroup();
    }
}