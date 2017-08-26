
// 测试搜索功能 和 数据整合

const request = require('request');

function requestP (options) {
  return new Promise((resolve, reject) => {
    request(options, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}

