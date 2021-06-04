// const express = require("express");
// const admin = express.Router();
// const connection = require("../connection");

import express from 'express'
import path from 'path'
import connection from '../connection.js'
const adminRouter = express.Router()


global.__basedir = process.cwd();

//add books

adminRouter.get('/addbook', (req, res) => {

    if (req.session.flag == 2) {
        res.render(__basedir + '/views/addbook.ejs')
    }
    else {
        res.send("Login first");
    }
});

adminRouter.post('/addbook', (req, res) => {
    const { name, author, genre, isbn, quantity } = req.body;
    var sql1 = "SELECT isbn FROM book WHERE isbn = '" + isbn + "'";

    connection.query(sql1, (err, result, field) => {
        if (result.length == 0) {
            var sql2 = 'insert into book (name,author,genre,isbn,quantity) values ("' +
                connection.escape(name) +
                '","' +
                connection.escape(author) +
                '","' +
                connection.escape(genre) +
                '","' +
                connection.escape(isbn) +
                '","' +
                connection.escape(quantity) +
                '");';

            connection.query(sql2, (error, result, field) => {
                if (error) {
                    console.log(error);
                    res.send("couldn't insert");
                } else {
                    res.send("Book added to library");
                }
            });
        }
        else {
            res.send("Book already exists in library");
        }
    });
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

//view books

adminRouter.get('/viewbook', function (req, res) {

    if (req.session.flag == 2) {
        var sql = 'SELECT * FROM book';
        connection.query(sql, function (err, data, fields) {
            if (err) throw err;
            res.render(__basedir + '/views/viewbook.ejs', { title: 'Booklist', userData: data });
        });
    }
    else {
        res.send("Login first");
    }

});


//Search books


adminRouter.post('/viewbook', function (req, res) {


    if (req.session.flag == 2) {
        var sql = 'SELECT * FROM book where name like "' + req.body.search + '%"';
        connection.query(sql, function (err, data, fields) {
            if (err) throw err;
            res.render(__basedir + '/views/viewbook.ejs', { title: 'Booklist', userData: data });
        });
    }
    else {
        res.send("Login first");
    }

});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

//View Users

adminRouter.get('/viewuser', function (req, res) {

    if (req.session.flag == 2) {
        var sql1 = 'SELECT id,name,phone,email FROM user';
        var sql2 = 'SELECT id,name,phone,email FROM admin';
        connection.query(sql1, function (err, userdata, fields) {


            if (err) throw err;

            connection.query(sql2, function (err, admindata, fields) {
                if (err) throw err;
                res.render(__basedir + '/views/viewuser.ejs', { userData: userdata, adminData: admindata });

            });


        });

    }
    else {
        res.send("Login first");
    }

});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Issue books

adminRouter.get('/issue', function (req, res) {

    if (req.session.flag == 2) {
        var sql1 = "Select * from book_status where status='Requested'";
        connection.query(sql1, (err, data, field) => {
            if (err) throw err;
            res.render(__basedir + '/views/issue.ejs', { statusData: data });
        });
    }
    else {
        res.send("Login first");
    }

});

//approve book requests

adminRouter.post('/approve', function (req, res) {
    if (req.session.flag == 2) {
        var isbn = JSON.parse(req.body.book);
        console.log('approval thread')
        for (var i = 0; i < isbn.length; i++) {
            var c = isbn[i];
            // console.log(c);
            var sql1 = "Update book_status set status = 'Book Issued' where isbn='"+c+"'";
            connection.query(sql1, (err, result, field) => {
                if (err) throw err;
                console.log("Request Accepted")
                var sql2 = "Update book set quantity= quantity-1 where isbn='"+c+"'";
                connection.query(sql2, (error, res, field) => {
                    if (error) throw error;
                    console.log("Quantity updated")
                })

            })
        }
    }
    else {
        res.send("Login first")
    }

});


//reject book requests

adminRouter.post('/reject', function (req, res) {
    if (req.session.flag == 2) {
        var isbn = JSON.parse(req.body.book);

        for (var i = 0; i < isbn.length; i++) {
            var c = isbn[i];
            console.log(c);
            var sql1 = "Update book_status set status = 'Rejected' where isbn='" + c + "'";
            connection.query(sql1, (err, result, field) => {
                if (err) throw err;
                console.log("Request Declined")
            })
        }
    }
    else {
        res.send("Login first");
    }

});

//view userlog

adminRouter.get('/userlog', function(req,res){
    if(req.session.flag==2)
    {
        var sql1= "Select user.id, user.name, user.email, book_status.name as book, book_status.isbn from user inner join book_status on user.email=book_status.user where book_status.status='Book Issued'";
        connection.query(sql1, (err, data, field)=>{
            if(err) throw err;
            res.render(__basedir+'/views/userlog.ejs', {userData:data})
            console.log("Data printed")
        })
    }
    else
    {
        res.send("Login first");
    }
})




export default adminRouter;