
module.exports = function (content) {
  lines = content.split('\n');
  content = '';
  lines.forEach((line) =>{
    line = line.trim()
    if (line.length === 0) return;
    content += `<p>&emsp;&emsp;${line}</p>`;
  });
  return content;
};