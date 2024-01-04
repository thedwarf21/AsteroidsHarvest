//------------- Constantes --------------
// Dimensions de la fenêtre virtuelle (la largeur est calculée selon la hauteur et le ratio de l'écran)
const WINDOW_HEIGHT = 600;

// Paramétrage
const TIME_INTERVAL = 50;
const ANGLE_STEP = 11.25;

const SPACESHIP_SIZE = 50;
const SHOT_BASE_SIZE = 5;
const BASE_AST_SIZE = 15;
const BONUS_SIZE = 25;

const AUDIO_PATH = "sounds/";
const SHOP_MUSIC = "audiohub_impulsive.mp3";
const GAME_MUSIC = "audiohub_don-t-stop-rockin.mp3";
const SOUND_LIB = {
	victory: "victory.mp3",
	failure: "fail.mp3",
	shoot: "shoot.mp3",
	explosion: "explosion.mp3",
	lose: "defeat.mp3",
	money: "coin.mp3"
}
const DEFAULT_AUDIO_LASTING_TIME = 1000;
const EXPLOSION_AUDIO_TIME = 5000;

// La hitbox est un disque: les valeurs de ces constantes sont à adapter en fonction des image utilisés
// Le disque a pour rayon la largeur de l'élément HTML (qui est carré)
// => pour un rendu optimal, la hitbox ne doit pas trop déborder de l'image et inversement
const SPACESHIP_HITBOX_RADIUS_COEF = 0.6;
const AST_HITBOX_RADIUS_COEF = 0.8;

const BONUS_MULTIPLIER = 5;
const BONUS_MAX_SPEED = 8;  		// Vitesse max en pixel par intervalle, PAR AXE
const BONUS_LIFE_TIME = 200;		// Durée de vie d'un bonus en nombre d'intervalles => 200 à 50ms -> 10s
const BONUS_BLINK_START_AT = 60;    // Nombre d'intervalles de vie restant au bonus, en-dessous duquel il clignote => 60 x 50ms -> 3s

const BASE_AST_LIFE = 3;
const FIRST_ENCOUNTER_SIZE = 2;
const SIZE_COMPUTE_BASE = 3;
const NUMBER_OF_SUB_AST = 3;
const AST_SPAWN_ZONE_WIDTH = 100;
const AST_MAX_INITIAL_AXIAL_SPEED = 4;  // Vitesse initiale max, en pixel par intervalle
const AST_RADIAL_SPEED_DIVIDER = 1; // Soit X, la valeur => vitesse comprise entre -1/2X et 1/2X degré par intervalle
									//pour 5 sur un TIME_INTERVAL à 50ms => entre -2° et +2° par seconde
									//pour 1 sur un TIME_INTERVAL à 50ms => entre -10° et +10° par seconde

var debug = false;

//--------------------------- INITIALISATION ---------------------------

/**
 * Controller principal gérant le moteur du jeu
 */
class AH_MainController {

	// Accesseurs permettant d'accéder aux éléments du jeu
	static get spaceship() 	{ return document.getElementsByClassName("spaceship")[0]; }
	static get asteroids() 	{ return document.getElementsByClassName("asteroid"); }
	static get shots() 		{ return document.getElementsByClassName("shot"); }
	static get bonusItems()	{ return document.getElementsByClassName("bonus"); }
	static get hitboxes()	{ return document.getElementsByClassName("hitbox"); }

	// Fonction d'initialisation du controller principal
	static init() {
		document.currentController = AH_MainController;
		AH_MainController.scope = AH_GameInitializer.initial_scope;
		AH_GameInitializer.addKeyListeners();
	}

	// Fonction appelée lorsque la page est chargée
	static onLoad() {
		AH_MainController.ah_viewport = new RS_ViewPortCompatibility("y", WINDOW_HEIGHT);
		AH_GameInitializer.addTouchListeners();
		AH_GameInitializer.prepareGamepadControls();
		let home_screen = new AH_HomeScreen();
		AH_Timer.letsPlay();
	}

	//--------------------------- GESTION GAME WINDOW, PAUSE ET CHECK LEVEL END ---------------------------

	/**
	 * Met ou enlève la pause (construit / détruit l'écran de pause)
	 */
	static togglePause() {
		let controls = AH_MainController.scope.controls;
		if (!controls.paused)
			AH_MainController.showParameters();
	}

	/**
	 * Fonction injectant un HTMLElement dans "game_window"
	 */
	static addToGameWindow(element) {
		let game = document.getElementById("game-window");
		game.appendChild(element);
	}

	/**
	 * Fonction remettant l'affichage à 0
	 */
	static __clearGameWindow() {
		let spaceship = AH_MainController.spaceship;
		if (spaceship)
			spaceship.remove();
		let asteroids = AH_MainController.asteroids;
		for (let i=asteroids.length-1; i>=0; i--) {
			let ast = asteroids[i];
			ast.life_bar.remove();
			ast.remove();
		}
		let shots = AH_MainController.shots;
		for (let i=shots.length-1; i>=0; i--) {
			let shot = shots[i];
			shot.remove();
		}
		let bonusItems = AH_MainController.bonusItems; 
		for (let i=bonusItems.length-1; i>=0; i--) {
			let bonus = bonusItems[i];
			bonus.remove();
		}
	}

	/**
	 * Fonction démarrant la vague suivante
	 */
	static startWave() {
		AH_AudioManager.stopMusicLoop();
		AH_AudioManager.startMusicLoop(SHOP_MUSIC);
		AH_MainController.__clearGameWindow();

		// Créer les astéroïdes correspondant au niveau (Lvl)
		// ast. taille FIRST_ENCOUNTER_SIZE -> Lvl % SIZE_COMPUTE_BASE
		// ast. taille FIRST_ENCOUNTER_SIZE+1 -> (Lvl / SIZE_COMPUTE_BASE) % SIZE_COMPUTE_BASE
		// ast. taille FIRST_ENCOUNTER_SIZE+2 -> (Lvl / SIZE_COMPUTE_BASE / SIZE_COMPUTE_BASE) % SIZE_COMPUTE_BASE
		// ...
		// 
		// Si FIRST_ENCOUNTER_SIZE vaut 2 et SIZE_COMPUTE_BASE vaut 3
		// => Lvl 1 -> 1ast2; Lvl 2 -> 2ast2; Lvl 3 -> 1ast3; Lvl 4 -> 1ast2, 1ast3; Lvl 5 -> 2ast2, 1ast3;
		//    Lvl 6 -> 1ast4; Lvl 7 -> 1ast2, 1ast4; ...
		let level = AH_MainController.scope.game.level;
		let sizeUpgrade = 0;
		do {
			let asteroidNumber = level % SIZE_COMPUTE_BASE;
			for (let i=0; i<asteroidNumber; i++) {
				let asteroid = new AH_Asteroid(FIRST_ENCOUNTER_SIZE + sizeUpgrade);
				AH_MainController.addToGameWindow(asteroid);
			}

			level = Math.floor(level / SIZE_COMPUTE_BASE);
			sizeUpgrade++;
		} while (level > 0); 

		// Création du vaisseau, initialisé par défaut (centré et immobile)
		let spaceship = new AH_Spaceship();
		AH_MainController.addToGameWindow(spaceship);

		// Réinitialiser les compteurs (pour décompte final) puis démarrer le jeu
		AH_MainController.scope.game.tinyAstDestroyed = 0;
		AH_MainController.scope.game.bonusCollected = {};
		AH_MainController.scope.controls.paused = false;

	}

	/**
	 * A l'appel de cette fonction, s'il n'y a plus d'astéroïde, on déclenche la fin de niveau
	 * ==> à appeler lors de la destruction d'un astéroïde 
	 */
	static checkLevelEnd() {
		if (AH_MainController.asteroids.length == 0) {
			AH_MainController.scope.game.level++;
			AH_MainController.showWaveIncomesReport();
			AH_AudioManager.stopMusicLoop();
			AH_AudioManager.startMusicLoop(SOUND_LIB.victory, EXPLOSION_AUDIO_TIME);
		}
	}

	//--------------------------- VALEURS NUMERIQUE (random et affichage) ---------------------------

	/**
	 * Méthodes de génération de nombres aléatoires compris entre 0 et max_value, inclus
	 */
	static entierAleatoire(max_value) { return Math.round( AH_MainController.reelAleatoire(max_value) ); }
	static reelAleatoire(max_value) { return Math.random() * max_value; }

	/**
	 * Afin de rendre l'affichage plus lisible sur les valeurs très hautes,
	 * à partir de 10000 (10**4), la valeur sera exprimée en k => 10k
	 * à partir de 10000000 (10**7), la valeur sera exprimée en M => 10M
	 * à partir de 10000000000 (10**10), la valeur sera exprimée en B => 10B
	 * à partir de 10000000000000 (10**13), la valeur sera exprimée en T => 10T
	 */
	static intToHumanReadableString(value) {
		if (value > 10**13)
			return Math.floor(value / 10**12) + "T";
		if (value > 10**10)
			return Math.floor(value / 10**9) + "B";
		if (value > 10**7)
			return Math.floor(value / 10**6) + "M";
		if (value > 10**4)
			return Math.floor(value / 10**3) + "k";
		return value;
	}

	//--------------------------- GESTION DES POPUP (rapport de fin de niveau et paramètres) ---------------------------

	/**
	 * Fonction générant la boîte de dialogue présentant le détail des gains
	 * level_failed  boolean  permet de savoir si l'application du coef de lose est pertinent
	 */
	static showWaveIncomesReport(level_failed) {
		AH_MainController.scope.controls.paused = true;
		let popup = new RS_Dialog("report_dialog", "Rapport de vague", [], [], [], false, "tpl_report.html", function() {

			// Cette fonction anonyme s'exécute, juste après l'injection du template, dans le DOM
			let income_shop_level = AH_Shop.getShopAttributeValue("INC");
			let bonus_collected = AH_MainController.scope.game.bonusCollected;
			let bonus_income = (BONUS_MULTIPLIER * income_shop_level) * bonus_collected;
			let tiny_ast_destroyed = AH_MainController.scope.game.tinyAstDestroyed;
			let tiny_ast_income = income_shop_level * tiny_ast_destroyed;
			let total_income = level_failed
							 ? Math.floor((bonus_income + tiny_ast_income) * AH_Shop.getShopAttributeValue("REC"))
							 : bonus_income + tiny_ast_income;

			// Affichage des données et mise à jour des éléments calculés
			AH_MainController.scope.game.money += total_income;
			AH_SaveManager.saveGame();
			document.getElementById("bonus_collected").innerHTML = AH_MainController.scope.game.bonusCollected;
			document.getElementById("bonus_income").innerHTML = AH_MainController.intToHumanReadableString(bonus_income);
			document.getElementById("tiny_ast_destroyed").innerHTML = AH_MainController.scope.game.tinyAstDestroyed;
			document.getElementById("tiny_ast_income").innerHTML = AH_MainController.intToHumanReadableString(tiny_ast_income);
			document.getElementById("total_income").innerHTML = AH_MainController.intToHumanReadableString(total_income);

			// Cas particulier de la section pertes: uniquement présentée en cas de crash du vaisseau
			if (level_failed)
				document.getElementById("loss_rate").innerHTML = Math.round((1 - AH_Shop.getShopAttributeValue("REC")) * 100);
			else {
				let lossSectionDivs = document.getElementsByClassName("loss-section");
				for (let div of lossSectionDivs)
					div.style.opacity = 0;
			}
			
			// Application de la fonction de fermeture au bouton
			document.getElementById("btn_close").addEventListener("click", ()=> {
				popup.closeModal();
				setTimeout(function () { AH_Shop.show(); }, 750);
			});
		});
		document.body.appendChild(popup);
	}

	/**
	 * Affiche la popup de réglage des paramètres
	 */
	static showParameters() {
		let was_paused = AH_MainController.scope.controls.paused;
		AH_MainController.scope.controls.paused = true;
		let popup = new RS_Dialog("report_dialog", "Paramètres utilisateur", [], [], [], false, "tpl_parameters.html", function() {

			// Affichage du bouton de paramétrage des contrôles manette uniquement si manette paramétrée
			if(!AH_MainController.scope.gamepadControlsUI)
				popup.querySelector("#btn_gamepad_controls").remove();
			
			// Binding affichage des hitbox
			new RS_Binding({
				object: AH_MainController.scope.game,
				property: "showHitboxes"
			}).addBinding(popup.querySelector("#show_hitboxes"), "checked", "change", function() {
				for (let hitbox of AH_MainController.hitboxes)
					hitbox.style.opacity = AH_MainController.scope.game.showHitboxes ? "1" : "0";
			});

			// Binding de la sensibilité radiale
			new RS_Binding({
				object: AH_MainController.scope.game,
				property: "radial_sensivity"
			}).addBinding(popup.querySelector("#radial_sensivity"), "value", "change");

			// Binding sons on/off
			new RS_Binding({
				object: AH_MainController.scope.game,
				property: "sound_fx_on"
			}).addBinding(popup.querySelector("#sound_fx_on"), "checked", "change");

			// Binding musique on/off
			new RS_Binding({
				object: AH_MainController.scope.game,
				property: "music_on"
			}).addBinding(popup.querySelector("#music_on"), "checked", "change", function() {
				if (AH_MainController.scope.game.music_on) {
					let music_loop_filename = was_paused ? GAME_MUSIC : SHOP_MUSIC; // si le jeu était en pause avant ouverture des paramètres, c'est qu'on est dans le magasin, sinon on est en jeu => musique différente
					AH_AudioManager.startMusicLoop(music_loop_filename);
				} else AH_AudioManager.stopMusicLoop();
			});

			// Gestion du clic sur les boutons de sauvegarde et de chargement
			popup.querySelector("#btn_close").addEventListener("click", ()=> {
				popup.closeModal();
				AH_SaveManager.saveGame();
				if (!was_paused)
					AH_MainController.scope.controls.paused = false;
			});
		});
		document.body.appendChild(popup);
	}
}
