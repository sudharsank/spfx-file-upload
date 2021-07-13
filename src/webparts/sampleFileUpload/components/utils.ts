import { sp } from "@pnp/sp";
import '@pnp/sp/webs';
import '@pnp/sp/folders';
import '@pnp/sp/files';
import { trim } from 'lodash';

/** Loader type */
export enum LoaderType {
    Spinner = 0,
    Indicator = 1
}

/** Special characters to be replaced if exists in filename */
export const regex_fle_invalidChars = /.[~!@#$%^&*+=\';:\",\/\\\{\}]/g;
/** Maximum length of filename to be used and beyond this length the filename will be truncated */
export const fle_nameMaxLength = 70;
/** Maximum size of all the files should not exceed 50MB */
export const fle_maxFileListLength = 52428800;
/** Maximum size per file is 10MB */
export const fle_maxFileLength = 10485760;
/** Number of files allowed */
export const fle_maxfilesallowed = 10;

/** File upload interface */
export interface IFileUploadInfo {
    trimmedName: string;
    displayName: string;
    name: string;
    uploadedFilename: string;
    content: any;
    size: string;
    actualSize: number;
    id: string;
    uploadStatus: boolean;
    FileServerRelUrl?: string;
}

/** Cleaned file name after special character replacement
 * This clean name can be used for the display purpose
 */
export function returnCleanedFilename(filename: string) {
    let newfilename = filename.replace(new RegExp(regex_fle_invalidChars), '');
    if (newfilename.length > 0) {
        let fleExtn = newfilename.split('.').pop();
        return trim(newfilename.replace(`.${fleExtn}`, '')) + `.${fleExtn}`;
    }
}
/** Trimmed file name based on the length and also after replacing the special characters
 * This name will be used while uploading the file to SharePoint
 */
export function trimmedFilename(filename: string) {
    let newfilename = filename.replace(new RegExp(regex_fle_invalidChars), '');
    if (newfilename.length > 0) {
        let fleExtn = newfilename.split('.').pop();
        let filenameWOExtn = trim(newfilename.replace(`.${fleExtn}`, ''));
        console.log(filenameWOExtn);
        if (filenameWOExtn.length > fle_nameMaxLength) return filenameWOExtn.substr(0, fle_nameMaxLength) + `.${fleExtn}`;
        else return newfilename;
    }
}
/** Upload files to the folder */
export async function uploadFiles(folderPath: string, filename: string, filecontent: any) {
    return await sp.web.getFolderByServerRelativeUrl(folderPath).files.add(filename, filecontent, true);
}