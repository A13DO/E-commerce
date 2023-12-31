import { Action } from "@ngrx/store";
import { Product } from "../shared/product.module";

export const ADD_TO_CART = "add-to-cart";
export const ADD_TO_WISHLIST = "add-to-wishlist";
export const REMOVE = "remove";
export const CARTSUCCESS = "cart-success";
export const CARTFAIL = "cart-fail";
export const INITIALIZESTATE  = "initialize-state";


export class initializeStateAction implements Action {
  readonly type: string = INITIALIZESTATE;
  payload: Product[]
  constructor(payload: Product[]) {
    this.payload = payload;
  }
}
export class addToCartAction implements Action {
  readonly type: string = ADD_TO_CART;
  payload: Product
  constructor(payload: Product) {
    this.payload = payload;
  }
}
export class addToWishlistAction implements Action {
  readonly type: string = ADD_TO_WISHLIST;
  payload: Product
  constructor(payload: Product) {
    this.payload = payload;
  }
}
export class removeAction implements Action {
  readonly type: string = REMOVE;
  payload: Product
  constructor(payload: Product) {
    this.payload = payload;
  }
}
export class CartSuccessAction implements Action {
  readonly type: string = CARTSUCCESS;
  payload: any
  constructor(payload: any) {
    this.payload = payload;
  }
}
export class CartFailAction implements Action {
  readonly type: string = CARTFAIL;
  constructor( error: any) {
    error = error
  }
}


export type ProductsActions =
  initializeStateAction
  | addToCartAction
  | addToWishlistAction
  | removeAction
  | CartSuccessAction
  | CartFailAction
