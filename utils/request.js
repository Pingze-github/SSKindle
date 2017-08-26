// 增强的request

// Promise化
// 超时重试
// 编码识别
// JSON自动解析
// 图片下载
// 文件下载

const fs = require('fs-extra');
const URL = require('url');
const request = require('request');
const iconv = require('iconv-lite');

module.exports = requestEx;

/**
 * 获取url的主机部分
 * @param url
 * @returns {string}
 */
function getHost(url) {
  let patts = URL.parse(url);
  return `${patts.protocol}//${patts.host}/`;
}

/**
 * 包裹方法，使其自动错误重试
 * 只能包裹返回Promise的方法
 * 返回promise，可以获取成功的返回值，或最后失败的err
 * @param func
 * @param retryMax
 * @returns {funcR}
 */
function autoRetry(func, retryMax) {
  retryNum = 0;
  let funcName = func.toString().match(/function (\w+)\(/)[1];
  return funcR = function () {
    let params = arguments;
    return new Promise((resolve, reject) => {
      func(...params).then(result => {
        resolve(result);
      }).catch(err => {
        if (retryNum < retryMax) {
          retryNum ++;
          console.warn(`[autoRetry] Catched error when ${funcName}() : ${err.message}. Retry ${retryNum} time...`);
          resolve(funcR(...params));
        } else {
          reject(err);
        }
      });
    });
  };
}

function requestEx(options) {
  function requestP(options) {
    if (!options.headers) options.headers = {};
    if (!options.headers['User-Agent']) options.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36';
    if (!options.headers['Referer']) options.headers['Referer'] = getHost(options.url);
    return new Promise((resolve, reject) => {
      request(options, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  }
  let {retry} = options;
  if (retry && parseInt(retry) > 0) return autoRetry(requestP, retry)(options);
  return requestP(options);
}

// TODO 增加失败重试
requestEx.download = function () {
  let savePath;
  let saveDir;
  let options;
  let retry;
  if (typeof arguments[0] === 'string' && typeof arguments[1] === 'string') {
    options = {};
    options.url = arguments[0];
    savePath = arguments[2];
  } else {
    savePath = options.path;
    saveDir = options.dir;
    retry = options.retry;
  }
  if (!options.headers) options.headers = {};
  if (!options.headers['User-Agent']) options.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36';
  if (!options.headers['Referer']) options.headers['Referer'] = getHost(options.url);
  return new Promise((resolve, reject) => {
    try {
      let stream = fs.createWriteStream(savePath);
      fs.createFileSync(savePath);
      request(options).pipe(stream);
      stream.on('finish', () => {
        resolve();
      });
    } catch (err) {
      reject(err);
    }
  })
};

if (!module.parent) {
  requestEx({
    url: 'http://localhost:10082/',
    retry: 0
  }).then((res) => {
    console.log('GOT res');
    console.log(res.body)
  }).catch((err) => {
    console.log('catch err');
    console.log(err)
  });
  requestEx.download('http://localhost:10082/a.txt', './a.txt')
}
