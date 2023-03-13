import fileReader from './fileReader.js';
import *as MEGA from 'https://cdn.jsdelivr.net/npm/megajs@1.1.1/+esm';

/**
 * 
 * @param {String} s path string
 * @returns {?String} last file name.
 */
function getNameFromPath(s) {
    return s.substring(s.lastIndexOf('/') + 1);
}
/**
 * @async
 * @param {*} url
 * @param {?(xhr:ProgressEvent)=>null} onprogress on progress callback function.
 * @returns {Promise<ArrayBuffer>}
 */
async function urlhandler(url, onprogress) {
    //only url is file to load.
    const megaRegex = /https:\/\/mega\.nz\/((file)\/([^#]+)#(.+)|#!([^!]+)!(.+))/gm;
    let d = null;

    //is it mega?
    const isPgr = onprogress != null;
    if (megaRegex.test(url)) {
        let xhr = null;
        xhr = { lengthComputable: true, loaded: 0.1, total: 10, name: getNameFromPath(url) }
        if (isPgr) onprogress(xhr)
        // console.log(url, 'on load...')
        d = await MEGA.File.fromURL(url).downloadBuffer();
        d = d.buffer;
        xhr.loaded = 10;
        if (isPgr) onprogress(xhr);
    } else {
        d = await new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            console.log(getNameFromPath(url))
            if (isPgr) xhr.onprogress = (e) => onprogress(Object.assign(e, { name: getNameFromPath(url),u:url }));
            xhr.open('get', url, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = () => {
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    resolve(xhr.response);
                } else {
                    reject({ status: xhr.status, statusText: xhr.statusText });
                }
            }
            xhr.send(null);
        })

        // d = (await fetch(url)).arrayBuffer();
    }
    return d;
}
/**
 * fileList to ArrayBuffer
 * @param {FileList} files
 * @param {?(xhr:ProgressEvent)=>null} onprogress on progress callback function.
 * @returns {Promise<?ArrayBuffer|?Array<File>>}
 */
export async function fileList2ArrBuff(files, onprogress) {
    const UnsupportFolder = class extends Error {
        constructor(message) {
            super(message);
            this.name = "UnsupportFolder";
        }
    };
    files = Array.from(files);
    let isNoZip = files.some(v => {
        return !v.type.includes('zip');
    });
    let isDumy = files.find(v => v.type == 'text/plain' & (v.name.includes('zip') | v.name.includes('url')));
    // let isDir = (!/\..*$/gm.test(files[0].name) && files[0].type == "");
    let findFolder = files.find(e => e.type == "" && e.size == 0) != null;
    if (findFolder) throw new UnsupportFolder('Cannot have a folder in the file list. Instead upload zip files.');

    /*
 
    case 0 //normal zip
    type:x-zip | bytes
    name: ~ .zip
    
    case 1 //normal spine files
 
    case 2 //dumy or url.
    type: text/plain
    name: ~ .zip
    */
    let caseNum = isDumy == null & isNoZip ? 1 : isNoZip ? 2 : 0;

    let url = caseNum == 2 ? await fileReader(files[0], 1) : null;
    let isMutiUrl = url ? url.split('\n').length != 1 : false;
    // console.log(isMutiUrl)

    if (isMutiUrl) {
        let done = false;
        let p = {};
        let callback = () => {
            let msgs = [];
            Object.entries(p).forEach(([k, x]) => {
                if (x.lengthComputable) {
                    const percentComplete = x.loaded / x.total * 100;
                    msgs.push(`${Math.round(percentComplete, 2)}% downloaded.${x.name ? ` ${x.name}` : ''}`);
                }
            })
            console.log(msgs)
            // console.log(p, p.done)
        }
        files = await Promise.all(url.split('\n').map(uls => {
            // fetch(uls).then(r => r.blob()).then(b => new File([b], getNameFromPath(uls)))
            const req = new Promise((resolve, reject) => {
                let xhr = new XMLHttpRequest();
                //console.log(getNameFromPath(uls))

                xhr.onprogress = (e) => {
                    p[getNameFromPath(uls)] = Object.assign(e, { name: getNameFromPath(uls) });
                    callback()
                };
                xhr.open('get', uls, true);
                xhr.responseType = "blob";
                xhr.onload = () => {
                    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                        resolve(new File([xhr.response], getNameFromPath(uls)));
                    } else {
                        reject({ status: xhr.status, statusText: xhr.statusText });
                    }
                }
                xhr.send(null);
            })
            return req;
        }))
        caseNum = 1;
        done = true;
        callback();
    }
    // if(url.split('\n').length!=1) caseNum = 
    // console.log(caseNum, files);
    let d = null;
    /*
     * url to arraybuffer for load the zip file.
     * @type {?ArrayBuffer|?FileList} */
    let data = await (async () => {
        if (caseNum == 2) {
            if (!url) throw new URIError('url is cannot be null.');
            d = await urlhandler(url, onprogress);
            return { u: url, d };
        } else if (caseNum == 0) {
            d = await fileReader(files[0], 2, onprogress);
            return { d };
        } else if (caseNum == 1)
            return { d: files };
    })().catch(e => {
        //file fetch error?
        throw new Error(e.message.includes('fetch') ? 'SERVER_ENOENT' : e.message)
        return null;
    });
    return data;
}
