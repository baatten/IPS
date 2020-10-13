import React from 'react';
import { StyleSheet, View, ScrollView, Text, Linking } from 'react-native';
import { Button, ButtonGroup, ListItem, Icon } from 'react-native-elements';

import GLOBALS from '../globals';
import { StackNavigationProp, createStackNavigator } from '@react-navigation/stack';
import MapView, { Marker } from 'react-native-maps';
import ActionSheet from "react-native-actions-sheet";
import openMap from 'react-native-open-maps';
import type { KmlMarker } from 'react-native-maps';
import Popover, { PopoverPlacement } from 'react-native-popover-view';

type Lead = {
    id?: number
    firstname: string
    lastName: string
    address: string
    city: string
    state: string
    zipCode: string
    county: string
    phone: string
    age: number
    dobmon: any,
    latitude: number,
    longitude: number,
    marker?: KmlMarker,
    leadInterActions?: LeadInteraction[]
}

type LeadInteraction = {
    date: any
    id: number
    leadId: number
    userId: number
}

const HomeStack = createStackNavigator();

type Props = {
    navigation: StackNavigationProp<{}>;
};

type HomeState = {
    leads: Lead[],
    isLoading: boolean,
    activeLead?: Lead,
    filterDistance: number
    activeView: number
}

type HomeTitleProps = { activeView: number, updateView: any }
type HomeTitleState = { activeView: number }

class LogoTitle extends React.Component<HomeTitleProps, HomeTitleState> {

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
            <ButtonGroup containerStyle={{ width: 200, height: 28, backgroundColor: 'transparent', borderRadius: 6 }}
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

export class HomeScreen extends React.Component<Props, HomeState> {

    sheetRef: any;

    constructor(props: Props) {
        super(props);

        this.sheetRef = React.createRef();

        const leads: Lead[] = [];

        this.state = { leads: leads, isLoading: true, activeView: 0, filterDistance: 50 };

        this.props.navigation.setOptions({
            headerShown: true,
            headerTitle: () => <LogoTitle activeView={this.state.activeView} updateView={this.changeView} />,
            headerTintColor: '#fff',
            headerStyle: { backgroundColor: '#2185d0' },
            headerRight: () => <Popover popoverStyle={{ borderRadius: 10 }} backgroundStyle={{ backgroundColor: 'transparent' }} placement={PopoverPlacement.BOTTOM}
                from={(
                    <Button icon={<Icon name='map-marked-alt' color='white' size={18} type='font-awesome-5' style={{ color: 'white' }} />} buttonStyle={{ marginRight: 5, backgroundColor: 'transparent' }} />
                )}>

                <ListItem key={0} bottomDivider containerStyle={{ padding: 12 }}>
                    <Icon name='check' size={18} color='transparent'></Icon>
                    <ListItem.Title>5 miles radius</ListItem.Title>
                </ListItem>
                <ListItem key={1} bottomDivider containerStyle={{ padding: 12 }}>
                    <Icon name='check' size={18} color='transparent'></Icon>
                    <ListItem.Title>20 miles radius</ListItem.Title>
                </ListItem>
                <ListItem key={2} bottomDivider containerStyle={{ padding: 12 }}>
                    <Icon name='check' size={18}></Icon>
                    <ListItem.Title>50 miles radius</ListItem.Title>
                </ListItem>
            </Popover>
        })

        this.getLeads();
    }

    changeView = (viewIndex: number) => {

        this.setState({ activeView: viewIndex });
    }

    startNavigation(address: string) {

        openMap({ travelType: 'drive', start: 'Houston, USA', end: address, provider: 'apple' });
    }

    updateFilterDistance(filter: number) {

        this.setState({ filterDistance: filter }, () => this.getLeads())
    }

    async getLeads() {

        try {
            const res = await fetch(GLOBALS.BASE_URL + '/api/client/getLeads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ radius: this.state.filterDistance })
            })
            if (res.status === 200) {

                const data: any = await res.json();

                if (data) {

                    this.setState({ isLoading: false, leads: data.leads })
                }
                else {

                }

            } else {

            }
        } catch (error) {
            console.error('An unexpected error happened occurred:', error)
        }
    }

    async saveLeadInteraction(lead: Lead, index: number) {

        //console.log(lead)

        try {
            const res = await fetch(GLOBALS.BASE_URL + '/api/client/saveLeadInteraction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId: lead.id })
            })
            if (res.status === 200) {

                const data: any = await res.json();

                if (data) {

                    let leads = [...this.state.leads];
                    let lead = { ...leads[index] };

                    lead.leadInterActions?.push(data.leadInteraction)
                    leads[index] = lead;

                    this.setState({ isLoading: false, leads: leads })
                }
                else {

                }

            } else {

            }
        } catch (error) {
            console.error('An unexpected error happened occurred:', error)
        }
    }

    showLeadData(lead: Lead, index: number) {

        this.setState({ activeLead: lead }, this.sheetRef.current?.setModalVisible())

        this.saveLeadInteraction(lead, index);
    }

    monthsToAge65(dob: number) {

        const month = new Date().getUTCMonth() + 1;

        if (dob < month)
            return 'Already turned 65';
        else if (dob > month)
            return 'Turns 65 in under ' + (dob - month) + ' months'
        else if (dob == month)
            return 'Turns 65 in under 1 months'

        return "error";
    }

    render() {

        if (this.state.activeView == 0) {
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <MapView initialRegion={{ latitude: 31.968599, longitude: -99.901810, latitudeDelta: 10, longitudeDelta: 10, }} style={{ flex: 1, height: 400, width: '100%', }} showsUserLocation={true}>
                        {this.state.leads.map((lead: Lead, index: any) => (
                            <Marker key={index} pinColor={(lead.leadInterActions != undefined && lead.leadInterActions.length > 0) ?
                                'green' :
                                'red'}
                                onPress={() => this.showLeadData(lead, index)} coordinate={lead.marker!.coordinate} />
                        ))}
                    </MapView>
                    <ActionSheet ref={this.sheetRef} bounceOnOpen={true}>
                        <View style={{
                            borderTopStartRadius: 0, borderTopRightRadius: 0, padding: 20, backgroundColor: 'white',
                            shadowColor: 'black', shadowOpacity: 0.15, shadowRadius: 5, shadowOffset: { width: 5, height: 50 }
                        }}>
                            <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={[{ flex: 1, flexDirection: 'column' }]}>
                                    <Text style={styles.titleText}>{this.state.activeLead?.firstname} {this.state.activeLead?.lastName}</Text>
                                    <Text style={{ fontSize: 16, color: 'gray', marginTop: 5 }}>{this.state.activeLead?.address}</Text>
                                    <Text style={{ fontSize: 16, color: 'gray' }}>{this.state.activeLead?.city}</Text>
                                    <Text style={{ fontSize: 16, color: 'gray' }}>{this.state.activeLead?.zipCode} {this.state.activeLead?.county}</Text>
                                </View>
                                <View style={[{ justifyContent: 'space-evenly', flexDirection: 'column' }]}>
                                    <Text style={{ textAlign: 'center' }}>{this.monthsToAge65(this.state.activeLead?.dobmon)}</Text>
                                </View>
                            </View>
                            <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={[{ flex: 4, flexDirection: 'column' }]}>
                                    <Button buttonStyle={{ borderRadius: 10, padding: 10, marginTop: 15, marginBottom: 15 }} onPress={() => this.startNavigation(this.state.activeLead!.address + ' ' +
                                        this.state.activeLead!.city + ' ' +
                                        this.state.activeLead!.county + ' ' +
                                        this.state.activeLead!.state
                                    )} title="Get Directions" icon={
                                        <Icon name="car" type='font-awesome' size={18} style={{ padding: 3, marginRight: 5 }} color="white" />
                                    } />
                                </View>
                                <View style={[{ flex: 2, flexDirection: 'column', marginLeft: 10 }]}>
                                    <Button buttonStyle={{ borderRadius: 10, padding: 10, marginTop: 15, marginBottom: 15 }} onPress={() => Linking.openURL(`tel:${this.state.activeLead?.phone}`)} title="Call" icon={
                                        <Icon name="phone" type='font-awesome' size={18} style={{ padding: 3, marginRight: 5 }} color="white" />
                                    } />
                                </View>
                            </View>

                        </View>
                    </ActionSheet>
                </View>);
        }
        else {
            return (
                <ScrollView>
                    {
                        this.state.leads.map((lead: Lead, i) => (
                            <ListItem key={i} bottomDivider onPress={() => this.showLeadData(lead)} >
                                <ListItem.Content>
                                    <ListItem.Title style={{ fontWeight: '600' }}>{lead.firstname} {lead.lastName}</ListItem.Title>
                                    <ListItem.Subtitle style={{ color: 'grey' }}>{lead.address}, {lead.city}</ListItem.Subtitle>
                                </ListItem.Content>
                                <ListItem.Subtitle >{this.monthsToAge65(lead.dobmon)}</ListItem.Subtitle>
                            </ListItem>
                        ))
                    }
                    <ActionSheet ref={this.sheetRef} bounceOnOpen={true}>
                        <View style={{
                            borderTopStartRadius: 0, borderTopRightRadius: 0, padding: 20, backgroundColor: 'white',
                            shadowColor: 'black', shadowOpacity: 0.15, shadowRadius: 5, shadowOffset: { width: 5, height: 50 }
                        }}>
                            <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={[{ flex: 1, flexDirection: 'column' }]}>
                                    <Text style={styles.titleText}>{this.state.activeLead?.firstname} {this.state.activeLead?.lastName}</Text>
                                    <Text style={{ fontSize: 16, color: 'gray', marginTop: 5 }}>{this.state.activeLead?.address}</Text>
                                    <Text style={{ fontSize: 16, color: 'gray' }}>{this.state.activeLead?.city}</Text>
                                    <Text style={{ fontSize: 16, color: 'gray' }}>{this.state.activeLead?.zipCode} {this.state.activeLead?.county}</Text>
                                </View>
                                <View style={[{ justifyContent: 'space-evenly', flexDirection: 'column' }]}>
                                    <Text style={{ textAlign: 'center' }}>{this.monthsToAge65(this.state.activeLead?.dobmon)}</Text>
                                </View>
                            </View>
                            <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={[{ flex: 4, flexDirection: 'column' }]}>
                                    <Button buttonStyle={{ borderRadius: 10, padding: 10, marginTop: 15, marginBottom: 15 }} onPress={() => this.startNavigation(this.state.activeLead!.address + ' ' +
                                        this.state.activeLead!.city + ' ' +
                                        this.state.activeLead!.county + ' ' +
                                        this.state.activeLead!.state
                                    )} title="Get Directions" icon={
                                        <Icon name="car" type='font-awesome' size={18} style={{ padding: 3, marginRight: 5 }} color="white" />
                                    } />
                                </View>
                                <View style={[{ flex: 2, flexDirection: 'column', marginLeft: 10 }]}>
                                    <Button buttonStyle={{ borderRadius: 10, padding: 10, marginTop: 15, marginBottom: 15 }} onPress={() => Linking.openURL(`tel:${this.state.activeLead?.phone}`)} title="Call" icon={
                                        <Icon name="phone" type='font-awesome' size={18} style={{ padding: 3, marginRight: 5 }} color="white" />
                                    } />
                                </View>
                            </View>

                        </View>
                    </ActionSheet>
                </ScrollView>
            )
        }
    }
}

export function HomeStackScreen() {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen name="Home" component={HomeScreen} />
        </HomeStack.Navigator>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    baseText: {
        fontSize: 18,
    },
    titleText: {
        fontSize: 20,
        fontWeight: "bold"
    }
});