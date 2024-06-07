const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const database = require('./bace/DataBace');
const authRoutes = require('./routes/auth-routes');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const indexRoutes = require('./routes/index');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();

require('./passport-config')(passport);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());


app.use(session({
    secret: '3d5879beae87657b4c944f7ee4da4886adc8cd5cb0c73b5675ce66d2773b3396',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', authRoutes);


app.use('/', indexRoutes);

app.get('/', (req, res) => {
    res.render('morok');
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'hitori931@gmail.com',
      pass: 'v f r u s c f k o l f q s n c z'
    }
  });
  
  async function sendWelcomeEmail(email, first_name) {
    const mailOptions = {
      from: 'hitori931@gmail.com',
      to: email,
      subject: 'Ласкаво просимо до нашого сервісу',
      text: `Привіт ${first_name},\n\nЛаскаво просимо до нашого сервісу! Ми раді вітати вас.\n\nЗ найкращими побажаннями,\nВаша Компанія`
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Вітальний лист надіслано на:', email);
    } catch (error) {
      console.error('Помилка при надсиланні вітального листа:', error);
    }
  }

const faceRouter = require('./routes/face');
app.use('/face', faceRouter);

app.get('/home', (req, res) => {
    res.render('index', { user: req.user });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post("/register", async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        const result = await database.registerUser(firstName, lastName, email, password);
        if (result) {
            res.redirect('/login');
        } else {
            res.status(400).send('User already exists');
        }
    } catch (err) {
        res.status(500).send('Error registering user');
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/profile', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('profile', { user: req.user });
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});

module.exports = app;
