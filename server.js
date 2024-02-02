const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const sqlite3 = require('sqlite3').verbose();
const db =new sqlite3.Database(':memory:'); 

db.serialize(function () {
    db.run("CREATE TABLE lorem (info TEXT)");

    var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (var i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    stmt.finalize();
});

// Middleware for parsing JSON requests
app.use(bodyParser.json());

// Define routes
app.get('/api/data', (req, res) => {
    let records = [];
    db.each("SELECT rowid AS id, info FROM lorem", function (err, row) {
        if (err) {
            console.error('Error executing MySQL query:', err);
            res.status(500).send('Internal Server Error');
        } else {
            records.push(row);
        }
    }, function () {
        res.json(records);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
