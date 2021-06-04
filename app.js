import express from 'express';
import session from 'express-session';
import path from 'path';
import authRouter from './router/auth.js'
import adminRouter from './router/admin.js'
import userRouter from './router/user.js'

global.__basedir = process.cwd();

const app = express();


app.use(session({
  secret: 'ssshhhhh',
  saveUninitialized: false,
  resave: false,
  cookie:{
    maxAge: 24*60*60,
    sameSite: true,
    secure: false
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(authRouter);
app.use(adminRouter);
app.use(userRouter);

app.use(express.static('stylesheets'));
app.set('view engine', 'ejs')

app.get("/", (req, res) => {
  res.render(path.join(__basedir+'/views/home.ejs'));
});

app.listen(3000, () => {
  console.log("server running in localhost 3000");
});
