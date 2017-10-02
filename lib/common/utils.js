/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Suppress closure compiler errors about unknown 'Zone' variable
 * @fileoverview
 * @suppress {undefinedVars}
 */
System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function bindArguments(args, source) {
        for (var i = args.length - 1; i >= 0; i--) {
            if (typeof args[i] === 'function') {
                args[i] = Zone.current.wrap(args[i], source + '_' + i);
            }
        }
        return args;
    }
    exports_1("bindArguments", bindArguments);
    function patchPrototype(prototype, fnNames) {
        var source = prototype.constructor['name'];
        var _loop_1 = function (i) {
            var name_1 = fnNames[i];
            var delegate = prototype[name_1];
            if (delegate) {
                prototype[name_1] = (function (delegate) {
                    return function () {
                        return delegate.apply(this, bindArguments(arguments, source + '.' + name_1));
                    };
                })(delegate);
            }
        };
        for (var i = 0; i < fnNames.length; i++) {
            _loop_1(i);
        }
    }
    exports_1("patchPrototype", patchPrototype);
    function patchProperty(obj, prop) {
        var desc = Object.getOwnPropertyDescriptor(obj, prop) || { enumerable: true, configurable: true };
        var originalDesc = Object.getOwnPropertyDescriptor(obj, 'original' + prop);
        if (!originalDesc && desc.get) {
            Object.defineProperty(obj, 'original' + prop, { enumerable: false, configurable: true, get: desc.get });
        }
        // A property descriptor cannot have getter/setter and be writable
        // deleting the writable and value properties avoids this error:
        //
        // TypeError: property descriptors must not specify a value or be writable when a
        // getter or setter has been specified
        delete desc.writable;
        delete desc.value;
        // substr(2) cuz 'onclick' -> 'click', etc
        var eventName = prop.substr(2);
        var _prop = '_' + prop;
        desc.set = function (fn) {
            if (this[_prop]) {
                this.removeEventListener(eventName, this[_prop]);
            }
            if (typeof fn === 'function') {
                var wrapFn = function (event) {
                    var result;
                    result = fn.apply(this, arguments);
                    if (result != undefined && !result)
                        event.preventDefault();
                };
                this[_prop] = wrapFn;
                this.addEventListener(eventName, wrapFn, false);
            }
            else {
                this[_prop] = null;
            }
        };
        // The getter would return undefined for unassigned properties but the default value of an
        // unassigned property is null
        desc.get = function () {
            var r = this[_prop] || null;
            // result will be null when use inline event attribute,
            // such as <button onclick="func();">OK</button>
            // because the onclick function is internal raw uncompiled handler
            // the onclick will be evaluated when first time event was triggered or
            // the property is accessed, https://github.com/angular/zone.js/issues/525
            // so we should use original native get to retrieve the handler
            if (r === null) {
                if (originalDesc && originalDesc.get) {
                    r = originalDesc.get.apply(this, arguments);
                    if (r) {
                        desc.set.apply(this, [r]);
                        if (typeof this['removeAttribute'] === 'function') {
                            this.removeAttribute(prop);
                        }
                    }
                }
            }
            return this[_prop] || null;
        };
        Object.defineProperty(obj, prop, desc);
    }
    exports_1("patchProperty", patchProperty);
    function patchOnProperties(obj, properties) {
        var onProperties = [];
        for (var prop in obj) {
            if (prop.substr(0, 2) == 'on') {
                onProperties.push(prop);
            }
        }
        for (var j = 0; j < onProperties.length; j++) {
            patchProperty(obj, onProperties[j]);
        }
        if (properties) {
            for (var i = 0; i < properties.length; i++) {
                patchProperty(obj, 'on' + properties[i]);
            }
        }
    }
    exports_1("patchOnProperties", patchOnProperties);
    function findExistingRegisteredTask(target, handler, name, capture, remove) {
        var eventTasks = target[EVENT_TASKS];
        if (eventTasks) {
            for (var i = 0; i < eventTasks.length; i++) {
                var eventTask = eventTasks[i];
                var data = eventTask.data;
                var listener = data.handler;
                if ((data.handler === handler || listener.listener === handler) &&
                    data.useCapturing === capture && data.eventName === name) {
                    if (remove) {
                        eventTasks.splice(i, 1);
                    }
                    return eventTask;
                }
            }
        }
        return null;
    }
    function findAllExistingRegisteredTasks(target, name, capture, remove) {
        var eventTasks = target[EVENT_TASKS];
        if (eventTasks) {
            var result = [];
            for (var i = eventTasks.length - 1; i >= 0; i--) {
                var eventTask = eventTasks[i];
                var data = eventTask.data;
                if (data.eventName === name && data.useCapturing === capture) {
                    result.push(eventTask);
                    if (remove) {
                        eventTasks.splice(i, 1);
                    }
                }
            }
            return result;
        }
        return null;
    }
    function attachRegisteredEvent(target, eventTask, isPrepend) {
        var eventTasks = target[EVENT_TASKS];
        if (!eventTasks) {
            eventTasks = target[EVENT_TASKS] = [];
        }
        if (isPrepend) {
            eventTasks.unshift(eventTask);
        }
        else {
            eventTasks.push(eventTask);
        }
    }
    function makeZoneAwareAddListener(addFnName, removeFnName, useCapturingParam, allowDuplicates, isPrepend, metaCreator) {
        if (useCapturingParam === void 0) { useCapturingParam = true; }
        if (allowDuplicates === void 0) { allowDuplicates = false; }
        if (isPrepend === void 0) { isPrepend = false; }
        if (metaCreator === void 0) { metaCreator = defaultListenerMetaCreator; }
        var addFnSymbol = zoneSymbol(addFnName);
        var removeFnSymbol = zoneSymbol(removeFnName);
        var defaultUseCapturing = useCapturingParam ? false : undefined;
        function scheduleEventListener(eventTask) {
            var meta = eventTask.data;
            attachRegisteredEvent(meta.target, eventTask, isPrepend);
            return meta.invokeAddFunc(addFnSymbol, eventTask);
        }
        function cancelEventListener(eventTask) {
            var meta = eventTask.data;
            findExistingRegisteredTask(meta.target, eventTask.invoke, meta.eventName, meta.useCapturing, true);
            return meta.invokeRemoveFunc(removeFnSymbol, eventTask);
        }
        return function zoneAwareAddListener(self, args) {
            var data = metaCreator(self, args);
            data.useCapturing = data.useCapturing || defaultUseCapturing;
            // - Inside a Web Worker, `this` is undefined, the context is `global`
            // - When `addEventListener` is called on the global context in strict mode, `this` is undefined
            // see https://github.com/angular/zone.js/issues/190
            var delegate = null;
            if (typeof data.handler == 'function') {
                delegate = data.handler;
            }
            else if (data.handler && data.handler.handleEvent) {
                delegate = function (event) { return data.handler.handleEvent(event); };
            }
            var validZoneHandler = false;
            try {
                // In cross site contexts (such as WebDriver frameworks like Selenium),
                // accessing the handler object here will cause an exception to be thrown which
                // will fail tests prematurely.
                validZoneHandler = data.handler && data.handler.toString() === '[object FunctionWrapper]';
            }
            catch (e) {
                // Returning nothing here is fine, because objects in a cross-site context are unusable
                return;
            }
            // Ignore special listeners of IE11 & Edge dev tools, see
            // https://github.com/angular/zone.js/issues/150
            if (!delegate || validZoneHandler) {
                return data.invokeAddFunc(addFnSymbol, data.handler);
            }
            if (!allowDuplicates) {
                var eventTask = findExistingRegisteredTask(data.target, data.handler, data.eventName, data.useCapturing, false);
                if (eventTask) {
                    // we already registered, so this will have noop.
                    return data.invokeAddFunc(addFnSymbol, eventTask);
                }
            }
            var zone = Zone.current;
            var source = data.target.constructor['name'] + '.' + addFnName + ':' + data.eventName;
            zone.scheduleEventTask(source, delegate, data, scheduleEventListener, cancelEventListener);
        };
    }
    exports_1("makeZoneAwareAddListener", makeZoneAwareAddListener);
    function makeZoneAwareRemoveListener(fnName, useCapturingParam, metaCreator) {
        if (useCapturingParam === void 0) { useCapturingParam = true; }
        if (metaCreator === void 0) { metaCreator = defaultListenerMetaCreator; }
        var symbol = zoneSymbol(fnName);
        var defaultUseCapturing = useCapturingParam ? false : undefined;
        return function zoneAwareRemoveListener(self, args) {
            var data = metaCreator(self, args);
            data.useCapturing = data.useCapturing || defaultUseCapturing;
            // - Inside a Web Worker, `this` is undefined, the context is `global`
            // - When `addEventListener` is called on the global context in strict mode, `this` is undefined
            // see https://github.com/angular/zone.js/issues/190
            var eventTask = findExistingRegisteredTask(data.target, data.handler, data.eventName, data.useCapturing, true);
            if (eventTask) {
                eventTask.zone.cancelTask(eventTask);
            }
            else {
                data.invokeRemoveFunc(symbol, data.handler);
            }
        };
    }
    exports_1("makeZoneAwareRemoveListener", makeZoneAwareRemoveListener);
    function makeZoneAwareRemoveAllListeners(fnName, useCapturingParam) {
        if (useCapturingParam === void 0) { useCapturingParam = true; }
        var symbol = zoneSymbol(fnName);
        var defaultUseCapturing = useCapturingParam ? false : undefined;
        return function zoneAwareRemoveAllListener(self, args) {
            var target = self || _global;
            if (args.length === 0) {
                // remove all listeners without eventName
                target[EVENT_TASKS] = [];
                // we don't cancel Task either, because call native eventEmitter.removeAllListeners will
                // will do remove listener(cancelTask) for us
                target[symbol]();
                return;
            }
            var eventName = args[0];
            var useCapturing = args[1] || defaultUseCapturing;
            // call this function just remove the related eventTask from target[EVENT_TASKS]
            findAllExistingRegisteredTasks(target, eventName, useCapturing, true);
            // we don't need useCapturing here because useCapturing is just for DOM, and
            // removeAllListeners should only be called by node eventEmitter
            // and we don't cancel Task either, because call native eventEmitter.removeAllListeners will
            // will do remove listener(cancelTask) for us
            target[symbol](eventName);
        };
    }
    exports_1("makeZoneAwareRemoveAllListeners", makeZoneAwareRemoveAllListeners);
    function makeZoneAwareListeners(fnName) {
        var symbol = zoneSymbol(fnName);
        return function zoneAwareEventListeners(self, args) {
            var eventName = args[0];
            var target = self || _global;
            if (!target[EVENT_TASKS]) {
                return [];
            }
            return target[EVENT_TASKS]
                .filter(function (task) { return task.data.eventName === eventName; })
                .map(function (task) { return task.data.handler; });
        };
    }
    exports_1("makeZoneAwareListeners", makeZoneAwareListeners);
    function patchEventTargetMethods(obj, addFnName, removeFnName, metaCreator) {
        if (addFnName === void 0) { addFnName = ADD_EVENT_LISTENER; }
        if (removeFnName === void 0) { removeFnName = REMOVE_EVENT_LISTENER; }
        if (metaCreator === void 0) { metaCreator = defaultListenerMetaCreator; }
        if (obj && obj[addFnName]) {
            patchMethod(obj, addFnName, function () { return makeZoneAwareAddListener(addFnName, removeFnName, true, false, false, metaCreator); });
            patchMethod(obj, removeFnName, function () { return makeZoneAwareRemoveListener(removeFnName, true, metaCreator); });
            return true;
        }
        else {
            return false;
        }
    }
    exports_1("patchEventTargetMethods", patchEventTargetMethods);
    // wrap some native API on `window`
    function patchClass(className) {
        var OriginalClass = _global[className];
        if (!OriginalClass)
            return;
        _global[className] = function () {
            var a = bindArguments(arguments, className);
            switch (a.length) {
                case 0:
                    this[originalInstanceKey] = new OriginalClass();
                    break;
                case 1:
                    this[originalInstanceKey] = new OriginalClass(a[0]);
                    break;
                case 2:
                    this[originalInstanceKey] = new OriginalClass(a[0], a[1]);
                    break;
                case 3:
                    this[originalInstanceKey] = new OriginalClass(a[0], a[1], a[2]);
                    break;
                case 4:
                    this[originalInstanceKey] = new OriginalClass(a[0], a[1], a[2], a[3]);
                    break;
                default:
                    throw new Error('Arg list too long.');
            }
        };
        var instance = new OriginalClass(function () { });
        var prop;
        for (prop in instance) {
            // https://bugs.webkit.org/show_bug.cgi?id=44721
            if (className === 'XMLHttpRequest' && prop === 'responseBlob')
                continue;
            (function (prop) {
                if (typeof instance[prop] === 'function') {
                    _global[className].prototype[prop] = function () {
                        return this[originalInstanceKey][prop].apply(this[originalInstanceKey], arguments);
                    };
                }
                else {
                    Object.defineProperty(_global[className].prototype, prop, {
                        set: function (fn) {
                            if (typeof fn === 'function') {
                                this[originalInstanceKey][prop] = Zone.current.wrap(fn, className + '.' + prop);
                            }
                            else {
                                this[originalInstanceKey][prop] = fn;
                            }
                        },
                        get: function () {
                            return this[originalInstanceKey][prop];
                        }
                    });
                }
            }(prop));
        }
        for (prop in OriginalClass) {
            if (prop !== 'prototype' && OriginalClass.hasOwnProperty(prop)) {
                _global[className][prop] = OriginalClass[prop];
            }
        }
    }
    exports_1("patchClass", patchClass);
    function createNamedFn(name, delegate) {
        try {
            return (Function('f', "return function " + name + "(){return f(this, arguments)}"))(delegate);
        }
        catch (e) {
            // if we fail, we must be CSP, just return delegate.
            return function () {
                return delegate(this, arguments);
            };
        }
    }
    exports_1("createNamedFn", createNamedFn);
    function patchMethod(target, name, patchFn) {
        var proto = target;
        while (proto && Object.getOwnPropertyNames(proto).indexOf(name) === -1) {
            proto = Object.getPrototypeOf(proto);
        }
        if (!proto && target[name]) {
            // somehow we did not find it, but we can see it. This happens on IE for Window properties.
            proto = target;
        }
        var delegateName = zoneSymbol(name);
        var delegate;
        if (proto && !(delegate = proto[delegateName])) {
            delegate = proto[delegateName] = proto[name];
            proto[name] = createNamedFn(name, patchFn(delegate, delegateName, name));
        }
        return delegate;
    }
    exports_1("patchMethod", patchMethod);
    // TODO: support cancel task later if necessary
    function patchMacroTask(obj, funcName, metaCreator) {
        var setNative = null;
        function scheduleTask(task) {
            var data = task.data;
            data.args[data.callbackIndex] = function () {
                task.invoke.apply(this, arguments);
            };
            setNative.apply(data.target, data.args);
            return task;
        }
        setNative = patchMethod(obj, funcName, function (delegate) { return function (self, args) {
            var meta = metaCreator(self, args);
            if (meta.callbackIndex >= 0 && typeof args[meta.callbackIndex] === 'function') {
                var task = Zone.current.scheduleMacroTask(meta.name, args[meta.callbackIndex], meta, scheduleTask, null);
                return task;
            }
            else {
                // cause an error by calling it directly.
                return delegate.apply(self, args);
            }
        }; });
    }
    exports_1("patchMacroTask", patchMacroTask);
    var zoneSymbol, _global, isWebWorker, isNode, isBrowser, EVENT_TASKS, ADD_EVENT_LISTENER, REMOVE_EVENT_LISTENER, defaultListenerMetaCreator, zoneAwareAddEventListener, zoneAwareRemoveEventListener, originalInstanceKey;
    return {
        setters: [],
        execute: function () {/**
             * @license
             * Copyright Google Inc. All Rights Reserved.
             *
             * Use of this source code is governed by an MIT-style license that can be
             * found in the LICENSE file at https://angular.io/license
             */
            /**
             * Suppress closure compiler errors about unknown 'Zone' variable
             * @fileoverview
             * @suppress {undefinedVars}
             */
            exports_1("zoneSymbol", zoneSymbol = function (n) { return "__zone_symbol__" + n; });
            _global = typeof window === 'object' && window || typeof self === 'object' && self || global;
            exports_1("isWebWorker", isWebWorker = (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope));
            exports_1("isNode", isNode = (!('nw' in _global) && typeof process !== 'undefined' &&
                {}.toString.call(process) === '[object process]'));
            exports_1("isBrowser", isBrowser = !isNode && !isWebWorker && !!(typeof window !== 'undefined' && window['HTMLElement']));
            ;
            ;
            EVENT_TASKS = zoneSymbol('eventTasks');
            // For EventTarget
            ADD_EVENT_LISTENER = 'addEventListener';
            REMOVE_EVENT_LISTENER = 'removeEventListener';
            defaultListenerMetaCreator = function (self, args) {
                return {
                    useCapturing: args[2],
                    eventName: args[0],
                    handler: args[1],
                    target: self || _global,
                    name: args[0],
                    invokeAddFunc: function (addFnSymbol, delegate) {
                        if (delegate && delegate.invoke) {
                            return this.target[addFnSymbol](this.eventName, delegate.invoke, this.useCapturing);
                        }
                        else {
                            return this.target[addFnSymbol](this.eventName, delegate, this.useCapturing);
                        }
                    },
                    invokeRemoveFunc: function (removeFnSymbol, delegate) {
                        if (delegate && delegate.invoke) {
                            return this.target[removeFnSymbol](this.eventName, delegate.invoke, this.useCapturing);
                        }
                        else {
                            return this.target[removeFnSymbol](this.eventName, delegate, this.useCapturing);
                        }
                    }
                };
            };
            zoneAwareAddEventListener = makeZoneAwareAddListener(ADD_EVENT_LISTENER, REMOVE_EVENT_LISTENER);
            zoneAwareRemoveEventListener = makeZoneAwareRemoveListener(REMOVE_EVENT_LISTENER);
            originalInstanceKey = zoneSymbol('originalInstance');
            ;
        }
    };
});
//# sourceMappingURL=utils.js.map