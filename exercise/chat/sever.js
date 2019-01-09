var app = require('express')()
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

server.listen(3002);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});
console.log("http://localhost:3002");
var usercount = 0;

io.on('connection', function(socket) {
  //新user
	socket.on('add user',function(name){
		socket.username = name;
		console.log("new user:"+name+" logged.");
		usercount++;
		io.emit('add user',{username: socket.username});
  });
  
  //新訊息
  socket.on('chat message', function(msg){

		console.log(socket.username+":"+msg);

		io.emit('chat message', {username:socket.username,msg:msg});

	});

	//left
	socket.on('disconnect', function(msg){
		console.log(socket.username+" has left.");
		io.emit('left user',{username:socket.username});
	});
});
