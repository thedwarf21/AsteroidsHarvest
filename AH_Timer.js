/********************************
 * Tout ce qui est lié au TIMER *
 ********************************/
class AH_Timer {

	/**
	 * Lance le timer
	 */
	static letsPlay() {
		if (!AH_MainController.scope.controls.paused) {
			AH_Timer.__applyControls();
			AH_Timer.__moveEverything();
			AH_Timer.__testCollides();
		}
		setTimeout(AH_Timer.letsPlay, TIME_INTERVAL);
	}

	/**
	 * Applique les commandes actuellement pressées
	 */
	static __applyControls() {
		let scope = AH_MainController.scope;
		let spaceship = AH_MainController.spaceship;

		// Gestion du temps de rechargement et du tir
		if (scope.game.beforeNextShot)
			scope.game.beforeNextShot--;
		else if (scope.controls.spacePressed) {
			spaceship.shoot();
			scope.game.beforeNextShot = AH_Shop.getShopAttributeValue("ASP");
			AH_MainController.playAudio("shoot.mp3");
		}

		// Gestion du contrôle de la rotation du vaisseau
		if (scope.controls.leftPressed)
			spaceship.angle -= ANGLE_STEP * AH_MainController.scope.game.radial_sensivity;
		if (scope.controls.rightPressed)
			spaceship.angle += ANGLE_STEP * AH_MainController.scope.game.radial_sensivity;

		// Conversion de l'angle en radian, pour utilisation des fonctions sinus et cosinus 
		//=> calcul de la modification de l'inertie horizontale et verticale par trigonométrie
		let angle_rad = spaceship.angle * Math.PI / 180; // Conversion de l'angle en radians
		if (scope.controls.downPressed) {
		    spaceship.deltaX -= Math.sin(angle_rad);
		    spaceship.deltaY -= Math.cos(angle_rad);
		}
		if (scope.controls.upPressed) {
		    spaceship.deltaX += Math.sin(angle_rad);
		    spaceship.deltaY += Math.cos(angle_rad);
		}
	}

	/**
	 * Déclenche le mouvement de chaque élément
	 */
	static __moveEverything() {
		AH_MainController.spaceship.move();
		for (let shot of AH_MainController.shots)
			shot.move();
		for (let asteroid of AH_MainController.asteroids)
			asteroid.move();
		for (let bonus of AH_MainController.bonusItems)
			bonus.move();
	}

	/**
	 * Effectue les tests de collision
	 */
	static __testCollides() {
		let spaceship = AH_MainController.spaceship;

		// Les astéroïdes sont impliqués dans tous les tests de collision (hors collecte d'un bonus)
		for (let asteroid of AH_MainController.asteroids) {

			// Test de collision avec les tirs (on les parcourt tous)
			for (let shot of AH_MainController.shots) {
				if (shot.hitbox.checkCollide(asteroid.hitbox)) {
					asteroid.impact(shot.angle_rad, shot.power);
					shot.explode();
					AH_MainController.playAudio("explosion.mp3", EXPLOSION_AUDIO_TIME);
				}
			}

			// Contrôle de collision avec le vaisseau
			if (spaceship.hitbox.checkCollide(asteroid.hitbox)) {
				spaceship.explode();
				AH_MainController.stopMusicLoop();
				AH_MainController.playAudio("explosion.mp3", EXPLOSION_AUDIO_TIME);
			}
		}

		// Collecte des bonus
		for (let bonus of AH_MainController.bonusItems) {
			if (spaceship.hitbox.checkCollide(bonus.hitbox)) {
      			AH_MainController.scope.game.bonusCollected++;
				bonus.remove();
				AH_MainController.playAudio("coin.mp3");
			}
		}
	}
}

