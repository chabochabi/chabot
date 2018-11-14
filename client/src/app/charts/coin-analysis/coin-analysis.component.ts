import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import * as Highstock from 'highcharts/highstock.src';
import * as Highcharts from 'highcharts/highcharts';

import { CoinService } from '../../coin.service';

@Component({
  selector: 'app-coin-analysis',
  templateUrl: './coin-analysis.component.html',
  styleUrls: ['./coin-analysis.component.css']
})
export class CoinAnalysisComponent implements OnInit {

  @ViewChild('chartTarget') chartTarget: ElementRef;

  // to get alls keys of an object as an array
  objectKeys = Object.keys;

  coins: any = {};
  coinsParams: any = {
    "averagePrice": "Avg. Price", 
    "priceChange": "Price Change", 
    "percentChange": "% Change", 
    "volume": "Volume", 
    "quoteVolume": "Quote Volume"
  };
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
      heigth: 80
    },
    volume: {
      top: 80,
      heigth: 20
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
    this.subHistory();
    this.subCandlestickUpdate();
    this.subIndicatorsData();
  }

  ngOnDestroy(): void {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
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

          if (indicator == 'rsi' || indicator == 'macd') {

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

              // BS if??? TODO
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

            let lastAxisIdx = this.indicatorAxis[indicator].index;

            if (indicator == 'rsi') {
              this.chart.addSeries({
                type: 'line',
                id: id,
                name: id,
                data: vals,
                yAxis: lastAxisIdx
              })
            } else if (indicator == 'macd') {
              let macd = [];
              let signal = [];

              for (let val of data[indicator].data.macd) {
                macd.push([parseInt(val.time), parseFloat(val.value)]);
              }

              for (let val of data[indicator].data.signal) {
                signal.push([parseInt(val.time), parseFloat(val.value)]);
              }

              this.chart.addSeries({
                type: 'line',
                id: id + '_macd',
                name: id + '_macd',
                data: macd,
                yAxis: lastAxisIdx
              })

              this.chart.addSeries({
                type: 'line',
                id: id + '_signal',
                name: id + '_signal',
                data: signal,
                yAxis: lastAxisIdx
              })

            }
          } else if (indicator === 'boll') {
            let ma = [], upper = [], lower = [];
            let val;

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
              id: id + '_ma',
              name: id + '_ma',
              data: ma
            })

            this.chart.addSeries({
              type: 'line',
              id: id + '_lower',
              name: id + '_lower',
              data: lower
            })

            this.chart.addSeries({
              type: 'line',
              id: id + '_upper',
              name: id + '_upper',
              data: upper
            })

          } else {
            this.chart.addSeries({
              type: 'line',
              // id: indicator,
              id: id,
              name: id,
              data: vals,
              // yAxis: 2
            })
          }
        }
      }));
  }

  private subCandlestickUpdate() {
    this.subs.push(this.coinService.onCandlestickUpdate(this.symbol)
      .subscribe((candlesticks: any) => {
        this.updateChart(candlesticks.klines);
      }));
  }

  private updateChart(candlestick): void {
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

      chart: {
        type: 'candlestick',
        height: 500
      },
      rangeSelector: {
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

      title: {
        text: 'OHLC Test'
      },

      yAxis: [{
        id: 'ohlc',
        labels: {
          align: 'right',
          x: -3
        },
        title: {
          text: 'OHLC'
        },
        height: this.SIZES.data.heigth + '%',
        lineWidth: 2,
        resize: {
          enabled: true
        }
      }, {
        labels: {
          align: 'right',
          x: -3
        },
        title: {
          text: 'Volume'
        },
        top: this.SIZES.volume.top + '%',
        height: (this.SIZES.volume.heigth - this.SIZES.offset) + '%',
        lineWidth: 2
      }
      ],

      tooltip: {
        split: true
      },

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
