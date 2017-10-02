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
    var utils_1, fs, TO_PATCH_MACROTASK_METHODS;
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
            try {
                fs = require('fs');
            }
            catch (err) {
            }
            // watch, watchFile, unwatchFile has been patched
            // because EventEmitter has been patched
            TO_PATCH_MACROTASK_METHODS = [
                'access', 'appendFile', 'chmod', 'chown', 'close', 'exists', 'fchmod',
                'fchown', 'fdatasync', 'fstat', 'fsync', 'ftruncate', 'futimes', 'lchmod',
                'lchown', 'link', 'lstat', 'mkdir', 'mkdtemp', 'open', 'read',
                'readdir', 'readFile', 'readlink', 'realpath', 'rename', 'rmdir', 'stat',
                'symlink', 'truncate', 'unlink', 'utimes', 'write', 'writeFile',
            ];
            if (fs) {
                TO_PATCH_MACROTASK_METHODS.filter(function (name) { return !!fs[name] && typeof fs[name] === 'function'; })
                    .forEach(function (name) {
                    utils_1.patchMacroTask(fs, name, function (self, args) {
                        return {
                            name: 'fs.' + name,
                            args: args,
                            callbackIndex: args.length > 0 ? args.length - 1 : -1,
                            target: self
                        };
                    });
                });
            }
        }
    };
});
//# sourceMappingURL=fs.js.map