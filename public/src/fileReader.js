/**
 * file reader async wrapper
 * @param {Blob|File} f 
 * @param {Number} typ AsDataURL, 0:AsBinaryStr, 1:AsText, 2:AsArrayBuff
 * @param {?(xhr:ProgressEvent)=>null} onprogress on progress callback function.
 * @returns {Promise<string | ArrayBuffer | null>}
 */
export default function fileReader(f, typ, onprogress) {
    return new Promise((res, rej) => {
        const reader = new FileReader();
        if(onprogress) reader.onprogress=(e) => onprogress(Object.assign(e,{name:f.name}));
        reader.addEventListener('load', (event) => {
            res(event.target.result);
        });
        reader.addEventListener('error', err => rej(err));

        switch (typ) {
            case 0:
                reader.readAsBinaryString(f)
                break;
            case 1:
                reader.readAsText(f)
                break;
            case 2:
                reader.readAsArrayBuffer(f)
                break;
            default:
                reader.readAsDataURL(f)
                break;
        }
    })
}