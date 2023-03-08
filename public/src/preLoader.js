import SpineLoader from "./spineLoader.js";
import * as THREE from 'three';
import { ZipLoadingManager } from 'https://cdn.jsdelivr.net/gh/jomin398/THREE.ZipLoader@master/index.js';
import { MMDLoader } from 'three/addons/loaders/MMDLoader.js'
export default class PreLoader {
    constructor(loadObj) {
        this.data = loadObj;
        this.change = null;
        this.dressLst = [];
    }
    onProgress(xhr) {
        if (xhr.lengthComputable) {

            const percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete, 2) + '% downloaded');

        }
    }
    async #getLoader() {
        switch (this.data.type) {
            case 'spine':
                this.#loader = new SpineLoader(this)
                break;
            case 'mmd':
                let manager = new ZipLoadingManager();
                let zl = await manager.uncompress(this.data.mmd.url, ['.pmx', '.pmd'], null, this.onProgress).then(zip => {
                    return { l: new MMDLoader(zip.manager), f: zip.urls[0] };
                });
                this.data.mmd.u = zl.f;
                this.#loader = zl.l;
            default:
                break;
        }
    }
    #loader = null;
    async load() {
        console.log(this.data)
        await this.#getLoader();
        //console.log(this.data)
        if(this.data.type=='spine') await this.#loader.load();
        
        console.log(this.#loader)
        // return await this.#loader.load();
    }
}