const socket = io();

let username =
    localStorage.getItem(
        'chatUsername'
    );

if (!username) {

    while (true) {

        username =
            prompt(
                'Введите имя'
            );

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

    localStorage.removeItem(
        'chatUsername'
    );

    location.reload();

});

const input =
    document.getElementById('input');

const messages =
    document.getElementById('messages');

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

socket.on('users', (users) => {

    const usersList =
        document.getElementById('users');

    usersList.innerHTML = '';

    users.forEach(user => {

        usersList.innerHTML += `
        <li>${user}</li>
        `;

    });

});

function sendMessage() {

    if (!input.value) return;

    socket.emit('message', {

        username: username,
        text: input.value

    });

    input.value = '';

}

input.addEventListener(
'keydown',
(e) => {

    if (e.key === 'Enter') {

        sendMessage();

    }

});

document
.getElementById('sendBtn')
.onclick = sendMessage;

document
.getElementById('startBtn')
.onclick = () => {

    socket.emit('startGame');

};