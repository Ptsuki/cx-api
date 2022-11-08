"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationSign_2 = exports.LocationSign = void 0;
const https_1 = __importDefault(require("https"));
const api_1 = require("../configs/api");
const LocationSign = async (uf, _d, vc3, name, address, activeId, uid, lat, lon, fid) => {
    let data = '';
    return new Promise((resolve) => {
        https_1.default.get(api_1.PPTSIGN.URL + `?name=${name}&address=${address}&activeId=${activeId}&uid=${uid}&clientip=&latitude=${lat}&longitude=${lon}&fid=${fid}&appType=15&ifTiJiao=1`, {
            headers: {
                'Cookie': `uf=${uf}; _d=${_d}; UID=${uid}; vc3=${vc3};`
            }
        }, (res) => {
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (data === 'success') {
                    console.log(`[位置]签到成功`);
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
exports.LocationSign = LocationSign;
const LocationSign_2 = (uf, _d, vc3, address, activeId, uid, lat, lon) => {
    let data = '';
    return new Promise((resolve) => {
        let post = https_1.default.request(api_1.CHAT_GROUP.SIGN.URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Cookie': `uf=${uf}; _d=${_d}; UID=${uid}; vc3=${vc3};`
            }
        }, (res) => {
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (data === 'success') {
                    console.log(`[位置]签到成功`);
                    resolve('success');
                }
                else {
                    console.log(data);
                    resolve(data);
                }
            });
        });
        let formdata = `address=${encodeURIComponent(address)}&activeId=${activeId}&uid=${uid}&clientip=&useragent=&latitude=${lat}&longitude=${lon}&fid=&ifTiJiao=1`;
        post.write(formdata);
        post.end();
    });
};
exports.LocationSign_2 = LocationSign_2;
