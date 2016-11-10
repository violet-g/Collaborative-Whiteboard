var Username;
function getName() {
	Username = prompt("Please enter your name");
        //var list_users = [];

        //if(Username in list_users){
         // console.log("Username already taken.\n Please choose another username.");
        //}else{
        //  list_users.push(Username);
        //}
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
	var socket  = io.connect();

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
		var colour = data.colour; // Colour of pen
		context.beginPath();
		context.strokeStyle = colour;
		context.moveTo(line[0].x * width, line[0].y * height);
		context.lineTo(line[1].x * width, line[1].y * height);
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

	/* if a key is pressed, emit typing **/
	$('input').keydown(function(e){
		if (e.which != 13)
			socket.emit('typing');
	});

	/* if server tells you there is 'typing' clear any previous timeout (allows message to be displayed during long typing sessions), display the "someone is typing message" and then reset the timer to clear the message after 1500ms **/
	socket.on('typing', function(){
		clearTimeout(timer);
		$('div').text("Someone is typing...");
		timer = setTimeout(function(){
			$('div').empty();
		}, 1500);
	});

	// main loop, running every 25ms
	function mainLoop() {
		// check if the user is drawing
		if (mouse.click && mouse.move && mouse.pos_prev) {
			// send line to to the server
			socket.emit('draw_line', { line: [ mouse.pos, mouse.pos_prev ], colour:"#0099ff"});
			mouse.move = false;
		}
		mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
		setTimeout(mainLoop, 25);
	}
	mainLoop();
});
