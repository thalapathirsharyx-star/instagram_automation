import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmService } from '../crm.service';
import { Lead, Message, ApiResponse } from '../models/crm.models';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.css']
})
export class InboxComponent implements OnInit {
  leads: Lead[] = [];
  selectedLead: Lead | null = null;
  messages: Message[] = [];

  constructor(private crmService: CrmService) {}

  ngOnInit() {
    this.loadLeads();
  }

  loadLeads(): void {
    this.crmService.getLeads().subscribe((res: ApiResponse<Lead[]>) => {
      this.leads = res.Data;
      if (this.leads.length > 0) {
        this.selectLead(this.leads[0]);
      }
    });
  }

  selectLead(lead: Lead): void {
    this.selectedLead = lead;
    this.crmService.getMessages(lead.id).subscribe((res: ApiResponse<Message[]>) => {
      this.messages = res.Data;
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  private scrollToBottom() {
    const el = document.querySelector('.chat-history');
    if (el) el.scrollTop = el.scrollHeight;
  }
}
