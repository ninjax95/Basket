# CLAUDE.md - Stats Basket App

## Overview

Application React pour tracker les statistiques d'un joueur de basketball pendant un match. Déployée sur Vercel.

- **Repo GitHub** : https://github.com/ninjax95/Basket
- **Hébergement** : Vercel (auto-deploy depuis GitHub)

## Configuration Git & Déploiement

### GitHub
- **Username** : ninjax95
- **Email** : jaxmaj@gmail.com
- **Repo** : Basket (https://github.com/ninjax95/Basket)

### Vercel
- **Framework Preset** : Vite
- **Build Command** : `npm run build` (auto-détecté)
- **Output Directory** : `dist` (auto-détecté)
- **Déploiement** : Automatique à chaque push sur `main`

### Workflow de déploiement
1. Faire les modifications localement
2. `git add .`
3. `git commit -m "message"`
4. `git push` (peut nécessiter un token GitHub)
5. Vercel redéploie automatiquement

## Stack technique

- **Framework** : React 18 avec Vite
- **Graphiques** : Recharts (LineChart, RadarChart)
- **Persistance** : localStorage
- **Style** : CSS-in-JS (styles dans App.jsx)

## Structure du projet

```
react/
├── src/
│   ├── App.jsx              # Composant principal + tous les styles CSS
│   ├── main.jsx             # Point d'entrée React
│   ├── components/
│   │   ├── CourtMap.jsx     # Carte interactive du terrain (SVG)
│   │   ├── Timer.jsx        # Timer avec gestion des quart-temps
│   │   ├── StatCounter.jsx  # Compteur +/- pour chaque stat
│   │   ├── PlayerInfo.jsx   # Infos joueur (nom, numéro)
│   │   ├── StatsDisplay.jsx # Affichage résumé des stats
│   │   ├── MatchHistory.jsx # Historique des matchs avec filtres
│   │   ├── EvolutionChart.jsx    # Graphique d'évolution
│   │   ├── PerformanceRadar.jsx  # Graphique radar
│   │   └── PinLock.jsx      # Écran de verrouillage PIN
│   └── hooks/
│       └── useStats.js      # Hooks personnalisés (stats, timer, playing time, history)
├── index.html
├── package.json
└── vite.config.js
```

## Fonctionnalités

### Authentification PIN
- Code PIN 4-6 chiffres pour protéger l'accès
- Première visite : création du PIN avec confirmation
- Visites suivantes : saisie du PIN pour déverrouiller
- Clavier numérique tactile
- Session persistante (reste déverrouillé jusqu'à fermeture du navigateur)

### Stats trackées
- **Points** : tirs 2pts, 3pts, lancers francs (réussis/ratés)
- **Rebonds** : offensifs, défensifs
- **Autres** : passes décisives, interceptions, contres, fautes, pertes de balle

### Timer
- 4 quart-temps configurables (5, 8, 10, 12, 15 min)
- Navigation entre QT avec confirmation
- Boutons +/- pour ajuster le temps
- Bouton "Fin de match"

### Carte des tirs (CourtMap)
- Terrain SVG avec parquet réaliste
- Clic = enregistre un tir (2pts/3pts auto-détecté)
- Modal de confirmation (réussi/raté)
- Marqueurs par quart-temps
- Menu "Gérer" pour effacer les marqueurs

### Temps de jeu
- Toggle "Sur le terrain" / "Sur le banc"
- Compteur temps de jeu et temps banc
- Stats par minute (pts/min, reb/min, ast/min)

### Historique
- Sauvegarde des matchs
- Filtre par match ou total
- Stats détaillées avec pourcentages de tirs
- Graphiques d'évolution et radar

### Play-by-play
- Chaque action enregistrée avec timestamp (Q2 5:30)
- Bouton "Annuler" dernière action
- Stats par quart-temps

## Commandes

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

## Hooks personnalisés (useStats.js)

- `useStats()` : gestion des stats + historique des actions
- `usePlayer()` : infos joueur
- `useTimer()` : timer avec quart-temps
- `usePlayingTime()` : temps de jeu sur terrain/banc
- `useMatchHistory()` : historique des matchs

## Logique des tirs

Les tirs réussis/ratés sont gérés intelligemment :
- **+1 réussi** → ajoute 1 réussi ET 1 tenté
- **-1 réussi** → retire 1 réussi (devient un raté)
- **+1 raté** → ajoute 1 tenté seulement
- **-1 raté** → retire 1 raté (si possible)

## localStorage keys

- `basketAppPin` : code PIN (encodé en base64)
- `basketStats` : stats du match en cours
- `basketActionHistory` : historique des actions
- `basketPlayer` : infos joueur
- `basketTimer` : état du timer
- `basketQuarterDuration` : durée d'un QT
- `basketMatchHistory` : historique des matchs
- `basketPlayingTime` : temps de jeu
- `basketBenchTime` : temps sur le banc
- `basketIsOnCourt` : sur terrain ou non

## sessionStorage keys

- `basketAppUnlocked` : état de déverrouillage de la session
