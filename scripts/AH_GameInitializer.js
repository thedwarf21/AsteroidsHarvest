class AH_GameInitializer {

	/*
	 * Initialisation par défaut => le scope du controller principal est initialisé avec ses attributs, au lancement du jeu
	 * 		Les données correspondant à la partie (attribut "game") sont mis à jour au fil de l'eau
	 * 		L'attribut "controls" permet au timer d'accéder rapidement à l'état des touches de contrôle
	 * 		L'attribut "shop" permet l'affichage et la gestion par le programme, du magasin d'améliorations (prix, effets)
	 * 		  il permet également de stocker le niveau d'amélioration courant, pour chacune d'entre elle
	 */
	static get initial_scope() {
		return {
			asteroids: [],
			bonusItems: [],
			game: {
				money: 0,
				level: 1,
				save_slot: 1,
				beforeNextShot: 0,
				tinyAstDestroyed: 0,
				bonusCollected: 0,
				sound_fx_on: true,
				music_on: true,
				showHitboxes: false,
				radial_sensivity: 1
			},
			controls: {
				upPressed: false,
				downPressed: false,
				rightPressed: false,
				leftPressed: false,
				spacePressed: false,
				paused: true
			},
			shop: [{
				nom: "Techniques de rafinage",
				code: "INC",
				description: "Vous extrayez plus de minerais des asteroïdes que vous réduisez en poussière.",
				lbl_effect: "Revenus par petit astéroïde détruit",
				level_0_effect: 10,
				upgrade_value: 10,
				level_1_price: 300,
				level_2_price_coef : 1.5,
				level: 0
			}, {
				nom: "Equipes de récupération",
				code: "REC",
				description: "Vos équipes de récupération sont plus minutieuses: vous perdez moins de butin lorsque vous percutez un astéroïde.",
				lbl_effect: "Pourcentage de butin récupéré après un crash",
				show_multiplicator: 100,
				level_0_effect: 0.5,
				upgrade_value: 0.05,
				max_level: 5,
				level_1_price: 1000,
				level_2_price_coef : 1.5,
				level: 0
			}, {     
				nom: "Déluge de balles",
				code: "ASP",
				description: "Améliorez les systèmes de refroidissement de vos canons pour augmenter la cadence de tirs.",
				lbl_effect: "Temps de rechargement de l'arme (ms)",
				max_level: 6,
				show_multiplicator: TIME_INTERVAL,
				level_0_effect: 15,
				upgrade_value: -2,
				level_1_price: 400,
				level_2_price_coef : 1.5,
				level: 0
			}, {
				nom: "Tirs véloces",
				code: "VEL",
				description: "Des projectiles plus rapides pour une meilleure précision.",
				lbl_effect: "Vitesse des projectiles (m/s)",
				max_level: 10,
				level_0_effect: 3,
				upgrade_value: 1,
				level_1_price: 200,
				level_2_price_coef : 1.5,
				level: 0
			}, {
				nom: "Tirs puissants",
				code: "POW",
				description: "Des projectiles plus gros occasionnant plus de dégats.",
				lbl_effect: "Multiplicateur de dégats",
				value: [1, 1.5, 2, 2.5, 3],
				price: [300, 400, 700, 1100],
				level_0_effect: 1,
				upgrade_value: 0.5,
				level_1_price: 500,
				level_2_price_coef : 1.5,
				level: 0
			}]
		};
	}

	/**
	 * Ajoute les listeners "keyDown" et "keyUp", pour les contrôles au clavier
	 */
	static addKeyListeners() {
		window.addEventListener('keydown', function(e) {
			let controls = AH_MainController.scope.controls;
			if (e.code == "ArrowDown")
				controls.downPressed = true;
			else if (e.code == "ArrowUp")
				controls.upPressed = true;
			else if (e.code == "ArrowLeft")
				controls.leftPressed = true;
			else if (e.code == "ArrowRight")
				controls.rightPressed = true;
			else if (e.code == "Space")
				controls.spacePressed = true;
			else if (e.code == "KeyP") 
				AH_MainController.togglePause();
		});
		window.addEventListener('keyup', function(e) {
			let controls = AH_MainController.scope.controls;
			if (e.code == "ArrowDown")
				controls.downPressed = false;
			if (e.code == "ArrowUp")
				controls.upPressed = false;
			if (e.code == "ArrowLeft")
				controls.leftPressed = false;
			if (e.code == "ArrowRight")
				controls.rightPressed = false;
			if (e.code == "Space")
				controls.spacePressed = false;
		});
	}

	/**
	 * Ajoute les listeners "touchStart" et "touchEnd", pour les contrôles via les boutons du HUD
	 */
	static addTouchListeners() {
		let controls = AH_MainController.scope.controls;
		document.querySelector('.button.left').addEventListener('touchstart', 		function(e) { controls.leftPressed = true; });
		document.querySelector('.button.left').addEventListener('touchend', 		function(e) { controls.leftPressed = false; });

		document.querySelector('.button.right').addEventListener('touchstart', 		function(e) { controls.rightPressed = true; });
		document.querySelector('.button.right').addEventListener('touchend', 		function(e) { controls.rightPressed = false; });
		
		document.querySelector('.button.forward').addEventListener('touchstart', 	function(e) { controls.upPressed = true; });
		document.querySelector('.button.forward').addEventListener('touchend', 		function(e) { controls.upPressed = false; });
		
		document.querySelector('.button.backward').addEventListener('touchstart', 	function(e) { controls.downPressed = true; });
		document.querySelector('.button.backward').addEventListener('touchend', 	function(e) { controls.downPressed = false; });
		
		document.querySelector('.button.fire').addEventListener('touchstart', 		function(e) { controls.spacePressed = true; });
		document.querySelector('.button.fire').addEventListener('touchend', 		function(e) { controls.spacePressed = false; });
		
		document.querySelector('.hud .pause').addEventListener('click', 			function(e) { AH_MainController.togglePause(); });
	}
}