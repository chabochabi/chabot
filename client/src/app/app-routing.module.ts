import { NgModule } 			from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LiveCoinsComponent }   from './live-coins/live-coins.component';
import { BacktestCoinsComponent } 		from './backtest-coins/backtest-coins.component';
import { CoinDetailComponent }  from './coin-detail/coin-detail.component';
import { OverviewComponent } 	from './overview/overview.component';
import { AnalysisComponent } 	from './analysis/analysis.component';

const routes: Routes = [
	{ path: '', redirectTo: '/overview', pathMatch: 'full' },
	{ path: 'overview', component: OverviewComponent },
	{ path: 'live-coins', component: LiveCoinsComponent },
	{ path: 'backtest-coins', component: BacktestCoinsComponent},
	{ path: 'details/:id/:source', component: CoinDetailComponent },
	{ path: 'analysis/:id/:source', component: AnalysisComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes)],
  exports: [ RouterModule ]
})

export class AppRoutingModule { }
