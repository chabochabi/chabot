
const MA = require("../indicators/MA");
const EMA = require("../indicators/EMA");
const RSI = require("../indicators/RSI");
const BOLL = require("../indicators/BOLL");
const TEMA = require("../indicators/TEMA");
const MAACD = require("../indicators/MAACD");
const EventEmitter = require('events');

class Indicator {

    constructor(backtestManager) {
        this.emitter = new EventEmitter();
        this.bm = backtestManager;
    }

    simulateStream(data) {

        // for (let i = 0; i < 40; i++) {
        for (let i = 0; i < data.length; i++) {
            this.emitter.emit('dataEntry', data[i]);
        }
        this.emitter.emit('simulationDone');
    }

    // TODO check params and use them
    run(symbol, source, indicator, params) {
        // console.log(indicator, symbol, source)
        switch (indicator) {
            case "MA":
                this.indicator = new MA(10);
                break;

            case "EMA":
                this.indicator = new EMA(10);
                break;

            case "RSI":
                this.indicator = new RSI(14);
                break;

            case "BOLL":
                this.indicator = new BOLL(21, 2);
                break;

            case "TEMA":
                this.indicator = new TEMA(10);
                break;

            case "MAACD":
                this.indicator = new MAACD(12, 26, 9);
                break;

            default:
                this.indicator = new MA(10);
                break;
        }

        this.emitter.on('dataEntry', (function (data) {
            // console.log(this.indicator);
            this.indicator.update(data);
        }).bind(this));

        this.emitter.on('simulationDone', (function (symbol, source) {
            console.log('Indicator DONE');
        }).bind(this));

        this.simulateStream(this.bm.getBacktestData(symbol, source));
    }
}

module.exports = Indicator;