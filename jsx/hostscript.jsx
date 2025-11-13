function init() {
    return "Extension initialized successfully";
}

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

function addLeadingZero(n) {
    return n < 10 ? '0' + n : n;
}

function addCompInfo() {
    // Seçili itemları al
    var selectedItems = app.project.selection;
    
    if (selectedItems.length === 0) {
        alert("Lütfen en az bir composition seçin!");
        return;
    }
    
    app.beginUndoGroup("Add Comp Info");
    
    try {
        // Tarih bilgisini al (YYMMDD formatında) - bir kere hesapla
        var date = new Date();
        var year = date.getFullYear().toString().substr(-2);
        var month = addLeadingZero(date.getMonth() + 1);
        var day = addLeadingZero(date.getDate());
        var dateStr = year + month + day;
        
        // Her seçili item için işlem yap
        for (var j = 0; j < selectedItems.length; j++) {
            var comp = selectedItems[j];
            
            // Composition değilse atla
            if (!(comp instanceof CompItem)) continue;
            
            // Mevcut isimden _SN, tarih ve çözünürlük bilgisini temizle
            var cleanName = comp.name.replace(/_\d+SN_\d+_\d+x\d+$/, '');
            
            // Süreyi hesapla (25 fps için)
            var durationInFrames = Math.round(comp.duration * comp.frameRate);
            var durationInSeconds = Math.ceil(durationInFrames / 25); // 25 fps'e göre yukarı yuvarla
            
            // Çözünürlük bilgisini al
            var width = comp.width;
            var height = comp.height;
            
            // Yeni ismi oluştur
            var newName = cleanName + "_" + durationInSeconds + "SN_" + dateStr + "_" + width + "x" + height;
            
            // Comp ismini güncelle
            comp.name = newName;
        }
        
    } catch (err) {
        alert("Hata oluştu: " + err.toString());
    }
    
    app.endUndoGroup();
}

function organizeProject() {
    if (!app.project.numItems) {
        return "Project is empty";
    }
    
    app.beginUndoGroup("Organize Project");
    
    try {
        var folders = {
            renderComps: { name: "Render Compositions", items: [], created: false },
            preComps: { name: "Pre-Compositions", items: [], created: false },
            designFiles: { name: "PSD & AI Files", items: [], created: false },
            imageFiles: { name: "Image Files", items: [], created: false },
            audioFiles: { name: "Audio Files", items: [], created: false },
            videoFiles: { name: "Video Files", items: [], created: false },
            imageSequences: { name: "Image Sequences", items: [], created: false },
            solidsNulls: { name: "Solids & Nulls", items: [], created: false },
            extensions3D: { name: "3D Files", items: [], created: false }
        };
        
        // Önce mevcut klasörleri bul
        var existingFolders = {};
        for (var key in folders) {
            var found = findFolder(folders[key].name);
            if (found) existingFolders[key] = found;
        }
        
        // Tüm itemları tara ve kategorize et
        scanItems();
        
        // Klasörleri oluştur veya güncelle
        organizeItems();
        
        // Boş klasörleri sil
        cleanEmptyFolders();
        
        return "Project organized successfully";
    } catch (error) {
        return "Error organizing project: " + error.toString();
    } finally {
        app.endUndoGroup();
    }
    
    function scanItems() {
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (!item) continue;
            
            // Klasörleri atla
            if (item instanceof FolderItem) continue;
            
            // Composition kontrolü
            if (item instanceof CompItem) {
                if (isRenderComp(item)) {
                    folders.renderComps.items.push(item);
                    item.label = 13; // Yeşil renk
                } else {
                    folders.preComps.items.push(item);
                }
                continue;
            }
            
            try {
                // Solids kontrolü
                if (item.mainSource && item.mainSource instanceof SolidSource) {
                    folders.solidsNulls.items.push(item);
                    continue;
                }
                
                // Dosya adını al
                var fileName = item.name.toLowerCase();
                
                // Dosya uzantısına göre sınıflandır
                if (fileName.match(/\.(psd|ai)$/i)) {
                    folders.designFiles.items.push(item);
                }
                else if (fileName.match(/\.(wav|mp3|aac|m4a|aif|aiff)$/i)) {
                    folders.audioFiles.items.push(item);
                }
                else if (fileName.match(/\.(mp4|mov|avi|mxf|r3d)$/i)) {
                    folders.videoFiles.items.push(item);
                }
                else if (fileName.match(/\.[a-z]+\d+\.[a-z]+$/i)) {
                    folders.imageSequences.items.push(item);
                }
                else if (fileName.match(/\.(c4d|fbx|obj|glb|gltf)$/i)) {
                    folders.extensions3D.items.push(item);
                }
                else if (fileName.match(/\.(png|jpg|jpeg|tiff|tif|gif)$/i)) {
                    folders.imageFiles.items.push(item);
                }
                
            } catch (e) {
                $.writeln("Error processing item: " + item.name + "\nError: " + e.toString());
            }
        }
    }
    
    function organizeItems() {
        for (var key in folders) {
            if (folders[key].items.length > 0) {
                var targetFolder;
                
                if (existingFolders[key]) {
                    targetFolder = existingFolders[key];
                } else {
                    targetFolder = app.project.items.addFolder(folders[key].name);
                }
                
                // Klasöre renk ata
                targetFolder.label = FOLDER_COLORS[key];
                
                for (var j = 0; j < folders[key].items.length; j++) {
                    folders[key].items[j].parentFolder = targetFolder;
                }
            }
        }
    }
    
    function cleanEmptyFolders() {
        for (var i = app.project.numItems; i >= 1; i--) {
            var item = app.project.item(i);
            if (item instanceof FolderItem) {
                var isEmpty = true;
                
                // Klasörün içinde item var mı kontrol et
                for (var j = 1; j <= app.project.numItems; j++) {
                    var checkItem = app.project.item(j);
                    if (checkItem && checkItem.parentFolder === item) {
                        isEmpty = false;
                        break;
                    }
                }
                
                // Klasör boşsa sil
                if (isEmpty) {
                    item.remove();
                }
            }
        }
    }
}

function findFolder(name) {
    for (var i = 1; i <= app.project.numItems; i++) {
        var item = app.project.item(i);
        if (item instanceof FolderItem && item.name === name) {
            return item;
        }
    }
    return null;
}

function isRenderComp(comp) {
    var keyframeCount = 0;
    
    // Keyframe sayısını hesapla
    for (var i = 1; i <= comp.numLayers; i++) {
        var layer = comp.layer(i);
        keyframeCount += countLayerKeyframes(layer);
    }
    
    // 10'dan fazla keyframe varsa render comp
    return keyframeCount > 10;
}

function countLayerKeyframes(layer) {
    var count = 0;
    
    // Transform özellikleri
    var props = ["Position", "Scale", "Rotation", "Opacity", "Anchor Point"];
    for (var i = 0; i < props.length; i++) {
        if (layer.transform[props[i]].numKeys) {
            count += layer.transform[props[i]].numKeys;
        }
    }
    
    // Effects
    if (layer.Effects) {
        for (var e = 1; e <= layer.Effects.numProperties; e++) {
            var effect = layer.Effects.property(e);
            for (var p = 1; p <= effect.numProperties; p++) {
                var prop = effect.property(p);
                if (prop.numKeys) {
                    count += prop.numKeys;
                }
            }
        }
    }
    
    return count;
}

function separateText(type, deleteOriginal) {
    if (!(app.project.activeItem && app.project.activeItem instanceof CompItem)) {
        return "No composition selected";
    }

    var comp = app.project.activeItem;
    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length === 0) {
        return "No layer selected";
    }

    app.beginUndoGroup("Text Separator");
    
    try {
        // Performans iyileştirmesi için işlem öncesi hazırlık
        app.beginSuppressDialogs();
        
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            if (layer instanceof TextLayer) {
                var sourceText = layer.property("Source Text").value;
                var text = sourceText.text;
                var lines = text.split(/[\r\n]+|\n/);
                var splitText = [];
                
                // Split text based on type
                switch(type) {
                    case 'char':
                        for (var l = 0; l < lines.length; l++) {
                            var chars = lines[l].split('');
                            for (var c = 0; c < chars.length; c++) {
                                if (chars[c].trim() !== "") {
                                    splitText.push({
                                        text: chars[c],
                                        line: l
                                    });
                                }
                            }
                        }
                        break;
                    case 'word':
                        for (var l = 0; l < lines.length; l++) {
                            var words = lines[l].trim().split(/\s+/);
                            for (var w = 0; w < words.length; w++) {
                                if (words[w].trim() !== "") {
                                    splitText.push({
                                        text: words[w],
                                        line: l
                                    });
                                }
                            }
                        }
                        break;
                    case 'line':
                        for (var l = 0; l < lines.length; l++) {
                            if (lines[l].trim() !== "") {
                                splitText.push({
                                    text: lines[l],
                                    line: l
                                });
                            }
                        }
                        break;
                }

                // Original layer properties
                var originalPos = layer.transform.position.value;
                var bounds = layer.sourceRectAtTime(comp.time, false);
                
                // Calculate start position
                var startX = originalPos[0];
                var startY = originalPos[1];
                
                // Adjust start X based on justification
                if (sourceText.justification === ParagraphJustification.LEFT_JUSTIFY) {
                    startX = originalPos[0];
                } else if (sourceText.justification === ParagraphJustification.CENTER_JUSTIFY) {
                    startX = originalPos[0] - bounds.width/2;
                } else if (sourceText.justification === ParagraphJustification.RIGHT_JUSTIFY) {
                    startX = originalPos[0] - bounds.width;
                }
                
                var currentX = startX;
                var currentY = startY; 
                var currentLine = 0;
                
                // Performans iyileştirmesi: Tüm katmanları bir kerede oluştur
                var newLayers = [];
                
                // Create new layers
                for (var j = 0; j < splitText.length; j++) {
                    try {
                        // Line break check
                        if (splitText[j].line !== currentLine) {
                            currentLine = splitText[j].line;
                            currentX = startX;
                            currentY += sourceText.fontSize * 1.2;
                        }
                        
                        // Create new text layer
                        var newLayer = comp.layers.addText(splitText[j].text);
                        newLayers.push(newLayer);
                        
                        var textProp = newLayer.property("Source Text");
                        var newTextDocument = textProp.value;
                        
                        // Copy text properties
                        newTextDocument.font = sourceText.font;
                        newTextDocument.fontSize = sourceText.fontSize;
                        newTextDocument.fillColor = sourceText.fillColor;
                        newTextDocument.tracking = sourceText.tracking;
                        
                        // Copy stroke properties safely
                        try {
                            if (sourceText.strokeColor && sourceText.strokeWidth) {
                                newTextDocument.strokeColor = sourceText.strokeColor;
                                newTextDocument.strokeWidth = sourceText.strokeWidth;
                            }
                        } catch(err) {}
                        
                        newTextDocument.justification = ParagraphJustification.LEFT_JUSTIFY;
                        newTextDocument.text = splitText[j].text;
                        textProp.setValue(newTextDocument);
                        
                        // Copy transform properties
                        var sourceTransform = layer.transform;
                        var destTransform = newLayer.transform;
                        for (var prop in sourceTransform) {
                            try {
                                if (sourceTransform[prop] instanceof Property && 
                                    prop !== "position") {
                                    destTransform[prop].setValue(sourceTransform[prop].value);
                                }
                            } catch(err) {}
                        }
                        
                        // Calculate and set position
                        var elementBounds = newLayer.sourceRectAtTime(comp.time, false);
                        
                        switch(type) {
                            case 'char':
                                var charSpacing = sourceText.fontSize * 0.1;
                                newLayer.transform.position.setValue([currentX, currentY]);
                                currentX += elementBounds.width + charSpacing;
                                break;
                            case 'word':
                                var wordSpacing = sourceText.fontSize * 0.3;
                                newLayer.transform.position.setValue([currentX, currentY]);
                                currentX += elementBounds.width + wordSpacing;
                                break;
                            case 'line':
                                newLayer.transform.position.setValue([currentX, currentY]);
                                break;
                        }
                        
                    } catch (error) {
                        alert("Text processing error: " + error.toString());
                    }
                }
                
                // Delete original if checked
                if (deleteOriginal) {
                    layer.remove();
                }
            }
        }
        
        app.endSuppressDialogs(false);
        return "Text separated successfully";
    } catch (error) {
        app.endSuppressDialogs(false);
        return "Error: " + error.toString();
    } finally {
        app.endUndoGroup();
    }
}

var FOLDER_COLORS = {
    renderComps: 9,     // None
    preComps: 15,        // None
    designFiles: 2,     // Yellow
    imageFiles: 3,      // Aqua
    audioFiles: 4,      // Pink
    videoFiles: 5,      // Lavender
    imageSequences: 6,  // Orange
    solidsNulls: 7,     // Blue
    extensions3D: 8     // Purple
};

function getLayerType(layer) {
    if (layer.source instanceof CompItem) return "Precomp";
    if (layer.adjustmentLayer) return "Adjustment Layer";
    if (layer.nullLayer) return "Null Layer";
    if (layer instanceof TextLayer) return "Text Layer";
    if (layer instanceof ShapeLayer) return "Shape Layer";
    if (layer.source && layer.source.mainSource instanceof SolidSource) return "Solid";
    if (!layer.source) {
        if (layer.text) return "Text Layer";
        if (layer.content) return "Shape Layer";
    }
    return "Footage";
}

function cleanProject() {
    if (!(app.project.activeItem && app.project.activeItem instanceof CompItem)) {
        return "No composition selected";
    }

    app.beginUndoGroup("Clean Project");
    
    try {
        var selectedComp = app.project.activeItem;
        var usedItems = {}; // Kullanılan dosyaların ID'lerini saklamak için obje
        
        // Önce comp içindeki tüm aktif layerların source'larını işaretle
        for (var i = 1; i <= selectedComp.numLayers; i++) {
            var layer = selectedComp.layer(i);
            if (layer.enabled) {
                if (layer.source) {
                    usedItems[layer.source.id] = true;
                }
                // Text ve Shape layer kontrolü
                if (layer instanceof TextLayer || layer instanceof ShapeLayer) {
                    usedItems[layer.index] = true;
                }
            }
        }
        
        // Comp içindeki layerları kontrol et ve silinecekleri belirle
        var layersToDelete = [];
        for (var i = selectedComp.numLayers; i >= 1; i--) {
            var layer = selectedComp.layer(i);
            
            // Layer'ın önemli bağlantıları var mı kontrol et
            var hasImportantConnections = 
                layer.hasTrackMatte || 
                layer.isTrackMatte || 
                layer.parent != null || 
                (layer.mask && layer.mask.numProperties > 0) ||
                layer.enabled;
                
            // Effects kontrolü
            if (layer.Effects && layer.Effects.numProperties > 0) {
                hasImportantConnections = true;
            }
            
            // Text layer özel kontrolü
            if (layer instanceof TextLayer && layer.text.sourceText.numKeys > 0) {
                hasImportantConnections = true;
            }
            
            // Shape layer özel kontrolü
            if (layer instanceof ShapeLayer && layer.content && layer.content.numProperties > 0) {
                for (var p = 1; p <= layer.content.numProperties; p++) {
                    var prop = layer.content.property(p);
                    if (prop.numKeys > 0) {
                        hasImportantConnections = true;
                        break;
                    }
                }
            }
            
            // Eğer layer disabled ve önemli bağlantısı yoksa
            if (!hasImportantConnections) {
                layersToDelete.push({
                    layer: layer,
                    name: layer.name,
                    type: getLayerType(layer)
                });
            }
        }
        
        // Silinecek layer varsa işlemi gerçekleştir
        if (layersToDelete.length > 0) {
            var deletedCount = 0;
            for (var i = layersToDelete.length - 1; i >= 0; i--) {
                try {
                    layersToDelete[i].layer.remove();
                    deletedCount++;
                } catch (e) {
                    return "Error deleting layer '" + layersToDelete[i].name + "': " + e.toString();
                }
            }
            return "Successfully deleted " + deletedCount + " unused layers";
        } else {
            return "No unused layers found in '" + selectedComp.name + "'";
        }
        
    } catch (err) {
        return "Error: " + err.toString();
    } finally {
        app.endUndoGroup();
    }
}

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
                    inTempo ralEase: prop.keyInTemporalEase(k),
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