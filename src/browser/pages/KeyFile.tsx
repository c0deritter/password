import React from 'react'
import { RouteComponentProps } from 'react-router'
import LoginService from '../services/Login'
import KeyFile from '../components/KeyFile'

interface KeyFilePageProps extends RouteComponentProps {
    dependencies: {
        loginService: LoginService
    },
    color: {
        primaryColor: string,
        secondaryColor: string
    }
}

export default class KeyFilePage extends React.Component<KeyFilePageProps> {
    public render() {
        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <KeyFile keyFile={ this.props.dependencies.loginService.keyFile! }></KeyFile>
                </div>
            </div>
        )
    }
}