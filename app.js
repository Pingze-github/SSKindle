
const express = require('express');
const pug = require('pug');
const bodyParser = require('body-parser');

require('./global');
const finalResponse = require('./middlewares/finalResponse');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.static('books'));

const indexRouter = require('./routers/index');
app.use('/', indexRouter);

app.use('*', (req, res, next) => {
  next({status: 404})
});

app.use(finalResponse());

let server = app.listen(config.port, () => {
  let port = server.address().port;
  console.info('SSKindle running on port ' + port);
});