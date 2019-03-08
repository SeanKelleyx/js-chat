/*global require */
/*eslint no-console: ["error", { allow: ["warn", "error"] }] */
var express = require('express');
var app = express();
var request = require('request');
var http = require('http');
var server = http.Server(app);
var io = require('socket.io')(server);
var messages = [];

io.on('connection', function(socket){
    for(let i in messages){
        io.emit('message', messages[i]);
    }
    socket.on('message', function(msg){
        if(msg.clearHistory){
            messages = [];
        }else{
            msg.timestamp = '' + new Date();
            sendMessage(msg);
            respond(msg);
        }
    });
});
function sendMessage(msg){
    messages.push(msg);
    io.emit('message', msg);
}
function sendPrompt(msg){
    io.emit('message', msg);
}

// respond to valid questions
function respond(msg){
    if(isQuestion(msg)){
        if(askingTime(msg)){
            respondWithTime();
        }
        if(askingWeather(msg)){
            //respondWithWeather(msg);
            
            // if has location?
            if(messageHasLocation(msg)){
                // get weather
                respondWithWeather(msg);
            }else{
                // prompt for zip
                sendPrompt(buildBotMessage('please include a city name'));
                sendPrompt(buildBotMessage('like what is the weather in San Diego?'));
            }
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

// message has a location
function messageHasLocation(msg){
    return msg.text.toLowerCase().match(/weather\Win\W(.+)\?/g);
}

function respondWithWeather(msg){
    //let zip = msg.text.match(/\bd{5}\b/g)[0];
    let cityRegex = /weather\Win\W(.+)\?/g;
    let matches = cityRegex.exec(msg.text.toLowerCase());
    let city = matches[1];
    getWoeidInfo(city, function(city){
        //error callback
        sendMessage(buildBotMessage('There was an error getting location info for ' + city + '.'));
    }, function(locationData){
        //success callback
        getWeather(locationData, function(city){
            //error callback
            sendMessage(buildBotMessage('There was an error getting the weather for ' + locationData.city + '.'));
        }, function(data){
            //success callback
            sendMessage(buildBotMessage('In ' + data.title + ': ' + data.consolidated_weather[0].weather_state_name));
        });
    });
}

//get weather info
function getWeather(locationData, errorCallback, successCallback){
    request.get("https://www.metaweather.com/api/location/" + locationData.woeid + "/", function(error, response){
        if(!error && response.statusCode == 200){
            var data = JSON.parse(response.body);
            successCallback(data);
        }else{
            // send weather error
            errorCallback(locationData);
        }
    });
}

//get where on earth id from city name
function getWoeidInfo(city, errorCallback, successCallback){
    request.get("https://www.metaweather.com/api/location/search/?query=" + city, function(error, response){
        if(!error && response.statusCode == 200){
            var data = JSON.parse(response.body);
            if(data.length < 1){
                errorCallback(city);
            }else{
                successCallback({
                    city: data[0].title,
                    woeid: data[0].woeid,
                });
            }
        }else{
            errorCallback(city);
        }
    });
}

function buildBotMessage(text){
    return {
        text: text,
        timestamp: '' + new Date(),
        initials: 'BOT',
    };
}
app.use(express.static('client'));

server.listen(8080, function() {
  //console.log('Chat server running');
});