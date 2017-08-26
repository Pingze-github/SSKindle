// 建立一个可以进行指定次数的错误重试的库，应支持返回值

estr = '{{';
setTimeout(() => {
  estr = '{}';
}, 2500);

// 可包裹的函数
// 1、返回promise
// 2、能够用reject获取错误
function foo (param) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try{
        //console.log(param);
        JSON.parse(estr);
        return resolve(param);
      } catch (err) {
        return reject(err);
      }
    }, 1000);
  })
}

function foo2 (param) {
  // 异步回调里的错误，在内外try-catch-throw都是抛不出来的
  setTimeout(() => {
      console.log(param);
      JSON.parse('{{');
  }, 5000);
}


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

/**
 * 包裹方法，使其自动错误重试
 * 只能包裹返回Promise的方法
 * 返回promise，可以获取成功的返回值，或最后失败的err
 * @param func
 * @param retryMax
 * @returns {funcR}
 */
function autoRetry2(func, retryMax) {
  retryNum = 0;
  let funcName = func.toString().match(/function (\w+)\(/)[1];
  return funcR = async function () {
    let params = arguments;
    try {
      return await func(...params);
    } catch (err) {
      if (retryNum < retryMax) {
        retryNum ++;
        console.warn(`[autoRetry] Catched error when ${funcName}() : ${err.message}. Retry ${retryNum} time...`);
        return funcR(...params);
      } else {
        throw err;
      }
    }
  };
}

foo = autoRetry(foo, 3);

foo(123)
  .then(d => {
    console.log('成功返回：');
    console.log(d)
  })
  .catch(e => {
    console.log('最后错误：');
    console.log(e)
  })
/*
foo(123).catch(err => {
  console.error('捕获到错误',err);
  //funcR(...params)
}).then((result) => {
  console.log('result', result);
})*/
