import React from 'react';
export declare enum BackgroundImageEnum {
    DarkFloor = 0,
    Horizon = 1
}
interface BackgroundImageProps {
    backgroundImageEnum: BackgroundImageEnum;
    animation?: boolean;
    align: string;
}
export default class BackgroundImage extends React.Component<BackgroundImageProps> {
    private animationIntervalId;
    private readonly backgroundImageMap;
    render(): JSX.Element;
    componentDidMount(): void;
    componentDidUpdate(prevProps: Readonly<BackgroundImageProps>): void;
    componentWillUnmount(): void;
    private startAnimation;
    private stopAnimation;
    private toggleSize;
}
export {};
