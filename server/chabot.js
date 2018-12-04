const MarketManager = require('./managers/marketManager');
const DataManager = require('./managers/dataManager');
const BacktestManager = require('./managers/backtestManager');
const AnalysisManager = require('./managers/analysisManager');
const EventEmitter = require('events');
// const DataInterface = require('./interfaces/ifData');
const BackendInterface = require('./interfaces/backendInterface')
const program = require('commander');

var Chabot = function (broadcaster) {
    emitter = new EventEmitter();
    this.dm = new DataManager(emitter);
    this.mm = new MarketManager(this.dm, emitter);
    this.bm = new BacktestManager(this.dm, emitter);
    this.am = new AnalysisManager(this.dm);

    this.bi = new BackendInterface(this.dm, this.bm, this.am, emitter, broadcaster);
}

Chabot.prototype.run = async function (mode) {
    switch (mode) {

        case 'backtest':
            let sym = 'ADABTC';
            // this.bm.runBacktest(sym, 'backtest', 'BasicEMA');
            let params = {
                fast: 9,
                slow: 26,
                signal: 9
            }
            this.bm.runBacktest(sym, 'backtest', 'BasicMACD', params);
            break;

        case 'offline':
            // this.bm.loadTestData('backtest', 'ETHBTC');
            break;

        case 'record':
            config = {
                tosym: 'BTC',
                interval: '1m'
            }
            this.mm.openAllStreams('record', config);
            break;

        case 'online':
            // start 24hr price ticker stream
            this.mm.startStreaming('24hr', { symbols: false });
            config = {
                tosym: 'BTC',
                interval: '1m'
            }
            this.mm.openAllStreams('klines', config);
            this.mm.openAllStreams('trades', config);
            break;

        case 'test':
            config = {
                tosym: 'BTC',
                interval: '1m'
            }
            this.mm.openAllStreams('trades', config);
            break;
    }
}

Chabot.prototype.requestData = function (type, params) {
    this.bi.clientRequest(type, params);
}

module.exports = Chabot;

program
    .version('0.1.0')
    .option('--live', 'run with live data and web UI')
    .option('--offline', 'run with offline data and web UI')
    .option('--bt', 'backtest with offline data')
    .option('--record', 'record market data')
    .option('--test', 'test stuff')
    .parse(process.argv);

console.log('\n\n',
    '          __          ___            __         \n',
    '    ____ |  |__ _____ \\_ |__   _____/  |_  \n',
    '  _/ ___\\|  |  \\\\__  \\ | __ \\ /  _ \\   __\\  \n',
    '  \\  \\___|   Y  \\/ __ \\| \\_\\ (  <_> )  |     \n',
    '   \\___  >___|  (____  /___  /\\____/|__|     \n',
    '       \\/     \\/     \\/    \\/                \n');

if (program.live) {
    console.log('\n * with live data and web UI\n\n');
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
} else if (program.record) {
    console.log('\n * record market data');
    var chabot = new Chabot();
    chabot.run('record');
} else if (program.test) {
    console.log('\n * test stuff');
    var chabot = new Chabot();
    chabot.run('test');
} else {
    console.log(program.helpInformation());
}