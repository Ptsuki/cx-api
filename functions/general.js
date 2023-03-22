"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneralSign_2 = exports.GeneralSign = void 0;
const api_1 = require("../configs/api");
const request_1 = require("../utils/request");
const GeneralSign = async (args) => {
    const { name, activeId, fid, ...cookies } = args;
    const url = `${api_1.PPTSIGN.URL}?activeId=${activeId}&uid=${cookies._uid}&clientip=&latitude=-1&longitude=-1&appType=15&fid=${fid}&name=${name}`;
    const result = await (0, request_1.request)(url, {
        secure: true,
        headers: {
            Cookie: (0, request_1.cookieSerialize)(cookies),
        },
    });
    if (result.data === 'success') {
        console.log(`[通用]签到成功`);
        return 'success';
    }
    console.log(result.data);
    return result.data;
};
exports.GeneralSign = GeneralSign;
const GeneralSign_2 = async (args) => {
    const { activeId, ...cookies } = args;
    const url = `${api_1.CHAT_GROUP.SIGN.URL}?activeId=${activeId}&uid=${cookies._uid}&clientip=`;
    const result = await (0, request_1.request)(url, {
        secure: true,
        headers: {
            Cookie: (0, request_1.cookieSerialize)(cookies),
        },
    });
    if (result.data === 'success') {
        console.log(`[通用]签到成功`);
        return 'success';
    }
    console.log(result.data);
    return result.data;
};
exports.GeneralSign_2 = GeneralSign_2;
