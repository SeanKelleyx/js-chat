/*global require, it, describe */
var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://localhost:8080/';

var options ={
    transports: ['websocket'],
    'force new connection': true
};

describe("Chat Server",function(){
    it('Should broadcast message to all users', function(done){
        var client1 = io.connect(socketURL, options);
        client1.on('connect', function(){
            client1.emit('message', {text: 'test', initials: 'CLIENT1'});
            var client2 = io.connect(socketURL, options);    
            client2.on('message', function(msg){
                msg.text.should.equal('test');
                msg.initials.should.equal('CLIENT1');
                client2.disconnect();
            });
        });
        client1.on('message', function(msg){
            msg.text.should.equal('test');
            msg.initials.should.equal('CLIENT1');
            //dont clear history
            //client1.emit('message', {clearHistory:true});
            client1.disconnect();
            done();            
        });
        
    });
    it('Should broadcast past messages to new users', function(done){
        var client3 = io.connect(socketURL, options);
        client3.on('message', function(msg){
            msg.text.should.equal('test');
            msg.initials.should.equal('CLIENT1');
            client3.emit('message', {clearHistory:true});
            client3.disconnect();
            done();            
        });
        
    });
    it('Should broadcast bot message for time question', function(done){
        var client4 = io.connect(socketURL, options);
        client4.on('connect', function(){
            client4.emit('message', {text: 'what is the time?', initials: 'CLIENT4'});
        });
        client4.on('message', function(msg){
            if(msg.initials == 'BOT'){
                msg.text.should.endWith('GMT');
                client4.emit('message', {clearHistory:true});
                client4.disconnect();
                done();
            }
        });
        
    });
    it('Should broadcast bot message for time question', function(done){
        var client5 = io.connect(socketURL, options);
        client5.on('connect', function(){
            client5.emit('message', {text: 'what is the weather?', initials: 'CLIENT5'});
        });
        client5.on('message', function(msg){
            if(msg.initials == 'BOT'){
                msg.text.should.equal('please include a city name');
                client5.emit('message', {clearHistory:true});
                client5.disconnect();
                done();
            }
        });
        
    });
});