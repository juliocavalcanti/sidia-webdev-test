
$(document).ready(function() {
    console.log("chat started");
    var messages = [];
    var socket = io.connect('http://localhost/');
    var sessionId = window.param_sessionId;
    var userId = window.param_userId;
    var username = window.param_username;
    var message = document.getElementById("message");
    var content = document.getElementById("chat-content");

    socket.on('message', function (data) {
        if(data.message) {
            messages.push(data);
            var html = '';
            var meClass = ''

            for(var i=0; i<messages.length; i++) {
                if (messages[i].userId == messages[i].sessionId) {meClass = 'me';}
                html += '<div class="message '+meClass+'">';
                html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
                html += replaceURLWithHTMLLinks(messages[i].message);
                html += '</div>';
            }
            if (content) { 
                content.innerHTML = html;
                $("#chat-content").scrollTop($("#chat-content")[0].scrollHeight); 
            }
            
        } else {
            console.log("there is a problem:", data);
        }
    });

    function sendMessage() {
        var text = message.value;
        socket.emit('send', { message: text, username: username, userId: userId, sessionId: sessionId  });
        message.value = "";
    }

    function equalHeights (element1, element2) {
        var height;
        height = element1.outerHeight()-150;
        console.log("height elm1");
        console.log(height);
        element2.css('height', height);
        
    }

    function replaceURLWithHTMLLinks(text) {
        var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return text.replace(exp,"<a href='$1'>$1</a>"); 
    }

    $("#message").keyup(function(e) {
        console.log("tecla apertada");

        if(e.keyCode == 13) {
            console.log("enter apertado");
            sendMessage();
        }
    });
});