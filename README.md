# AsteroidsHarvest
Jeu "home made" de destruction d'astéroïdes

## Pitch
En l'année 2074, la race humaine doit fuir la Terre, devenue invivable suite à ses écarts écarts de conduite. Ayant vu arriver la catastrophe, l'humanité est tout de même parvenue à rendre possible les vols spaciaux habités de longue durée.

Seule une infime partie de la population mondiale a pu fuir l'apocalypse, mais l'humanité a survécu: depuis à présent 5 ans, le _StarShip Hope_ parcourt l'univers, portant à son bord 50 000 colons en quête d'un nouveau foyer.

Vous faites partie de ces derniers survivants. Affecté à la récolte des astéroïdes, votre travail consiste à découper les astéroïdes afin d'en extraire les minerais nécessaires à l'alimentation des systèmes de propulsion du _StarShip Hope_. A ce titre, vous disposez d'un vaisseau monoplace équipé d'un canon à plasma, capable d'expédier des boules de plasma confinées au sein d'un champ magnétique.

Le vaisseau doit changer de secteur de recherche prochainement: ce système planétaire ne comporte apparemment aucune planète apte à abriter la vie. Il est donc nécessaire de "faire le plein de carburant" avant de partir. Vous faites donc route vers la ceinture d'astéroïdes la plus proche... car vous avez bon espoir que la vente des minerais que vous aurez collecté, vous permettra de suffisamment améliorer votre vaisseau pour ne pas faire de cette mission, une mission suicide. 

## Manuel de jeu

### Contrôles atypiques
Nous sommes dans l'espace. Il n'y a donc aucun frottement. Un objet lancé ne ralentit pas de lui même. Une impulsion entraine donc une inertie sans fin, une dérive. Pour mettre fin à cette dérive, il vous faudra délivrer une impulsion équivalente dans le sens opposé.

Les premiers temps, il est fort probable que vous soyez déstabilisé: ne vous découragez pas, on s'y fait assez vite, finalement.

### Commandes du vaisseau récolteur
Le vaisseau se dirige à l'aide des touches fléchées du clavier:
  - la touche haut donne une impulsion dans le sens d'orientation du vaisseau
  - la touche bas donne une impulsion dans le sens opposé à l'orientation du vaisseau
  - la touche gauche fait pivoter le vaisseau vers la gauche
  - la touche droite fait pivoter le vaisseau vers la droite

La barre espace permet de tirer.

### Le magasin
Dans la barre couleur or, en haut de la fenêtre, est affiché le montant de vos économies. La monnaie ayant cours sur le _StarShip Hope_ est le Brouzouf.

De nombreuses (et indispensables) améliorations vous attendent ici alors ne vous en privez pas.

La sauvegarde de la partie s'effectue sous la forme d'un cookie (valide 400 jours, pour info alors pas de panique), ce qui implique notamment, que votre sauvegarde n'est valable que pour le navigateur web et l'appareil utilisés. Par exemple, si vous faites une sauvegarde en jouant sur votre PC avec le navigateur Edge, votre sauvegarde ne sera pas accessible, si vous jouez sur le même PC mais avec un navigateur web différent, ou si vous jouez sur un autre PC, quel que soit le navigateur utilisé.

## Description technique
Ce jeu a été entièrement fait à la main, si je puis dire, dans la mesure où il ne s'appuie sur aucun framework, aucune librairie.

Son code source est 100% web: il ne s'agit que de +HTML+ (structure des interfaces), de +CSS+ (mise en page) et de +javascript+ (moteur du jeu).

Un certain nombre de comportements du jeu, sont paramétrables via des constantes déclarées au début du fichier _main.js_.

Les éléments du magasin sont déclarés et paramétrés via un objet _scope_, rattaché au controller pricipal et initialisé dans le fichier _main.js_.

Le vaisseau, les astéroides ainsi que les bonus sont des composants web à part entière, héritant de _HTMLDivElement_

Le composant *RS_Dialog* de la RS WCL (publiée sur ce même compte GitHub) a été intégré pour les popups (magasin, demande de confirmation de sauvegarde et rapport de fin de vague)

La classe AH_Shop sert à lire, présenter et modifier les informations relatives au magasin et aux améliorations.

La classe AH_Timer, quant à elle, gère tout ce qui est lié au temps qui passe: c'est elle qui invoque les fonction de déplacement, contrôle les collisions, etc...

Parmi les trucs à revoir: au début, j'ai voulu utiliser la classe RS_WCL pour me simplifier la vie sur la création des composants du jeu (voir classe *AH_Spaceship* dans _AH_Components.js_), mais au final, je me suis rapidement rendu compte qu'il s'aggissait d'une erreur, dans ce contexte d'utilisation. En effet, la RS WCL est orientée templates HTML, or tous les éléments sont créés et gérés par le programme javascript. En revanche, il pourrait être opportun de gérer les templates dans *RS_Dialog* (permettre d'utiliser l'url d'un template HTML comme contenu d'une popup), pour se libérer du code de génération des popup (un peu indigeste, il faut bien le reconnaître).
