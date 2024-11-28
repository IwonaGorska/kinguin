import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ApiResponse } from '../models/api-response';
import { Offer } from '../models/offer';

@Injectable({
  providedIn: 'root',
})
export class OfferService {
  private apiBase = 'https://gateway.kinguin.net/offer/api/v2';

  constructor(private http: HttpClient) {}

  fetchOffers(id: string): Observable<ApiResponse> {
    const headers = new HttpHeaders({
      'x-test': environment.test.toString(),
    });
    return this.http.get<ApiResponse>(`${this.apiBase}/offers/findActiveOffers/${id}`, { headers });
  }

  saveOffer(offer: Offer): Observable<Offer> {
    const headers = new HttpHeaders({
        'x-test': environment.test.toString(),
      });
    return this.http.put<Offer>(`${this.apiBase}/offers/update/${offer.id}`, offer,  { headers });
  }
}
