
const URL = require('url');
const fs = require('fs-extra');
const request = require('request');

module.exports = {
  downloadImg
};

function getHost(url) {
  let patts = URL.parse(url);
  return `${patts.protocol}//${patts.host}/`;
}

function downloadImg (imgUrl, imgPath) {
  return new Promise((resolve, reject) => {
    try {
      let stream = fs.createWriteStream(imgPath);
      fs.createFileSync(imgPath);
      request({
        url: imgUrl,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36',
          'Referer': getHost(imgUrl)
        }
      })
        .pipe(stream);
      stream.on('finish', () => {
        resolve();
      });
    } catch (err) {
      reject(err);
    }
  })
}

