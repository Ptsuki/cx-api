"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kolorist_1 = require("kolorist");
const prompts_1 = __importDefault(require("prompts"));
const activity_1 = require("./functions/activity");
const general_1 = require("./functions/general");
const location_1 = require("./functions/location");
const photo_1 = require("./functions/photo");
const qrcode_1 = require("./functions/qrcode");
const user_1 = require("./functions/user");
const file_1 = require("./utils/file");
const PromptsOptions = {
    onCancel: () => {
        console.log((0, kolorist_1.red)('✖') + ' 操作取消');
        process.exit(0);
    },
};
!(async function () {
    let params;
    {
        let userItem = (await (0, prompts_1.default)({
            type: 'select',
            name: 'userItem',
            message: '选择用户',
            choices: (0, user_1.getLocalUsers)(),
            initial: 0,
        }, PromptsOptions)).userItem;
        if (userItem === -1) {
            let phone = (await (0, prompts_1.default)({ type: 'text', name: 'phone', message: '手机号' }, PromptsOptions)).phone;
            let password = (await (0, prompts_1.default)({ type: 'password', name: 'password', message: '密码' }, PromptsOptions)).password;
            params = await (0, user_1.userLogin)(phone, password);
            if (typeof params === 'string')
                process.exit(0);
            else
                (0, file_1.storeUser)(phone, { phone, params });
        }
        else {
            params = (0, file_1.getJsonObject)('configs/storage.json').users[userItem].params;
        }
        if (typeof params === 'string')
            return;
    }
    const name = await (0, user_1.getAccountInfo)(params);
    console.log((0, kolorist_1.blue)(`你好，${name}`));
    const courses = await (0, user_1.getCourses)(params._uid, params._d, params.vc3);
    if (typeof courses === 'string')
        process.exit(0);
    const activity = await (0, activity_1.traverseCourseActivity)({ courses, ...params });
    if (typeof activity === 'string')
        process.exit(0);
    else
        await (0, activity_1.preSign)({ ...activity, ...params });
    switch (activity.otherId) {
        case 2: {
            let enc = (await (0, prompts_1.default)({ type: 'text', name: 'enc', message: 'enc(微信或其他识别二维码，可得enc参数)' }, PromptsOptions))
                .enc;
            await (0, qrcode_1.QRCodeSign)({ ...params, activeId: activity.activeId, enc, name });
            process.exit(0);
        }
        case 4: {
            console.log('[获取经纬度]https://api.map.baidu.com/lbsapi/getpoint/index.html');
            const lnglat = (await (0, prompts_1.default)({ type: 'text', name: 'lnglat', message: '经纬度', initial: '113.516288,34.817038' }, PromptsOptions)).lnglat;
            const address = (await (0, prompts_1.default)({ type: 'text', name: 'address', message: '详细地址' })).address;
            const lat = lnglat.substring(lnglat.indexOf(',') + 1, lnglat.length);
            const lon = lnglat.substring(0, lnglat.indexOf(','));
            await (0, location_1.LocationSign)({
                ...activity,
                ...params,
                address,
                lat,
                lon,
                name,
            });
            process.exit(0);
        }
        case 3: {
            await (0, general_1.GeneralSign)({ ...activity, ...params, name });
            process.exit(0);
        }
        case 5: {
            await (0, general_1.GeneralSign)({ ...activity, ...params, name });
            process.exit(0);
        }
        case 0: {
            let photo = await (0, activity_1.getPPTActiveInfo)({ activeId: activity.activeId, ...params });
            if (photo.ifphoto === 1) {
                console.log('访问 https://pan-yz.chaoxing.com 并在根目录上传你想要提交的照片，格式为jpg或png，命名为 0.jpg 或 0.png');
                await (0, prompts_1.default)({ name: 'complete', type: 'confirm', message: '已上传完毕?' });
                let objectId = await (0, photo_1.getObjectIdFromcxPan)(params);
                if (objectId === null)
                    return null;
                await (0, photo_1.PhotoSign)({ ...params, activeId: activity.activeId, objectId, name });
            }
            else {
                await (0, general_1.GeneralSign)({ ...params, activeId: activity.activeId, name });
            }
            process.exit(0);
        }
    }
})();
