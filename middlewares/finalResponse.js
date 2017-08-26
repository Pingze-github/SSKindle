
const statusMsgMap = {
  '404' : '请求失败，未找到请求的资源',
  '403' : '请求失败，服务器拒绝',
  '401' : '请求失败，需求用户验证',
  '500' : '请求失败，服务器内部错误'
};

module.exports = () => {
  return function (result, req, res, next) {
    if (result.view) {
      return res.render(result.view)
    }
    if (result instanceof Error) {
      console.error('Meet Error:');
      console.error(result);
      res.status(500);
      return res.send({code: -1, msg: statusMsgMap[500], data:{}});
    }
    if (!result.data) result.data = {};
    if (result.status && result.status !== 200){
      res.status(result.status);
      if (!result.code) result.code = -1;
      if (!result.msg) result.msg = statusMsgMap[result.status];
    } else {
      if (!result.code) result.code = 0;
      if (!result.msg) result.msg = '请求成功';
    }
    return res.send(result);
  };
};