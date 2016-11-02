var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/client.js', function(req, res){
  res.sendFile('client.js', { root: __dirname });
});

app.get('/', function(req, res){
  res.sendFile('draw.html', { root: __dirname });
});

var id = 0;
io.on('connection', function(socket) {
});

http.listen(3000, function(){
  console.log('Listening on *:3000');
});
