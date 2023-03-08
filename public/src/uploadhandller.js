export default class uploadHandller {
    /**
     * 
     * @param {HTMLDivElement} elem 
     */
    constructor(elem) {
        this.elem = elem;
    }
    /**
     * @param {Event} ev
     * @returns {{auto:Boolean,bkTrans:Boolean,data:FileList,ground:Boolean,ver:String,pma:Boolean}}
     */
    #onupload() {
        //let t = this.elem.querySelector('input[type=file]');
        const opt = {};
        for (const [index, elm] of this.elem.querySelectorAll('fieldset input,input[type=file]').entries()) {
            switch (elm.type) {
                case 'file':
                    opt.data = elm.files;
                    break;
                case 'checkbox':
                    opt[elm.name] = elm.checked;
                    break;
                case 'number':
                case 'color':
                case 'text':
                    opt[elm.name] = elm.value ?? elm.placeholder ?? null;
                    break;
                case 'radio':
                    if (elm.checked) opt[elm.name] = elm.id;
                    break;
                default:
                    break;
            }
        }
        return opt;
    }

    /**
     * @returns {Promise<Object>}
     */
    init() {
        /**
         * @type {HTMLButtonElement}
         */
        // const t = this.elem.querySelector('section.field-row.fieldEnd button[type="submit"]');
        // console.log(this.elem.parentElement.setAttribute('onc'))
        return new Promise(res => {
            window.myAction = this.#onupload;
            this.elem.parentElement.action = "javascript:"; //document.querySelector('#file').classList.add('hide');
            this.elem.parentElement.addEventListener('submit', () => {
                delete window.myAction;
                res(this.#onupload());
            });
        })
    }
} 