import JSZip from 'jszip'; 
export default class zipper {
    /**
     * @constructor
     * @param {ArrayBuffer} data arraybuffer from zip file;
     * @throws {Error} JSZip module init error;
     */
    constructor(data) {
        if (!JSZip) {
            throw new Error('require JSZip module.');
        }
        this.target = data;
        this.data = null;
    };
    /**
     * @param {*} onStart onStart unzip callback
     * @param {*} onDone onDone unzip callback
     * @returns 
     */
    unzip(onStart, onDone) {
        if (onStart) {
            onStart();
        }
        return new Promise(async (res, rej) => {
            try {
                this.data = await JSZip.loadAsync(this.target);
                res(this.data)
            } catch (error) {
                rej(error)
            }
            if(onDone){
                onDone();
            }
        });
    };
}