// Kompozisyon araçları

function cropComp() {
    // Check if a project is open
    if (app.project === null) {
        return "Please open a project first.";
    }

    // Check if a composition is selected
    if (app.project.activeItem === null || !(app.project.activeItem instanceof CompItem)) {
        return "Please select a composition.";
    }

    var activeComp = app.project.activeItem;
    
    // Check if there are selected layers
    if (activeComp.selectedLayers.length === 0) {
        return "Please select at least one precomp layer to crop.";
    }
    
    app.beginUndoGroup("Crop Precomp to Layers");
    
    try {
        // Process each selected layer
        for (var i = 0; i < activeComp.selectedLayers.length; i++) {
            var selectedLayer = activeComp.selectedLayers[i];
            
            // Check if the selected layer is a precomp
            if (selectedLayer.source instanceof CompItem) {
                var precompLayer = selectedLayer;
                var precomp = precompLayer.source;
                
                // Calculate bounds of all visible layers in the precomp
                var bounds = calculateVisibleBounds(precomp);
                
                if (bounds) {
                    // Add a small padding to ensure we don't cut off any content
                    var padding = 1;
                    bounds.left = Math.max(0, bounds.left - padding);
                    bounds.top = Math.max(0, bounds.top - padding);
                    bounds.right = Math.min(precomp.width, bounds.right + padding);
                    bounds.bottom = Math.min(precomp.height, bounds.bottom + padding);
                    bounds.width = bounds.right - bounds.left;
                    bounds.height = bounds.bottom - bounds.top;
                    
                    // Ensure minimum dimensions (at least 2x2 pixels)
                    if (bounds.width < 2) bounds.width = 2;
                    if (bounds.height < 2) bounds.height = 2;
                    
                    // Store the original transform properties
                    var originalPosition = precompLayer.transform.position.value;
                    var originalAnchorPoint = precompLayer.transform.anchorPoint.value;
                    var originalScale = precompLayer.transform.scale.value;
                    
                    // Adjust the precomp dimensions
                    precomp.width = bounds.width;
                    precomp.height = bounds.height;
                    
                    // Adjust all layers in the precomp to maintain their visual position
                    for (var j = 1; j <= precomp.numLayers; j++) {
                        var layer = precomp.layer(j);
                        
                        // Handle position property (may have keyframes)
                        if (layer.transform.position.numKeys > 0) {
                            // Has keyframes
                            for (var k = 1; k <= layer.transform.position.numKeys; k++) {
                                var keyTime = layer.transform.position.keyTime(k);
                                var keyValue = layer.transform.position.keyValue(k);
                                
                                if (layer.threeDLayer) {
                                    layer.transform.position.setValueAtKey(k, [
                                        keyValue[0] - bounds.left,
                                        keyValue[1] - bounds.top,
                                        keyValue[2]  // Keep Z value unchanged
                                    ]);
                                } else {
                                    layer.transform.position.setValueAtKey(k, [
                                        keyValue[0] - bounds.left,
                                        keyValue[1] - bounds.top
                                    ]);
                                }
                            }
                        } else {
                            // No keyframes
                            var layerPos = layer.transform.position.value;
                            
                            if (layer.threeDLayer) {
                                layer.transform.position.setValue([
                                    layerPos[0] - bounds.left,
                                    layerPos[1] - bounds.top,
                                    layerPos[2]  // Keep Z value unchanged
                                ]);
                            } else {
                                layer.transform.position.setValue([
                                    layerPos[0] - bounds.left,
                                    layerPos[1] - bounds.top
                                ]);
                            }
                        }
                    }
                    
                    // Adjust the precomp layer's position and anchor point to maintain its position in the main comp
                    var offsetX = bounds.left;
                    var offsetY = bounds.top;
                    
                    // Handle anchor point (may have keyframes)
                    if (precompLayer.transform.anchorPoint.numKeys > 0) {
                        for (var k = 1; k <= precompLayer.transform.anchorPoint.numKeys; k++) {
                            var keyTime = precompLayer.transform.anchorPoint.keyTime(k);
                            var keyValue = precompLayer.transform.anchorPoint.keyValue(k);
                            
                            precompLayer.transform.anchorPoint.setValueAtKey(k, [
                                keyValue[0] - offsetX,
                                keyValue[1] - offsetY,
                                keyValue.length > 2 ? keyValue[2] : 0  // Keep Z if it exists
                            ]);
                        }
                    } else {
                        // Calculate new anchor point (relative to the new bounds)
                        var newAnchorPoint = [
                            originalAnchorPoint[0] - offsetX,
                            originalAnchorPoint[1] - offsetY,
                            originalAnchorPoint.length > 2 ? originalAnchorPoint[2] : 0  // Keep Z if it exists
                        ];
                        
                        // Set the new anchor point
                        precompLayer.transform.anchorPoint.setValue(newAnchorPoint);
                    }
                } else {
                    return "No visible layers found in the precomp or unable to calculate bounds.";
                }
            } else {
                return "Selected layer is not a precomposition.";
            }
        }
        
        return "Precomp(s) cropped successfully!";
    } catch (err) {
        return "Error: " + err.toString();
    } finally {
        app.endUndoGroup();
    }
}

// Function to calculate the bounds of all visible layers in a composition
function calculateVisibleBounds(comp) {
    var left = comp.width;
    var top = comp.height;
    var right = 0;
    var bottom = 0;
    var foundVisibleLayer = false;
    
    // Loop through all layers in the composition
    for (var i = 1; i <= comp.numLayers; i++) {
        var layer = comp.layer(i);
        
        // Skip if layer is not visible
        if (!layer.enabled || layer.shy) {
            continue;
        }
        
        // Get layer bounds (considering masks if present)
        var layerBounds = getLayerBounds(layer);
        if (layerBounds) {
            foundVisibleLayer = true;
            left = Math.min(left, layerBounds.left);
            top = Math.min(top, layerBounds.top);
            right = Math.max(right, layerBounds.right);
            bottom = Math.max(bottom, layerBounds.bottom);
        }
    }
    
    // If no visible layers found or bounds are the same as comp dimensions
    if (!foundVisibleLayer || (Math.abs(left) < 0.1 && Math.abs(top) < 0.1 && 
        Math.abs(right - comp.width) < 0.1 && Math.abs(bottom - comp.height) < 0.1)) {
        
        // Check if we have any layers with non-default scale or position
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            if (!layer.enabled || layer.shy) continue;
            
            var scale = layer.transform.scale.value;
            var position = layer.transform.position.value;
            
            // If scale is not 100% or position is not centered, we should have bounds
            if ((Math.abs(scale[0] - 100) > 0.1 || Math.abs(scale[1] - 100) > 0.1) ||
                (Math.abs(position[0] - comp.width/2) > 0.1 || Math.abs(position[1] - comp.height/2) > 0.1)) {
                
                // Force recalculation with more aggressive bounds detection
                var forcedBounds = getLayerBoundsForced(layer);
                if (forcedBounds) {
                    foundVisibleLayer = true;
                    left = Math.min(left, forcedBounds.left);
                    top = Math.min(top, forcedBounds.top);
                    right = Math.max(right, forcedBounds.right);
                    bottom = Math.max(bottom, forcedBounds.bottom);
                }
            }
        }
    }
    
    if (!foundVisibleLayer) {
        return null;
    }
    
    // Ensure we have at least 1px dimensions
    if (right <= left) right = left + 1;
    if (bottom <= top) bottom = top + 1;
    
    return {
        left: Math.floor(left),
        top: Math.floor(top),
        right: Math.ceil(right),
        bottom: Math.ceil(bottom),
        width: Math.ceil(right) - Math.floor(left),
        height: Math.ceil(bottom) - Math.floor(top)
    };
}

// Function to get the bounds of a layer, considering masks if present
function getLayerBounds(layer) {
    try {
        var time = layer.containingComp.time;
        var bounds = null;
        
        // Check if layer has masks and they are applied
        if (layer.mask && layer.mask.numProperties > 0 && layer.maskEnabled) {
            bounds = getMaskBounds(layer, time);
        } 
        
        // If no mask bounds or masks not enabled, use the layer's source rect
        if (!bounds && layer.sourceRectAtTime) {
            bounds = getSourceRectBounds(layer, time);
        }
        
        return bounds;
    } catch (e) {
        // Some layers might not support sourceRectAtTime
        return null;
    }
}

// Function to force bounds calculation for layers that might match comp dimensions
function getLayerBoundsForced(layer) {
    try {
        var time = layer.containingComp.time;
        var rect = layer.sourceRectAtTime(time, false);
        var anchor = layer.transform.anchorPoint.value;
        var position = layer.transform.position.value;
        var scale = layer.transform.scale.value;
        
        // Calculate bounds considering transform properties
        var scaleFactorX = scale[0] / 100;
        var scaleFactorY = scale[1] / 100;
        
        // Calculate the four corners of the source rect
        var width = rect.width * scaleFactorX;
        var height = rect.height * scaleFactorY;
        
        // Calculate center of the layer
        var centerX = position[0];
        var centerY = position[1];
        
        // Calculate the bounds based on the scaled dimensions
        return {
            left: centerX - width/2,
            top: centerY - height/2,
            right: centerX + width/2,
            bottom: centerY + height/2
        };
    } catch (e) {
        return null;
    }
}

// Function to get bounds from layer's sourceRectAtTime
function getSourceRectBounds(layer, time) {
    var rect = layer.sourceRectAtTime(time, false);
    var anchor = layer.transform.anchorPoint.value;
    var position = layer.transform.position.value;
    var scale = layer.transform.scale.value;
    var rotation = layer.transform.rotation.value * (Math.PI/180); // Convert to radians
    
    // Calculate bounds considering transform properties
    var scaleFactorX = scale[0] / 100;
    var scaleFactorY = scale[1] / 100;
    
    // Calculate the four corners of the source rect
    var corners = [
        { x: rect.left, y: rect.top },                           // Top-left
        { x: rect.left + rect.width, y: rect.top },              // Top-right
        { x: rect.left + rect.width, y: rect.top + rect.height }, // Bottom-right
        { x: rect.left, y: rect.top + rect.height }              // Bottom-left
    ];
    
    var left = Number.MAX_VALUE;
    var top = Number.MAX_VALUE;
    var right = -Number.MAX_VALUE;
    var bottom = -Number.MAX_VALUE;
    
    // Transform each corner and find the bounds
    for (var i = 0; i < corners.length; i++) {
        var x = corners[i].x;
        var y = corners[i].y;
        
        // Apply scale
        x *= scaleFactorX;
        y *= scaleFactorY;
        
        // Apply rotation if needed
        if (rotation !== 0) {
            var rotatedX = x * Math.cos(rotation) - y * Math.sin(rotation);
            var rotatedY = x * Math.sin(rotation) + y * Math.cos(rotation);
            x = rotatedX;
            y = rotatedY;
        }
        
        // Adjust for anchor point
        x = x - (anchor[0] * scaleFactorX) + position[0];
        y = y - (anchor[1] * scaleFactorY) + position[1];
        
        // Update bounds
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
    }
    
    return {
        left: left,
        top: top,
        right: right,
        bottom: bottom
    };
}

// Function to get bounds from layer's masks
function getMaskBounds(layer, time) {
    var position = layer.transform.position.value;
    var anchor = layer.transform.anchorPoint.value;
    var scale = layer.transform.scale.value;
    var rotation = layer.transform.rotation.value * (Math.PI/180); // Convert to radians
    
    var scaleFactorX = scale[0] / 100;
    var scaleFactorY = scale[1] / 100;
    
    var left = Number.MAX_VALUE;
    var top = Number.MAX_VALUE;
    var right = -Number.MAX_VALUE;
    var bottom = -Number.MAX_VALUE;
    var foundMaskVertex = false;
    
    // Loop through all masks
    for (var i = 1; i <= layer.mask.numProperties; i++) {
        var mask = layer.mask(i);
        
        // Skip if mask is not enabled
        if (!mask.enabled) {
            continue;
        }
        
        var maskShape = mask.maskPath.valueAtTime(time, false);
        var vertices = maskShape.vertices;
        var inTangents = maskShape.inTangents;
        var outTangents = maskShape.outTangents;
        
        // Process each vertex of the mask and its tangent handles
        for (var j = 0; j < vertices.length; j++) {
            // Process the vertex
            processPoint(vertices[j][0], vertices[j][1]);
            
            // Process in tangent (relative to vertex)
            if (inTangents && inTangents.length > j) {
                processPoint(vertices[j][0] + inTangents[j][0], vertices[j][1] + inTangents[j][1]);
            }
            
            // Process out tangent (relative to vertex)
            if (outTangents && outTangents.length > j) {
                processPoint(vertices[j][0] + outTangents[j][0], vertices[j][1] + outTangents[j][1]);
            }
        }
        
        foundMaskVertex = true;
    }
    
    function processPoint(x, y) {
        // Apply layer transformations to the point
        
        // Apply scale
        x *= scaleFactorX;
        y *= scaleFactorY;
        
        // Apply rotation if needed
        if (rotation !== 0) {
            var rotatedX = x * Math.cos(rotation) - y * Math.sin(rotation);
            var rotatedY = x * Math.sin(rotation) + y * Math.cos(rotation);
            x = rotatedX;
            y = rotatedY;
        }
        
        // Adjust for anchor point and position
        x = x - (anchor[0] * scaleFactorX) + position[0];
        y = y - (anchor[1] * scaleFactorY) + position[1];
        
        // Update bounds
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
    }
    
    if (!foundMaskVertex) {
        return null;
    }
    
    return {
        left: left,
        top: top,
        right: right,
        bottom: bottom
    };
}

// Function to process composition recursively
function processCompositionRecursively(comp, newFPS, newDuration) {
    var layer;
    var oldCompDur = comp.duration;
    var i, oldOutPt;
    
    if (newFPS !== -1) {
        comp.frameRate = newFPS;
    }
    
    if (newDuration !== -1) {
        newDuration = newDuration / comp.frameRate; // Convert frames to seconds
        comp.duration = newDuration;
    }
    
    for (i = 1; i <= comp.numLayers; i++) {
        layer = comp.layer(i);
        
        if ((layer instanceof AVLayer) && (layer.source !== null) && (layer.source instanceof CompItem)) {
            processCompositionRecursively(layer.source, newFPS, newDuration * comp.frameRate); // Pass duration in frames
        }
        
        if (newDuration !== -1) {
            if (layer.stretch >= 0) {
                if (layer.outPoint >= oldCompDur) {
                    layer.outPoint = comp.duration;
                }
            } else {
                if (layer.inPoint >= oldCompDur) {
                    oldOutPt = layer.outPoint;
                    layer.inPoint = comp.duration;
                    layer.outPoint = oldOutPt;
                }
            }
        }
    }
}

// Function to update selected compositions with new FPS and duration
function updateSelectedComps(newFPS, newDuration) {
    if (app.project === null) {
        alert("Lütfen bir proje açın!");
        return;
    }
    
    var selectedComps = [];
    
    // Get selected compositions
    if ((app.project.activeItem !== null) && (app.project.activeItem instanceof CompItem)) {
        selectedComps = [app.project.activeItem];
    } else {
        selectedComps = app.project.selection;
    }
    
    if (selectedComps.length === 0) {
        alert("Lütfen en az bir composition seçin!");
        return;
    }
    
    app.beginUndoGroup("FPS ve Duration Değiştir");
    
    try {
        for (var i = 0; i < selectedComps.length; i++) {
            var comp = selectedComps[i];
            if (!(comp instanceof CompItem)) {
                continue;
            }
            
            processCompositionRecursively(comp, newFPS, newDuration);
        }
        
        alert("İşlem başarıyla tamamlandı!");
    } catch (err) {
        alert("Hata: " + err.toString());
    } finally {
        app.endUndoGroup();
    }
}