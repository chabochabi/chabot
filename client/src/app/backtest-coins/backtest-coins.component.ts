import { Component, OnInit } from '@angular/core';
// import { BacktestCoin } from '../coin';
// import { COINS } from '../all-coins';
import { CoinService } from '../coin.service';

@Component({
  selector: 'app-backtest-coins',
  templateUrl: './backtest-coins.component.html',
  styleUrls: ['./backtest-coins.component.css']
})
export class BacktestCoinsComponent implements OnInit {

  coins: string[];

  constructor(private coinService: CoinService) { }

  ngOnInit() {
    this.coinService.getBacktestCoinsList().subscribe(coins => this.coins = coins)
    // this.coinService.send({ cmd: 'backtest', options: { symbol: 'all' } });
  }
  ngAfterViewInit() {
    this.coinService.send({ cmd: 'backtestSymbolsList', options: { symbol: 'all' } });
  }
}
