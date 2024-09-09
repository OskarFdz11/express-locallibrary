const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog'); //Import routes for "catalog" area of site
const compression = require('compression');
const helmet = require('helmet');

const app = express();

// Set up rate limiter: maximum of twenty requests per minute

const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});

// Apply rate limiter to all requests
app.use(limiter);


// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const dev_db_url =
"mongodb+srv://oskarfdz11:spd69541@cluster0.p3emf.mongodb.net/local_library?retryWrites=true&w=majority&appName=Cluster0";
const mongoDB = process.env.MONGODB_URI || dev_db_url;


main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  }),
);


app.use(compression()); // Compress all routes


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter); // Add catalog routes to middleware chain

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
