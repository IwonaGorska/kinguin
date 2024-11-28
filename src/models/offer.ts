import { Price } from "./price";
import { Seller } from "./seller";

export interface Offer {
    id: string;
    productImageUrl: string;
    productName: string;
    seller: Seller;
    price: Price;
    activeStockNumber: number;
    type: string;
    isPreorder: boolean;
    popularityValue: number;
}