# Library-Management-System
The backend of a Library Management system using Node js, Express js and mysql

To run the application, install node js, node package manager and mysql

Install express, nodemon and mysql packages using the comman
npm i express nodemon mysql

Create the tables in mysql:

1)User

CREATE table User(
id PRIMARY KEY AUTO_INCREMENT=10001
name varchar(255),
phone int,
email varchar(255),
pwd varchar(255));

2)Admin

CREATE table Admin(
id PRIMARY KEY AUTO_INCREMENT=50001
name varchar(255),
phone int,
email varchar(255),
pwd varchar(255));

3)Book

CREATE table Book(
name varchar(255),
author varchar(255),
genre varchar(255),
isbn varchar(255),
quantity int);

4)book_status

CREATE table book_status(
isbn varchar(255),
name varchar(255),
user varchar(255),
status varchar(255));
