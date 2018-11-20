import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatTableDataSource } from '@angular/material';

import * as Highstock from 'highcharts/highstock.src';

import { CoinService } from '../coin.service';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent implements OnInit {

  @ViewChild('chartTarget') chartTarget: ElementRef;

  // to get alls keys of an object as an array
  objectKeys = Object.keys;
  gridSize: number = 12;

  tradeListDisplayedColumns: string[] = ['price', 'quantity', 'eventTime'];
  tradeListDataSource: MatTableDataSource<any>;

  trades: any = [];
  coins: any = {};
  coinsParams: any = {
    "averagePrice": "Avg. Price",
    "priceChange": "Price Change",
    "percentChange": "% Change",
    "volume": "Volume",
    "quoteVolume": "Quote Volume"
  };
  coinsParamsLength: number = Object.keys(this.coinsParams).length;
  symbol: string;
  source: string;
  chart: Highstock.ChartObject;
  coinData: any[] = [];
  lastTime: number = 0; // bah! not nice... TODO
  chartRendered: boolean = false; // also not nice... TODO
  subs: any[] = [];
  prevAxis: string = 'ohlc';
  indicators: any = {};
  indicatorsDefaultParams: any = {};
  activeIndicators: any = {};
  selectedStrategy: string;
  strategies: any = {};

  // TODO fix this static BS
  indicatorAxis: any = {
    'ohlc': {
      index: 0,
      prevAxis: 'ohlc',
      ctr: 1
    }
  }

  SIZES = {
    data: {
      top: 0,
      height: 90
    },
    volume: {
      top: 90,
      height: 10
    },
    offset: 2
  }

  constructor(
    private route: ActivatedRoute,
    private coinService: CoinService,
    private location: Location
  ) { }

  ngOnInit() {
    this.sub24hrCoins();
    this.subRoute();
    this.subIndicatorsList();
    this.subHistory();
    this.subCandlestickUpdate();
    this.subTradeUpdate();
    this.subIndicatorsData();
    this.subBacktestData();
  }

  ngOnDestroy(): void {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  private subIndicatorsList() {
    this.coinService.send({ cmd: 'indicators', options: { symbol: this.symbol } });
    this.subs.push(this.coinService.onIndicators(this.symbol)
      .subscribe((indicators: any) => {
        let vals = [];
        for (let val in indicators) {
          this.indicators[val] = {
            name: val,
            id: val.toLowerCase(),
            params: indicators[val],
          }
          this.indicatorsDefaultParams[val] = {};;
          for (let param in indicators[val]) {
            this.indicatorsDefaultParams[val][param] = indicators[val][param];
          }
        }
      }));
  }

  private sub24hrCoins() {
    this.coinService.get24hrList()
      .subscribe(coins => {
        this.coins = coins;
      });
  }

  private subRoute() {
    this.subs.push(this.route.params.subscribe(params => {
      this.symbol = params['id'];
      this.source = params['source'];
      var cmd = 'backtestHistory';
      if (this.source !== "backtest") {
        this.source = "kline"; // TODO this is dumb as shit... client should not know the keys for marketData in the DataManager
        cmd = 'history';
      }
      // get coin history
      this.coinService.send({ cmd: cmd, options: { symbol: this.symbol, source: this.source } });
    }));
  }

  private subHistory() {
    this.subs.push(this.coinService.onCandlestickHistory(this.symbol)
      .subscribe((candlesticks: any) => {
        for (let i = 0; i < candlesticks.klines.length; i++) {
          let { openTime: openTime, open: open, high: high, low: low, close: close, volume: volume, closeTime: closeTime } = candlesticks.klines[i];
          this.coinData.push([open, high, low, close, openTime, closeTime, volume]);
          this.lastTime = openTime;
        }
        this.candlestickChart();
      }));
  }

  private addIndicatorAxis(indicator: string, id: string) {
    let newTop = 0;
    let newHeight = 0;

    if (indicator in this.indicatorAxis) {
      this.indicatorAxis[indicator].prevAxis = this.prevAxis;
      this.indicatorAxis[indicator].ctr += 1;
    } else {
      this.indicatorAxis[indicator] = {
        index: this.chart.yAxis.length - 1,
        prevAxis: this.prevAxis,
        ctr: 1
      }

      let axisCtr = this.objectKeys(this.indicatorAxis).length;

      // bullshit if??? TODO
      if (axisCtr > 1) {
        newTop = this.SIZES.volume.top - (this.SIZES.volume.top / (2 ** (axisCtr - 1)));
        newHeight = (this.SIZES.volume.top / (2 ** (axisCtr - 1))) - this.SIZES.offset;
      }

      this.chart.addAxis({
        top: newTop + '%',
        height: newHeight + '%',
        opposite: true,
        minLength: 50,
        id: indicator,
        title: {
          text: ''
        }
      }, false);

      this.indicatorAxis[indicator] = {
        index: this.chart.yAxis.length - 1,
        prevAxis: this.prevAxis,
        ctr: 1
      }

      let firstYAxis = this.chart.get(this.prevAxis);
      this.prevAxis = indicator;

      firstYAxis.update({
        height: newHeight + '%',
        resize: {
          enabled: true,
          controlledAxis: {
            next: [indicator]
          },
          lineWidth: 4
        }
      }, false);
    }

    return this.indicatorAxis[indicator].index;
  }

  private plotRSI(id: string, vals: any[], yAxis: number, params: any) {
    let name = 'RSI-' + params['frameLength'];
    this.chart.addSeries({
      type: 'line',
      id: id,
      // name: id,
      name: name,
      data: vals,
      yAxis: yAxis,
      selected: true
    });
  }

  private plotMACD(indicator: string, id: string, data: any, yAxis: number) {
    let macd = [];
    let signal = [];
    let macdName = 'MACD-' + data[indicator].params['fast'] + '-' + data[indicator].params['slow'];
    let signalName = 'Signal-' + data[indicator].params['signal'];

    for (let val of data[indicator].data.macd) {
      macd.push([parseInt(val.time), parseFloat(val.value)]);
    }

    for (let val of data[indicator].data.signal) {
      signal.push([parseInt(val.time), parseFloat(val.value)]);
    }

    this.chart.addSeries({
      type: 'line',
      id: id + ':macd',
      // name: id + '_macd',
      name: macdName,
      data: macd,
      yAxis: yAxis,
      selected: true
    });

    this.chart.addSeries({
      type: 'line',
      id: id + ':signal',
      // name: id + '_signal',
      name: signalName,
      // linkedTo: id + '_macd',
      data: signal,
      yAxis: yAxis,
      selected: true
    });
  }

  private plotBOLL(indicator: string, id: string, data: any) {
    let ma = [], upper = [], lower = [];
    let val;
    let bollMAName = 'BOLL-MA-' + data[indicator].params['frameLength'];
    let bollUppderName = 'BOLL-MA(+' + data[indicator].params['multiplier'] + ')';
    let bollLowerName = 'BOLL-MA(-' + data[indicator].params['multiplier'] + ')';

    for (let i = 0; i < data[indicator].data.ma.length; i++) {
      val = data[indicator].data.ma[i];
      ma.push([parseInt(val.time), parseFloat(val.value)]);

      val = data[indicator].data.lowerBoll[i];
      lower.push([parseInt(val.time), parseFloat(val.value)]);

      val = data[indicator].data.upperBoll[i];
      upper.push([parseInt(val.time), parseFloat(val.value)]);
    }

    this.chart.addSeries({
      type: 'line',
      id: id + ':ma',
      // name: id + '_ma',
      name: bollMAName,
      data: ma,
      selected: true
    });

    this.chart.addSeries({
      type: 'line',
      id: id + ':lower',
      // name: id + '_lower',
      name: bollUppderName,
      data: lower,
      selected: true
    });

    this.chart.addSeries({
      type: 'line',
      id: id + ':upper',
      // name: id + '_upper',
      name: bollLowerName,
      data: upper,
      selected: true
    });
  }

  private plotLine(indicator: string, id: string, vals: any[], params: any) {
    let name = indicator.toUpperCase();
    for (let param in params) {
      name += '-' + params[param];
    }
    this.chart.addSeries({
      type: 'line',
      // id: indicator,
      id: id,
      // name: id,
      name: name,
      data: vals,
      selected: true
      // yAxis: 2
    });
  }

  private plotBacktest(data: any) {
    let flags = [];
    let flagColor = '#ff4143';
    for (let entry in data.flags) {
      flagColor = '#ff4143';
      if (data.flags[entry] === 'buy') {
        flagColor = '#38ca1f';
      }
      flags.push({
        x: parseInt(entry),
        title: data.flags[entry],
        text: data.flags[entry],
        color: "white",
        fillColor: flagColor
      });
    }

    this.chart.addSeries({
      type: 'flags',
      id: data.strategy,
      name: data.strategy,
      data: flags,
      onSeries: 'series-ohlc',
      shape: 'squarepin',
      width: 16,
      selected: true,
      style: {
        fontSize: "10px"
      },
      stackDistance: 20
    });
  }

  private subIndicatorsData() {
    this.subs.push(this.coinService.onIndicatorsData(this.symbol)
      .subscribe((data: any) => {
        let vals = [];
        for (let indicator in data) {
          let id = indicator;
          for (let val of data[indicator].data) {
            vals.push([parseInt(val.time), parseFloat(val.value)]);
          }

          for (let param in data[indicator].params) {
            id += '_' + data[indicator].params[param];
          }

          if (indicator === 'rsi' || indicator === 'macd') {

            let lastAxisIdx = this.addIndicatorAxis(indicator, id);

            if (indicator === 'rsi') {
              this.plotRSI(id, vals, lastAxisIdx, data[indicator].params);
            } else if (indicator === 'macd') {
              this.plotMACD(indicator, id, data, lastAxisIdx);
            }
          } else if (indicator === 'boll') {

            this.plotBOLL(indicator, id, data);

          } else {
            this.plotLine(indicator, id, vals, data[indicator].params);
          }
        }
      }));

    this.initStrategies();
  }

  private subBacktestData() {
    this.subs.push(this.coinService.onBacktestData()
      .subscribe((data: any) => {
        this.plotBacktest(data);
      }));
  }

  private subCandlestickUpdate() {
    this.subs.push(this.coinService.onCandlestickUpdate(this.symbol)
      .subscribe((candlesticks: any) => {
        this.updateChart(candlesticks.klines);
      }));
  }

  private subTradeUpdate() {
    this.tradeListDataSource = new MatTableDataSource();
    var test = {
      "buyerOrderID": 228901331,
      "eventTime": 1542326824496,
      "ignore": true,
      "maker": true,
      "price": 0.032027,
      "quantity": 0.889,
      "sellerOrderID": 228901334,
      "tradeID": 90929206,
      "tradeTime": 1542326824491
    };

    this.subs.push(this.coinService.onTradeUpdate(this.symbol)
      .subscribe((data: any) => {
        this.updateTradesList(data.trade);
      }));
  }

  initStrategies(): void {
    this.coinService.send({ cmd: 'strategies', options: { symbol: this.symbol } });
    this.subs.push(this.coinService.onStrategies(this.symbol)
      .subscribe((strategies: any) => {
        this.strategies = strategies;
      }));
  }

  // TODO maybe move all of this indicators stuff into a separate component or service
  addIndicator(indicator: string) {

    let params = this.indicators[indicator]['params'];
    let id = indicator.toLowerCase();

    for (let p in params) {
      id += '_' + params[p];
    }

    if (id in this.activeIndicators) {
      return;
    }

    this.coinService.send({ cmd: 'indicatorsData', options: { symbol: this.symbol, indicator: { type: indicator, params }, source: this.source } });
    this.getActiveIndicators()
      .subscribe(indicators => {
        indicators[id] = indicator;
      });
  }

  deleteIndicator(legendID: string) {
    // TODO retarded splitting .... 8=====3 (_o_)
    let id = legendID.split(":")[0];
    let indicator = id.split('_')[0];
    let deleteIDs = [];

    if (indicator === 'rsi' || indicator === 'macd') {

      let newTop = 0;
      let newHeight = this.SIZES.data.height - this.SIZES.offset;

      this.indicatorAxis[indicator].ctr -= 1;
      if (this.indicatorAxis[indicator].ctr == 0) {

        delete this.indicatorAxis[indicator];
        let axisCtr = this.objectKeys(this.indicatorAxis).length;
        if (axisCtr > 1) {
          newTop = this.SIZES.volume.top - (this.SIZES.volume.top / (2 ** (axisCtr - 1)));
          newHeight = (this.SIZES.volume.top / (2 ** (axisCtr - 1))) - this.SIZES.offset;
        }

        // non scalable... TODO
        this.prevAxis = this.objectKeys(this.indicatorAxis)[axisCtr - 1];
        let previousYAxis = this.chart.get(this.prevAxis);

        previousYAxis.update(
          Highstock.merge(
            {
              top: newTop + '%',
              height: newHeight + '%'
            }
          )
        );

        deleteIDs.push(indicator);
      } else {
        if (indicator == 'macd') {
          deleteIDs.push(id + ':macd');
          deleteIDs.push(id + ':signal');
        } else {
          deleteIDs.push(id);
        }
      }
    } else if (indicator === 'boll') {
      deleteIDs.push(id + ':ma');
      deleteIDs.push(id + ':upper');
      deleteIDs.push(id + ':lower');
    } else {
      deleteIDs.push(id);
    }

    for (let i of deleteIDs) {
      this.chart.get(i).remove();
    }
    delete this.activeIndicators[id];
  }

  getActiveIndicators(): Observable<any> {
    return of(this.activeIndicators);
  }

  runBacktest(): void {
    this.coinService.send({ cmd: 'run-backtest', options: { symbol: this.symbol, strategy: this.selectedStrategy, source: this.source } });
  }

  private updateTradesList(trade): void {
    let date = new Date(trade.eventTime);
    let hours = date.getHours();
    let minutes = '0' + date.getMinutes();
    let seconds = '0' + date.getSeconds();
    trade.readableTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    if (!trade.maker) {
      trade.color = '#38ca1f';
    } else {
      trade.color = '#ff4143';
    }

    if (this.trades.length < 200) {
      this.trades.unshift(trade);
    } else {
      this.trades.pop();
    }
    this.tradeListDataSource.data = this.trades;
  }

  private updateChart(candlestick): void {
    // console.log(candlestick);
    let { openTime: openTime, open: open, high: high, low: low, close: close, volume: volume, closedTime: closeTime, closed: closed } = candlestick;
    if (this.lastTime <= openTime) { //this.intervals.indexOf(openTime) == -1
      this.lastTime = openTime;
      this.coinData.push([open, high, low, close, openTime, closeTime, volume]);
      var point = {
        x: parseInt(openTime),
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close)
      };
      this.chart.series[0].addPoint(point, true, false);
      this.chart.series[1].addPoint([parseInt(openTime), parseFloat(volume)], true, false);
    } else {
      var series = this.chart.series;

      // ohlc
      var lastPoint = series[0].data[series[0].data.length - 1];
      var tmpPoint = {
        x: lastPoint.x,
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close)
      };
      lastPoint.update(tmpPoint, true);

      // volume
      lastPoint = series[1].data[series[1].data.length - 1];
      lastPoint.update([lastPoint.x, parseFloat(volume)]);
    }
  }

  private getSeriesData(data: any[]) {
    let ohlc = [];
    let volume = [];

    for (let i = 1; i < this.coinData.length; i += 1) {
      ohlc.push([
        parseInt(this.coinData[i][4]), // the date
        parseFloat(this.coinData[i][0]), // open
        parseFloat(this.coinData[i][1]), // high
        parseFloat(this.coinData[i][2]), // low
        parseFloat(this.coinData[i][3]) // close
      ]);

      volume.push([
        parseInt(this.coinData[i][4]), // the date
        parseFloat(this.coinData[i][6]) // the volume
      ]);
    }

    return { ohlc: ohlc, volume: volume };
  }

  private candlestickChart() {

    var seriesData = this.getSeriesData(this.coinData);

    // create the chart
    var options: Highstock.Options = {

      colors: ['#d0d0d5', '#7798BF', '#ff66ff', '#ffff66', '#66c2ff', '#b366ff', '#ffa366', '#66ffff', '#d9b38c', '#ff66a3', '#c2c2a3'],

      chart: {
        backgroundColor: {
          linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
          stops: [
            [0, '#424242']
            // [1, '#424242']
          ]
        },
        style: {
          fontFamily: 'monospace'
        },
        plotBorderColor: '#606063',
        type: 'candlestick',
        height: 600
      },

      rangeSelector: {
        buttonTheme: {
          fill: '#505053',
          stroke: '#000000',
          style: {
            color: '#CCC'
          },
          states: {
            hover: {
              fill: '#707073',
              stroke: '#000000',
              style: {
                color: 'white'
              }
            },
            select: {
              fill: '#000003',
              stroke: '#000000',
              style: {
                color: 'white'
              }
            }
          }
        },
        inputBoxBorderColor: '#505053',
        inputStyle: {
          backgroundColor: '#333',
          color: 'silver'
        },
        labelStyle: {
          color: 'silver'
        },
        buttons: [{
          type: 'minute',
          count: 15,
          text: '15m'
        }, {
          type: 'minute',
          count: 30,
          text: '30m'
        }, {
          type: 'hour',
          count: 1,
          text: '1h'
        }, {
          type: 'hour',
          count: 2,
          text: '2h'
        }, {
          type: 'day',
          count: 1,
          text: '1d'
        }, {
          type: 'all',
          count: 1,
          text: 'All'
        }],
        selected: 5,
        inputEnabled: false
      },

      // title: {
      //   text: 'OHLC Test'
      // },

      yAxis: [{
        gridLineColor: '#707073',
        lineColor: '#707073',
        minorGridLineColor: '#505053',
        tickColor: '#707073',
        id: 'ohlc',
        labels: {
          style: {
            color: '#E0E0E3'
          },
          align: 'right',
          x: -3
        },
        title: {
          style: {
            color: '#A0A0A3'
          },
          text: 'OHLC',
        },
        height: this.SIZES.data.height + '%',
        lineWidth: 2,
        resize: {
          enabled: true
        }
      }, {
        labels: {
          style: {
            color: '#E0E0E3'
          },
          align: 'right',
          x: -3
        },
        title: {
          style: {
            color: '#A0A0A3'
          },
          text: 'Volume'
        },
        top: this.SIZES.volume.top + '%',
        height: (this.SIZES.volume.height - this.SIZES.offset) + '%',
        lineWidth: 2
      }
      ],

      tooltip: {
        split: true,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        style: {
          color: '#F0F0F0'
        }
      },

      plotOptions: {
        series: {
          dataLabels: {
            color: '#B0B0B3'
          },
          marker: {
            lineColor: '#333'
          },
          dataGrouping: {
            units: [[
              'minute',
              [1, 2, 5, 10, 15, 30]
            ], [
              'hour',
              [1, 2, 3, 4, 6, 8, 12]
            ], [
              'day',
              [1]
            ]]
          }
        },
        boxplot: {
          fillColor: '#505053'
        },
        candlestick: {
          upLineColor: '#38ca1f',
          upColor: '#38ca1f',
          color: '#ff4143',
          lineColor: '#ff4143'
        },
        errorbar: {
          color: 'white'
        },
        line: {
          showCheckbox: true,
          events: {
            checkboxClick: function (event) {
              if (!event.checked) {
                this.hide();
              } else {
                this.show();
              }
            },
            legendItemClick: function (event) {
              this.deleteIndicator(event.target.userOptions.id);
              // this.remove(true); 
              return false;
            }.bind(this)
          }
        },
        flags: {
          showCheckbox: true,
          events: {
            checkboxClick: function (event) {
              if (!event.checked) {
                this.hide();
              } else {
                this.show();
              }
            },
            legendItemClick: function (event) {
              this.deleteIndicator(event.target.userOptions.id);
              return false;
            }.bind(this)
          }
        }
      },

      legend: {
        enabled: true,
        align: 'right',
        layout: 'vertical',
        verticalAlign: 'top',
        y: 100,
        itemStyle: {
          color: '#E0E0E3'
        },
        itemHoverStyle: {
          color: '#FFF'
        },
        itemHiddenStyle: {
          color: '#606063'
        }
      },
      credits: {
        style: {
          color: '#666'
        }
      },
      labels: {
        style: {
          color: '#707073'
        }
      },

      drilldown: {
        activeAxisLabelStyle: {
          color: '#F0F0F3'
        },
        activeDataLabelStyle: {
          color: '#F0F0F3'
        }
      },

      navigation: {
        buttonOptions: {
          symbolStroke: '#DDDDDD',
          theme: {
            fill: '#505053'
          }
        }
      },

      navigator: {
        handles: {
          backgroundColor: '#666',
          borderColor: '#AAA'
        },
        outlineColor: '#CCC',
        maskFill: 'rgba(255,255,255,0.1)',
        series: {
          color: '#7798BF',
          lineColor: '#A6C7ED'
        },
        xAxis: {
          gridLineColor: '#505053'
        }
      },

      scrollbar: {
        barBackgroundColor: '#808083',
        barBorderColor: '#808083',
        buttonArrowColor: '#CCC',
        buttonBackgroundColor: '#606063',
        buttonBorderColor: '#606063',
        rifleColor: '#FFF',
        trackBackgroundColor: '#404043',
        trackBorderColor: '#404043'
      },

      // special colors for some of the
      legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
      background2: '#505053',
      dataLabelsColor: '#B0B0B3',
      textColor: '#C0C0C0',
      contrastTextColor: '#F0F0F3',
      maskColor: 'rgba(255,255,255,0.3)',

      series: [{
        id: 'series-ohlc',
        type: 'candlestick',
        name: 'OHLC',
        data: seriesData.ohlc
      }, {
        id: 'series-volume',
        type: 'column',
        name: 'Volume',
        data: seriesData.volume,
        yAxis: 1
      }]
    };

    this.chart = Highstock.stockChart(this.chartTarget.nativeElement, options);
  }
}
