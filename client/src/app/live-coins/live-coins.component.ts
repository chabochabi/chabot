import { Component, OnInit, Renderer, ViewChild } from '@angular/core';
import { Coin24hr } from '../coin';
import { CoinService } from '../coin.service';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-live-coins',
  templateUrl: './live-coins.component.html',
  styleUrls: ['./live-coins.component.css'],
})
export class LiveCoinsComponent implements OnInit {

  coins: Coin24hr[] = [];
  cols: any[];
  objectKeys = Object.keys;
  coins24hr = null;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  ctr: number;
  rendered: boolean;

  displayedColumns: string[] = ['symbol', 'averagePrice', 'priceChange', 'percentChange', 'volume', 'quoteVolume'];
  dataSource: MatTableDataSource<Coin24hr>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private coinService: CoinService,
    private renderer: Renderer,
    private router: Router, ) { }

  ngOnInit() {

    this.rendered = false;
    this.ctr = 0;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      order: [3, 'desc']
    };
    this.cols = [
      { field: 'symbol', header: 'Symbol' },
      { field: 'averagePrice', header: 'Avg. Price' },
      { field: 'priceChange', header: 'Price Change' },
      { field: 'percentChange', header: '% Change' },
      { field: 'volume', header: 'Volume' },
      { field: 'quoteVolume', header: 'Quote Vol.' },
    ];
    this.coinService.on24hrStream()
      .subscribe(coin => {
        // DIRTYYYYYYYYYYYY o_O
        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;
        const data = []
        for (let key in this.coins24hr) {
          data.push(this.coins24hr[key]);
        }
        this.dataSource.data = data;
        if (!this.rendered) {
          this.dtTrigger.next();
          this.rendered = true;
        }
      });
    this.coinService.get24hrList()
      .subscribe(coins => {
        this.coins24hr = coins;
        this.dataSource = new MatTableDataSource();
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }

  ngAfterViewInit(): void {
    this.renderer.listenGlobal('document', 'click', (event) => {
      if (event.target.hasAttribute("symbol")) {
        this.router.navigate(["/detail/" + event.target.getAttribute("symbol")]);
      }
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}