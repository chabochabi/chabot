
const BasicEMA = require('../bot/basicEMA');
const DeltaEMA = require('../bot/deltaEMA');
const BasicMACD = require('../bot/basicMACD');
const EventEmitter = require('events');
const strategies = require('../bot/strategies');

var Backtest = function (backtestManager, emitter) {
    this.emitter = emitter;
    // TODO this local emitter idea is kinda stupid
    this.btEmitter = new EventEmitter();
    this.bm = backtestManager;
}

Backtest.prototype.simulateStream = function (symbol, source, data) {
    for (let i = 0; i < data.length; i++) {
        this.btEmitter.emit('backtest', data.slice(0, i + 1));
    }
    this.btEmitter.emit('backtestDone', symbol, source);
}

Backtest.prototype.evaluate = function (symbol, source) {

    var profits = this.testStrat.profits;
    var totalRevenue = 0;
    var totalRevenuePercent = 0;
    var singleRevenues = [];
    var singleRevenuesPercent = [];
    var fee = 0.1;
    var firstBuy;
    var lastSell;
    var results = {};

    console.log('running strategy evaluation ... ', symbol, source);

    for (let sellTime in profits) {

        let buyTime = profits[sellTime].buy.time;
        let buyKline = this.bm.getKlineDataEntry(symbol, source, parseInt(buyTime));
        let buyPrice = buyKline.open;
        // buyPrice = buyPrice - (fee*buyPrice);

        sellTime = parseInt(sellTime);
        let sellKline = this.bm.getKlineDataEntry(symbol, source, sellTime);
        let sellPrice = sellKline.open;
        // sellPrice = sellPrice - (fee*sellPrice);

        if (firstBuy == undefined) {
            firstBuy = {};
            firstBuy.time = buyTime;
            firstBuy.price = buyPrice;
        } else if (firstBuy.time > buyTime) {
            firstBuy.time = buyTime;
            firstBuy.price = buyPrice;
        }

        if (lastSell == undefined) {
            lastSell = {};
            lastSell.time = sellTime;
            lastSell.price = sellPrice;
        } else if (lastSell.time < sellTime) {
            lastSell.time = sellTime;
            lastSell.price = sellPrice;
        }

        let singleRevenue = sellPrice - buyPrice;
        let singleRevenuePercent = ((singleRevenue / buyPrice) * 100);
        singleRevenues.push(singleRevenue);
        singleRevenuesPercent.push(singleRevenuePercent);
        totalRevenue += singleRevenue;
        totalRevenuePercent += singleRevenuePercent;
    }

    // console.log('\n TOTAL PROFIT: ', totalRevenue);
    results.singleRevenues = singleRevenues;
    results.singleRevenuesPercent = singleRevenuesPercent;
    results.firstBuy = firstBuy;
    results.lastSell = lastSell;
    results.totalRevenue = totalRevenue.toFixed(10);
    results.totalRevenuePercent = totalRevenuePercent.toFixed(4);
    // console.log(results);
    return results;
}

Backtest.prototype.run = function (symbol, source, strategy, params) {

    console.log(' running backtest: ' + strategy);
    switch (strategy) {
        case strategies.BasicEMA.name:
            this.testStrat = new BasicEMA(params);
            break;

        case strategies.DeltaEMA.name:
            this.testStrat = new DeltaEMA(params);
            break;

        case strategies.BasicMACD.name:
            this.testStrat = new BasicMACD(params);
            break;

        default:
            this.testStrat = new BasicEMA(params);
            break;
    }

    // event coming every time a candlestick item is loaded
    this.btEmitter.on('backtest', (function (data) {
        this.testStrat.update(data);
    }).bind(this));

    // event coming when all candlestick items are loaded and backtesting is finished
    this.btEmitter.on('backtestDone', (function (symbol, source) {
        console.log(' BACKTEST DONE:', this.testStrat.name);
        let results = this.evaluate(symbol, source);
        this.emitter.emit('backtestData', { strategy: this.testStrat.name, description: this.testStrat.description, flags: this.testStrat.flags, results: results });
    }).bind(this));

    this.simulateStream(symbol, source, this.bm.getBacktestData(symbol, source));
}

module.exports = Backtest;