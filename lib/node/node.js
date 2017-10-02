/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
System.register(["../zone", "./events", "./fs", "../common/timers", "../common/utils"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function patchNextTick() {
        var setNative = null;
        function scheduleTask(task) {
            var args = task.data;
            args[0] = function () {
                task.invoke.apply(this, arguments);
            };
            setNative.apply(process, args);
            return task;
        }
        setNative =
            utils_1.patchMethod(process, 'nextTick', function (delegate) { return function (self, args) {
                if (typeof args[0] === 'function') {
                    var zone = Zone.current;
                    var task = zone.scheduleMicroTask('nextTick', args[0], args, scheduleTask);
                    return task;
                }
                else {
                    // cause an error by calling it directly.
                    return delegate.apply(process, args);
                }
            }; });
    }
    var timers_1, utils_1, set, clear, _global, timers, shouldPatchGlobalTimers, crypto, httpClient;
    return {
        setters: [
            function (_1) {
            },
            function (_2) {
            },
            function (_3) {
            },
            function (timers_1_1) {
                timers_1 = timers_1_1;
            },
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
            set = 'set';
            clear = 'clear';
            _global = typeof window === 'object' && window || typeof self === 'object' && self || global;
            // Timers
            timers = require('timers');
            timers_1.patchTimer(timers, set, clear, 'Timeout');
            timers_1.patchTimer(timers, set, clear, 'Interval');
            timers_1.patchTimer(timers, set, clear, 'Immediate');
            shouldPatchGlobalTimers = global.setTimeout !== timers.setTimeout;
            if (shouldPatchGlobalTimers) {
                timers_1.patchTimer(_global, set, clear, 'Timeout');
                timers_1.patchTimer(_global, set, clear, 'Interval');
                timers_1.patchTimer(_global, set, clear, 'Immediate');
            }
            patchNextTick();
            try {
                crypto = require('crypto');
            }
            catch (err) {
            }
            // TODO(gdi2290): implement a better way to patch these methods
            if (crypto) {
                var nativeRandomBytes_1 = crypto.randomBytes;
                crypto.randomBytes = function randomBytesZone(size, callback) {
                    if (!callback) {
                        return nativeRandomBytes_1(size);
                    }
                    else {
                        var zone = Zone.current;
                        var source = crypto.constructor.name + '.randomBytes';
                        return nativeRandomBytes_1(size, zone.wrap(callback, source));
                    }
                }.bind(crypto);
                var nativePbkdf2_1 = crypto.pbkdf2;
                crypto.pbkdf2 = function pbkdf2Zone() {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var fn = args[args.length - 1];
                    if (typeof fn === 'function') {
                        var zone = Zone.current;
                        var source = crypto.constructor.name + '.pbkdf2';
                        args[args.length - 1] = zone.wrap(fn, source);
                        return nativePbkdf2_1.apply(void 0, args);
                    }
                    else {
                        return nativePbkdf2_1.apply(void 0, args);
                    }
                }.bind(crypto);
            }
            try {
                httpClient = require('_http_client');
            }
            catch (err) {
            }
            if (httpClient && httpClient.ClientRequest) {
                var ClientRequest_1 = httpClient.ClientRequest.bind(httpClient);
                httpClient.ClientRequest = function (options, callback) {
                    if (!callback) {
                        return new ClientRequest_1(options);
                    }
                    else {
                        var zone = Zone.current;
                        return new ClientRequest_1(options, zone.wrap(callback, 'http.ClientRequest'));
                    }
                };
            }
        }
    };
});
//# sourceMappingURL=node.js.map