"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.speculateType = exports.preSign2 = exports.preSign = exports.getPPTActiveInfo = exports.aPromise = exports.getSignActivity = void 0;
const https_1 = __importDefault(require("https"));
const api_1 = require("../configs/api");
const helper_1 = require("../utils/helper");
const getSignActivity = (courses, uf, _d, UID, vc3) => {
    console.log('正在查询有效签到活动，等待时间视网络情况而定...');
    let i = 0, tasks = [];
    return new Promise(async (resolve) => {
        if (courses.length === 1) {
            try {
                resolve(await aPromise(courses[0], uf, _d, UID, vc3));
            }
            catch (err) {
                i++;
            }
        }
        else {
            tasks.push(aPromise(courses[0], uf, _d, UID, vc3));
            for (i++; i < courses.length; i++) {
                tasks.push(aPromise(courses[i], uf, _d, UID, vc3));
                if (i % 5 === 0 || i === courses.length - 1) {
                    try {
                        const result = await (0, helper_1.promiseAny)(tasks);
                        resolve(result);
                        return;
                    }
                    catch (error) { }
                    tasks = [];
                }
            }
        }
        if (i === courses.length) {
            console.log('未检测到有效签到活动！');
            resolve('NoActivity');
            return;
        }
    });
};
exports.getSignActivity = getSignActivity;
function aPromise(course, uf, _d, UID, vc3) {
    return new Promise((resolve, reject) => {
        let data = '';
        https_1.default.get(api_1.ACTIVELIST.URL + `?fid=0&courseId=${course.courseId}&classId=${course.classId}&_=${new Date().getTime()}`, {
            headers: {
                'Cookie': `uf=${uf}; _d=${_d}; UID=${UID}; vc3=${vc3};`,
            }
        }, (res) => {
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                data = JSON.parseJSON(data);
                if (data.data !== null) {
                    if (data.data.activeList.length != 0) {
                        let otherId = Number(data.data.activeList[0].otherId);
                        if ((otherId >= 0 && otherId <= 5) && data.data.activeList[0].status == 1) {
                            if ((new Date().getTime() - data.data.activeList[0].startTime) / 1000 < 7200) {
                                console.log(`检测到活动：${data.data.activeList[0].nameOne}`);
                                resolve({
                                    aid: data.data.activeList[0].id,
                                    name: data.data.activeList[0].nameOne,
                                    courseId: course.courseId,
                                    classId: course.classId,
                                    otherId
                                });
                                return;
                            }
                        }
                    }
                }
                else {
                    console.log('请求似乎有些频繁，获取数据为空!');
                    resolve("Too Frequent");
                }
                reject('Not Available');
            });
        });
    });
}
exports.aPromise = aPromise;
function getPPTActiveInfo(activeId, uf, _d, UID, vc3) {
    let data = '';
    return new Promise((resolve) => {
        https_1.default.get(api_1.PPTACTIVEINFO.URL + `?activeId=` + activeId, {
            headers: {
                'Cookie': `uf=${uf}; _d=${_d}; UID=${UID}; vc3=${vc3};`
            }
        }, (res) => {
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve(JSON.parseJSON(data).data);
            });
        });
    });
}
exports.getPPTActiveInfo = getPPTActiveInfo;
const preSign = async (uf, _d, vc3, activeId, classId, courseId, uid) => {
    let data = '';
    return new Promise((resolve) => {
        https_1.default.get(api_1.PRESIGN.URL + `?courseId=${courseId}&classId=${classId}&activePrimaryId=${activeId}&general=1&sys=1&ls=1&appType=15&&tid=&uid=${uid}&ut=s`, {
            headers: {
                'Cookie': `uf=${uf}; _d=${_d}; UID=${uid}; vc3=${vc3};`
            }
        }, (res) => {
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`[预签]已请求`);
                resolve();
            });
        });
    });
};
exports.preSign = preSign;
const preSign2 = (uf, _d, vc3, activeId, chatId, uid, tuid) => {
    let data = '';
    return new Promise((resolve) => {
        https_1.default.get(api_1.CHAT_GROUP.PRESTUSIGN.URL + `?activeId=${activeId}&code=&uid=${uid}&courseId=null&classId=0&general=0&chatId=${chatId}&appType=0&tid=${tuid}&atype=null&sys=0`, {
            headers: {
                'Cookie': `uf=${uf}; _d=${_d}; UID=${uid}; vc3=${vc3};`
            }
        }, (res) => {
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`[预签]已请求`);
                resolve(data);
            });
        });
    });
};
exports.preSign2 = preSign2;
const speculateType = (text) => {
    if (text.includes('拍照')) {
        return 'photo';
    }
    else if (text.includes('位置')) {
        return 'location';
    }
    else if (text.includes('二维码')) {
        return 'qr';
    }
    return 'general';
};
exports.speculateType = speculateType;
