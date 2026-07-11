# CycyFood - Frontend

Une application mobile front-end (React Native / Expo) pour CycyFood, construite avec Expo + expo-router. Elle fournit l'interface utilisateur pour les utilisateurs, un espace admin et les écrans d'authentification. Ce README décrit l'architecture, la mise en route, le développement quotidien, la publication et des bonnes pratiques pour contribuer.

---

## Sommaire rapide
- Qu'est-ce que c'est — aperçu
- Stack
- Organisation du projet (arborescence)
- Démarrage rapide (dev) — commandes
- Architecture & navigation (expo-router)
- Détails par dossier et composants importants
- Tests, debugging, builds (EAS / Expo)
- Tâches courantes et procédures
- Bonnes pratiques et conventions
- Dépannage fréquent
- Contribution & processus
- Licence & contact

---

## Qu'est-ce que c'est
CycyFood-Frontend est l'application mobile front-end d'une solution de commandes/gestion de repas. Elle cible utilisateurs finaux (consultation, panier, commandes) et administrateurs (gestion des produits, clients, commandes). L'app utilise Expo (React Native) avec le routeur par fichier `expo-router`.

### Stack
- Languages: JavaScript (principal), petits éléments Kotlin / Ruby présents
- Framework / runtime: Expo (SDK ~54) + React Native (0.81.5) + expo-router (file-based routing)
- Notable libraries:
  - expo-router — routing par fichiers (pages / layouts)
  - react — 19.1.0
  - react-native — 0.81.5
  - expo (image picker, notifications, secure-store, splash-screen, etc.)
  - react-native-reanimated, react-native-gesture-handler (animation / gestural)

---

## Comment le projet est organisé (top‑level)
Arborescence annotée (se focaliser sur les dossiers importants) :

```
app/                 # écrans & layouts (file-based routing pour expo-router)
  _layout.js          # Layout racine et Providers globaux (entrée des routes)
  (tabs)/             # Groupement d'onglets (tab-based navigation)
    _layout.js
    index.js          # écran principal (home)
    panier.js         # écran panier
    commandes.js      # écran commandes
    profil/           # écran profil + pages (CGU, confidentialité, modifier profil)
  admin/               # espace administrateur (produits, clients, commandes, compte)
  auth/                # écrans d'authentification (login, signup)
android/              # dossier Android (native) géré par Expo
ios/                  # dossier iOS (native) géré par Expo
assets/               # images, fonts, icônes
constants/            # constantes globales (colors, theme, endpoints)
context/              # providers / context React (auth, panier, etc.)
app.json              # config expo
eas.json              # configuration EAS (builds)
package.json          # scripts & deps
babel.config.js       # configuration Babel
README.md             # (ce fichier)
.gitignore
```

**How it fits together:**
- Expo démarre l'application ; `expo-router` charge `app/_layout.js` qui définit providers globaux et les layouts d'app.
- Les fichiers dans `app/` définissent les pages; le router mappe fichiers → routes.
- Les contexts (dans `context/`) maintiennent l'état global (auth, panier, thème).
- Les composants UI consomment `constants/` pour styles et valeurs partagées.

---

## Comment exécuter le projet (démarrage rapide)
Prérequis :
- Node.js (recommandé >= 16, idéal 18+)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`) et / ou EAS CLI (`npm i -g eas-cli`) pour builds
- Android Studio (pour émulateur) ou Xcode (macOS) pour iOS

Commandes de base (depuis la racine) :

Installation :

```bash
npm install
# ou
yarn install
```

Lancer en dev (Expo Metro) :

```bash
npm run start
# équivaut à: expo start
```

Démarrer sur Android / iOS :

```bash
npm run android    # expo run:android
npm run ios        # expo run:ios   (macOS + Xcode requis)
```

Lancer pour le web :

```bash
npm run web        # expo start --web
```

Notes :
- `package.json` précise `"main": "expo-router/entry"`. L'entrée runtime est fournie par expo-router.
- Pour builds et publication, utilisez `eas build` et `eas submit` (configurations dans `eas.json`).

---

## Architecture & navigation (expo-router)
- Routeurs basés sur fichiers : `app/` → chaque fichier `.js` représente une route.
- Layouts :
  - `app/_layout.js` — layout global et providers (auth provider, navigation provider, etc.).
  - `app/(tabs)/_layout.js` — layout spécifique qui expose la navigation par onglets.
- Groupes : parenthèses ex. `(tabs)` sont utilisés pour grouper des routes sans créer d'URL explicite (pattern d'expo-router).

Bonne pratique pour ajouter une page :
1. Créez `app/monEcran/` ou `app/monEcran.js`.
2. Suivez les conventions existantes (export default function Page() { return <View>... }).
3. Si la page doit partager layout avec les onglets, placez-la sous `(tabs)`.

---

## Détails par dossier (ce qu'on a vu & leur rôle)
- app/
  - _layout.js — point d'assemblage global (providers, statusbar, layout).
  - (tabs)/ — groupe principal d'écrans affichés via les onglets.
    - index.js, panier.js, commandes.js — écrans utilisateurs.
    - profil/ — pages utilisateur : CGU, confidentialite, modifier profil.
  - admin/ — écrans admin (clients.js, produits.js, commandes.js, compte.js, index.js).
  - auth/ — `login.js`, `signup.js` (flux d'authentification).
- constants/ — valeurs centralisées (URLs, couleurs, tailles).
- context/ — Providers React (AuthContext, CartContext, ThemeContext).
- assets/ — images / fonts: charge via `expo-asset` / `expo-font`.
- ios/ & android/ — répertoires natifs générés par Expo ; utiles pour builds personnalisés.
- app.json & eas.json — configuration expo & EAS.

---

## Développement quotidien — checklist
1. Cloner le repo :
   ```bash
   git clone https://github.com/Yokomi-YBJ/CycyFood-Frontend.git
   cd CycyFood-Frontend
   npm install
   ```
2. Démarrer Metro : `npm run start`
3. Lancer sur simulateur / appareil :
   - Android : `npm run android` (nécessite Android Studio / AVD)
   - iOS : `npm run ios` (macOS + Xcode)
4. Pour construire un binaire :
   - Utiliser EAS (`eas build --platform android` / `--platform ios`).

---

## Débogage & logs
- Utiliser la console Metro (accessible via `expo start`) pour logs JS.
- Pour les erreurs natives, joindre le log d'ADB pour Android :
  ```bash
  adb logcat *:S ReactNative:V ReactNativeJS:V
  ```
- Outils utiles : React Developer Tools, Flipper (si configuré), ou un service de monitoring si intégré.

---

## Bonnes pratiques & conventions de code
- Respecter la structure `app/` pour les routes (expo-router).
- State global limité aux contexts dans `context/`. Préférer props pour isolation.
- Styling : centraliser couleurs / tailles dans `constants/`.
- Nommez les composants React en PascalCase. Fichiers de pages en kebab-case ou camelCase selon convention existante.
- Commits : message clair, prefixer par type (feat, fix, chore, docs).
- Tests : ajouter tests unitaires progressivement (Jest + React Native Testing Library recommandé).

---

## Tâches courantes (exemples)
- Ajouter un écran : créer `app/mon-ecran.js` et mettre en place le composant.
- Ajouter une dépendance native : `expo install <pkg>` si supporté ou `npm install` + config native + `eas build`.
- Mettre à jour SDK Expo : vérifier compatibilités `react-native` / `react` / `expo-router` avant mise à jour.

---

## CI / Builds (recommandations)
- Utiliser EAS pour builds distribués (`eas.json` déjà présent).
- Processus recommandé :
  1. Pipeline CI installe deps (`npm ci`), lance linter, tests, build web (optionnel).
  2. Sur release, lancer `eas build --profile production`.
- Stocker secrets de build via les mécanismes sécurisés du service de build (EAS / CI).

---

## Dépannage fréquent
- Erreur "invariant violation" après upgrade : supprimer cache + réinstaller:
  ```bash
  expo start -c
  rm -rf node_modules && npm install
  ```
- Problèmes de polices/images non chargées : vérifier `assets/` et le chargement via `expo-font` dans `_layout.js`.
- Problèmes liés aux dépendances natives : exécuter `expo doctor` / `expo prebuild` pour diagnostiquer.

---

## Tests & qualité
- Pas de tests présents dans la base actuelle — ajouter progressivement :
  - Unit tests : Jest + RN Testing Library.
  - E2E : Detox ou Cypress (pour web) si besoin.
- Lint / formatting : configurer ESLint + Prettier (recommandé si absent).

---

## Contribuer
1. Fork & branch (feature/<nom>, fix/<ticket>).
2. Respecter le style du code existant.
3. Ouvrir PR avec description : objectif, changements clés, captures d'écran si UI.
4. Ajouter tests si possible.
5. Revue : assigner reviewer(s) et vérifier pipeline CI.

---

## Checklist avant release
- [ ] Mettre à jour `app.json` avec les informations finales (slug, name, bundleIdentifier).
- [ ] Tester sur device réel Android & iOS.
- [ ] Bump version dans `package.json`.
- [ ] Construire via `eas build` et tester l'artefact.

---

## Ressources & références
- Expo docs: https://docs.expo.dev
- expo-router: https://github.com/expo/router
- EAS build docs: https://docs.expo.dev/eas

---

## Contact / auteurs
- Repository maintainer: Yokomi-YBJ (voir GitHub)
- Pour questions techniques, ouvrir une issue en détaillant la configuration locale (Node version, OS, logs).

---

## Licence
(Vérifier et ajouter le fichier LICENSE si nécessaire) — aucun fichier `LICENSE` détecté dans le dépôt. Ajouter une licence explicite si ce projet doit être open-source (MIT / Apache-2.0 / etc.).

---

Annexes : fichiers importants à inspecter
- package.json — scripts & versions des dépendances
- app/_layout.js — point d’entrée des providers & layout
- app/(tabs)/index.js, panier.js, commandes.js — flux utilisateur principal
- app/auth/login.js, app/auth/signup.js — flux d’authentification
- app/admin/*.js — pages d’administration
- eas.json — profils et configuration de build
