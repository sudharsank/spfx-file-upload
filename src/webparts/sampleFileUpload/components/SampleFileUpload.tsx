import * as React from 'react';
import { useEffect, useState, FC } from 'react';
import styles from './SampleFileUpload.module.scss';
import { escape } from '@microsoft/sp-lodash-subset';
import FileDropZone from './FileDropZone';
import { IFileUploadInfo } from './utils';
import { LoaderType, uploadFiles } from './utils';
import ContentLoader from './ContentLoader';
import { find, set } from 'lodash';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';

export interface ISampleFileUploadProps {
    webSerUrl: string;
    asyncUpload: boolean;
}

const SampleFileUpload: FC<ISampleFileUploadProps> = (props) => {
    const [docsToUpload, setDocsToUpload] = useState<IFileUploadInfo[]>([]);
    const [clearFileErrorMsg, setClearFileErrorMsg] = useState<boolean>(false);
    const [tempFilesUploaded, setTempFilesUploaded] = useState<any[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);

    /** Show the upload progress */
    const _showUploadProgress = () => {
        setUploadingFiles(true);
        //setDisableActionButtons(true);
    };
    /** Hide the upload progress */
    const _hideUploadProgress = () => {
        setUploadingFiles(false);
        //setDisableActionButtons(false);
    };
    /** Callback method after selecting the files */
    const _afterSelectingFiles = (selFiles) => {
        setDocsToUpload([...selFiles]);
        setClearFileErrorMsg(false);
        _hideUploadProgress();
    };
    /** Uploading the case files */
    const _uploadFiles = async (filename: string, filecontent: any): Promise<boolean> => {
        let retStatus: boolean = false;
        try {
            let tmpFileUploaded = await uploadFiles(`${props.webSerUrl}/Shared Documents/`, filename, filecontent);
            let tempFiles: any[] = tempFilesUploaded;
            tempFiles.push({ uploadedFileName: tmpFileUploaded.data.Name, trimmedName: filename, FileServerRelUrl: tmpFileUploaded.data.ServerRelativeUrl });
            setTempFilesUploaded(tempFiles);
            let tempDocsToUpload: IFileUploadInfo[] = docsToUpload;
            tempFilesUploaded.map(tmpfile => {
                var fil = find(tempDocsToUpload, (f: IFileUploadInfo) => f.trimmedName === tmpfile.trimmedName);
                if (fil) {
                    set(fil, 'FileServerRelUrl', tmpfile.FileServerRelUrl);
                    set(fil, 'uploadedFileName', tmpfile.uploadedFileName);
                }
            });
            setDocsToUpload(tempDocsToUpload);
            retStatus = true;
        } catch (err) {
            console.log(err);
        }
        return retStatus;
    };
    /** Upload on button click */
    const _uploadOnSave = async () => {
        setUploadingFiles(true);
        for (let doc of docsToUpload) {
            let tmpFileUploaded = await uploadFiles(`${props.webSerUrl}/Shared Documents/`, doc.trimmedName, doc.content);
            set(doc, 'FileServerRelUrl', tmpFileUploaded.data.ServerRelativeUrl);
            set(doc, 'uploadedFileName', tmpFileUploaded.data.Name);
        }
        setUploadingFiles(false);
        setDocsToUpload(docsToUpload);
    };

    return (
        <div className={styles.sampleFileUpload}>
            {uploadingFiles &&
                <ContentLoader loaderType={LoaderType.Indicator} loaderMsg={"Processing files..."} />
            }
            <FileDropZone dropCallback={_afterSelectingFiles} documentToUpload={docsToUpload} tempUpload={_uploadFiles} clearMessage={clearFileErrorMsg}
                showUploadProgress={_showUploadProgress} hideUploadProgress={_hideUploadProgress} disableUpload={uploadingFiles}
                useAsyncUpload={props.asyncUpload} />
            {docsToUpload && docsToUpload.length > 0 &&
                docsToUpload.map((doc) =>
                    <ul>
                        <div>{doc.name} {doc.FileServerRelUrl ? `('${doc.FileServerRelUrl}')` : ''}</div>
                    </ul>
                )
            }
            {!props.asyncUpload &&
                <div style={{ float: 'right' }}>
                    <PrimaryButton text="Upload the files" onClick={_uploadOnSave} disabled={uploadingFiles || docsToUpload.length <= 0}
                        style={{ float: 'right' }}></PrimaryButton>
                </div>
            }
        </div>
    );
};

export default SampleFileUpload;
