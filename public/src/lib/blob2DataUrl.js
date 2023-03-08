/**
 * blob to DataUrl
 * @param {Blob} blob 
 * @returns {String} DataUrl
 */
export default async function blob2DataUrl(blob) {
    const e = await new Promise(r => { let a = new FileReader(); a.onload = r; a.readAsDataURL(blob); });
    return e.target.result;
}