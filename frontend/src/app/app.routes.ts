import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InboxComponent } from './inbox/inbox.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'leads', component: InboxComponent }, // Simplified for initial version
  { path: 'inbox', component: InboxComponent },
  { path: 'settings', redirectTo: 'dashboard' }
];
