import { Offer } from "./offer";

export interface ApiResponse {
  _embedded: EmbeddedResponse;
}

export interface EmbeddedResponse {
  kinguinOffer: Offer[];
}