const loki = require('lokijs');

var MAXCOUNT = 1440; // 24 hrs

var DataManager = function () {
    this.db = new loki('coins.json');
    this.coins = {};
}

DataManager.prototype.write = function (name, coin, event) {
    if (!this.coins.hasOwnProperty(name)) {
        this.addCoin(name);
    }
    if ((this.coins[name].count() >= MAXCOUNT) && (event !== 'offline')) { // ignore limit if its offline, cause we'll probably be backtesting
        let first = this.readAll(name)[0];
        this.coins[name].remove(first);
        this.coins[name].insert(coin);
    } else {
        this.coins[name].insert(coin);
    }
}

DataManager.prototype.readLastItems = function (name, amount) {
    let len = this.coins[name].count();
    if (amount <= len) {
        return this.coins[name].chain().data().slice(len - amount, len);
    }
}

DataManager.prototype.hasSymbol = function (symbol) {
    if (this.getCoinList().lastIndexOf(symbol) >= 0) {
        return true;
    }
    return false;
}

DataManager.prototype.readAll = function (name) {
    return this.coins[name].chain().data();
}

DataManager.prototype.getCoinList = function () {
    return Object.keys(this.coins);
}

DataManager.prototype.getData = function (symbol, openTime) {
    if (this.hasSymbol(symbol)) {
        return this.coins[symbol].find({ 'openTime': openTime });
    }
}

DataManager.prototype.addCoin = function (name) {
    this.coins[name] = this.db.addCollection(name);
}

module.exports = DataManager;

// var dm = new DataManager();
// dm.write('test',[
//     {close: 22.27, closeTime: 12340},
//     {close: 22.19, closeTime: 12341},
//     {close: 22.08, closeTime: 12342},
//     {close: 22.17, closeTime: 12343},
//     {close: 22.18, closeTime: 12344},
//     {close: 22.13, closeTime: 12345},
//     {close: 22.23, closeTime: 12346},
//     {close: 22.43, closeTime: 12347},
//     {close: 22.24, closeTime: 12348},
//     {close: 22.29, closeTime: 12349},
//     {close: 22.15, closeTime: 12350},
//     {close: 22.39, closeTime: 12352},
//     {close: 22.38, closeTime: 12353},
//     {close: 22.61, closeTime: 12354},
//     {close: 22.36, closeTime: 12355},
//     {close: 22.05, closeTime: 12356},
//     {close: 22.75, closeTime: 12357},
//     {close: 22.72, closeTime: 12358},
//     {close: 22.36, closeTime: 12359},
//     {close: 22.18, closeTime: 12360},
//     {close: 22.13, closeTime: 12361},
//     {close: 22.33, closeTime: 12362},
//     {close: 22.43, closeTime: 12363},
//     {close: 22.54, closeTime: 12364},
//     {close: 22.49, closeTime: 12365},
//     {close: 22.25, closeTime: 12366},
//     {close: 22.39, closeTime: 12367},
//     {close: 22.38, closeTime: 12368},
//     {close: 22.61, closeTime: 12369},
//     {close: 22.36, closeTime: 12370},
//     {close: 22.15, closeTime: 12371},
//     {close: 22.55, closeTime: 12372},
//     {close: 22.17, closeTime: 12373},
//     {close: 22.18, closeTime: 12374},
//     {close: 22.13, closeTime: 12375},
//     {close: 22.23, closeTime: 12376},
//     {close: 22.43, closeTime: 12377},
//     {close: 22.24, closeTime: 12378},
//     {close: 22.29, closeTime: 12379},
//     {close: 22.15, closeTime: 12380},
//     {close: 22.39, closeTime: 12382},
//     {close: 22.38, closeTime: 12383},
//     {close: 22.61, closeTime: 12384},
//     {close: 22.36, closeTime: 12385},
//     {close: 22.05, closeTime: 12386},
//     {close: 22.75, closeTime: 12387},
//     {close: 22.72, closeTime: 12388},
//     {close: 22.36, closeTime: 12389},
//     {close: 22.18, closeTime: 12390},
//     {close: 22.13, closeTime: 12391},
//     {close: 22.33, closeTime: 12392}
// ])
// dm.readAll();