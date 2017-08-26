
const searchSer = require('../services/search');

module.exports = {
  index,
  search,
  getBook
};

async function index(req, res, next){
  next({view: 'index'});
}

async function search(req, res, next) {
  let {key} = req.query;
  if (!key) return next({code: 1, msg: '未指定关键字'});
  let result = searchSer.search(key);
  next({data: {key, result}});
}

async function getBook(req, res, next) {
  let {title, format} = req.query;
  if (!title) return next({code: 1, msg: '未指定书名'});
  if (!format) format = 'txt';
  let name = `${title}.${format}`;
  let path = `./books/${title}/${name}`;
  res.download(path, name, (err, result) => {
    if (err) return next({code: 1, msg: '不存在指定文件'});
  });
}
