import * as React from 'react';
import { useEffect, useState, FC } from 'react';
import styles from './SampleFileUpload.module.scss';
import { FileError, useDropzone } from 'react-dropzone';
import { css } from 'office-ui-fabric-react/lib/Utilities';
import { fle_maxFileLength, fle_maxFileListLength, fle_maxfilesallowed, IFileUploadInfo } from './utils';
import { differenceBy, remove, slice, trim } from 'lodash';
import { returnCleanedFilename, trimmedFilename } from './utils';
import MessageContainer, { MessageScope } from './Message';

export interface IFileDropZoneProps {
    tempUpload: (filename: string, fileContent: any) => Promise<boolean>;
    dropCallback: (selectedFiles) => void;
    checkForValidAction?: () => Promise<boolean>;
    triggerInvalidActionsDisable?: () => void;
    checkForOnHoldStatus?: () => Promise<any>;
    triggerOnHoldActionDisable?: (onholditem: any) => void;
    documentToUpload: any[];
    clearMessage?: boolean;
    disableUpload: boolean;
    showUploadProgress: () => void;
    hideUploadProgress: () => void;
    useAsyncUpload: boolean;
}


const FileDropZone: FC<IFileDropZoneProps> = (props) => {
    /** State Variables */
    const [disableUpload, setDisableUpload] = useState<boolean>(false);
    const [docsToUpload, setDocsToUpload] = useState<IFileUploadInfo[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const _handleFileUpload = async (file, tempDocsToUpload) => {
        return new Promise((res, rej) => {
            const fileReader = new FileReader();
            fileReader.onload = ((fle) => {
                return ((e) => {
                    tempDocsToUpload.push({
                        trimmedName: fle.TrimmedName,
                        displayName: fle.DisplayName,
                        name: fle.name,
                        content: e.target.result,
                        size: fle.size > 1048576 ? Math.round(fle.size / 1024 / 1024).toString() + 'MB' : Math.round(fle.size / 1024).toString() + 'KB',
                        actualSize: fle.size,
                        id: Math.random().toString(),
                        uploadStatus: false
                    });
                    res(tempDocsToUpload);
                });
            })(file);
            fileReader.readAsArrayBuffer(file);
        });
    };

    const _handleFileChange = async (files) => {
        setErrorMessage('');
        let tempDocsToUpload: IFileUploadInfo[] = docsToUpload;
        let batch = [];
        if (tempDocsToUpload.length > 0) {
            var diffFiles: any[] = differenceBy(files, tempDocsToUpload, (f) => trim(f.name));
            if (diffFiles.length > 0) {
                for (let i = 0; i < diffFiles.length; i++) {
                    batch.push(await _handleFileUpload(diffFiles[i], tempDocsToUpload));
                }
            }
        } else {
            for (let i = 0; i < files.length; i++) {
                batch.push(await _handleFileUpload(files[i], tempDocsToUpload));
            }
        }
        if (batch.length > 0) {
            props.showUploadProgress();
            await Promise.all(batch);
            if (tempDocsToUpload.length <= fle_maxfilesallowed) {
                if (props.useAsyncUpload) {
                    for (let fletoupload of tempDocsToUpload) {
                        if (!fletoupload.uploadStatus) {
                            let uploadStatus: boolean = await props.tempUpload(fletoupload.trimmedName, fletoupload.content);
                            fletoupload.uploadStatus = uploadStatus;
                        }
                    }
                    remove(tempDocsToUpload, (o) => !o.uploadStatus);
                }
                setDocsToUpload(tempDocsToUpload);
                props.dropCallback(tempDocsToUpload);
            } else {
                tempDocsToUpload = slice(tempDocsToUpload, 0, fle_maxfilesallowed);
                setDocsToUpload(tempDocsToUpload);
                props.dropCallback(tempDocsToUpload);
                setErrorMessage('Sorry, you have reached the max number and no more files can be uploaded!');
            }
        }
        setDisableUpload(false);
    };

    const _fileValidation = (file: File): FileError | FileError[] => {
        if (file.size > fle_maxFileLength) {
            return {
                code: 'file_max_size',
                message: `File is greater than max size of ${fle_maxFileLength / 1024 / 1024}MB`
            };
        }
        return null;
    };

    const _customFileProperties = async (e): Promise<(File | DataTransferItem)[]> => {
        const files = [];
        const fileList = e.dataTransfer ? e.dataTransfer.files : e.target.files;
        for (var i = 0; i < fileList.length; i++) {
            const file = fileList.item(i);
            Object.defineProperty(file, 'DisplayName', {
                value: returnCleanedFilename(file.name)
            });
            Object.defineProperty(file, 'TrimmedName', {
                value: trimmedFilename(file.name)
            });
            files.push(file);
        }
        return files;
    };

    const _onDropDocuments = async (selFiles) => {
        setDisableUpload(true);
        if (props.checkForValidAction) {
            if (await props.checkForValidAction()) {
                _handleFileChange(selFiles);
            } else props.triggerInvalidActionsDisable();
        } else _handleFileChange(selFiles);
    };

    const { getRootProps, getInputProps, fileRejections, acceptedFiles } = useDropzone({
        //accept: 'image/jpeg, image/jpg, image/png',
        maxFiles: fle_maxfilesallowed,
        multiple: true,
        disabled: props.disableUpload || disableUpload,
        noClick: disableUpload,
        noDrag: disableUpload,
        noDragEventsBubbling: disableUpload,
        noKeyboard: disableUpload,
        onDrop: _onDropDocuments,
        validator: _fileValidation,
        getFilesFromEvent: e => _customFileProperties(e)
    });

    const fileRejectionItems = fileRejections.map(({ file, errors }) => (
        <li key={file.name}>
            {file.name} - {file.size > 1048576 ? Math.round(file.size / 1024 / 1024) + ' MB' : Math.round(file.size / 1024) + ' KB'}
            <ul>
                {errors.map(e => (
                    <li key={e.code} style={{ fontWeight: 'normal' }}>{e.message}</li>
                ))}
            </ul>
        </li>
    ));

    useEffect(() => {
        if (props.clearMessage) setErrorMessage('');
    }, [props.clearMessage]);
    useEffect(() => {
        setDocsToUpload(props.documentToUpload);
        setDisableUpload(props.disableUpload);
    }, [props.documentToUpload, props.disableUpload]);

    return (
        <section className={styles.dropZoneContainer}>
            <div {...getRootProps({ className: css(styles.dropzone, disableUpload ? styles.dropZonedisabled : '') })}>
                <input {...getInputProps()} />
                <p>{"Drag 'n' drop the documents, or click to select the documents"}</p>
            </div>
            <div className={styles.dropZoneInfo}>
                {`Maximum of ${fle_maxfilesallowed} files can be uploaded. Each file can have a max size of ${fle_maxFileLength / 1024 / 1024}MB. The total file size allowed per case is ${fle_maxFileListLength / 1024 / 1024}MB.`}
            </div>
            {errorMessage.length > 0 &&
                <MessageContainer MessageScope={MessageScope.Failure} Message={errorMessage} />
            }
            {fileRejections.length > 0 &&
                <aside className={styles.fileswitherror}>
                    <h4>Error with files</h4>
                    <ul>{fileRejectionItems}</ul>
                </aside>
            }
        </section>
    );
};

export default FileDropZone;