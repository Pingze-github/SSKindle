
const childProcess = require('child_process');
const iconv = require('iconv-lite');

module.exports = function (cmd) {
  return new Promise((resolve, reject) =>{
    childProcess.exec(command, {encoding: 'buffer'}, (error , stdout) => {
      // TODO 修复正常调用kindlegen时存在error的问题
      if (error) reject(error);
      stdout = iconv.decode(stdout, 'utf-8');
      resolve(stdout);

    });
  });
};

