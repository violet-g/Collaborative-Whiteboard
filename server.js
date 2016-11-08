var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var canvas; // Entire canvas object
var line_history = [];


app.get('/client.js', function(req, res){
  res.sendFile('client.js', { root: __dirname });
});

app.get('/', function(req, res){
  res.sendFile('draw.html', { root: __dirname });
});

io.on('connection', function(socket){

  socket.on('disconnect', function(socket){
    console.log('User logged out.');
  });

  for (var i in line_history) {
      socket.emit('draw_line', { line: line_history[i], colour: "#0099ff" } );
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
