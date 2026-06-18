# 📱 LaTchop - Frontend Mobile (Expo React Native)

Bienvenue dans le dépôt du frontend de **LaTchop**, une application mobile moderne et performante de commande et livraison de nourriture locale, construite avec **Expo** et **React Native** (TypeScript/JavaScript).

Cette application a subi une refonte complète de son interface utilisateur (**UI/UX**) et de sa robustesse technique pour atteindre les plus hauts standards de l'industrie (niveau **Production-Grade**).

---

## 🎨 1. Système de Design & Identité Visuelle

L'application utilise un système de design centralisé et strict situé dans `constants/theme.js`. Il définit les fondations visuelles de l'application :

*   **Couleurs (`COLORS`)** :
    *   `primary` : Un corail/orange raffiné (`#FF5F3B`) pour l'identité de marque.
    *   `background` : Un fond blanc cassé doux (`#F8F9FA`) pour réduire la fatigue oculaire.
    *   `surface` : Un blanc pur (`#FFFFFF`) pour les cartes et conteneurs afin de créer de la profondeur.
    *   `text` : Une hiérarchie stricte avec un gris anthracite profond pour le texte principal (`#1A1A1A`).
*   **Espacement (`SPACING`)** : Un système d'espacement basé sur une grille de 8px (`xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`) garantissant des marges aérées et constantes.
*   **Bordures (`RADIUS`)** : Des coins doux et modernes (`sm: 8`, `md: 12`, `lg: 16`, `xl: 24`, `full: 999`).
*   **Ombres (`SHADOWS`)** : Des ombres douces et réalistes basées sur la profondeur physique (`light`, `medium`, `heavy`).

---

## 🚀 2. Fonctionnalités de Niveau Production (10/10)

L'application intègre des fonctionnalités avancées pour garantir une fiabilité et une fluidité exceptionnelles :

### A. Squelettes de Chargement (Skeleton Loaders)
Pour améliorer le confort d'attente lors du chargement des données réseau, les indicateurs de chargement classiques (spinners) ont été remplacés par des **Skeletons** animés (`components/Skeleton.js`) sur les écrans critiques :
*   Grille de produits sur l'Accueil.
*   Statistiques et listes du Tableau de bord Admin.
*   Listes de commandes et de clients.

### B. Tolérance aux Pannes (Error Boundary)
Un composant **ErrorBoundary** (`components/ErrorBoundary.js`) enveloppe l'intégralité du cycle de vie de l'application. En cas d'erreur de rendu JavaScript ou de crash inattendu, l'application n'affiche pas un écran noir : elle affiche une magnifique page de secours explicative permettant à l'utilisateur de réessayer en toute sécurité.

### C. Système d'Alerte Global (Custom Alerts)
Remplacement de l'intégralité des alertes grises et invasives du système d'exploitation par un **fournisseur d'alertes personnalisé** (`context/AlertContext.js`). Les alertes s'affichent désormais sous forme de modales blanches, animées, interactives et contextuelles (Succès ✅, Erreur ❌, Attention ⚠️).

### D. Accessibilité (A11y)
Les composants interactifs majeurs (boutons d'ajout au panier, boutons de quantité, validation de commandes) intègrent désormais des attributs d'accessibilité natifs (`accessible`, `accessibilityLabel`, `accessibilityRole`, `accessibilityState`) pour assurer une compatibilité optimale avec les lecteurs d'écran (VoiceOver, TalkBack).

### E. Préparation à l'Internationalisation (i18n)
Création d'un dictionnaire de traduction (`constants/i18n.js`) prêt pour le support multilingue (Français/Anglais).

---

## 📂 3. Structure du Projet

```bash
frontend/
├── app/                  # Dossier principal Expo Router (Fichiers JS)
│   ├── (tabs)/           # Onglets de navigation principaux de l'utilisateur
│   │   ├── index.js      # Accueil (Grille de produits, Spécialités)
│   │   ├── panier.js     # Panier interactif (Sélecteur de livraison, Total)
│   │   └── profil/       # Profil utilisateur (CGU, Modification)
│   ├── admin/            # Espace Administration complet (Dashboard, Commandes)
│   ├── auth/             # Authentification (Login, Inscription étape par étape)
│   └── _layout.js        # Point d'entrée de l'application (Guards, Providers, Splash)
├── assets/               # Ressources statiques (Logo, Icons, Splash.png)
├── components/           # Composants réutilisables (Skeleton, ErrorBoundary)
├── constants/            # Constantes globales (theme.js, i18n.js, api.js)
├── context/              # Contextes React (AuthContext, CartContext, AlertContext)
├── app.json              # Configuration de l'application Expo
└── package.json          # Dépendances du projet
```

---

## 💻 4. Installation et Exécution Locale

### Prérequis
*   Node.js (v18 ou supérieur recommandé)
*   npm ou yarn
*   L'application **Expo Go** installée sur votre smartphone (iOS/Android) ou un émulateur configuré.

### Installation
1.  Placez-vous dans le dossier du frontend :
    ```bash
    cd frontend
    ```
2.  Installez les dépendances :
    ```bash
    npm install
    ```

### Démarrage
Lancez le serveur de développement Expo :
```bash
npx expo start
```

*   **Sur téléphone physique** : Scannez le QR Code affiché dans votre terminal avec l'application Expo Go.
*   **Sur émulateur Android** : Appuyez sur la touche `a` dans le terminal.
*   **Sur émulateur iOS** : Appuyez sur la touche `i` dans le terminal.

---

## 🛠️ 5. Technologies utilisées

*   **React Native** & **Expo Router** : Framework principal et routage basé sur les fichiers.
*   **Context API** : Gestion de l'état global (Authentification, Panier, Alertes).
*   **Animated (React Native)** : Moteur d'animation pour la Splash Screen, les Skeletons et les Modales.
*   **Ionicons** : Bibliothèque d'icônes unifiée.
