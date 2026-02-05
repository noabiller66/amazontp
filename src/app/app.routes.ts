import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { AccountComponent } from './account/account.component';
import { CartComponent } from './cart/cart.component';
import { OrdersComponent } from './orders/orders.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'auth',
    component: LoginComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'connexion',
    component: LoginComponent
  },
  {
    path: 'register',
    component: LoginComponent
  },
  {
    path: 'inscription',
    component: LoginComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'accueil',
    component: HomeComponent
  },
  {
    path: 'account',
    component: AccountComponent
  },
  {
    path: 'compte',
    component: AccountComponent
  },
  {
    path: 'cart',
    component: CartComponent
  },
  {
    path: 'panier',
    component: CartComponent
  },
  {
    path: 'orders',
    component: OrdersComponent
  },
  {
    path: 'orders/:id',
    component: OrderDetailComponent
  },
  {
    path: 'commandes',
    component: OrdersComponent
  },
  {
    path: 'commandes/:id',
    component: OrderDetailComponent
  },
  {
    path: 'admin',
    component: AdminDashboard
  }
];
