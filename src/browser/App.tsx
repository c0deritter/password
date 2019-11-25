import * as React from 'react'
import * as ReactDom from 'react-dom'
import { HashRouter as Router, Route, RouteComponentProps } from 'react-router-dom'
import LoginPage from './pages/Login'
import BackgroundImage, { BackgroundImageEnum } from './components/BackgroundImage'
import LoginService from './services/Login'
import KeyListenerSerivce from './services/KeyListener'
import KeyPage from './pages/KeyFile'

class App extends React.Component {
    private keyListenerService: KeyListenerSerivce = new KeyListenerSerivce()
    private loginService: LoginService = new LoginService()

    constructor() {
        super({})
    }

    render() {
        return (
            <div style = { this.style().font }>  
                <Router>
                    <Route path='/' exact component={
                        (props: RouteComponentProps) => (
                            <div>
                                <BackgroundImage align="top center" backgroundImageEnum={ BackgroundImageEnum.DarkFloor }></BackgroundImage>
                                <LoginPage { ...props } dependencies={{ keyListenerService: this.keyListenerService, loginService: this.loginService }} color={ this.style().color }></LoginPage>
                            </div>
                        )
                    }></Route>
                    <Route path='/keyFile' component={
                        (props: RouteComponentProps) => {
                            if (this.loginService.isLoggedIn) {
                                return (
                                    <div>
                                        <BackgroundImage align="bottom center" backgroundImageEnum={ BackgroundImageEnum.Horizon }></BackgroundImage>
                                        <KeyPage { ...props } dependencies={{ loginService: this.loginService }} color={ this.style().color }></KeyPage>
                                    </div>
                                )
                            } else {
                                props.history.push('/')
                                return (<div></div>)
                            }
                        }
                    }></Route>
                </Router>
                { this.cssReset() }
            </div>
        )
    }

    private style() {
        return {
            color: {
                primaryColor: '#009999',
                secondaryColor: '#990000'
            },
            font: {
                fontFamily: '"Saira Stencil One", cursive',
                fontSize: '20px',
                color: '#009999'
            }
        }
    }

    private cssReset() {
        return (
            <style>
                input, select, textarea, button, a { '{' }
                    font-family:inherit;
                    color: inherit
                {'}'}
            </style>
        )
    }
}

ReactDom.render(<App></App>, document.getElementById('app'))