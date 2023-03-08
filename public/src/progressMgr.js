export default class progressMgr{
    constructor(){
        this.elm = null;
        this.pgnHtml = null;
        this.total = 0;
    }
    async init(){
        this.pgnHtml = await (await fetch('./template/progress.html')).text();
        // .then(t=>document.body.insertAdjacentHTML('beforeend',t));
    }
}