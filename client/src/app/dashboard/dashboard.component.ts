import { Component, OnInit, Renderer } from '@angular/core';
import { Coin24hr } from '../coin';
import { CoinService } from '../coin.service';
import { Subject } from '../../../node_modules/rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {

  coins: Coin24hr[] = [];
  cols: any[];
  objectKeys = Object.keys;
  coins24hr = null;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  ctr: number;
  rendered: boolean;

  constructor(
    private coinService: CoinService, 
    private renderer: Renderer,
    private router: Router,) { }

  ngOnInit() {
    this.rendered = false;
    this.ctr = 0;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
      // columns: [{
      //   title: 'Symbol',
      //   data: 'symbol'
      // }, {
      //   title: 'Avg. Price',
      //   data: 'averagePrice'
      // }, {
      //   title: 'Price Change',
      //   data: 'priceChange'
      // }, {
      //   title: '% Change',
      //   data: 'percentChange'
      // }, {
      //   title: 'Volume',
      //   data: 'volume'
      // }, {
      //   title: 'Quote Vol.',
      //   data: 'quoteVolume'
      // }, {
      //   title: 'Details',
      //   render: function (data: any, type: any, full: any) {
      //     return '<button class="waves-effect btn" symbol="' + full.symbol + '">Go</button>';
      //   }
      // }]
    };
    this.cols = [
      { field: 'symbol', header: 'Symbol' },
      { field: 'averagePrice', header: 'averagePrice' },
      { field: 'priceChange', header: 'Price Change' },
      { field: 'percentChange', header: '% Change' },
      { field: 'volume', header: 'Volume' },
      { field: 'quoteVolume', header: 'Quote Vol.' },
    ];
    this.coinService.on24hrStream()
      .subscribe(coin => {
        // DIRTYYYYYYYYYYYY o_O
        if (!this.rendered) {
          this.dtTrigger.next();
          this.rendered = true;
        }
      });
    this.coinService.get24hrList()
      .subscribe(coins => {
        this.coins24hr = coins;
      });
  }

  ngAfterViewInit(): void {
    this.renderer.listenGlobal('document', 'click', (event) => {
      if (event.target.hasAttribute("symbol")) {
        this.router.navigate(["/detail/" + event.target.getAttribute("symbol")]);
      }
    });
  }

  reconnect(): void {
    this.coinService.reconnect();
  }
}