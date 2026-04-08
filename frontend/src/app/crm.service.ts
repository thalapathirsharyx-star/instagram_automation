import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Lead {
  id: string;
  customer_name: string;
  instagram_handle: string;
  lead_status: string;
  last_message_time: string;
  tags?: string[];
}

export interface Message {
  id: string;
  lead_id: string;
  message_text: string;
  direction: string;
  action_taken?: string;
  ai_notes?: string;
  created_on: string;
}

@Injectable({
  providedIn: 'root'
})
export class CrmService {
  private apiUrl = 'http://localhost:8000/api/v1/Instagram'; // Adjust port if needed

  constructor(private http: HttpClient) { }

  getLeads(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Leads`);
  }

  getMessages(leadId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/Messages/${leadId}`);
  }

  processMessage(context: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Process`, context);
  }
}
