/***** Fonctions AJaX *****/

/****************************************************************************
 * Fonction de routage pour l'affichage dans la partie centrale de la page. *
 ****************************************************************************
 * @param | {String}   | url      | URL de la ressource HTML                *
 * @param | {function} | callback | Fonction de rappel optionnelle          *
 * @param | {Object}   | target   | Élément HTML cible du routage           *
 ****************************************************************************/
function routage(url, callback, target) {
  var elmnt = target || document.getElementById('milieu');
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        elmnt.innerHTML = this.responseText;
        if (callback)
          callback();
      }
      if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
    }
  }
  xhttp.open("GET", url, true);
  xhttp.send();
}

/**********************************************************************************
 * Fonction générique d'appel AJaX                                                *
 **********************************************************************************
 * @param  | {String}        | url    | URL de l'API appelée                      *
 * @param  | {String}        | method | Méthode de passage des paramètres         *
 * @param  | {String|Object} | params | Paramètres (string en GET, objet en POST) *
 * @param  | {Function}      | fnOk   | Fonction de rappel si succès              *
 **********************************************************************************/
function xhr(url, method, params, fnOk) {
  let xhttp = new XMLHttpRequest();
  xhttp.responseType = 'json';
  xhttp.onload = function () { 
    fnOk(this.response);
  }
  
  // On paramètre la requête différemment suivant la méthode de transport des paramètres
  if (method === "GET") {
    if (params) params = "?" + params;
    xhttp.open(method, url + params, true);
    xhttp.send();
  } else if (method === "POST") {
    xhttp.open(method, url);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(params));
  } else console.error(`xhr() ===> Type de requête inconnu: '${method}'`);
}

/**************************************************************************************
 * Constantes relatives à l'affichage des toasts, encapsulés dans une constante objet *
 * @type                                          {Object}                            *
 **************************************************************************************/
const MsgLevel = {
  INFO: "rs-info",
  WARN: "rs-warn",
  ERR: "rs-err"
}
const SHADOW_MODE = 'open';  // 'open' ou 'closed' selon qu'on veuille afficher le shadow DOM ou pas

/*******************************************************************************
 * Ces classes sont une librairie de composants web, développée en interne.    *
 * Leur usage est strictement réservé aux employés de Roquefort Softwares dans *
 * le cadre de leurs missions.                                                 *
 *******************************************************************************/
class RS_WCL {

  /***** Fonctions d'affichage de messages *****/
  /**
   * Un TOAST est un panneau surgissant d'une bordure de l'écran (le bas le plus souvent)
   * et disparraissant au bout d'un certain temps
   * 
   * On peut afficher un toast par appel à la méthode "showToastMessage()"
   *
   * Cette fonction attend le contenu à afficher ("message"), le niveau d'alerte du message ("type")
   * ainsi que la durée d'affichage en millisecondes
   *-------------------------------------------------------------------------------
   * Un type de TOAST prédéfini existe également : l'afficheur d'erreurs
   *
   * Un appel à la méthode "displayErrors()" est cet afficheur d'erreurs
   *
   * La méthode reçoit la liste des messages d'erreur collectés. Cette liste est 
   * mise en forme dans un TOAST de type "MsgLevel.ERR"
   */

  /********************************************************************************
   * Affiche un message sur un toast                                              *
   ********************************************************************************
   * @param | {string} | message | Message à afficher                             *
   * @param | {string} | type    | Type de message -> classe d'affichage du toast *
   * @param | {number} | duree   | Durée d'affichage en ms                        *
   ********************************************************************************
   * type peut recevoir une valeur de type string parmi :                         *
   *     - MsgLevel.INFO : couleur verte -> message d'information                 *
   *     - MsgLevel.WARN : couleur orange -> message d'avertissement              *
   *     - MsgLevel.ERR  : couleur rouge -> message d'erreur                      *
   *       ==> Voir constante MsgLevel, ci-dessus                                 *
   ********************************************************************************/
  static showToastMessage(message, type, duree) {
    let eltToast = document.getElementById("rs-toast");
    eltToast.innerHTML = message;
    eltToast.classList.add(type);
    eltToast.classList.add("rs-shown");
    setTimeout(function() { 
      eltToast.classList.remove("rs-shown");
      eltToast.classList.remove(type);
      eltToast.innerHTML = "";
    }, duree);
  }

  /**************************************************************
   * Affiche les erreurs listées dans lstErrors                 *
   **************************************************************
   * @param | {Array} | lstErrors | Liste des messages d'erreur *
   **************************************************************/
  static displayErrors(lstErrors) {
    let message = "<ul>";
    for (let err of lstErrors)
      message += "<li>" + err + "</li>";
    message += "</ul>";
    //RS_WCL.showToastMessage(message, MsgLevel.ERR, 5000);
    RS_Alert(message, "Erreurs de saisie détectées", "Ok");
  }

  /*******************************************************************
   * Génère une balise LINK CSS et l'ajoute au shadowRoot            *
   *******************************************************************
   * @param | {ShadowRoot} | shadowRoot | Racine de shadow DOM       *
   * @param | {string}     | cssUri     | URL de la feuille de style *
   *******************************************************************/
  static styleShadow(shadowRoot, cssUri) {
    let linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', cssUri);
    shadowRoot.appendChild(linkElem);
  }

  /******************************************************************
   * Génère une balise SCRIPT et l'ajoute au shadowRoot             *
   ******************************************************************
   * @param | {HTMLElement} | shadowRoot | Racine d'un shadow DOM   *
   * @param | {string}      | type       | Type de script (langage) *
   * @param | {string}      | scriptUri  | URL de la ressource      *
   ******************************************************************/
  static scriptShadow(shadowRoot, type, scriptUri) {
    let scriptElem = document.createElement("SCRIPT");
    scriptElem.setAttribute("type", type);
    scriptElem.setAttribute("src", scriptUri);
    shadowRoot.appendChild(scriptElem);
  }

  /**********************************************************
   * Fonction d'arrondi décimal (précision en ^10)          *
   **********************************************************
   * @param | {number} | number    | Valeur d'origine       *
   * @param | {number} | precision | Précision de l'arrondi *
   **********************************************************
   * @return  {number}   Valeur arrondie à (10 ^ precision) *
   **********************************************************/
  static roundDec(number, precision) {
    var precision = precision || 2;
    var tmp = Math.pow(10, precision);
    return parseFloat((Math.round(number * tmp) / tmp).toFixed(precision));
  }

  /*************************************************************************
   * Convertit une collection en Array (itérable)                          *
   *************************************************************************
   * @param | {Collection} | collection | La collection (non itérable)     *
   *************************************************************************
   * @return {Array}                      La liste itérable correspondante *
   *************************************************************************/
  static collectionToArray(collection) {
    let arr = [],
        i = collection.length;
    while (i) 
      arr[--i] = collection[i];
    return arr;
  }
}

/**************************************************************************
 * S'utilise comme une classe avec appels chaînés à "addBinding" possible *
 * @param | {object} | b | Décrit le binding à enregistrer                *
 **************************************************************************
 * Exemple (hors shadow DOM):                                             *
 *   new RS_Binding({                                                     *
 *     object: obj,                                                       *
 *     property: "a" [,                                                   *
 *     callback: function() { // hook post modification }]                *
 *   })                                                                   *
 *   .addBinding(myInputElement1, "value", "keyup")                       *
 *   .addBinding(myInputElement2, "value", "keyup")                       *
 *   .addBinding(myDOMElement, "innerHTML")                               *
 *                                                                        *
 * Exemple (depuis shadow DOM):                                           *
 *   RS_Binding.bindModel("scope.toto", elt, "value", "keyup");           *
 **************************************************************************/
class RS_Binding {

  /* Dans le constructeur, on met tout en place pour pouvoir ajouter des bindings sur la propriété ciblée */
  constructor(b) {
    this.elementBindings = [];
    this.value = b.object[b.property];
    this.setterCallback = b.callback;

    // Mise en place de l'accesseur et du mutateur puis application de la valeur au model
    try {
      Object.defineProperty(b.object, b.property, {
        get: ()=> this.valueGetter(),
        set: (val)=> this.valueSetter(val)
      });
    } catch (Error) { /* En mode HTML, au chargement initial, le constructeur est appelé deux fois :/ */ }
    
    // Application de la valeur à tous les éléments ciblés par le binding
    b.object[b.property] = this.value;
  }

  /* Accesseur et mutateur de la "value" du binding (le mutateur se charge du binding model -> DOM) */
  valueGetter() { return this.value; }
  valueSetter (val) {
    this.value = val;
    for (let binding of this.elementBindings)
      binding.element[binding.attribute] = val;
    if (this.setterCallback) 
      this.setterCallback(val);
  }

  /********************************************************************************************
   * Fonction permettant d'ajouter un binding                                                 *
   ********************************************************************************************
   * @param | {HTMLElement} | element   | Élément de la page                                  *
   * @param | {string}      | attribute | Nom de l'attribut de l'élément concerné             *
   * @param | {string}      | event     | Nom de l'événement sur lequel déclencher le binding *
   * @param | {Function}    | callback  | Fonction exécutée dans l'événement                  *
   ********************************************************************************************
   * @return  {RS_Binding}  Le pointeur "this" est retourné pour permettre les appels chaînés *
   ********************************************************************************************/
  addBinding(element, attribute, event, callback) {
    let binding = {
      element: element,
      attribute: attribute
    };

    // Si un événement est passé en paramètre, on met en place un binding DOM -> model
    if (event) {
      element.addEventListener(event, (event)=> {
        let val = event.srcElement[attribute];
        this.valueSetter(val);
        if (callback)
          callback(val);
      });
      binding.event = event;
    }

    // On stocke, on applique la valeur sur l'élément DOM et on retourne le binding
    this.elementBindings.push(binding);
    element[attribute] = this.value;
    return this;
  }

  /********************************************************************
   * Permet la mise en place d'un callback sur le SET d'une propriété *
   ********************************************************************
   * @param | {object}   | target_obj | Objet contenant la propriété  *
   * @param | {string}   | prop       | Propriété à observer          *
   * @param | {Function} | callback   | Fonction de rappel en SET     *
   ********************************************************************
   * @return  {class}      Le controller courant, mis à jour          *
   ********************************************************************/
  static bindLoop(target_obj, prop, callback) {
    new RS_Binding({
      object: target_obj,
      property: prop,
      callback: callback
    });

    // On renvoi le controller courant, modifié par nos soins
    return document.currentController;
  }

  /***************************************************************************
   * Permet de mettre en place un binding depuis un shadow DOM               *
   ***************************************************************************
   * @param | {string}      | rs_model  | Le chemin vers la propriété        *
   * @param | {HTMLElement} | element   | L'élément de DOM concerné          *
   * @param | {string}      | attribute | Attribut concerné                  *
   * @param | {string}      | eventName | Nom de l'événement de rattachement *
   * @param | {function}    | callback  | Hook dans l'événement              *
   * @param | {function}    | setter    | Hook dans le setter                *
   ***************************************************************************
   * @return          {class}          Le controller courant, à jour         *
   ***************************************************************************/
  static bindModel(rs_model, element, attribute, eventName, callback, setter) {

    // Création du binding
    let [target_obj, property] = RS_Binding.getObjectAndPropertyNameFromModel(rs_model);
    new RS_Binding({
      object: target_obj,
      property: property,
      callback: setter
    })
    .addBinding(element, attribute, eventName, callback);

    // On renvoi le controller courant, modifié par nos soins
    return document.currentController;
  }

  /*********************************************************************************************
   * Permet de récupérer l'objet et le nom de propriété correspondants à une chaîne "rs_model" *
   *********************************************************************************************
   * @param | {string} | rs_model | Chaîne décrivant le chemin d'accès à une propriété         *
   *********************************************************************************************
   * @return   {[Object, string]}    L'objet ciblé et le nom de sa propriété                   *
   *********************************************************************************************/
  static getObjectAndPropertyNameFromModel(rs_model) {
    
    // Extraction du nom de propriété
    let rs_model_split = rs_model.split(".");
    let property = rs_model_split.pop();

    // On se positionne sur l'objet concerné (ciblage de l'objet référencé par la string)
    let target_obj = document.currentController;
    if (rs_model_split[0] == document.currentController.name)
      rs_model_split.shift();

    // Parcourt des sous-propriétés
    for (let sub_object of rs_model_split) {
      let idx_crochet = sub_object.indexOf("[");
      if (idx_crochet > -1) {
        target_obj = RS_Binding.updateTarget(target_obj, sub_object.substring(0, idx_crochet), true);
        target_obj = RS_Binding.updateTarget(target_obj, sub_object.substring(idx_crochet + 1, sub_object.length - 1), false);
      } else target_obj = RS_Binding.updateTarget(target_obj, sub_object, false);
    }

    // On retourne [Objet, nom_de_la_propriété]
    return [target_obj, property];
  }

  /*************************************************************
   * Utilisée dans la mise en place des bindings               *
   * Cette méthode permet d'entrer en profondeur, d'un niveau  *
   * dans un modèle objet littéral                             *
   *************************************************************
   * @param | {object} | target_obj | Objet de travail         *
   * @param | {string} | sub_object | Nom de la sous propriété *
   *************************************************************/
  static updateTarget(target_obj, sub_object, isArray) {
    if (!target_obj[sub_object])
      target_obj[sub_object] = isArray ? [] : {};
    return target_obj[sub_object];
  }
}

/********************************************************************
 * Fonction redéfinissant les fonction de modification structurelle *
 * d'un Array afin d'y ajouter un hook                              *
 ********************************************************************
 * @param | {Array}    | arr      | Liste à observer                *
 * @param | {Function} | callback | Fonction de rappel à câbler     *
 ********************************************************************/
function RS_ArrayObserver(arr, callback, isRecursive) {
  arr.push = (obj)=> {
    let push = Array.prototype.push.apply(arr, [obj]);
    callback(push);
    if (isRecursive)
      RS_BindValuesRecursively(arr, arr.length - 1, ()=> { callback(); });
    return push;
  };
  arr.pop = function() {
    let popped = Array.prototype.pop.apply(arr, []);
    callback(popped);
    return popped;
  };
  arr.reverse = function() {
    let result = Array.prototype.reverse.apply(arr, []);
    callback(result);
    return result;
  };
  arr.shift = function() {
    let deleted_item = Array.prototype.shift.apply(arr, []);
    callback(deleted_item);
    return deleted_item;
  };
  arr.sort = function() {
    let result = Array.prototype.sort.apply(arr, []);
    callback(result);
    return result;
  };
  arr.splice = function(i, length, itemsToInsert) {
    let deleted_objects = Array.prototype.splice.apply(arr, arguments);
    callback(deleted_objects);
    if (isRecursive)
      for (let idx = i; idx < i + arguments.length - 2; idx++)
        RS_BindValuesRecursively(arr, idx, ()=> { callback(); });
    return deleted_objects;
  };
  arr.unshift = function() {
    let new_length = Array.prototype.unshift.apply(arr, arguments);
    callback();
    if (isRecursive)
      RS_BindValuesRecursively(arr, 0, ()=> { callback(); });
    return new_length;
  };
}

/***************************************************************************************************
 * Fonction récursive de mise en place d'un callback en cas de modification d'une propriété donnée *
 * ATTENTION: ne détecte pas l'ajout de nouvelles propriétés aux objets                            *
 ***************************************************************************************************
 * @param | {Object}   | target_obj | Objet cible                                                  *
 * @param | {string}   | property   | Propriété de l'objet cible, sur lequel appliquer le callback *
 * @param | {Function} | callback   | Fonction de rappel appelée en cas de modification de l'objet *
 ***************************************************************************************************/
function RS_BindValuesRecursively(target_obj, property, callback) {

  // S'il s'agit d'une liste, on place un observer d'Array, en plus du bind de base
  // S'il s'agit d'un objet, il faut parcourir les propriétés
  // Dans un cas comme dans l'autre, il va falloir descendre récursivement dans les éléments/propriétés
  let targeted_prop = target_obj[property];
  RS_Binding.bindLoop(target_obj, property, ()=> { callback(); });
  if (Array.isArray(targeted_prop)) {
    RS_ArrayObserver(targeted_prop, ()=> { callback(); }, true);
    for (let idx = 0; idx < targeted_prop.length; idx++)
      RS_BindValuesRecursively(targeted_prop, idx, ()=> { callback(); });
  } else if (typeof(targeted_prop) == 'object') {
    for (let prop in targeted_prop)
      RS_BindValuesRecursively(targeted_prop, prop, ()=> { callback(); });
  }
}

/****************************************************************
 * Classe ajoutant un nouveau hook: childrenAvailableCallback() *
 * Enrichissement de la classe HTMLElement                      *
 ****************************************************************/
class HTMLBaseElement extends HTMLElement {
  constructor(...args) {
    const self = super(...args)
    self.parsed = false // guard to make it easy to do certain stuff only once
    self.parentNodes = []
    return self
  }

  setup() {

    // collect the parentNodes
    let el = this;
    while (el.parentNode) {
      el = el.parentNode
      this.parentNodes.push(el)
    }
    
    // check if the parser has already passed the end tag of the component
    // in which case this element, or one of its parents, should have a nextSibling
    // if not (no whitespace at all between tags and no nextElementSiblings either)
    // resort to DOMContentLoaded or load having triggered
    if ([this, ...this.parentNodes].some(el=> el.nextSibling) || document.readyState !== 'loading') {
      this.childrenAvailableCallback();
    } else {
      this.mutationObserver = new MutationObserver(() => {
        if ([this, ...this.parentNodes].some(el=> el.nextSibling) || document.readyState !== 'loading') {
          this.childrenAvailableCallback()
          this.mutationObserver.disconnect()
        }
      });

      this.mutationObserver.observe(this, {childList: true});
    }
  }
}
