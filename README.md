# AsteroidsHarvest
Jeu "home made" (en 10 jours) de destruction d'astéroïdes

Sur appareils mobiles, grâce à l'utilisation du fichier **manifest.json**, il est possible d'utiliser le jeu de la même manière qu'une application autonome (non garanti avec d'autres navigateurs web que Chrome mobile, pour le moment, mais cela devrait entrer prochainement dans les standards).

Pour ce faire, il vous suffit d'ouvrir [le jeu](https://thedwarf21.github.io/AsteroidsHarvest) dans un navigateur web, depuis votre appareil mobile. Ouvrez ensuite les options de la page (bouton affichant 3 points à la verticale, dans la barre d'outils) et choisissez l'option "Ajouter à l'écran d'accueil". Vous pourrez renommer le lien à votre convenance. Après validation, l'icône du jeu apparaît sur l'écran d'accueil de votre appareil avec le titre de votre choix, comme s'il s'agissait d'une application installée sur votre appareil. Lorsque vous l'ouvrez à l'aide de cette icône que vous venez de créer, la page s'affiche en plein écran, sans la barre d'outils et force l'orientation en paysage.

Comme dirait l'autre dans la série Futurama (Matt Groening) : "Bienvenue dans le monde de demain !!"

## Pitch
En l'année 2074, la race humaine doit fuir la Terre, devenue invivable suite à une catastrophe écologique. L'ayant vu arriver, l'humanité est tout de même parvenue à développer des technologies rendant possible les vols spaciaux habités de longue durée.

Seule une infime partie de la population mondiale a pu fuir l'apocalypse, mais l'humanité a survécu: depuis à présent 5 ans, le _StarShip Hope_ parcourt l'univers, portant à son bord 50 000 colons en quête d'un nouveau foyer.

Vous faites partie de ces derniers survivants. Affecté à la récolte des astéroïdes, votre travail consiste à découper les astéroïdes afin d'en extraire les minerais nécessaires à l'alimentation des systèmes de propulsion du _StarShip Hope_. A ce titre, vous disposez d'un vaisseau monoplace équipé d'un canon à plasma, capable d'expédier des boules de plasma confinées au sein d'un champ magnétique.

Le vaisseau doit changer de secteur de recherche prochainement: ce système planétaire ne comporte apparemment aucune planète apte à abriter la vie. Il est donc nécessaire de "faire le plein de carburant" avant de partir vers de nouveaux horizons. Vous faites donc route vers la ceinture d'astéroïdes la plus proche... car vous avez bon espoir que la vente des minerais que vous aurez collecté, vous permettra de suffisamment améliorer votre vaisseau pour ne pas faire de cette mission, une mission suicide. 

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

La touche 'P' permet de mettre le jeu en pause et d'ouvrir la fenêtre de paramètres.

Vos tirs, lorsqu'ils ne détruisent pas l'astéroïde touché, modifient sa tajectoire. Maîtriser cet aspect du jeu vous sera d'un grand secours.

### Le magasin
Dans la barre couleur or, en haut de la fenêtre, est affiché le montant de vos économies. La monnaie ayant cours sur le _StarShip Hope_ est le Brouzouf.

De nombreuses (et indispensables) améliorations vous attendent ici alors ne vous en privez pas.

Un bouton (roue dentée) permet d'ouvrir la fanêtre de paramètres.

### Paramètres du jeu

Depuis cette fenêtre vous pouvez sauvegarder la partie en cours ou charger la dernière sauvegarde. 

La sauvegarde de la partie s'effectue sous la forme d'un cookie (valide 400 jours, pour info alors pas de panique), ce qui implique notamment, que votre sauvegarde n'est valable que pour le navigateur web et l'appareil utilisés. Par exemple, si vous faites une sauvegarde en jouant sur votre PC avec le navigateur Edge, votre sauvegarde ne sera pas accessible, si vous jouez sur le même PC mais avec un navigateur web différent, ou si vous jouez sur un autre appareil, quel que soit le navigateur utilisé.

Il est possible depuis cette fenêtre, d'afficher/masquer les hitbox et de régler la sensibilité radiale (entre 112.5°/s et 337.5°/s : par défaut, 225°/s). 

## Compatibilité smartphone
Depuis son écriture initiale, le jeu a subi une mise à jour afin d'être jouable sur appareils mobiles (smartphones / tablettes). Des boutons de contrôle apparaîssent à l'écran et la gestion du positionnement des éléments a été modifiée afin de s'adapter au ratio de la fenêtre du navigateur, notamment pour détecter les sorties d'écran.

Il faudra cependant patienter avant de voir l'app se comporter comme une app classique (affichage plein écran sans l'UI du navigateur et vérouillage du mode paysage). En effet, le format *manifest.json* permettant ce genre de choses, en est au stade expérimental et n'est donc encore pas entré dans les standards.

Le moment venu, une nouvelle mise à jour incluant le fichier *manifest.json" sera livrée ;) je prévois d'y inclure un tuto expliquant comment mettre le jeu en raccourci sur vos appareils mobiles, afin que vous puissiez l'utiliser aussi facilement qu'une app téléchargée depuis le Google Play Store.

## Description technique
Ce jeu a été entièrement fait à la main, si je puis dire, dans la mesure où il ne s'appuie sur aucun framework, aucune librairie.

Son code source est 100% web: il ne s'agit que de *HTML* (structure des interfaces), de *CSS* (mise en page) et de *javascript* (moteur du jeu).

### Structuration et architecture du code
Un certain nombre de comportements du jeu, sont paramétrables via des constantes déclarées au début du fichier _main.js_.

Les éléments du magasin sont déclarés et paramétrés via un objet _scope_, rattaché au controller pricipal et initialisé dans le fichier _main.js_.

Le vaisseau, les astéroides ainsi que les bonus sont des composants web à part entière, héritant de _HTMLDivElement_. Pour être plus précis, ils héritent de _MobileGameElement_, une classe créée par mes soins, fédérant les attributs et comportements communs à tous les éléments mobiles du jeu, et héritant elle-même de _HTMLDivElement_.

Le composant *RS_Dialog* de la RS WCL (publiée sur ce même compte GitHub) a été intégré pour les popups (magasin, demande de confirmation de sauvegarde et rapport de fin de vague) et a subi une évolution permettant de générer une popup à partir d'un template HTML, afin de mieux compartimenter les couches MVC.

La classe *AH_Shop* sert à lire, présenter et modifier les informations relatives au magasin et aux améliorations.

La classe *AH_Timer*, quant à elle, gère tout ce qui est lié au temps qui passe: c'est elle qui invoque les fonction de déplacement, contrôle les collisions, etc...

### Le moteur de jeu générique
Vous trouverez, dans le fichier *rs_game_engine.js*, les classes constituant les prémicies d'un moteur de jeu générique, développé pour l'occasion (autant écrire directement du code "factorisable" lorsque cela s'avère possible).

#### La classe RS_Hitbox
Cette classe porte comme attribut les informations nécessaires aux tests de collision.

Les instances de cette classe embarquent également une méthode attendant un autre objet *RS_Hitbox* en paramètre, et effectuant le test de collision. Cette dernière est une méthode "d'aiguillage" appelant la méthode spécifique correspondant à la forme de chacune des hitbox.

Pour le moment, seules les hitbox circulaires sont gérées. L'implémentation des méthodes de test de collision permettant de gérer des hitbox rectangulaires viendra plus tard.

#### La classe RS_ViewPortCompatibility
Cette classe est chargée de la prise en charge du ratio de la fenêtre affichant le jeu. Elle doit simplement être instanciée lors de l'ouverture de la page. Le constructeur met en place un listener permettant de maintenir la compatibilité, suite à un redimensionnement de ladite fenêtre.

Elle convertit les coordonnées virtuelles exprimées en pixels, en coordonnées réelles exprimées en pourcentage de la taille de la fenêtre sur l'axe principal.

Pour ce faire, elle attend en paramètre du constructeur, l'axe principal et la taille virtuelle en pixels correspondant à l'axe en question. Le ratio de la fenêtre permet ensuite d'extrapoler la taille virtuelle de l'autre axe.

Par exemple, dans Asteroids Harvest, l'axe principal est l'axe Y et la hauteur virtuelle est de 600 pixels. Ce qui implique que:
* Les coordonnées sont exprimées en vh (pourcentage de la hauteur de la fenêtre)
* La largeur virtuelle est de 800 pixels en 4:3, ~1067 pixels en 16:9, etc... (tous ratios supportés, même non standards)
