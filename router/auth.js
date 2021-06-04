// const express = require("express");
// const authRouter = express.authRouter();
// const bcrypt = require('bcrypt');
// const dotenv = require("dotenv");
// const connection = require("../connection");
// const session= require('../session');

import express from 'express'
import path from 'path'
import bcrypt from 'bcrypt'
import connection from '../connection.js'
import session from 'express-session';

const authRouter = express.Router()

authRouter.use(session({
  secret: 'ssshhhhh',
  saveUninitialized: false,
  resave: false,
  cookie:{
    maxAge: 24*60*60,
    sameSite: true,
    secure: false
  }
}));


global.__basedir = process.cwd();


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////



//Register

authRouter.get("/register", (req, res) => {

  res.render(__basedir + '/views/register.ejs')
});

authRouter.post("/register", async (req, res) => {
  console.log(req.body);
  const { role, name, phone, email, pwd } = req.body;


  //hashing
  const saltRounds = 10;
  const epwd = await bcrypt.hash(pwd, saltRounds)
  var sql1;
  if (role == 'admin') {
    sql1 = "SELECT email FROM admin WHERE email = '" + email + "'";
  }
  else {
    sql1 = "SELECT email FROM user WHERE email = '" + email + "'";
  }

  connection.query(sql1, (err, result, field) => {

    var sql2;

    if (role == 'admin') {
      sql2 = 'insert into admin (name,phone,email,pwd) values ("' +
        connection.escape(name) +
        '","' +
        connection.escape(phone) +
        '","' +
        connection.escape(email) +
        '","' +
        connection.escape(epwd) +
        '");';
    }
    else {
      sql2 = 'insert into user (name,phone,email,pwd) values ("' +
        connection.escape(name) +
        '","' +
        connection.escape(phone) +
        '","' +
        connection.escape(email) +
        '","' +
        connection.escape(epwd) +
        '");';
    }

    if (result.length == 0) {
      connection.query(sql2, (error, results, fields) => {
        if (error) {
          console.log(error);
          res.writeHead(500);
          res.end("couldn't insert");
        } else {
          res.writeHead(200);
          res.end("Account created successfully");
        }
      }
      );
    }
    else {
      res.end("Email-id already exists");
    }
  }
  );
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//login as USER

authRouter.get("/login_u", (req, res) => {

  res.render(__basedir + '/views/login_u.ejs')
});

authRouter.post('/login_u', (req, res) => {
  try {

    console.log(req.body);
    const { email, pwd } = req.body;

    var sql3 = "SELECT email FROM user WHERE email = '" + connection.escape(email) + "'";
    connection.query(sql3, (err, result, field) => {

      if (result.length == 0) {
        console.log("email id invalid");
        res.send("email-id does not exist");
      }
      else {

        var sql4 = "SELECT * FROM user WHERE email = '" + connection.escape(email) + "'";
        connection.query(sql4, async (error, result, field) => {

          //comparing hashed password
          const compare = await bcrypt.compare(pwd, result[0].pwd);

          if (compare) {
            req.session.flag=1;
            req.session.email=result[0].email;
            res.redirect('/user');
          }
          else {
            res.end("Invalid password");
          }
        });
      }
    });
  } catch (err) {
    console.log(err.message);
  }
});

//Route to user page

authRouter.get("/user", (req, res) => {

  if (req.session.flag == 1) {
    res.render(__basedir+'/views/user.ejs', {title:req.session.name});

  }
  else {
    res.send("Login first");
  }

});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


//login as ADMIN

authRouter.get("/login_a", (req, res) => {

  res.render(__basedir + '/views/login_a.ejs')
});

authRouter.post('/login_a', (req, res) => {
  try {

    console.log(req.body);
    const { email, pwd } = req.body;

    var sql5 = "SELECT email FROM admin WHERE email = '"+connection.escape(email)+"'";
    connection.query(sql5, (err, result, field) => {


      if (result.length == 0) {
        console.log(result);
        res.send("email-id does not exist");
      }
      else {

        var sql6 = "SELECT * FROM admin WHERE email = '" + connection.escape(email) + "'";
        connection.query(sql6, async (error, result, field) => {

          //comparing hashed password
          const compare = await bcrypt.compare(pwd, result[0].pwd);

          if (compare) {
            req.session.flag = 2;
            req.session.name=result[0].name;
            res.redirect('/admin');
          }
          else {
            res.send("Invalid password");
          }
        });
      }
    });
  } catch (err) {
    console.log(err.message);
  }
});

//route to ADMIN

authRouter.get("/admin", (req, res) => {

  if (req.session.flag == 2) {
      res.render(__basedir + '/views/admin.ejs',{title:req.session.name});
  }
  else {
      res.send("Login first");
  }

});






///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Logout

authRouter.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect('/');
})

export default authRouter;






//step1: user registers
//details(uname, pwd) stored in database
//userlogs in uname pwd
//username, pwd sent to pwd
//jwt token generate