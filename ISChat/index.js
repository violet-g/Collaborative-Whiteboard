var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile('index.html', {root: __dirname});
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg, user, hours, mins){
    mins = ((mins < 10) ? '0' : '') + mins;
    hours = ((hours < 10) ? '0' : '') + hours;
    io.emit('chat message', user + " (" + hours + ":" + mins + "): \n" + msg );
  });

  socket.on('typing', function(){
    socket.broadcast.emit('typing');
  });

});

  http.listen(3000, function(){
    console.log('listening on *:3000');
});
