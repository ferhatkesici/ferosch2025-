// Proje organizasyon fonksiyonları

var FOLDER_COLORS = {
    renderComps: 9,     // None
    preComps: 15,       // None
    designFiles: 2,     // Yellow
    imageFiles: 3,      // Aqua
    audioFiles: 4,      // Pink
    videoFiles: 5,      // Lavender
    imageSequences: 6,  // Orange
    solidsNulls: 7,     // Blue
    extensions3D: 8     // Purple
};

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