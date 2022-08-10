var mosca = require('mosca');
var mysql = require('mysql');
var express = require("express");
var bodyParser = require('body-parser');


var db_config = {
    host: 'localhost',
    user: 'root',
    password: 'chontech2022!',
    database: 'ctc_meter'
};

var connection;

function handleDisconnect() {
    connection = mysql.createConnection(db_config); // Recreate the connection, since
    // the old one cannot be reused.

    connection.connect(function(err) { // The server is either down
        if (err) { // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        } // to avoid a hot loop, and to allow our node script to
    }); // process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect(); // lost due to either server restart, or a
        } else { // connnection idle timeout (the wait_timeout
            throw err; // server variable configures this)
        }
    });
}

handleDisconnect();

var app = express();

var http = require('http').Server(app);
app.use(bodyParser.json());

require('dotenv').config();
var settings = {
    port: 1883,
    http: {
        port: 8883
    }
};
app.get("/test", function(req, res) {
    console.log("READY")
});
var server = new mosca.Server(settings);
server.on('ready', setup); 
function setup() {
   
    console.log('Mosca server is up and running (auth)')
}
var authenticate = function(client, username, password, callback) {
    var authorized = (username === "ctc" && password.toString() === "12345678");
    if (authorized) client.user = username;
    callback(null, authorized);
}
server.on('clientConnected', function(client) {
    console.log('Client Connected:', client.id);
});
server.on('clientDisconnected', function(client) {
    console.log('Client Disconnected:', client.id);
});
server.on('published', function(packet, client) {
    //console.log(packet);
    console.log('Published', packet.payload.toString());
    const myArray = packet.payload.toString().substr(1, packet.payload.toString().length - 2).split(",");
    //console.log(myArray)
    if (packet.topic == "data_meter") {}
});

function insertData(myArray) {
    let sql = 'insert into log_data (id,v1,v2,v3,c1,c2,c3,kw,kwh,hz,pf1,pf2,pf3) values("' + myArray[0] + '","' + myArray[1] + '","' + myArray[2] + '","' + myArray[3] + '","' + myArray[4] + '","' + myArray[5] + '","' + myArray[6] + '","' + myArray[7] + '","' + myArray[8] + '","' + myArray[9] + '","' + myArray[10] + '","' + myArray[11] + '","' + myArray[12] + '")'
    connection.query(sql, function(err, result) {
        if (!err) {
            if (result.affectedRows) {
                console.log("insert OK")
            }
        } else {
            console.log(sql)
        }
    });
}
connection.on('error', function(err) {
    console.log("[mysql error]", err);
});

app.listen(7777);