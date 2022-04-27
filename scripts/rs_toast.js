/**
 * Classe générant des toasts pour afficher des messages
 *
 * @class      RS_Toast (name)
 */
class RS_Toast extends HTMLDivElement {

  /**
   * Crée un toast affichant un message
   *
   * @param      {string}  html_content  Contenu à afficher (au format HTML)
   */
  constructor(html_content) {
    super();
    this.classList.add("toast");
    this.innerHTML = html_content;
  }

  /** Cache le toast, puis le retire du DOM, à la fin de l'animation */
  hide() {
    this.classList.add("hide");
    setTimeout(()=> { this.remove(); }, 500);
  }

  /**
   * Crée un toast afin de l'ajouter au corps de document.
   * Quand <lasting_time> ms sont écoulées, fait disparaître le toast.
   *
   * @param      {string}  html_content  Contenu à afficher (au format HTML)
   * @param      {number}  lasting_time  Temps d'affichage du toast (en ms)
   */
  static show(html_content, lasting_time) {
    let toast = new RS_Toast(html_content);
    document.body.appendChild(toast);
    setTimeout(()=> { toast.hide(); }, lasting_time);
  }
}
customElements.define('js-rs-toast', RS_Toast, { extends: 'div' });
