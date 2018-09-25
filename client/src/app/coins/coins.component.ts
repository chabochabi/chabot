import { Component, OnInit } from '@angular/core';
// import { OfflineCoin } from '../coin';
// import { COINS } from '../all-coins';
import { CoinService } from '../coin.service';

@Component({
  selector: 'app-coins',
  templateUrl: './coins.component.html',
  styleUrls: ['./coins.component.css']
})
export class CoinsComponent implements OnInit {

  coins: string[];

  constructor(private coinService: CoinService) { }

  ngOnInit() {
    this.coinService.getOfflineList().subscribe(coins => this.coins = coins)
    this.coinService.send({ cmd: 'offline', options: { symbol: 'all' } });
  }
}
