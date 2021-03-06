'use strict';

const dotenv = require('dotenv').load();
const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);

const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const indexRouter = require('./routes/index');
const uploadRouter = require('./routes/upload');
const debRouter = require('./routes/debs');
const adminRouter = require('./routes/admin');

const app = express();

app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
}));

app.set('view engine', 'hbs');
app.set('trust proxy', true);
app.set('x-powered-by', false);

function connectWithRetry() {
  mongoose.connect(process.env.DB_URL + process.env.NODE_ENV, {
    useNewUrlParser: true,
    useCreateIndex: true,
  }, (err) => {
    if (err) return setTimeout(connectWithRetry, 1000);
    console.log('Successfully connected to DB');
  });
}
connectWithRetry();
const db = mongoose.connection;

app.use(express.static('static'));
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db,
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}));


app.use(authRouter);
app.use(indexRouter);
app.use(userRouter);
app.use(uploadRouter);
app.use(debRouter);
app.use(adminRouter);

app.use((req, res) => {
  res.sendStatus(404);
});

app.listen(8080, '0.0.0.0', () => {
  console.log(
    'Running on http://localhost:8080 in %s mode',
    app.get('env')
  );
});


module.exports = app;
