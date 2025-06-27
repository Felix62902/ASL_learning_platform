import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './public/landing/landing.component';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  // --- public Route ---
  {path: '', component: LandingComponent, title: 'Welcome!'},
  // --- Auth Routes ---


  // --- Main Application Routes (Protected by Auth Guard) ---
  // {
  //   path: 'app',
  //   canActivate: [authGuard],
  //   children: [
  //     {path: }
  //   ]
  // }

  // Fallback route
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
