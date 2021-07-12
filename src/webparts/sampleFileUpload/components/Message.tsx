import * as React from 'react';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import styles from './SampleFileUpload.module.scss';
import { css } from 'office-ui-fabric-react/lib/Utilities';

export enum MessageScope {
    Success = 0,
    Failure = 1,
    Warning = 2,
    Info = 3
}

export interface IMessageContainerProps {
    Message?: string;
    MessageScope: MessageScope;
}


const MessageContainer: React.FunctionComponent<IMessageContainerProps> = (props) => {
    return (
        <div className={styles.MessageContainer}>
            {
                props.MessageScope === MessageScope.Success &&
                <MessageBar messageBarType={MessageBarType.success} className={styles.msgText}>{props.Message}</MessageBar>
            }
            {
                props.MessageScope === MessageScope.Failure &&
                <MessageBar messageBarType={MessageBarType.error} className={styles.msgText}>{props.Message}</MessageBar>
            }
            {
                props.MessageScope === MessageScope.Warning &&
                <MessageBar messageBarType={MessageBarType.warning} className={styles.msgText}>{props.Message}</MessageBar>
            }
            {
                props.MessageScope === MessageScope.Info &&
                <MessageBar className={css(styles.infoMessage, styles.msgText)}>{props.Message}</MessageBar>
            }
        </div>
    );
};

export default MessageContainer;