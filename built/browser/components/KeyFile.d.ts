import React from 'react';
import { KeyFile as KeyFileModel, DecryptedEntry } from '../../KeyFileModel';
interface KeyFileProps {
    keyFile: KeyFileModel;
}
interface KeyFileState {
    entries: DecryptedEntry[];
}
export default class KeyFile extends React.Component<KeyFileProps, KeyFileState> {
    constructor(props: KeyFileProps);
    render(): JSX.Element;
    private table;
    decryptEntries(keyFile: KeyFileModel): Promise<void>;
    componentDidMount(): void;
    componentWillReceiveProps(nextProps: KeyFileProps): void;
    private copyIcon;
    private passwordFieldStyle;
    private copyToClipboard;
}
export {};
