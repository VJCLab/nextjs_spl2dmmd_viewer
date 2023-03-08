export default class addFolderOnclickEV {
    /**
     * @param {HTMLDivElemente} el 
     */
    constructor(el) {
        this.continer = el;
        this.#init();
    }
    #toggleIcon(e) {
        const t = e.querySelector('.zip_item_i');
        if (t.innerText == 'folder') {
            t.innerText += '_open';
        } else {
            t.innerText = 'folder';
        };
    }
    #init() {
        [...this.continer.children].map(e => {
            e.onclick = (ev) => {
                const targetElm = ev.target.parentElement;
                //onclick root folder
                if (e == targetElm && e.querySelector('.folder_continer')) {
                    this.#toggleIcon(e);
                    e.querySelector('.folder_continer').classList.toggle('hide');
                } else if (e == targetElm && e.querySelector('.chrsel.flex')) {
                    this.#toggleIcon(e);
                    e.querySelector('.chrsel.flex')?.classList.toggle('hide');
                }
                //onclick other root folder
                if (!targetElm.classList.value) {
                    this.#toggleIcon(targetElm);

                    targetElm.querySelector('.chrsel.flex').classList.toggle('hide');
                };
            };
        });
    }
}
