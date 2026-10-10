# Publication Google Play — Stats Basket

Tout ce qu'il faut pour remplir la Play Console. Les fichiers sont dans ce dossier `store/`.

## Fichiers

| Élément Play Console | Fichier |
|---|---|
| App bundle (version 1.8, versionCode 9) | `StatsBasket-1.8.aab` (non versionné dans git, reconstruit à chaque version) |
| Icône 512×512 | `icon-512.png` |
| Image de présentation 1024×500 | `feature-graphic.png` |
| Captures téléphone 1080×1920 (2 à 8) | `screenshots/1-match.png` … `5-adversaires.png` (+ `0-connexion.png` en option) |
| Source de l'icône | `icon.svg` (regénérer : voir CLAUDE.md) |

Clé d'importation (upload key) : `.secrets/upload-keystore.jks` + `.secrets/keystore.properties`
(dans kDrive, hors git). Empreinte SHA-256 :
`FF:96:BC:43:A5:43:E8:DC:D8:9B:09:45:F8:CF:5F:10:90:5B:33:20:3F:BD:3F:09:A9:B8:08:A4:46:54:2D:41`.
Avec la signature d'application Play (activée par défaut), Google garde la clé de signature finale :
si la clé d'importation est perdue, elle peut être réinitialisée via le support Play.

## Fiche du Store

**Nom de l'application** (30 car. max)
> Stats Basket

**Description courte** (80 car. max)
> Les stats de ton joueur de basket en direct : tirs, rebonds, passes, analyses.

**Description complète** (4000 car. max)
> Stats Basket suit les statistiques d'un joueur de basket pendant le match, directement depuis le bord du terrain.
>
> 🏀 EN MATCH
> • Tirs à 2 points, 3 points et lancers francs, réussis ou ratés, en un geste
> • Rebonds offensifs et défensifs, passes décisives, interceptions, contres, pertes de balle, fautes
> • Carte des tirs interactive sur le terrain
> • Score en direct, chronomètre et quart-temps, temps de jeu sur le terrain et sur le banc
> • Séries de réussite et effets visuels pour suivre les temps forts
> • L'écran reste allumé pendant que le chrono tourne
>
> 📈 APRÈS LE MATCH
> • Historique complet par saison, avec comparaison de matchs
> • Stats avancées : True Shooting %, Game Score, PER, Usage, +/-
> • Cartes des tirs et zones chaudes/froides, graphiques d'évolution, radar de performance
> • Stats par adversaire, records personnels, objectifs
> • Badges à débloquer : 20 points, double-double, 3 tirs à 3 points…
> • Image « bilan de saison » à partager
>
> 👨‍👩‍👦 POUR LES PARENTS ET LES COACHS
> • Plusieurs joueurs par compte
> • Synchronisation automatique entre téléphone, tablette et ordinateur
> • Fonctionne sans réseau au gymnase : tout est envoyé au retour de la connexion
> • 16 thèmes au choix
>
> 🔒 VIE PRIVÉE
> Pas de publicité, pas de pistage. Les données sont hébergées dans l'Union européenne et peuvent être supprimées à tout moment depuis l'application.

**Catégorie** : Sports · **Tags** : basketball, statistiques, sport

**Coordonnées** : e-mail `jaxmaj@gmail.com` (affiché publiquement sur la fiche — à remplacer par une adresse dédiée si besoin, et dans `public/confidentialite.html` + `public/suppression-compte.html`)

**Règles de confidentialité (URL)** : https://stats-basket-2517f.web.app/confidentialite.html

## Contenu de l'application (formulaires)

**Accès à l'application** → « Tout ou partie des fonctionnalités sont soumises à restrictions » → identifiants :
voir `.secrets/compte-revue-google-play.txt` (compte de démonstration avec 12 matchs fictifs).
Instructions : « Se connecter avec l'e-mail et le mot de passe fournis. Aucune autre étape. »

**Annonces** : Non, l'application ne contient pas d'annonces.

**Classification du contenu** (questionnaire IARC) : catégorie « Toutes les autres applications » (pas jeu).
Réponses : violence, sexualité, langage, substances, jeux d'argent → Non. Interaction entre utilisateurs → Non
(aucun partage entre comptes). Partage de la position → Non. Achats numériques → Non (pour l'instant).
Résultat attendu : PEGI 3 / Tout public.

**Public cible et contenu** : tranches d'âge **18 ans et plus** uniquement (les parents saisissent les stats).
L'app n'attire pas spécialement les enfants → Non.

**Application d'actualités** : Non. **Applis gouvernementales** : Non. **Fonctionnalités financières** : Aucune.
**Santé** : Non. **Applis VPN / COVID** : Non.

**Sécurité des données** :
- Collecte ou partage de données : **Oui, collecte**. Partage avec des tiers : **Non** (Firebase = sous-traitant).
- Toutes les données sont chiffrées en transit : **Oui**.
- Les utilisateurs peuvent demander la suppression : **Oui** → URL : https://stats-basket-2517f.web.app/suppression-compte.html
- Création de compte : **Nom d'utilisateur (e-mail) et mot de passe**.
- Types de données collectées :

| Type | Collectée | Partagée | Facultative | Finalité |
|---|---|---|---|---|
| Informations personnelles › Adresse e-mail | Oui | Non | Non (obligatoire) | Fonctionnement de l'appli, Gestion du compte |
| Informations personnelles › Nom (nom/surnom du joueur) | Oui | Non | Non | Fonctionnement de l'appli |
| Activité dans les applis › Autre contenu généré par l'utilisateur (stats de match, notes) | Oui | Non | Non | Fonctionnement de l'appli |

  Photos : **non collectées** (restent sur l'appareil). Pas de localisation, contacts, identifiants publicitaires,
  ni données de diagnostic/analyse.

## Étapes Play Console

1. Créer le compte développeur : https://play.google.com/console/signup (25 $, compte **personnel**,
   vérification d'identité). L'e-mail de contact public est demandé ici.
2. **Créer une application** : nom « Stats Basket », langue par défaut Français (France), Application, Gratuite.
3. Remplir « Configurer votre application » avec les réponses ci-dessus, puis la **fiche principale**
   (textes + images de ce dossier).
4. **Tests › Test fermé** : créer une piste, importer `StatsBasket-1.8.aab`, ajouter une liste de testeurs
   (adresses Gmail) — compte personnel : **au moins 12 testeurs inscrits pendant 14 jours d'affilée** avant de
   pouvoir demander l'accès à la production.
5. Partager le lien d'inscription aux testeurs (famille, club, coéquipiers) : ils doivent accepter puis installer
   l'app depuis le Play Store.
6. Après 14 jours : **Demander l'accès à la production** (questionnaire sur le test), puis publier.

⚠️ L'APK installée depuis GitHub (clé de debug) et celle du Play Store ont des signatures différentes :
désinstaller l'APK GitHub avant d'installer la version Play (les matchs sont en ligne, rien n'est perdu ;
les photos locales, elles, seraient perdues).
