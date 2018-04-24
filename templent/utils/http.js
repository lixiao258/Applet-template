/**
 *   http.POST(
 *   {
 *       url: '/xxxx/yyyy',
 *       data: {},
 *       success: function (res) {},
 *       fail: function () {},
 *       complete: function () {},
 *   });
 */
const configGlobal = require('../config/config_global.js');
var requestHandler = {
    url: '',
    data: {},
    success: function(res) {},
    fail: function(res) {},
    complete: function(res) {}
};

// GET
function GET(requestHandler) {
    request('GET', requestHandler)
};

// POST
function POST(requestHandler) {
    request('POST', requestHandler)
};

/**
 * [request description]
 * @param  {[type]} method         [description] // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
 * @param  {[type]} requestHandler [description]
 * @return {[type]}                [description]
 */
function request(method, requestHandler) {

    var contentType = 'application/json; charset=utf-8';
    if (method == 'GET') {
        contentType = 'application/json; charset=utf-8';
    } else
    if (method == "POST") {
        contentType = 'application/x-www-form-urlencoded';
    }

    // 请求服务器
    wx.showLoading({
        title: '加载中...',
        mask: true
    });

    // 设置参数
    var data_param = {};
    data_param = requestHandler.data;
    var param = getRequestData(data_param);

    wx.request({
        url: configGlobal.request_url + requestHandler.url,
        data: {
            appid: param.appid,
            timestamp: param.timestamp,
            sign: param.sign,
            data: param.data,
        },
        dataType: 'json',
        method: method,
        header: {
            'content-Type': contentType
        }, // 设置请求的 header
        success: function(res) {
            wx.hideLoading();
            requestHandler.success(res);
        },
        fail: function(res) {
            requestHandler.fail(res);
        },
        complete: function(res) {
            wx.hideLoading();
            requestHandler.complete(res);
        },
    });
};

/**
 * 得到时间戳
 * @return {[type]} [description]
 */
function getTimestamp() {

    var date = new Date();

    var strYear = date.getFullYear();

    var strMonth = date.getMonth() + 1;
    if (strMonth >= 1 && strMonth <= 9) {
        strMonth = "0" + strMonth;
    }

    var strDate = date.getDate();
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }

    var strHours = date.getHours();
    if (strHours >= 0 && strHours <= 9) {
        strHours = "0" + strHours;
    }

    var strMinutes = date.getMinutes();
    if (strMinutes >= 0 && strMinutes <= 9) {
        strMinutes = "0" + strMinutes;
    }

    var strSeconds = date.getSeconds();
    if (strSeconds >= 0 && strSeconds <= 9) {
        strSeconds = "0" + strSeconds;
    }
    var result = strYear + '' + strMonth + '' + strDate + '' + strHours + '' + strMinutes + '' + strSeconds;

    return result;
};

/**
 * 得到签名
 * @param  {[type]} app_secret [description]
 * @param  {[type]} timestamp  [description]
 * @param  {[type]} data       [description]
 * @return {[type]}            [description]
 */
function getSign(app_secret, timestamp, data) {

    var md5 = require("md5.js");
    var result = app_secret + timestamp + data;
    result = md5.hex_md5(result);

    return result;
};

/**
 * 加工请求参数
 * @param  {[type]} param [description]
 * @return {[type]}       [description]
 */
function getRequestData(param) {
    var app_id = configGlobal.app_id;
    var app_secret = configGlobal.app_secret;
    var timestamp = getTimestamp();
    var paramJson = JSON.stringify(param);
    var data = escape(paramJson);

    var sign = getSign(app_secret, timestamp, data);

    var result = new Array();
    result['appid'] = app_id;
    result['timestamp'] = timestamp;
    result['sign'] = sign;
    result['data'] = data;

    console.log("request请求参数：**********************************");
    console.log(param);
    console.log("***************************************************");

    return result;
};

module.exports = {
    GET: GET,
    POST: POST,
}