
const BasicEMA = require('./basicEMA');
const DeltaEMA = require('./deltaEMA');
const BasicMACD = require('./basicMACD');
const BasicMAACD = require('./basicMAACD');

basicEMA = new BasicEMA();
deltaEMA = new DeltaEMA();
basicMACD = new BasicMACD();
basicMAACD = new BasicMAACD();

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
    },

    'BasicMACD': {
        name: basicMACD.name,
        description: basicMACD.description,
        params: basicMACD.params
    },

    'BasicMAACD': {
        name: basicMAACD.name,
        description: basicMAACD.description,
        params: basicMAACD.params
    }
}