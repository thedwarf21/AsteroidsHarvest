# AsteroidsHarvest
Jeu "home made" de destruction d'astéroïdes

## Pitch
En l'année 2074, la race humaine doit fuir la Terre, devenue invivable suite à ses écarts écarts de conduite. Ayant vu arriver la catastrophe, l'humanité est tout de même parvenue à rendre possible les vols spaciaux habités de longue durée. Seule un infime partie de la population mondiale a pu fuir l'apocalypse, mais l'humanité a survécu. 

## Description technique

Ce jeu a été entièrement fait à la main, si je puis dire, dans la mesure où il ne s'appuie sur aucun framework, aucune librairie.

Son code source est 100% web : il ne s'agit que de HTML, de CSS et de javascript.

Un certain nombre de comportements du jeu, sont paramétrables via des constantes déclarées au début du fichier _main.js_

Les éléments du magasin sont déclarés et paramétrés via un objet _scope_, rattaché au controller pricipal et initialisé dans le fichier _main.js_

Le vaisseau, les astéroides ainsi que les bonus sont des composants web à part entière, héritant de <div></div>

Le composant <rs-dialog></rs-dialog> de la RS WCL (publiée sur ce même compte GitHub) a été intégré pour les popups (magasin, demande de confirmation de sauvegarde et rapport de fin de vague)
