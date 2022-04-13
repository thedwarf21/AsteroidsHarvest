/*
  Copyright © 10/02/2020, Roquefort Softwares Web Components Library

  Permission is hereby granted, free of charge, to any person obtaining a copy of this Library and associated 
  documentation files (the “Software”), to deal in the Software without restriction, including without limitation 
  the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  The Software is provided “as is”, without warranty of any kind, express or implied, including but not limited to 
  the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the 
  authors or copyright holders Roquefort Softwares be liable for any claim, damages or other liability, whether in 
  an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or 
  other dealings in the Software.
  
  Except as contained in this notice, the name of the Roquefort Softwares Web Components Library shall not be used 
  in advertising or otherwise to promote the sale, use or other dealings in this Software without prior written 
  authorization from Roquefort Softwares.
*/

//---------------------------------------------------------------------------------------------------
//                               Boîte de dialogue personnalisée
//---------------------------------------------------------------------------------------------------
class RS_Dialog extends HTMLDivElement {

  /*******************************************************************************************
   * Génère une boîte de dialogue et retourne l'objet destiné à recevoir le contenu          *
   *******************************************************************************************
   * @param | {string}  | id                 | ID à affecter à la popup                      *
   * @param | {string}  | title              | Titre à afficher en entête                    *
   * @param | {Array}   | bgClassList        | Liste des classes CSS du fond                 *
   * @param | {Array}   | containerClassList | Liste des classes CSS de la modale            *
   * @param | {Array}   | classList          | Liste des classes CSS du contenu              *
   * @param | {boolean} | showCloseBtn       | Permet de ne pas mettre de bouton X           *
   * @param | {string}  | urlHtmlContent     | URL du template HTML                          *
   * @param | {Function}| onAfterContentLoad | Hook exécuté après injection du template HTML *
   *******************************************************************************************
   * @return              {DOMElement}               La DIV de contenu                       *
   *******************************************************************************************/
  constructor(id, title, bgClassList, containerClassList, classList, showCloseBtn, urlHtmlContent, onAfterContentLoad) {
    
    // On commence par générer le fond inactivant la fenêtre (onClick = close)
    super();
    this.id = id;
    this.classList.add("rs-modal-bg");
    for (let classe of bgClassList)
      this.classList.add(classe);

    // Ensuite on construit la boîte de dialogue en elle-même
    let popup = document.createElement("DIV");
    popup.id = name + "_container";
    popup.classList.add("rs-modal");
    popup.classList.add("rs-closed");
    for (let classe of containerClassList)
      popup.classList.add(classe);

    // Création et ajout à la boîte de dialogue du header
    let header = document.createElement("DIV");
    header.innerHTML = title;
    header.classList.add("rs-modal-title");
    popup.appendChild(header);
    
    // On ajoute un bouton de fermeture de la boîte de dialogue (si besoin)
    if (showCloseBtn) {
      let btn = document.createElement("INPUT");
      btn.setAttribute("type", "button");
      btn.value = "X";
      btn.classList.add("rs-close-btn");
      btn.addEventListener("click", ()=> { this.closeModal(); });
      header.appendChild(btn);
    }
    
    // Création et ajout à la boîte de dialogue de la div de contenu
    let content = document.createElement("DIV");
    content.id = name;
    content.classList.add("rs-modal-content");
    for (let classe of classList)
      content.classList.add(classe);
    popup.appendChild(content);

    // Si un template est paramétré, on l'utilise comme contenu HTML
    if (urlHtmlContent) {
      if (onAfterContentLoad)
        routage(urlHtmlContent, onAfterContentLoad, content);
      else routage(urlHtmlContent, null, content);
    }

    // Intégration de la boîte de dialogue au corps de document
    this.appendChild(popup);
    setTimeout(()=> { popup.classList.remove("rs-closed") }, 25);
  }

  /*****************************************
   * Fonction fermant la boîte de dialogue *
   *****************************************/
  closeModal() {
    let popup = this.getElementsByClassName("rs-modal")[0];
    let close_btn_col = popup.getElementsByClassName("rs-close-btn");
    if (close_btn_col.length)
      close_btn_col[0].remove();
    popup.classList.add("rs-closed");

    // On attend la fin de l'animation pour supprimer le nœud
    setTimeout(()=> { popup.parentNode.remove(); }, 500);
  }

  /***************************************************************
   * Accès rapide aux méthodes de manipulation de DOM du content *
   ***************************************************************/
  appendToContent(elt) { this.getElementsByClassName("rs-modal-content")[0].appendChild(elt); }
  removeFromContent(elt) { this.getElementsByClassName("rs-modal-content")[0].removeChild(elt); }
  setContentInnerHTML(html) { this.getElementsByClassName("rs-modal-content")[0].innerHTML = html; }
}
customElements.define('rs-wcl-dialog', RS_Dialog, { extends: 'div' });

/* Usage HTML uniquement */
/******************************************************************
 * Possibilité de mettre une balise "<rs-dialog-content>" dans la *
 * balise "<rs-dialog>", pour initialiser le contenu directement  *
 * dans le template                                               *
 ******************************************************************/
class RSWCLDialog extends HTMLElement {

  /*******************************************************************
   * Constructeur: appeler simplement le constructeur de HTMLElement *
   *******************************************************************/
  constructor() { super(); }

  /*************************************************
   * S'exécute lors de l'ajout du composant au DOM *
   *************************************************/
  connectedCallback() {
    let html_content = this.getElementsByTagName("rs-dialog-content")[0].innerHTML;
    let shadow = this.attachShadow({ mode: SHADOW_MODE });
    let id = this.getAttribute("id");
    let title = this.getAttribute("rs-title");
    let bgClasses = this.getAttribute("fader-class");
    let bgClassList = bgClasses ? bgClasses.split(" ") : [];
    let containerClasses = this.getAttribute("popup-class");
    let containerClassList = containerClasses ? containerClasses.split(" ") : [];
    let classes = this.getAttribute("class");
    let classList = classes ? classes.split(" ") : [];
    RS_WCL.styleShadow(shadow, 'css/rs_dialog.css');
    RS_WCL.styleShadow(shadow, 'css/theme.css');
    let popup = new RS_Dialog(id, title, bgClassList, containerClassList, classList, true);
    popup.setContentInnerHTML(html_content);
    shadow.appendChild(popup);
  }

  appendChild(elt)    { this.shadowRoot.querySelector('.rs-modal-content').appendChild(elt); }
  removeChild(elt)    { this.shadowRoot.querySelector('.rs-modal-content').removeChild(elt); }
  get innerHTML()     { return this.shadowRoot.querySelector('.rs-modal-content').innerHTML; }
  set innerHTML(val)  { this.shadowRoot.querySelector('.rs-modal-content').innerHTML = val; }
}
customElements.define('rs-dialog', RSWCLDialog);

/*******************************************************************
 * Génère une boîte de dialogue permettant de figer le code        *
 * le temps que l'utilisateur ait lu le message                    *
 *******************************************************************
 * @param | {string}   | msg      | Message                        *
 * @param | {string}   | titre    | Titre de la boîte de dialogue  *
 * @param | {string}   | lbl_btn  | Libellé du bouton de fermeture *
 * @param | {Function} | callback | Action différée                *
 *******************************************************************/
function RS_Alert(msg, titre, lbl_btn, callback) {
  let popup = new RS_Dialog("confirm_box", titre, [], [], [], false);
  
  // Ajout de la question au contenu de la popup
  let div_msg = document.createElement("DIV");
  div_msg.style.height = "calc(100% - 60px)";
  div_msg.style.display = "flex";
  div_msg.style.flexDirection = "column";
  div_msg.style.justifyContent = "space-around";
  div_msg.innerHTML = msg;
  popup.appendToContent(div_msg);

  // Création de la <div> contenant les boutons
  let div_btn = document.createElement("DIV");
  div_btn.style.height = "60px";
  div_btn.style.display = "flex";
  div_btn.style.flexDirection = "row";
  div_btn.style.justifyContent = "space-around";

  // Création du bouton "Oui"
  let btn = document.createElement("INPUT");
  btn.setAttribute("type", "button");
  btn.classList.add("rs-btn-action");
  btn.classList.add("rs-btn-create");
  btn.classList.add("main-form");
  btn.value = lbl_btn;
  btn.addEventListener("click", ()=> {
    popup.closeModal();
    if (callback)
      callback();
  });

  // Ajout des boutons à la boîte de dialogue et affichage
  div_btn.appendChild(btn);
  popup.appendToContent(div_btn);
  document.body.appendChild(popup);
}

/*********************************************************************************
 * Génère une boîte de dialogue demandant confirmation pour une action donnée    *
 *********************************************************************************
 * @param | {string}   | question | Message à afficher dans la boîte de dialogue *
 * @param | {string}   | titre    | Titre de la boîte de dialogue                *
 * @param | {string}   | lbl_yes  | Libellé du bouton "Oui"                      *
 * @param | {string}   | lbl_no   | Libellé du bouton "Non"                      *
 * @param | {function} | fn_yes   | Fonction à exécuter si "Oui"                 *
 * @param | {function} | fn_no    | Fonction à exécuter si "Non"                 *
 *********************************************************************************/
function RS_Confirm(question, titre, lbl_yes, lbl_no, fn_yes, fn_no) {
  let popup = new RS_Dialog("confirm_box", titre, [], [], [], false);
  
  // Ajout de la question au contenu de la popup
  let div_msg = document.createElement("DIV");
  div_msg.style.height = "calc(100% - 60px)";
  div_msg.style.display = "flex";
  div_msg.style.flexDirection = "column";
  div_msg.style.justifyContent = "space-evenly";
  div_msg.innerHTML = question;
  popup.appendToContent(div_msg);

  // Création de la <div> contenant les boutons
  let div_btn = document.createElement("DIV");
  div_btn.style.height = "60px";
  div_btn.style.display = "flex";
  div_btn.style.flexDirection = "row";
  div_btn.style.justifyContent = "space-around";

  // Création du bouton "Oui"
  let btn_yes = document.createElement("INPUT");
  btn_yes.setAttribute("type", "button");
  btn_yes.classList.add("rs-btn-action");
  btn_yes.classList.add("rs-btn-create");
  btn_yes.classList.add("main-form");
  btn_yes.value = lbl_yes;
  btn_yes.addEventListener("click", ()=> {
    popup.closeModal();
    if (fn_yes)
      fn_yes();
  });

  // Création du bouton "Non"
  let btn_no = document.createElement("INPUT");
  btn_no.setAttribute("type", "button");
  btn_no.classList.add("rs-btn-action");
  btn_no.classList.add("rs-btn-suppr");
  btn_no.classList.add("main-form");
  btn_no.value = lbl_no;
  btn_no.addEventListener("click", ()=> {
    popup.closeModal();
    if (fn_no)
      fn_no();
  });

  // Ajout des boutons à la boîte de dialogue et affichage
  div_btn.appendChild(btn_yes);
  div_btn.appendChild(btn_no);
  popup.appendToContent(div_btn);
  document.body.appendChild(popup);
}
