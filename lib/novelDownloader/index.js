/**
 * 通用小说下载器
 * author: wang719695@gmail.com
 * createdate: 2017.8.11
 */

// 异步控制
// 代码通用
// 用户可配置

const fs = require('fs');
const URL = require('url');
const PATH = require('path');
const rq = require('request');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');

const Taskpool = require('./taskpool');
const config = require('./config');

module.exports = {
  getDoc,
  save: start,
  some: 1
};

let logger = {
  info() {
    console.log(`\u001b[32m [NovelDownloader][${new Date().toLocaleTimeString('chinese', {hour12: false})}]`, ...arguments, '\u001b[37m');
  },
  error() {
    console.log(`\u001b[31m [NovelDownloader][${new Date().toLocaleTimeString('chinese', {hour12: false})}]`, ...arguments, '\u001b[37m');
  },
  warn() {
    console.log(`\u001b[33m [NovelDownloader][${new Date().toLocaleTimeString('chinese', {hour12: false})}]`, ...arguments, '\u001b[37m');
  }
};

function randomIp() {
  let ip = '';
  for (let i in Array.from({length:4})) {
    let pattern = Math.ceil(Math.random() * 254);
    ip += pattern.toString() + '.';
  }
  return ip.slice(0, -1);
}

function getFullHref(href, url) {
  if (url.endsWith('/')) url = url.slice(0, -1);
  let {host, protocol} = URL.parse(url);
  protocol = protocol || 'http:';
  if (href.startsWith('http')) return href;
  if (href.startsWith('//')) return `${protocol}${href}`;
  if (href.startsWith('/')) return `${protocol}//${host}${href}`;
  return `${url}/${href}`;
}

function getHostConfig(url) {
  let host = URL.parse(url).host;
  if (!(host in config.hosts)) {
    logger.error(`尚未配置此host: ${host} 。请配置后再尝试...`);
    process.exit();
  }
  return config.hosts[host];
}

/**
 * 请求数据，自动重试
 * 返回未编码的chunks
 * @param options
 * @returns {Promise}
 */
function request(options) {
  return new Promise((resolve, reject) => {
    let req = rq(options);
    req.on('error', function (err) {
      if (['ETIMEDOUT', 'ESOCKETTIMEDOUT'].includes(err.code) || true) {
        resolve(false);
      } else {
        reject(err);
      }
    });
    req.on('response', function (res) {
      let chunks = [];
      res.on('data', function (chunk) {
        chunks.push(chunk);
      });
      res.on('end', function () {
        resolve(chunks);
      });
    });
  });
}

/**
 * 获取url指向页面文档
 * 自动识别编码
 * 自动重试
 * @param url
 * @returns {Promise}
 */
async function getPage(url) {
  let options = config.requestOptions;
  options.url = url;
  options.headers['X-Real-IP'] = randomIp();
  options.headers['X-Forwarded-For'] = randomIp();
  let chunks;
  for (let i = 0; i < config.maxRetry; i++) {
    chunks = await request(options);
    if (chunks) break;
    logger.warn(`请求 ${url} 超时，重试${i+1}次...`);
  }
  let body;
  if(!chunks) {
    logger.warn(`请求 ${url} 失败，跳过`);
    body = '';
  } else {
    body = chunks.toString();
  }
  let charset = body.match('charset=["\']{0,1}([a-zA-Z0-9]{3,8})["\']');
  charset = charset ? charset[1] : 'utf-8';
  return iconv.decode(Buffer.concat(chunks), charset);
}

async function getContent(chapter) {
  let url = chapter.url;
  let hostConfig = getHostConfig(url);
  let page = await getPage(url);
  let $ = cheerio.load(page);
  let $content;
  if (hostConfig.content.selector) {
    $content = $(hostConfig.content.selector);
  } else {
    eval(`$content = ${hostConfig.content.jquery}`);
  }
  return $content.text();
}

function getInfo($, url) {
  let hostConfig = getHostConfig(url);
  let info = {};
  for (let item of ['title', 'author', 'cover']) {
    let $item;
    if (hostConfig[item].selector) {
      if (item === 'cover') $item = getFullHref($(hostConfig[item].selector).attr('src'), url);
      else $item = $(hostConfig[item].selector).text();
    } else {
      eval(`$item = ${hostConfig[item].jquery}`);
    }
    if (!$item) {
      return logger.error(`未检索到小说${item}，请检查 ${URL.parse(url).host} 配置...`);
    }
    info[item] = $item;
  }
  if (info.author.match('[:：]')) {
    info.author = info.author.match('[：:]{1}(.+)$')[1];
  }
  return info;
}

function getCatalog($, url) {
  let hostConfig = getHostConfig(url);
  let $catalog;
  if (hostConfig.catalog.selector) {
    $catalog = $(hostConfig.catalog.selector);
  } else {
    eval(`$catalog = ${hostConfig.catalog.jquery}`);
  }
  if (!$catalog) {
    logger.error(`未检索到小说目录，请检查 ${URL.parse(url).host} 配置...`);
    process.exit();
  }
  return (($c) => {
    let c = [];
    for (let index of Array.from({length: $c.length}, (v, i) => i)) {
      $ch = $c.eq(index);
      c.push({
        index,
        title: $ch.text(),
        url: getFullHref($ch.attr('href'), url)
      });
      index++;
    }
    return c;
  })($catalog);
}

function writeFile(doc, saveDir) {
  let path = PATH.join(saveDir, `${doc.title}.txt`);
  let content = '';
  content += doc.title + '\r\n';
  content += `作者：${doc.author}\r\n\r\n`;
  for (let chapter of doc.chapters) {
    content += chapter.title + '\r\n\r\n';
    content += (chapter.content + '\r\n\r\n');
  }
  fs.writeFileSync(path, content, 'utf-8');
  return path;
}

function getDoc(url) {
  return new Promise(async (resolve, reject) => {
    try {
      let catalogPage = await getPage(url);
      const $ = cheerio.load(catalogPage);
      let info = getInfo($, url);
      let catalog = getCatalog($, url);
      logger.info(`成功获取书籍信息。书名: ${info.title} 作者: ${info.author}`);
      logger.info(`成功获取封面图片路径: ${info.cover}`);
      logger.info(`成功获取书籍目录。共${catalog.length}章`);
      taskpool = new Taskpool();
      taskpool
        .option({
          saveResult: false,
          endsWhenEmpty: true
        })
        .init(catalog)
        .limit(config.limit)
        .task(getContent)
        .on('success', (content, chapter) => {
          catalog[chapter.index].content = content;
        })
        .progress((finish, total, success, failed, state, chapter) => {
          if (state === -1) {
            logger.warn(`${chapter.url} 下载失败`);
          }
          logger.info(`章节下载进度: ${finish}/${total}. ${failed}个失败`);
        })
        .then(() => {
          logger.info('全部文档下载完成');
          let doc = {
            title: info.title,
            author: info.author,
            cover: info.cover,
            chapters: catalog
          };
          resolve(doc);
        })
        .start();
    } catch (err) {
      reject(err);
    }
  });
}

async function start(url) {
  logger.info('程序启动');
  try{
    fs.mkdirSync(config.saveDir);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.error(`创建存放目录 ${config.saveDir} 失败。请检查配置...`);
      process.exit();
    }
  }
  await getDoc(url, (doc) => {
    let savePath = writeFile(doc, config.saveDir);
    logger.info('写入文件完成: ' + savePath);
  });
}


if (!module.parent) {
  let url = process.argv[2];
  if (!url) {
    logger.error('未传入网址，请重新输入');
    process.exit();
  }
  //url = 'http://www.biquge.tv/0_621/';
  start(url).catch((err) => {
    logger.info(err);
  });
}

