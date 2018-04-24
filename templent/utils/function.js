const configGlobal = require('../config/config_global.js');

function prt(content) {
    console.log(content);
};

function parseTime(timestamp) {
    var date = new Date(parseInt(timestamp)).toLocaleDateString();　　 //输出结果为2016/8/9
    // date = formatDate(date);
    　　 //输出结果为2016-08-09，满足YYYY-MM-DD格式要求
    return date;
}

function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
};

function formatDate(date, split) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    return [year, month, day].map(formatNumber).join(split || '')
};

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
};

/**
 * 去除内容中的HTML标签--转成纯文本
 * @param {Object} str
 */
function removeHTMLTag(str) {
    str = str.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
    str = str.replace(/[ | ]*\n/g, '\n'); //去除行尾空白
    str = str.replace(/\n[\s| | ]*\r/g, '\n'); //去除多余空行
    str = str.replace(/ /ig, ''); //去掉
    str = str.replace(/^\s+/, '').replace(/\s+$/, ''); //去除多余空格

    return str;
}

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

module.exports = {
    prt: prt,
    parseTime: parseTime,
    formatTime: formatTime,
    formatDate: formatDate,
    removeHTMLTag: removeHTMLTag,
    getTimestamp: getTimestamp
};