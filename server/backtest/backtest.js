
const BasicEMA = require('../bot/basicEMA');

var Backtest = function (backtestManager, emitter) {
    this.emitter = emitter;
    this.bm = backtestManager;
}

Backtest.prototype.simulateStream = function (data) {
    for (let i = 0; i < data.length; i++) {
        this.emitter.emit('backtest', data.slice(0, i + 1));
    }
    this.emitter.emit('backtestDone');
}

Backtest.prototype.evaluate = function () {

    let profits = this.testStrat.profits;
    let totalProfit = 0;
    let fee = 0.1;

    console.log('running strategy evaluation ... ');

    for (let sellTime in profits) {
        
        let buyTime = profits[sellTime].buy.time;
        let buyKline = this.bm.getKlineDataEntry(this.symbol, this.source, parseInt(buyTime));
        let buyPrice = buyKline.open;
        buyPrice = buyPrice - ((fee/100)*buyPrice);

        let sellKline = this.bm.getKlineDataEntry(this.symbol, this.source, parseInt(sellTime));
        let sellPrice = sellKline.open;
        sellPrice = sellPrice - ((fee/100)*sellPrice);

        let profit = sellPrice - buyPrice;
        let profitRatio = ((profit / buyPrice) * 100);
        totalProfit += profitRatio;

        // let date = new Date(parseInt(sellTime));
        // if (profit > 0) {
        //     console.log('   (+)  ', profitRatio);
        //     console.log('        ', date.getDay(), date.getHours()+':'+date.getMinutes());
        // } else {
        //     console.log('   (-) ', profitRatio);
        //     console.log('        ', date.getDay(), date.getHours()+':'+date.getMinutes());
        // }
    }

    console.log('\n TOTAL PROFIT: ', totalProfit);
    return totalProfit;
}

Backtest.prototype.run = function (symbol, source, strategy, params) {

    console.log(' running backtest: '+strategy);
    this.symbol = symbol;
    this.source = source;
    switch (strategy) {
        case 'basicEMA':
            this.testStrat = new BasicEMA(params);
            break;
    
        default:
            this.testStrat = new BasicEMA(params);
            break;
    }

    this.emitter.on('backtest', (function (data) {
        this.testStrat.update(data);
    }).bind(this));
    
    this.emitter.on('backtestDone', (function () {
        console.log(' BACKTEST DONE');
        let profit = this.evaluate();
        this.emitter.emit('backtestData', { flags: this.testStrat.flags, profit: profit });
    }).bind(this));


    this.simulateStream(this.bm.getBacktestData(this.symbol, this.source));
}

module.exports = Backtest;

// var test = new Backtest();
// test.check(); 