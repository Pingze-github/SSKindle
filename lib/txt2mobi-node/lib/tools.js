
const URL = require('url');
const fse = require('fs-extra');
const request = require('request');
const childProcess = require('child_process');
const iconv = require('iconv-lite');

module.exports = {
  downloadImg : autoRetry(downloadImg, 3),
  command
};

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

function downloadImg (imgUrl, imgPath) {
  return new Promise((resolve, reject) => {
    try {
      let stream = fse.createWriteStream(imgPath);
      request({
        url: imgUrl,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36',
          'Referer': getHost(imgUrl)
        },
        timeout: 3000
      })
        .on('error', err => {
          reject(err)
        })
        .pipe(stream);
      stream.on('finish', () => {
        resolve();
      });
      stream.on('error', err => {
        reject(err)
      });
    } catch (err) {
      reject(err);
    }
  })
}




function command(cmd) {
  return new Promise((resolve, reject) =>{
    childProcess.exec(cmd, {encoding: 'buffer'}, (error , stdout) => {
      // TODO 修复正常调用kindlegen时存在error的问题
      if (error) reject(error);
      stdout = iconv.decode(stdout, 'utf-8');
      resolve(stdout);

    });
  });
};
