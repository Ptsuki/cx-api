"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRCodeSign = void 0;
const https_1 = __importDefault(require("https"));
const api_1 = require("../configs/api");
const QRCodeSign = async (enc, name, fid, uid, aid, uf, _d, vc3) => {
    return new Promise((resolve) => {
        let data = '';
        https_1.default.get(api_1.PPTSIGN.URL + `?enc=${enc}&name=${encodeURI(name)}&activeId=${aid}&uid=${uid}&clientip=&useragent=&latitude=-1&longitude=-1&fid=${fid}&appType=15`, {
            headers: {
                'Cookie': `uf=${uf}; _d=${_d}; UID=${uid}; vc3=${vc3};`
            }
        }, (res) => {
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (data === 'success') {
                    console.log(`[二维码]签到成功`);
                    resolve("success");
                }
                else {
                    console.log(data);
                    resolve(data);
                }
            });
        });
    });
};
exports.QRCodeSign = QRCodeSign;
