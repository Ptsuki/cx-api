"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main_handler = exports.handler = exports.main = void 0;
const helper_1 = require("./utils/helper");
(0, helper_1.extendGlobalThis)(globalThis);
const router_1 = __importDefault(require("@koa/router"));
const koa_1 = __importDefault(require("koa"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const multiparty_1 = __importDefault(require("multiparty"));
const user_1 = require("./functions/user");
const activity_1 = require("./functions/activity");
const QRCode_1 = require("./functions/QRCode");
const location_1 = require("./functions/location");
const general_1 = require("./functions/general");
const photo_1 = require("./functions/photo");
const QrCodeOCR_1 = require("./functions/tencent/QrCodeOCR");
const file_1 = require("./utils/file");
const child_process_1 = require("child_process");
const serverless_http_1 = __importDefault(require("serverless-http"));
const ENVJSON = (0, file_1.getJsonObject)('env.json');
const app = new koa_1.default();
const router = new router_1.default();
const processMap = new Map();
router.get('/', async (ctx) => {
    ctx.body = `<h1 style="text-align: center">Welcome, chaoxing-sign-cli API service is running.</h1>`;
});
router.post('/login', async (ctx) => {
    let params = await (0, user_1.userLogin)(ctx.request.body.phone, ctx.request.body.password);
    if (typeof params === 'string') {
        ctx.body = params;
        return;
    }
    params.name = (params.uf && params._d && params._uid && params.vc3) ?
        await (0, user_1.getAccountInfo)(params.uf, params._d, params._uid, params.vc3) : '获取失败';
    console.log(ctx.request.body);
    ctx.body = params;
});
router.post('/activity', async (ctx) => {
    let courses = await (0, user_1.getCourses)(ctx.request.body.uid, ctx.request.body._d, ctx.request.body.vc3);
    if (typeof courses === 'string') {
        ctx.body = courses;
        return;
    }
    let activity = await (0, activity_1.getSignActivity)(courses, ctx.request.body.uf, ctx.request.body._d, ctx.request.body.uid, ctx.request.body.vc3);
    if (typeof activity === 'string') {
        ctx.body = activity;
        return;
    }
    await (0, activity_1.preSign)(ctx.request.body.uf, ctx.request.body._d, ctx.request.body.vc3, activity.aid, activity.classId, activity.courseId, ctx.request.body.uid);
    console.log(ctx.request.body.uid);
    ctx.body = activity;
});
router.post('/qrcode', async (ctx) => {
    let res = await (0, QRCode_1.QRCodeSign)(ctx.request.body.enc, ctx.request.body.name, ctx.request.body.fid, ctx.request.body.uid, ctx.request.body.aid, ctx.request.body.uf, ctx.request.body._d, ctx.request.body.vc3);
    console.log(ctx.request.body.name, ctx.request.body.uid);
    if (res === 'success') {
        ctx.body = 'success';
        return;
    }
    else {
        ctx.body = res;
    }
});
router.post('/location', async (ctx) => {
    let res = await (0, location_1.LocationSign)(ctx.request.body.uf, ctx.request.body._d, ctx.request.body.vc3, ctx.request.body.name, ctx.request.body.address, ctx.request.body.aid, ctx.request.body.uid, ctx.request.body.lat, ctx.request.body.lon, ctx.request.body.fid);
    console.log(ctx.request.body.name, ctx.request.body.uid);
    if (res === 'success') {
        ctx.body = 'success';
        return;
    }
    else {
        ctx.body = res;
    }
});
router.post('/general', async (ctx) => {
    let res = await (0, general_1.GeneralSign)(ctx.request.body.uf, ctx.request.body._d, ctx.request.body.vc3, ctx.request.body.name, ctx.request.body.aid, ctx.request.body.uid, ctx.request.body.fid);
    console.log(ctx.request.body.name, ctx.request.body.uid);
    if (res === 'success') {
        ctx.body = 'success';
        return;
    }
    else {
        ctx.body = res;
    }
});
router.post('/uvtoken', async (ctx) => {
    let res = await (0, user_1.getPanToken)(ctx.request.body.uf, ctx.request.body._d, ctx.request.body.uid, ctx.request.body.vc3);
    ctx.body = res;
});
router.post('/upload', async (ctx) => {
    let form = new multiparty_1.default.Form();
    let fields = {};
    let data = [];
    let result = await new Promise((resolve) => {
        form.on('part', (part) => {
            if (part.filename !== undefined) {
                part.on('data', (chunk) => {
                    data.push(chunk);
                });
                part.on('close', () => {
                    part.resume();
                });
            }
        });
        form.on('field', (name, str) => {
            fields[name] = str;
        });
        form.on('close', async () => {
            let buffer = Buffer.concat(data);
            let res = await (0, photo_1.uploadPhoto)(fields['uf'], fields['_d'], fields['_uid'], fields['vc3'], ctx.query._token, buffer);
            resolve(res);
            console.log(res);
        });
        form.parse(ctx.req);
    });
    ctx.body = result;
});
router.post('/photo', async (ctx) => {
    let res = await (0, photo_1.PhotoSign)(ctx.request.body.uf, ctx.request.body._d, ctx.request.body.vc3, ctx.request.body.name, ctx.request.body.aid, ctx.request.body.uid, ctx.request.body.fid, ctx.request.body.objectId);
    console.log(ctx.request.body.name, ctx.request.body.uid);
    if (res === 'success') {
        ctx.body = 'success';
        return;
    }
    else {
        ctx.body = res;
    }
});
router.post('/qrocr', async (ctx) => {
    let form = new multiparty_1.default.Form();
    let data = [];
    let result = await new Promise((resolve) => {
        form.on('part', (part) => {
            if (part.filename !== undefined) {
                part.on('data', (chunk) => {
                    data.push(chunk);
                });
                part.on('close', () => {
                    part.resume();
                });
            }
        });
        form.on('close', async () => {
            let buffer = Buffer.concat(data);
            let base64str = buffer.toString('base64');
            let res;
            try {
                res = await (0, QrCodeOCR_1.QrCodeScan)(base64str);
                const url = res.CodeResults[0].Url;
                const enc_start = url.indexOf('enc=') + 4;
                const result = url.substring(enc_start, url.indexOf('&', enc_start));
                resolve(result);
            }
            catch (error) {
                resolve('识别失败');
            }
        });
        form.parse(ctx.req);
    });
    ctx.body = result;
});
router.post('/monitor/status', (ctx) => {
    if (processMap.get(ctx.request.body.phone)) {
        ctx.body = '{"code":200,"msg":"Monitoring"}';
    }
    else {
        ctx.body = '{"code":201,"msg":"Suspended"}';
    }
});
router.post('/monitor/stop', (ctx) => {
    const process_monitor = processMap.get(ctx.request.body.phone);
    if (process_monitor !== undefined) {
        process_monitor.kill('SIGKILL');
        processMap.delete(ctx.request.body.phone);
    }
    ctx.body = '{"code":201,"msg":"Suspended"}';
});
router.post('/monitor/start', async (ctx) => {
    if (processMap.get(ctx.request.body.phone) !== undefined) {
        ctx.body = '{"code":200,"msg":"Already started"}';
        return;
    }
    const process_monitor = (0, child_process_1.fork)(ENVJSON.env.dev ? 'monitor.ts' : 'monitor.js', ['--auth',
        ctx.request.body.uf, ctx.request.body._d,
        ctx.request.body.vc3, ctx.request.body.uid,
        ctx.request.body.lv, ctx.request.body.fid, ctx.request.body.phone], {
        cwd: __dirname,
        detached: false,
        stdio: [null, null, null, 'ipc']
    });
    const response = await new Promise((resolve) => {
        process_monitor.on('message', (msg) => {
            switch (msg) {
                case 'success': {
                    processMap.set(ctx.request.body.phone, process_monitor);
                    resolve('{"code":200,"msg":"Started Successfully"}');
                    break;
                }
                case 'authfail': {
                    resolve('{"code":202,"msg":"Authencation Failed"}');
                    break;
                }
                case 'notconfigured': {
                    resolve('{"code":203,"msg":"Not Configured"}');
                    break;
                }
            }
        });
    });
    ctx.body = response;
});
app.use((0, koa_bodyparser_1.default)());
app.use(async (ctx, next) => {
    ctx.set("Access-Control-Allow-Origin", "*");
    ctx.set("Access-Control-Allow-Headers", "Content-Type");
    await next();
});
app.use(async (ctx, next) => {
    ctx.set("Access-Control-Max-Age", "300");
    if (ctx.method === 'OPTIONS') {
        ctx.body = '';
    }
    await next();
});
app.use(router.routes());
process.on('exit', () => {
    processMap.forEach((pcs) => {
        pcs.kill('SIGKILL');
    });
});
if (!ENVJSON.env.SERVERLESS)
    app.listen(5000, () => { console.log("API Server: http://localhost:5000"); });
exports.main = (0, serverless_http_1.default)(app);
exports.handler = exports.main;
exports.main_handler = exports.main;
