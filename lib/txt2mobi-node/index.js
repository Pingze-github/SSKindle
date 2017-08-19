/**
 * 结构化文档 docStrucured
 *  {
 *    title,
 *    author,
 *    lang,
 *    cover,
 *    chpters: [
 *      {
 *        title,
 *        content
 *      }
 *    ]
 *  }
 */

const fse = require('fs-extra');
const path = require('path');

const config = require('./config');
const txt2html = require('./lib/txt2html');
const txt2opf = require('./lib/txt2opf');
const txt2ncx = require('./lib/txt2ncx');
const filter = require('./lib/filter');
const tools = require('./lib/tools');

function Translator(docS) {
 this.docS = docS || null;
}

Translator.prototype = {
  constructor: Translator,
  async gen(docS, genDir) {
    try {
      if (!docS && !this.docS) {
        return console.log('[txt2mobi] 请提供结构化文档作为输入');
      } else {
        if (!docS) docS = this.docS;
      }
      // 建立工作文件夹
      genDir = genDir || config.genDir;
      let workDir = path.join(genDir, docS.title);
      fse.mkdirsSync(workDir);
      console.log(`[txt2mobi] 建立工作文件夹${workDir}`);
      // 处理正文格式
      docS.chapters.forEach((chapter) => {
        chapter.content = filter(chapter.content);
      });
      // 处理封面图像文件
      if (docS.cover) {
        //fse.copySync(docS.cover, path.join(workDir, path.basename(docS.cover)));
        //docS.cover = path.join(workDir, path.basename(docS.cover));
        let imgName = `cover${path.extname(docS.cover) || '.jpg'}`;
        await tools.downloadImg(docS.cover, path.join(workDir, imgName));
        docS.cover = imgName;
      } else {
        docS.cover = path.join(__dirname, 'assets/cover.jpg');
      }
      console.log(`[txt2mobi] 设置封面图片${docS.cover}`);
      docS.publisher = 'Ping';
      docS.lang = docS.lang || 'zh-cn';
      txt2opf(path.join(workDir, 'book.opf'), docS);
      txt2ncx(path.join(workDir, 'book.ncx'), docS);
      txt2html(path.join(workDir, 'book.html'), docS);
      console.log(`[txt2mobi] 生成html文件`);
      // TODO 调用kindlegen编译

    } catch (err) {
      console.error(err)
    }

  }
};

module.exports = Translator;
