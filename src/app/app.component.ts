import { Component, TemplateRef, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../environments/environment';
import { ApiResponse } from '../models/api-response';
import { NgxPermissionsModule } from 'ngx-permissions';
import { Offer } from '../models/offer';
import { Seller } from '../models/seller';
import { PreparedPricePipe } from './prepared-price.pipe';
import { OfferService } from '../services/offer.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule, NgxPermissionsModule, PreparedPricePipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  id: string = '';
  offers: Offer[] = [];
  selectedOffer!: Offer;
  sellers: Seller[] = [];
  isViewOnly: boolean = false;
  previousPopularityValue!: number;

  // Services injecting
  private http = inject(HttpClient);
  private modalService = inject(NgbModal);
  private permissionsService = inject(NgxPermissionsService);
  private offerService = inject(OfferService);

  /**
   * Updates query string in URL based on given ID
   */
  updateQueryString(): void {
    const url: URL = new URL(window.location.href);
    if (this.id) {
      url.searchParams.set('id', this.id);
    } else {
      url.searchParams.delete('id');
    }
    window.history.replaceState({}, '', url.toString());
    this.fetchOffers();
  }

  /**
   * Fetches offers based on given ID
   */
  fetchOffers(): void {
    if (!this.id) return;

    this.offerService.fetchOffers(this.id).subscribe(
      (response) => {
        this.offers = response._embedded.kinguinOffer || [];
        this.prepareSellers();
      },
      (error) => {
        console.error('Error occurred while fetching offers:', error);
      }
    );
  }
  

  /**
   * Prepares a list of unique sellers
   */
  prepareSellers(): void {
    const sellerMap = new Map();
    this.offers.forEach((offer) => {
      if (offer.seller) {
        sellerMap.set(offer.seller.id, offer.seller.name);
      }
    });
    this.sellers = Array.from(sellerMap).map(([id, name]) => ({ id, name }));
  }

  /**
   * Opens the modal
   */
  openModal(offer: any, modalTemplate: TemplateRef<any>): void {
    if (this.isViewOnly) return;
    this.selectedOffer = { ...offer };
    this.selectedOffer.price.amount /= 100;
    this.modalService.open(modalTemplate, { size: 'lg' });
  }

  /**
   * Changes "View Only" mode
   */
  toggleViewOnly(event: Event): void {
    this.isViewOnly = (event.target as HTMLInputElement).checked;

    if (this.isViewOnly) {
      this.permissionsService.addPermission('VIEW_ONLY');
    } else {
      this.permissionsService.removePermission('VIEW_ONLY');
    }
  }

  /**
   * Resets "price" after currency change
   */
  resetPrice(): void {
    this.selectedOffer.price.amount = 0;
  }

  /**
   * Switches between select and input for seller
   */
  toggleSellerInput(): void {
    if (this.selectedOffer.type === 'other') {
      this.selectedOffer.seller.name = '';
    } else {
      this.selectedOffer.seller.id = -1;
    }
  }

  /**
   * Sets readonly for "Popularity" after checking "isPreorder"
   */
  toggleReadonly(): void {
    if (this.selectedOffer.isPreorder) {
      this.previousPopularityValue = this.selectedOffer.popularityValue;
      this.selectedOffer.popularityValue = 0;
    } else {
      this.selectedOffer.popularityValue = this.previousPopularityValue;
    }
  }

    /**
   * Saves the changes, although api doesn't give a possibility to save it in v2
   */
  saveChanges(modal: any): void {
    const updatedOffer: Offer = {
      ...this.selectedOffer,
      price: { ...this.selectedOffer.price, amount: this.selectedOffer.price.amount * 100 },
    };

    this.offerService.saveOffer(updatedOffer).subscribe(
      () => {
        const index = this.offers.findIndex((offer) => offer.id === updatedOffer.id);
        if (index !== -1) {
          this.offers[index] = updatedOffer;
        }
        modal.close();
      },
      (error) => {
        console.error('Error saving offer:', error);
      }
    );
  }
  

}
