var mosca = require('mosca');
var setting = {
    port: 1883,
    http: {
        port: 8883
    }
}
var server = new mosca.Server(setting)
server.on('ready', setup)

function setup() {
    // server.authenticate = authenticate
    // console.log("mosca server is up and runing (auth)")
}

var authenticate = function(client, username, password, callback) {
    var authorized = (username === 'mqtt' && password.toString() === 'password')
    if (authorized) client.user = username
    callback(null, authorized)
}