const WebSocketClient = require('websocket').client;
const io = require('socket.io-client');

const binance = require('node-binance-api')().options({
    APIKEY: '63vJeNyHKJrtiDb8qH4bEMwtbHIlNPoELMaV5Wjym5ZfcIbKZV4G95JxR5rbgBbw',
    APISECRET: '<secret>',
    useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
    test: true // If you want to use sandbox mode where orders are simulated
});

function candlestickCallback(candlesticks) {
    let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
    let { t: openTime, o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;
    console.log(symbol + " " + interval + " candlestick update");
    console.log("open: " + open);
    console.log("high: " + high);
    console.log("low: " + low);
    console.log("close: " + close);
    console.log("volume: " + volume);
    console.log("isFinal: " + isFinal);
    // let endpoints = binance.websockets.subscriptions();
    // for (let endpoint in endpoints) {
    //     console.log(endpoint);
    // }
}

module.exports = {
    startCandlestickStream: function () {
        binance.websockets.candlesticks(['ETHBTC'], "1m", candlestickCallback);
    },

    candlestickStream: function (callback) {
        binance.websockets.candlesticks(['ETHBTC'], "1m", function (candlesticks) {
            callback(candlesticks.k);
        });
    },

    candlestickHistory: function (callback) {
        binance.candlesticks("ETHBTC", "1m", (error, ticks, symbol) => {
            var data = [];
            for (i = 0; i < ticks.length; i++) {
                var tick = ticks[i];
                // console.log({t: data[0], o: data[1], h: data[2], l: data[3], c: data[4], T: data[5], v: data[6]});
                data.push({ t: tick[0], T: tick[6], o: tick[1], h: tick[2], l: tick[3], c: tick[4], v: tick[5] });
            }
            callback(data);
            // console.log("candlesticks()", ticks);
            // let last_tick = ticks[ticks.length - 1];
            // let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
            // console.log(symbol+" last close: "+close);
        }, { limit: 20, endTime: Date.now() });
    },

    wsTest: function () {
        // var connection = new WebSocketClient();

        // connection.onmessage = function (message) {
        //     console.log(message);
        //     try {
        //         var json = JSON.parse(message.data);
        //     } catch (e) {
        //         console.log('This doesn\'t look like a valid JSON: ',
        //             message.data);
        //         return;
        //     }
        // };

        // connection.connect('ws://localhost:3000');

        var connection = io('ws://localhost:3000');

        connection.on('connect', function (socket) {
            // console.log(connection.io);
            connection.emit('message');
        })

        connection.on('blabla', function (data) {
            console.log('event: ' + data);
        })
    }
};


// function wsTest() {
//     var connection = new WebSocketClient();

//     connection.onmessage = function (message) {
//         try {
//             var json = JSON.parse(message.data);
//         } catch (e) {
//             console.log('This doesn\'t look like a valid JSON: ',
//                 message.data);
//             return;
//         }
//     };

//     connection.on('connect', function (){
//         console.log('LOLOLOL');
//     })

//     // connection.connect('ws://localhost:3000/');
//     connection.connect('wss://echo.websocket.org');
// }

// wsTest()

// const bla = binance.websockets.candlesticks(['ETHBTC'], "1m", candlestickCallback);