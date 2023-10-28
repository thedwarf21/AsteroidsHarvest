/**
 * La classe RS_Hitbox centralise les tests de collision
 *
 * @class      RS_Hitbox
 */
class RS_Hitbox {
	constructor(shape, params) {
		this.shape = shape;
		for (let property_name in params)
			this[property_name] = params[property_name];
	}

	checkCollide(hitbox) {
		let str_notice = "veillez à n'initialiser la propriété shape qu'avec les constantes statiques prévues à cet effet.";
		if (this.shape == RS_Hitbox.SHAPE_CIRCLE) {
			if (hitbox.shape == RS_Hitbox.SHAPE_CIRCLE)
				return this.__checkCircleVsCircle(hitbox);
			else if (hitbox.shape == RS_Hitbox.SHAPE_BOX)
				return this.__checkCircleVsBox(hitbox);
			else console.error(`Forme de hitbox inconnue: ${hitbox.shape} >>> ${str_notice}`);
		} else if (this.shape == RS_Hitbox.SHAPE_BOX) {
			if (hitbox.shape == RS_Hitbox.SHAPE_CIRCLE)
				return hitbox.__checkCircleVsBox(this);
			else if (hitbox.shape == RS_Hitbox.SHAPE_BOX)
				return this.__checkBoxVsBox(hitbox);
			else console.error(`Forme de hitbox inconnue: ${hitbox.shape} >>> ${str_notice}`);
		} else console.error(`Forme de hitbox inconnue: ${this.shape} >>> ${str_notice}`);
	}

	__checkCircleVsCircle(hitbox) {
		let deltaX = Math.abs(this.x - hitbox.x),
			deltaY = Math.abs(this.y - hitbox.y),
			distance = (deltaX**2 + deltaY**2) ** 0.5;
		return (distance < this.radius + hitbox.radius);
	}

	__checkCircleVsBox(hitbox) {
		console.warn("RS_Hitbox.checkCircleVsBox(): Cette fonction est en attente d'implémentation");	
		return false;
	}

	__checkBoxVsBox(hitbox) {
		console.warn("RS_Hitbox.checkBoxVsBox(): Cette fonction est en attente d'implémentation");
		return false;
	}

	static get SHAPE_CIRCLE() 		{ return 3.14; }
	static get SHAPE_BOX()			{ return 4; }
	static set SHAPE_CIRCLE(value) 	{ console.error("La constante RS_Hitbox.SHAPE_CIRCLE est en lecture seule."); }
	static set SHAPE_BOX(value)		{ console.error("La constante RS_Hitbox.SHAPE_BOX est en lecture seule."); }
}

/**
 * Cette classe a pour but de gérer la compatibilité d'affichage en fonction de la taille de l'écran.
 * Elle fonctionne sur un principe de coordonnées virtuelles :
 * 		- Le programme principal continue d'utiliser des coordonnées virtuelles en pixels sur un 
 * 		  écran virtuel à hauteur/largeur fixe (l'autre dimension est calculée à l'aide du ratio réel de l'écran)
 * 		- La classe, une fois paramétrés "base_axis" et "base_axis_virtual_size", convertit les coordonnées en % 
 * 				=> utilisation de vh ou vw, pour appliquer les coordonnées dans l'interface, selon l'axe choisit
 * 		- Largeur et hauteur de l'écran virtuel en propriétés (pour détecter les sorties d'écran)
 *
 * @class      RS_ViewPortCompatibility
 */
class RS_ViewPortCompatibility {
	constructor(baseAxis, windowVirtualBaseSize) {
		this.refreshScreenRatio();
		if (baseAxis && windowVirtualBaseSize) {
			if (["x", "y"].includes(baseAxis)) {
				this.base_axis = baseAxis;
				this.base_axis_virtual_size = windowVirtualBaseSize;
			} else console.error(`RS_ViewPortCompatibility.constructor: axes supportés -> 'x' ou 'y': reçu -> '${baseAxis}'`);
		} else console.error(`RS_ViewPortCompatibility.constructor('${baseAxis}', ${windowVirtualBaseSize}): paramètres invalides.`);

		// Suite à un redimensionnement, le ratio est recalculé afin que la conversion s'adapte
		window.addEventListener('resize', ()=> { this.refreshScreenRatio(); });
	}

	get VIRTUAL_HEIGHT() {
		if (this.base_axis == "y") 
			return this.base_axis_virtual_size;
		else return this.base_axis_virtual_size / this.screen_ratio;
	}

	get VIRTUAL_WIDTH() {
		if (this.base_axis == "y")
			return this.base_axis_virtual_size * this.screen_ratio;
		else return this.base_axis_virtual_size;
	}

	refreshScreenRatio() { this.screen_ratio = window.innerWidth / window.innerHeight; }

	getCssValue(virtual_pixels, is_base_axis) {
		let coefConversion = 100 / this.VIRTUAL_HEIGHT,
			css_unit = this.base_axis == "y" ? "vh" : "vw",
			value = virtual_pixels * coefConversion;
		return value + css_unit;
	}
}

/**
 * Couche d'abstraction permettant d'interfacer des contrôles à l'API native Gamepad.
 * Référence une liste de contrôles. Chacun d'entre eux se caractérise par :
 *    - un nom destiné à l'affichage pour configuration de la manette
 *    - une fonction rattachée, exécutant l'action correspondante
 *    - l'indice du bouton de manette rattaché, dans la liste fournie par l'API
 *
 * @class      GamepadControlsMapper
 */
class GamepadControlsMapper {
	constructor() { this.controls = []; }

	addControlEntry(name, fnAction) {
		this.controls.push({
			name: name,
			execute: fnAction,
			buttonIndex: undefined
		});
	}

	setControlMapping(controlIndex, buttonIndex) {
		this.controls[controlIndex].buttonIndex = buttonIndex;
	}

	applyControlsMapping() {
		let gamepad = navigator.getGamepads()[0];
		for (let control of this.controls) {
			if (control.buttonIndex && gamepad.buttons[control.buttonIndex].pressed)
				control.execute();
		}
	}
}

/**
 * Construit et piloté l'interface de configuration de la manette, 
 * en s'appuyant sur une instance de GamepadControlsMapper.
 *
 * @class      GamepadConfigInterface
 */
class GamepadConfigInterface {
	constructor(game_controls_mapper, fnOnClose) {
		this.controls_mapper = game_controls_mapper;
		this.show(fnOnClose);
	}

	show(fnOnClose) {
		let popup = new RS_Dialog("gamepad_config", "Configuration de la manette", [], [], [], false, 
								  "tpl_gamepad_config.html", ()=> {
			let container = popup.querySelector("#controls-gui-container");
			for (let i=0; i<this.controls_mapper.controls.length; i++) {
				container.appendChild(this.__getConfigInterfaceItem(i));
			}
			popup.querySelector("#btn_close").addEventListener("click", ()=> {
				popup.closeModal();
				if (fnOnClose)
					fnOnClose();
			});
			document.body.appendChild(popup);
		});
	}

	__getConfigInterfaceItem(control_index) {
		let control_mapping_item = this.controls_mapper.controls[control_index]
		let config_interface_item = this.__getItemContainer();
		config_interface_item.appendChild(this.__getItemNameDiv(control_mapping_item.name));
		let button_mapped = this.__getItemMapDiv(control_mapping_item.buttonIndex);
		config_interface_item.appendChild(button_mapped);
		config_interface_item.addEventListener("click", ()=> { this.__itemClicked(button_mapped, control_index); });
		return config_interface_item;
	}

	__getItemContainer() {
		let config_interface_item = document.createElement("DIV");
		config_interface_item.classList.add("control-item-container");
		return config_interface_item;
	}

	__getItemNameDiv(name) {
		let control_name = document.createElement("DIV");
		control_name.classList.add("control-name");
		control_name.innerHTML = name;
		return control_name;
	}

	__getItemMapDiv(buttonIndex) {
		let button_mapped = document.createElement("DIV");
		button_mapped.classList.add("button-mapped");
		button_mapped.innerHTML = buttonIndex 
								? "Bouton " + buttonIndex 
								: "-";
		return button_mapped;
	}

	__itemClicked(button_mapped, control_index) {
		button_mapped.innerHTML = "Appuyez sur un bouton";
		this.__captureButtonPressed((button_index)=> {
			this.controls_mapper.setControlMapping(control_index, button_index);
			button_mapped.innerHTML = "Bouton " + button_index;
		});
	}

	__captureButtonPressed(fnThen) {
		let interval_id = setInterval(()=> {
			let gamepad = navigator.getGamepads()[0];
			for (let i=0; i<gamepad.buttons.length; i++) {
				if (gamepad.buttons[i].pressed) {
					clearInterval(interval_id);
					fnThen(i);
				}
			}
		}, 35);
	}
}