# Stats Basket - Android

Application Android pour tracker les statistiques de basketball.

## Prérequis

- Android Studio (https://developer.android.com/studio)
- JDK 17 ou supérieur

## Générer l'APK

### Méthode 1 : Via Android Studio

1. Ouvrir le dossier `android` dans Android Studio
2. Attendre la synchronisation Gradle
3. Menu **Build > Build Bundle(s) / APK(s) > Build APK(s)**
4. L'APK sera généré dans `android/app/build/outputs/apk/debug/app-debug.apk`

### Méthode 2 : En ligne de commande

```bash
cd android
./gradlew assembleDebug
```

L'APK sera dans `app/build/outputs/apk/debug/app-debug.apk`

### APK Release (signé)

Pour une version release :

```bash
./gradlew assembleRelease
```

Note : Nécessite une configuration de signature dans `app/build.gradle`

## Installation sur tablette

1. Activer les **Sources inconnues** dans les paramètres Android
   - Paramètres > Sécurité > Sources inconnues
2. Transférer l'APK sur la tablette (USB, email, cloud...)
3. Ouvrir l'APK et installer

## Fonctionnalités

- Écran toujours allumé pendant l'utilisation
- Fonctionne hors-ligne (données en localStorage)
- Interface optimisée pour tablette
- Thème clair/sombre

## Mise à jour de l'app

Après modification du code React :

```bash
# Depuis le dossier react/
npm run build
npx cap sync android
```

Puis regénérer l'APK.
