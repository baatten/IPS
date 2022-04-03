import React from 'react';
import { ScrollView } from 'react-native';
import { ListItem } from 'react-native-elements';

type DateDropDownProps = { months: number, updateMonth: (month: number) => void }
type DateDropDownState = { months: number }

export class DateDropDown extends React.Component<DateDropDownProps, DateDropDownState> {

    constructor(props: DateDropDownProps) {
        super(props)

        this.state = { months: props.months };
    }

    updateMonth(months: number) {
        this.setState({ months: months }, () => this.props.updateMonth(months));
    }

    render() {

        return (
            <ScrollView style={{ maxHeight: 500 }}>
                <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={8} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateMonth(1)}>
                    <ListItem.Title>1 month</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.months == 1} />
                </ListItem>
                <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={9} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateMonth(2)}>
                    <ListItem.Title>2 months</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.months == 2} />
                </ListItem>
                <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={10} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateMonth(3)}>
                    <ListItem.Title>3 months</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.months == 3} />
                </ListItem>
                <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={11} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateMonth(4)}>
                    <ListItem.Title>4 months</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.months == 4} />
                </ListItem>
                <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={12} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateMonth(5)}>
                    <ListItem.Title>5 months</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.months == 5} />
                </ListItem>
                <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={13} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateMonth(6)}>
                    <ListItem.Title>6 months</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.months == 6 || this.state.months == 0} />
                </ListItem>
                <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={14} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateMonth(7)}>
                    <ListItem.Title>7 months</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.months == 7} />
                </ListItem>
                <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={15} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateMonth(8)}>
                    <ListItem.Title>8 months</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.months == 8} />
                </ListItem>
                <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={16} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateMonth(9)}>
                    <ListItem.Title>9 months</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.months == 9} />
                </ListItem>
            </ScrollView>
        );
    }
}