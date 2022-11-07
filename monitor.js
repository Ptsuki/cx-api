"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prompts_1 = __importDefault(require("prompts"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const kolorist_1 = require("kolorist");
const jsdom_1 = __importDefault(require("jsdom"));
const ws_1 = __importDefault(require("ws"));
const JSDOM = new jsdom_1.default.JSDOM('', { url: 'https://im.chaoxing.com/webim/me' });
globalThis.window = JSDOM.window;
globalThis.WebSocket = ws_1.default;
globalThis.navigator = JSDOM.window.navigator;
globalThis.location = JSDOM.window.location;
const webIM = require('./utils/websdk3.1.4.js').default;
const helper_1 = require("./utils/helper");
(0, helper_1.extendGlobalThis)(globalThis);
const activity_1 = require("./functions/activity");
const general_1 = require("./functions/general");
const location_1 = require("./functions/location");
const photo_1 = require("./functions/photo");
const file_1 = require("./utils/file");
const user_1 = require("./functions/user");
const mailer_1 = require("./utils/mailer");
const PromptsOptions = {
    onCancel: () => {
        console.log((0, kolorist_1.red)('✖') + ' 操作取消');
        process.exit(0);
    }
};
const WebIMConfig = {
    xmppURL: "https://im-api-vip6-v2.easecdn.com/ws",
    apiURL: "https://a1-vip6.easecdn.com",
    appkey: 'cx-dev#cxstudy',
    Host: "easemob.com",
    https: true,
    isHttpDNS: false,
    isMultiLoginSessions: true,
    isAutoLogin: true,
    isWindowSDK: false,
    isSandBox: false,
    isDebug: false,
    autoReconnectNumMax: 2,
    autoReconnectInterval: 2,
    isWebRTC: false,
    heartBeatWait: 4500,
    delivery: false,
};
const conn = new webIM.connection({
    isMultiLoginSessions: WebIMConfig.isMultiLoginSessions,
    https: WebIMConfig.https,
    url: WebIMConfig.xmppURL,
    apiUrl: WebIMConfig.apiURL,
    isAutoLogin: WebIMConfig.isAutoLogin,
    heartBeatWait: WebIMConfig.heartBeatWait,
    autoReconnectNumMax: WebIMConfig.autoReconnectNumMax,
    autoReconnectInterval: WebIMConfig.autoReconnectInterval,
    appKey: WebIMConfig.appkey,
    isHttpDNS: WebIMConfig.isHttpDNS
});
async function configure(phone) {
    const config = (0, file_1.getStoredUser)(phone);
    if (process.argv[2] === '--auth') {
        if (config === null || !config.monitor) {
            console.log('未配置监听模式');
            process.send ? process.send('notconfigured') : null;
            process.exit(0);
        }
        else {
            return ({
                mailing: { ...config.mailing },
                monitor: { ...config.monitor }
            });
        }
    }
    let local = false;
    console.log((0, kolorist_1.blue)('自动签到支持 [普通/手势/拍照/签到码/位置]'));
    if (config?.monitor) {
        local = (await (0, prompts_1.default)({
            type: 'confirm',
            name: 'local',
            message: '是否用本地缓存的签到信息?',
            initial: true
        }, PromptsOptions)).local;
    }
    if (!local) {
        const response = await (0, prompts_1.default)([
            {
                type: 'text',
                name: 'lon',
                message: '位置签到经度',
                initial: '113.516288'
            },
            {
                type: 'text',
                name: 'lat',
                message: '位置签到纬度',
                initial: '34.817038'
            },
            {
                type: 'text',
                name: 'address',
                message: '详细地址'
            },
            {
                type: 'number',
                name: 'delay',
                message: '签到延时（单位：秒）',
                initial: 0
            },
            {
                type: 'confirm',
                name: 'mail',
                message: '是否启用邮件通知?',
                initial: false
            },
            {
                type: prev => prev ? 'text' : null,
                name: 'host',
                message: 'SMTP服务器',
                initial: 'smtp.qq.com'
            },
            {
                type: prev => prev ? 'confirm' : null,
                name: 'ssl',
                message: '是否启用SSL',
                initial: true
            },
            {
                type: prev => prev ? 'number' : null,
                name: 'port',
                message: '端口号',
                initial: 465
            },
            {
                type: prev => prev ? 'text' : null,
                name: 'user',
                message: '邮件账号',
                initial: 'xxxxxxxxx@qq.com'
            },
            {
                type: prev => prev ? 'text' : null,
                name: 'pass',
                message: '授权码(密码)'
            },
            {
                type: prev => prev ? 'text' : null,
                name: 'to',
                message: '接收邮箱'
            }
        ], PromptsOptions);
        const monitor = {}, mailing = {};
        monitor.delay = response.delay;
        monitor.lon = response.lon;
        monitor.lat = response.lat;
        monitor.address = response.address;
        mailing.host = response.host;
        mailing.ssl = response.ssl;
        mailing.port = response.port;
        mailing.user = response.user;
        mailing.pass = response.pass;
        mailing.to = response.to;
        config.monitor = monitor;
        config.mailing = mailing;
        const data = (0, file_1.getJsonObject)('configs/storage.json');
        for (let i = 0; i < data.users.length; i++) {
            if (data.users[i].phone === phone) {
                data.users[i].monitor = monitor;
                data.users[i].mailing = mailing;
                break;
            }
        }
        fs_1.default.writeFile(path_1.default.join(__dirname, './configs/storage.json'), JSON.stringify(data), 'utf8', () => { });
    }
    return (JSON.parse(JSON.stringify({ mailing: config.mailing, monitor: config.monitor })));
}
async function Sign(realname, params, config, activity) {
    let result = 'fail';
    if (activity.courseId === 'null') {
        let page = await (0, activity_1.preSign2)(params.uf, params._d, params.vc3, activity.aid, activity.chatID, params._uid, params.tuid);
        let activityType = (0, activity_1.speculateType)(page);
        switch (activityType) {
            case 'general': {
                result = await (0, general_1.GeneralSign_2)(params.uf, params._d, params.vc3, activity.aid, params._uid);
                break;
            }
            case 'photo': {
                let objectId = await (0, photo_1.getObjectIdFromcxPan)(params.uf, params._d, params.vc3, params._uid);
                result = await (0, photo_1.PhotoSign_2)(params.uf, params._d, params.vc3, activity.aid, params._uid, objectId);
                break;
            }
            case 'location': {
                result = await (0, location_1.LocationSign_2)(params.uf, params._d, params.vc3, config.address, activity.aid, params._uid, config.lat, config.lon);
                break;
            }
            case 'qr': {
                console.log((0, kolorist_1.red)('二维码签到，无法自动签到！'));
                break;
            }
        }
        return result;
    }
    await (0, activity_1.preSign)(params.uf, params._d, params.vc3, activity.aid, activity.classId, activity.courseId, params._uid);
    switch (activity.otherId) {
        case 2: {
            console.log((0, kolorist_1.red)('二维码签到，无法自动签到！'));
            break;
        }
        case 4: {
            result = await (0, location_1.LocationSign)(params.uf, params._d, params.vc3, realname, config.address, activity.aid, params._uid, config.lat, config.lon, params.fid);
            break;
        }
        case 3: {
            result = await (0, general_1.GeneralSign)(params.uf, params._d, params.vc3, realname, activity.aid, params._uid, params.fid);
            break;
        }
        case 5: {
            result = await (0, general_1.GeneralSign)(params.uf, params._d, params.vc3, realname, activity.aid, params._uid, params.fid);
            break;
        }
        case 0: {
            if (activity.ifphoto === 0) {
                result = await (0, general_1.GeneralSign)(params.uf, params._d, params.vc3, realname, activity.aid, params._uid, params.fid);
                break;
            }
            else {
                let objectId = await (0, photo_1.getObjectIdFromcxPan)(params.uf, params._d, params.vc3, params._uid);
                result = await (0, photo_1.PhotoSign)(params.uf, params._d, params.vc3, realname, activity.aid, params._uid, params.fid, objectId);
                break;
            }
        }
    }
    return result;
}
(async () => {
    let params = {};
    if (process.argv[2] === '--auth') {
        params.uf = process.argv[3];
        params._d = process.argv[4];
        params.vc3 = process.argv[5];
        params._uid = process.argv[6];
        params.lv = process.argv[7];
        params.fid = process.argv[8];
        params.phone = process.argv[9];
    }
    else {
        let userItem = (await (0, prompts_1.default)({ type: 'select', name: 'userItem', message: '选择用户', choices: (0, user_1.getLocalUsers)(), initial: 0 }, PromptsOptions)).userItem;
        if (userItem === -1) {
            let phone = (await (0, prompts_1.default)({ type: 'text', name: 'phone', message: '手机号' }, PromptsOptions)).phone;
            let password = (await (0, prompts_1.default)({ type: 'password', name: 'password', message: '密码' }, PromptsOptions)).password;
            params = await (0, user_1.userLogin)(phone, password);
            if (params === "AuthFailed")
                process.exit(0);
            (0, file_1.storeUser)(phone, { phone, params });
            params.phone = phone;
        }
        else {
            let user = (0, file_1.getJsonObject)('configs/storage.json').users[userItem];
            params = user.params;
            params.phone = user.phone;
        }
    }
    let IM_Params = await (0, user_1.getIMParams)(params.uf, params._d, params._uid, params.vc3);
    if (IM_Params === 'AuthFailed') {
        if (process.send)
            process.send('authfail');
        process.exit(0);
    }
    params.tuid = IM_Params.myTuid;
    const config = await configure(params.phone);
    conn.open({
        apiUrl: WebIMConfig.apiURL,
        user: IM_Params.myTuid,
        accessToken: IM_Params.myToken,
        appKey: WebIMConfig.appkey
    });
    console.log((0, kolorist_1.blue)('[监听中]'));
    conn.listen({
        onOpened: () => {
            if (process.send)
                process.send('success');
        },
        onClosed: () => {
            console.log('[监听停止]');
            process.exit(0);
        },
        onTextMessage: async (message) => {
            if (message?.ext?.attachment?.att_chat_course?.url.includes('sign')) {
                const IM_CourseInfo = {
                    aid: message.ext.attachment.att_chat_course.aid,
                    classId: message.ext.attachment.att_chat_course.courseInfo.classid,
                    courseId: message.ext.attachment.att_chat_course.courseInfo.courseid,
                };
                const PPTActiveInfo = await (0, activity_1.getPPTActiveInfo)(IM_CourseInfo.aid, params.uf, params._d, params._uid, params.vc3);
                if (IM_Params !== 'AuthFailed') {
                    await (0, helper_1.delay)(config.monitor.delay);
                    const result = await Sign(IM_Params.myName, params, config.monitor, {
                        classId: IM_CourseInfo.classId,
                        courseId: IM_CourseInfo.courseId,
                        aid: IM_CourseInfo.aid,
                        otherId: PPTActiveInfo.otherId,
                        ifphoto: PPTActiveInfo.ifphoto
                    });
                    if (config.mailing)
                        (0, mailer_1.sendEmail)(IM_CourseInfo.aid, params._uid, IM_Params.myName, result, config.mailing);
                }
            }
        },
        onError: (msg) => {
            console.log((0, kolorist_1.red)('[发生异常]'), msg);
            process.exit(0);
        },
    });
})();
