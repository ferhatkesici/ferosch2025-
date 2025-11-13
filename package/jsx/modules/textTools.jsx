// Metin işleme fonksiyonları

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
                            // Satır boş olabilir, kontrol et
                            if (!lines[l]) {
                                splitText.push({
                                    text: "",
                                    line: l,
                                    isEmptyLine: true
                                });
                                continue;
                            }
                            
                            var chars = lines[l].split('');
                            for (var c = 0; c < chars.length; c++) {
                                // Boşluk kontrolü
                                if (chars[c] === " ") {
                                    splitText.push({
                                        text: " ",
                                        line: l,
                                        isSpace: true
                                    });
                                } else {
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
                            // Satır boş olabilir, kontrol et
                            if (!lines[l] || lines[l] === "") {
                                splitText.push({
                                    text: "",
                                    line: l,
                                    isEmptyLine: true
                                });
                                continue;
                            }
                            
                            // Kelimeleri ve boşlukları ayır
                            var words = lines[l].match(/\S+|\s+/g);
                            
                            // Eğer match null dönerse (boş satır), atla
                            if (!words) continue;
                            
                            for (var w = 0; w < words.length; w++) {
                                var isSpace = /^\s+$/.test(words[w]);
                                splitText.push({
                                    text: words[w],
                                    line: l,
                                    isSpace: isSpace
                                });
                            }
                        }
                        break;
                    case 'line':
                        for (var l = 0; l < lines.length; l++) {
                            // Boş satırları da ekle
                            splitText.push({
                                text: lines[l] || "",
                                line: l
                            });
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
                        
                        // Boş satır kontrolü
                        if (splitText[j].isEmptyLine) {
                            continue;
                        }
                        
                        // Boşluk kontrolü - boşlukları atla ama pozisyonu güncelle
                        if (splitText[j].isSpace) {
                            // Boşluk genişliği - yaklaşık olarak font boyutunun 1/3'ü
                            var spaceWidth = sourceText.fontSize * 0.3;
                            currentX += spaceWidth;
                            continue;
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
                        $.writeln("Text processing error: " + error.toString());
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

function applyLayerOffset(offsetType, offsetValue, useRandomOffset, minOffset, maxOffset, offsetDirection, multiplier) {
    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) {
        return "Please select a composition!";
    }
    
    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length < 2) {
        return "Please select at least 2 layers!";
    }
    
    app.beginUndoGroup("Layer Offset");
    
    try {
        // Offset değerini al
        var baseOffset = parseFloat(offsetValue);
        if (isNaN(baseOffset)) {
            return "Please enter a valid number!";
        }
        
        // Saniye modunda ise frame'e çevir
        if (offsetType === "seconds") {
            baseOffset *= comp.frameRate;
        }
        
        // Random değerleri kontrol et
        var minOffsetVal = parseFloat(minOffset);
        var maxOffsetVal = parseFloat(maxOffset);
        if (useRandomOffset && (isNaN(minOffsetVal) || isNaN(maxOffsetVal))) {
            return "Please enter valid random range values!";
        }
        
        // Layerları sırala (index'e göre)
        selectedLayers.sort(function(a, b) {
            return a.index - b.index;
        });
        
        // İlk layer'ı referans al
        var referenceLayer = selectedLayers[0];
        var referenceTime = referenceLayer.startTime;
        
        // Her layer için offset uygula
        for (var i = 1; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            var offset;
            
            if (useRandomOffset) {
                // Random offset hesapla
                offset = (Math.random() * (maxOffsetVal - minOffsetVal) + minOffsetVal);
                if (offsetType === "seconds") offset *= comp.frameRate;
            } else {
                // Normal offset hesapla - her tıklamada artan offset
                offset = baseOffset * i * multiplier;
            }
            
            // Yönü kontrol et
            if (offsetDirection === "backward") {
                offset = -offset;
            }
            
            // Frame'e çevir ve uygula
            var frameOffset = offset / comp.frameRate;
            layer.startTime = referenceTime + frameOffset;
        }
        
        return "Layers offset applied successfully (" + multiplier + "x)";
    } catch (err) {
        return "Error: " + err.toString();
    } finally {
        app.endUndoGroup();
    }
}

function resetLayerOffset() {
    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) {
        return "Please select a composition!";
    }
    
    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length < 2) {
        return "Please select at least 2 layers!";
    }
    
    app.beginUndoGroup("Reset Layer Offset");
    
    try {
        // Layerları sırala (index'e göre)
        selectedLayers.sort(function(a, b) {
            return a.index - b.index;
        });
        
        // İlk layer'ı referans al
        var referenceTime = selectedLayers[0].startTime;
        
        // Tüm layerları aynı zamana getir
        for (var i = 1; i < selectedLayers.length; i++) {
            selectedLayers[i].startTime = referenceTime;
        }
        
        return "Layer offsets reset successfully";
    } catch (err) {
        return "Error: " + err.toString();
    } finally {
        app.endUndoGroup();
    }
}