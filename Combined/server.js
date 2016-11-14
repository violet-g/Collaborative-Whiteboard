var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var canvas; // Entire canvas object
var line_history = [];
var user_colour ="#000000";

app.use(express.static(__dirname));

app.get('/client.js', function(req, res){
	res.sendFile('client.js', { root: __dirname });
});

app.get('/', function(req, res){
	res.sendFile('whiteboard.html', { root: __dirname });
});

io.on('connection', function(socket){

	socket.on('disconnect', function(socket){
		console.log('User logged out.');
	});

	socket.on('chat message', function(msg, user, hours, mins){
		mins = ((mins < 10) ? '0' : '') + mins;
		hours = ((hours < 10) ? '0' : '') + hours;
		io.emit('chat message', user + " (" + hours + ":" + mins + "): \n" + msg );
	});

	socket.on('typing', function(){
		socket.broadcast.emit('typing');
	});

	for (var i in line_history) {
		socket.emit('draw_line', { line: line_history[i], colour: user_colour } );
	}

	socket.on('draw_line', function (data) {
		line_history.push(data.line);
		line_history.push(data.colour)
		io.emit('draw_line', { line: data.line, colour: data.colour});
	});

	socket.on('mouse-move', function(x_coord, y_coord){ // Will need to add user into params when possible
		console.log('Mouse moved: ' + x_coord +', ' + y_coord);
	});
});

http.listen(3000, function(){
	console.log('Localhost:3000 running');
});