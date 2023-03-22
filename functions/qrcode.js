"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRCodeSign = void 0;
const api_1 = require("../configs/api");
const request_1 = require("../utils/request");
const QRCodeSign = async (args) => {
    const { enc, name, fid, activeId, ...cookies } = args;
    const url = `${api_1.PPTSIGN.URL}?enc=${enc}&name=${encodeURI(name)}&activeId=${activeId}&uid=${cookies._uid}&clientip=&useragent=&latitude=-1&longitude=-1&fid=${fid}&appType=15`;
    const result = await (0, request_1.request)(url, {
        secure: true,
        headers: {
            Cookie: (0, request_1.cookieSerialize)(cookies),
        },
    });
    if (result.data === 'success') {
        console.log(`[二维码]签到成功`);
        return 'success';
    }
    else {
        console.log(result.data);
        return result.data;
    }
};
exports.QRCodeSign = QRCodeSign;
