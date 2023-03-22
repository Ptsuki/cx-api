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
const activity_1 = require("./functions/activity");
const general_1 = require("./functions/general");
const location_1 = require("./functions/location");
const photo_1 = require("./functions/photo");
const file_1 = require("./utils/file");
const user_1 = require("./functions/user");
const mailer_1 = require("./utils/mailer");
const helper_1 = require("./utils/helper");
const JSDOM = new jsdom_1.default.JSDOM('', { url: 'https://im.chaoxing.com/webim/me' });
globalThis.window = JSDOM.window;
globalThis.WebSocket = ws_1.default;
globalThis.navigator = JSDOM.window.navigator;
globalThis.location = JSDOM.window.location;
const webIM = require('./utils/websdk3.1.4.js').default;
const PromptsOptions = {
    onCancel: () => {
        console.log((0, kolorist_1.red)('✖') + ' 操作取消');
        process.exit(0);
    },
};
const WebIMConfig = {
    xmppURL: 'https://im-api-vip6-v2.easecdn.com/ws',
    apiURL: 'https://a1-vip6.easecdn.com',
    appkey: 'cx-dev#cxstudy',
    Host: 'easemob.com',
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
    isHttpDNS: WebIMConfig.isHttpDNS,
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
            return {
                mailing: { ...config.mailing },
                monitor: { ...config.monitor },
            };
        }
    }
    let local = false;
    console.log((0, kolorist_1.blue)('自动签到支持 [普通/手势/拍照/签到码/位置]'));
    if (config?.monitor) {
        local = (await (0, prompts_1.default)({
            type: 'confirm',
            name: 'local',
            message: '是否用本地缓存的签到信息?',
            initial: true,
        }, PromptsOptions)).local;
    }
    if (!local) {
        const response = await (0, prompts_1.default)([
            {
                type: 'text',
                name: 'lon',
                message: '位置签到经度',
                initial: '113.516288',
            },
            {
                type: 'text',
                name: 'lat',
                message: '位置签到纬度',
                initial: '34.817038',
            },
            {
                type: 'text',
                name: 'address',
                message: '详细地址',
            },
            {
                type: 'number',
                name: 'delay',
                message: '签到延时（单位：秒）',
                initial: 0,
            },
            {
                type: 'confirm',
                name: 'mail',
                message: '是否启用邮件通知?',
                initial: false,
            },
            {
                type: (prev) => (prev ? 'text' : null),
                name: 'host',
                message: 'SMTP服务器',
                initial: 'smtp.qq.com',
            },
            {
                type: (prev) => (prev ? 'confirm' : null),
                name: 'ssl',
                message: '是否启用SSL',
                initial: true,
            },
            {
                type: (prev) => (prev ? 'number' : null),
                name: 'port',
                message: '端口号',
                initial: 465,
            },
            {
                type: (prev) => (prev ? 'text' : null),
                name: 'user',
                message: '邮件账号',
                initial: 'xxxxxxxxx@qq.com',
            },
            {
                type: (prev) => (prev ? 'text' : null),
                name: 'pass',
                message: '授权码(密码)',
            },
            {
                type: (prev) => (prev ? 'text' : null),
                name: 'to',
                message: '接收邮箱',
            },
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
    return JSON.parse(JSON.stringify({ mailing: config.mailing, monitor: config.monitor }));
}
async function Sign(realname, params, config, activity) {
    let result = 'fail';
    if (!activity.courseId) {
        let page = await (0, activity_1.preSign2)({ ...activity, ...params, chatId: activity.chatId });
        let activityType = (0, activity_1.speculateType)(page);
        switch (activityType) {
            case 'general': {
                result = await (0, general_1.GeneralSign_2)({ activeId: activity.activeId, ...params });
                break;
            }
            case 'photo': {
                let objectId = await (0, photo_1.getObjectIdFromcxPan)(params);
                if (objectId === null)
                    return null;
                result = await (0, photo_1.PhotoSign_2)({ objectId, activeId: activity.activeId, ...params });
                break;
            }
            case 'location': {
                result = await (0, location_1.LocationSign_2)({
                    name: realname,
                    address: config.address,
                    activeId: activity.activeId,
                    lat: config.lat,
                    lon: config.lon,
                    ...params,
                });
                break;
            }
            case 'qr': {
                console.log((0, kolorist_1.red)('二维码签到，无法自动签到！'));
                break;
            }
        }
        return result;
    }
    await (0, activity_1.preSign)({ ...activity, ...params });
    switch (activity.otherId) {
        case 2: {
            console.log((0, kolorist_1.red)('二维码签到，无法自动签到！'));
            break;
        }
        case 4: {
            result = await (0, location_1.LocationSign)({
                name: realname,
                address: config.address,
                activeId: activity.activeId,
                lat: config.lat,
                lon: config.lon,
                ...params,
            });
            break;
        }
        case 3: {
            result = await (0, general_1.GeneralSign)({ name: realname, activeId: activity.activeId, ...params });
            break;
        }
        case 5: {
            result = await (0, general_1.GeneralSign)({ name: realname, activeId: activity.activeId, ...params });
            break;
        }
        case 0: {
            if (activity.ifphoto === 0) {
                result = await (0, general_1.GeneralSign)({ name: realname, activeId: activity.activeId, ...params });
                break;
            }
            else {
                let objectId = await (0, photo_1.getObjectIdFromcxPan)(params);
                if (objectId === null)
                    return null;
                result = await (0, photo_1.PhotoSign)({ name: realname, activeId: activity.activeId, objectId, ...params });
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
            if (params === 'AuthFailed')
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
    let IM_Params = await (0, user_1.getIMParams)(params);
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
        appKey: WebIMConfig.appkey,
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
                    classId: message.ext.attachment.att_chat_course?.courseInfo?.classid,
                    courseId: message.ext.attachment.att_chat_course?.courseInfo?.courseid,
                };
                const PPTActiveInfo = await (0, activity_1.getPPTActiveInfo)({ activeId: IM_CourseInfo.aid, ...params });
                if (IM_Params !== 'AuthFailed') {
                    await (0, helper_1.delay)(config.monitor.delay);
                    const result = await Sign(IM_Params.myName, params, config.monitor, {
                        classId: IM_CourseInfo.classId,
                        courseId: IM_CourseInfo.courseId,
                        activeId: IM_CourseInfo.aid,
                        otherId: PPTActiveInfo.otherId,
                        ifphoto: PPTActiveInfo.ifphoto,
                        chatId: message?.to,
                    });
                    if (config.mailing && result)
                        (0, mailer_1.sendEmail)({
                            aid: IM_CourseInfo.aid,
                            uid: params._uid,
                            realname: IM_Params.myName,
                            status: result,
                            mailing: config.mailing,
                        });
                }
            }
        },
        onError: (msg) => {
            console.log((0, kolorist_1.red)('[发生异常]'), msg);
            process.exit(0);
        },
    });
})();
