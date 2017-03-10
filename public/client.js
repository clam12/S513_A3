// shorthand for $(document).ready(...)
$(function() {
    var socket = io();
	var nicknames;
	var chat;
	
    $('form').submit(function(){
		let msg = $('#m').val();
		
			socket.emit('chat', msg);
		
		$('#m').val('');
		return false;
    });
	
	// retrieves the users nickname from the server
	socket.on('nickname', function(user) {
		nickname = user;
		$('#nickname').text('You are ' + nickname);
	});
	
	// retrieves the list of users who are online from the server
	socket.on('usernames', function(data) {
		$('#users').empty();
		for(i = 0; i< data.length; i++) {
			$('#users').append($('<li>').text(data[i]));
		}
	});
	
	// confirms that the color has been changed
	socket.on('color-change', function(color) {
		chat = ('<span style="color: ' + color + '> Your nickname color is now ' + color +'</span>');
		$('#messages').append($('<li>').text(chat));
	});
	
	
	// retrieves the chat message from the server
    socket.on('chat', function(data){
		let nick = data.nickname;
		let timeStamp = data.timestamp
		let color = data.color;
		let message = data.msg;
		chat = ('[' + timeStamp + '] ' + nick + ': ' + message);
		if(nickname === nick)
			$('#messages').append($('<li class="bold">').text(chat));
		else
			$('#messages').append($('<li>').text(chat));
    });
	
});
