import fileReader from './fileReader.js';
export default class SpineLoader{
    constructor(loaderClass) {
        this.sup = loaderClass;
        this.data = Object.assign({},this.sup.data);
    }
    async #venifySpine() {
        //console.log(this.data.spine)
        for (let f of this.data.spine.atlas) {
            let isZip = this.data.zip;
            let paths = (() => {
                let folderRegexp = [/(.*)\/.*/gm, /(.*)\/.*/gm];
                let matchFolder = folderRegexp[0].test(f.name);
                //console.log(matchFolder)
                let fn = isZip ? (matchFolder ? f.name.replace(folderRegexp[0], "$1") : f.name.replace(folderRegexp[1], '$1')) : f.name.replace(/\.[^/.]+$/gm, '');
                fn = fn.replace(/\..*/gm, '')
                if (this.data.rootName == fn) fn = 'default';
                console.log(`
                Root : ${this.data.rootName}
                folder Test : ${matchFolder}
                folder Name : ${fn}
                path : ${f.name}
                `)
                return { n: fn, p: f.name, r: this.data.rootName, isf: matchFolder };
            })()
            let drass = {
                name: paths.n,
                atlasUrl: null,
                skelUrl: null,
                rawDataURIs: {},
                ver: '4.0',
                premultipliedAlpha: false,
                alpha: false
            };
            const linkGen = (t, d) => {
                return `data:${t ?? 'application/octet-stream'};base64,${d}`;
            }
            if (isZip) {
                const filtZip = Object.fromEntries(Object.entries(isZip.files).filter(([key]) => key.includes(paths.isf ? `${paths.n}/` : paths.n)));
                // console.log(isZip.file)
                for await (const [key, data] of Object.entries(filtZip)) {
                    if (data.dir) continue;
                    // console.log(key)
                    if (key.includes('.png')) {
                        drass.rawDataURIs[key] = linkGen('image/png', await isZip.file(key).async('base64'));
                    } else if (key.includes('.json')) {

                        delete drass.skel;
                        delete drass.skelUrl;
                        drass.jsonUrl = key;
                        drass.ver = this.#getVer(await isZip.file(key).async('text'))
                        drass.rawDataURIs[key] = linkGen('application/json', await isZip.file(key).async('base64'));
                    } else {
                        if (key.includes('.atlas')) {
                            drass.atlasUrl = key;
                            let pma = this.#getPMAOption(await isZip.file(key).async('text'))
                            drass.premultipliedAlpha = pma;
                            drass.alpha = pma;
                        };
                        if (key.includes('.skel')) {
                            drass.skelUrl = key;
                            drass.ver = this.#getVer(await isZip.file(key).async('text'));
                        };
                        drass.rawDataURIs[key] = linkGen(null, await isZip.file(key).async('base64'));
                    }
                }
                this.data.spine.drassis[drass.name] = drass;
                // console.log(drass)
            } else if (!isZip) {
                // console.log(this.files==undefined)
                if(!this.files) this.files = this.data.raw;
                for await (const [key, data] of Object.entries(this.files)) {
                    // if (data.dir) continue;
                    if (data.name.includes('.png')) {
                        drass.rawDataURIs[data.name] = await fileReader(data);
                    } else if (data.name.includes('.json')) {
                        delete drass.skel;
                        delete drass.skelUrl;
                        drass.jsonUrl = data.name;
                        //drass.skelUrl = data.name;
                        drass.ver = this.#getVer(await fileReader(data, 1))
                        drass.rawDataURIs[data.name] = await fileReader(data);
                    } else {
                        if (data.name.includes('.atlas')) {
                            drass.atlasUrl = data.name;
                            let pma = this.#getPMAOption(await fileReader(data, 1))
                            drass.premultipliedAlpha = pma;
                            drass.alpha = pma;
                        };
                        if (data.name.includes('.skel')) {
                            drass.skelUrl = data.name;
                            drass.ver = this.#getVer(await fileReader(data, 1));
                        };
                        drass.rawDataURIs[data.name] = await fileReader(data);
                    }
                }
                this.data.spine.drassis[drass.name] = drass;
            }
           
            delete this.data.spine.atlas;
            delete this.data.spine.imgs;
            delete this.data.spine.skel;
            
        }
        return true;
    }
    /**
    * get spineVer
    * @param {String} skelStr skel file text.
    * @returns {Number} 4.0
    */
    #getVer(skelStr) {
        //console.log(skelStr)
        //parse2lines 
        const verRegex = /\d\.\d\.\d{2}/gm;
        let ver = '4.0';
        //find spine version is witten.
        skelStr = skelStr.split('\n').slice(0, 2).find(e => e.match(verRegex));
        ver = (skelStr ? skelStr.match(verRegex)[0].replace(/\.\d{2}/g, '') : ver);
        // if (Number(ver) < 4.0) ver = '4.0';
        return ver;
    }
    #getPMAOption(t) {
        //pma:true
        let d = t.trim().split('\n').find(e => e.toLowerCase().includes('pma'));
        return d ? Boolean(d.split(':')[1]) : false;
    }
    #setConfigFromRendOption(){
        if(this.data.auto == true){
            Object.entries(this.data.spine.drassis).forEach(([key, value])=>{
                //value.premultipliedAlpha =this.data.pma;
                value.alpha = this.data.bkTrans;
                //if(! this.data.bkTrans)value.backgroundColor = this.data.bkCol;
            } )
        }
    }
    async load() {
        console.log(this)
        await this.#venifySpine();
        this.#setConfigFromRendOption();
        // console.log(this.data.pma)
        this.data = this.data.spine;
        return this.data;
        // this.data = this.data.spine.drassis;
    }
}