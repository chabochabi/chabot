import { Component, OnInit, ElementRef } from '@angular/core';
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
    this.coinService.getBacktestCoinsList().subscribe(coins => {
      this.coins = coins;
    });
    // this.coinService.send({ cmd: 'backtest', options: { symbol: 'all' } });
  }
  ngAfterViewInit() {
    this.coinService.send({ cmd: 'backtestSymbolsList', options: { symbol: 'all' } });
  }

  applyFilter(filterValue: string) {
    var displayCoins = this.coins.filter((coin) => {
      return coin.toLowerCase().indexOf(filterValue.toLowerCase()) > -1;
    });
    
    var hideCoins = this.coins.filter((coin) => {
      return coin.toLowerCase().indexOf(filterValue.toLowerCase()) < 0;
    });

    hideCoins.forEach(coin => {
      var coinRef = document.getElementById(coin);
      coinRef.style.display = "none";
    });

    displayCoins.forEach(coin => {
      var coinRef = document.getElementById(coin);
      coinRef.style.display = "block";
    });
  }
}
