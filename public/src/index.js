import demoDragHandler from './demoDragHandler.js';
import uploadHandller from './uploadhandller.js';
import Venifyer from './venifyer.js';
import PreLoader from './preLoader.js';
import addFolderOnclickEV from './addFolderOnclickEV.js';
import DB from './DB.js';
import progressMgr from './progressMgr.js';

console.log('onload');
const progressHtml = new DOMParser().parseFromString(await (await fetch('./template/progress.html')).text(), 'text/html');

//for form control.
const db = new DB('./db/index.json')
await db.init().then(e => document.querySelector('.sel_continer#sel_continer').appendChild(e))
new addFolderOnclickEV(document.querySelector('.folder_continer'));
new demoDragHandler(document.querySelector('.window#file section div[class*="dndBox"] input'), document.querySelectorAll('.window#file section div[class*="chrsel"]'));
const pgnDisp = new progressMgr();
pgnDisp.init()
let o = null;
new uploadHandller(document.querySelector('.window#file .window-body')).init()
    .then(d => {
        o = new Venifyer(d);
        return o.getType();
    })
    .then(() => o.venify())
    .then(d => {
        o = null;
        new PreLoader(d).load() //.then(console.log);
    })