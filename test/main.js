
const downloader = require('../lib/novelDownloader');
const translator = new (require('../lib/txt2mobi-node'))();

async function foo() {
  try {
    url = 'http://www.biquge.tv/8_8313/';
    let doc = await downloader.getDoc(url);
    translator.gen(doc, __dirname + '/books');
  } catch (err) {
    console.error(err);
    process.exit();
  }
}
foo();

// TODO 分章
// 考虑到书本体积问题和目录过大问题
// 一本1500章的书，txt体积15M左右，mobi二级压缩80M左右
// 500章一本，比较合适
// 不分其实也没多大事

//  TODO 封面问题
// kindle设备 不能像pc版那样 识别封面
// 猜测是封面尺寸问题，需要图像处理
// 可以调用python脚本来处理 // 使用gm
// 不设置封面时，如何消除封面页

// 信息页面
// 尝试直接写在book.html里面

// TODO 发邮件
// 使用NodeMailer