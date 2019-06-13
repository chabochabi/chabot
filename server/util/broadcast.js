

var Broadcast = function (stream) {
    this.stream = stream;
}

Broadcast.prototype.send = function (symbol, data) {
    this.stream(symbol, data);
}

module.exports = Broadcast;