// Keyframe işleme fonksiyonları
var lastKeyframeOffset = 0; // Son kullanılan offset değerini saklar

function offsetKeyframes(type, value, useRandom, minOffset, maxOffset, direction, multiplier) {
    if (!(app.project.activeItem && app.project.activeItem instanceof CompItem)) {
        return "No composition selected";
    }

    var comp = app.project.activeItem;
    
    // Convert offset value to frames
    var offsetFrames = parseFloat(value);
    if (isNaN(offsetFrames)) {
        return "Please enter a valid number";
    }
    
    // Convert seconds to frames if needed
    if (type === "seconds") {
        offsetFrames *= comp.frameRate;
    }
    
    // Random değerleri hazırla
    var randomSettings = null;
    if (useRandom) {
        var minOffsetFrames = parseFloat(minOffset);
        var maxOffsetFrames = parseFloat(maxOffset);
        
        if (isNaN(minOffsetFrames) || isNaN(maxOffsetFrames)) {
            return "Please enter valid random range values";
        }
        
        // Convert min/max to frames if needed
        if (type === "seconds") {
            minOffsetFrames *= comp.frameRate;
            maxOffsetFrames *= comp.frameRate;
        }
        
        randomSettings = {
            min: minOffsetFrames,
            max: maxOffsetFrames
        };
    }
    
    // Yön kontrolü
    if (direction === "backward") {
        offsetFrames = -offsetFrames;
        if (randomSettings) {
            // Random değerlerin de yönünü değiştir
            var temp = -randomSettings.max;
            randomSettings.max = -randomSettings.min;
            randomSettings.min = temp;
        }
    }
    
    // Implement the integrated version
    offsetFrames *= multiplier; // Multiplier uygula
    
    // Varsayılan değerler
    var order = 1;     // Normal sıralama
    var step = 1;      // 1'er adımla offset
    var alt = 0;       // Standart mod
    
    // Random modu aktif et
    if (useRandom) {
        alt = 1; // Random mod için alt parametresi
    }
    
    lastKeyframeOffset = offsetFrames; // Son kullanılan offset değerini kaydet
    
    return doSequence(offsetFrames, order, step, alt, randomSettings);
}

function resetKeyframes() {
    if (!(app.project.activeItem && app.project.activeItem instanceof CompItem)) {
        return "No composition selected";
    }
    
    // Reset son offset
    lastKeyframeOffset = 0;
    
    var comp = app.project.activeItem;
    var selectedProps = getPropKeyTimes(comp.selectedProperties);
    
    if (selectedProps.length === 0) {
        return "No properties with selected keyframes found";
    }
    
    app.beginUndoGroup("Reset Keyframe Offset");
    
    try {
        // En erken keyframe zamanını bul
        var earliestTime = comp.duration;
        for (var i = 0; i < selectedProps.length; i++) {
            var prop = selectedProps[i];
            if (prop.times.length > 0) {
                earliestTime = Math.min(earliestTime, prop.times[0]);
            }
        }
        
        // Tüm keyframeleri reset pozisyonlarına yerleştir
        arrangeKeysToTime(selectedProps, earliestTime);
        
        return "Keyframes reset successfully";
    } catch (error) {
        return "Error: " + error.toString();
    } finally {
        app.endUndoGroup();
    }
}

// Aşağıdaki fonksiyonlar keyframeMover.jsx scriptinden entegre edilmiştir

function doSequence(OFFSET, order, step, alt, randomSettings) {
    app.beginUndoGroup("Keyframe Offset: " + OFFSET + " frames");
    var curComp = app.project.activeItem;
    if ((!curComp) || (!(curComp instanceof CompItem))) { 
        app.endUndoGroup();
        return "Please select a composition";
    }
    var selProps = curComp.selectedProperties;
    var fd = curComp.frameDuration;
    
    // Keyframeler seçildi mi kontrol et
    if (hasSelectedKeys(selProps) === true) {
        // Seçili keyframe'leri işle
        var propTimes = getPropKeyTimes(selProps);
        
        // Ters sıralama kontrolü (order=2)
        if (order === 2) {
            propTimes.reverse();
        }
        
        var startTime;
        var random = false;
        
        if ((alt === 0) && (order === 3)) { 
            startTime = true;
            random = true;
        } else if (alt === 1) {
            // Özel random mod
            startTime = propTimes[0].times[0];
            random = true;
        } else {
            if (order === 3) { 
                startTime = findLowestTime(propTimes)[0];
                // Shuffle functionality
                var j, x, i;
                for (i = propTimes.length - 1; i > 0; i--) {
                    j = Math.floor(Math.random() * (i + 1));
                    x = propTimes[i];
                    propTimes[i] = propTimes[j];
                    propTimes[j] = x;
                }
            } else {
                startTime = propTimes[0].times[0];
            }
        }
        
        moveKeys(propTimes, OFFSET, fd, order, step, startTime, random, randomSettings);
        app.endUndoGroup();
        return "Keyframes offset by " + OFFSET + " frames successfully";
    } else {
        app.endUndoGroup();
        return "Please select at least one keyframe";
    }
}

function moveKeys(props, OFFSET, fd, order, step, startTime, random, randomSettings) {
    var keyTimes = [];
    
    // Rastgele mod için hazırlık
    var randomNums = [];
    if (random === true) { 
        // Özel random aralığı varsa kullan
        var randomMin = -Math.ceil(OFFSET / 2);
        var randomMax = Math.ceil(OFFSET / 2);
        
        if (randomSettings) {
            randomMin = randomSettings.min;
            randomMax = randomSettings.max;
        }
        
        for (var i = 0; i < props.length; i += step) { 
            randomNums.push(getRandomInt(randomMin, randomMax));
        }
        
        var randomIndex = Math.floor(getRandomInt(0, randomNums.length - 1) / step) * step;
        var num = 0;
    }
    
    for (var i = 0; i < props.length; i++) {
        keyTimes.push({prop: props[i].prop, times: []});
        
        if (startTime === true) { 
            var sT = true;
            startTime = props[i].times[0];
        }
        
        // Offset değerini belirle
        var timeOffset;
        if (random === true) { 
            var r;
            if ((i === randomIndex) && (randomNums.indexOf(0) === -1)) { 
                r = 0;
                if (num < (step - 1)) { 
                    randomIndex++;
                    num++;
                }
            }
            else {
                r = randomNums[Math.floor(i / step)];
            }
            timeOffset = r * fd;
        }
        else {
            timeOffset = Math.floor(i / step) * OFFSET * fd;
        }
        
        // İlerleme yönünü belirle
        var start, condition, inc;
        if (props[i].times[0] <= (startTime + timeOffset)) { 
            start = props[i].times.length - 1;
            condition = -1;
            inc = -1;
        }
        else {
            start = 0;
            condition = props[i].times.length;
            inc = 1;
        }
        
        // Keyframe'leri işle
        var keyObjArr = [];
        for (var y = start; y !== condition; y += inc) { 
            keyObjArr.push(getKeyObj(props[i].prop, props[i].times[y], props[i].times[0], startTime, timeOffset));
        }
        
        for (var y = start; y !== condition; y += inc) { 
            moveKey(props[i].prop, props[i].times[y], props[i].times[0], startTime, timeOffset);
        }
        
        for (var y = start; y !== condition; y += inc) { 
            keyTimes[i].times.push(setInterpolationsAtKeys(props[i].prop, keyObjArr[Math.abs(y - start)]));
        }
        
        // Roving'i işle
        for (var z = 0; z < props[i].roving.length; z++) {
            props[i].prop.setRovingAtKey(props[i].roving[z], true);
        }
        
        if (sT === true) { 
            startTime = true;
        }
    }
    
    selectKeysForSeq(keyTimes);
}

function arrangeKeysToTime(props, time) {
    var keyTimes = [];
    for (var i = 0; i < props.length; i++) {
        keyTimes.push({prop: props[i].prop, times: []});
        var timeOffset = 0;
        
        // İlerleme yönünü belirle
        var start, condition, inc;
        if (props[i].times[0] <= (time + timeOffset)) { 
            start = props[i].times.length - 1;
            condition = -1;
            inc = -1;
        }
        else {
            start = 0;
            condition = props[i].times.length;
            inc = 1;
        }
        
        // Keyframe'leri işle
        var keyObjArr = [];
        for (var y = start; y !== condition; y += inc) { 
            keyObjArr.push(getKeyObj(props[i].prop, props[i].times[y], props[i].times[0], time, timeOffset));
        }
        
        for (var y = start; y !== condition; y += inc) { 
            moveKey(props[i].prop, props[i].times[y], props[i].times[0], time, timeOffset);
        }
        
        for (var y = start; y !== condition; y += inc) { 
            keyTimes[i].times.push(setInterpolationsAtKeys(props[i].prop, keyObjArr[Math.abs(y - start)]));
        }
    }
    
    selectKeys(keyTimes);
}

function getKeyObj(prop, keyTime, firstKeyTime, startTime, keyOffset) {
    var keyObj = {};
    var keyIndex = prop.nearestKeyIndex(keyTime);
    
    keyObj.value = prop.keyValue(keyIndex);
    keyObj.newTime = (startTime + keyOffset + prop.keyTime(keyIndex)) - firstKeyTime;
    keyObj.inInterpolation = prop.keyInInterpolationType(keyIndex);
    keyObj.outInterpolation = prop.keyOutInterpolationType(keyIndex);
    keyObj.inEase = prop.keyInTemporalEase(keyIndex);
    keyObj.outEase = prop.keyOutTemporalEase(keyIndex);
    
    // After Effects sürümünü kontrol et ve mevcut fonksiyonları kullan
    try {
        keyObj.temporalAutoBezier = prop.keyTemporalAutoBezier ? prop.keyTemporalAutoBezier(keyIndex) : null;
        keyObj.temporalContinuous = prop.keyTemporalContinuous ? prop.keyTemporalContinuous(keyIndex) : null;
    } catch (e) {
        keyObj.temporalAutoBezier = null;
        keyObj.temporalContinuous = null;
    }
    
    if ((prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL) || (prop.propertyValueType == PropertyValueType.TwoD_SPATIAL)) { 
        try {
            keyObj.keyInSpatialTangent = prop.keyInSpatialTangent(keyIndex);
            keyObj.keyOutSpatialTangent = prop.keyOutSpatialTangent(keyIndex);
            keyObj.spatialAutoBezier = prop.keySpatialAutoBezier ? prop.keySpatialAutoBezier(keyIndex) : null;
            keyObj.spatialContinuous = prop.keySpatialContinuous ? prop.keySpatialContinuous(keyIndex) : null;
        } catch (e) {
            // Spatial özellikler yoksa hata vermesin
        }
    }
    
    return keyObj;
}

function moveKey(prop, keyTime, firstKeyTime, startTime, keyOffset) {
    var keyIndex = prop.nearestKeyIndex(keyTime);
    var time = (startTime + keyOffset + prop.keyTime(keyIndex)) - firstKeyTime;
    
    if (timeToFrames(time) !== timeToFrames(keyTime)) { 
        prop.setValueAtTime(time, prop.keyValue(keyIndex));
        keyIndex = prop.nearestKeyIndex(keyTime);
        prop.removeKey(keyIndex);
    }
}

function setInterpolationsAtKeys(prop, keyObj) {
    var keyIndex = prop.nearestKeyIndex(keyObj.newTime);
    
    try {
        prop.setInterpolationTypeAtKey(keyIndex, keyObj.inInterpolation, keyObj.outInterpolation);
        
        if ((prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL) || (prop.propertyValueType == PropertyValueType.TwoD_SPATIAL)) { 
            if (keyObj.keyInSpatialTangent && keyObj.keyOutSpatialTangent) {
                prop.setSpatialTangentsAtKey(keyIndex, keyObj.keyInSpatialTangent, keyObj.keyOutSpatialTangent);
            }
            
            if (keyObj.spatialAutoBezier !== null && prop.setSpatialAutoBezierAtKey) {
                prop.setSpatialAutoBezierAtKey(keyIndex, keyObj.spatialAutoBezier);
            }
            
            if (keyObj.spatialContinuous !== null && prop.setSpatialContinuousAtKey) {
                prop.setSpatialContinuousAtKey(keyIndex, keyObj.spatialContinuous);
            }
        }
        
        if ((keyObj.inInterpolation == KeyframeInterpolationType.BEZIER) || (keyObj.outInterpolation == KeyframeInterpolationType.BEZIER)) { 
            prop.setTemporalEaseAtKey(keyIndex, keyObj.inEase, keyObj.outEase);
            
            if (keyObj.temporalAutoBezier !== null && prop.setTemporalAutoBezierAtKey) {
                prop.setTemporalAutoBezierAtKey(keyIndex, keyObj.temporalAutoBezier);
            }
            
            if (keyObj.temporalContinuous !== null && prop.setTemporalContinuousAtKey) {
                prop.setTemporalContinuousAtKey(keyIndex, keyObj.temporalContinuous);
            }
        }
    } catch (e) {
        // Hata yönetimi
    }
    
    return keyObj.newTime;
}

function selectKeysForSeq(arr) {
    for (var i = 0; i < arr.length; i++) {
        for (var x = 0; x < arr[i].times.length; x++) {
            try {
                var index = arr[i].prop.nearestKeyIndex(arr[i].times[x]);
                arr[i].prop.setSelectedAtKey(index, true);
            } catch (e) {
                // Keyframe seçme hatası olursa atla
            }
        }
    }
}

function selectKeys(arr) {
    for (var i = 0; i < arr.length; i++) {
        for (var x = 0; x < arr[i].times.length; x++) {
            try {
                var index = arr[i].prop.nearestKeyIndex(arr[i].times[x]);
                arr[i].prop.setSelectedAtKey(index, true);
            } catch (e) {
                // Keyframe seçme hatası olursa atla
            }
        }
    }
}

function timeToFrames(time) {
    return Math.round(time * 25); // 25 fps varsayılan değer, projeye göre ayarlanabilir
}

function findLowestTime(obj) {
    var time;
    var index;
    
    for (var i = 0; i < obj.length; i++) {
        if ((obj[i].times[0] < time) || (time === undefined)) { 
            time = obj[i].times[0];
            index = i;
        }
    }
    
    return [time, index];
}

function getPropKeyTimes(props) {
    var propsAndTimes = [];
    
    for (var i = 0; i < props.length; i++) {
        if (!props[i] || (props[i].propertyType !== PropertyType.PROPERTY) || 
            (props[i].selectedKeys === undefined)) { 
            continue;
        }
        
        if (props[i].selectedKeys && props[i].selectedKeys.length > 0) { 
            propsAndTimes.push({
                prop: props[i], 
                roving: getRovingFromKeys(props[i]), 
                times: getTimesFromKeys(props[i])
            });
        }
    }
    
    return propsAndTimes;
}

function getTimesFromKeys(prop) {
    var arr = [];
    
    if (!prop.selectedKeys) return arr;
    
    for (var i = 0; i < prop.selectedKeys.length; i++) {
        arr.push(prop.keyTime(prop.selectedKeys[i]));
    }
    
    return arr;
}

function getRovingFromKeys(prop) {
    var arr = [];
    
    if (!prop.selectedKeys) return arr;
    
    for (var i = 0; i < prop.selectedKeys.length; i++) {
        if (prop.keyRoving && prop.keyRoving(prop.selectedKeys[i])) {
            arr.push(prop.selectedKeys[i]);
        }
    }
    
    return arr;
}

function hasSelectedKeys(props) {
    if (!props || props.length === 0) { 
        return false;
    }
    
    var propsWithKeys = 0;
    
    for (var i = 0; i < props.length; i++) {
        if (!props[i] || (props[i].canVaryOverTime === false) || 
            (props[i].selectedKeys === undefined) || 
            (props[i].selectedKeys === null)) { 
            continue;
        }
        
        if (props[i].selectedKeys && props[i].selectedKeys.length > 0) { 
            propsWithKeys++;
            if (propsWithKeys > 1) { 
                return true;
            }
        }
    }
    
    if (propsWithKeys === 1) { 
        return 2;
    }
    
    return false;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}