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

const DB_FILE = path.join(__dirname, 'db.json');

function readItems() {

    try {

        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, '[]');
        }

        const data =
            fs.readFileSync(DB_FILE, 'utf8');

        return JSON.parse(data);

    } catch (e) {

        console.log(e);

        return [];

    }

}

function saveItems(items) {

    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(items, null, 2)
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

    const items = readItems();

    res.json(items);

});

app.post('/items', (req, res) => {

    const items = readItems();

    const newItem = {

        id: Date.now(),

        name: req.body.name,

        description:
            req.body.description,

        rate: req.body.rate

    };

    items.push(newItem);

    saveItems(items);

    res.json(newItem);

});

app.delete('/items/:id', (req, res) => {

    const id =
        Number(req.params.id);

    let items = readItems();

    items = items.filter(
        item => item.id !== id
    );

    saveItems(items);

    res.json({
        success: true
    });

});

let users = [];

let gameStarted = false;

let secretNumber = 0;

io.on('connection', (socket) => {

    socket.on('join', (username) => {

        if (users.includes(username)) {

            socket.emit(
                'nameError'
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

        gameStarted = true;

        secretNumber =
            Math.floor(
                Math.random() * 100
            ) + 1;

        io.emit(
            'message',
            '🎮 Игра началась! Угадайте число от 1 до 100'
        );

    });

    socket.on('message', (data) => {

        if (!data) return;

        const username =
            data.username;

        const text =
            data.text;

        if (!username || !text) return;

        io.emit(
            'message',
            `${username}: ${text}`
        );

        if (!gameStarted) return;

        const number =
            parseInt(text);

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

        users =
            users.filter(
                user =>
                user !== socket.username
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
        `Server started on ${PORT}`
    );

});