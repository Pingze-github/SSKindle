

module.exports = {
  info() {
    console.log(`\u001b[32m [${new Date().toLocaleTimeString('chinese', {hour12: false})}]`, ...arguments, '\u001b[37m');
  },
  error() {
    console.log(`\u001b[31m [${new Date().toLocaleTimeString('chinese', {hour12: false})}]`, ...arguments, '\u001b[37m');
  },
  warn() {
    console.log(`\u001b[33m [${new Date().toLocaleTimeString('chinese', {hour12: false})}]`, ...arguments, '\u001b[37m');
  },
  fork() {
    console.log(`\u001b[37m [${new Date().toLocaleTimeString('chinese', {hour12: false})}]`, ...arguments, '\u001b[37m');
  }
};