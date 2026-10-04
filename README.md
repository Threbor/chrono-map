# Chrono·Carte

**Faites défiler une frise d'événements et regardez la carte du monde se construire, dans l'espace et dans le temps.**

Chaque événement a une date, un lieu et une description. En parcourant la frise (à gauche), la carte (à droite) vole vers le lieu, plante une épingle et trace le lien depuis l'événement précédent. Petit à petit, le parcours complet se dessine.

Usage pédagogique avant tout (histoire, sciences, géographie), mais l'outil sert aussi à **mettre en perspective une enquête** : chaque déplacement est mesuré, et un contrôle de cohérence signale en rouge les trajets physiquement impossibles (un alibi qui ne tient pas, par exemple).

## Les trois frises intégrées

| Frise | Thème | Ce qu'elle montre |
| --- | --- | --- |
| **Le premier tour du monde** (1519 – 1522) | Histoire | L'expédition Magellan–Elcano, de Séville à Séville, avec la traversée du Pacifique sur le globe. |
| **À la conquête du ciel** (1783 – 2021) | Sciences & techniques | De la montgolfière d'Annonay au premier vol sur Mars ; des liens en pointillés relient les événements qui se font écho. |
| **L'affaire du chronographe Azur** (2025, fictive) | Enquête | Un vol à Genève, une fourgonnette jusqu'à Tanger, et l'alibi d'un suspect qui s'effondre : 111 km en 17 min. |

## Utilisation

- **Défiler** dans la frise : l'événement qui franchit la ligne de lecture devient l'événement actif.
- **Clavier** : `↓` / `↑` (ou `j` / `k`) pour avancer ou reculer, `espace` pour la lecture automatique, `O` pour la vue d'ensemble, `F` pour afficher toute la frise, `Début` / `Fin`.
- **Axe du temps** (en bas de la carte) : les écarts entre les points respectent la durée réelle qui sépare les événements. Cliquez sur un point pour y aller.
- **Épingles** : cliquez pour sauter à l'événement. Pleines = confirmé, cerclées = déclaratif, en pointillés = hypothèse.
- **Partage** : l'adresse suit votre position (`#/magellan/9`), il suffit de copier le lien.

## Créer sa propre frise

Dans le panneau, **Exporter cette frise** donne un modèle JSON ; modifiez-le puis **Importez-le**. Il est validé (messages d'erreur en français) et conservé dans le navigateur uniquement.

```jsonc
{
  "id": "ma-frise",                  // identifiant unique (sert dans l'URL)
  "title": "Titre",
  "subtitle": "Sous-titre",           // facultatif
  "intro": "Texte d'introduction",    // facultatif
  "theme": "Histoire",                // facultatif
  "accent": "#f2b84b",                // facultatif, couleur de la frise
  "defaultZoom": 5,                   // facultatif, zoom maximal par défaut
  "coherence": { "maxSpeedKmh": 250 },// facultatif, contrôle des trajets par acteur
  "credits": "Sources…",              // facultatif
  "events": [
    {
      "id": "depart",
      "date": "1519-08-10",           // "1891", "1522-05", "1903-12-17", "2025-03-14T23:41", "-0490"
      "title": "Titre de l'événement",
      "place": "Séville, Castille",
      "coords": [-5.99, 37.38],       // [longitude, latitude]
      "description": "Ce qu'il s'est passé.",
      "zoom": 6,                      // facultatif
      "approximate": true,            // facultatif, lieu approximatif
      "via": [[-20, 10]],             // facultatif, points de passage depuis l'événement précédent
      "route": [[-73.6, 40.7]],       // facultatif, trajectoire propre à l'événement (se termine à coords)
      "links": ["autre-id"],          // facultatif, liens en pointillés vers d'autres événements
      "actors": ["Personne A"],       // facultatif, présents physiquement (contrôle de cohérence)
      "certainty": "confirmed",       // facultatif : confirmed | reported | hypothesis
      "tags": ["Départ"]              // facultatif
    }
  ]
}
```

Les événements doivent être triés par date. Les heures sont des heures locales, sans fuseau.

## Architecture

```
src/
  domain/      Cœur métier, sans dépendance à l'interface (testé)
    types.ts     Modèle : Timeline, StoryEvent
    time.ts      Dates à précision variable, formats français, durées
    geo.ts       Grands cercles, antiméridien, distances
    story.ts     « Compilation » d'une frise : chemins, distances, cohérence par acteur
    validate.ts  Validation des fichiers importés
  data/        Les trois frises intégrées
  state/       Navigation (événement actif, lecture, URL, imports)
  features/
    map/       Globe MapLibre, fond de carte embarqué, tracés animés, épingles
    timeline/  Panneau des jalons et synchronisation avec le défilement
    hud/       Légende flottante, axe du temps, commandes
    library/   Choix de la frise, import / export
```

- **React 19 + TypeScript + Vite**, **MapLibre GL 5** en projection globe.
- **Fond de carte embarqué** (Natural Earth via `world-atlas`) : la carte s'affiche toujours, même hors ligne. Les détails (routes, villes, bâtiments, lacs) apparaissent en fondu au zoom : données OpenStreetMap servies en tuiles vectorielles par [OpenFreeMap](https://openfreemap.org), gratuit et **sans clé d'API**, stylisées dans `features/map/detailLayers.ts`.
- La logique métier est pure et testée ; les vues ne font que la projeter.

## Développement

```bash
npm install
npm run dev        # serveur de développement
npm test           # tests unitaires (Vitest)
npm run build      # vérification des types + build de production dans dist/
```

Déploiement : Vercel détecte Vite automatiquement (`vercel.json` fourni) ; aucune variable d'environnement ni clé d'API n'est nécessaire.

## Crédits

Géographie : [Natural Earth](https://www.naturalearthdata.com/) (domaine public). Fond détaillé : [OpenFreeMap](https://openfreemap.org), © [OpenMapTiles](https://www.openmaptiles.org/), © [OpenStreetMap](https://www.openstreetmap.org/copyright). L'affaire du chronographe Azur est un scénario fictif ; les personnes et la maison de ventes sont inventées.
