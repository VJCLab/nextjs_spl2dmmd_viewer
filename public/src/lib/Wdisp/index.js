class Wdisp{
    constructor(){}
    #defDisp = (t,h)=>`<div class="window active" style="margin: 32px; width: 350px" id="file">
    <div class="title-bar">
        <div class="title-bar-text">${t}</div>

        <div class="title-bar-controls">
            <!-- <button aria-label="Minimize"></button>-->
            <button aria-label="Maximize"></button>
            <button aria-label="Close"></button>
        </div>
    </div>
    <div class="window-body has-space">${h}</div>
</div>`
    def(t,htmlString){
        if(!t) throw new ReferenceError('cannot be null title.');
        if(!htmlString) throw new ReferenceError('cannot be null.');
        let hstr = new DOMParser().parseFromString(htmlString,'text/html');
        if(!hstr) throw new Error('shoud be html String, like innerHtml');
        return new DOMParser().parseFromString(this.#defDisp(t,htmlString),'text/html').body.firstChild;
    }
}
export {Wdisp}