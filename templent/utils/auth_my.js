// 注意，请使用这个改名为：auth.js

const configGlobal = require('../config/config_global.js');
var util = require('function.js');
var app = getApp();
var sessionHandler = {
    success: function(res) {},
    fail: function(res) {},
    complete: function(res) {},
};

/*
 * 得到保存的SESSION
 */
function getSession() {
    var session = null;
    try {
        session = wx.getStorageSync('session');
        if (session) {
            wx.checkSession({
                success: function(res) {
                    setAppGlobalData(session);
                },
                fail: function(res) {
                    session = null;
                    setAppGlobalData(session);
                }
            });
        } else {
            session = null;
            setAppGlobalData(session);
        }
    } catch (e) {}

    return session;
};

/**
 * [checkLogin description] 调用用户登录
 * @param  {[type]} sessionHandler [description]
 * @return {[type]}                [description]
 */
function login(sessionHandler) {
    var session = null;
    try {
        session = wx.getStorageSync('session');
        if (session) {
            wx.checkSession({
                success: function() {
                    setAppGlobalData(session);
                    sessionHandler.success();
                },
                fail: function() {
                    session = null;
                    getUserInfo(sessionHandler);

                }
            });
        } else {
            session = null;
            getUserInfo(sessionHandler);
        }
    } catch (e) {
        sessionHandler.fail();
    }

    return session;
}

/**
 * [putLoginLog description]--记录登录日志
 * @return {[type]} [description]
 */
function putLoginLog() {

    // 请求服务器
    wx.showLoading({
        title: '加载中...',
        mask: true
    });

    wx.request({
        url: '/_WxaappApiServer/putLoginLog',
        data: {
            openId: app.globalData.openId,
        },
        method: 'POST', // GET, POST, OPTIONS, HEAD, PUT, DELETE, TRACE, CONNECT
        dataType: 'json',
        header: {
            // 'Content-Type': 'application/json; charset=utf-8' // 如果请求用GET
            'content-type': 'application/x-www-form-urlencoded'
        },
        success: function(res) {
            wx.hideLoading();
            if (res.data.code == '0') {} else {}
        },
        fail: function(res) { console.log('request失败，res:', res); },
        complete: function(res) {
            wx.hideLoading();
        }
    });
};

function setAppGlobalData(session) {
    app.globalData.openId = session.openId;
    app.globalData.unionid = session.unionid;
    app.globalData._3rd_session = session._3rd_session;
    app.globalData.userInfo = session.userInfo;
};

function getUserInfo(sessionHandler) {
    // 调用登录接口
    wx.login({
        success: function(res) {
            var code = res.code;

            wx.getUserInfo({
                lang: 'zh_CN',
                success: function(res) {

                    // 请求服务器
                    wx.showLoading({
                        title: '加载中...',
                        mask: true
                    });

                    wx.request({
                        url: configGlobal.request_url + '/_WxaappApiServer/getUserInfo',
                        data: {
                            code: code,
                            iv: res.iv,
                            encryptedData: res.encryptedData,
                        },
                        method: 'POST', // GET, POST, OPTIONS, HEAD, PUT, DELETE, TRACE, CONNECT
                        dataType: 'json',
                        header: {
                            // 'Content-Type': 'application/json; charset=utf-8' // 如果请求用GET
                            'content-type': 'application/x-www-form-urlencoded'
                        },
                        success: function(res) {
                            wx.hideLoading();

                            //对userInfo重新赋值
                            if (res.data.code == "0") {
                                var session = res.data.data;
                                try {
                                    wx.setStorageSync('session', session);
                                    setAppGlobalData(session);
                                    sessionHandler.success();
                                } catch (e) {}
                            } else {}
                        },
                        fail: function(res) { console.log('request失败，res:', res); },
                        complete: function(res) {
                            wx.hideLoading();
                        }
                    });



                },
                fail: function(res) {
                    openSetting(sessionHandler);
                },
                complete: function(res) {},
            })
        },
        fail: function(res) {
            console.log("登录失败！");
        },
        complete: function(res) {},
    });
};

function openSetting(sessionHandler) {
    wx.getSetting({
        success(res) {
            if (!res.authSetting['scope.userInfo']) {
                wx.showModal({
                    title: '',
                    content: '请先完成授权！在设置页面中勾选“用户信息”选项，否则部分功能将受限。',
                    showCancel: true,
                    confirmText: '前去设置',
                    confirmColor: '#004b97',
                    success: function(res) {

                        if (res.confirm) {
                            wx.openSetting({
                                success: (res) => {
                                    res.authSetting = {
                                        'scope.userInfo': true,
                                    };
                                    // sessionHandler.success();
                                },
                                complete: function(res) {
                                    openSetting(sessionHandler);
                                },
                            })
                        }

                        if (res.cancel) {
                            sessionHandler.fail();
                            // 注释上一行，启用下面这一行，就是强制用户授权
                            // openSetting(sessionHandler); //强制授权
                        }

                        if (!res.confirm && !res.cancel) {
                            openSetting(sessionHandler);
                        }

                    }
                });

            } else {
                getUserInfo(sessionHandler);
            }
        }
    })
};

module.exports = {
    getSession: getSession,
    login: login,
    putLoginLog: putLoginLog,
};