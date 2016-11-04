var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var canvas; // Entire canvas object


app.get('/client.js', function(req, res){
  res.sendFile('client.js', { root: __dirname });
});

app.get('/', function(req, res){
  res.sendFile('draw.html', { root: __dirname });
});

io.on('connection', function(socket){
  console.log('Hello there!');

  socket.on('disconnect', function(socket){
    console.log('User logged out.');
  });

  socket.on('drawing', function(socket){
    console.log('User drawing');
  });

  socket.on('stopped-drawing', function(socket){
    console.log('User stopped drawing');
  });
});

http.listen(3000, function(){
  console.log('Localhost:3000 running');
});
