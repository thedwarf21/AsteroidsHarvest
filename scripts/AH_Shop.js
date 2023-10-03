/********************************************************************************************
 * Toutes les fonctions liées à la gestion et à l'affichage du magasin au sein d'une classe *
 ********************************************************************************************/
class AH_Shop {
	
	/**
	 * Permet d'obtenir la valeur correspondant au niveau d'évolution acquis, dans une
	 * caractéristique améliorable, en fonction de son code 
	 * (voir initialisation du scope dans "main.js" -> propriété "shop")
	 */
	static getShopAttributeValue(code) {
		let shop = AH_MainController.scope.shop;
		for (let shopElem of shop)
			if (shopElem.code == code)
				return shopElem.level_0_effect + (shopElem.upgrade_value * shopElem.level);
	}

	/**
	 * Permet de mettre à jour le niveau d'un élément du magasin (chargement d'une sauvegarde)
	 */
	static setShopItemLevel(code, level) {
		let shop = AH_MainController.scope.shop;
		for (let shopElem of shop)
			if (shopElem.code == code)
				shopElem.level = level;
	}

	/**
	 * Invoque le magasin : popup proposant l'achat de nouvelles améliorations avant de lancer le prochain niveau
	 * Sauvegarde automatiquement la partie, à l'ouverture et à la fermeture de la popup
	 */
	static show(onPopupShown) {
		let scope = AH_MainController.scope;
		scope.controls.paused = true;
		AH_AudioManager.startMusicLoop(GAME_MUSIC);

		// Construction de la popup
		let popup = new RS_Dialog("shop", "Magasin", [], [], [], false, "tpl_shop.html", function() {
			popup.querySelector("#player_money").innerHTML = AH_MainController.intToHumanReadableString(scope.game.money) + " Brouzoufs";

			// Parcours des la liste "shop" pour afficher le magasin
			let itemsContainer = popup.querySelector("#items-container");
			for (let shopElem of scope.shop) {
				let shopItem = AH_Shop.__getHtmlShopItem(shopElem);
				shopElem.htmlElement = shopItem;
				itemsContainer.appendChild(shopItem);
			}

			// Libellé et onClick du bouton de fermeture de la popup
			let closeBtn = popup.querySelector("#btn_close")
			closeBtn.value = "Affronter vague " + AH_MainController.scope.game.level;
			closeBtn.addEventListener("click", ()=> {
				popup.closeModal();
				AH_SaveManager.saveGame();
				AH_MainController.startWave();
			});

			// Affichage de la popup
			document.body.appendChild(popup);
			
			// Si une fonction est paramétrée dans onPopupShow, on l'exécute
			if (onPopupShown)
				onPopupShown();
		});
	}

	/**
	 * Cette méthode attend pour paramètre, un élément de la liste "scope.shop" afin d'en générer l'affichage
	 * Sous la forme d'un DIV de classe "shop-item" structuré avec tout son contenu
	 */
	static __getHtmlShopItem(shopElem) {

		// Div principal
		let shopItem = document.createElement("DIV");
		shopItem.classList.add("shop-item");

		// Div affichant le NOM
		let divName = document.createElement("DIV");
		divName.classList.add("shop-item-name");
		divName.innerHTML = shopElem.nom;
		shopItem.appendChild(divName);

		// Div affichant la DESCRIPTION
		let divDesc = document.createElement("DIV");
		divDesc.classList.add("shop-item-desc");
		divDesc.innerHTML = shopElem.description;
		shopItem.appendChild(divDesc);

		// Div affichant le PRIX de l'amélioration
		let divPrice = document.createElement("DIV");
		divPrice.classList.add("shop-item-price");
		shopItem.appendChild(divPrice);

		// Div affichant les effets de l'amélioration
		let divEffect = document.createElement("DIV");
		divEffect.classList.add("shop-item-effect");
		shopItem.appendChild(divEffect);

		// Ajout d'un gestionnaire d'événement pour le clic
		shopItem.ah_shopElem = shopElem;
		shopItem.ah_divPrice = divPrice;
		shopItem.ah_divEffect = divEffect;
		shopItem.ah_price = AH_Shop.__paintItemInfos(shopElem, divPrice, divEffect);
		shopItem.addEventListener('click', function(event) {

			// Clic ignoré si pas assez d'argent ou niveau maximum atteint
			if (AH_MainController.scope.game.money >= this.ah_price && 
			   (!this.ah_shopElem.max_level || this.ah_shopElem.level < this.ah_shopElem.max_level)) {
			   	// Mise à jour des données
				AH_MainController.scope.game.money -= this.ah_price;
				this.ah_shopElem.level++;
				this.ah_price = AH_Shop.__getPrice(this.ah_shopElem);

				// Mise à jour de l'interface
				document.getElementById("player_money").innerHTML = AH_MainController.intToHumanReadableString(AH_MainController.scope.game.money) + " Brouzoufs";
				AH_Shop.refreshAllShopItems();
			}
		});
		return shopItem;
	}

	/**
	 * Raffraichit les éléments du magasin
	 */
	static refreshAllShopItems() {
		for (let shopElem of AH_MainController.scope.shop)
          shopElem.ah_price = AH_Shop.__paintItemInfos(shopElem, shopElem.htmlElement.ah_divPrice, shopElem.htmlElement.ah_divEffect);
	}

	/**
	 * Fonction mettant à jour les informations de prix et d'effets pour un élément du magasin
	 */
	static __paintItemInfos(shopElem, divPrice, divEffect) {

		// Prix
		let price = AH_Shop.__getPrice(shopElem);
		let isMaxed = (shopElem.max_level && shopElem.level == shopElem.max_level)
		if (price > AH_MainController.scope.game.money || isMaxed)
			divPrice.classList.add("too-expensive");
		divPrice.innerHTML  = isMaxed
							? "Niveau max. atteint"
							: `<b>Prix:</b> ${AH_MainController.intToHumanReadableString(price)} Brouzoufs`;

		// Effets
		let present_val = shopElem.level_0_effect + (shopElem.upgrade_value * shopElem.level);
		let future_val = present_val + shopElem.upgrade_value;
		let presentValue	= shopElem.show_multiplicator 
							? Math.floor(present_val * shopElem.show_multiplicator) 
							: present_val;
		let upgradedValue	= shopElem.show_multiplicator
							? Math.floor(future_val * shopElem.show_multiplicator)
							: future_val;
		divEffect.innerHTML = isMaxed
							? `<b>${shopElem.lbl_effect}:</b> <span class="blue">${presentValue}</span>`
							: `<b>${shopElem.lbl_effect}:</b> <span class="blue">${presentValue}</span> >> <span class="green">${upgradedValue}</span>`;

		// Retour du prix, pour le gestionnaire de clic
		return price;
	}

	/**
	 * Cette fonction de calcul suit le principe de la suite de Fibonacci
	 * C'est à dire qu'au-delà du second, un élément de la suite est égal
	 * à la somme des deux précédents.
	 * Cette méthode attend la valeur du premier élément de la suite,
	 * le coefficient à appliquer au premier pour obtenir le second,
	 * ainsi que le rang de l'élément de la suite dont on souhaite la valeur.
	 */
	static __getFibonacciValue(level_0_value, coef, level) {
		let prev_values = [];
		for (let i=0; i<level+1; i++) {
			let value;
			if (i == 0)
				value = level_0_value;
			else if (i == 1)
				value = level_0_value * coef;
			else value = prev_values[0] + prev_values[1];
			prev_values.unshift(value);
		}
		return prev_values.shift();
	}

	/**
	 * Fonction métier s'appuyant sur getFibonacciValue recevant en paramètre un élément de la liste shop
	 */
	static __getPrice(shopElem) { return AH_Shop.__getFibonacciValue(shopElem.level_1_price, shopElem.level_2_price_coef, shopElem.level); }
}