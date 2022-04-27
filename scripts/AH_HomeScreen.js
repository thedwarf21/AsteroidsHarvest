/**
 * Cette classe génère et gère l'écran d'accueil
 *
 * @class      AH_HomeScreen (name)
 */
class AH_HomeScreen {
	
	/**
	 * Construction de l'écran d'accueil
	 */
	constructor() {
		this.convertCookieSaveIfNecessary();

		// Image de fond > conteneur flex en colonne > titre
		this.home_screen = document.createElement("DIV");
		this.home_screen.classList.add("home-screen");
		this.buttons_panel = document.createElement("DIV");
		this.buttons_panel.classList.add("buttons-panel");
		let title = document.createElement("DIV");
		title.classList.add("title");
		title.innerHTML = "Asteroids Harvest";
		this.buttons_panel.appendChild(title);

		// Bouton "Nouvelle partie"
		let btn_new_game = document.createElement("DIV");
		btn_new_game.classList.add("button");
		btn_new_game.innerHTML = "Nouvelle partie";
		btn_new_game.addEventListener('click', ()=> { this.newGame(); })
		this.buttons_panel.appendChild(btn_new_game);

		// Bouton "Continuer"
		let btn_continue = document.createElement("DIV");
		btn_continue.classList.add("button");
		btn_continue.innerHTML = "Continuer";
		btn_continue.addEventListener('click', ()=> { this.loadGame(); })
		this.buttons_panel.appendChild(btn_continue);

		// Ajout au DOM de la page
		this.home_screen.appendChild(this.buttons_panel);
		document.body.appendChild(this.home_screen);
	}

	// Propriété calculée à la volée
	get hasSavedGames() { return localStorage.getItem('ah_save_1') || localStorage.getItem('ah_save_2') || localStorage.getItem('ah_save_3'); }
	get hasFreeSlots() { return !localStorage.getItem('ah_save_1') || !localStorage.getItem('ah_save_2') || !localStorage.getItem('ah_save_3'); }

	/**
	 * Si aucune sauvegarde n'a été trouvée dans les emplacements localStorage
	 * => Si une ancienne sauvegarde (cookie) a été trouvée
	 * ==> Récupération de l'ancienne sauvegarde pour l'enregistrer dans le 1er emplacement localStorage
	 */
	convertCookieSaveIfNecessary() {
		if (!this.hasSavedGames) {
			let name = "saved_game=";
			let cookie = document.cookie;
			let startIndex = cookie.indexOf(name) + name.length;
			let endIndex = cookie.indexOf(";", startIndex);
			if (startIndex - name.length != -1) {
				let cookieContent = cookie.substring(startIndex, (endIndex == -1 ? undefined : endIndex));
				let saved_game = JSON.parse(cookieContent);
				AH_MainController.scope.game.money = saved_game.money;
				AH_MainController.scope.game.level = saved_game.level;
				AH_MainController.scope.game.radial_sensivity = saved_game.radial_sensivity;
				AH_MainController.scope.game.showHitboxes = saved_game.show_hitboxes;
				for (let savedShopElem of saved_game.shop)
					AH_Shop.setShopItemLevel(savedShopElem.code, savedShopElem.level);
				localStorage.setItem('ah_save_1');
			}
		}
	}

	/**
	 * Passage au second écran : choix de l'emplacement de sauvegarde à utiliser
	 *  - Les emplacements vides ne sont sélectionnables qu'en "Nouvelle partie"
	 *  - Les emplacements occupés ne sont sélectionnables qu'en "Continuer" 
	 */
	newGame() { 
		if (!this.hasFreeSlots)
			RS_Toast.show("<b>Opération impossible</b> : tous les emplacements de sauvegarde sont utilisés", 3000);
		else this.__displayGameSlotChooseScreen(true); }
	loadGame() {
		if (!this.hasSavedGames)
			RS_Toast.show("<b>Opération impossible</b> : aucune sauvegarde trouvée", 3000); 
		else this.__displayGameSlotChooseScreen(false);
	}
	__displayGameSlotChooseScreen(is_new_game) {
		
		// Création de l'écran
		this.slots_container = document.createElement("DIV");
		this.slots_container.classList.add("game-slots-container");
		for (let i=1; i<=3; i++) {
			let game_slot = this.__getGameSlot(i);
			game_slot.addEventListener('click', ()=> {
				if (game_slot.is_empty && !is_new_game)
					RS_Toast.show("Veuillez choisir une partie en cours", 3000);
				else if (!game_slot.is_empty && is_new_game)
					RS_Toast.show("Cet emplecement est déjà utilisé", 3000);
				else {
					this.home_screen.remove();
					AH_MainController.scope.game.save_slot = i;
					AH_Shop.show(()=> {
						if (!is_new_game)
							AH_MainController.loadGame();
					});
				}
			});
			this.slots_container.appendChild(game_slot);
		}

		// Transition d'écran : Accueil -> Choix de la sauvegarde ==> animations
		this.__switchScreen();
	}

	/**
	 * Génère un élément graphique représentant un emplacement de sauvegarde
	 *
	 * @param      {number}  index   L'indice compris entre 1 et 3, inclus
	 */
	__getGameSlot(index) {
		
		// Conteneur > désignation de l'emplacement de sauvegarde
		let game_slot = document.createElement("DIV");
		game_slot.classList.add("game-slot");
		let designation = document.createElement("DIV");
		designation.classList.add("slot-name");
		designation.innerHTML = "Sauvegarde " + index;
		game_slot.appendChild(designation);

		// Détails de la sauvegarde (vague en cours)
		let progression = document.createElement("DIV");
		progression.classList.add("slot-details");
		let saved_game = JSON.parse(localStorage.getItem('ah_save_' + index));
		progression.innerHTML = saved_game ? "Vague " + saved_game.level : "Libre";
		game_slot.is_empty = saved_game ? false : true;
		game_slot.appendChild(progression);

		// On retourne l'élément
		return game_slot;
	}

	/**
	 * Gère la transition entre l'écran d'accueil et l'écran de choix de l'emplacement de sauvegarde
	 */
	__switchScreen() {
		this.buttons_panel.style.animation = "leaveToRight 1s ease-in-out";
		setTimeout(()=> { 
			this.buttons_panel.remove();
			this.home_screen.appendChild(this.slots_container);
		}, 950);
	}
}