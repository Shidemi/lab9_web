const socket = io();

let username =
    localStorage.getItem('chatUsername');

if(!username){

    while(true){

        username =
            prompt("Введите имя");

        if(!username) continue;

        localStorage.setItem(
            'chatUsername',
            username
        );

        break;

    }

}

const input =
    document.getElementById('msg');

input.addEventListener('keydown', function(e){

    if(e.key === 'Enter'){

        sendMessage();

    }

});

function sendMessage() {

    if (input.value.trim() === '')
        return;

    socket.emit(
        'message',
        input.value
    );

    input.value = '';

}

function startGame() {

    socket.emit('startGame');

}

socket.on('chat', (msg) => {

    addMessage(
        `<b>${msg.user}:</b> ${msg.text}`,
        'chat-message'
    );

});

socket.on('system', (text) => {

    addMessage(
        text,
        'system-message'
    );

});

socket.on('users', (users) => {

    let html = '';

    users.forEach(user => {

        html += `<li>${user}</li>`;

    });

    document.getElementById('users').innerHTML =
        html;

});

function addMessage(text, className) {

    let div =
        document.createElement('div');

    div.className = className;

    div.innerHTML = text;

    const messages =
        document.getElementById('messages');

    messages.appendChild(div);

    messages.scrollTop =
        messages.scrollHeight;

}