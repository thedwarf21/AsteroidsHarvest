class AH_SaveManager {

	/**
	 * Fonction de sauvegarde de la partie en cours
	 */
	static saveGame() {
		let object = {
			money: AH_MainController.scope.game.money,
			level: AH_MainController.scope.game.level,
			shop: [],
			radial_sensivity: AH_MainController.scope.game.radial_sensivity,
			show_hitboxes: AH_MainController.scope.game.showHitboxes,
			sound_fx_on: AH_MainController.scope.game.sound_fx_on,
			music_on: AH_MainController.scope.game.music_on
		};
		for (let shopElem of AH_MainController.scope.shop) {
			object.shop.push({
				code: shopElem.code,
				level: shopElem.level
			});
		}
		localStorage.setItem("ah_save_" + AH_MainController.scope.game.save_slot, JSON.stringify(object));
		RS_Toast.show("Partie sauvegardée avec succès", 3000);
	}

	/**
	 * Fonction permettant de charger un cookie de sauvegarde
	 */
	static loadGame()
	{
		let saved_game = JSON.parse(localStorage.getItem("ah_save_" + AH_MainController.scope.game.save_slot));
		AH_MainController.scope.game.money = saved_game.money;
		AH_MainController.scope.game.level = saved_game.level;
		AH_MainController.scope.game.radial_sensivity = saved_game.radial_sensivity;
		AH_MainController.scope.game.showHitboxes = saved_game.show_hitboxes;
		AH_MainController.scope.game.sound_fx_on = saved_game.sound_fx_on == undefined ? true : saved_game.sound_fx_on;
		AH_MainController.scope.game.music_on = saved_game.music_on == undefined ? true : saved_game.music_on;
		for (let savedShopElem of saved_game.shop)
			AH_Shop.setShopItemLevel(savedShopElem.code, savedShopElem.level);
		document.getElementById("btn_close").value = `Affronter vague ${saved_game.level}`;
		document.getElementById("player_money").innerHTML = `${AH_MainController.intToHumanReadableString(AH_MainController.scope.game.money)} Brouzoufs`;
		AH_Shop.refreshAllShopItems();
		RS_Toast.show("Chargement de la sauvegarde effectué", 3000);
	}
}