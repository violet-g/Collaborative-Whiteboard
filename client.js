var express = require('express');
var app = express;
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', (process.env.PORT || 3000));
app.use(express.static(__dirname + '/public'));

http.listen(app.get('port'), function(){
  console.log('Server address: localhost:'+app.get('port'));
})
