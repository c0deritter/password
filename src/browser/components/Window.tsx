import * as React from 'react'

interface IWindowProps {
    style?: React.CSSProperties,
    title: string,
    isHeaderShown: boolean
    windowStyle: WindowStyle
}

interface WindowStyle {
    borderColor: string,
    backgroundColor: string,
    windowButtonOneColor: string,
    windowButtonTwoColor: string,
    windowButtonThreeColor: string,
    borderRadius: string
}

class Window extends React.PureComponent<IWindowProps> {
    public constructor(props: Readonly<IWindowProps>) {
        super(props)

        this.style.bind(this)
    }

    public render() {
        return (
            <div style={ this.style() }>
                <WindowHeader isShown={ this.props.isHeaderShown } title={ this.props.title } windowStyle={ this.props.windowStyle } />
                { this.props.children }
            </div>
        )
    }

    private style(): React.CSSProperties {
        let style = this.props.style || {}

        style.overflow = 'hidden'
        style.backgroundColor = this.props.windowStyle.backgroundColor
        style.opacity = 0.9
        style.border = `1px solid ${ this.props.windowStyle.borderColor }`
        style.borderRadius = this.props.windowStyle.borderRadius
        style.boxShadow = `0px 5px 20px 1px ${ this.props.windowStyle.borderColor }`

        return style
    }
}

interface IWindowHeaderProps {
    title: string,
    windowStyle: WindowStyle
    isShown: boolean
}

class WindowHeader extends React.PureComponent<IWindowHeaderProps> {
    public constructor(props: Readonly<IWindowHeaderProps>) {
        super(props)

        this.style.bind(this)
        this.titleStyle.bind(this)
        this.buttonGroupStyle.bind(this)
    }

    public render() {
        return (
            <div style={ this.style() } >
                <h4 style={ this.titleStyle() }>{ this.props.title }</h4>
                <div style={ this.buttonGroupStyle() }>
                    <WindowMenuButton color={ this.props.windowStyle.windowButtonOneColor } />
                    <WindowMenuButton color={ this.props.windowStyle.windowButtonTwoColor } />
                    <WindowMenuButton color={ this.props.windowStyle.windowButtonThreeColor } />
                </div>
            </div>
        )
    }

    private style(): React.CSSProperties {
        return {
            width: '100%',
            height: '20px',
            borderBottom: `1px solid ${ this.props.windowStyle.borderColor }`,
            display: this.props.isShown ? 'flex' : 'none',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxSizing: 'border-box',
        }
    }

    private titleStyle(): React.CSSProperties {
        return {
            paddingLeft: '2px'
        }
    }

    private buttonGroupStyle(): React.CSSProperties {
        return {
            display: 'flex'
        }
    }
}

interface IWindowMenuButtonProps {
    color: string
}

class WindowMenuButton extends React.PureComponent<IWindowMenuButtonProps> {
    public constructor(props: Readonly<IWindowMenuButtonProps>) {
        super(props)

        this.style.bind(this)
    }

    public render() {
        return (
            <div style={ this.style() } ></div>
        )
    }

    private style(): React.CSSProperties {
        let color = this.props.color
        let radius = 5

        return {
            backgroundColor: color,
            width: radius * 2 + 'px',
            height: radius * 2 + 'px',
            border: '1px solid ' + color,
            borderTopLeftRadius: '50%',
            borderTopRightRadius: '50%',
            borderBottomRightRadius: '50%',
            borderBottomLeftRadius: '50%',
            margin: '0px 2px'
        }
    }
}

export default Window