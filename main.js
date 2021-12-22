//##################################
//# Liste des idées d'amélioration #
//##################################
//------------------------------------------ Interface et fonctionnalités ------------------------------------------ 
// 
//  - Modifier les paramètres afin que le jeu soit plus dynamique, dès le départ
//
//	- Trouver un illustrateur pour:
//  	* Mettre en place une introduction, présentant le pitch
//	    * Mettre en place un écran titre => "Paramètres" (sauvegarde, chargement, etc.) et "Jouer"
//  	
//  - Mettre en place un second mode de jeu "Arcade", le mode de jeu d'origine serait bâptisé "Mode Infini":
//  	* Pitch (alternative du pitch d'origine):
//  			Une armée d'aliens belliqueux prend en chasse le StarShip Hope. Malheureusement, les réserves de minerais 
//  		sont insuffisantes pour quitter la zone.
//  		
//  			En désespoir de cause, le StarShip Hope s'enfonce dans une ceinture d'astéroïdes pour tenter de perdre 
//  		l'assaillant tout en reconstituant son stock de minerais afin de s'éloigner au plus vite de la menace.
//  	* Ce qui change:
//  		Les vagues deviennent des jours
//  		Après un jour, on passe au jour suivant, même en cas de crash => toujours plus d'astéroïdes
//  		Niveau final avec un boss de fin, à un "jour du jeu" donné (ce pourrait être 10, par exemple)
//  		Pas de magasin dans ce mode là: votre vaisseau récupérateur est au même niveau d'améliorations qu'en Mode Infini
//  			=> Faire en sorte que la difficulté s'adapte à l'équipement du joueur ;)
// 
//------------------------------------------ Optimisations, maintenabilité et scallabilité ------------------------------------------ 
//
//  - Création d'un fichier RS_GameEngine regroupant les fonctions factorisables liés au moteur de jeu,
//   notamment une classe RSGE_Hitbox portant:
//   	* la forme de la hitbox (valeur numérique définie par constante statique - impossible en javascript mais...)
//   			=> déclaration: 	static get NOM_CONSTANTE() { return 42; }
//   			   accès:      		RSGE_Hitbox.NOM_CONSTANTE  // sortie: 42
//   			=> accès en lecture, comme pour une constante => objectif atteint
//   	* les paramètres liés à la forme (rayon et coordonnées du centre pour le cercle, par exemple)
//   	* une fonction checkCollide(RSGE_Hitbox hitbox)
//   => Les composants devront implémenter une méthode getHitbox() retournant un objet de type RSGE_Hitbox
//   => La fonction testant toutes les collision dans AH_Timer(), utilisera les fonctions getHitbox() des composants 
//     et checkCollide() des hitbox ainsi obtenues pour tester les collisions

/**
 * EN COURS:
 */

// Constantes
const QUESTION_COOKIES = `<p>Le jeu se sauvegarde sous forme de cookie.</p>
						  <p>Nous n'y stockerons aucune donnée sensible: seulement votre progression dans le jeu.</p>
						  <p>Nous devons simplement vous demander confirmation avant d'effectuer cette opération</p>
						  <p>Consentez-vous à nourir votre navigateur avec un cookie bio ?</p>`;
const SAVE_ERROR_MSG = `<p>Le système de sauvegarde de ce jeu utilise les cookies.</p>
						<p>Afin que celui-ci fonctionne, il est donc nécessaire de les accepter.</p>
						<p>Pour ce faire, il vous suffit de cocher la case portant l'intitulé "Accepter les cookies:"
						puis de confirmer en cliquant sur le bouton vert indiquant "Oui, je le veux"</p>`;
const TIME_INTERVAL = 50;
const ANGLE_STEP = 11.25;
const SAVE_EXPIRATION_DAYS = 400;	// Nombre de jours d'expiration appliqués au cookie de sauvegarde

const WINDOW_WIDTH = 800;
const WINDOW_HEIGHT = 600;

const SPACESHIP_SIZE = 50;
const SHOT_BASE_SIZE = 5;
const BASE_AST_SIZE = 15;
const BONUS_SIZE = 25;

// La hitbox est un disque: les valeurs de ces constantes sont à adapter en fonction des image utilisés
// Le disque a pour rayon la largeur de l'élément HTML (qui est carré)
// => pour un rendu optimal, la hitbox ne doit pas trop déborder de l'image et inversement
const SPACESHIP_HITBOX_RADIUS_COEF = 0.6;
const AST_HITBOX_RADIUS_COEF = 0.8;

const MONEY_PER_BONUS = 100;
const BONUS_MAX_SPEED = 8;  		// Vitesse max en pixel par intervalle, PAR AXE
const BONUS_LIFE_TIME = 200;		// Durée de vie d'un bonus en nombre d'intervalles => 200 à 50ms -> 10s
const BONUS_BLINK_START_AT = 60;    // Nombre d'intervalles de vie restant au bonus en dessous duquel il clignote => 60 à 50ms -> 3s

const BASE_AST_LIFE = 3;
const FIRST_ENCOUNTER_SIZE = 2;
const SIZE_COMPUTE_BASE = 3;
const NUMBER_OF_SUB_AST = 3;
const AST_SPAWN_ZONE_WIDTH = 100;
const AST_MAX_INITIAL_AXIAL_SPEED = 4;  // Vitesse max en pixel par intervalle
const AST_RADIAL_SPEED_DIVIDER = 1; // Soit X, la valeur => vitesse comprise entre -1/2X et 1/2X degré par intervalle
									//pour 5 sur un TIME_INTERVAL à 50ms => entre -2° et +2° par seconde
									//pour 1 sur un TIME_INTERVAL à 50ms => entre -10° et +10° par seconde

var debug = false;

/**
 * Controller principal gérant le moteur du jeu
 */
class AH_MainController {

	// Fonction d'initialisation du controller principal
	static init() {
		document.currentController = AH_MainController;
		AH_MainController.scope = {
			spaceship: {
				angle: 0,
				deltaX: 0,
				deltaY: 0
			},
			asteroids: [],
			bonusItems: [],
			game: {
				money: 0,
				level: 1,
				beforeNextShot: 0,
				tinyAstDestroyed: 0,
				bonusCollected: 0,
				showHitboxes: false,
				cookies_accepted: false,
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
				level_0_effect: 0,
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

		// Ajout des listeners sur la fenêtre pour gérer les contrôles (keyDown et keyUp pour gérer le maintient de touche)
		window.addEventListener('keydown', function(e) {
			let controls = AH_MainController.scope.controls;
			if (e.code == "ArrowDown")
				controls.downPressed = true;
			if (e.code == "ArrowUp")
				controls.upPressed = true;
			if (e.code == "ArrowLeft")
				controls.leftPressed = true;
			if (e.code == "ArrowRight")
				controls.rightPressed = true;
			if (e.code == "Space")
				controls.spacePressed = true;
			if (e.code == "KeyP") {
				if (controls.paused) {
					let pauseDiv = document.getElementById("pause-div");
					pauseDiv.remove();
					controls.paused = false;
				} else {
					let pauseDiv = document.createElement("DIV");
					pauseDiv.id = "pause-div";
					let pauseSpan = document.createElement("SPAN");
					pauseSpan.innerHTML = "||";
					pauseDiv.appendChild(pauseSpan);
					document.body.appendChild(pauseDiv);
					controls.paused = true;
				}
			}
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

		// Lancement du gestionnaire de Timer
		AH_Timer.letsPlay();
	}

	/**
	 * Fonction injectant un HTMLElement dans "game_window"
	 */
	static addToGameWindow(element) {
		let game = document.getElementById("game-window");
		game.appendChild(element);
	}

	/**
	 * Fonction démarrant la vague suivante
	 */
	static startWave() {

		// Clear des astéroïdes, des tirs et des bonus restant de la défaite précédente
		while (AH_MainController.scope.asteroids.length > 0) {
			let asteroid = AH_MainController.scope.asteroids.pop();
			asteroid.life_bar.remove();
			asteroid.remove();
		}
		let shots = document.getElementsByClassName("shot");
		for (let i=shots.length-1; i>=0; i--) {
			let shot = shots[i];
			shot.remove();
		}
		let bonusItems = AH_MainController.scope.bonusItems; 
		for (let i=bonusItems.length-1; i>=0; i--) {
			let bonus = bonusItems[i];
			bonus.remove();
			bonusItems.splice(i, 1);
		}

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

		// Repositionner le vaisseau au milieu
		document.getElementsByTagName("AH-SPACESHIP")[0].init();

		// Réinitialiser les compteurs puis démarrer le jeu
		AH_MainController.scope.game.tinyAstDestroyed = 0;
		AH_MainController.scope.game.bonusCollected = 0;
		AH_MainController.scope.controls.paused = false;

	}

	/**
	 * Méthodes de génération de nombres aléatoires compris entre 0 et max_value, inclus
	 */
	static entierAleatoire(max_value) { return Math.round( AH_MainController.reelAleatoire(max_value) ); }
	static reelAleatoire(max_value) { return Math.random() * max_value; }

	/**
	 * A l'appel de cette fonction, s'il n'y a plus d'astéroïde, on déclenche la fin de niveau
	 * ==> à appeler lors de la destruction d'un astéroïde 
	 */
	static checkLevelEnd() {
		if (AH_MainController.scope.asteroids.length == 0) {
			AH_MainController.scope.game.level++;
			AH_MainController.showWaveIncomesReport();
		}
	}

	/**
	 * Fonction de sauvegarde de la partie en cours
	 */
	static saveGame() {
		// Si le joueur a accépté les cookies dans les préférences, on crée la sauvegarde
		// sinon, on l'invite à accepter les cookies
		if (AH_MainController.scope.game.cookies_accepted) {
			
			// Création de l'objet de sauvegarde
			let object = {
				money: AH_MainController.scope.game.money,
				level: AH_MainController.scope.game.level,
				shop: [],
				radial_sensivity: AH_MainController.scope.game.radial_sensivity
			}
			for (let shopElem of AH_MainController.scope.shop) {
				object.shop.push({
					code: shopElem.code,
					level: shopElem.level
				});
			}

			// Ecriture du cookie de sauvegarde
			const d = new Date();
			d.setTime(d.getTime() + (SAVE_EXPIRATION_DAYS*24*60*60*1000));
			let expires = "expires="+ d.toUTCString();
			document.cookie = "saved_game=" + JSON.stringify(object) + "; " + expires + "; SameSite=Lax";
		} else RS_Alert (SAVE_ERROR_MSG, "Cookies nécessaires", lbl_btn, callback)
	}

	/**
	 * Fonction permettant de charger un cookie de sauvegarde
	 */
	static loadGame()
	{
		let name = "saved_game=";
		let cookie = document.cookie;
		let startIndex = cookie.indexOf(name) + name.length;
		let endIndex = cookie.indexOf(";", startIndex);
		if (startIndex != -1) {
			let cookieContent = cookie.substring(startIndex, (endIndex == -1 ? undefined : endIndex));
			let saved_game = JSON.parse(cookieContent);
			AH_MainController.scope.game.money = saved_game.money;
			AH_MainController.scope.game.level = saved_game.level;
			AH_MainController.scope.game.radial_sensivity = saved_game.radial_sensivity;
			AH_MainController.scope.game.cookies_accepted = true;
			for (let savedShopElem of saved_game.shop)
				AH_Shop.setShopItemLevel(savedShopElem.code, savedShopElem.level);
			document.getElementById("btn_close").value = `Affronter vague ${saved_game.level}`;
			document.getElementById("player_money").innerHTML = `${AH_MainController.intToHumanReadableString(AH_MainController.scope.game.money)}`;
			AH_Shop.refreshAllShopItems();
		} else alert("Sauvegarde introuvable");
	}

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
			let bonus_income = (MONEY_PER_BONUS + income_shop_level) * bonus_collected;
			let tiny_ast_destroyed = AH_MainController.scope.game.tinyAstDestroyed;
			let tiny_ast_income = income_shop_level * tiny_ast_destroyed;
			let total_income = level_failed
							 ? Math.floor((bonus_income + tiny_ast_income) * AH_Shop.getShopAttributeValue("REC"))
							 : bonus_income + tiny_ast_income;

			// Affichage des données et mise à jour des éléments calculés
			AH_MainController.scope.game.money += total_income;
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
		AH_MainController.scope.controls.paused = true;
		let popup = new RS_Dialog("report_dialog", "Rapport de vague", [], [], [], false, "tpl_parameters.html", function() {

			// Binding de l'autorisation pour les cookies
			new RS_Binding({
				object: AH_MainController.scope.game,
				property: "cookies_accepted"
			}).addBinding(popup.querySelector("#cookies_accepted"), "checked", "change");

			// Binding de la sensibilité radiale
			new RS_Binding({
				object: AH_MainController.scope.game,
				property: "radial_sensivity"
			}).addBinding(popup.querySelector("#radial_sensivity"), "value", "change");

			// Gestion du clic sur les boutons de sauvegarde et de chargement
			popup.querySelector("#btn_save").addEventListener("click", ()=> { AH_MainController.saveGame(); });
			popup.querySelector("#btn_load").addEventListener("click", ()=> { AH_MainController.loadGame(); });
			popup.querySelector("#btn_close").addEventListener("click", ()=> { popup.closeModal(); });
		});
		document.body.appendChild(popup);
	}
}
