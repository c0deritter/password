import * as React from 'react';
interface IWindowProps {
    style?: React.CSSProperties;
    title: string;
    isHeaderShown: boolean;
    windowStyle: WindowStyle;
}
interface WindowStyle {
    borderColor: string;
    backgroundColor: string;
    windowButtonOneColor: string;
    windowButtonTwoColor: string;
    windowButtonThreeColor: string;
    borderRadius: string;
}
declare class Window extends React.PureComponent<IWindowProps> {
    constructor(props: Readonly<IWindowProps>);
    render(): JSX.Element;
    private style;
}
export default Window;
