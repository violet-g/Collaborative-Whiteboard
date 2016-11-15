var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var canvas; // Entire canvas object
var line_history = [];
var chat_history = [];
var user_names = [];
var user_colour ="#000000";

function contains(name, list) {
	for (var i = 0; i < list.length; i++)
		if (list[i].toLowerCase() === name.toLowerCase())
			return true;
	return false;
}

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
		if(msg=="") return;
		chat_history.push({user: user, hours: hours, mins: mins, msg: msg});
		io.emit('chat message', user + " (" + hours + ":" + mins + "): \n" + msg );
	});
	
	socket.on('username', function(username){
		if (username == "anon")
			;
		else if (contains(username, user_names))
			socket.emit('username');
		else
			user_names.push(username);
	});

	for (var i = 0; i < chat_history.length; i++) {
		var item = chat_history[i];
		socket.emit('chat message', item.user + " (" + item.hours + ":" + item.mins + "): \n" + item.msg );
	}
	
	for (var i = 0; i < line_history.length; i++) {
		socket.emit('draw_line', { line: line_history[i].line, colour: line_history[i].colour } );
	}

	socket.on('draw_line', function (data) {
		line_history.push({line: data.line, colour: data.colour});
		io.emit('draw_line', { line: data.line, colour: data.colour});
	});

	socket.on('mouse-move', function(x_coord, y_coord){ // Will need to add user into params when possible
		console.log('Mouse moved: ' + x_coord +', ' + y_coord);
	});
});

http.listen(3000, function(){
	console.log('Localhost:3000 running');
});
