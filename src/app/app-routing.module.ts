import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LegacyPageComponent } from './legacy-page/legacy-page.component';
import { ComparativoComponent } from './comparativo/comparativo.component';

const routes: Routes = [
  { path: '', redirectTo: 'comparativo', pathMatch: 'full' },
  { path: 'comparativo', component: ComparativoComponent },
  { path: 'page/:name', component: LegacyPageComponent },
  { path: '**', redirectTo: 'comparativo' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
