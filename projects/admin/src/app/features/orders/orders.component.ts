import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../core/services/products.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
// best practice: import interface Order and use it
export class OrdersComponent implements OnInit{
  orders!: any;
  focusedProducts!: any;
  focusedTotal: number = 0;
  constructor(private productsService: ProductsService) {}
  ngOnInit() {
    this.productsService.getOrders().subscribe(
      orders => {
        console.log(orders);
        this.orders = orders
      }
    )
  }
  onFocus(products: any, total: number) {
    this.focusedProducts = products;
    this.focusedTotal = total;
  }
  onDelete(event: Event, id: string) {
    if(confirm("Are you sure to delete this order?")) {
      (event.target as HTMLElement).parentElement?.parentElement?.remove()
      this.productsService.deleteOrder(id)
    }
  }

}
