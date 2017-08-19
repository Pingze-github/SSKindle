
module.exports = function (content, title) {
  lines = content.split('\n');
  content = '';
  lines.forEach((line) =>{
    line = line.trim();
    if (line.length === 0) return;
    if (title.includes(line)) return;
    content += `<p>&emsp;&emsp;${line}</p>`;
  });
  return content;
};