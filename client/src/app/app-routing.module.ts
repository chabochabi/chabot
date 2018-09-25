import { NgModule } 			from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent }   from './dashboard/dashboard.component';
import { CoinsComponent } 		from './coins/coins.component';
import { CoinDetailComponent }  from './coin-detail/coin-detail.component';

const routes: Routes = [
	{ path: '', redirectTo: '/dashboard', pathMatch: 'full' },
	{ path: 'dashboard', component: DashboardComponent },
	{ path: 'detail/:id', component: CoinDetailComponent },
	{ path: 'coins', component: CoinsComponent},
	// { path: 'charts', component: ChartsComponent}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes)],
  exports: [ RouterModule ]
})

export class AppRoutingModule { }
