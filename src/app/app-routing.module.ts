import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LegacyPageComponent } from './legacy-page/legacy-page.component';
import { ComparativoComponent } from './comparativo/comparativo.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'comparativo', component: ComparativoComponent },
  { path: 'page/:name', component: LegacyPageComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
