const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.static('public'));

const DB_FILE = 'db.json';

function readData() {

    try {

        const data =
            fs.readFileSync(DB_FILE);

        return JSON.parse(data);

    } catch {

        return [];

    }

}

function writeData(data) {

    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(data, null, 2)
    );

}

app.get('/', (req, res) => {

    res.sendFile(
        path.join(__dirname,
        'public/index.html')
    );

});

app.get('/chat', (req, res) => {

    res.sendFile(
        path.join(__dirname,
        'public/chat.html')
    );

});

app.get('/items', (req, res) => {

    const items = readData();

    res.json(items);

});

app.post('/items', (req, res) => {

    const items = readData();

    const item = {

        id: Date.now(),
        name: req.body.name,
        description: req.body.description,
        rate: req.body.rate

    };

    items.push(item);

    writeData(items);

    res.json(item);

});

app.put('/items/:id', (req, res) => {

    const items = readData();

    const id = Number(req.params.id);

    const item = items.find(
        i => i.id === id
    );

    if (!item) {

        return res
        .status(404)
        .json({ error: 'not found' });

    }

    item.name = req.body.name;
    item.description =
        req.body.description;
    item.rate = req.body.rate;

    writeData(items);

    res.json(item);

});

app.delete('/items/:id', (req, res) => {

    let items = readData();

    const id = Number(req.params.id);

    items = items.filter(
        i => i.id !== id
    );

    writeData(items);

    res.json({
        success: true
    });

});

let users = [];

let secretNumber = Math.floor(
    Math.random() * 100
) + 1;

let gameStarted = false;

io.on('connection', (socket) => {

    socket.on('join', (username) => {

        if (users.includes(username)) {

            socket.emit(
                'nameError',
                'Имя занято'
            );

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

    socket.on('startGame', () => {

        secretNumber =
            Math.floor(Math.random() * 100) + 1;

        gameStarted = true;

        io.emit(
            'message',
            '🎮 Игра началась! Угадайте число от 1 до 100'
        );

    });

    socket.on('message', (data) => {

        const username =
            data.username;

        const msg =
            data.text;

        io.emit(
            'message',
            `${username}: ${msg}`
        );

        if (!gameStarted) return;

        const number = parseInt(msg);

        if (isNaN(number)) return;

        if (number < secretNumber) {

            io.emit(
                'message',
                `📈 ${username}: число больше`
            );

        } else if (
            number > secretNumber
        ) {

            io.emit(
                'message',
                `📉 ${username}: число меньше`
            );

        } else {

            io.emit(
                'message',
                `🏆 ${username} угадал число ${secretNumber}`
            );

            gameStarted = false;

        }

    });

    socket.on('disconnect', () => {

        users = users.filter(
            u => u !== socket.username
        );

        io.emit('users', users);

        if (socket.username) {

            io.emit(
                'message',
                `❌ ${socket.username} вышел`
            );

        }

    });

});

const PORT =
    process.env.PORT || 3000;

server.listen(PORT, () => {

    console.log(
        `Server started: ${PORT}`
    );

});