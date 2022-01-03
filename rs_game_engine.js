/**
 * La classe RS_Hitbox centralise les tests de collision
 *
 * @class      RS_Hitbox
 */
class RS_Hitbox {

	/**
	 * Construit un objet RS_Hitbox en fonction des paramètres
	 *
	 * @param      {number}  shape   La forme de la hitbox (utiliser les constantes statiques de la classe)
	 * @param      {Object}  params  Les paramètres liés à la forme
	 */
	constructor(shape, params) {
		this.shape = shape;
		for (let property_name in params)
			this[property_name] = params[property_name];
	}

	/**
	 * Test de collision avec une autre hitbox
	 *
	 * @param      {RS_Hitbox}  hitbox  L'objet RS_Hitbox à confronter à this
	 */
	checkCollide(hitbox) {
		// Les calculs (et les propriétés portés par l'objet RS_Hitbox) seront différents selon la forme de chaque hitbox
		// On doit donc prévoir toutes les combinaisons possibles
		// Cette fonction est une fonction d'aiguillage vers la fonction spécifique adéquate
		// 
		// On en profite pour vérifier la cohérence du contenu de la propriété shape des deux objets
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

	/**
	 * Fonctions de collision => une par association de forme possible
	 *   - La première forme du nom de la fonction correspond à this
	 *   - La seconde forme du nom de la fonction correspond à hitbox
	 *   
	 * Note: je coderai les deux autres fonctions le jour où j'en aurai l'utilité (tests plus pertinents, avec des cas concrets)
	 *
	 * @param      {RS_Hitbox}  hitbox  L'objet RS_Hitbox à confronter à this
	 */
	__checkCircleVsCircle(hitbox) {
		let deltaX = Math.abs(this.x - hitbox.x),
			deltaY = Math.abs(this.y - hitbox.y),
			distance = (deltaX**2 + deltaY**2) ** 0.5;

		// Si la distance entre les centres des deux disques est inférieure à la somme de leurs rayons, c'est qu'ils se chevauchent
		return (distance < this.radius + hitbox.radius);
	}

	/*** A implémenter, lorsque nécessaire ***/
	__checkCircleVsBox(hitbox) {
		console.warn("RS_Hitbox.checkCircleVsBox(): Cette fonction est en attente d'implémentation");	
		return false;
	}

	/*** A implémenter, lorsque nécessaire ***/
	__checkBoxVsBox(hitbox) {
		console.warn("RS_Hitbox.checkBoxVsBox(): Cette fonction est en attente d'implémentation");
		return false;
	}

	/*** Déclaration des constantes statiques ***/
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
 * 		- Largeur et hauteur de l'écran virtuel en propriétés (pour détecter les sorties d'écran)
 *
 * @class      RS_ViewPortCompatibility
 */
class RS_ViewPortCompatibility {

	/** Initialisation par défaut et mise en place du listener de recalibrage automatique **/
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

	/** Propriétés en lecture seule **/
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

	/** Méthodes à appeler dans l'événement resize, pour que la conversion s'adapte **/
	refreshScreenRatio() { this.screen_ratio = window.innerWidth / window.innerHeight; }

	/** Méthode de conversion des coordonnées Y en pourcentage, pour affichage responsive du jeu **/
	getCssValue(virtual_pixels, is_base_axis) {
		let coefConversion = 100 / this.VIRTUAL_HEIGHT,
			css_unit = this.base_axis == "y" ? "vh" : "vw",
			value = virtual_pixels * coefConversion;

		// Retourne la valeur au format CSS => par exemple, 12.485vh
		return value + css_unit;
	}
}
