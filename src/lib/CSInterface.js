/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global window, document, CSInterface*/

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

/**
 * CSInterface - v11.0.0
 */
function CSInterface() {
    this.hostEnvironment = window.__adobe_cep__ ? JSON.parse(window.__adobe_cep__.getHostEnvironment()) : null;
    this.hostCapabilities = window.__adobe_cep__ ? JSON.parse(window.__adobe_cep__.getHostCapabilities()) : null;
    this.appName = window.__adobe_cep__ ? this.hostEnvironment.appName : null;
    this.appVersion = window.__adobe_cep__ ? this.hostEnvironment.appVersion : null;
}

/**
 * Evaluates a JavaScript script, which can use the JavaScript DOM
 * of the host application.
 *
 * @param script    The JavaScript script.
 * @param callback  Optional. A callback function that receives the result of execution.
 *                 If execution fails, the callback function receives the error message \c EvalScript_ErrMessage.
 */
CSInterface.prototype.evalScript = function(script, callback) {
    if (window.__adobe_cep__) {
        window.__adobe_cep__.evalScript(script, callback);
    }
};

/**
 * Retrieves the extension ID.
 *
 * @return The extension ID.
 */
CSInterface.prototype.getExtensionID = function() {
    return window.__adobe_cep__ ? window.__adobe_cep__.getExtensionId() : null;
};