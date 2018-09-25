import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { ChartModule } from 'angular-highcharts';
import { DataTablesModule } from 'angular-datatables';

import { AppComponent } from './app.component';
import { CoinsComponent } from './coins/coins.component';
import { CoinDetailComponent } from './coin-detail/coin-detail.component';
import { AppRoutingModule } from './/app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    CoinsComponent,
    CoinDetailComponent,
    DashboardComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    HttpModule,
    ChartModule,
    DataTablesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
