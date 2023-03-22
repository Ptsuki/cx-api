"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationSign_2 = exports.LocationSign = void 0;
const api_1 = require("../configs/api");
const request_1 = require("../utils/request");
const LocationSign = async (args) => {
    const { name, address, activeId, lat, lon, fid, ...cookies } = args;
    const url = `${api_1.PPTSIGN.URL}?name=${name}&address=${address}&activeId=${activeId}&uid=${cookies._uid}&clientip=&latitude=${lat}&longitude=${lon}&fid=${fid}&appType=15&ifTiJiao=1`;
    const result = await (0, request_1.request)(url, {
        secure: true,
        headers: {
            Cookie: (0, request_1.cookieSerialize)(cookies),
        },
    });
    if (result.data === 'success') {
        console.log(`[位置]签到成功`);
        return 'success';
    }
    console.log(result.data);
    return result.data;
};
exports.LocationSign = LocationSign;
const LocationSign_2 = async (args) => {
    const { name, address, activeId, lat, lon, fid, ...cookies } = args;
    let formdata = `address=${encodeURIComponent(address)}&activeId=${activeId}&uid=${cookies._uid}&clientip=&useragent=&latitude=${lat}&longitude=${lon}&fid=&ifTiJiao=1`;
    const result = await (0, request_1.request)(api_1.CHAT_GROUP.SIGN.URL, {
        secure: true,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Cookie: (0, request_1.cookieSerialize)(cookies),
        },
    }, formdata);
    if (result.data === 'success') {
        console.log(`[位置]签到成功`);
        return 'success';
    }
    console.log(result.data);
    return result.data;
};
exports.LocationSign_2 = LocationSign_2;
