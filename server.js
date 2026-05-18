const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();

const server = http.createServer(app);

const io = socketIO(server);

app.use(express.static('public'));

app.get('/', (req, res) => {

    res.sendFile(
        path.join(__dirname, 'public/index.html')
    );

});

app.get('/chat', (req, res) => {

    res.sendFile(
        path.join(__dirname, 'public/chat.html')
    );

});

let users = [];

let gameStarted = false;

let secretNumber = 0;

io.on('connection', (socket) => {

    socket.on('join', (username) => {

        if (!username) return;

        if (users.includes(username)) {

            socket.emit('nameError');

            return;

        }

        socket.username = username;

        users.push(username);

        io.emit('users', users);

        io.emit(
            'message',
            `👤 ${username} подключился`
        );

    });

    socket.on('message', (data) => {

        if (!data) return;

        const username = data.username;

        const text = data.text;

        if (!username || !text) return;

        io.emit(
            'message',
            `${username}: ${text}`
        );

        if (!gameStarted) return;

        const number = parseInt(text);

        if (isNaN(number)) return;

        if (number < secretNumber) {

            io.emit(
                'message',
                `📈 ${username}: число больше`
            );

        }
        else if (number > secretNumber) {

            io.emit(
                'message',
                `📉 ${username}: число меньше`
            );

        }
        else {

            io.emit(
                'message',
                `🏆 ${username} угадал число ${secretNumber}`
            );

            gameStarted = false;

        }

    });

    socket.on('startGame', () => {

        gameStarted = true;

        secretNumber =
            Math.floor(Math.random() * 100) + 1;

        io.emit(
            'message',
            '🎮 Игра началась! Угадайте число от 1 до 100'
        );

    });

    socket.on('disconnect', () => {

        if (socket.username) {

            users = users.filter(
                user => user !== socket.username
            );

            io.emit('users', users);

            io.emit(
                'message',
                `❌ ${socket.username} вышел`
            );

        }

    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {

    console.log(`Server started: ${PORT}`);

});