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
			scope.spaceship.angle -= ANGLE_STEP * AH_MainController.scope.game.radial_sensivity;
		if (scope.controls.rightPressed)
			scope.spaceship.angle += ANGLE_STEP * AH_MainController.scope.game.radial_sensivity;

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
	 * (multiplié par hitbox_size_coef si la propriété existe sur l'élément)
	 * 
	 * => Ne fonctionne parfaitement que sur des éléments parfaitement carés (largeur = hauteur)
	 */
	static testCollideSquareElements(element1, element2) {
		let infos1 = AH_Timer.getElementPositionnalInfos(element1);
		let infos2 = AH_Timer.getElementPositionnalInfos(element2);
		let deltaX = Math.abs(infos1.x - infos2.x),
			deltaY = Math.abs(infos1.y - infos2.y),
			distance = (deltaX**2 + deltaY**2) ** 0.5;

		// Si la distance entre les centres des deux disques est inférieure à la somme de leurs rayons, c'est qu'ils se chevauchent
		return (distance < infos1.hitbox_radius+infos2.hitbox_radius);
	}

	/**
	 * Retourne les informations positionnelles de l'élément HTML ciblé
	 * Utilisé dans les tests de collision
	 */
	static getElementPositionnalInfos(element) {

		// Les composants susceptibles de tourner se voient affecter une propriété "pixel_size" 
		//pour éviter d'avoir à compenser par calcul les débordements induits par la rotation
		let size = element.pixel_size;
		if (!size) {
			let box = element.getBoundingClientRect();
			size = box.width;
		}
		let radius_coef = element.hitbox_size_coef || 1;
		
		// On retourne un objet donnant le coef à appliquer à la taille 
		return {
			hitbox_radius: size/2 * radius_coef,
			x: element.x + (size / 2),
			y: element.y + (size / 2)
		};
	}
}

