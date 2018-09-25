const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const Broadcast = require('./util/broadcast');
const Chabot = require('./chabot');

const port = 3000;

var start = function (mode) {
    chabot.run(mode);
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('../client/dist/chabot'));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const broadcast = new Broadcast(forwardStreamData);
const chabot = new Chabot(broadcast);

io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('message', function (msg) {
        console.log('--> message: ' + msg['cmd'])
        
        if ('cmd' in msg && 'options' in msg) {
            chabot.requestData(msg['cmd'], msg['options']);
            console.log(msg);
        }

    });

    socket.on('disconnect', function (socket) {
        console.log('a user disconnected');
    })
});

function forwardStreamData(symbol, data) {
    io.sockets.emit(symbol, data);
}

http.listen(port, () => {
    console.log(` - SERVER: Listening on *:${port}`);
});

module.exports = {
    start
}