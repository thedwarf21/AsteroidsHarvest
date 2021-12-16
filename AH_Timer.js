/********************************
 * Tout ce qui est lié au TIMER *
 ********************************/
class AH_Timer {

	/**
	 * Lance le timer
	 */
	static letsPlay() {
		if (!AH_MainController.scope.controls.paused) {
			AH_Timer.applyControls();
			AH_Timer.moveEverything();
			AH_Timer.testCollides();
		}
		setTimeout(AH_Timer.letsPlay, TIME_INTERVAL);
	}

	/**
	 * Applique les commandes actuellement pressées
	 */
	static applyControls() {
		let scope = AH_MainController.scope;

		// Gestion du temps de rechargement et du tir
		if (scope.game.beforeNextShot)
			scope.game.beforeNextShot--;
		else if (scope.controls.spacePressed) {
			document.getElementsByTagName("AH-SPACESHIP")[0].shoot();
			scope.game.beforeNextShot = AH_Shop.getShopAttributeValue("ASP");
		}

		// Gestion du contrôle de la rotation du vaisseau
		if (scope.controls.leftPressed)
			scope.spaceship.angle -= ANGLE_STEP;
		if (scope.controls.rightPressed)
			scope.spaceship.angle += ANGLE_STEP;

		// Conversion de l'angle en radian, pour utilisation des fonctions sinus et cosinus 
		//=> calcul de la modification de l'inertie horizontale et verticale par trigonométrie
		let angle_rad = scope.spaceship.angle * Math.PI / 180; // Conversion de l'angle en radians
		if (scope.controls.downPressed) {
		    scope.spaceship.deltaX -= Math.sin(angle_rad);
		    scope.spaceship.deltaY -= Math.cos(angle_rad);
		}
		if (scope.controls.upPressed) {
		    scope.spaceship.deltaX += Math.sin(angle_rad);
		    scope.spaceship.deltaY += Math.cos(angle_rad);
		}
	}

	/**
	 * Déclenche le mouvement de chaque élément
	 */
	static moveEverything() {
		document.getElementsByTagName("AH-SPACESHIP")[0].move();
		for (let shot of document.getElementsByClassName("shot"))
			shot.move();
		for (let asteroid of AH_MainController.scope.asteroids)
			asteroid.move();
		for (let bonus of AH_MainController.scope.bonusItems)
			bonus.move();
	}

	/**
	 * Effectue les tests de collision
	 */
	static testCollides() {
		let spaceship = document.getElementsByTagName("AH-SPACESHIP")[0];

		// Les astéroïdes sont impliqués dans tous les tests de collision (hors collecte d'un bonus)
		for (let asteroid of AH_MainController.scope.asteroids) {

			// Test de collision avec les tirs (on les parcourt tous)
			for (let shot of document.getElementsByClassName("shot")) {
				if (AH_Timer.testCollideSquareElements(shot, asteroid)) {
					asteroid.impact(shot.angle_rad, shot.power);
					shot.explode();
				}
			}

			// Contrôle de collision avec le vaisseau
			if (AH_Timer.testCollideSquareElements(spaceship, asteroid))
				spaceship.explode();
		}

		// Collecte des bonus
		for (let bonus of AH_MainController.scope.bonusItems) {
			if (AH_Timer.testCollideSquareElements(spaceship, bonus)) {
      			AH_MainController.scope.game.bonusCollected++;
				bonus.destroy();
			}
		}
	}
	
	/**
	 * Fonction permettant de tester la collision entre deux élément HTML positionnés en absolu
	 * La hitbox est un disque dont le rayon est la largeur de l'élément
	 * 
	 * => Ne fonctionne parfaitement que sur des éléments parfaitement carés (ou ronds, idéalement)
	 */
	static testCollideSquareElements(element1, element2) {
		// Coordonnées du centre des éléments
		let box1 = element1.getBoundingClientRect();
		let size1 = box1.width;
		let radius_coef1 = Object.hasOwnProperty(element1, "hitbox_size_coef") ? element1.hitbox_size_coef : 1;
		let x1 = box1.left + (box1.width / 2);
		let y1 = box1.top + (box1.height / 2);
		let box2 = element2.getBoundingClientRect();
		let size2 = box2.width;
		let radius_coef2 = Object.hasOwnProperty(element2, "hitbox_size_coef") ? element2.hitbox_size_coef : 1;
		let x2 = box2.left + (box2.width / 2);
		let y2 = box2.top + (box2.height / 2);

		// Récupération de la distance entre les centres, via le théorème de Pythagore 
		//=> si les disques se chevauchent, on retourne vrai.
		return Math.pow(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2), 0.5) 
					< (size1*radius_coef1/2) + (size2*radius_coef2/2);
	}
}

