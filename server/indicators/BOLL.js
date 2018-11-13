
// N, K
var BOLL = function (frameLength, multiplier) {
    this.frameLength = frameLength;
    this.multiplier = multiplier;
    this.result = [];
}

BOLL.prototype.setFrameLength = function (frameLength) {
    this.frameLength = frameLength;
}

BOLL.prototype.setMultiplier = function (multiplier) {
    this.multiplier = multiplier;
}

var stdDev = function (data) {

    let mu = 0;
    let N = data.length;
    let sum = 0;

    for (let x of data) {
        mu += x.close;
    }

    mu = mu/N;

    for (let x of data) {
        sum += (x.close - mu) ** 2;
    }

    return Math.sqrt(1 / N * sum);
}

BOLL.prototype.calc = function (data) {

    let maData = [];
    let upperBoll = [];
    let lowerBoll = [];
    let N = this.frameLength;
    let K = this.multiplier;

    if (data.length >= N) {
        let cpSum = 0;
        let maValue = 0;
        let stdDevValue = 0;
        let upperValue = 0;
        let lowerValue = 0;
        for (let i = 0; i < data.length; i++) {
            let entry = data[i];
            if (i <= (N - 1)) {
                cpSum += entry.close;
            } else {
                maValue = cpSum / N;
                cpSum += (entry.close - data[i - N].close);
                stdDevValue = stdDev(data.slice(i - N, i + 1));
                upperValue = maValue + K * stdDevValue;
                lowerValue = maValue - K * stdDevValue;
                upperBoll.push({
                    time: entry.closeTime + 1,
                    value: upperValue
                });
                lowerBoll.push({
                    time: entry.closeTime + 1,
                    value: lowerValue
                });
                maData.push({
                    time: entry.closeTime + 1,
                    value: maValue
                });
            }
        }
    }
    this.result = {
        ma: maData,
        lowerBoll: lowerBoll,
        upperBoll: upperBoll
    };
    // console.log(this.result);
}

module.exports = BOLL;

// a = [
//     { close: 22.27, closeTime: 12340 },
//     { close: 22.19, closeTime: 12341 },
//     { close: 22.08, closeTime: 12342 },
//     { close: 22.17, closeTime: 12343 },
//     { close: 22.18, closeTime: 12344 },
//     { close: 22.13, closeTime: 12345 },
//     { close: 22.23, closeTime: 12346 },
//     { close: 22.43, closeTime: 12347 },
//     { close: 22.24, closeTime: 12348 },
//     { close: 22.29, closeTime: 12349 },
//     { close: 22.15, closeTime: 12350 },
//     { close: 22.39, closeTime: 12352 },
//     { close: 22.38, closeTime: 12353 },
//     { close: 22.61, closeTime: 12354 },
//     { close: 22.36, closeTime: 12355 },
//     { close: 22.05, closeTime: 12356 },
//     { close: 22.75, closeTime: 12357 },
//     { close: 22.72, closeTime: 12358 },
//     { close: 22.36, closeTime: 12359 },
//     { close: 22.18, closeTime: 12360 },
//     { close: 22.13, closeTime: 12361 },
//     { close: 22.33, closeTime: 12362 },
//     { close: 22.43, closeTime: 12363 },
//     { close: 22.54, closeTime: 12364 },
//     { close: 22.49, closeTime: 12365 },
//     { close: 22.25, closeTime: 12366 },
//     { close: 22.39, closeTime: 12367 },
//     { close: 22.38, closeTime: 12368 },
//     { close: 22.61, closeTime: 12369 },
//     { close: 22.36, closeTime: 12370 },
//     { close: 22.15, closeTime: 12371 },
//     { close: 22.55, closeTime: 12372 },
//     { close: 22.17, closeTime: 12373 },
//     { close: 22.18, closeTime: 12374 },
//     { close: 22.13, closeTime: 12375 },
//     { close: 22.23, closeTime: 12376 },
//     { close: 22.43, closeTime: 12377 },
//     { close: 22.24, closeTime: 12378 },
//     { close: 22.29, closeTime: 12379 },
//     { close: 22.15, closeTime: 12380 },
//     { close: 22.39, closeTime: 12382 },
//     { close: 22.38, closeTime: 12383 },
//     { close: 22.61, closeTime: 12384 },
//     { close: 22.36, closeTime: 12385 },
//     { close: 22.05, closeTime: 12386 },
//     { close: 22.75, closeTime: 12387 },
//     { close: 22.72, closeTime: 12388 },
//     { close: 22.36, closeTime: 12389 },
//     { close: 22.18, closeTime: 12390 },
//     { close: 22.13, closeTime: 12391 },
//     { close: 22.33, closeTime: 12392 }
// ]
// boll = new BOLL(10,2);
// boll.calc(a);