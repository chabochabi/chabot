import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable, of } from 'rxjs';

import * as Highstock from 'highcharts/highstock.src';

import { CoinService } from '../coin.service';

@Component({
  selector: 'app-coin-detail',
  templateUrl: './coin-detail.component.html',
  styleUrls: ['./coin-detail.component.css']
})
export class CoinDetailComponent implements OnInit {

  @ViewChild('chartTarget') chartTarget: ElementRef;

  // to get alls keys of an object as an array
  objectKeys = Object.keys;

  symbol: string;
  chart: Highstock.ChartObject;

  coins = {};
  coinData: any[] = [];

  lastTime: number = 0; // bah! not nice... TODO

  chartRendered: boolean = false; // also not nice... TODO

  // stores all subscribtions
  subs: any[] = [];

  selectedIndicator: string;
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
  prevAxis: string = 'ohlc';

  // sizes for the chart yaxis
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
  ) {
    this.coinService.get24hrList()
      .subscribe(coins => {
        this.coins = coins;
      });
  }

  ngOnInit(): void {

    this.getSymbol();

    // get coin history
    this.coinService.send({ cmd: 'history', options: { symbol: this.symbol } });
    // update coinData on incoming history
    this.subs.push(this.coinService.onCandlestickHistory(this.symbol)
      .subscribe((candlesticks: any) => {
        for (let i = 0; i < candlesticks.klines.length; i++) {
          let { openTime: openTime, open: open, high: high, low: low, close: close, volume: volume, closeTime: closeTime } = candlesticks.klines[i];
          this.coinData.push([open, high, low, close, openTime, closeTime, volume]);
          this.lastTime = openTime;
        }
        this.candlestickChart();
      }));

    // update coinData on incoming new candlesticks
    this.subs.push(this.coinService.onCandlestickUpdate(this.symbol)
      .subscribe((candlesticks: any) => {
        this.updateChart(candlesticks.klines[0]);
      }));

    // request a list of all availabe indicators
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

    this.subs.push(this.coinService.onBacktestData()
      .subscribe((data: any) => {
        let flags = [];
        let flagColor = 'red';
        for (let entry in data) {
          flagColor = 'red';
          if (data[entry] === 'up') {
            flagColor = 'green';
          }
          flags.push({
            x: parseInt(entry),
            title: data[entry],
            text: data[entry],
            color: flagColor,
            fillColor: flagColor
          })
        }

        console.log(flags);

        this.chart.addSeries({
          type: 'flags',
          id: 'flags',
          data: flags,
          onSeries: 'series-ohlc',
          shape: 'squarepin',
          width: 16
        })
      }));

    // display indicator data on incoming indicators
    this.subs.push(this.coinService.onIndicatorsData(this.symbol)
      .subscribe((data: any) => {
        let vals = [];

        for (let indicator in data) {
          let id = indicator;
          for (let val of data[indicator].data) {
            vals.push([
              parseInt(val.time),
              parseFloat(val.value)
            ]);
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
                macd.push([
                  parseInt(val.time),
                  parseFloat(val.value)
                ]);
              }

              for (let val of data[indicator].data.signal) {
                signal.push([
                  parseInt(val.time),
                  parseFloat(val.value)
                ]);
              }

              this.chart.addSeries({
                type: 'line',
                // id: indicator,
                id: id + '_macd',
                name: id + '_macd',
                data: macd,
                yAxis: lastAxisIdx
              })

              this.chart.addSeries({
                type: 'line',
                // id: indicator,
                id: id + '_signal',
                name: id + '_signal',
                data: signal,
                yAxis: lastAxisIdx
              })

            }
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

          console.log(this.indicatorAxis);
        }
      }));
  }

  ngOnDestroy(): void {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  getSymbol(): void {
    this.symbol = this.route.snapshot.params.id;
  }

  goBack(): void {
    this.location.back();
  }

  backtest(): void {
    this.coinService.send({ cmd: 'backtest', options: { symbol: this.symbol} });
  }

  getActiveIndicators(): Observable<any> {
    return of(this.activeIndicators);
  }

  delete(id: string) {
    console.log(id);
    let indicator = id.split('_')[0];
    let deleteIDs = [];

    if (indicator == 'rsi' || indicator == 'macd') {

      let newTop = 0;
      let newHeight = this.SIZES.data.heigth - this.SIZES.offset;

      this.indicatorAxis[indicator].ctr -= 1;
      if (this.indicatorAxis[indicator].ctr == 0) {

        delete this.indicatorAxis[indicator];
        let axisCtr = this.objectKeys(this.indicatorAxis).length;
        if (axisCtr > 1) {
          newTop = this.SIZES.volume.top - (this.SIZES.volume.top / (2 ** (axisCtr - 1)));
          newHeight = (this.SIZES.volume.top / (2 ** (axisCtr - 1))) - this.SIZES.offset;
        }
        
        // not scalable... TODO
        this.prevAxis = this.objectKeys(this.indicatorAxis)[axisCtr-1];
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
          deleteIDs.push(id + '_macd');
          deleteIDs.push(id + '_signal');
        } else {
          deleteIDs.push(id);
        }
      }
    } else {
      deleteIDs.push(id);
    }

    for (let i of deleteIDs) {
      this.chart.get(i).remove();
    }
    delete this.activeIndicators[id];
  }

  add(indicator: string) {

    let params = this.indicators[indicator]['params'];
    let id = indicator.toLowerCase();

    for (let p in params) {
      id += '_' + params[p];
    }

    if (id in this.activeIndicators) {
      return;
    }

    this.coinService.send({ cmd: 'indicatorsData', options: { symbol: this.symbol, indicator: { type: indicator, params } } });
    this.getActiveIndicators()
      .subscribe(indicators => {
        indicators[id] = indicator;
      });
  }

  private selectIndicator(): void {

    if (this.selectedIndicator in this.activeIndicators) {
      return;
    }

    let ind = this.selectedIndicator.toUpperCase();
    let params = this.indicators[ind]['params'];

    this.coinService.send({ cmd: 'indicatorsData', options: { symbol: this.symbol, indicator: { type: this.selectedIndicator.toUpperCase(), params } } });
    this.getActiveIndicators()
      .subscribe(indicators => {
        indicators[this.selectedIndicator] = this.selectedIndicator.toUpperCase();
      });
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

    for (let i=1; i < this.coinData.length; i += 1) {
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
        height: 600
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
        // offset: 0,
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