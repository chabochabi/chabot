
function sum(array) {
    return array.reduce((a, b) => a + b, 0);
}

class RSI {

    constructor(frameLength) {
        this.frameLength = frameLength;
        this.result = [];
    }

    setFrameLength(frameLength) {
        this.frameLength = frameLength;
    }

    calc(data) {
        let rsiData = [];
        if (data.length >= this.frameLength) {
            let U = 0;
            let D = 0;
            let frameU = [];
            let frameD = [];
            for (let i = 0; i < data.length; i++) {
                let entry = data[i];
                if (i > 0) {
                    let prevEntry = data[i - 1];
                    if (entry.close > prevEntry.close) {
                        U = entry.close - prevEntry.close;
                        D = 0;
                    } else if (entry.close < prevEntry.close) {
                        U = 0;
                        D = prevEntry.close - entry.close;
                    } else {
                        U = 0;
                        D = 0;
                    }
                }
                if (frameU.length >= this.frameLength) {
                    rsiData.push({
                        time: entry.openTime,
                        value: 100 - (100 / (1 + (sum(frameU) / sum(frameD))))
                    });
                    frameU.shift();
                    frameD.shift();
                    frameU.push(U);
                    frameD.push(D);
                } else {
                    frameU.push(U);
                    frameD.push(D);
                }
            }
        }
        this.result = rsiData;
    }
}

module.exports = RSI;