import * as React from 'react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { LoaderType } from './utils';

export interface IContentLoaderProps {
    loaderMsg?: string;
    loaderType: LoaderType;
    spinSize?: SpinnerSize;
}

const ContentLoader: React.FunctionComponent<IContentLoaderProps> = (props) => {
    return (
        <div className="ms-Grid-row">
            {props.spinSize === SpinnerSize.xSmall ? (
                <div style={{ margin: "10px", marginRight: '14px' }}>
                    <Spinner label={props.loaderMsg} size={SpinnerSize.xSmall} ariaLive="assertive" labelPosition="top" />
                </div>
            ) : (
                <div style={{ margin: "20px" }}>
                    {props.loaderType == LoaderType.Spinner &&
                        <Spinner label={props.loaderMsg} size={props.spinSize ? props.spinSize : SpinnerSize.large} ariaLive="assertive" labelPosition="top" />
                    }
                    {props.loaderType == LoaderType.Indicator &&
                        <ProgressIndicator label={props.loaderMsg} description="Please wait..." />
                    }
                </div>
            )}
        </div>
    );
};

export default ContentLoader;