
const MA = require("../indicators/MA");
const EMA = require("../indicators/EMA");
const EventEmitter = require('events');

var Indicator = function (backtestManager) {
    this.emitter = new EventEmitter();
    this.bm = backtestManager;
}

Indicator.prototype.simulateStream = function (data) {
    for (let i = 0; i < data.length; i++) {
        this.emitter.emit('dataEntry', data[i]);
    }
    this.emitter.emit('simulationDone');
}

// TODO check params and use them
Indicator.prototype.run = function (symbol, source, indicator, params) {

    switch (indicator) {
        case "MA":
            this.indicator = new MA(10);
            break;

        case "EMA":
            this.indicator = new EMA(10);
            break;

        default:
            this.indicator = new MA(10);
            break;
    }

    this.emitter.on('dataEntry', (function (data) {
        this.indicator.update(data);
    }).bind(this));

    this.emitter.on('simulationDone', (function (symbol, source) {
        console.log('DONE');
    }).bind(this));

    this.simulateStream(this.bm.getBacktestData(symbol, source));
}

module.exports = Indicator;