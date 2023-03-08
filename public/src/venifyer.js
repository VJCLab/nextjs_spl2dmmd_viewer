import { fileList2ArrBuff } from './fileList2ArrBuff.js';
import zipper from './lib/zipper/index.js';
const Errors = {
    /**
     * @class
     * @extends Error
     * @param {String} message
     * @param {Array<String>} arr
     */
    AtlasVenifyError: class extends Error {
        constructor(message, arr) {
            message = `${message}
        ==Texture Missing==
        ${arr.join('\n')}`;
            super(message);
            this.name = "AtlasVenifyError";
        }
    },
    /**
     * @class
     * @extends Error
     * @param {String} message
     */
    AtlasError: class extends Error {
        constructor(message) {
            super(message);
            this.name = "AtlasError";
        }
    },
    /**
     * @class
     * @extends Error
     * @param {String} message
     */
    SkelError: class extends Error {
        constructor(message) {
            super(message);
            this.name = "SkelError";
        }
    },
    /**
     * @class
     * @extends Error
     * @param {Array<String>} arr resions
     */
    VenifyError: class extends Error {
        constructor(arr) {
            let message = `==Venify failures==
        ${arr.join('\n')}`;
            super(message);
            this.name = "VenifyError";
        }
    },
    VenifyLoadError: class extends Error {
        constructor(message) {
            super(message);
            this.name = "VenifyLoadError";
        }
    },
    /**
    * @class
    * @extends Error
    * @param {String} message
    */
    UnsupportType: class extends Error {
        constructor(message) {
            super(message);
            this.name = "UnsupportType";
        }
    },
}
export default class Venifyer {
    /**
     * file upload venifyer
     * @param {{auto:Boolean,bkTrans:Boolean,data:FileList,ground:Boolean,ver:String,pma:Boolean}} o
     */
    constructor(o) {
        this.data = Object.assign(o, {
            files: null,
            type: null,
            zip: null,
            rootName: null,
            raw: null
        });
        this.data.files = this.data.data;
        delete this.data.data;
    }
    #errRes = [];
    #findRootName = (z) => {
        let o = Object.keys(z.files);
        let t = o.map(e => e.replace(/\/.*/gm, '')).reduce((cnt, cur) => (cnt[cur] = cnt[cur] + 1 || 1, cnt), {});
        let rootName = null;
        if (t) {
            t = Object.entries(t).find(([k, v]) => v == o.length);
            rootName = t ? t[0] : null;
        }
        return rootName;
    }
    async getType() {
        /*
         (xhr) => {
            if (xhr.lengthComputable) {
                const percentComplete = xhr.loaded / xhr.total * 100;
                console.log(`${Math.round(percentComplete, 2)}% downloaded.${xhr.name ? ` ${xhr.name}` : ''}`);
            }
        } 
         */
        let d = await fileList2ArrBuff(this.data.files).catch(e => {
            throw new Errors.VenifyLoadError(e);
        });
        //console.log(d)
        const fileUrl = d.u;
        d = d.d;

        let comper = d instanceof Array ? 0 : d instanceof ArrayBuffer ? 1 : -1;
        console.log('getting file type...')
        let data = {};
        if (comper == 1) {
            this.data.zip = await new zipper(d).unzip();
            d = Object.values(this.data.zip.files);
        }
        d.forEach(f => {
            if (f.name.includes('skel') || f.name.includes('json')) {
                data.ctSk ??= 0;
                data.ctSk++;
                data.skelLst ??= [];
                data.skelLst.push(f)
            };
            if (f.name.includes('atlas')) {
                data.ctAt ??= 0;
                data.ctAt++;
                data.atlLst ??= [];
                data.atlLst.push(f)
            };
            if (f.name.includes('pmx') || f.name.includes('pmd')) { data.pmx ??= 0; data.pmx++; }
        });
        this.data.raw = d;
        /** 
         * @param {Array<File>} arr FileArray
         * @returns {Array<File>}
        */
        const keepJsonSkel = arr => arr.filter(function (file) {
            let fna = file.name.split('.');
            var ext = fna[1];
            var s = fna[0];
            return !(ext === 'skel' && arr.some(f => f.name === s + '.json'));
        });
        let isSp = data.ctSk > 0 && data.ctAt > 0;
        let isMMD = data.pmx != undefined;
        if (isSp) {
            this.data.type = 'spine';
            data.skelLst = keepJsonSkel(data.skelLst);
            // ctSk = skelLst.length;
            this.data.spine = {
                atlas: data.atlLst,
                skel: data.skelLst,
                drassis: {},
                imgs: []
            }
        } else if (isMMD) {
            this.data.type = 'mmd';
            this.data.mmd = {
                url: fileUrl,
                pmx: this.data.raw.find(e => e.name.includes('pmx') || e.name.includes('pmd'))
            }
        }
        this.data.rootName = comper == 1 ? this.#findRootName(this.data.zip) : null;
    }

    async venify() {
        // await this.#getType().catch(e => this.#errRes.push(e));
        const fType = this.data.type ?? undefined;
        switch (fType) {
            case 'spine':
            case 'mmd':
                break;
            default:
                this.#errRes.push(new Errors.UnsupportType(fType))
                break;
        }
        if (this.#errRes.length != 0) throw new Errors.VenifyError(this.#errRes);
        return this.data;
    }
}