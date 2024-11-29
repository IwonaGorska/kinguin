import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Offer } from '../../models/offer';
import { Seller } from '../../models/seller';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-offer-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './offer-modal.component.html',
  styleUrls: ['./offer-modal.component.scss'],
})
export class OfferModalComponent implements OnInit {
  @Input() data!: { selectedOffer: Offer, sellers: Seller[]};
  @Output() save = new EventEmitter<NgbModalRef>();
  modalRef!: NgbModalRef;

  selectedOffer!: Offer;
  sellers!: Seller[];

  previousPopularityValue!: number;

  ngOnInit(): void {
    this.selectedOffer = this.data.selectedOffer;
    this.sellers = this.data.sellers;
  }

  toggleReadonly(): void {
    if (this.data.selectedOffer.isPreorder) {
      this.previousPopularityValue = this.data.selectedOffer.popularityValue;
      this.data.selectedOffer.popularityValue = 0;
    } else {
      this.data.selectedOffer.popularityValue = this.previousPopularityValue;
    }
  }

  toggleSellerInput(): void {
    if (this.data.selectedOffer.type === 'other') {
      this.data.selectedOffer.seller.name = '';
    } else {
      this.data.selectedOffer.seller.id = -1;
    }
  }

  resetPrice(): void {
    this.data.selectedOffer.price.amount = 0;
  }

  closeModal() {
    this.modalRef.dismiss();
  }

  onSave(): void {
    this.save.emit(this.modalRef);
  }
}
