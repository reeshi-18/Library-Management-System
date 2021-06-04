import express from 'express'
import path from 'path'
import connection from '../connection.js'
const userRouter = express.Router()

global.__basedir = process.cwd();


//View Booklist

userRouter.get('/booklist', function (req, res) {

    if (req.session.flag == 1) {
        var sql = 'SELECT * FROM book';
        connection.query(sql, function (err, data, fields) {
            if (err) throw err;
            res.render(__basedir + '/views/booklist.ejs', { title: 'Booklist', userData: data });
        });
    }
    else {
        res.send("Login first");
    }

});


userRouter.post('/booklist', function (req, res) {


    if (req.session.flag == 1) {
        var sql = 'SELECT * FROM book where name like "' + req.body.search + '%"';
        connection.query(sql, function (err, data, fields) {
            if (err) throw err;
            res.render(__basedir + '/views/booklist.ejs', { title: 'Booklist', userData: data });
        });
    }
    else {
        res.send("Login first");
    }

});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Checkout books

userRouter.post('/checkout', function (req, res) {

    if (req.session.flag = 1) {
        var isbn = JSON.parse(req.body.book);

        for (var i = 0; i < isbn.length; i++) {
            var sq1 = "Select * from book where isbn='" + isbn[i] + "'";
            connection.query(sq1, (err, result, field) => {
                if (err) throw err;
                var name = result[0].name;
                var id = result[0].isbn;
                var quantity = result[0].quantity;

                if (quantity > 0) {
                    console.log(req.session.email);
                    var sql2 = "Select count(user) as cnt from book_status where isbn='" + id + "' and (status='Requested' or status='Book Issued') and user='" + req.session.email + "'";
                    

                    connection.query(sql2, (err2, count, field) => {

                        var c = count[0].cnt;
                        console.log(c)

                        if (err) throw err;
                        if (c > 0) {
                            res.send("Cannot issue more than one request for one book"); 
                            console.log("not inserted");
                        }
                        else {
                            var sql3 = "Insert into book_status (name,isbn,user,status) values ('" + name + "','" + id + "','" + req.session.email + "','Requested');";
                            connection.query(sql3, (error, data, field) => {
                                if (error) throw error;
                                
                                console.log("Inserted into book_status");
                            });
                        }
                    });
                }
                else
                {
                    res.send("Books not in stock");
                }
            });

        }
    }
    else {
        res.send("Login first")
    }

});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//User History

userRouter.get('/history', (req, res) => {

    if (req.session.flag == 1) {
        var sql1 = "Select * from book inner join book_status using(isbn) where book_status.user='" + req.session.email + "';"
        connection.query(sql1, (err, data, field) => {
            if (err) throw err;
            res.render(__basedir + '/views/history.ejs', { userData: data });
        })
    }
    else {
        res.send("Login first");
    }

})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Return books

userRouter.get('/return', (req, res) => {
    if (req.session.flag == 1) {
        var sql1 = "Select * from book_status where status='Book Issued' and user='" + req.session.email + "'";
        connection.query(sql1, (err, data, field) => {
            if (err) throw err;
            res.render(__basedir + '/views/return.ejs', { userData: data })
        });
    }
    else {
        res.send("Login first");
    }

})

userRouter.post('/return', (req, res) => {
    if (req.session.flag == 1) {
        var isbn = JSON.parse(req.body.book);
        for (var i = 0; i < isbn.length; i++) {

            var c = isbn[i];
            // console.log(c)
            var sql1 = "Update book_status set status='Returned' where isbn='" + c + "' and user='" + req.session.email + "'";
            connection.query(sql1, async(err, data, field) => {
                if (err) throw err;
                var sql2 = "Update book set quantity= quantity+1 where isbn='" + c + "'";
                connection.query(sql2, (error, data, field) => {
                    if (error) throw error;
                    console.log("Book returned and quantity updated");
                })
            })
        }
    }
    else {
        res.send("Login first");
    }

})



export default userRouter;