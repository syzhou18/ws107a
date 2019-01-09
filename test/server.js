var fs = require('fs'),
url = require('url'),
app = require('http').createServer(function(req, res) {
  var filename = '',
  resource = url.parse(req.url).pathname;
  switch(resource) {
    case '/test831a.js':
      console.log(resource);
      filename = __dirname + resource;
      res.setHeader('Content-Type', 'text/plain');
      break;
    default:
      filename = __dirname + '/test831.html';
      res.setHeader('Content-Type', 'text/html');
      break;
  }
  fs.readFile(filename, function(err, data) {
    if(err) {
      res.writeHead(500);
      return res.end('Error reading resource.');
    } else {
      res.writeHead(200);
      res.end(data);
    }
  });
}),
nicknames = {},
io = require('socket.io').listen(app)
rooms = require('./test831a');

io.sockets.on('connection', function(socket) {
  socket.on('setnickname', function(m) {
    if(typeof nicknames[m] === 'undefined') {
      nicknames[m] = {count: 0};
      socket.emit('nicknamesuccess', m);
      socket['nickname'] = m;
    } else {
      nicknames[m].count++;
      var t = m + '' + nicknames[m].count;
      socket.emit('nicknamefail', t);
      socket['nickname'] = t;
    }
  });
// 2
  socket.on('join', function(m) {
    if(checkroom(rooms, m)) {
      socket.join(m);
      socket['room'] = m;
      socket.broadcast.in(socket['room']).emit('system', socket['nickname'] + ' has joined this room.');// 6
      socket.emit('joinroomsuccess', {room:m});// 4
    }
  });
// 1
  socket.on('leave', function() {
    if(typeof socket['room'] !== 'undefined') {
      socket.broadcast.in(socket['room']).emit('system', socket['nickname'] + ' has left this room.');// 6
      socket.leave(socket['room']);
      delete socket['room'];
    }
  });
  socket.on('post', function(m) {
    if(typeof socket['room'] !== 'undefined') {
      socket.broadcast.in(socket['room']).emit('msg', m);
    } else {
      socket.emit('warning', 'You should choose a chat room first.');// 5
    }
  });
// 3
  socket.on('disconnect', function() {
    if(typeof socket['room'] !== 'undefined') {
      socket.broadcast.in(socket['room']).emit('system', socket['nickname'] + ' has left this room.');// 6
    }
  });
});

app.listen(80);

function checkroom(rooms, room) {
  var ret = false;
  for(var i in rooms) {
    if(room==i && rooms[i] == 'public') {
      ret = true;
    } 
  }
  return ret;
}