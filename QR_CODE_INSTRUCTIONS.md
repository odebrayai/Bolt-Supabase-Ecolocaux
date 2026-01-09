# QR Code Eco-Locaux - Instructions pour la Présentation

## Accès au QR Code

Pour accéder à la page du QR code pendant votre présentation, utilisez l'une de ces deux méthodes :

### Méthode 1 : URL directe
Ajoutez `?qr=true` à l'URL de votre application :
```
https://ecolocaux-olivier.bolt.host?qr=true
```

### Méthode 2 : Signet navigateur
Créez un signet dans votre navigateur avec l'URL ci-dessus pour un accès rapide.

## Fonctionnalités disponibles

Sur la page QR Code, vous pouvez :
- **Afficher le QR code** en grand format pour que votre audience puisse le scanner
- **Télécharger** le QR code en format PNG haute résolution (1024x1024px)
- **Partager** le lien directement depuis votre navigateur

## Conseils pour la présentation

1. **Avant la présentation** :
   - Ouvrez l'URL `https://ecolocaux-olivier.bolt.host?qr=true` dans un onglet séparé
   - Téléchargez le QR code PNG si vous souhaitez l'intégrer dans votre présentation PowerPoint/PDF
   - Testez le scan du QR code avec votre smartphone

2. **Pendant la présentation** :
   - Appuyez sur **F11** pour mettre le navigateur en plein écran
   - Le QR code sera affiché en grand format sur votre écran de présentation
   - Les participants peuvent scanner directement depuis l'écran ou depuis un document imprimé

3. **Pour impression** :
   - Téléchargez le PNG et imprimez-le en A4 pour une distribution physique
   - Le QR code est optimisé avec un niveau de correction d'erreur élevé (H)

## Informations techniques

- **URL cible** : https://ecolocaux-olivier.bolt.host
- **Niveau de correction** : H (High - 30% de récupération d'erreur)
- **Format téléchargeable** : PNG 1024x1024px
- **Accessible sans authentification** : Oui, parfait pour les présentations publiques

## Questions fréquentes

**Q : Le QR code nécessite-t-il une connexion pour être consulté ?**
R : Non, le QR code est affiché directement. Seule l'application cible nécessite une connexion internet.

**Q : Puis-je personnaliser le QR code ?**
R : Le design actuel est optimisé pour la lisibilité. Le code source est disponible dans `src/pages/QRCode.tsx` si vous souhaitez le personnaliser.

**Q : Que faire si le QR code ne scanne pas correctement ?**
R : Assurez-vous d'avoir suffisamment de lumière et que le QR code est affiché net à l'écran. Le bouton "Partager" permet également de copier directement le lien.
