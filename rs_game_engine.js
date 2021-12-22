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
				return this.checkCircleVsCircle(hitbox);
			else if (hitbox.shape == RS_Hitbox.SHAPE_BOX)
				return this.checkCircleVsBox(hitbox);
			else console.error(`Forme de hitbox inconnue: ${hitbox.shape} >>> ${str_notice}`);
		} else if (this.shape == RS_Hitbox.SHAPE_BOX) {
			if (hitbox.shape == RS_Hitbox.SHAPE_CIRCLE)
				return hitbox.checkCircleVsBox(this);
			else if (hitbox.shape == RS_Hitbox.SHAPE_BOX)
				return this.checkBoxVsBox(hitbox);
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
	checkCircleVsCircle(hitbox) {
		let deltaX = Math.abs(this.x - hitbox.x),
			deltaY = Math.abs(this.y - hitbox.y),
			distance = (deltaX**2 + deltaY**2) ** 0.5;
			
		// Si la distance entre les centres des deux disques est inférieure à la somme de leurs rayons, c'est qu'ils se chevauchent
		return (distance < this.radius + hitbox.radius);
	}

	/*** A implémenter, lorsque nécessaire ***/
	checkCircleVsBox(hitbox) {
		console.warn("RS_Hitbox.checkCircleVsBox(): Cette fonction est en attente d'implémentation");	
		return false;
	}

	/*** A implémenter, lorsque nécessaire ***/
	checkBoxVsBox(hitbox) {
		console.warn("RS_Hitbox.checkBoxVsBox(): Cette fonction est en attente d'implémentation");
		return false;
	}

	/*** Déclaration des constantes statiques ***/
	static get SHAPE_CIRCLE() 		{ return 3.14; }
	static get SHAPE_BOX()			{ return 4; }
	static set SHAPE_CIRCLE(value) 	{ console.error("La constante RS_Hitbox.SHAPE_CIRCLE est en lecture seule."); }
	static set SHAPE_BOX(value)		{ console.error("La constante RS_Hitbox.SHAPE_BOX est en lecture seule."); }
}