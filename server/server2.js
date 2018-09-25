const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const nba_test = require('./nba_test');

const port = 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('../client/dist/chabot'));

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('message', function (msg) {
    console.log('--> message: ' + msg)
    if (msg == 'candlestickStream') {
      nba_test.candlestickStream(forwardStreamData);
    }
  });
  nba_test.candlestickHistory(forwardRequestData);

  socket.on('disconnect', function (socket) {
    console.log('a user disconnected');
  })
});

function forwardStreamData(data) {
  console.log('<-- stream: ' + data);
  io.sockets.emit('candlestickStream', data);
}

function forwardRequestData(data) {
  console.log('<-- request: ' + data.length);
  io.sockets.emit('candlestickHistory', data);
}

// setInterval(function () {
//     io.sockets.emit('blabla');
// }, 1000);

// nba_test.wsTest();
// nba_test.candlestickStream(forwardStreamData);
// nba_test.candlestickHistory(forwardStreamData);

http.listen(port, () => {
  console.log(`Listening on *:${port}`);
});