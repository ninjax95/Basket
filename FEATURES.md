# Stats Basket - Documentation complète

## Table des matières

1. [Fonctionnalités](#fonctionnalités)
2. [Interface utilisateur](#interface-utilisateur)
3. [Règles de design](#règles-de-design)
4. [Formules et calculs](#formules-et-calculs)
5. [Synchronisation et sauvegarde](#synchronisation-et-sauvegarde)

---

## Fonctionnalités

### 1. Suivi des statistiques en temps réel

#### Statistiques d'attaque
| Stat | Description | Boutons |
|------|-------------|---------|
| **2PTS** | Tirs à 2 points | +/- (réussis/tentés) |
| **3PTS** | Tirs à 3 points | +/- (réussis/tentés) |
| **LF +** | Lancers francs réussis | +/- |
| **LF -** | Lancers francs ratés | +/- |
| **REB OFF** | Rebonds offensifs | +/- |
| **Passes** | Passes décisives | +/- |

#### Statistiques de défense
| Stat | Description | Boutons |
|------|-------------|---------|
| **REB DEF** | Rebonds défensifs | +/- |
| **Inter** | Interceptions (steals) | +/- |
| **Contres** | Blocks | +/- |
| **Pertes** | Pertes de balle (turnovers) | +/- |
| **Fautes** | Fautes personnelles | +/- |

### 2. Carte des tirs interactive

- **Terrain SVG** : Demi-terrain de basket avec parquet réaliste
- **Détection automatique** :
  - Zone 2 points : À l'intérieur de la ligne à 3 points
  - Zone 3 points : À l'extérieur (arc + corners)
- **Marqueurs visuels** :
  - Vert = Tir réussi
  - Rouge = Tir raté
  - Taille différente pour 2pts/3pts/LF
- **Actions** :
  - Clic = Nouveau tir (modal confirmation réussi/raté)
  - Annuler dernier tir
  - Effacer par quart-temps
  - Effacer tous les marqueurs

### 3. Timer de match

- **4 quart-temps** configurables (5, 8, 10, 12, 15 min)
- **Contrôles** :
  - Play/Pause
  - Reset quart-temps
  - Navigation QT précédent/suivant
  - Ajustement manuel (+/- 10s, +/- 1min)
- **Fin de match** : Confirmation puis sauvegarde

### 4. Score en direct

- **Score équipe** : Calculé automatiquement (2pts×2 + 3pts×3 + LF)
- **Score adversaire** : Saisie manuelle avec boutons +/-
- **+/- différentiel** : Calculé et affiché

### 5. Temps de jeu

- **Toggle terrain/banc** : Bascule entre sur le terrain et sur le banc
- **Chronométrage automatique** : Quand le timer tourne
- **Affichage** : Temps de jeu / Temps total
- **Réinitialisation** : À chaque nouveau match

### 6. Historique des actions (Play-by-play)

- Liste chronologique de toutes les actions
- Format : `[Q2 5:30] 3PTS réussi`
- **Suppression** : Clic sur une action = confirmation puis suppression
- **Synchronisation** : Met à jour automatiquement toutes les stats liées

### 7. Séries de réussite (Streaks)

- **En temps réel** :
  - 2+ tirs consécutifs = Affichage "🔥 X tirs d'affilée!" (animation pulsante)
  - Points cumulés de la série affichés
- **Record** : Meilleure série du match sauvegardée
- **Analyse** : Affichage du record par match et global

### 8. Stats avancées

| Stat | Nom complet | Formule | Interprétation |
|------|-------------|---------|----------------|
| **TS%** | True Shooting | `PTS / (2 × (FGA + 0.44 × FTA))` | >55% = Excellent |
| **GmSc** | Game Score | Voir section formules | >10 = Bon match |
| **PER** | Player Efficiency Rating | Version simplifiée | 15 = Moyenne NBA |
| **USG%** | Usage Rate | `(FGA + 0.44×FTA + TOV) / possessions` | % d'utilisation offensive |
| **+/-** | Plus/Minus | Score équipe - Score adversaire | Impact sur le jeu |

### 9. Historique des matchs

- **Liste des matchs** sauvegardés avec :
  - Date et adversaire
  - Domicile/Extérieur
  - Score final
  - Stats résumées
  - Badges records
- **Filtrage** : Par match ou tous les matchs
- **Suppression** : Avec confirmation
- **Replay** : Visualisation des tirs du match

### 10. Analyse et graphiques

#### Cartes des tirs
- **Heatmap marqueurs** : Position de tous les tirs
- **Heatmap thermique** : Zones chaudes (efficaces) / froides

#### Graphiques
- **Évolution** : Courbes points/rebonds/passes par match
- **Radar** : Profil de performance normalisé

#### Stats avancées
- TS%, GmSc, PER, USG%, +/-, Série record
- Par match ou moyennes globales

### 11. Mode hors-ligne (PWA)

- **Service Worker** : Cache tous les assets au premier chargement
- **Fonctionnement offline** : L'app fonctionne sans connexion
- **Installation** : Peut être installée sur l'écran d'accueil (web)

### 12. Synchronisation GitHub Gist

- **Sauvegarde** : Export de toutes les données vers un Gist
- **Restauration** : Import des données depuis le Gist
- **Données synchronisées** :
  - Historique des matchs
  - Infos joueur (nom, numéro)
  - Préférences

### 13. Authentification PIN

- Code PIN 4-6 chiffres
- Session persistante (sessionStorage)
- Protection de l'accès à l'app

### 14. Thème clair/sombre

- **Dark** : Fond #1a1a2e, accents cyan #61dafb
- **Light** : Fond clair, accents bleus
- Sauvegardé dans localStorage

---

## Interface utilisateur

### Onglets principaux

1. **Match** : Vue principale de jeu
2. **Historique** : Liste des matchs
3. **Analyse** : Graphiques et stats avancées
4. **Options** : Paramètres et sync

### Layout Match

```
┌─────────────────────────────────┐
│  [Logo]  Nom #Numéro   [?]      │  ← Header
├─────────────────────────────────┤
│       CARTE DES TIRS            │  ← Terrain SVG
│    (marqueurs de tirs)          │
│  [Annuler] [Gérer] [Historique] │
├─────────────────────────────────┤
│  ══════ ATTAQUE ══════          │
│  2PTS  3PTS  LF+  LF-  REB  PAS │  ← Stats attaque
├─────────────────────────────────┤
│  ══════ DÉFENSE ══════          │
│  REB   INT   CTR  PER  FAU      │  ← Stats défense
├─────────────────────────────────┤
│      TOTAL: XX PTS              │
│   🔥 X tirs d'affilée! (Y pts)  │  ← Streak (si actif)
├─────────────────────────────────┤
│  ▼ Plus d'options               │  ← Section dépliable
│    Timer, Score, Sauvegarder    │
├─────────────────────────────────┤
│ [Match] [Historique] [Analyse]  │  ← Navigation
└─────────────────────────────────┘
```

### Composants clés

- **StatCounter** : Bouton -/valeur/bouton +
- **Timer** : Affichage MM:SS avec contrôles
- **CourtMap** : Terrain SVG interactif
- **Modal confirmation** : Overlay avec boutons Oui/Non

---

## Règles de design

### Couleurs (thème dark)

| Élément | Couleur | Hex |
|---------|---------|-----|
| Fond principal | Bleu très foncé | `#1a1a2e` |
| Fond secondaire | Bleu foncé | `#16213e` |
| Accent principal | Cyan | `#61dafb` |
| Succès/Positif | Vert | `#2ecc71` |
| Erreur/Négatif | Rouge | `#e74c3c` |
| Streak/Hot | Orange | `#ff6b00` |
| Record/Best | Or | `#ffd700` |
| Texte principal | Blanc 90% | `rgba(255,255,255,0.9)` |
| Texte secondaire | Blanc 60% | `rgba(255,255,255,0.6)` |

### Typographie

- **Police** : System fonts (sans-serif)
- **Timer** : `'Courier New', monospace` (chiffres fixes)
- **Tailles** : Utilisation de `clamp()` pour le responsive

```css
/* Exemples de clamp() */
font-size: clamp(0.7rem, 2vw, 0.85rem);  /* Labels */
font-size: clamp(1.2rem, 4vw, 1.8rem);   /* Valeurs */
font-size: clamp(2rem, 8vw, 3rem);       /* Timer */
```

### Espacements

- **Gap grilles** : 8-12px (mobile), 15px (desktop)
- **Padding cartes** : 10-15px (mobile), 20px (desktop)
- **Border-radius** : 8-12px (boutons), 12-16px (cartes)

### Responsive breakpoints

```css
/* Mobile first, puis ajustements */
@media (max-width: 600px) {
  /* Styles mobiles spécifiques */
  grid-template-columns: repeat(3, 1fr);
}

@media (min-width: 601px) {
  /* Tablettes et desktop */
  grid-template-columns: repeat(5, 1fr);
}
```

### Animations

| Animation | Durée | Usage |
|-----------|-------|-------|
| fadeIn | 0.3s ease | Apparition pages |
| pulse | 1s infinite | Timer actif |
| streakPulse | 1.5s infinite | Série en cours |
| scale(0.95) | 0.1s | Feedback boutons |

### États visuels

- **Hover** : Fond plus clair, légère élévation
- **Active** : Scale 0.95, fond encore plus clair
- **Disabled** : Opacité 0.5, cursor not-allowed
- **Positif** : Fond vert transparent, bordure verte
- **Négatif** : Fond rouge transparent, bordure rouge

---

## Formules et calculs

### Points totaux
```
Points = (fg2Made × 2) + (fg3Made × 3) + ftMade
```

### True Shooting % (TS%)
```
TS% = Points / (2 × (FGA + 0.44 × FTA)) × 100

où:
- FGA = fg2Attempted + fg3Attempted
- FTA = ftAttempted
```

### Game Score (GmSc)
```
GmSc = PTS
     + 0.4 × FGM
     - 0.7 × FGA
     - 0.4 × (FTA - FTM)
     + 0.7 × ORB
     + 0.3 × DRB
     + STL
     + 0.7 × AST
     + 0.7 × BLK
     - 0.4 × PF
     - TOV
```

### PER (simplifié)
```
positiveActions = PTS + REB + AST + STL + BLK
negativeActions = missedFG + missedFT + TOV
totalActions = FGA + FTA + REB + AST + STL + BLK + TOV

PER = ((positiveActions - negativeActions) / totalActions) × 30
```

### Usage Rate (USG%)
```
offensiveUsage = FGA + 0.44 × FTA + TOV
estimatedPossessions = offensiveUsage + AST

USG% = (offensiveUsage / estimatedPossessions) × 100
```

### Séries (Streaks)
```
- Tir réussi (fg2Made, fg3Made, ftMade) → streak++
- Tir raté (fg2Attempted, fg3Attempted, ftAttempted) → streak = 0
- Autres actions → pas d'effet sur le streak
```

---

## Synchronisation et sauvegarde

### localStorage (automatique)

Toutes les données sont sauvegardées automatiquement :

| Clé | Contenu |
|-----|---------|
| `basketStats` | Stats du match en cours |
| `basketActionHistory` | Liste des actions |
| `basketPlayer` | {name, number} |
| `basketTimer` | État du timer |
| `basketQuarterDuration` | Durée QT (secondes) |
| `basketMatchHistory` | Tous les matchs sauvegardés |
| `basketPlayingTime` | Temps sur le terrain |
| `basketBenchTime` | Temps sur le banc |
| `basketIsOnCourt` | Boolean terrain/banc |
| `basketTheme` | "dark" ou "light" |
| `basketGithubToken` | Token GitHub (optionnel) |
| `basketGistId` | ID du Gist (optionnel) |
| `basketAppPin` | Code PIN encodé |

### GitHub Gist

Structure du fichier JSON sauvegardé :
```json
{
  "version": 1,
  "exportDate": "2025-01-17T...",
  "history": [...],
  "player": { "name": "...", "number": "..." }
}
```

### Export/Import manuel

- **Export** : Télécharge un fichier JSON
- **Import** : Charge un fichier JSON
- Disponible dans Options → Sauvegarde

---

## Notes techniques

### Performance
- Utilisation de `useMemo` et `useCallback` pour éviter les re-renders
- SVG optimisé pour le terrain
- Lazy loading des graphiques Recharts

### Compatibilité
- **Navigateurs** : Chrome, Firefox, Safari, Edge (modernes)
- **Mobile** : Android via Capacitor, iOS (non testé)
- **PWA** : Tous navigateurs supportant Service Workers

### Limitations connues
- Le PER est une version simplifiée (pas de données d'équipe)
- Les stats par quart-temps nécessitent le timer actif
- Le replay ne fonctionne qu'avec les marqueurs de tirs
