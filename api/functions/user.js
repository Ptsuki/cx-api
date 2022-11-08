"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIMParams = exports.getLocalUsers = exports.getPanToken = exports.getAccountInfo = exports.getCourses = exports.userLogin = void 0;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const zlib_1 = __importDefault(require("zlib"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const api_1 = require("../configs/api");
const file_1 = require("../utils/file");
const kolorist_1 = require("kolorist");
const userLogin = async (uname, password) => {
    return new Promise((resolve) => {
        let params = {
            fid: '-1', pid: '-1', refer: 'http%3A%2F%2Fi.chaoxing.com', _blank: '1', t: true,
            vc3: "", _uid: "", _d: "", uf: "", lv: ""
        };
        let data = '';
        http_1.default.get(api_1.LOGIN_PAGE.URL, {}, (res) => {
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                let req = http_1.default.request(api_1.LOGIN.URL, {
                    method: api_1.LOGIN.METHOD,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }, (res) => {
                    data = '';
                    res.on('data', (chunk) => { data += chunk; });
                    res.on('end', () => {
                        if (JSON.parseJSON(data).status) {
                            console.log('登陆成功');
                            let cookies = res.headers['set-cookie'];
                            let c_equal, c_semi, itemName, itemValue, rt_cookies;
                            const map = new Map();
                            for (let i = 0; i < cookies.length; i++) {
                                c_equal = cookies[i].indexOf('=');
                                c_semi = cookies[i].indexOf(';');
                                itemName = cookies[i].substring(0, c_equal);
                                itemValue = cookies[i].substring(c_equal + 1, c_semi);
                                map.set(itemName, itemValue);
                            }
                            rt_cookies = Object.fromEntries(map.entries());
                            params = Object.assign(params, rt_cookies);
                            resolve(params);
                        }
                        else {
                            console.log('登陆失败');
                            resolve("AuthFailed");
                        }
                    });
                });
                let wordArray = crypto_js_1.default.enc.Utf8.parse('u2oh6Vu^HWe40fj');
                let encryptedPassword = crypto_js_1.default.DES.encrypt(password, wordArray, {
                    mode: crypto_js_1.default.mode.ECB,
                    padding: crypto_js_1.default.pad.Pkcs7
                });
                password = encryptedPassword.ciphertext.toString();
                let formdata = `uname=${uname}&password=${password}&fid=-1&t=true&refer=https%253A%252F%252Fi.chaoxing.com&forbidotherlogin=0&validate=`;
                req.write(formdata);
                req.end();
            });
        });
    });
};
exports.userLogin = userLogin;
const getCourses = async (_uid, _d, vc3) => {
    return new Promise((resolve) => {
        let data = '';
        let req = http_1.default.request(api_1.COURSELIST.URL, {
            method: api_1.COURSELIST.METHOD,
            headers: {
                'Accept': 'text/html, */*; q=0.01',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8;',
                'Cookie': `_uid=${_uid}; _d=${_d}; vc3=${vc3}`
            }
        }, (res) => {
            if (res.statusCode === 302) {
                console.log('身份过期，程序将关闭，请你使用手动填写用户名密码的方式登录！手动登录后身份信息刷新，之后可继续使用本地凭证！\n');
                resolve("AuthFailed");
                return;
            }
            let gzip = zlib_1.default.createGunzip();
            let output;
            res.pipe(gzip);
            output = gzip;
            output.on('data', (chunk) => {
                data += chunk;
            });
            output.on('end', () => {
                let arr = [];
                let end_of_courseid;
                for (let i = 1;; i++) {
                    i = data.indexOf('course_', i);
                    if (i == -1)
                        break;
                    end_of_courseid = data.indexOf('_', i + 7);
                    arr.push({
                        courseId: data.slice(i + 7, end_of_courseid),
                        classId: data.slice(end_of_courseid + 1, data.indexOf('"', i + 1))
                    });
                }
                if (arr.length === 0) {
                    resolve('NoCourse');
                    console.log(`${(0, kolorist_1.blue)('[提示]')}无课程可查.`);
                }
                else {
                    resolve(arr);
                }
                return;
            });
        });
        let formdata = `courseType=1&courseFolderId=0&courseFolderSize=0`;
        req.write(formdata);
        req.end();
    });
};
exports.getCourses = getCourses;
const getAccountInfo = async (uf, _d, _uid, vc3) => {
    return new Promise((resolve) => {
        let data = '';
        http_1.default.get(api_1.ACCOUNTMANAGE.URL, {
            headers: {
                'Cookie': `uf=${uf}; _d=${_d}; UID=${_uid}; vc3=${vc3};`
            }
        }, (res) => {
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                let end_of_messageName = data.indexOf('messageName') + 13;
                let name = data.slice(end_of_messageName, data.indexOf('<', end_of_messageName));
                resolve(name);
            });
        });
    });
};
exports.getAccountInfo = getAccountInfo;
const getPanToken = (uf, _d, _uid, vc3) => {
    return new Promise((resolve) => {
        let data = '';
        https_1.default.get(api_1.PANTOKEN.URL, {
            headers: {
                'Cookie': `uf=${uf}; _d=${_d}; UID=${_uid}; vc3=${vc3};`
            }
        }, (res) => {
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
        });
    });
};
exports.getPanToken = getPanToken;
const getLocalUsers = () => {
    const data = (0, file_1.getJsonObject)('configs/storage.json');
    const arr = [];
    for (let i = 0; i < data.users.length; i++) {
        arr.push({
            title: data.users[i].phone,
            value: i
        });
    }
    arr.push({ title: '手动登录', value: -1 });
    return [...arr];
};
exports.getLocalUsers = getLocalUsers;
const getIMParams = (uf, _d, _uid, vc3) => {
    let htmlPage = '';
    let params = {
        myName: '',
        myToken: '',
        myTuid: '',
        myPuid: ''
    };
    return new Promise((resolve) => {
        https_1.default.get(api_1.WEBIM.URL, {
            headers: {
                'Cookie': `uf=${uf}; _d=${_d}; UID=${_uid}; vc3=${vc3};`
            }
        }, (res) => {
            res.on('data', chunk => htmlPage += chunk);
            res.on('end', () => {
                if (htmlPage === '') {
                    console.log('身份凭证似乎过期，请手动登录');
                    resolve('AuthFailed');
                    return;
                }
                let index = htmlPage.indexOf('id="myName"');
                params.myName = htmlPage.slice(index + 35, htmlPage.indexOf('<', index + 35));
                index = htmlPage.indexOf('id="myToken"');
                params.myToken = htmlPage.slice(index + 36, htmlPage.indexOf('<', index + 36));
                index = htmlPage.indexOf('id="myTuid"');
                params.myTuid = htmlPage.slice(index + 35, htmlPage.indexOf('<', index + 35));
                params.myPuid = _uid;
                resolve({ ...params });
            });
        });
    });
};
exports.getIMParams = getIMParams;
