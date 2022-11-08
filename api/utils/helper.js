"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendGlobalThis = exports.delay = exports.promiseAny = void 0;
const promiseAny = (tasks) => {
    let length = tasks.length;
    return new Promise((resolve, reject) => {
        if (length === 0) {
            reject(new Error('All promises were rejected'));
            return;
        }
        tasks.forEach(promise => {
            promise.then(res => {
                resolve(res);
                return;
            }, reason => {
                length--;
                if (length === 0) {
                    reject(new Error('All promises were rejected'));
                    return;
                }
            });
        });
    });
};
exports.promiseAny = promiseAny;
function delay(timeout = 0) {
    return new Promise(res => setTimeout(() => res(), timeout * 1000));
}
exports.delay = delay;
function parseJSON(text) {
    try {
        return JSON.parse(text);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error(err);
            console.log('\nInvalid JSON: ' + text);
        }
    }
}
globalThis.JSON.parseJSON = parseJSON;
function extendGlobalThis(gl) {
    gl.JSON.parseJSON = parseJSON;
}
exports.extendGlobalThis = extendGlobalThis;
