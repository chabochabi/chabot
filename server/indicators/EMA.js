const MA = require('./MA');

var EMA = function(frameLength) {
    this.frameLength = frameLength;
    this.ma = new MA(frameLength);
    this.sum = 0;
    this.frame = [];
    this.frameIndex = 0;
    this.emaValue = 0;
    this.result = [];
    this.time = 0;
    this.price = 0;
}

EMA.prototype.setFrameLength = function(frameLength) {
    this.frameLength = frameLength;
}

EMA.prototype.update = function (kline) {
    this.ma.update(kline);
    var multiplier = (2 / (this.frameLength + 1)); 
    if (this.ma.frame.length > this.frameLength)
        this.emaValue = kline.close * multiplier + this.emaValue * (multiplier - 1);
    else
        this.emaValue = this.ma.maValue;

    this.time = kline.openTime;
    this.price = kline.close;
    
    // console.log(this.emaValue);
}

EMA.prototype.calc = function (data) {

    let smaSum = 0;
    let lastEMA = 0;
    let multiplier = (2 / (this.frameLength + 1));
    let emaData = [];

    if (data.length >= this.frameLength) {
        for (let i = 0; i < data.length; i++) {
            let entry = data[i];
            if (i < (this.frameLength - 1)) {
                smaSum += entry.close;
            } else if (i == (this.frameLength - 1)) {
                smaSum += entry.close;
                lastEMA = smaSum / this.frameLength;
                emaData.push({
                    time: entry.openTime,
                    value: lastEMA,
                    price: entry.close
                });
            } else {
                emaData.push({
                    time: entry.openTime,
                    value: (entry.close - lastEMA) * multiplier + lastEMA,
                    price: entry.close
                })
                lastEMA = (entry.close - lastEMA) * multiplier + lastEMA;
            }
        }
    }

    this.result = emaData;
    // return emaData;
}

module.exports = EMA;