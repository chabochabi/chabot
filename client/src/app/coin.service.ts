import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import * as socketio from 'socket.io-client';

import { COINS, BACKTEST_COINS} from './all-coins';

@Injectable({ providedIn: 'root' })

export class CoinService {

  private WS_URL = 'ws://localhost:3000/';
  private MAX_RECCONECTS = 3;
  private socket;

  constructor() { 
    this.initSocket();
  }

  public initSocket(): void {
    this.socket = socketio(this.WS_URL);
    this.socket.on('24hr', (data: any) => {
      COINS[data.symbol] = data;
    });
    
    this.socket.on('backtestSymbolsList:all', (data: any) => {
      for (let symbol of data.backtestSymbols) {
        if (BACKTEST_COINS.indexOf(symbol) < 0) {
          BACKTEST_COINS.push(symbol);
        }
      }
    });

    this.socket.on('reconnecting', data => {
      if (data == this.MAX_RECCONECTS) {
        console.log('3 RECONNECT ATTEMPTS');
        this.socket.close();
      }
    });
  }

  public reconnect(): void {
    this.socket.connect();
  }

  public send(message: any): void {
    this.socket.send(message);
  }

  public on24hrStream(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('24hr', (data: any) => {
        observer.next(data);
      });
    });
  }

  public get24hrList(): Observable<any> {
    return of(COINS);
  }

  public getBacktestCoinsList(): Observable<any[]> {
    return of(BACKTEST_COINS);
  }

  public onCandlestickHistory(symbol: string): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('history:'+symbol, (data: any) => observer.next(data));
    });
  }

  public onCandlestickUpdate(symbol: string): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('kline:'+symbol, (data: any) => observer.next(data));
    });
  }

  public onIndicators(symbol: string): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('indicators:'+symbol, (data: any) => observer.next(data));
    })
  }

  public onStrategies(symbol: string): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('strategies:'+symbol, (data: any) => observer.next(data));
    })
  }

  public onIndicatorsData(symbol: string): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('indicatorsData:'+symbol, (data: any) => observer.next(data));
    })
  }

  public onCandlestickStream(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('candlestickStream', (data: any) => observer.next(data));
    });
  }

  public onCoinsList(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('coinsList', (data: any) => observer.next(data));
    })
  }

  public onBacktestData(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('backtestData', (data: any) => observer.next(data));
      // this.socket.on('backtest', (data: any) => observer.next(data));
    })
  }

  public onEvent(event: string): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on(event, (data: string) => observer.next(data));
    });
  }
}