
const BasicEMA = require('../bot/basicEMA');
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
    var totalProfit = 0;
    var fee = 0.1;

    console.log('running strategy evaluation ... ', symbol, source);

    for (let sellTime in profits) {
        
        let buyTime = profits[sellTime].buy.time;
        let buyKline = this.bm.getKlineDataEntry(symbol, source, parseInt(buyTime));
        let buyPrice = buyKline.open;
        buyPrice = buyPrice - ((fee/100)*buyPrice);

        let sellKline = this.bm.getKlineDataEntry(symbol, source, parseInt(sellTime));
        let sellPrice = sellKline.open;
        sellPrice = sellPrice - ((fee/100)*sellPrice);

        let profit = sellPrice - buyPrice;
        let profitRatio = ((profit / buyPrice) * 100);
        totalProfit += profitRatio;
    }

    console.log('\n TOTAL PROFIT: ', totalProfit);
    return totalProfit;
}

Backtest.prototype.run = function (symbol, source, strategy, params) {

    console.log(' running backtest: '+strategy);
    switch (strategy) {
        case strategies.BasicEMA:
            this.testStrat = new BasicEMA(params);
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
        console.log(' BACKTEST DONE');
        let profit = this.evaluate(symbol, source);
        this.emitter.emit('backtestData', { strategy: this.testStrat.name, description: this.testStrat.description, flags: this.testStrat.flags, profit: profit });
    }).bind(this));

    this.simulateStream(symbol, source, this.bm.getBacktestData(symbol, source));
}

module.exports = Backtest;