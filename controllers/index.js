
const searchSer = require('../services/search');

module.exports = {
  index,
  search
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
