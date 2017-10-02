/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
System.register(["../common/utils"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function patchEventEmitterMethods(obj) {
        if (obj && obj.addListener) {
            utils_1.patchMethod(obj, EE_ADD_LISTENER, function () { return zoneAwareAddListener; });
            utils_1.patchMethod(obj, EE_PREPEND_LISTENER, function () { return zoneAwarePrependListener; });
            utils_1.patchMethod(obj, EE_REMOVE_LISTENER, function () { return zoneAwareRemoveListener; });
            utils_1.patchMethod(obj, EE_REMOVE_ALL_LISTENER, function () { return zoneAwareRemoveAllListeners; });
            utils_1.patchMethod(obj, EE_LISTENERS, function () { return zoneAwareListeners; });
            obj[EE_ON] = obj[EE_ADD_LISTENER];
            return true;
        }
        else {
            return false;
        }
    }
    exports_1("patchEventEmitterMethods", patchEventEmitterMethods);
    var utils_1, callAndReturnFirstParam, EE_ADD_LISTENER, EE_PREPEND_LISTENER, EE_REMOVE_LISTENER, EE_REMOVE_ALL_LISTENER, EE_LISTENERS, EE_ON, zoneAwareAddListener, zoneAwarePrependListener, zoneAwareRemoveListener, zoneAwareRemoveAllListeners, zoneAwareListeners, events;
    return {
        setters: [
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }
        ],
        execute: function () {/**
             * @license
             * Copyright Google Inc. All Rights Reserved.
             *
             * Use of this source code is governed by an MIT-style license that can be
             * found in the LICENSE file at https://angular.io/license
             */
            callAndReturnFirstParam = function (fn) {
                return function (self, args) {
                    fn(self, args);
                    return self;
                };
            };
            // For EventEmitter
            EE_ADD_LISTENER = 'addListener';
            EE_PREPEND_LISTENER = 'prependListener';
            EE_REMOVE_LISTENER = 'removeListener';
            EE_REMOVE_ALL_LISTENER = 'removeAllListeners';
            EE_LISTENERS = 'listeners';
            EE_ON = 'on';
            zoneAwareAddListener = callAndReturnFirstParam(utils_1.makeZoneAwareAddListener(EE_ADD_LISTENER, EE_REMOVE_LISTENER, false, true, false));
            zoneAwarePrependListener = callAndReturnFirstParam(utils_1.makeZoneAwareAddListener(EE_PREPEND_LISTENER, EE_REMOVE_LISTENER, false, true, true));
            zoneAwareRemoveListener = callAndReturnFirstParam(utils_1.makeZoneAwareRemoveListener(EE_REMOVE_LISTENER, false));
            zoneAwareRemoveAllListeners = callAndReturnFirstParam(utils_1.makeZoneAwareRemoveAllListeners(EE_REMOVE_ALL_LISTENER, false));
            zoneAwareListeners = utils_1.makeZoneAwareListeners(EE_LISTENERS);
            try {
                events = require('events');
            }
            catch (err) {
            }
            if (events && events.EventEmitter) {
                patchEventEmitterMethods(events.EventEmitter.prototype);
            }
        }
    };
});
//# sourceMappingURL=events.js.map