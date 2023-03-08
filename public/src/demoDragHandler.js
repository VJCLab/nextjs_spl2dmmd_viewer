export default class {
    /**
     * @param {HTMLElement} a 
     * @param {HTMLElement} b
     */
    constructor(a, b) {
        //Sortable.mount(new MultiDrag());
        this.fileContiner = null;
        this.#init(a, b, this.#onDrag.bind(this));
    }
    getNameFromPath(s) {
        return s.substring(s.lastIndexOf('/') + 1);
    }
    #onDrag(ev) {
        const dataTranster = new DataTransfer();
        let fn = ev.item.querySelector('p');
        const url = [...ev.item.querySelectorAll('input')].map(us=>us.value).join('\n')
        fn = fn ? fn.innerText : "url";
        const file = new File([url], fn, {
            type: "text/plain",
        });
        dataTranster.items.add(file);
        this.fileContiner.files = dataTranster.files;
    }
    #init(dndbox, chrs, callBack) {
        this.fileContiner = dndbox;
        new Sortable(dndbox, {
            animation: 150,
            sort: false,
            ghostClass: 'blue-background-class'
        });
        chrs.forEach((e, i) => {
            new Sortable(e, {
                animation: 150,
                group: i == 0 ? 'dnd' : 'link',
                sort: false,
                // fallbackTolerance: 3,
                ghostClass: 'blue-background-class',
                onEnd: callBack ? ev => callBack(ev) : null,
            });
        })
    }
}