var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg, user, hours, mins){
    var minutes;
    if(mins < 10) minutes = '0' + mins;
    else minutes = mins;
    io.emit('chat message', user + " (" + hours + ":" + minutes + "): \n" + msg );
  });

  socket.on('typing', function(){
    socket.broadcast.emit('typing');
  });

});

  http.listen(3000, function(){
    console.log('listening on *:3000');
});