"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPhoto = exports.getObjectIdFromcxPan = exports.PhotoSign_2 = exports.PhotoSign = void 0;
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const api_1 = require("../configs/api");
const os_1 = require("os");
const crypto_1 = require("crypto");
const PhotoSign = async (uf, _d, vc3, name, activeId, uid, fid, objectId) => {
    let data = '';
    return new Promise((resolve) => {
        https_1.default.get(api_1.PPTSIGN.URL + `?activeId=${activeId}&uid=${uid}&clientip=&useragent=&latitude=-1&longitude=-1&appType=15&fid=${fid}&objectId=${objectId}&name=${name}`, {
            headers: {
                'Cookie': `uf=${uf}; _d=${_d}; UID=${uid}; vc3=${vc3};`
            }
        }, (res) => {
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (data === 'success') {
                    console.log(`[拍照]签到成功`);
                    resolve('success');
                    return;
                }
                else {
                    resolve(data);
                }
            });
        });
    });
};
exports.PhotoSign = PhotoSign;
const PhotoSign_2 = (uf, _d, vc3, activeId, uid, objectId) => {
    let data = '';
    return new Promise((resolve) => {
        https_1.default.get(api_1.CHAT_GROUP.SIGN.URL + `?activeId=${activeId}&uid=${uid}&clientip=&useragent=&latitude=-1&longitude=-1&fid=0&objectId=${objectId}`, {
            headers: {
                'Cookie': `uf=${uf}; _d=${_d}; UID=${uid}; vc3=${vc3};`
            }
        }, (res) => {
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (data === 'success') {
                    console.log(`[拍照]签到成功`);
                    resolve('success');
                    return;
                }
                else {
                    resolve(data);
                }
            });
        });
    });
};
exports.PhotoSign_2 = PhotoSign_2;
const getObjectIdFromcxPan = (uf, _d, vc3, uid) => {
    let data = '';
    return new Promise((resolve) => {
        https_1.default.get(api_1.PANCHAOXING.URL, {
            headers: {
                'Cookie': `uf=${uf}; _d=${_d}; UID=${uid}; vc3=${vc3};`
            }
        }, (res) => {
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                let start_of_enc = data.indexOf('enc ="') + 6;
                let enc = data.slice(start_of_enc, data.indexOf('"', start_of_enc));
                let start_of_rootdir = data.indexOf('_rootdir = "') + 12;
                let parentId = data.slice(start_of_rootdir, data.indexOf('"', start_of_rootdir));
                let objectId = '';
                data = '';
                let postreq = https_1.default.request(api_1.PANLIST.URL + `?puid=0&shareid=0&parentId=${parentId}&page=1&size=50&enc=${enc}`, {
                    method: api_1.PANLIST.METHOD,
                    headers: {
                        'Cookie': `uf=${uf}; _d=${_d}; UID=${uid}; vc3=${vc3};`
                    }
                }, (res) => {
                    res.on('data', (chunk) => { data += chunk; });
                    res.on('end', () => {
                        let result = JSON.parseJSON(data);
                        for (let i = 0; i < result.list.length; i++) {
                            if (result.list[i].name == '0.jpg' || result.list[i].name == '0.png') {
                                objectId = result.list[i].objectId;
                                break;
                            }
                        }
                        if (objectId != '') {
                            resolve(objectId);
                        }
                        else {
                            console.log('未查询到符合的图片，请去网盘检查检查！');
                        }
                    });
                });
                postreq.write(`puid=0&shareid=0&parentId=${parentId}&page=1&size=50&enc=${enc}`);
                postreq.end();
            });
        });
    });
};
exports.getObjectIdFromcxPan = getObjectIdFromcxPan;
const uploadPhoto = async (uf, _d, _uid, vc3, token, buffer) => {
    const FormData = (await Promise.resolve().then(() => __importStar(require('form-data')))).default;
    let form = new FormData();
    let tempFilePath = path_1.default.join((0, os_1.tmpdir)(), (0, crypto_1.randomBytes)(16).toString('hex') + '.jpg');
    fs_1.default.writeFileSync(tempFilePath, buffer);
    let readStream = fs_1.default.createReadStream(tempFilePath);
    form.append('file', readStream);
    form.append('puid', _uid);
    return new Promise((resolve) => {
        let data = '';
        let request = https_1.default.request(api_1.PANUPLOAD.URL + '?_token=' + token, {
            method: api_1.PANUPLOAD.METHOD,
            headers: {
                'Cookie': `uf=${uf}; _d=${_d}; UID=${_uid}; vc3=${vc3};`,
                'Content-Type': `multipart/form-data;boundary=${form.getBoundary()}`
            }
        }, (res) => {
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                fs_1.default.unlink(tempFilePath, () => { });
                resolve(data);
            });
        });
        form.pipe(request);
    });
};
exports.uploadPhoto = uploadPhoto;
