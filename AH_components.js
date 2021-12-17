/**
 * Ajoute une div affichant la hitbox, à _customElement_
 *
 * @param      {HTMLElement}  customElement  Le composant de jeu dont vous souhaitez voir la hitbox
 * @param      {number}       pxElementSize  La taille (côté du carré) de la box de l'élément HTML correspondant
 */
function ah_addHitBox(customElement, pxElementSize) {
  let div = document.createElement("DIV");
  div.classList.add("hitbox");

  // On applique le coefficient pour obtenir la marge 
  // marge de centrage => réduction du rayon = <rayon_hitbox_de_base> - <rayon_hitbox_souhaité>
  let margin = pxElementSize/2 * (1 - customElement.hitbox_size_coef);
  let cssSize = `calc(100% - ${margin * 2}px)`;
  div.style.margin = `${margin}px`;
  div.style.height = cssSize;
  div.style.width = cssSize;
  customElement.appendChild(div);
}

//---------------------------------------------------------------------------------------------------
//                                 Vaisseau du joueur
//---------------------------------------------------------------------------------------------------
//   Seul attribut nécessaire : la référence à l'objet contenant les propriétés pour mise à jour
// automatique de l'interface.
//---------------------------------------------------------------------------------------------------
// Dans le DOM ==> <div class="game spaceship"></div>, si créé directement via la classe AH_Spaceship
//---------------------------------------------------------------------------------------------------
/* Usage JS uniquement */
class AH_Spaceship extends HTMLDivElement {

  /***********************************************************************
   * Construction du vaisseau                                            *
   ***********************************************************************
   * @param  | {string}  | rs_model  | Binding                           *
   ***********************************************************************/
  constructor(rs_model) {

    // Construction HTML
    super();
    this.classList.add("game");
    this.classList.add("spaceship");

    // Si le rs_model est renseigné, on initialise la valeur avec celle pointée par rs_model
    if (rs_model) {
      let [target_obj, property] = RS_Binding.getObjectAndPropertyNameFromModel(rs_model);
      this.params = target_obj[property];
    }

    // Cette propriété est nécessaire pour régler la hitbox des visuels qui ne sont pas des disques parfaits
    this.hitbox_size_coef = SPACESHIP_HITBOX_RADIUS_COEF;

    // Si le paramétrage du jeu le spécifie, on affiche la HitBox => aide visuelle au paramétrage
    if (AH_MainController.scope.game.showHitboxes)
      ah_addHitBox(this, SPACESHIP_SIZE);

    // Position initiale, au centre de la scène
    this.init();

  }

  /*****************************
   * Fonction d'initialisation *
   *****************************/
  init() {
    this.params.angle = 0;
    this.params.deltaX = 0;
    this.params.deltaY = 0;
    this.x = (WINDOW_WIDTH - SPACESHIP_SIZE) / 2;
    this.y = (WINDOW_HEIGHT - SPACESHIP_SIZE) / 2;
    this.pixel_size = SPACESHIP_SIZE;
    this.style.top = this.y + "px";
    this.style.left = this.x + "px";
  }

  /***********************************************************************
   * Fonction déplaçant l'objet graphique                                *
   ***********************************************************************/
  move() {

    // Calcul des nouvelles coordonnées
    this.y -= this.params.deltaY;
    this.x += this.params.deltaX;
    
    // Ramène à l'autre bord en cas de sortie d'écran
    if (this.y > WINDOW_HEIGHT) 
      this.y -= (WINDOW_HEIGHT + SPACESHIP_SIZE);
    if (this.y < -SPACESHIP_SIZE) 
      this.y += (WINDOW_HEIGHT + SPACESHIP_SIZE);
    if (this.x > WINDOW_WIDTH) 
      this.x -= (WINDOW_WIDTH + SPACESHIP_SIZE);
    if (this.x < -SPACESHIP_SIZE) 
      this.x += (WINDOW_WIDTH + SPACESHIP_SIZE);

    // Permet de conserver un angle compris entre 0° et 360°
    if (this.params.angle >= 360) this.params.angle -= 360;
    if (this.params.angle < 0) this.params.angle += 360;

    // Application des nouvelles coordonnées et de l'angle
    this.style.top = this.y + "px";
    this.style.left = this.x + "px";
    this.style.transform = "rotateZ(" + this.params.angle + "deg)";
  }

  /***********************************
   * Fonction invoquée lors d'un tir *
   ***********************************/
  shoot() {
    let scope = AH_MainController.scope;

    // Calcul des coordonnées d'apparition du tir :
    //  -> x et y correspondent au coin supérieur gauche.
    //  -> il faut déterminer le point central du vaisseau pour déterminer les coordonnées d'apparition du tir selon l'angle
    let angle_rad = this.params.angle * Math.PI / 180;
    let power = AH_Shop.getShopAttributeValue("POW");
    let x = this.x + (SPACESHIP_SIZE / 2) + (Math.sin(angle_rad) * SPACESHIP_SIZE / 2) - (power * SHOT_BASE_SIZE / 2);
    let y = this.y + (SPACESHIP_SIZE / 2) - (Math.cos(angle_rad) * SPACESHIP_SIZE / 2) - (power * SHOT_BASE_SIZE / 2);

    // Création du tir
    let shot = new AH_Shot(power, this.params.angle, AH_Shop.getShopAttributeValue("VEL"), x, y);
  }

  /************************************************************
   * Fonction invoquée lors d'une collision avec un asteroïde *
   ************************************************************/
  explode() {
    AH_MainController.scope.controls.paused = true;
    this.classList.add("explosion");
    setTimeout(()=> {
      this.init();
      AH_MainController.getWaveIncomesReport(true);
    }, 450);
  }
}
customElements.define('ah-js-spaceship', AH_Spaceship, { extends: 'div' });

/* Usage HTML uniquement */
// <ah-spaceship rs-model="scope.params.spaceship"></ah-spaceship>
class AH_HTML_Spaceship extends HTMLElement {

  /*******************************************************************
   * Constructeur: appeler simplement le constructeur de HTMLElement *
   *******************************************************************/
  constructor() { super(); }

  /*************************************************
   * S'exécute lors de l'ajout du composant au DOM *
   *************************************************/
  connectedCallback() {
    let shadow = this.attachShadow({ mode: SHADOW_MODE });
    let rs_model = this.getAttribute("rs-model");
    RS_WCL.styleShadow(shadow, 'AH_components.css');
    this.innerSpaceship = new AH_Spaceship(rs_model);
    shadow.appendChild(this.innerSpaceship);
  }

  // Transposition des fonction et propriétés du composant interne
  get hitbox_size_coef() { return this.innerSpaceship.hitbox_size_coef; }
  get pixel_size() { return this.innerSpaceship.pixel_size; }
  get x() { return this.innerSpaceship.x; }
  get y() { return this.innerSpaceship.y; }
  move() { this.innerSpaceship.move(); }
  shoot() { this.innerSpaceship.shoot(); }
  init() { this.innerSpaceship.init(); }
  explode() { this.innerSpaceship.explode(); }
  getBoundingClientRect() { return this.innerSpaceship.getBoundingClientRect(); } // Surcharge de la fonction HTMLElement.getBoundingClientRect()
}
customElements.define('ah-spaceship', AH_HTML_Spaceship);


//=====================================================================================================================================

//---------------------------------------------------------------------------------------------------
//                                          Tir
//---------------------------------------------------------------------------------------------------
// Le tir s'auto retire du DOM, à sa sortie de l'écran ou lors d'un impact
//---------------------------------------------------------------------------------------------------
// Dans le DOM ==> <div class="game shot"></div>
//---------------------------------------------------------------------------------------------------
/* Usage JS uniquement */
class AH_Shot extends HTMLDivElement {

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
    super();
    this.classList.add("game");
    this.classList.add("shot");
    this.style.top = y + "px";
    this.style.left = x + "px";
    this.style.width = SHOT_BASE_SIZE * power + "px";
    this.style.height = SHOT_BASE_SIZE * power + "px";

    // Initialisation des données internes au composant
    this.x = x;
    this.y = y;
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
  move() {

    // Calcul des nouvelles coordonnées
    this.y -= this.deltaY;
    this.x += this.deltaX;
    
    // Retire l'élément du DOM en cas de sortie d'écran
    let shot_size = SHOT_BASE_SIZE * this.power;
    if (this.y > WINDOW_HEIGHT || this.y < -shot_size || this.x > WINDOW_WIDTH || this.x < -shot_size) 
      this.remove();

    // Application des nouvelles coordonnées et de l'angle
    this.style.top = this.y + "px";
    this.style.left = this.x + "px";
  }

  /************************************************************
   * Fonction invoquée lors d'une collision avec un asteroïde *
   ************************************************************/
  explode() {
    this.classList.add("explosion");
    this.classList.remove("shot");
    setTimeout(()=> {
      this.remove();
    }, 450);
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
class AH_Asteroid extends HTMLDivElement {

  /***********************************************************************
   * Construction de l'astéroïde                                         *
   ***********************************************************************
   * x et y sont optionnels. Par défaut, placement aléatoire.            *
   ***********************************************************************/
  constructor(size, x, y) {

    // Construction HTML
    super();
    this.classList.add("game");
    this.classList.add("asteroid");

    // Cette propriété est nécessaire pour régler la hitbox des visuels qui ne sont pas des disques parfaits
    this.hitbox_size_coef = AST_HITBOX_RADIUS_COEF;

    // Génération des caractéristiques de départ
    this.init(size, x, y);

    // Intégration au DOM ainsi qu'au scope du controller principal
    AH_MainController.addToGameWindow(this);
    AH_MainController.scope.asteroids.push(this);
  }

  /*****************************
   * Fonction d'initialisation *
   *****************************/
  init(size, x, y) {

    let pixel_size = BASE_AST_SIZE * size;
    this.style.width = pixel_size + "px";
    this.style.height = pixel_size + "px";

    // Si le paramétrage du jeu le spécifie, on affiche la HitBox => aide visuelle au paramétrage
    if (AH_MainController.scope.game.showHitboxes)
      ah_addHitBox(this, pixel_size);

    // Si les coordonnées sont passées en paramètre, on les initialise sinon c'est aléatoire
    if (x != undefined && y != undefined) {
      this.x = x;
      this.y = y;
    } else {
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
    }

    // Application de la rotation aléatoire, de la vie et des aspects graphiques liés aux corrdonnées afin d'éviter les collisions ramdom lors du pop
    this.style.top = this.y + "px";
    this.style.left = this.x + "px";
    this.deltaX = AH_MainController.reelAleatoire(AST_MAX_INITIAL_AXIAL_SPEED) - (AST_MAX_INITIAL_AXIAL_SPEED / 2);
    this.deltaY = AH_MainController.reelAleatoire(AST_MAX_INITIAL_AXIAL_SPEED) - (AST_MAX_INITIAL_AXIAL_SPEED / 2);
    this.display_angle = AH_MainController.reelAleatoire(360);
    this.radial_speed = AH_MainController.reelAleatoire(1 / AST_RADIAL_SPEED_DIVIDER) - (0.5 / AST_RADIAL_SPEED_DIVIDER);
    this.pixel_size = pixel_size;
    this.size = size;
    this.maxHealth = BASE_AST_LIFE * size;
    this.health = BASE_AST_LIFE * size;
  }

  /***********************************************************************
   * Fonction déplaçant l'objet graphique                                *
   ***********************************************************************/
  move() {

    // Calcul des nouvelles coordonnées
    this.display_angle += this.radial_speed;
    this.y -= this.deltaY;
    this.x += this.deltaX;
    
    // Ramène à l'autre bord en cas de sortie d'écran
    if (this.y > WINDOW_HEIGHT) 
      this.y -= (WINDOW_HEIGHT + this.pixel_size);
    if (this.y < -this.pixel_size) 
      this.y += (WINDOW_HEIGHT + this.pixel_size);
    if (this.x > WINDOW_WIDTH) 
      this.x -= (WINDOW_WIDTH + this.pixel_size);
    if (this.x < -this.pixel_size) 
      this.x += (WINDOW_WIDTH + this.pixel_size);

    // Permet de conserver un angle compris entre 0° et 360°
    if (this.display_angle >= 360) this.display_angle -= 360;
    if (this.display_angle < 0) this.display_angle += 360;

    // Application des nouvelles coordonnées et de l'angle
    this.style.top = this.y + "px";
    this.style.left = this.x + "px";
    this.style.transform = "rotateZ(" + this.display_angle + "deg)";
  }

  /***************************************************************************************
   * Fonction appliquant les modifications inertielles et sur la santé, dûes à un impact *
   ***************************************************************************************/
  impact(angle_rad, power) {
    this.health -= power;

    // Si la vie tombe à ou sous 0 => explosion, sinon on applique les modifications inertielles
    if (this.health <= 0)
      this.explode();
    else {
      this.deltaX += Math.sin(angle_rad) * power;
      this.deltaY += Math.cos(angle_rad) * power;
      this.radial_speed += AH_MainController.reelAleatoire(1 / AST_RADIAL_SPEED_DIVIDER) - (0.5 * AST_RADIAL_SPEED_DIVIDER) * power;
    }
  }

  /************************************************************
   * Fonction de la destruction par tirs de l'astéroïde       *
   ************************************************************/
  explode() {

    // Affichage de l'explosion puis disparition
    this.classList.add("explosion");
    setTimeout(()=> {
      this.remove();
    }, 450);

    // Auto-suppression de la liste des astéroïdes dans le scope du controller principal
    let index = AH_MainController.scope.asteroids.indexOf(this);
    if (index > -1)
      AH_MainController.scope.asteroids.splice(index, 1);
    else console.error("Je le trouve pas dans la liste, lui... comment ça se fait ?", this, AH_MainController.scope.asteroids);

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
class AH_Bonus extends HTMLDivElement {

  /***********************************************************************
   * Construction du bonus                                               *
   ***********************************************************************/
  constructor(x, y) {

    // Construction HTML
    super();
    this.classList.add("game");
    this.classList.add("bonus");
    this.innerHTML = "€";

    // Génération des caractéristiques de départ
    this.init(x, y);

    // Intégration au DOM ainsi qu'au scope du controller principal
    AH_MainController.addToGameWindow(this);
    AH_MainController.scope.bonusItems.push(this);
  }

  /*****************************
   * Fonction d'initialisation *
   *****************************/
  init(x, y) {
    this.x = x;
    this.y = y;
    this.style.width = BONUS_SIZE + "px";
    this.style.height = BONUS_SIZE + "px";
    this.style.left = x + "px";
    this.style.top = y + "px";
    this.deltaX = AH_MainController.reelAleatoire(BONUS_MAX_SPEED) - (BONUS_MAX_SPEED / 2);
    this.deltaY = AH_MainController.reelAleatoire(BONUS_MAX_SPEED) - (BONUS_MAX_SPEED / 2);
    this.timeRemaining = BONUS_LIFE_TIME;
  }

  /***********************************************************************
   * Fonction déplaçant l'objet graphique                                *
   ***********************************************************************/
  move() {

    // Calcul des nouvelles coordonnées
    this.y += this.deltaY;
    this.x += this.deltaX;
    
    // Ramène à l'autre bord en cas de sortie d'écran
    if (this.y > WINDOW_HEIGHT) 
      this.y -= (WINDOW_HEIGHT + BONUS_SIZE);
    if (this.y < -BONUS_SIZE) 
      this.y += (WINDOW_HEIGHT + BONUS_SIZE);
    if (this.x > WINDOW_WIDTH) 
      this.x -= (WINDOW_WIDTH + BONUS_SIZE);
    if (this.x < -BONUS_SIZE) 
      this.x += (WINDOW_WIDTH + BONUS_SIZE);

    // Application des nouvelles coordonnées
    this.style.top = this.y + "px";
    this.style.left = this.x + "px";

    // Impact durée de vie => si le pallier est atteint, le bonus se met à clignoter, à 0 il diparaît
    this.timeRemaining--;
    if (this.timeRemaining == BONUS_BLINK_START_AT)
      this.classList.add("blink");
    if (this.timeRemaining == 0) 
      this.destroy();
  }

  /**
   * Fonction libérant la mémoire lorsque l'objet n'est plus utile
   */
  destroy() {

    // Auto-suppression de la liste des bonus dans le scope du controller principal
    let index = AH_MainController.scope.bonusItems.indexOf(this);
    if (index > -1)
      AH_MainController.scope.bonusItems.splice(index, 1);
    else console.error("Je le trouve pas dans la liste, lui... comment ça se fait ?", this, AH_MainController.scope.bonusItems);

    // Suppression du DOM
    this.remove();
  }
}
customElements.define('ah-js-bonus', AH_Bonus, { extends: 'div' });
