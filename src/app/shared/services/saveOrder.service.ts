import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Order, DetailsOrder} from "../interfaces/order.interface";

@Injectable({
  providedIn: 'root'
})

export class SaveOrderService {

  apiURL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  saveOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(`${this.apiURL}/orders`, order);
  }

  saveDetailsOrder(details: DetailsOrder): Observable<DetailsOrder> {
    return this.http.post<DetailsOrder>(`${this.apiURL}/detailsOrders`, details);
  }

}
