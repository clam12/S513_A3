var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var users = [];
var userColor = [];
var userCount = 0;


http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));

// listen to 'chat' messages
io.on('connection', function(socket){
	
    // sets up a default nickname and color for the user when they first connect
    socket.nickname = "user " + ++userCount;
    socket.color = "black";
    users.push(socket.nickname);
    userColor.push(socket.color);
	
	console.log('a user has connected');

    // send the user their random nickname
    socket.emit('nickname', socket.nickname);

    // send a list of all currently connected users
    io.emit('usernames', users);
	
	
	// sends message back to the client with extra info such as user nickname, timestamp, etc
    socket.on('chat', function(msg){
		if(msg.startsWith('/nickcolor')) {
			var colorPosition = users.indexOf(socket.nickname);
			socket.color = msg.substring(11);
			userColor[colorPosition] = socket.color;
		    io.emit('color-change', {nickname:socket.nickname, color: socket.color});
		
		} else if(msg.startsWith('/nick')) {
			if(users.indexOf(msg.substring(6))  != -1) {
				socket.emit('nick-error', {error: 'nickname is taken'});
			} else {
				var nickPosition = users.indexOf(socket.nickname);
				socket.nickname = msg.substring(6);
				users[nickPosition] = socket.nickname;
				socket.emit('nickname', socket.nickname);
				io.emit('usernames', users);
			}
		} else {
			var time = new Date();
			var messages = {nickname: socket.nickname, color: socket.color, msg: msg, timestamp: time.getHours() + ":" + time.getMinutes()};
			io.emit('chat', messages);
		}
    });
	
	
	// when user leaves the chat system, removes their name from the list of users online
	socket.on('disconnect', function(data) {
		console.log('a user has disconnected');
		//var position = users.indexOf(socket.nickname);
		users.splice(users.indexOf(socket.nickname), 1);
		userColor.splice(users.indexOf(socket.nickname), 1);
		io.emit('usernames', users);
	});
});
