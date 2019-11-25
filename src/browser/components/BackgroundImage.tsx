import React from 'react'

export enum BackgroundImageEnum {
    DarkFloor,
    Horizon
}

interface BackgroundImageProps {
    backgroundImageEnum: BackgroundImageEnum
    animation?: boolean,
    align: string
}

export default class BackgroundImage extends React.Component<BackgroundImageProps> {
    private animationIntervalId: number = NaN
    private readonly backgroundImageMap = {
        [BackgroundImageEnum.DarkFloor]: {
            enum: BackgroundImageEnum.DarkFloor,
            backgroundImageUrl: 'https://images.unsplash.com/photo-1490218569501-485856398634?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80',
            backgroundLabelText: 'Photo by Hermes Rivera on Unsplash',
            backgroundLabelUrl: 'https://unsplash.com/@hermez777'
        },
        [BackgroundImageEnum.Horizon]: {
            enum: BackgroundImageEnum.Horizon,
            backgroundImageUrl: 'https://images.unsplash.com/photo-1484950763426-56b5bf172dbb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80',
            backgroundLabelText: 'Photo by Jonatan Pie on Unsplash',
            backgroundLabelUrl: 'https://unsplash.com/@r3dmax'
        }
    }

    public render() {
        return (
            <div>
                <a href={ this.backgroundImageMap[this.props.backgroundImageEnum].backgroundLabelUrl } style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: '#00000066', padding: '5px' }}>{ this.backgroundImageMap[this.props.backgroundImageEnum].backgroundLabelText }</a>            
                <style>
                    body { '{' }
                        transition: background-size 2s ease
                    {'}'}
                </style>
            </div>
        )
    }

    public componentDidMount() {
        const bodyStyle = document.getElementsByTagName("body")[0].style
        bodyStyle.backgroundImage = `url( ${ this.backgroundImageMap[this.props.backgroundImageEnum].backgroundImageUrl })`
        bodyStyle.backgroundPosition = this.props.align
        bodyStyle.backgroundSize = '100%'
        bodyStyle.backgroundRepeat = 'no-repeat'
        bodyStyle.backgroundAttachment = 'fixed'
        bodyStyle.backgroundColor = 'black'

        if (this.props.animation) {
            this.startAnimation()
        }
    }

    componentDidUpdate(prevProps: Readonly<BackgroundImageProps>) {
        if (this.props.animation === true && prevProps.animation === false) {
            this.startAnimation()
        }

        if (this.props.animation === false && prevProps.animation === true) {
            this.stopAnimation()
        }
    }

    public componentWillUnmount() {
        this.stopAnimation()
    }

    private startAnimation() {
        this.toggleSize()
        this.animationIntervalId = window.setInterval(() => {
            this.toggleSize()
        }, 2000) 
    }

    private stopAnimation() {
        window.clearInterval(this.animationIntervalId)
        document.getElementsByTagName("body")[0].style.backgroundSize = '100%'
        this.animationIntervalId = NaN
    }

    private toggleSize() {
        if (document.getElementsByTagName("body")[0].style.backgroundSize === '100%') {
            document.getElementsByTagName("body")[0].style.backgroundSize = '110%'
        } else {
            document.getElementsByTagName("body")[0].style.backgroundSize = '100%'
        }
    }
}