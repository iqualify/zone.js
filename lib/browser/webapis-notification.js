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
                // patch Notification
                patchNotification(_global);
                function patchNotification(_global) {
                    var Notification = _global['Notification'];
                    if (!Notification || !Notification.prototype) {
                        return;
                    }
                    utils_1.patchOnProperties(Notification.prototype, null);
                }
            })(typeof window === 'object' && window || typeof self === 'object' && self || global);
        }
    };
});
//# sourceMappingURL=webapis-notification.js.map