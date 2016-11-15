var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var canvas; // Entire canvas object
var line_history = [];
var chat_history = [];
var user_names = [];
var colours =[{colour: "#4C4CFF", id: null}, {colour: "#31CC99", id: null}, {colour: "#FF007E", id: null},
{colour: "#FF7E00", id: null}, {colour: "#9E9E5E", id: null}, {colour: "#7E00FF", id: null},
{colour: "#8C1616", id: null}, {colour: "#D8D819", id: null}, {colour: "#871E77", id: null},
{colour: "#426E42", id: null}, {colour: "#8E8EBC", id: null}];

function contains(name, list) {
	for (var i = 0; i < list.length; i++)
		if (list[i].username.toLowerCase() === name.toLowerCase())
			return true;
	return false;
}

function freeUsername(id) {
	for (var i = 0; i < user_names.length; i++)
		if (user_names[i].id === id)
			user_names.splice(i, 1);
}

function freeColour(id) {
	for (var i = 0; i < colours.length; i++)
		if (colours[i].id === id)
			colours[i].id = null;
}

app.use(express.static(__dirname));

app.get('/client.js', function(req, res){
	res.sendFile('client.js', { root: __dirname });
});

app.get('/', function(req, res){
	res.sendFile('whiteboard.html', { root: __dirname });
});

io.on('connection', function(socket){

	socket.on('disconnect', function(){
		console.log('User logged out.');
		freeUsername(socket.id);
		freeColour(socket.id);
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
			user_names.push({username: username, id: socket.id});
	});

	for (var i = 0; i < chat_history.length; i++) {
		var item = chat_history[i];
		socket.emit('chat message', item.user + " (" + item.hours + ":" + item.mins + "): \n" + item.msg );
	}
	
	for (var i = 0; i < line_history.length; i++) {
		socket.emit('draw_line', { line: line_history[i].line, colour: line_history[i].colour } );
	}
	
	for (var i = 0; i < colours.length; i++) {
		if (colours[i].id == null) {
			socket.emit('colour', colours[i].colour);
			colours[i].id = socket.id;
			break;
		}
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
