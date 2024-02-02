// app.js
const sqlite3 = require('sqlite3').verbose();
const dbPath = './database.sqlite'; // Adjust the path to your database file
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { error } = require('console');
const app = express();
const secretKey = 'your-secret-key';
const cors = require('cors');
const path = require('path');
const https = require('https');
app.use(bodyParser.json());
//app.use(cors());
//app.use(cors({ origin: 'http://waahbiryani.rf.gd' }));

const directoryPath = path.join(__dirname, 'agentsdk');
// app.use(express.static(directoryPath));
// const corsOptions = {
//     origin: 'http://waahbiryani.rf.gd',
//     credentials: true,            //access-control-allow-credentials:true
//     optionSuccessStatus: 200
// }
// app.use(cors(corsOptions));


// Connect to SQLite database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log(`Connected to SQLite database at ${dbPath}`);
    }
});

// Create a table (Example: users)
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS usersinfo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL
    )
  `);
});

// Close the database connection when the Node.js process exits
process.on('exit', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Closed the database connection');
        }
    });
});

// Define routes
app.get('/api/getuserinfodata', (req, res) => {
    let records = [];
    db.each("SELECT username, password, email FROM users", function (err, row) {
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


app.post('/api/createuserinfodata', (req, res) => {
    const { username, password, email } = req.body;
    console.log("reqbody : ", username);
    const stmt = db.prepare('INSERT INTO usersinfo (username,password,email) VALUES (?,?,?)');
    stmt.run(username, password, email, (err) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            console.error(err.message);
        } else {
            console.log(`Inserted user: ${username}`);
            res.status(200).send('Success');
        }
        stmt.finalize();
    });
});


app.get('/realuserinfo', (req, res) => {
    const userinfo = req.query;
    console.log("reqbody : ", userinfo);
    const responseText = `__NV_SID__ = "001362152236607602689";
__NV_COUNTER__ = 1;
__NV_CPF__ = 2;
__NV_NAV_START_TIME__ = 317150782;
__NV_BROWSER_ID__ = 0;
__NV_GEO_ID__ = 0;
__NV_LOCATION_ID__ = 35;
__NV_ACCESS_TYPE_ID__ = -1;
__authKey = "null";
__authsKey = "";
__NV_SESS_START_TIME__ = 317150782;
__NV_CVF__ = "0";
__NV_CV__ = "0";
  `;
    //res.setHeader('Content-Type', 'text/plain');
    // Send the plain text response
    res.status(200).send(responseText);
});


app.get('/api/userauthentication', (req, res) => {
    const { username, password } = req.query;

    // Validate user credentials (replace with your authentication logic)
    if (username === 'suresh' && password === 'suresh1') {

        // Set the expiration time to 15 minutes (expressed in seconds)
        const expiresIn = 15 * 60; // 15 minutes * 60 seconds/minute
        // Generate and send a JWT token
        const token = jwt.sign({ username }, secretKey, { expiresIn});
        console.log("token : ",token);
        res.json({ "token" :token ,"error":'' });
    } else {
        res.status(401).json({ "token" :'',"error": 'Invalid credentials' });
    }
});




const port = process.env.port | 3000;
// Start the server
app.listen(port,() => {
    console.log(`Server is running on http://localhost:${port}`);
});

