export default class DB {
    constructor(p) {
        this.data = null;
        this.#dbpath = p;
    }
    #dbpath = null;
    #buildFoldCont(isRoot, typeNumber) {
        let r = document.createElement('div');
        let c = '';
        if (isRoot == true)
            c = 'root ';
        if (!typeNumber)
            c += 'folder_continer';
        if (typeNumber == 0) {
            r = document.createElement('span');
            c = 'chrsel_span folder';
        }
        if (typeNumber == 1)
            c = 'chrsel flex';
        r.className = c;
        return r;
    }
    /**
     * @param {String} n file name
     * @param {Array<String>} u url list
     * @returns {String} html string.
     */
    #buildFileCont(n, u) {
        let r = `<span class="chrsel_span item" translate="no">
        <i class="material-symbols-outlined zip_item_i">
            folder_zip
        </i>
        <p class="zip_item_p">${n}.zip</p>`;
        u.map(us => {
            r += `<input type="text" name="text" id="text" hidden
            value="${us}" />`;
        });

        r += `</span>`;
        return r;
    }
    async #dataInit() {
        let d = await (await fetch(this.#dbpath)).json();
        d = await Promise.all(d.map(async (r) => {
            if (r.d) {
                r.d = await Promise.all(r.d.map(async (k) => {
                    if (k.l) {
                        return await (await fetch(`./db/${k.l}`)).json();
                    } else {
                        return k;
                    }
                }));
                return r;
            } else if (r.l) {
                return await (await fetch(`./db/${r.l}`)).json();
            }
        }));
        this.data = d;
    }
    #addfiles(contElm, host, t) {
        t.n = t.f ? t.f : t.n;
        let links = [];
        //manual file link
        if (t.m) {
            links = t.m.map(manualURL => `${host}${manualURL}`);
        } else {
            links.push(`${host}${t.n}${!t.raw ? '.zip' : ''}`);
        }
        //console.log(this.#buildFileCont(j.n, links))
        contElm.insertAdjacentHTML('afterbegin', this.#buildFileCont(t.n, links));
    }
    async init() {
        //async data load.
        await this.#dataInit();
        const r = this.#buildFoldCont(true);
        const elmArr = [];
        this.data.map(e => {

            const folder = this.#buildFoldCont(null, 0);
            folder.setAttribute('translate', 'no');
            folder.insertAdjacentHTML('afterbegin', `
                <i class="material-symbols-outlined zip_item_i">
                    folder
                </i>
                <p class="zip_item_p">[${e.t}]</p>
            `);

            if (e.d.r == null) {
                let n = e.d.find(s => s.r != undefined) != null ? 1 : null;

                const subFold = this.#buildFoldCont(null, n);
                subFold.setAttribute('translate', 'no');
                subFold.classList.add('hide');
                e.d.map(k => {
                    if (k.r == null) {
                        const innerFold = document.createElement('div');
                        innerFold.insertAdjacentHTML('afterbegin', `
                        <i class="material-symbols-outlined zip_item_i">
                            folder
                        </i>
                        <p class="zip_item_p">[${k.t}]</p>`);
                        // console.log(k.t,k.d)
                        const innerFileCont = this.#buildFoldCont(null, 1);
                        innerFileCont.classList.add('hide');
                        if (k.d) {
                            k.d.map(j => {
                                this.#addfiles(innerFileCont, j.r == 0 ? './asset/' : (e.b ?? k.b)[j.r], j);
                            });
                        }
                        innerFold.append(innerFileCont);
                        subFold.appendChild(innerFold);
                    } else {
                        this.#addfiles(subFold, k.r == 0 ? './asset/' : (e.b ?? k.b)[k.r], k);
                    }
                });

                folder.appendChild(subFold);
            }
            elmArr.push(folder);
        });
        r.append(...elmArr);
        return r;
    }
}
