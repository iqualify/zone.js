System.register(["../common/utils"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var utils_1;
    return {
        setters: [
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }
        ],
        execute: function () {
            (function (_global) {
                // patch MediaQuery
                patchMediaQuery(_global);
                function patchMediaQuery(_global) {
                    if (!_global['MediaQueryList']) {
                        return;
                    }
                    utils_1.patchEventTargetMethods(_global['MediaQueryList'].prototype, 'addListener', 'removeListener', function (self, args) {
                        return {
                            useCapturing: false,
                            eventName: 'mediaQuery',
                            handler: args[0],
                            target: self || _global,
                            name: 'mediaQuery',
                            invokeAddFunc: function (addFnSymbol, delegate) {
                                if (delegate && delegate.invoke) {
                                    return this.target[addFnSymbol](delegate.invoke);
                                }
                                else {
                                    return this.target[addFnSymbol](delegate);
                                }
                            },
                            invokeRemoveFunc: function (removeFnSymbol, delegate) {
                                if (delegate && delegate.invoke) {
                                    return this.target[removeFnSymbol](delegate.invoke);
                                }
                                else {
                                    return this.target[removeFnSymbol](delegate);
                                }
                            }
                        };
                    });
                }
            })(typeof window === 'object' && window || typeof self === 'object' && self || global);
        }
    };
});
//# sourceMappingURL=webapis-media-query.js.map