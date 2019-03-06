/*global $, io */
var socket = io();
$('form').on('submit',function () {
	var message = {
        text: $('#message').val(),
        initials: $('#initials').val(),
    }
	socket.emit('message', message);
    $('#message').val('');
	return false;
});
socket.on('message', function (message) {
    $('<li>').text(message.initials + ' says: ' + message.text).appendTo('#history');
});
