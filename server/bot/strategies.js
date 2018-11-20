
const BasicEMA = require('./basicEMA');

basicEMA = new BasicEMA();

module.exports = {
    'BasicEMA': {
        name: basicEMA.name,
        description: basicEMA.description
    }
}