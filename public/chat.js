const socket = io();

let username =
    localStorage.getItem(
        'chatUsername'
    );

if (!username) {

    while (true) {

        username =
            prompt('Введите имя');

        if (!username) continue;

        localStorage.setItem(
            'chatUsername',
            username
        );

        break;

    }

}

socket.emit('join', username);

socket.on('nameError', () => {

    alert('Имя уже занято');

    localStorage.removeItem(
        'chatUsername'
    );

    location.reload();

});

const messages =
    document.getElementById(
        'messages'
    );

const users =
    document.getElementById(
        'users'
    );

const input =
    document.getElementById(
        'input'
    );

function addMessage(text) {

    const div =
        document.createElement('div');

    div.className = 'message';

    div.textContent = text;

    messages.appendChild(div);

    messages.scrollTop =
        messages.scrollHeight;

}

socket.on('message', (msg) => {

    addMessage(msg);

});

socket.on('users', (list) => {

    users.innerHTML = '';

    list.forEach(user => {

        const li =
            document.createElement('li');

        li.textContent = user;

        users.appendChild(li);

    });

});

function sendMessage() {

    const text =
        input.value.trim();

    if (!text) return;

    socket.emit('message', {

        username: username,

        text: text

    });

    input.value = '';

}

document
.getElementById('sendBtn')
.onclick = sendMessage;

input.addEventListener(
'keydown',
(e) => {

    if (e.key === 'Enter') {

        sendMessage();

    }

});

document
.getElementById('startBtn')
.onclick = () => {

    socket.emit('startGame');

};