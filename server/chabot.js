const MarketManager = require('./market/marketManager');
const DataManager = require('./data/dataManager');
const DataInterface = require('./data/ifData');
const Backtest = require('./bot/backtest');
const program = require('commander');

var Chabot = function (broadcast) {
    this.dm = new DataManager();
    this.di = new DataInterface(this.dm, broadcast);
    this.mm = new MarketManager(this.di);
    this.bt = new Backtest(this.di);
}

Chabot.prototype.run = async function (mode) {
    switch (mode) {

        case 'backtest':
            let sym = 'ETHBTC';
            this.mm.loadTestData('offlineLoadDone', sym); // event loafOfflineDone causes the backtest to run when loadTestData is done
            break;

        case 'offline':
            this.mm.loadTestData('offline', 'ETHBTC');
            break;

        case 'online':
            // start 24hr price ticker stream
            this.mm.startStreaming("24hr", { symbols: false });
            // start all candlestick streams. for now its only <COIN>BTC tho
            this.mm.openAllStreams("candlesticks");
            break;
    }
}

Chabot.prototype.requestData = function (type, params) {
    // hmmm this is kinda messed up, couldve been done nicer... TODO????
    if (type === 'backtest') {
        this.bt.run('ETHBTC');
    } else {
        this.di.requestData(type, params);
    }
}

module.exports = Chabot;

program
    .version('0.1.0')
    .option('--ui', 'run with web UI')
    .option('--offline', 'run with offline data and web UI')
    .option('--bt', 'backtest with offline data')
    .parse(process.argv);

console.log('\n\n',
    '          __          ___            __         \n',
    '    ____ |  |__ _____ \\_ |__   _____/  |_  \n',
    '  _/ ___\\|  |  \\\\__  \\ | __ \\ /  _ \\   __\\  \n',
    '  \\  \\___|   Y  \\/ __ \\| \\_\\ (  <_> )  |     \n',
    '   \\___  >___|  (____  /___  /\\____/|__|     \n',
    '       \\/     \\/     \\/    \\/                \n');

if (program.ui) {
    console.log('\n * with UI\n\n');
    const server = require('./server');
    // return require('./server');
    return server.start('online');
} else if (program.offline) {
    console.log('\n * with offline data and web UI');
    const server = require('./server');
    return server.start('offline');
} else if (program.bt) {
    console.log('\n * backtest with offline data');
    var chabot = new Chabot();
    chabot.run('backtest');
} else {
    console.log('\n * without UI\n\n\n');
    var chabot = new Chabot();
    chabot.run('online');
}