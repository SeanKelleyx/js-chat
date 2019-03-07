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
        msg.timestamp = '' + new Date();
        sendMessage(msg);
        respond(msg);
    });
});
function sendMessage(msg){
    messages.push(msg);
    io.emit('message', msg);
}

// respond to valid questions
function respond(msg){
    if(isQuestion(msg)){
        if(askingTime(msg)){
            respondWithTime();
        }
        if(askingWeather(msg)){
            respondWithWeather(msg);
            /*
            // if has zip?
            if(messageHasZip(msg)){
                // get weather
                respondWithWeather(msg);
                
            }else{
                // prompt for zip
            }*/
        }
    }
}

//does message have a question mark
function isQuestion(msg){
    return msg.text.match(/\?$/);
}

//does message contain "time"
function askingTime(msg){
    return msg.text.toLowerCase().match(/time/i);
}

//respond with current UTC time
function respondWithTime(){
    sendMessage(buildBotMessage(new Date().toUTCString()));
}

//does message contain "weather"
function askingWeather(msg){
    return msg.text.toLowerCase().match(/weather/i);
}

// message has 5 digit zip code
function messageHasZip(msg){
    return msg.text.match(/\bd{5}\b/g);
}

function respondWithWeather(msg){
    //let zip = msg.text.match(/\bd{5}\b/g)[0];
    let zip = '';
    getWeather(zip);
}

//get weather info
function getWeather(zip){
    var request = require('request');
    request.get("https://www.metaweather.com/api/location/4118/", function(error, response){
        if(!error && response.statusCode == 200){
            var data = JSON.parse(response.body);
            sendMessage(buildBotMessage('The weather is: ' + data.consolidated_weather[0].weather_state_name));
        }else{
            // send weather error
            sendMessage(buildBotMessage('There was an error getting the weather.'));
        }
    })
}

function buildBotMessage(text){
    return {
        text: text,
        timestamp: '' + new Date(),
        initials: 'BT',
    };
}
app.use(express.static('client'));

server.listen(8080, function() {
  //console.log('Chat server running');
});