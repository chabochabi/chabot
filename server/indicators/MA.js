
var MA = function(frameLength) {
    this.frameLength = frameLength;
    this.sum = 0;
    this.frame = [];
    this.frameIndex = 0;
    this.maValue = 0;
    this.result = [];
}

MA.prototype.setFrameLength = function(frameLength) {
    this.frameLength = frameLength;
}

MA.prototype.update = function (kline) {
    
    var last = this.frame[this.frameIndex] || 0;
    this.frame[this.frameIndex] = kline.close;
    this.sum += kline.close - last;
    this.frameIndex = (this.frameIndex + 1) % this.frameLength;
    this.maValue = this.sum / this.frame.length;
}

MA.prototype.calc = function (data) {
    let maData = [];
    if (data.length >= this.frameLength) {
        let cpSum = 0;
        let maValue = 0;
        for (let i = 0; i < data.length; i++) {
            let entry = data[i];
            if (i <= this.frameLength - 1) {
                cpSum += entry.close;
            } else {
                maValue = cpSum / this.frameLength;
                cpSum += (entry.close - data[i - (this.frameLength)].close);
                maData.push({
                    time: entry.closeTime + 1,
                    value: maValue
                })
            }
        }
    }
    // console.log(maData);
    this.result = maData;
}

module.exports = MA;