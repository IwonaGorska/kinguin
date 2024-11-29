import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsModule } from 'ngx-permissions';
import { Offer } from '../models/offer';
import { Seller } from '../models/seller';
import { PreparedPricePipe } from './prepared-price.pipe';
import { OfferService } from '../services/offer.service';
import { OfferModalComponent } from './offer-modal/offer-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule, NgxPermissionsModule, PreparedPricePipe, OfferModalComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  id = '';
  offers: Offer[] = [];
  selectedOffer!: Offer;
  sellers: Seller[] = [];
  isViewOnly = false;
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
        // In the future add a snackbar as well
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
  openModal(offer: Offer): void {
    if (this.isViewOnly) return;
    this.selectedOffer = { ...offer };
  
    const modalRef = this.modalService.open(OfferModalComponent, { size: 'lg' });
    modalRef.componentInstance.data = { selectedOffer: this.selectedOffer, sellers: this.sellers };
    modalRef.componentInstance.modalRef = modalRef;

    modalRef.componentInstance.save.subscribe((updatedData: Offer) => {
      this.saveChanges(updatedData, modalRef);
      modalRef.close();
    });
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
   * Saves the changes, although api doesn't give a possibility to save it in v2
   */
  saveChanges(updatedOffer: Offer, modal: NgbModalRef): void {

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
        // In the future add a snackbar as well
      }
    );
  }

}
