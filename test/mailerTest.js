
const mailer = require('nodemailer');

let transporter = mailer.createTransport({
  service: 'QQ',
  secure: true,
  auth: {
    user: '719695274@qq.com',
    pass: 'sbpvmraseyplbbdc'
  }
});

let mailOptions = {
  from: '719695274@qq.com',
  to: 'wang719695@gmail.com',
};

module.exports = function (bookName, bookPath) {
  return new Promise((resolve, reject) => {
    mailOptions.subject = bookName;
    mailOptions.attachments = [{
      filename: `${bookName}.mobi`,
      path: bookPath
    }];
    transporter.sendMail(mailOptions, function(error, info){
      if (error) reject(error);
      if (info && info.response.startsWith('250 Ok')) {
        resolve(info);
      } else {
        reject(new Error('Send mail failed'));
      }
    });
  });
};


module.exports('大王饶命', './books/大王饶命/大王饶命.mobi').then((info) => {
  console.log(info)
});