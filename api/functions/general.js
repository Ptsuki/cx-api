"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneralSign_2 = exports.GeneralSign = void 0;
const https_1 = __importDefault(require("https"));
const api_1 = require("../configs/api");
const GeneralSign = async (uf, _d, vc3, name, activeId, uid, fid) => {
    let data = '';
    return new Promise((resolve) => {
        https_1.default.get(api_1.PPTSIGN.URL + `?activeId=${activeId}&uid=${uid}&clientip=&latitude=-1&longitude=-1&appType=15&fid=${fid}&name=${name}`, {
            headers: {
                'Cookie': `uf=${uf}; _d=${_d}; UID=${uid}; vc3=${vc3};`
            }
        }, (res) => {
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (data === 'success') {
                    console.log(`[通用]签到成功`);
                    resolve('success');
                }
                else {
                    console.log(data);
                    resolve(data);
                }
            });
        });
    });
};
exports.GeneralSign = GeneralSign;
const GeneralSign_2 = async (uf, _d, vc3, activeId, uid) => {
    let data = '';
    return new Promise((resolve) => {
        https_1.default.get(api_1.CHAT_GROUP.SIGN.URL + `?activeId=${activeId}&uid=${uid}&clientip=`, {
            headers: {
                'Cookie': `uf=${uf}; _d=${_d}; UID=${uid}; vc3=${vc3};`
            }
        }, (res) => {
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (data === 'success') {
                    console.log(`[通用]签到成功`);
                    resolve('success');
                }
                else {
                    console.log(data);
                    resolve(data);
                }
            });
        });
    });
};
exports.GeneralSign_2 = GeneralSign_2;
