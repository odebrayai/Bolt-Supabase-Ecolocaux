# Intégration n8n - CRM Eco-Locaux

## Architecture du système

Le système utilise une architecture en trois parties :

1. **Application CRM (Bolt)** : Interface utilisateur qui lance les recherches
2. **n8n** : Plateforme d'automatisation qui effectue les recherches de commerces
3. **Supabase** : Base de données et Edge Functions pour stocker les résultats

### Flux de données

```
┌─────────────────┐
│  Application    │
│  CRM (Bolt)     │
│                 │
│  Page Recherche │
└────────┬────────┘
         │
         │ 1. Recherche (POST)
         │    - ville
         │    - type
         │    - max_results
         ▼
┌─────────────────┐
│      n8n        │
│                 │
│  Webhook        │
│  /eco-locaux-   │
│   search        │
└────────┬────────┘
         │
         │ 2. Scraping / API
         │    Recherche Google Maps
         │    ou autre source
         │
         │ 3. Résultats (JSON Array)
         ▼
┌─────────────────┐
│   Application   │
│   CRM (Bolt)    │
└────────┬────────┘
         │
         │ 4. Import (POST)
         │    Array de commerces
         ▼
┌─────────────────┐
│    Supabase     │
│  Edge Function  │
│  /import-       │
│   commerces     │
└────────┬────────┘
         │
         │ 5. Insertion DB
         ▼
┌─────────────────┐
│  Base de        │
│  données        │
│  Supabase       │
└─────────────────┘
```

### Détails de l'intégration

#### Étape 1 : Recherche via n8n
L'application envoie une requête POST au webhook n8n :
- **URL** : `https://n8n.srv1194290.hstgr.cloud/webhook/eco-locaux/recherche`
- **Body** : `{ ville, type, max_results }`

#### Étape 2 : Collecte des données
n8n effectue le scraping/recherche et retourne un tableau de commerces au format attendu

#### Étape 3 : Import dans Supabase
L'application envoie les résultats au webhook Supabase :
- **URL** : `https://anytyjvlbdnizyvefycc.supabase.co/functions/v1/import-commerces`
- **Body** : Array de commerces avec leurs détails

#### Étape 4 : Stockage
Le webhook Supabase valide et insère les commerces dans la base de données

## Webhook n8n de recherche

### URL du webhook de recherche
```
https://n8n.srv1194290.hstgr.cloud/webhook/eco-locaux/recherche
```

### Format de la requête
```json
{
  "ville": "Paris 75001",
  "type": "boulangerie",
  "max_results": 10
}
```

### Réponse attendue
Un tableau de commerces au format suivant :
```json
[
  {
    "nom": "Boulangerie du Coin",
    "type": "boulangerie",
    "adresse": "123 Rue de la Paix",
    "ville": "Paris",
    "code_postal": "75001",
    "telephone": "0123456789",
    "email": "contact@example.fr",
    "note_google": 4.5,
    "nb_avis": 120
  }
]
```

## Webhook Supabase d'import de commerces

### URL du webhook
```
https://anytyjvlbdnizyvefycc.supabase.co/functions/v1/import-commerces
```

### Méthode HTTP
`POST`

### Headers requis
```
Content-Type: application/json
```

## Format des données

### Import d'un seul commerce
```json
{
  "nom": "Nom du commerce",
  "type": "boulangerie",
  "adresse": "Adresse complète",
  "ville": "Nom de la ville",
  "code_postal": "75001",
  "telephone": "0123456789",
  "email": "contact@example.fr",
  "site_web": "https://example.fr",
  "facebook": "https://facebook.com/page",
  "instagram": "https://instagram.com/compte",
  "linkedin": "https://linkedin.com/company/page",
  "note_google": 4.5,
  "nb_avis": 120,
  "panier_moyen": 25.50,
  "statut": "a_contacter",
  "priorite": "haute",
  "notes": "Notes additionnelles"
}
```

### Import en batch (plusieurs commerces)
```json
[
  {
    "nom": "Commerce 1",
    "type": "restaurant",
    "adresse": "Adresse 1",
    "ville": "Paris",
    "code_postal": "75001"
  },
  {
    "nom": "Commerce 2",
    "type": "pizzeria",
    "adresse": "Adresse 2",
    "ville": "Lyon",
    "code_postal": "69002"
  }
]
```

## Champs

### Champs obligatoires
- `nom` (string) : Nom du commerce
- `type` (string) : Type de commerce
  - Valeurs possibles : `boulangerie`, `restaurant`, `pizzeria`, `poissonnerie`, `pressing`, `boucherie`
- `adresse` (string) : Adresse complète
- `ville` (string) : Ville
- `code_postal` (string) : Code postal

### Champs optionnels
- `telephone` (string) : Numéro de téléphone
- `email` (string) : Adresse email
- `site_web` (string) : URL du site web
- `facebook` (string) : URL de la page Facebook
- `instagram` (string) : URL du compte Instagram
- `linkedin` (string) : URL de la page LinkedIn
- `note_google` (number) : Note Google (0-5)
- `nb_avis` (number) : Nombre d'avis
- `panier_moyen` (number) : Panier moyen en euros
- `statut` (string) : Statut du commerce
  - Valeurs possibles : `a_contacter`, `rdv_pris`, `relance`, `gagne`, `perdu`
  - Défaut : `a_contacter`
- `priorite` (string) : Priorité du commerce
  - Valeurs possibles : `basse`, `normale`, `haute`
  - Défaut : `normale`
- `notes` (string) : Notes additionnelles

## Réponses

### Succès (200)
```json
{
  "success": true,
  "message": "X commerce(s) imported successfully",
  "data": [...]
}
```

### Erreur (400/500)
```json
{
  "success": false,
  "error": "Message d'erreur détaillé"
}
```

## Configuration n8n

### 1. Node HTTP Request
1. Ajouter un node "HTTP Request"
2. Configurer :
   - **Method** : POST
   - **URL** : `https://anytyjvlbdnizyvefycc.supabase.co/functions/v1/import-commerces`
   - **Authentication** : None
   - **Body Content Type** : JSON
   - **Body Parameters** : Votre objet JSON ou tableau

### 2. Exemple de workflow n8n

```
[Webhook/Trigger]
    ↓
[Fonction de transformation des données]
    ↓
[HTTP Request vers l'API]
    ↓
[Traitement de la réponse]
```

### 3. Mapping des données
Si vos données proviennent d'une source externe (API, Google Sheets, etc.), utilisez un node "Code" ou "Set" pour mapper les champs vers le format attendu.

Exemple de code dans un node "Code" :
```javascript
const items = $input.all();
const transformedItems = items.map(item => ({
  nom: item.json.name,
  type: item.json.category.toLowerCase(),
  adresse: item.json.address,
  ville: item.json.city,
  code_postal: item.json.postal_code,
  telephone: item.json.phone,
  email: item.json.email,
  note_google: parseFloat(item.json.rating),
  nb_avis: parseInt(item.json.review_count)
}));

return transformedItems.map(item => ({ json: item }));
```

## Conseils

1. **Validation des données** : Assurez-vous que le champ `type` correspond exactement à l'une des valeurs autorisées
2. **Format des notes** : La `note_google` doit être entre 0 et 5
3. **Import en batch** : Pour de meilleures performances, groupez vos imports (max recommandé : 100 commerces par requête)
4. **Gestion des erreurs** : Configurez un node de gestion d'erreur dans n8n pour traiter les échecs
5. **Rate limiting** : N'envoyez pas plus de 10 requêtes par seconde

## Test rapide avec cURL

```bash
curl -X POST "https://anytyjvlbdnizyvefycc.supabase.co/functions/v1/import-commerces" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test Commerce",
    "type": "boulangerie",
    "adresse": "123 Rue de Test",
    "ville": "Paris",
    "code_postal": "75001"
  }'
```

## Support

Pour toute question ou problème :
1. Vérifiez que tous les champs obligatoires sont présents
2. Vérifiez que les valeurs des champs `type`, `statut` et `priorite` sont valides
3. Consultez les logs de n8n pour les messages d'erreur détaillés
