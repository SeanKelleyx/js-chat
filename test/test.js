/*global require, it, describe, beforeEach, before, afterEach, after */
var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://localhost:8080/';

var options ={
    transports: ['websocket'],
    'force new connection': true
};

describe("Chat Server Messaging",function(){
    var client1, client2, client3;
    beforeEach(function(){
        client1 = io.connect(socketURL, options);
        client2 = io.connect(socketURL, options);
        client3 = io.connect(socketURL, options);
    });
    afterEach(function(){
        client1.disconnect();
        client2.disconnect();
        client3.disconnect();
    });
    before(function(){
        client1 = io.connect(socketURL, options);
        client1.emit('message', {clearHistory:true});
        client1.disconnect();
    })
    it('Should broadcast message to all users', function(done){
        client1.on('connect', function(){
            client1.emit('message', {text: 'test', initials: 'CLIENT1'}); 
            client2.on('message', function(msg){
                msg.text.should.equal('test');
                msg.initials.should.equal('CLIENT1');
            });
        });
        client1.on('message', function(msg){
            msg.text.should.equal('test');
            msg.initials.should.equal('CLIENT1');
            done();            
        });        
    });
    it('Should broadcast past messages to new users', function(done){
        client3.on('message', function(msg){
            msg.text.should.equal('test');
            msg.initials.should.equal('CLIENT1');
            client3.emit('message', {clearHistory:true});
            done();         
        });
        
    });
});
describe("Chat Server Bot Messages",function(){
    var client;
    beforeEach(function(){
        client = io.connect(socketURL, options);
    });
    afterEach(function(){
        client.emit('message', {clearHistory:true});
        client.disconnect();
    });
    it('Should broadcast bot message for time question', function(done){
        client.on('connect', function(){
            client.emit('message', {text: 'what is the time?', initials: 'CLIENT4'});
        });
        client.on('message', function(msg){
            if(msg.initials == 'BOT'){
                msg.text.should.endWith('GMT');
                done();
            }
        });
        
    });
    it('Should broadcast 2 bot messages for weather question with wrong format', function(done){
        var prompt1 = true;
        client.on('connect', function(){
            client.emit('message', {text: 'what is the weather?', initials: 'CLIENT'});
        });
        client.on('message', function(msg){
            if(msg.initials == 'BOT'){
                if(prompt1){
                    msg.text.should.equal('please include a city name');
                    prompt1 = false;
                }else{
                    msg.text.should.equal('like what is the weather in San Diego?');
                    done();
                }
            }
        });
        
    });
});