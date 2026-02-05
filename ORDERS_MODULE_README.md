# 🛒 Module de Gestion des Commandes - Frontend Angular

## 📋 Vue d'ensemble

Ce module implémente la gestion des commandes côté frontend pour communiquer avec l'API Spring Boot OrderController.

## 🚀 Fonctionnalités implémentées

### 1. **Service de Commandes** (`orderservice.ts`)
Service Angular pour gérer les appels API liés aux commandes :

- ✅ `createOrder()` - Créer une commande à partir du panier
- ✅ `createOrderFromCart(userId)` - Créer une commande pour un utilisateur spécifique
- ✅ `getMyOrders()` - Récupérer les commandes de l'utilisateur connecté
- ✅ `getUserOrders(userId)` - Récupérer les commandes d'un utilisateur
- ✅ `getOrderById(orderId)` - Récupérer une commande par ID
- ✅ `getAllOrders()` - Récupérer toutes les commandes (admin)

### 2. **Composant Liste des Commandes** (`orders/`)
Page affichant toutes les commandes de l'utilisateur :

- 📦 Liste des commandes triées par date (plus récente en premier)
- 🏷️ Badge de statut coloré (En attente, Confirmée, Expédiée, Livrée, Annulée)
- 📊 Résumé : nombre d'articles et total
- 🔍 Bouton pour voir les détails de chaque commande
- ⏳ États de chargement et d'erreur
- 📭 État vide avec lien vers la boutique

### 3. **Composant Détails de Commande** (`order-detail/`)
Page affichant les détails d'une commande spécifique :

- 📄 Informations complètes (numéro, date, statut)
- 🛍️ Liste détaillée des articles commandés
- 💰 Calcul du total avec sous-totaux par article
- ← Bouton retour vers la liste des commandes

### 4. **Intégration au Panier**
Le composant panier a été mis à jour :

- ✅ Appel à l'API `/orders/user/{userId}` lors du checkout
- 🔄 Gestion automatique du panier (vidé par le backend)
- ⚠️ Gestion des erreurs (panier vide, stock insuffisant)
- 🎯 Redirection vers la page des commandes après succès

### 5. **Navigation**
- 🔗 Lien "Retours & Commandes" dans le header (page home)
- 🗺️ Routes configurées :
  - `/orders` → Liste des commandes
  - `/orders/:id` → Détails d'une commande
  - `/commandes` → Alias français
  - `/commandes/:id` → Alias français

## 🎨 Design & UX

### Statuts de commande avec couleurs :
- 🟡 **En attente** (Pending) - Jaune/Orange
- 🔵 **Confirmée** (Confirmed) - Bleu
- 🟣 **Expédiée** (Shipped) - Violet
- 🟢 **Livrée** (Delivered) - Vert
- 🔴 **Annulée** (Cancelled) - Rouge

### Responsive Design
- 📱 Design adaptatif pour mobile et desktop
- 🎯 Cards avec hover effects
- ⚡ Animations de chargement

## 📡 Endpoints API utilisés

```typescript
// Backend Spring Boot (port 8080)
POST   /orders/user/{userId}        // Créer commande
GET    /orders/user/{userId}        // Commandes utilisateur
GET    /orders/{orderId}            // Détails commande
GET    /orders                      // Toutes les commandes (admin)
```

## 🔧 Configuration

### URL de l'API
Dans `orderservice.ts`, l'URL est configurée par défaut :
```typescript
private apiUrl = 'http://localhost:8080/orders';
```

### Authentification
Le service récupère l'ID utilisateur depuis le localStorage :
```typescript
localStorage.getItem('currentUser')
```

## 📝 Utilisation

### 1. Passer une commande depuis le panier
```typescript
// Dans cart.component.ts
checkout() {
  this.orderService.createOrder().subscribe({
    next: (order) => {
      console.log('Commande créée:', order);
      this.router.navigate(['/orders']);
    },
    error: (err) => {
      console.error('Erreur:', err);
    }
  });
}
```

### 2. Afficher les commandes
```typescript
// Dans orders.component.ts
ngOnInit() {
  this.orderService.getMyOrders().subscribe({
    next: (orders) => {
      this.orders = orders;
    }
  });
}
```

### 3. Afficher une commande spécifique
```typescript
// Dans order-detail.component.ts
loadOrderDetail(orderId: number) {
  this.orderService.getOrderById(orderId).subscribe({
    next: (order) => {
      this.order = order;
    }
  });
}
```

## 🎯 Flux utilisateur

1. **Ajout au panier** → L'utilisateur ajoute des produits
2. **Validation panier** → Clic sur "Passer commande"
3. **Confirmation** → Popup de confirmation
4. **Création commande** → Appel API `POST /orders/user/{userId}`
5. **Succès** → Redirection vers `/orders`
6. **Consultation** → Liste de toutes les commandes
7. **Détails** → Clic sur "Voir détails" → `/orders/{id}`

## ⚠️ Gestion des erreurs

### Erreurs gérées :
- ❌ Panier vide (HTTP 400)
- ❌ Stock insuffisant (exception backend)
- ❌ Utilisateur non connecté
- ❌ Commande introuvable (HTTP 404)
- ❌ Erreur serveur (HTTP 500)

### Messages utilisateur :
```typescript
// Panier vide
alert('❌ Erreur: Le panier est vide');

// Stock insuffisant
alert('❌ Erreur: Stock insuffisant pour certains produits');

// Succès
alert('✅ Commande #123 validée avec succès !');
```

## 🔄 Synchronisation Backend

Le frontend s'attend à recevoir des objets de type :

```typescript
interface Order {
  id?: number;
  userId: number;
  items: OrderItem[];
  totalPrice: number;
  status?: string;
  orderDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}
```

## 📂 Structure des fichiers

```
src/app/
├── services/
│   └── orderservice.ts          # Service API commandes
├── orders/
│   ├── orders.component.ts      # Liste des commandes
│   ├── orders.component.html
│   └── orders.component.scss
├── order-detail/
│   ├── order-detail.component.ts    # Détails commande
│   ├── order-detail.component.html
│   └── order-detail.component.scss
├── cart/
│   └── cart.component.ts        # Mise à jour: checkout avec API
└── app.routes.ts                # Routes configurées
```

## 🚦 Pour tester

1. **Lancer le backend Spring Boot** (port 8080)
2. **Lancer le frontend Angular** : `ng serve`
3. **Se connecter** à l'application
4. **Ajouter des produits** au panier
5. **Passer une commande** depuis `/cart`
6. **Voir les commandes** dans `/orders`
7. **Consulter les détails** en cliquant sur une commande

## 🎉 Prêt à l'emploi !

Le module est entièrement fonctionnel et prêt à communiquer avec votre backend Spring Boot OrderController.
