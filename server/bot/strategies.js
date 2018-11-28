
const BasicEMA = require('./basicEMA');
const DeltaEMA = require('./deltaEMA');

basicEMA = new BasicEMA();
deltaEMA = new DeltaEMA();

module.exports = {
    'BasicEMA': {
        name: basicEMA.name,
        description: basicEMA.description,
        params: basicEMA.params
    },

    'DeltaEMA': {
        name: deltaEMA.name,
        description: deltaEMA.description,
        params: deltaEMA.params
    }
}