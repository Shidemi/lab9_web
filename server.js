const express = require('express');
const http = require('http');
const fs = require('fs');
const { Server } = require('socket.io');

const app = express();

const server = http.createServer(app);

const io = new Server(server);

app.use(express.static('public'));

let users = [];

let gameStarted = false;

let secretNumber = 0;

function startGame() {

    secretNumber =
        Math.floor(Math.random() * 100) + 1;

    gameStarted = true;

    console.log(secretNumber);

}

io.on('connection', (socket) => {

    socket.on('join', (username, callback) => {

        if (users.includes(username)) {

            callback({
                success:false
            });

            return;

        }

        socket.username = username;

        users.push(username);

        callback({
            success:true
        });

        io.emit('users', users);

        io.emit(
            'system',
            `👤 ${username} подключился`
        );

    });

    socket.on('startGame', () => {

        startGame();

        io.emit(
            'system',
            '🎮 Игра началась! Угадайте число от 1 до 100'
        );

    });

    socket.on('message', (msg) => {

        io.emit('chat', {
            user: socket.username,
            text: msg
        });

        if (!gameStarted) return;

        let num = parseInt(msg);

        if (isNaN(num)) return;

        if (num < secretNumber) {

            io.emit(
                'system',
                `📈 ${socket.username}: число больше`
            );

        }
        else if (num > secretNumber) {

            io.emit(
                'system',
                `📉 ${socket.username}: число меньше`
            );

        }
        else {

            io.emit(
                'system',
                `🏆 ${socket.username} угадал число ${secretNumber}`
            );

            gameStarted = false;

        }

    });

    socket.on('disconnect', () => {

        users = users.filter(
            u => u !== socket.username
        );

        io.emit('users', users);

        io.emit(
            'system',
            `❌ ${socket.username} вышел`
        );

    });

});

const PORT =
    process.env.PORT || 3000;

server.listen(PORT, () => {

    console.log(
        `Server started: ${PORT}`
    );

});