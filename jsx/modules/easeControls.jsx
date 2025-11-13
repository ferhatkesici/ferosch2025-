// Ease kontrolleri için fonksiyonlar

function updateEase(type, value) {
    if (!(app.project.activeItem && app.project.activeItem instanceof CompItem)) {
        return "No composition selected";
    }

    app.beginUndoGroup("Update Ease");
    
    try {
        var comp = app.project.activeItem;
        var selectedProps = comp.selectedProperties;
        
        if (selectedProps.length === 0) {
            return "No properties selected";
        }

        for (var i = 0; i < selectedProps.length; i++) {
            var prop = selectedProps[i];
            if (!prop.canVaryOverTime) continue;
            
            var selectedKeys = prop.selectedKeys;
            if (!selectedKeys || selectedKeys.length === 0) continue;

            for (var j = 0; j < selectedKeys.length; j++) {
                var keyIndex = selectedKeys[j];

                // Eğer value 0 ise, linear keyframe yap
                if (value === 0) {
                    prop.setInterpolationTypeAtKey(keyIndex, KeyframeInterpolationType.LINEAR);
                    continue;
                }

                // Ease değerini 0-100 aralığından 0-100 influence değerine çevir
                var influence = value;
                // Speed değerini sabit tut (33.3)
                var speed = 0;
                
                var easeObj = new KeyframeEase(speed, influence);
                var easeArray;
                
                if ((!prop.isSpatial) && (prop.value.length == 3)) {
                    easeArray = [easeObj, easeObj, easeObj];
                } else if ((!prop.isSpatial) && (prop.value.length == 2)) {
                    easeArray = [easeObj, easeObj];
                } else {
                    easeArray = [easeObj];
                }

                var currentInEase = prop.keyInTemporalEase(keyIndex);
                var currentOutEase = prop.keyOutTemporalEase(keyIndex);

                switch(type) {
                    case "in":
                        prop.setTemporalEaseAtKey(keyIndex, currentInEase, easeArray);
                        break;
                    case "out":
                        prop.setTemporalEaseAtKey(keyIndex, easeArray, currentOutEase);
                        break;
                    case "both":
                        prop.setTemporalEaseAtKey(keyIndex, easeArray, easeArray);
                        break;
                }
            }
        }
        
        return "Ease applied successfully";
    } catch (error) {
        return "Error: " + error.toString();
    } finally {
        app.endUndoGroup();
    }
}

var copiedEaseData = null;

function getSelectedKeyframes() {
    var comp = app.project.activeItem;
    var selectedKeys = [];
    
    if (!(comp && comp instanceof CompItem)) return null;
    
    var selectedProps = comp.selectedProperties;
    for (var i = 0; i < selectedProps.length; i++) {
        var prop = selectedProps[i];
        if (prop.selectedKeys && prop.selectedKeys.length > 0) {
            for (var j = 0; j < prop.selectedKeys.length; j++) {
                selectedKeys.push({
                    property: prop,
                    keyIndex: prop.selectedKeys[j],
                    propertyValueType: prop.propertyValueType
                });
            }
        }
    }
    
    return selectedKeys;
}

function easeCopy() {
    var comp = app.project.activeItem;
    
    if (!(comp && comp instanceof CompItem)) {
        return "No composition selected";
    }
    
    // Seçili keyframe'leri kontrol et
    var selectedKeys = getSelectedKeyframes();
    if (!selectedKeys || selectedKeys.length === 0) {
        return "No keyframes selected";
    }
    
    try {
        // Ease değerlerini kaydet
        copiedEaseData = [];
        for (var i = 0; i < selectedKeys.length; i++) {
            var key = selectedKeys[i];
            copiedEaseData.push({
                inEase: key.property.keyInTemporalEase(key.keyIndex)[0],
                outEase: key.property.keyOutTemporalEase(key.keyIndex)[0],
                inInterp: key.property.keyInInterpolationType(key.keyIndex),
                outInterp: key.property.keyOutInterpolationType(key.keyIndex)
            });
        }
        return "Ease values copied successfully";
    } catch(e) {
        return "Error copying ease values: " + e.toString();
    }
}

function easePaste() {
    var comp = app.project.activeItem;
    
    if (!(comp && comp instanceof CompItem)) {
        return "No composition selected";
    }
    
    if (!copiedEaseData || copiedEaseData.length === 0) {
        return "No ease values copied";
    }
    
    // Seçili keyframe'leri kontrol et
    var selectedKeys = getSelectedKeyframes();
    if (!selectedKeys || selectedKeys.length === 0) {
        return "No keyframes selected";
    }
    
    app.beginUndoGroup("Paste Ease");
    
    try {
        // Ease değerlerini yapıştır
        for (var i = 0; i < selectedKeys.length; i++) {
            var key = selectedKeys[i];
            var easeData = copiedEaseData[i % copiedEaseData.length];
            
            key.property.setTemporalEaseAtKey(key.keyIndex, [easeData.inEase], [easeData.outEase]);
            key.property.setInterpolationTypeAtKey(key.keyIndex, easeData.inInterp, easeData.outInterp);
        }
        return "Ease values pasted successfully";
    } catch(e) {
        return "Error pasting ease values: " + e.toString();
    } finally {
        app.endUndoGroup();
    }
}