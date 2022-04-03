import React from 'react';
import { ButtonGroup } from 'react-native-elements';

type HomeTitleProps = { activeView: number, updateView: any }
type HomeTitleState = { activeView: number }

export class HeaderMenu extends React.Component<HomeTitleProps, HomeTitleState> {

    constructor(props: HomeTitleProps) {
        super(props)

        this.state = { activeView: this.props.activeView };
        this.updateView = this.updateView.bind(this)
    }

    updateView(selected: number) {

        this.props.updateView(selected);
        this.setState({ activeView: selected })
    }

    render() {
        const buttons = ['Map', 'List']

        return (
            <ButtonGroup containerStyle={{ width: 200, height: 28, backgroundColor: 'transparent', borderRadius: 6, borderColor: 'white' }}
                textStyle={{ color: 'white', fontSize: 14 }}
                innerBorderStyle={{ color: 'transparent' }}
                buttonStyle={{ borderColor: 'white' }}

                selectedButtonStyle={{ backgroundColor: 'white' }}
                selectedTextStyle={{ color: '#2185d0' }}
                onPress={this.updateView}
                selectedIndex={this.state.activeView}
                buttons={buttons} />
        );
    }
}