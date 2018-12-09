# Chabot

So far it only works as an analysis tool to create and test your own trading strategies.

Markets: 

- Binance
- more are coming...

## Run

For now you'll have to run the client and server part seperately:

### Client: 

`npm start` starts the dev server `http://localhost:4200/`.

### Server:

There are different modes for the server:

`node chabot.js --live`: "live" mode, which streams live market data.

`node chabot.js --offline`: "offline" mode, which provides backtest data only.

`node chabos,js --help`: nothing more to say here...

All the other modes are not done yet.