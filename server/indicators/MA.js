
var MA = function(frameLength) {
    this.frameLength = frameLength;
    this.result = [];
}

MA.prototype.setFrameLength = function(frameLength) {
    this.frameLength = frameLength;
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
                // console.log(i, frameLength, data[i-(frameLength-1)]);
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