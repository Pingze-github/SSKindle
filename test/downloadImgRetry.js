 const tools = require('../lib/txt2mobi-node/lib/tools');


async function foo() {
  try {

    await tools.downloadImg('http://upload-images.2jianshu.io/upload_images/823271-97710f5c61cb52b0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240', __dirname+'/img/test.jpg');
  }catch(e){
    console.log(e)
  }
}
foo()