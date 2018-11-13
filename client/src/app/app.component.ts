import { Component } from '@angular/core';
import { CoinService } from './coin.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chabot';
  menuButton = false;

  constructor(private coinService: CoinService) { }

  reconnect(): void {
    this.coinService.reconnect();
  }
}
