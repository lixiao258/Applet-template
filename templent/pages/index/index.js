//index.js
//获取应用实例
const app = getApp()
const auth = require('../../utils/auth.js');
const http = require('../../utils/http.js');
const json = require('../../utils/json.js');
console.log(json,http)
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数

  onLoad: function () {
    http.GET({
      url: '/callback/?action=querySlide&columnId=30&types=1',
      data: {
        pasize:4
      },
      success: function (res) {
        console.log(res.data.data)
        console.log(json.jsonToMap(res.data.data))
       
      },
      fail: function (res) { console.log('request失败，res:', res); },
      complete: function (res) { }
    })
   
    // 在调用通讯地址判断是否开启授权，如果没开启就会自动调用授权
    auth.userInfo({
      success: function (res) {
        console.log('已授权');
        // 这儿写你的业务逻辑
      },
      fail: function (res) {
        console.log('未授权');
        wx.showToast({
          title: '未授权',
          duration: 2000
        });
      }
    });
  },
  
})
