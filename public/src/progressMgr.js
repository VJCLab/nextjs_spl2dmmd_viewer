export default class progressMgr {
    constructor() {
        this.elm = null;
        /** @type {HTMLDivElement} progress display element */
        this.total = 0;
        this.title = 'Calculating Remaining Time ...';
        this.subTitle = 'Downloading...';
        /** @type {HTMLDivElement?} */
        this.descDispCont = null;
        // this.pgnCont
        /**
         * @type {Array<{t:String,d:String,e:Array<HTMLElement>,m:Number,s:Number,c:String}>}
         */
        this.processQuene = [];
    }
    #pgnBody = null;
    #defColor = '#0bd82c';
    async init() {
        this.#pgnBody = await (await fetch('./template/progress.html')).text();
        document.body.insertAdjacentHTML('beforeend', this.#pgnBody);
        this.#pgnBody = document.querySelector('.pgnDisp');

        this.descDispCont = this.#pgnBody.querySelector('.descMiddle');
        return this;
    }
    addQuene(q) {
        this.processQuene.push(q)
        return this;
    }
    #updateTitleSubTitle() {
        this.#pgnBody.querySelector('.title-bar-text').innerText = this.title;
        this.#pgnBody.querySelector('.descTop').innerText = this.subTitle;
    }
    #updatePg(s, m, c) {
        return `width:${Math.round((s / m * 100), 2)}%;${`background-color:${c ?? this.#defColor};`}`;
    }
    set(i,m,s){
        if(i!=undefined){
            console.log(i)
            if(m)this.processQuene[i].m = m;
            if(s&&typeof s =='number')this.processQuene[i].s = s;
            if(s&&typeof s =='object'){
               Object.assign(this.processQuene[i],s);
            }
        }
    }
    update() {
        //console.log( this.descDispCont )
        // const self = this;
        this.#updateTitleSubTitle()
        this.processQuene.map((p, i, t) => {
            let color = i == 1 ? 'gray' : p.c??null;
            //pelm = document.createElement('div');

            //this.descDispCont.append(elm);
            if (!p.e) {
                this.descDispCont.parentElement.insertAdjacentHTML('beforeend', `
                <div role="progressbar" class="animate" id="${i}">
                    <div style="${this.#updatePg(p.s, p.m, color)}"></div>
                </div>
            `);
                p.e = [[p.t, 'from...', p.d].map((e, idx) => {
                    //console.log(e)
                    let elm = null;
                    elm = document.createElement(idx == 1 ? 'span' : 'strong');
                    elm.innerText = e;
                    if(i>0&&idx==1)elm = null;
                    if (elm) this.descDispCont.append(elm);
                    return elm;
                }), document.querySelectorAll('[role=progressbar] div')[i]]
            }else if(p.e){
                //console.log(p.e,i,p.e[1])
                p.e[0].map((e,idx)=>{
                    if(e)e.innerText = [p.t,'from...',p.d][idx];
                })
                p.e[1].style = this.#updatePg(p.s, p.m, color);
            }
            return p;
        })
        return this.processQuene;
    }
}