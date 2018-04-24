const configGlobal = require('../config/config_global.js');
var util = require('function.js');
var http = require('http.js');
const app = getApp();
var authHandler = {
  success: function (res) { },
  fail: function (res) { },
  complete: function (res) { },
};
console.log(app,'1111')

/*
* 得到保存的SESSION
*/
function getSession() {
  var session = null;
  try {
    session = wx.getStorageSync('session');
    if (session) {
      wx.checkSession({
        success: function (res) {
          setAppGlobalData(session);
        },
        fail: function (res) {
          session = null;
          setAppGlobalData(session);
        }
      });
    } else {
      session = null;
      setAppGlobalData(session);
    }
  } catch (e) { }
  return session;
};
/**
* [putLoginLog description]--记录登录日志
* @return {[type]} [description]
*/
function putLoginLog() {
  http.POST({
    url: '/_WxaappApiServer/putLoginLog',
    data: {
      openId: app.globalData.openid,
    },
    success: function (res) {
      if (res.data.code == '0') { } else { }
    },
    fail: function (res) { console.log('request失败，res:', res); },
    complete: function (res) { }
  });
};
function setAppGlobalData(session) {
  console.log(session, 'session')
  // console.log(app.globalData.openId, '我的')
  
  app.globalData.openId = session.openid;
  console.log(app.globalData.openId,'wide')
  // app.globalData.unionid = session.unionid;
  // app.globalData._3rd_session = session._3rd_session;
  app.globalData.userInfo = session.userInfo;
};
function getUserInfo(authHandler) {
  // 调用登录接口
  wx.login({
    success: function (res) {
      var code = res.code;
      console.log(code)
      wx.getUserInfo({
        lang: 'zh_CN',
        success: function (res) {
          http.GET({
            url: '/callback/member.asp?action=login&code=' + code,
            data: {
              code: code,
            },
            success: function (res) {

              let data = JSON.parse(res.data.data);
              let member = JSON.parse(data["member"])
              console.log(member.openid, '需要的')
              //对userInfo重新赋值
              if (res.data.code == "0") {
                var session = member
                try {
                  wx.setStorageSync('session', session);
                  setAppGlobalData(session);
                  authHandler.success();
                } catch (e) { }
              } else {
                var session = member
                try {
                  wx.setStorageSync('session', session);
                  console.log(session.openid)
                  setAppGlobalData(session);
                  authHandler.success();
                } catch (e) { }
              }
            },
            fail: function (res) { console.log('request失败，res:', res); },
            complete: function (res) { }
          });
        },
        fail: function (res) {
          openSettingUserInfo(authHandler);
        },
        complete: function (res) { },
      })
    },
    fail: function (res) {
      console.log("登录失败！");
    },
    complete: function (res) { },
  });
};
function openSettingUserInfo(authHandler) {
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.userInfo']) {
        wx.showModal({
          title: '',
          content: '请先完成授权！在设置页面中勾选“用户信息”选项，否则部分功能将受限。',
          showCancel: true,
          confirmText: '前去设置',
          confirmColor: '#004b97',
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                success: (res) => {
                  res.authSetting = {
                    'scope.userInfo': true,
                  };
                  // authHandler.success();
                },
                complete: function (res) {
                  openSettingUserInfo(authHandler);
                },
              })
            }
            if (res.cancel) {
              authHandler.fail();
              // 注释上一行，启用下面这一行，就是强制用户授权
              // openSettingUserInfo(authHandler); //强制授权
            }
            if (!res.confirm && !res.cancel) {
              openSettingUserInfo(authHandler);
            }
          }
        });
      } else {
        getUserInfo(authHandler);
      }
    }
  })
};
/**
* 授权--用户登录
* @param  {[type]} authHandler [description]
* @return {[type]}                [description]
*/
function userInfo(authHandler) {
  var session = null;
  try {
    session = wx.getStorageSync('session');
    console.log(session, '我的心得')
    if (session) {
      wx.checkSession({
        success: function () {
          // setAppGlobalData(session);
          authHandler.success();
        },
        fail: function () {
          session = null;
          getUserInfo(authHandler);
        }
      });
    } else {
      session = null;
      getUserInfo(authHandler);
    }
  } catch (e) {
    authHandler.fail();
  }
  return session;
}
/**
* 授权--地理位置 wx.getLocation, wx.chooseLocation
* @param  {[type]} authHandler [description]
* @return {[type]}             [description]
*/
function userLocation(authHandler) {
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.userLocation']) {
        wx.authorize({
          scope: 'scope.userLocation',
          success() { },
          complete() {
            openSetting_userLocation(authHandler)
          }
        })
      } else {
        authHandler.success();
      }
    }
  })
};
function openSetting_userLocation(authHandler) {
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.userLocation']) {
        wx.showModal({
          title: '',
          content: '请先完成授权！在设置页面中勾选“地理位置”选项，否则部分功能将受限。',
          showCancel: true,
          confirmText: '前去设置',
          confirmColor: '#004b97',
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                success: (res) => {
                  res.authSetting = {
                    'scope.userLocation': true,
                  };
                },
                complete: function (res) {
                  openSetting_userLocation(authHandler);
                },
              })
            }
            if (res.cancel) {
              authHandler.fail();
              // 注释上一行，启用下面这一行，就是强制用户授权
              // openSetting_userLocation(authHandler); //强制授权
            }
            if (!res.confirm && !res.cancel) {
              openSetting_userLocation(authHandler);
            }
          }
        });
      } else {
        userLocation(authHandler);
      }
    }
  })
};
/**
* 授权--通讯地址 wx.chooseAddress
* @param  {[type]} authHandler [description]
* @return {[type]}             [description]
*/
function address(authHandler) {
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.address']) {
        wx.authorize({
          scope: 'scope.address',
          success() { },
          complete() {
            openSetting_address(authHandler)
          }
        })
      } else {
        authHandler.success();
      }
    }
  })
};
function openSetting_address(authHandler) {
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.address']) {
        wx.showModal({
          title: '',
          content: '请先完成授权！在设置页面中勾选“通讯地址”选项，否则部分功能将受限。',
          showCancel: true,
          confirmText: '前去设置',
          confirmColor: '#004b97',
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                success: (res) => {
                  res.authSetting = {
                    'scope.address': true,
                  };
                },
                complete: function (res) {
                  openSetting_address(authHandler);
                },
              })
            }
            if (res.cancel) {
              authHandler.fail();
              // 注释上一行，启用下面这一行，就是强制用户授权
              // openSetting_address(authHandler); //强制授权
            }
            if (!res.confirm && !res.cancel) {
              openSetting_address(authHandler);
            }
          }
        });
      } else {
        address(authHandler);
      }
    }
  })
};
/**
* 授权--发票抬头 wx.chooseInvoiceTitle
* @param  {[type]} authHandler [description]
* @return {[type]}             [description]
*/
function invoiceTitle(authHandler) {
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.invoiceTitle']) {
        wx.authorize({
          scope: 'scope.invoiceTitle',
          success() { },
          complete() {
            openSetting_invoiceTitle(authHandler)
          }
        })
      } else {
        authHandler.success();
      }
    }
  })
};
function openSetting_invoiceTitle(authHandler) {
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.invoiceTitle']) {
        wx.showModal({
          title: '',
          content: '请先完成授权！在设置页面中勾选“发票抬头”选项，否则部分功能将受限。',
          showCancel: true,
          confirmText: '前去设置',
          confirmColor: '#004b97',
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                success: (res) => {
                  res.authSetting = {
                    'scope.invoiceTitle': true,
                  };
                },
                complete: function (res) {
                  openSetting_invoiceTitle(authHandler);
                },
              })
            }
            if (res.cancel) {
              authHandler.fail();
              // 注释上一行，启用下面这一行，就是强制用户授权
              // openSetting_invoiceTitle(authHandler); //强制授权
            }
            if (!res.confirm && !res.cancel) {
              openSetting_invoiceTitle(authHandler);
            }
          }
        });
      } else {
        invoiceTitle(authHandler);
      }
    }
  })
};
/**
* 授权--微信运动步数 wx.getWeRunData
* @param  {[type]} authHandler [description]
* @return {[type]}             [description]
*/
function werun(authHandler) {
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.werun']) {
        wx.authorize({
          scope: 'scope.werun',
          success() { },
          complete() {
            openSetting_werun(authHandler)
          }
        })
      } else {
        authHandler.success();
      }
    }
  })
};
function openSetting_werun(authHandler) {
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.werun']) {
        wx.showModal({
          title: '',
          content: '请先完成授权！在设置页面中勾选“微信运动步数”选项，否则部分功能将受限。',
          showCancel: true,
          confirmText: '前去设置',
          confirmColor: '#004b97',
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                success: (res) => {
                  res.authSetting = {
                    'scope.werun': true,
                  };
                },
                complete: function (res) {
                  openSetting_werun(authHandler);
                },
              })
            }
            if (res.cancel) {
              authHandler.fail();
              // 注释上一行，启用下面这一行，就是强制用户授权
              // openSetting_werun(authHandler); //强制授权
            }
            if (!res.confirm && !res.cancel) {
              openSetting_werun(authHandler);
            }
          }
        });
      } else {
        werun(authHandler);
      }
    }
  })
};
/**
* 授权--录音功能 wx.startRecord
* @param  {[type]} authHandler [description]
* @return {[type]}             [description]
*/
function record(authHandler) {
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.record']) {
        wx.authorize({
          scope: 'scope.record',
          success() { },
          complete() {
            openSetting_record(authHandler)
          }
        })
      } else {
        authHandler.success();
      }
    }
  })
};
function openSetting_record(authHandler) {
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.record']) {
        wx.showModal({
          title: '',
          content: '请先完成授权！在设置页面中勾选“录音功能”选项，否则部分功能将受限。',
          showCancel: true,
          confirmText: '前去设置',
          confirmColor: '#004b97',
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                success: (res) => {
                  res.authSetting = {
                    'scope.record': true,
                  };
                },
                complete: function (res) {
                  openSetting_record(authHandler);
                },
              })
            }
            if (res.cancel) {
              authHandler.fail();
              // 注释上一行，启用下面这一行，就是强制用户授权
              // openSetting_record(authHandler); //强制授权
            }
            if (!res.confirm && !res.cancel) {
              openSetting_record(authHandler);
            }
          }
        });
      } else {
        record(authHandler);
      }
    }
  })
};
/**
* 授权--保存到相册 wx.saveImageToPhotosAlbum, wx.saveVideoToPhotosAlbum
* @param  {[type]} authHandler [description]
* @return {[type]}             [description]
*/
function writePhotosAlbum(authHandler) {
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.writePhotosAlbum']) {
        wx.authorize({
          scope: 'scope.writePhotosAlbum',
          success() { },
          complete() {
            openSetting_writePhotosAlbum(authHandler)
          }
        })
      } else {
        authHandler.success();
      }
    }
  })
};
function openSetting_writePhotosAlbum(authHandler) {
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.writePhotosAlbum']) {
        wx.showModal({
          title: '',
          content: '请先完成授权！在设置页面中勾选“保存到相册”选项，否则部分功能将受限。',
          showCancel: true,
          confirmText: '前去设置',
          confirmColor: '#004b97',
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                success: (res) => {
                  res.authSetting = {
                    'scope.writePhotosAlbum': true,
                  };
                },
                complete: function (res) {
                  openSetting_writePhotosAlbum(authHandler);
                },
              })
            }
            if (res.cancel) {
              authHandler.fail();
              // 注释上一行，启用下面这一行，就是强制用户授权
              // openSetting_writePhotosAlbum(authHandler); //强制授权
            }
            if (!res.confirm && !res.cancel) {
              openSetting_writePhotosAlbum(authHandler);
            }
          }
        });
      } else {
        writePhotosAlbum(authHandler);
      }
    }
  })
};
module.exports = {
  userInfo: userInfo,
  userLocation: userLocation,
  address: address,
  invoiceTitle: invoiceTitle,
  werun: werun,
  record: record,
  writePhotosAlbum: writePhotosAlbum,
  putLoginLog: putLoginLog,
  getSession: getSession,
};