import { Component, OnInit } from '@angular/core';
import {NgForm} from "@angular/forms";
import {DataService} from "../../shared/services/data.service";
import {Store} from "../../shared/interfaces/stores.interface";
import {delay, switchMap, tap} from "rxjs";
import {Details, Order, DetailsOrder} from "../../shared/interfaces/order.interface";
import {ShoppingCartService} from "../../shared/services/shopping-cart.service";
import {Product} from "../products/interfaces/product.interface";
import {ProductsService} from "../products/services/products.service";
import {Router} from "@angular/router";
import {SaveOrderService} from "../../shared/services/saveOrder.service";


@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  model = {
    name: '',
    store: '',
    shippingAddress: '',
    city: ''
  };

  cart: Product[] = [];
  stores : Store[] = [];
  isDelivery : boolean = true;

  constructor(private dataSvc : DataService,
              private shoppingCartSvc: ShoppingCartService,
              private productsSvc: ProductsService,
              private saveOrderSvc: SaveOrderService,
              private router: Router) {
    this.checkIfCartIsEmpty();
  }

  ngOnInit(): void {
    this.getStores();
    this.getDateCart();
    this.prepareDetails();
  }

  onPickOrDelivery(value: boolean): void{
    this.isDelivery = value;
  }

  onSubmit({ value: formData }: NgForm): void {
    const data: Order = {
      ...formData,
      date: this.getCurrentDay(),
      isDelivery: this.isDelivery
    }
    this.saveOrderSvc.saveOrder(data)
      .pipe(
        tap(res => console.log('Order ->', res)),
        switchMap(({ id: orderId }) => {

          const detailsOrder: DetailsOrder = {
            details: this.prepareDetails(),
            orderId: orderId
          }

          console.log('details order -> ', detailsOrder);
          return this.saveOrderSvc.saveDetailsOrder(detailsOrder);
        }),
        tap(() => this.router.navigate(['/checkout/thank-you-page'])),
        delay(2000),
        tap(() => this.shoppingCartSvc.resetCart())
      )
      .subscribe();
  }



  private getStores(): void{
    this.dataSvc.getStores()
      .pipe(
        tap((stores: Store[]) => this.stores = stores))
      .subscribe();
  }

  private getCurrentDay(): string{
    return new Date().toLocaleDateString();
  }

  private prepareDetails(): Details[] {
    const details: Details[] = [];
    this.cart.forEach((product: Product) => {
      const { id: productId, name: productName, qty: quantity, stock } = product;
      const updateStock = (stock - quantity);

      this.productsSvc.updateProducts(productId, updateStock)
        .pipe(
          tap(() => details.push({ productId, productName, quantity }))
        )
        .subscribe()


    })

    console.log(details);
    return details;
  }
  private getDateCart(): void{
    this.shoppingCartSvc.cartAction$
      .pipe(
        tap((products: Product[])=> this.cart = products)
      )
      .subscribe();

  }

  private checkIfCartIsEmpty(): void{
    this.shoppingCartSvc.cartAction$
      .pipe(
        tap((products: Product[])=>{
          if(Array.isArray(products) && !products.length){
            this.router.navigate(['/products']);
          }
        })
      )
      .subscribe();
  }

}
