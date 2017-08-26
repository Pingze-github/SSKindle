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

const PATH = require('path');
const fse = require('fs-extra');

const config = require('./config');
const logger = require('./lib/logger');
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
        return logger.info('[txt2mobi] 请提供结构化文档作为输入');
      } else {
        if (!docS) docS = this.docS;
      }
      // 建立工作文件夹
      genDir = genDir || config.genDir;
      let workDir = PATH.join(genDir, docS.title);
      fse.mkdirsSync(workDir);
      logger.info(`[txt2mobi] 建立工作文件夹${workDir}`);
      // 处理正文格式
      docS.chapters.forEach((chapter) => {
        chapter.content = filter(chapter.content, chapter.title);
      });
      // 处理封面图像文件
      if (docS.cover) {
        // TODO 本地图片的情况
        //fse.copySync(docS.cover, PATH.join(workDir, PATH.basename(docS.cover)));
        //docS.cover = PATH.join(workDir, PATH.basename(docS.cover));
        let imgName = `cover${PATH.extname(docS.cover) || '.jpg'}`;
        try {
          await tools.downloadImg(docS.cover, PATH.join(workDir, imgName));
          await tools.command(`${config.pythonPath} ${PATH.join(__dirname, 'pyScripts/imgResize.py')} ${PATH.join(workDir, imgName)}`);
          docS.cover = imgName;
        } catch (err) {
          logger.warn(`[txt2mobi] Meet error when create cover: ${err.message}`);
          logger.warn(`[txt2mobi] 下载图片 ${docS.cover} 失败，不使用封面`);
          docS.cover = PATH.join(__dirname, 'assets/cover.jpg');
        }
      } else {
        docS.cover = PATH.join(__dirname, 'assets/cover.jpg');
      }
      logger.info(`[txt2mobi] 设置封面图片${docS.cover}`);
      docS.publisher = 'Ping';
      docS.lang = docS.lang || 'zh-cn';
      txt2opf(PATH.join(workDir, 'book.opf'), docS);
      txt2ncx(PATH.join(workDir, 'book.ncx'), docS);
      txt2html(PATH.join(workDir, 'book.html'), docS);
      logger.info(`[txt2mobi] 生成html文件`);
      // 调用kindlegen编译
      process.chdir(workDir);
      let cmd = `${config.kindlegenPath} ${'book.opf'} -c${config.compressLevel} -o ${docS.title}.mobi`;
      logger.info(`[txt2mobi] 正在调用kindlegen...`);
      let stdout = await tools.command(cmd);
      logger.fork(stdout);
      logger.info('[txt2mobi] 生成mobi电子书成功');
    } catch (err) {
      console.error(err)
    }

  }
};

module.exports = Translator;
