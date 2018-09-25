
const Strategy = require('./strategy');

var Backtest = function (dataInterface) {
    this.testStrat = new Strategy();
    this.di = dataInterface;

    this.di.emitter.on('offlineLoadDone', (function (msg, data) {
        this.run(symbol);
    }).bind(this));

    this.di.emitter.on('backtest', (function (data) {
        this.testStrat.update(data);
    }).bind(this));
    
    this.di.emitter.on('backtestDone', (function () {
        this.di.broadcastData('backtestData', this.testStrat.flags);
        this.evaluate();
    }).bind(this));
}

Backtest.prototype.evaluate = function () {

    let profits = this.testStrat.profits;
    let totalProfit = 0;
    let fee = 0.1;

    for (let sellTime in profits) {
        
        let buyTime = profits[sellTime].buy.time;
        let buyKline = this.di.getCoinDataEntry(this.symbol, parseInt(buyTime))[0];
        let buyPrice = buyKline.open;
        buyPrice = buyPrice - ((fee/100)*buyPrice);

        let sellKline = this.di.getCoinDataEntry(this.symbol, parseInt(sellTime))[0];
        let sellPrice = sellKline.open;
        sellPrice = sellPrice - ((fee/100)*sellPrice);

        let profit = sellPrice - buyPrice;
        let profitRatio = ((profit / buyPrice) * 100);
        totalProfit += profitRatio;

        let date = new Date(parseInt(sellTime));
        if (profit > 0) {
            // console.log('   (+)  ', profitRatio);
            // console.log('        ', date.getDay(), date.getHours()+':'+date.getMinutes());
        } else {
            // console.log('   (-) ', profitRatio);
            // console.log('        ', date.getDay(), date.getHours()+':'+date.getMinutes());
        }
    }

    console.log('\n TOTAL PROFIT: ', totalProfit);
}

Backtest.prototype.run = function (symbol) {
    console.log('running backtest...');
    this.symbol = symbol;
    this.testStrat = new Strategy();
    this.di.simulateStream(this.symbol);
}

module.exports = Backtest;

// var test = new Backtest();
// test.check(); 