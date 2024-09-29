require('dotenv').config();
require('./models/connection');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var onboardingRouter = require('./routes/onBoarding');
var propositionRouter = require('./routes/propositions');
var profileRouter = require('./routes/profile');
var discussionRouter = require('./routes/discussion');
var app = express();



const fileUpload = require('express-fileupload');
app.use(fileUpload());

const cors = require('cors');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/onboarding', onboardingRouter );
app.use('/', propositionRouter);
app.use('/proposition', propositionRouter);
app.use('/', profileRouter);
app.use('/', discussionRouter);

module.exports = app;
