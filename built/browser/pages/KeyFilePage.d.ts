import React from 'react';
import { RouteComponentProps } from 'react-router';
import LoginService from '../services/Login';
interface KeyFilePageProps extends RouteComponentProps {
    dependencies: {
        loginService: LoginService;
    };
    color: {
        primaryColor: string;
        secondaryColor: string;
    };
}
export default class KeyFilePage extends React.Component<KeyFilePageProps> {
    render(): JSX.Element;
    componentDidMount(): void;
}
export {};
