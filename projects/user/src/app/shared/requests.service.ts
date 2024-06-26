import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from './product.module';
import { Comment } from '../core/interfaces/comment.model';
import { BehaviorSubject, Observable, Subject, combineLatest, of, tap } from 'rxjs';
import {jwtDecode} from 'jwt-decode'; // Change import statement

@Injectable({
  providedIn: 'root'
})
// this.favoritesUrl = `https://movies-guide-eb5a7-default-rtdb.firebaseio.com/${this.uid}/favorites.json`;
// this.cartUrl = `https://movies-guide-eb5a7-default-rtdb.firebaseio.com/${this.uid}/cart.json`;
// this.wishlistUrl = `https://movies-guide-eb5a7-default-rtdb.firebaseio.com/${this.uid}/wishlist.json`;

export class RequestsService {
  private isCartToggleSubject = new Subject<boolean>;
  private isCartOpenSubject = new BehaviorSubject<boolean>(false);
  private totalPriceSubject = new BehaviorSubject<number>(0);
  private cartLengthSubject = new BehaviorSubject<number>(0);
  private wishlistLengthSubject = new BehaviorSubject<number>(0);

  cartLength$ = this.cartLengthSubject.asObservable();
  wishlistLength$ = this.wishlistLengthSubject.asObservable();

  itemsNumbers$ = combineLatest([this.cartLength$, this.wishlistLength$]);
  isCartOpen$ = this.isCartOpenSubject;
  totalPrice$ = this.totalPriceSubject;
  isCartToggle$ = this.isCartToggleSubject;
  wishlist = "WICHLIST";
  cart = "CART";
  products: Product[] = [];
  dbWishlist: Product[] = [];
  dbCart: Product[] = [];
  wishlistLen!: number;
  uid: string | undefined;
  // cartUrl = `https://movies-guide-eb5a7-default-rtdb.firebaseio.com/${this.uid}/cart.json`;
  // wishlistUrl = `https://movies-guide-eb5a7-default-rtdb.firebaseio.com/${this.uid}/wishlist.json`;
  constructor(private http: HttpClient) {
    const user = window.localStorage.getItem("userData");
    if (user) {
      this.uid = JSON.parse(user).id;
      console.log(this.uid);
    }

    this.getWishlist().subscribe(
      data => {
        data == null? this.dbWishlist = [] : this.dbWishlist = data;
        this.wishlistLengthSubject.next(this.dbWishlist.length)
      }
    )
    this.getCart().subscribe(
      data => {
        data == null? this.dbCart = [] : this.dbCart = data;
        console.log("from SERVICE>", this.dbCart);
        // this.cartLengthSubject.next(this.dbCart.length)
        this.cartLengthSubject.next(data.length)
      }
    )
  }

// // getCart
//   getDbCart() {
//     let products!: Product[];
//     this.getCart().subscribe(
//       data => {
//         data == null? this.dbCart = [] : this.dbCart = data;
//         console.log("from SERVICE>", this.dbCart);
//         this.cartLengthSubject.next(this.dbCart.length)
//       }
//       )
//       return this.dbCart;
//   }


// Modify the return type to Observable<Product[]>
getDbCart(): Observable<Product[]> {
  return this.getCart().pipe(
    tap(data => {
      // Update this.dbCart when data is emitted
      data ?? [];
      console.log("from SERVICE>", data);
      this.cartLengthSubject.next(data.length);
    })
  );
}


  getAll() {
    return this.http.get('https://api.escuelajs.co/api/v1/products')
  }
  getProduct(productId: number) {
    return this.http.get(`https://api.escuelajs.co/api/v1/products/${productId}`)
  }
  updateProducts(products: Product[]) {
    return this.http.put<any>(`https://e-commerce-86f86-default-rtdb.firebaseio.com/${this.uid}/cart.json`, products)
  }
  getAllCategories() {
    return this.http.get<any>(`https://api.escuelajs.co/api/v1/categories`)
  }
  getCategory(id: number) {
    return this.http.get<any>(`https://api.escuelajs.co/api/v1/products/?categoryId=${id}`)
  }

  addToWishlist(product: Product) {
    this.dbWishlist = removeDuplicates(this.dbWishlist, product);
    // this.dbWishlist.push(product)
    this.wishlistLengthSubject.next(this.dbWishlist.length)
    return this.http.put<Product[]>(`https://e-commerce-86f86-default-rtdb.firebaseio.com/${this.uid}/wishlist.json`,
    this.dbWishlist)
  }
  getWishlist() {
    return this.http.get<Product[]>(`https://e-commerce-86f86-default-rtdb.firebaseio.com/${this.uid}/wishlist.json`);
  }
  addToCart(product: Product) {
    console.log("UID: ", this.uid);
    console.log("First", this.dbCart);
    let list!: Product[];
    this.dbCart = removeDuplicates(this.dbCart, product);
    // this.dbCart.push(product)
    console.log("AFTER REMOVE D: ", this.dbCart);
    this.cartLengthSubject.next(this.dbCart.length)

    return this.http.put<Product[]>(`https://e-commerce-86f86-default-rtdb.firebaseio.com/${this.uid}/cart.json`,
    this.dbCart)
  }
  // ${this.uid}/
  getCart() {
    return this.http.get<Product[]>(`https://e-commerce-86f86-default-rtdb.firebaseio.com/${this.uid}/cart.json`);
  }
  draft: any = [];
  // ========================== Test ===============================
  removeCartItem(id: number) {
    this.draft.push(id)
    let listName = "cart";
    if (this.dbCart) {
      for (let removeId of this.draft) {
        this.dbCart = this.dbCart.filter((p: Product) => p.id !== removeId);
      }
      this.cartLengthSubject.next(this.dbCart.length)
    }
    return this.http.put<Product[]>(`https://e-commerce-86f86-default-rtdb.firebaseio.com/${this.uid}/${listName}.json`,
    this.dbCart)
  }
  removeWishItem(id: number) {
    this.draft.push(id)
    let listName = "wichlist";
    if (this.dbWishlist) {
      for (let removeId of this.draft) {
        this.dbWishlist = this.dbWishlist.filter((p: Product) => p.id !== removeId);
      }
      this.wishlistLengthSubject.next(this.dbWishlist.length)
    }
    return this.http.put<Product[]>(`https://e-commerce-86f86-default-rtdb.firebaseio.com/${this.uid}/${listName}.json`,
    this.dbWishlist)
  }
  saveComment(id: number, comment: string) {
    let comments: Comment;
    comments = {username: "Abdo",  comment: comment, rating: 4};

    return this.http.put<Comment>(`https://e-commerce-86f86-default-rtdb.firebaseio.com/comments/${id}/${this.uid}.json`,
    comments)
  }
  getComments(id: number) {
    return this.http.get<Comment>(`https://e-commerce-86f86-default-rtdb.firebaseio.com/comments/${id}.json`)
  }
  // ========================== Test ===============================
//   removeItem(componentName: string, id: number) {
//     this.draft.push(id)
//     let list!: Product[];
//     let subject;
//     let listName;
//     console.log("First", this.dbCart);
//     if (componentName === this.cart) {
//       this.getDbCart().subscribe(
//         products => {
//           this.dbCart = products;
//           list = this.dbCart;
//           console.log(list);
//         }
//       )
//       listName = "cart";
//       subject = this.cartLengthSubject;
//     } else if (componentName === this.wishlist) {
//       listName = "wichlist";
//       list = this.dbWishlist;
//       subject = this.wishlistLengthSubject;
//     }
//     // list == this.dbWishlist? list : "Cart";
//     if (this.dbCart) {
//       console.log(listName);
//       console.log(this.dbCart);
//       console.log("ASDSAD");
//       for (let removeId of this.draft) {
//         list = list.filter((p: Product) => p.id !== removeId);
//       }
//       subject?.next(list.length)
//     }
//     // componentName === this.cart? this.dbCart = list : this.dbWishlist = list;
//     console.log(listName);
//     console.log(list);
//     return this.http.put<Product[]>(`https://e-commerce-86f86-default-rtdb.firebaseio.com/${listName}.json`,
//     list)
//   }
}
export function removeDuplicates(array: Product[], product: Product): Product[] {
  console.log("=============================================");

  const index = array.findIndex((p) => p.id === product.id);

  if (index !== -1) {
    // If the object is found, create a modified object with the 'unit' property incremented
    const modifiedObject: Product = { ...array[index], unit: array[index].unit + 1 };

    // Update the array with the modified object
    array[index] = modifiedObject;

    // Return a new array with the modified object
    return [...array];
  }

  // If the object is not found, add it to the array

  return [...array, product];
}



    // If it's not the first occurrence, self[Index].unit += 1;
    // if (!isFirstOccurrence) {
    //   console.log("from units: ", self[isFirstOccurrenceIndex].unit);
    //   self[isFirstOccurrenceIndex].unit += 1;
    //   console.log("removed!", product);
    // }
    // // If it's the first occurrence, include in the new array
    // return isFirstOccurrence;
