/**
 * Classe mère des éléments mobiles du jeu (tirs, vaisseau, astéroïdes et bonus)
 */
class MobileGameElement extends HTMLDivElement {

  /*** Propriétés devant être initialisés pour que l'objet fonctionne correctement ***/
  x                 = null;
  y                 = null;
  deltaX            = null;
  deltaY            = null;
  pixel_size        = null;

  /**
   * Constructeur par défaut de tous les composants mobiles du jeu (tirs, vaisseau, astéroïdes et bonus)
   * Les coordonnées passées en paramètre sont les coordonnées d'apparition
   *
   * @param      {number}  x       Optionnel: Abscisses en pixels du coin supérieur gauche de l'élément contenant l'image du vaisseau
   * @param      {number}  y       Optionnel: Ordonnées en pixels du coin supérieur gauche de l'élément contenant l'image du vaisseau
   */
  constructor(x, y) {
    super();
    this.classList.add("game");

    // Certains éléments initialisent eux-mêmes leurs coordonnées. Les paramètres peuvent donc être absents.
    if (x != undefined && y != undefined) {
      this.x = x;
      this.y = y;
      this.style.left = this.x + "px";
      this.style.top = this.y + "px";
    }
  }

  /**
   * Fonction de déplacement de base
   *
   * @param      {boolean}  removeOnScreenLeave  move(true) => à sa sortie de l'écran, l'élément est supprimé du DOM
   */
  move(removeOnScreenLeave) {

    // Calcul des nouvelles coordonnées
    this.y -= this.deltaY;
    this.x += this.deltaX;
    
    // Gestion de la sortie d'écran selon removeOnScreenLeave
    //--------------------------------------------------------
    // true  --> suppression de l'élément
    // false --> on ramène l'élément au bord opposé
    if (removeOnScreenLeave) {
      let shot_size = SHOT_BASE_SIZE * this.power;
      if (this.y > WINDOW_HEIGHT || this.y < -shot_size || this.x > WINDOW_WIDTH || this.x < -shot_size) 
        this.remove();
    } else {
      if (this.y > WINDOW_HEIGHT) 
        this.y -= (WINDOW_HEIGHT + this.pixel_size);
      if (this.y < -this.pixel_size) 
        this.y += (WINDOW_HEIGHT + this.pixel_size);
      if (this.x > WINDOW_WIDTH) 
        this.x -= (WINDOW_WIDTH + this.pixel_size);
      if (this.x < -this.pixel_size) 
        this.x += (WINDOW_WIDTH + this.pixel_size);
    }

    // Application des nouvelles coordonnées
    this.style.top = this.y + "px";
    this.style.left = this.x + "px";
  }

  /**
   * Fonction déclenchant l'animation d'explosion sur un élément
   *
   * @param      {function}  fnPostExplosion  Hook post-animation
   */
  explode(fnPostExplosion) {
    this.classList.add("explosion");
    if (typeof fnPostExplosion == "function")
      setTimeout(fnPostExplosion, 450);
  }

  /**
   * Ajoute un élément permettant de visualiser la hitbox de l'élément
   */
  addVisualHitBox() {
    let div = document.createElement("DIV");
    div.classList.add("hitbox");

    // On applique le coefficient pour obtenir la marge 
    // marge de centrage => réduction du rayon = <rayon_hitbox_de_base> - <rayon_hitbox_souhaité>
    let margin = this.hitbox_size_coef
               ? this.pixel_size/2 * (1 - this.hitbox_size_coef)
               : this.pixel_size/2;
    let cssSize = `calc(100% - ${margin * 2}px)`;
    div.style.margin = `${margin}px`;
    div.style.height = cssSize;
    div.style.width = cssSize;
    this.appendChild(div);
  }

  /**
   * Retourne l'objet RS_Hitbox correspondant au vaisseau
   *
   * @type       {RS_Hitbox}
   */
  get hitbox() {
    let radius_coef = this.hitbox_size_coef || 1;
    
    // On retourne un objet donnant le coef à appliquer à la taille 
    return new RS_Hitbox(RS_Hitbox.SHAPE_CIRCLE, {
      radius: this.pixel_size/2 * radius_coef,
      x: this.x + (this.pixel_size / 2),
      y: this.y + (this.pixel_size / 2)
    });
  }

  /**
   * Ecrit un message d'erreur dans la console: propriété en lecture seule
   * Ce qui peut éviter d'un jour chercher pendant 3h pourquoi ça ne fonctionne pas...
   */
  set hitbox(value) { console.error("La propriété hitbox de MobileGameElement est en lecture seule."); }
}
customElements.define('ah-js-mobile-element', MobileGameElement, { extends: 'div' });

//---------------------------------------------------------------------------------------------------
//                                 Vaisseau du joueur
//---------------------------------------------------------------------------------------------------
//   Seul attribut nécessaire : la référence à l'objet contenant les propriétés pour mise à jour
// automatique de l'interface.
//---------------------------------------------------------------------------------------------------
// Dans le DOM ==> <div class="game spaceship"></div>, si créé directement via la classe AH_Spaceship
//---------------------------------------------------------------------------------------------------
/* Usage JS uniquement */
class AH_Spaceship extends MobileGameElement {

  /***********************************************************************
   * Construction du vaisseau                                            *
   ***********************************************************************/
  constructor() {

    // Construction HTML
    super();
    this.classList.add("spaceship");

    // Cette propriété est nécessaire pour régler la hitbox des visuels qui ne sont pas des disques parfaits
    this.hitbox_size_coef = SPACESHIP_HITBOX_RADIUS_COEF;

    // Position initiale, au centre de la scène
    this.init();
  }

  /*****************************
   * Fonction d'initialisation *
   *****************************/
  init() {
    this.angle = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.pixel_size = SPACESHIP_SIZE;
    this.x = (WINDOW_WIDTH - SPACESHIP_SIZE) / 2;
    this.y = (WINDOW_HEIGHT - SPACESHIP_SIZE) / 2;
    this.style.top = this.y + "px";
    this.style.left = this.x + "px";

    // Si les préférences utilisateur le spécifient, on affiche la HitBox
    if (AH_MainController.scope.game.showHitboxes)
      super.addVisualHitBox();
  }

  /***********************************************************************
   * Fonction déplaçant l'objet graphique                                *
   ***********************************************************************/
  move() {
    super.move();

    // Permet de conserver un angle compris entre 0° et 360°
    if (this.angle >= 360) this.angle -= 360;
    if (this.angle < 0) this.angle += 360;

    // Application des nouvelles coordonnées et de l'angle
    this.style.transform = "rotateZ(" + this.angle + "deg)";
  }

  /***********************************
   * Fonction invoquée lors d'un tir *
   ***********************************/
  shoot() {
    let scope = AH_MainController.scope;

    // Calcul des coordonnées d'apparition du tir :
    //  -> x et y correspondent au coin supérieur gauche.
    //  -> il faut déterminer le point central du vaisseau pour déterminer les coordonnées d'apparition du tir selon l'angle
    let angle_rad = this.angle * Math.PI / 180;
    let power = AH_Shop.getShopAttributeValue("POW");
    let x = this.x + (SPACESHIP_SIZE / 2) + (Math.sin(angle_rad) * SPACESHIP_SIZE / 2) - (power * SHOT_BASE_SIZE / 2);
    let y = this.y + (SPACESHIP_SIZE / 2) - (Math.cos(angle_rad) * SPACESHIP_SIZE / 2) - (power * SHOT_BASE_SIZE / 2);

    // Création du tir
    new AH_Shot(power, this.angle, AH_Shop.getShopAttributeValue("VEL"), x, y);
  }

  /************************************************************
   * Fonction invoquée lors d'une collision avec un asteroïde *
   ************************************************************/
  explode() {

    // Après l'animation d'explosion du vaisseau, on ouvre le rapport de fin de vague et on ré-initialise la
    // position et l'angle et les déplacements du vaisseau pour le niveau suivant
    super.explode(()=> { 
      AH_MainController.showWaveIncomesReport(true);
      this.init();
    });

    // Mise en pause
    AH_MainController.scope.controls.paused = true;
  }
}
customElements.define('ah-js-spaceship', AH_Spaceship, { extends: 'div' });

//=====================================================================================================================================

//---------------------------------------------------------------------------------------------------
//                                          Tir
//---------------------------------------------------------------------------------------------------
// Le tir s'auto retire du DOM, à sa sortie de l'écran ou lors d'un impact
//---------------------------------------------------------------------------------------------------
// Dans le DOM ==> <div class="game shot"></div>
//---------------------------------------------------------------------------------------------------
/* Usage JS uniquement */
class AH_Shot extends MobileGameElement {

  /***********************************************************************
   * Construction du tir                                                 *
   ***********************************************************************
   * @param  | {number}  | power    | Puissance du tir (-> taille)       *
   * @param  | {number}  | angle    | Direction du tir                   *
   * @param  | {number}  | velocity | Vitesse de déplacement du tir      *
   * @param  | {number}  | x, y     | Coordonnées d'apparition du tir    *
   ***********************************************************************/
  constructor(power, angle, velocity, x, y) {

    // Construction HTML
    super(x, y);
    this.classList.add("shot");
    this.pixel_size = SHOT_BASE_SIZE * power;
    this.style.width = this.pixel_size + "px";
    this.style.height = this.pixel_size + "px";

    // Initialisation des données internes au composant
    this.power = power;

    // Calcul de deltaX et deltaY, pour les déplacements
    this.angle_rad = angle * Math.PI / 180;
    this.velocity = velocity;
    this.deltaX = velocity * Math.sin(this.angle_rad);
    this.deltaY = velocity * Math.cos(this.angle_rad);

    // Intégration au DOM
    AH_MainController.addToGameWindow(this);
  }

  /***********************************************************************
   * Fonction déplaçant l'objet graphique                                *
   ***********************************************************************/
  move() { super.move(true); }

  /************************************************************
   * Fonction invoquée lors d'une collision avec un asteroïde *
   ************************************************************/
  explode() {
    super.explode(()=> { this.remove(); });
    this.classList.remove("shot"); // Evite que le tir soit pris en compte par les tests de collision, pendant l'animation de son explosion
  }
}
customElements.define('ah-js-shot', AH_Shot, { extends: 'div' });

//=====================================================================================================================================

//---------------------------------------------------------------------------------------------------
//                                      Asteroïde
//---------------------------------------------------------------------------------------------------
//   L'asteroïde reçoit une vitesse horizontale, une vitesse verticale ainsi qu'une vitesse de 
// rotation aléatoires, lors de sa création.
//   Ces attributs sont modifiés lors d'un impact avec un projectile (transfert d'énergie cynétique)
//---------------------------------------------------------------------------------------------------
// Dans le DOM ==> <div class="game asteroid"></div>
//---------------------------------------------------------------------------------------------------
/* Usage JS uniquement */
class AH_Asteroid extends MobileGameElement {

  /***********************************************************************
   * Construction de l'astéroïde                                         *
   ***********************************************************************
   * x et y sont optionnels. Par défaut, placement aléatoire.            *
   ***********************************************************************/
  constructor(size, x, y) {

    // Construction HTML
    super(x, y);
    this.classList.add("asteroid");

    // Cette propriété est nécessaire pour régler la hitbox des visuels qui ne sont pas des disques parfaits
    this.hitbox_size_coef = AST_HITBOX_RADIUS_COEF;

    // Génération des caractéristiques de départ
    this.init(size, x, y);

    // Ajout de la barre de vie
    // La fonction à besoin de this.pixel_size (initialisé dans this.init()), 
    // il est donc important que l'appel à createLifeBar() soit effectué après this.init()
    this.createLifeBar();

    // Intégration au DOM ainsi qu'au scope du controller principal
    AH_MainController.addToGameWindow(this);
  }

  /*****************************************
   * Ajoute une barre de vie à l'astéroïde *
   *****************************************/
  createLifeBar() {
    
    // Barre de vie en elle-même
    this.life_bar = document.createElement("DIV");
    this.life_bar.classList.add("life-bar");
    this.life_bar.classList.add("game");
    this.life_bar.style.width = this.pixel_size + "px";
    
    // Partie colorée de la barre de vie
    this.life_ink = document.createElement("DIV");
    this.life_ink.classList.add("life-ink");
    this.life_ink.style.width = (this.health / this.max_health * 100) + "%";
    this.life_bar.appendChild(this.life_ink);
    
    // Affichage
    AH_MainController.addToGameWindow(this.life_bar);
  }

  /**************************************************************
   * Réajuste la taille de la partie colorée de la barre de vie *
   **************************************************************/
  refreshLifeBar() { this.life_ink.style.width = (this.health / this.max_health * 100) + "%"; }

  /*****************************
   * Fonction d'initialisation *
   *****************************/
  init(size, x, y) {

    let pixel_size = BASE_AST_SIZE * size;
    this.style.width = pixel_size + "px";
    this.style.height = pixel_size + "px";

    // Si le paramétrage du jeu le spécifie, on affiche la HitBox => aide visuelle au paramétrage
    if (AH_MainController.scope.game.showHitboxes)
      this.addVisualHitBox();

    // Si les coordonnées sont passées en paramètre, on les initialise sinon c'est aléatoire
    if (x == undefined && y == undefined) {
      //--------- GESTION DU RANDOM SPOT DE DEBUT DE VAGUE ----------
      // Les astéroïdes apparaissent sur des bandes de 100px de chaque côté de l'écran
      // La position sur ces bandes est aléatoire : 0 < x < 200. Si 0 < x < 100 => gauche, sinon droite.
      // Ces cooredonnées représentent le milieu des astéroïdes. Il faut donc en déduire les propriétés left et top.
      let x = AH_MainController.entierAleatoire(AST_SPAWN_ZONE_WIDTH * 2 - 1); // *2 pour gérer les deux bandes et -1 pour avoir un nombre pair de valeurs possibles (prise en compte de la valeur 0)
      let y = AH_MainController.entierAleatoire(WINDOW_HEIGHT);

      // Placement de l'astéroïde côté gauche ou côté droit selon x (première tranche à gauche, seconde à droite)
      this.x = x < AST_SPAWN_ZONE_WIDTH
             ? x - (pixel_size / 2)
             : x - (pixel_size / 2) + AST_SPAWN_ZONE_WIDTH + (WINDOW_WIDTH - (AST_SPAWN_ZONE_WIDTH * 2));
      this.y = y - (pixel_size / 2);
      this.style.top = this.y + "px";
      this.style.left = this.x + "px";
    }

    // Application de la rotation aléatoire, de la vie et des aspects graphiques liés aux corrdonnées afin d'éviter les collisions ramdom lors du pop
    this.deltaX = AH_MainController.reelAleatoire(AST_MAX_INITIAL_AXIAL_SPEED) - (AST_MAX_INITIAL_AXIAL_SPEED / 2);
    this.deltaY = AH_MainController.reelAleatoire(AST_MAX_INITIAL_AXIAL_SPEED) - (AST_MAX_INITIAL_AXIAL_SPEED / 2);
    this.display_angle = AH_MainController.reelAleatoire(360);
    this.radial_speed = AH_MainController.reelAleatoire(1 / AST_RADIAL_SPEED_DIVIDER) - (0.5 / AST_RADIAL_SPEED_DIVIDER);
    this.pixel_size = pixel_size;
    this.size = size;
    this.max_health = BASE_AST_LIFE * size;
    this.health = BASE_AST_LIFE * size;
  }

  /***********************************************************************
   * Fonction déplaçant l'objet graphique                                *
   ***********************************************************************/
  move() {
    super.move();
    this.display_angle += this.radial_speed;

    // Permet de conserver à tout moment un angle compris entre 0° et 360° (plus pratique pour le debugging)
    if (this.display_angle >= 360) this.display_angle -= 360;
    if (this.display_angle < 0) this.display_angle += 360;

    // Application des nouvelles coordonnées et de l'angle
    this.life_bar.style.top = this.y + "px";
    this.life_bar.style.left = this.x + "px";
    this.style.transform = "rotateZ(" + this.display_angle + "deg)";
  }

  /***************************************************************************************
   * Fonction appliquant les modifications inertielles et sur la santé, dûes à un impact *
   ***************************************************************************************/
  impact(angle_rad, power) {
    this.health -= power;

    // Si la vie tombe à ou sous 0 => explosion, sinon on applique les modifications inertielles
    if (this.health <= 0) {
      this.life_bar.remove();
      this.explode();
    } else {
      this.refreshLifeBar();
      this.deltaX += Math.sin(angle_rad) * power;
      this.deltaY += Math.cos(angle_rad) * power;
      this.radial_speed += AH_MainController.reelAleatoire(1 / AST_RADIAL_SPEED_DIVIDER) - (0.5 * AST_RADIAL_SPEED_DIVIDER) * power;
    }
  }

  /************************************************************
   * Fonction de la destruction par tirs de l'astéroïde       *
   ************************************************************/
  explode() {
    super.explode(()=> { this.remove(); });
    this.classList.remove("asteroid");

    // Selon la taille de l'astéroïde : si 1 (taille mini) -> gain d'argent, sinon création d'un bonus et de deux astéroïdes plus petits
    if (this.size > 1) {

      // Calcul des coordonnées médianes du this
      let x_center = this.x + BASE_AST_SIZE / 2;
      let y_center = this.y + BASE_AST_SIZE / 2;

      // Création de deux nouveaux astéroïdes plus petits
      for (let i=0; i < NUMBER_OF_SUB_AST; i++) {
        let asteroid = new AH_Asteroid(this.size - 1, x_center, y_center);
        AH_MainController.addToGameWindow(asteroid);
      }

      // Création du bonus
      let bonus = new AH_Bonus(x_center, y_center);
      AH_MainController.addToGameWindow(bonus);
    } else {
      // Gain d'argent puis, vérification de fin de niveau (plus d'astéroïde à détruire ?)
      AH_MainController.scope.game.tinyAstDestroyed++;
      AH_MainController.checkLevelEnd();
    }
  }
}
customElements.define('ah-js-asteroid', AH_Asteroid, { extends: 'div' });

//=====================================================================================================================================

//---------------------------------------------------------------------------------------------------
//                                      Bonus
//---------------------------------------------------------------------------------------------------
//   Le bonus reçoit une vitesse horizontale et une vitesse verticale, lors de sa création.
//---------------------------------------------------------------------------------------------------
// Dans le DOM ==> <div class="game bonus"></div>
//---------------------------------------------------------------------------------------------------
/* Usage JS uniquement */
class AH_Bonus extends MobileGameElement {

  /***********************************************************************
   * Construction du bonus                                               *
   ***********************************************************************/
  constructor(x, y) {

    // Construction HTML
    super(x, y);
    this.classList.add("bonus");
    this.innerHTML = "€";

    // Génération des caractéristiques de départ
    this.init();

    // Intégration au DOM ainsi qu'au scope du controller principal
    AH_MainController.addToGameWindow(this);
  }

  /*****************************
   * Fonction d'initialisation *
   *****************************/
  init() {
    this.pixel_size = BONUS_SIZE;
    this.style.width = this.pixel_size + "px";
    this.style.height = this.pixel_size + "px";
    this.deltaX = AH_MainController.reelAleatoire(BONUS_MAX_SPEED) - (BONUS_MAX_SPEED / 2);
    this.deltaY = AH_MainController.reelAleatoire(BONUS_MAX_SPEED) - (BONUS_MAX_SPEED / 2);
    this.timeRemaining = BONUS_LIFE_TIME;
  }

  /***********************************************************************
   * Fonction déplaçant l'objet graphique                                *
   ***********************************************************************/
  move() {
    super.move();

    // Impact durée de vie => si le pallier est atteint, le bonus se met à clignoter, à 0 il diparaît
    this.timeRemaining--;
    if (this.timeRemaining == BONUS_BLINK_START_AT)
      this.classList.add("blink");
    if (this.timeRemaining == 0) 
      this.destroy();
  }
}
customElements.define('ah-js-bonus', AH_Bonus, { extends: 'div' });
