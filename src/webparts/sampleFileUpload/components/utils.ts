import { sp } from "@pnp/sp";
import '@pnp/sp/webs';
import '@pnp/sp/folders';
import '@pnp/sp/files';
import { trim } from 'lodash';

export enum LoaderType {
    Spinner = 0,
    Indicator = 1
}

export const regex_fle_invalidChars = /.[~!@#$%^&*+=\';:\",\/\\\{\}]/g;
export const fle_nameMaxLength = 70;
export const fle_maxFileListLength = 52428800; // 50MB
export const fle_maxFileLength = 10485760; // 10MB
export const fle_maxfilesallowed = 10;

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

export function returnCleanedFilename(filename: string) {
    let newfilename = filename.replace(new RegExp(regex_fle_invalidChars), '');
    console.log(newfilename, filename);
    if (newfilename.length > 0) {
        let fleExtn = newfilename.split('.').pop();
        return trim(newfilename.replace(`.${fleExtn}`, '')) + `.${fleExtn}`;
    }
}
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

export async function uploadFiles(folderPath: string, filename: string, filecontent: any) {
    return await sp.web.getFolderByServerRelativeUrl(folderPath).files.add(filename, filecontent, true);
}