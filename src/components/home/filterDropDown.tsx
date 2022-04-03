import React from 'react';
import { View, ScrollView } from 'react-native';
import { ListItem, Input, Button } from 'react-native-elements';

type FilterDropDownProps = {
    useCustomLocation: boolean,
    zipCode?: string,
    radius: number,
    sortingType: string,
    sortingDirection: number,
    updateView: (radius: number) => void,
    updateSorting: (sortingType: string) => void
    setCustomLocation: (zipCode: string) => void
    useMyLocation: () => void
}
type FilterDropDownState = { radius: number, useCustomLocation: boolean, zipCode?: string, }

export class FilterDropDown extends React.Component<FilterDropDownProps, FilterDropDownState> {

    constructor(props: FilterDropDownProps) {
        super(props)

        this.state = { radius: this.props.radius, useCustomLocation: props.useCustomLocation, zipCode: props.zipCode };
    }

    updateRadius(radius: number) {

        this.setState({ radius: radius },
            () => this.props.updateView(
                radius
            ))
    }

    updateZipCode(zipCode: string) {

        this.setState({ zipCode: zipCode }, () => this.props.updateView(
            this.state.radius
        ))
    }

    useCustomLocation(activate: boolean) {

        this.setState({ useCustomLocation: activate });

        if (!activate)
            this.props.useMyLocation();
    }

    setCustomLocation() {

        this.props.setCustomLocation(this.state.zipCode!)
    }

    render() {

        return (
            <ScrollView keyboardShouldPersistTaps='always' style={{ maxHeight: 600 }}>
                <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={8} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.useCustomLocation(false)}>
                    <ListItem.Title>Use My Location</ListItem.Title>
                    {!this.state.useCustomLocation && (
                        <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' checked={!this.state.useCustomLocation} />
                    )}
                </ListItem>
                <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={9} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.useCustomLocation(true)}>
                    <ListItem.Title>Use Zipcode</ListItem.Title>
                    {this.state.useCustomLocation && (
                        <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' checked={this.state.useCustomLocation} />
                    )}
                </ListItem>
                {this.state.useCustomLocation && (
                    <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={10} bottomDivider containerStyle={{ padding: 3 }}>
                        <ListItem.Content>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View style={{ flex: 3 }}>
                                    <Input autoCompleteType={undefined} inputStyle={{ padding: 0 }}
                                        inputContainerStyle={{ borderBottomWidth: 0, backgroundColor: 'white' }}
                                        containerStyle={{ backgroundColor: 'white', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, height: 40 }}
                                        placeholder="zip code"
                                        keyboardType='numeric'
                                        value={this.state.zipCode}
                                        autoFocus
                                        onChangeText={(text => this.setState({ zipCode: text }))}
                                    />
                                </View>
                                <Button title='GO'
                                    titleStyle={{ fontSize: 12, fontWeight: 'bold' }}
                                    style={{ maxHeight: 28, padding: 0, margin: 0 }}
                                    buttonStyle={{ padding: 5, margin: 0 }}
                                    containerStyle={{ margin: 0, marginRight: 5 }}
                                    disabled={this.state.zipCode == null || this.state.zipCode.length != 5}
                                    onPress={() => this.setCustomLocation()}
                                />
                            </View>
                        </ListItem.Content>
                    </ListItem>
                )}

                <>
                    <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} containerStyle={{ backgroundColor: '#eee' }} style={{ height: 5, backgroundColor: 'transparent' }}></ListItem>
                    <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={0} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateRadius(1)}>
                        <ListItem.Title>1 mile radius</ListItem.Title>
                        <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.radius == 1} />
                    </ListItem>
                    <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={1} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateRadius(3)}>
                        <ListItem.Title>3 miles radius</ListItem.Title>
                        <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.radius == 3} />
                    </ListItem>
                    <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={2} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateRadius(5)}>
                        <ListItem.Title>5 miles radius</ListItem.Title>
                        <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.radius == 5} />
                    </ListItem>
                    <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={3} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateRadius(10)}>
                        <ListItem.Title>10 miles radius</ListItem.Title>
                        <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.radius == 10} />
                    </ListItem>
                    <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={4} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateRadius(25)}>
                        <ListItem.Title>25 miles radius</ListItem.Title>
                        <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.radius == 25} />
                    </ListItem>
                    <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={5} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateRadius(50)}>
                        <ListItem.Title>50 miles radius</ListItem.Title>
                        <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.radius == 50} />
                    </ListItem>
                </>
                <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} containerStyle={{ backgroundColor: '#eee' }} style={{ height: 5, backgroundColor: 'transparent' }}></ListItem>
                <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={6} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.props.updateSorting('distance')}>
                    <ListItem.Title>Sort By Distance</ListItem.Title>
                    {this.props.sortingType == 'distance' && (
                        <ListItem.CheckBox size={18} checkedIcon='chevron-up' uncheckedIcon='chevron-down' checked={this.props.sortingDirection == 1} />
                    )}
                </ListItem>
                <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={7} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.props.updateSorting('birthday')}>
                    <ListItem.Title>Sort By Birthday</ListItem.Title>
                    {this.props.sortingType == 'birthday' && (
                        <ListItem.CheckBox size={18} checkedIcon='chevron-up' uncheckedIcon='chevron-down' checked={this.props.sortingDirection == 1} />
                    )}
                </ListItem>
            </ScrollView>
        );
    }
}