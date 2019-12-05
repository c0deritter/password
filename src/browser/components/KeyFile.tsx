import React from 'react'
import { KeyFile as KeyFileModel, DecryptedEntry } from '../../KeyFileModel'
import Window from './Window'

interface KeyFileProps {
    keyFile: KeyFileModel
}

interface KeyFileState {
    entries: DecryptedEntry[]
}

export default class KeyFile extends React.Component<KeyFileProps, KeyFileState> {
    constructor(props: KeyFileProps) {
        super(props)

        this.state = {
            entries: []
        }
    }

    public render() {
        return (
            <div>
                <h1>
                    { this.props.keyFile.name }
                </h1>
                <Window
                title=''
                isHeaderShown={ false }
                windowStyle={{
                    backgroundColor: 'black',
                    borderColor: '',
                    windowButtonOneColor: '',
                    windowButtonTwoColor: '',
                    windowButtonThreeColor: '',
                    borderRadius: '2px 2px 2px 2px'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', boxSizing: 'border-box', padding: '5px', width: '50vw' }}>
                        { this.table() }
                    </div>
                </Window>
            </div>
        )
    }

    private table() {
        if (this.state.entries.length > 0) {
            return (
                <table style={{ borderSpacing: '10px' }}>
                    <tr>
                        <th style={{ textAlign: 'start' }}><strong>provider</strong></th>
                        <th style={{ textAlign: 'start' }}><strong>login name</strong></th>
                        <th style={{ textAlign: 'start' }}><strong>password</strong></th>
                        <th style={{ textAlign: 'start' }}><strong>description</strong></th>
                        <th style={{ textAlign: 'start' }}><strong>tags</strong></th>
                    </tr>
                    {
                        this.state.entries.map((entry, index) => {
                            return (
                                <tr>
                                    <td>{ this.linkField(entry.link, entry.entryName) }</td>
                                    <td>{ this.clipableField(`login:${index}`, entry.loginName) }</td>
                                    <td>{ this.clipableField(`password:${index}`, entry.password) }</td>
                                    <td>{ entry.description }</td>
                                    <td>{ entry.tags }</td>
                                </tr>
                            )
                        })
                    }
                </table>

            )
        } else {
            return (
                <h3>no entries</h3>
            )
        }
    }

    public async decryptEntries(keyFile: KeyFileModel) {
        const decryptEntries = await Promise.all(keyFile.entries.map((entry) => {
            return keyFile.decryptEntry(entry.id) 
        }))
        
        this.setState({
            entries: decryptEntries
        })
    }

    public componentDidMount() {
        this.decryptEntries(this.props.keyFile)
    }

    public componentWillReceiveProps(nextProps: KeyFileProps) {
        if (this.props.keyFile !== nextProps.keyFile) {
            this.decryptEntries(nextProps.keyFile)
        }
    }

    private linkField(link: string, text: string) {
        return (
            <a style={{ display: 'flex', alignItems: 'center'}} href={ link } target="_blank">
                <i style={{ width: '20px', cursor: 'pointer', paddingRight: '5px' }}>
                    { this.linkIcon() }</i>
                <span>{ text }</span>
            </a>
        )
    }

    private clipableField(id: string, value: string) {
        return (
            <div style={{ display: 'flex', alignItems: 'center'}}>
                <i
                    onClick={ () => this.copyToClipboard(id) }
                    style={{ width: '20px', cursor: 'pointer', paddingRight: '5px' }}
                >{ this.copyIcon() }</i>
                <input
                    style={ this.passwordFieldStyle() }
                    id={ id }
                    value={ value }
                />
            </div>
        )
    }

    // Font awesome icon https://fontawesome.com/icons/copy
    private copyIcon() {
        return (<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="copy" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M433.941 65.941l-51.882-51.882A48 48 0 0 0 348.118 0H176c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48v-48h80c26.51 0 48-21.49 48-48V99.882a48 48 0 0 0-14.059-33.941zM266 464H54a6 6 0 0 1-6-6V150a6 6 0 0 1 6-6h74v224c0 26.51 21.49 48 48 48h96v42a6 6 0 0 1-6 6zm128-96H182a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h106v88c0 13.255 10.745 24 24 24h88v202a6 6 0 0 1-6 6zm6-256h-64V48h9.632c1.591 0 3.117.632 4.243 1.757l48.368 48.368a6 6 0 0 1 1.757 4.243V112z"></path></svg>)
    }

    // Font awesome icon https://fontawesome.com/icons/external-link-alt
    private linkIcon() {
        return (<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="external-link-alt" role="img" viewBox="0 0 512 512"><path fill="currentColor" d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z"/></svg>)
    }

    private passwordFieldStyle(): React.CSSProperties {
        return {
            background: 'none',
            border: 'none',
            padding: 0,
            margin: 0,
            font: 'inherit',
            width: '85%'
        }
    }

    private copyToClipboard(id: string) {
        var copyText: any = document.getElementById(id)

        copyText.select()
        copyText.setSelectionRange(0, 99999) /*For mobile devices*/
        document.execCommand("copy")
    }
}