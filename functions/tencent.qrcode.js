"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrCodeScan = void 0;
const tencentcloud = require('tencentcloud-sdk-nodejs');
const OcrClient = tencentcloud.ocr.v20181119.Client;
const file_1 = require("../utils/file");
const ENVJSON = (0, file_1.getJsonObject)('env.json');
const QrCodeScan = async (base64str) => {
    const client = new OcrClient({
        credential: {
            secretId: ENVJSON.tencent.secretId,
            secretKey: ENVJSON.tencent.secretKey,
        },
        region: 'ap-shanghai',
        profile: {
            httpProfile: {
                endpoint: 'ocr.tencentcloudapi.com',
            },
        },
    });
    return await client.QrcodeOCR({
        ImageBase64: base64str,
    });
};
exports.QrCodeScan = QrCodeScan;
