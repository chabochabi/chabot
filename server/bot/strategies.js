
const BasicEMA = require('./basicEMA');
const DeltaEMA = require('./deltaEMA');
const BasicTEMA = require('./basicTEMA');
const BasicMACD = require('./basicMACD');
const BasicMAACD = require('./basicMAACD');

basicEMA = new BasicEMA();
deltaEMA = new DeltaEMA();
basicTEMA = new BasicTEMA();
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

    'BasicTEMA': {
        name: basicTEMA.name,
        description: basicTEMA.description,
        params: basicTEMA.params
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