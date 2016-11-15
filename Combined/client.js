var Username;
var colour = "#000000"; // Will need to get the colour from the DOM button for colour
var eraser = "#FFFFFF";
var socket  = io.connect();

function getName(msg){
	if (typeof msg === "undefined")
		Username = prompt("Please enter your name");
	else 
		Username = prompt(msg);
	if (!Username)
		Username = "anon";
	socket.emit('username', Username);
}

function erase(){
	var temp = colour;
	colour = eraser;
	eraser = temp;
}

document.addEventListener("DOMContentLoaded", function() {
	var mouse = {
		click: false,
		move: false,
		pos: {x:0, y:0},
		pos_prev: false
	};

	// get canvas element and create context
	var canvas  = document.getElementById('drawing');
	var context = canvas.getContext('2d');
	var width   = window.innerWidth;
	var height  = window.innerHeight;

	// set canvas to browser width/height
	canvas.width = width;
	canvas.height = height;

	// register mouse event handlers
	canvas.onmousedown = function(e){ mouse.click = true; };
	canvas.onmouseup = function(e){ mouse.click = false; };

	canvas.onmousemove = function(e) {
		// normalize mouse position to range 0.0 - 1.0
		mouse.pos.x = e.clientX / width;
		mouse.pos.y = e.clientY / height;
		mouse.move = true;
	};

	// draw line received from server
	socket.on('draw_line', function (data) {
		var line = data.line;
		var line_colour = data.colour; // Colour of pen
		context.beginPath();
		context.strokeStyle = line_colour;
		context.moveTo(line[0].x * width, line[0].y * height);
		context.lineTo(line[1].x * width, line[1].y * height);
		if (line_colour === '#FFFFFF')
			context.lineWidth = 25;
		else
			context.lineWidth = 1;
		context.stroke();
	});

	var timer;
	var objDiv = document.getElementById("messages");

	$('form').submit(function(){
		var time = new Date();
		socket.emit('chat message', $('#m').val(), Username, time.getHours(), time.getMinutes());
		$('#m').val('');
		return false;
	});

	socket.on('chat message', function(msg){
		$('#messages').append($('<li>').text(msg));
		objDiv.scrollTop = objDiv.scrollHeight;
	});
	
	socket.on('username', function(){
		getName("Sorry that name is taken please enter another");
	});

	// main loop, running every 25ms
	function mainLoop() {
		// check if the user is drawing
		if (mouse.click && mouse.move && mouse.pos_prev) {
			// send line to to the server
			socket.emit('draw_line', { line: [ mouse.pos, mouse.pos_prev ], colour:colour});
			mouse.move = false;
		}
		mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
		setTimeout(mainLoop, 25);
	}
	mainLoop();
});
