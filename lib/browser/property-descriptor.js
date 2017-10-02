/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
System.register(["../common/utils", "./websocket"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function propertyDescriptorPatch(_global) {
        if (utils_1.isNode) {
            return;
        }
        var supportsWebSocket = typeof WebSocket !== 'undefined';
        if (canPatchViaPropertyDescriptor()) {
            // for browsers that we can patch the descriptor:  Chrome & Firefox
            if (utils_1.isBrowser) {
                utils_1.patchOnProperties(HTMLElement.prototype, eventNames);
            }
            utils_1.patchOnProperties(XMLHttpRequest.prototype, null);
            if (typeof IDBIndex !== 'undefined') {
                utils_1.patchOnProperties(IDBIndex.prototype, null);
                utils_1.patchOnProperties(IDBRequest.prototype, null);
                utils_1.patchOnProperties(IDBOpenDBRequest.prototype, null);
                utils_1.patchOnProperties(IDBDatabase.prototype, null);
                utils_1.patchOnProperties(IDBTransaction.prototype, null);
                utils_1.patchOnProperties(IDBCursor.prototype, null);
            }
            if (supportsWebSocket) {
                utils_1.patchOnProperties(WebSocket.prototype, null);
            }
        }
        else {
            // Safari, Android browsers (Jelly Bean)
            patchViaCapturingAllTheEvents();
            utils_1.patchClass('XMLHttpRequest');
            if (supportsWebSocket) {
                webSocketPatch.apply(_global);
            }
        }
    }
    exports_1("propertyDescriptorPatch", propertyDescriptorPatch);
    function canPatchViaPropertyDescriptor() {
        if (utils_1.isBrowser && !Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'onclick') &&
            typeof Element !== 'undefined') {
            // WebKit https://bugs.webkit.org/show_bug.cgi?id=134364
            // IDL interface attributes are not configurable
            var desc = Object.getOwnPropertyDescriptor(Element.prototype, 'onclick');
            if (desc && !desc.configurable)
                return false;
        }
        var xhrDesc = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'onreadystatechange');
        // add enumerable and configurable here because in opera
        // by default XMLHttpRequest.prototype.onreadystatechange is undefined
        // without adding enumerable and configurable will cause onreadystatechange
        // non-configurable
        Object.defineProperty(XMLHttpRequest.prototype, 'onreadystatechange', {
            enumerable: true,
            configurable: true,
            get: function () {
                return true;
            }
        });
        var req = new XMLHttpRequest();
        var result = !!req.onreadystatechange;
        // restore original desc
        Object.defineProperty(XMLHttpRequest.prototype, 'onreadystatechange', xhrDesc || {});
        return result;
    }
    // Whenever any eventListener fires, we check the eventListener target and all parents
    // for `onwhatever` properties and replace them with zone-bound functions
    // - Chrome (for now)
    function patchViaCapturingAllTheEvents() {
        var _loop_1 = function (i) {
            var property = eventNames[i];
            var onproperty = 'on' + property;
            self.addEventListener(property, function (event) {
                var elt = event.target, bound, source;
                if (elt) {
                    source = elt.constructor['name'] + '.' + onproperty;
                }
                else {
                    source = 'unknown.' + onproperty;
                }
                while (elt) {
                    if (elt[onproperty] && !elt[onproperty][unboundKey]) {
                        bound = Zone.current.wrap(elt[onproperty], source);
                        bound[unboundKey] = elt[onproperty];
                        elt[onproperty] = bound;
                    }
                    elt = elt.parentElement;
                }
            }, true);
        };
        for (var i = 0; i < eventNames.length; i++) {
            _loop_1(i);
        }
        ;
    }
    var utils_1, webSocketPatch, eventNames, unboundKey;
    return {
        setters: [
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (webSocketPatch_1) {
                webSocketPatch = webSocketPatch_1;
            }
        ],
        execute: function () {/**
             * @license
             * Copyright Google Inc. All Rights Reserved.
             *
             * Use of this source code is governed by an MIT-style license that can be
             * found in the LICENSE file at https://angular.io/license
             */
            eventNames = 'copy cut paste abort blur focus canplay canplaythrough change click contextmenu dblclick drag dragend dragenter dragleave dragover dragstart drop durationchange emptied ended input invalid keydown keypress keyup load loadeddata loadedmetadata loadstart message mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup pause play playing progress ratechange reset scroll seeked seeking select show stalled submit suspend timeupdate volumechange waiting mozfullscreenchange mozfullscreenerror mozpointerlockchange mozpointerlockerror error webglcontextrestored webglcontextlost webglcontextcreationerror'
                .split(' ');
            ;
            unboundKey = utils_1.zoneSymbol('unbound');
            ;
        }
    };
});
//# sourceMappingURL=property-descriptor.js.map