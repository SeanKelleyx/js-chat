/*global require */
/*eslint no-console: ["error", { allow: ["warn", "error"] }] */
var express = require('express');
var app = express();

var http = require('http');
var server = http.Server(app);
var io = require('socket.io')(server);
var messages = [];

io.on('connection', function(socket){
    for(let i in messages){
        io.emit('message', messages[i]);
    }
    socket.on('message', function(msg){
        messages.push(msg);
        io.emit('message', msg);
    });
});

app.use(express.static('client'));

server.listen(8080, function() {
  //console.log('Chat server running');
});