

class Broadcast {

    constructor(stream) {
        this.stream = stream;
    }

    send(symbol, data) {
        this.stream(symbol, data);
    }
}

module.exports = Broadcast;