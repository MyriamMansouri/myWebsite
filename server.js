const nodemailer = require('nodemailer');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const hbs = require('hbs');
const { check } = require('express-validator/check');
var helmet = require('helmet');

require('dotenv').config();

var app = express();
app.use(helmet());

const port = process.env.PORT || 3000;
console.log(port);

app.use(express.static(path.join(__dirname, '/public')));
hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');

console.log(process.env.NODE_ENV);

app.use((req, res, next) => {
  var now = new Date().toString();
  var log = `${now}:${req.method} ${req.url}`;
  console.log(log);
  next();
});

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.render('index.hbs');
});


// POST route from contact form
app.post('/', [
  check('name').isLength({ min: 3}).trim().escape(),
  check('email').isEmail().normalizeEmail(),
  check('message').isLength({ max: 10^4 }).trim().escape()
  ],function (req, res) {
    // console.log(req.body.message);

      let mailOpts, smtpTrans;
      smtpTrans = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS
        }
      });
      mailOpts = {
        from: req.body.name + ' &lt;' + req.body.email + '&gt;',
        to: process.env.GMAIL_USER,
        subject: 'New message from contact form at myriammansouri.com',
        text: `${req.body.name} (${req.body.email}) says: ${req.body.message}`
      };
      // TODO Message to user to confirm email was sent
      smtpTrans.sendMail(mailOpts, function (err, info) {
        if (err) {
          console.log('Error:', err);
        } else {
          console.log('Email sent.')
        }
      });
    res.render('index.hbs');
  });

app.listen(port, () => {
    console.log(`Server is up and running on port ${port}`);
});