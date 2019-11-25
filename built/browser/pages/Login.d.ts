import React from 'react';
import LoginService from '../services/Login';
import KeyListenerSerivce from '../services/KeyListener';
import { RouteComponentProps } from 'react-router';
interface LoginPageProps extends RouteComponentProps {
    dependencies: {
        keyListenerService: KeyListenerSerivce;
        loginService: LoginService;
    };
    color: {
        primaryColor: string;
        secondaryColor: string;
    };
}
interface LoginPageState {
    keyFileName: string;
    password: string;
    invalidShake: boolean;
}
export default class LoginPage extends React.Component<LoginPageProps, LoginPageState> {
    private keyListnerUnregister;
    constructor(props: Readonly<LoginPageProps>);
    render(): JSX.Element;
    private windowStyle;
    private inputStyle;
    private invalidShakeStyle;
    private invalidShake;
    componentDidMount(): void;
    componentWillUnmount(): void;
}
export {};
