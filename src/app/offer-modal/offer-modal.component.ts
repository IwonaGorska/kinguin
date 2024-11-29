import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Offer } from '../../models/offer';
import { Seller } from '../../models/seller';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-offer-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './offer-modal.component.html',
  styleUrls: ['./offer-modal.component.scss'],
})
export class OfferModalComponent implements OnInit {
  @Input() data!: { selectedOffer: Offer; sellers: Seller[] };
  @Output() save = new EventEmitter<{ updatedOffer: Offer}>();
  modalRef!: NgbModalRef;

  offerForm!: FormGroup;
  previousPopularityValue = 0;
  sellers: Seller[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Initialize form with default values
    this.sellers = this.data.sellers;

    this.offerForm = this.fb.group({
      productName: [this.data.selectedOffer.productName, [Validators.required]],
      popularityValue: [
        this.data.selectedOffer.popularityValue,
        [Validators.min(0)],
      ],
      isPreorder: [this.data.selectedOffer.isPreorder],
      type: [this.data.selectedOffer.type],
      price: this.fb.group({
        amount: [this.data.selectedOffer.price.amount ? this.data.selectedOffer.price.amount/100 : 0, [Validators.required, Validators.min(0)]],
        currency: [this.data.selectedOffer.price.currency, Validators.required],
      }),
      seller: this.fb.group({
        id: [this.data.selectedOffer.seller.id],
        name: [this.data.selectedOffer.seller.name],
      }),
      activeStockNumber: [this.data.selectedOffer.activeStockNumber, [Validators.min(0)]],
    });

    // Watch for "isPreorder" changes to toggle readonly state for "popularityValue"
    this.offerForm.get('isPreorder')?.valueChanges.subscribe(() => this.toggleReadonly());
    this.toggleReadonly();
  }

  toggleReadonly(): void {
    const popularityControl = this.offerForm.get('popularityValue');

    if (this.offerForm.get('isPreorder')?.value) {
      this.previousPopularityValue = popularityControl?.value || 0; // Store current value
      popularityControl?.setValue(0); // Reset to 0
      popularityControl?.disable(); // Disable the field
    } else {
      popularityControl?.setValue(this.previousPopularityValue); // Restore previous value
      popularityControl?.enable(); // Enable the field
    }
  }

  toggleSellerInput(): void {
    const sellerGroup = this.offerForm.get('seller');

    if (this.offerForm.get('type')?.value === 'other') {
      sellerGroup?.get('id')?.reset();
      sellerGroup?.get('name')?.setValue('');
    } else {
      sellerGroup?.get('name')?.reset();
      sellerGroup?.get('id')?.setValue(-1);
    }
  }

  resetPrice(): void {
    this.offerForm.get('price.amount')?.setValue(0);
  }

  closeModal(): void {
    this.modalRef.dismiss();
  }

  onSave(): void {
    if (this.offerForm.valid) {
      const updatedOffer = { ...this.data.selectedOffer, ...this.offerForm.value };
      this.save.emit({ updatedOffer });
    }
  }
}
