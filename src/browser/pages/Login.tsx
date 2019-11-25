import React from 'react'
import Window from '../components/Window'
import LoginService from '../services/Login'
import KeyListenerSerivce from '../services/KeyListener'
import { RouteComponentProps } from 'react-router'

interface LoginPageProps extends RouteComponentProps {
    dependencies: {
        keyListenerService: KeyListenerSerivce
        loginService: LoginService,
    }
    color: {
        primaryColor: string,
        secondaryColor: string
    }
}

interface LoginPageState {
    keyFileName: string,
    password: string,
    invalidShake: boolean
}

export default class LoginPage extends React.Component<LoginPageProps, LoginPageState> {
    private keyListnerUnregister = () => {}

    constructor(props: Readonly<LoginPageProps>) {
        super(props)

        this.state = {
            keyFileName: '',
            password: '',
            invalidShake: false
        }
    }

    public render() {
        return (
            <div className={ this.state.invalidShake ? 'invalid': '' } style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '95vh' }}>
                <Window
                title={ 'Login' }
                isHeaderShown={ true }
                windowStyle={this.windowStyle()}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box', padding: '5px' }}>
                        <input style={ this.inputStyle() } placeholder='user' type='text' value={ this.state.keyFileName } onChange={ (event) => this.setState({ keyFileName: event.target.value}) }></input>
                        <input style={ this.inputStyle() } placeholder='password<Enter>' type='password' value={ this.state.password } onChange={ (event) => this.setState({ password: event.target.value}) }></input>
                    </div>
                </Window>
                { this.invalidShakeStyle() }
            </div>
        )
    }

    private windowStyle() {
        return {
            backgroundColor: 'black',
            borderColor: this.props.color.primaryColor,
            windowButtonOneColor: this.props.color.primaryColor,
            windowButtonTwoColor: this.props.color.primaryColor,
            windowButtonThreeColor: this.props.color.secondaryColor,
            borderRadius: '2px 2px 2px 2px'
        }
    }

    private inputStyle(): React.CSSProperties {
        return {
            background: 'none',
            margin: '15px',
            padding: '7px',
            width: '25vw',
            border: `1px solid ${ this.props.color.primaryColor }`,
            borderRadius: '2px 2px 2px 2px'
        }
    }

    private invalidShakeStyle() {
        return (
            <style>
                .invalid {'{'}
                    animation: shake .5s linear
                {'}'}

                @-webkit-keyframes shake {'{'}
                    8%, 41% {'{'}
                        -webkit-transform: translateX(-10px);
                    {'}'}
                    25%, 58% {'{'}
                        -webkit-transform: translateX(10px);
                    {'}'}
                    75% {'{'}
                        -webkit-transform: translateX(-5px);
                    {'}'}
                    92% {'{'}
                        -webkit-transform: translateX(5px);
                    {'}'}
                    0%, 100% {'{'}
                        -webkit-transform: translateX(0);
                    {'}'}
                {'}'}
            </style>
        )
    }

    private invalidShake() {
        this.setState({ invalidShake: true })
        setTimeout(() => {
            this.setState({ invalidShake: false })
        }, 500)
    }

    public componentDidMount() {
        this.keyListnerUnregister = this.props.dependencies.keyListenerService.register({ key: 'Enter', func: async () => {
            const success = await this.props.dependencies.loginService.login(this.state.keyFileName, this.state.password)
            if (!success) {
                this.invalidShake()
            } else {
                this.props.history.push('/keyFile')
            }
        }})
    }

    public componentWillUnmount() {
        this.keyListnerUnregister()
    }
}