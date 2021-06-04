
import mysql from 'mysql'

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "DiyaPaul@35",
  database: "demo"
});


con.connect();

export default con;