import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
    IPropertyPaneConfiguration,
    PropertyPaneTextField,
    PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'SampleFileUploadWebPartStrings';
import SampleFileUpload from './components/SampleFileUpload';
import { ISampleFileUploadProps } from './components/SampleFileUpload';
import { sp } from '@pnp/sp';

export interface ISampleFileUploadWebPartProps {
    asyncUpload: boolean;
}

export default class SampleFileUploadWebPart extends BaseClientSideWebPart<ISampleFileUploadWebPartProps> {

    public onInit(): Promise<void> {
        sp.setup(this.context);
        return Promise.resolve();
    }

    public render(): void {
        const element: React.ReactElement<ISampleFileUploadProps> = React.createElement(
            SampleFileUpload,
            {
                webSerUrl: this.context.pageContext.web.serverRelativeUrl,
                asyncUpload: this.properties.asyncUpload
            }
        );

        ReactDom.render(element, this.domElement);
    }

    protected onDispose(): void {
        ReactDom.unmountComponentAtNode(this.domElement);
    }

    protected get dataVersion(): Version {
        return Version.parse('1.0');
    }

    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
        return {
            pages: [
                {
                    header: {
                        description: ''
                    },
                    groups: [
                        {
                            groupName: 'General Settings',
                            groupFields: [
                                PropertyPaneToggle('asyncUpload', {
                                    label: 'Use Async Upload',
                                    onText: 'Enable',
                                    offText: 'Disable',
                                    key: 'useAsyncUploadFieldToggle',
                                    checked: this.properties.asyncUpload
                                })
                            ]
                        }
                    ]
                }
            ]
        };
    }
}
