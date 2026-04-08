import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard glass-card">
      <h1>CRM Dashboard</h1>
      <div class="stats-grid">
        <div class="stat-card"><h3>Total Leads</h3><p>42</p></div>
        <div class="stat-card"><h3>Hot Leads</h3><p>12</p></div>
        <div class="stat-card"><h3>New Orders</h3><p>5</p></div>
        <div class="stat-card"><h3>Conv. Rate</h3><p>15%</p></div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 32px; height: 100%; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 24px; }
    .stat-card { background: var(--glass); padding: 24px; border-radius: 12px; border: 1px solid var(--glass-border); text-align: center; }
    .stat-card h3 { margin: 0; font-size: 0.9rem; color: var(--text-dim); }
    .stat-card p { margin: 12px 0 0; font-size: 1.8rem; font-weight: 600; }
  `]
})
export class DashboardComponent {}
