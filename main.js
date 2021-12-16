// Liste des choses à faire (par priorité croissante => faire la dernière en premier):
//  - ANGLE_STEP => paramétrable via un curseur "sensibilité radiale" et pris en compte par la sauvegarde

// Constantes
const TIME_INTERVAL = 50;
const ANGLE_STEP = 11.25;
const SAVE_EXPIRATION_DAYS = 400;	// Nombre de jours d'expiration appliqués au cookie de sauvegarde

const WINDOW_WIDTH = 800;
const WINDOW_HEIGHT = 600;

const SPACESHIP_SIZE = 50;
const SPACESHIP_HITBOX_RADIUS_COEF = 0.5;
const SHOT_BASE_SIZE = 5;
const BASE_AST_SIZE = 15;
const BONUS_SIZE = 25;

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
				bonusCollected: 0
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
			AH_MainController.getWaveIncomesReport();
		}
	}

	/**
	 * Fonction de sauvegarde de la partie en cours
	 */
	static saveGame() {

		// Création de l'objet de sauvegarde
		let object = {
			money: AH_MainController.scope.game.money,
			level: AH_MainController.scope.game.level,
			shop: []
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
			for (let savedShopElem of saved_game.shop)
				AH_Shop.setShopItemLevel(savedShopElem.code, savedShopElem.level);
			document.getElementById("start-wave").value = `Affronter vague ${saved_game.level}`;
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
	static getWaveIncomesReport(level_failed) {
		AH_MainController.scope.controls.paused = true;
		let popup = new RS_Dialog("report_dialog", "Rapport de vague", [], [], [], false);

		// Ajout de la div de contenu de la popup
		let div_content = document.createElement("DIV");
		div_content.classList.add("dialog-body");
		popup.appendToContent(div_content);

		// Ajout d'une image d'en-tête
		let center = document.createElement("CENTER");
		div_content.appendChild(center);
		let img = document.createElement("DIV");
		img.classList.add("img-report");
		center.appendChild(img);

		// Données de base
		let income_shop_level = AH_Shop.getShopAttributeValue("INC");
		let bonus_collected = AH_MainController.scope.game.bonusCollected;
		let bonus_income = (MONEY_PER_BONUS + income_shop_level) * bonus_collected;
		let tiny_ast_destroyed = AH_MainController.scope.game.tinyAstDestroyed;
		let tiny_ast_income = income_shop_level * tiny_ast_destroyed;

		// Génération des lignes de rapport
		AH_MainController.getReportLine("Bonus", ["<b>Collectés:</b>", bonus_collected, "<b>Gains:</b>", bonus_income + " Brouzoufs"], div_content);
		AH_MainController.getReportLine("Petits astéroïdes", ["<b>Détruits:</b>", tiny_ast_destroyed, "<b>Gains:</b>", tiny_ast_income + " Brouzoufs"], div_content);
		if (level_failed)
			AH_MainController.getReportLine("Pertes", ["<b>Non récupérés:</b>", `${(1 - AH_Shop.getShopAttributeValue("REC")) * 100}%`], div_content);

		// Total
		let total_income = level_failed
						 ? Math.floor((bonus_income + tiny_ast_income) * AH_Shop.getShopAttributeValue("REC"))
						 : bonus_income + tiny_ast_income;
		let divTotal = document.createElement("DIV");
		divTotal.classList.add("report-total");
		divTotal.classList.add("report-text");
		divTotal.innerHTML = "<b>Total:</b> " + total_income + " Brouzoufs";
		div_content.appendChild(divTotal);

		// Création de la <div> contenant les boutons
		let div_btn = document.createElement("DIV");
		div_btn.classList.add("dialog-footer");

		// Création du bouton "Oui"
		let btn = document.createElement("INPUT");
		btn.setAttribute("type", "button");
		btn.classList.add("start-wave-button");
		btn.value = "Bien reçu";
		btn.addEventListener("click", ()=> {
			popup.closeModal();
			setTimeout(function () { AH_Shop.show(); }, 750);
		});

		// Ajout des boutons à la boîte de dialogue et affichage
		div_btn.appendChild(btn);
		popup.appendToContent(div_btn);
		document.body.appendChild(popup);

		// Et bien sûr, on met à jour le scope du controller principal
		AH_MainController.scope.game.money += total_income;
	}

	/**
	 * Construit l'affichage d'une ligne de rapport et l'injecte dans targetElement
	 * textIndexes est la liste des indices de colonne auxquelles appliquer le style "report-text"
	 */
	static getReportLine(titre, cellContents, targetElement, textIndexes=[0,2]) {
		let divTitre = document.createElement("DIV");
		divTitre.classList.add("report-title");
		divTitre.classList.add("report-text");
		divTitre.innerHTML = titre;
		targetElement.appendChild(divTitre);
		let ligne = document.createElement("DIV");
		ligne.classList.add("report-line");
		targetElement.appendChild(ligne);
		let index = 0;
		for (let content of cellContents) {
			let cell = document.createElement("DIV");
			if (textIndexes.indexOf(index) != -1)
				cell.classList.add("report-text");
			cell.innerHTML = content;
			ligne.appendChild(cell);
			index++;
		}
	}
}
