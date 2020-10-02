import React from 'react';
import { StyleSheet, View, Text, Linking } from 'react-native';
import { Button, ButtonGroup, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import GLOBALS from '../globals';
import { StackNavigationProp, createStackNavigator } from '@react-navigation/stack';
import MapView, { Marker } from 'react-native-maps';
import ActionSheet from "react-native-actions-sheet";
import openMap from 'react-native-open-maps';
import type { KmlMarker } from 'react-native-maps';
import { ScrollView } from 'react-native-gesture-handler';

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
    marker?: KmlMarker
}

const HomeStack = createStackNavigator();

type Props = {
    navigation: StackNavigationProp<{}>;
};

type HomeState = {
    leads: Lead[],
    isLoading: boolean,
    activeLead?: Lead,
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
            <ButtonGroup containerStyle={{ width: 200, height: 30, backgroundColor: 'transparent' }}
                textStyle={{ color: 'white' }}
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

        this.state = { leads: leads, isLoading: true, activeView: 1 };

        this.props.navigation.setOptions({
            headerShown: true,
            headerTitle: () => <LogoTitle activeView={this.state.activeView} updateView={this.changeView} />,
            headerTintColor: '#fff',
            headerStyle: { backgroundColor: '#2185d0' }
        })

        this.getLeads();
    }

    changeView = (viewIndex: number) => {

        this.setState({ activeView: viewIndex });
    }

    startNavigation(address: string) {

        //console.log('test goto map');

        openMap({ travelType: 'drive', start: 'Houston, USA', end: address, provider: 'apple' });
    }

    async getLeads() {

        try {
            const res = await fetch(GLOBALS.BASE_URL + '/api/client/getLeads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            })
            if (res.status === 200) {

                const data: any = await res.json();

                if (data) {

                    console.log(data.leads)

                    const leads: Lead[] = data.leads;
                    //const leadsWithMarker

                    for (let index = 0; index < leads.length; index++) {
                        const lead = leads[index];

                    }

                    console.log(leads)

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

    showLeadData(lead: Lead) {

        this.setState({ activeLead: lead }, this.sheetRef.current?.setModalVisible())
    }

    monthsToAge65(dob: number) {
        const month = new Date().getUTCMonth() + 1;

        /*
        console.log('-----')
        console.log(dob, 'dob')
        console.log(month, 'month')
        console.log('-----')
        console.log(dob - month, 'res')
        */

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
                            <Marker key={index} onPress={() => this.showLeadData(lead)} coordinate={lead.marker!.coordinate} />
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
                                        <Icon name="car" size={18} style={{ padding: 3, marginRight: 5 }} color="white" />
                                    } />
                                </View>
                                <View style={[{ flex: 2, flexDirection: 'column', marginLeft: 10 }]}>
                                    <Button buttonStyle={{ borderRadius: 10, padding: 10, marginTop: 15, marginBottom: 15 }} onPress={() => Linking.openURL(`tel:${this.state.activeLead?.phone}`)} title="Call" icon={
                                        <Icon name="phone" size={18} style={{ padding: 3, marginRight: 5 }} color="white" />
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
                                        <Icon name="car" size={18} style={{ padding: 3, marginRight: 5 }} color="white" />
                                    } />
                                </View>
                                <View style={[{ flex: 2, flexDirection: 'column', marginLeft: 10 }]}>
                                    <Button buttonStyle={{ borderRadius: 10, padding: 10, marginTop: 15, marginBottom: 15 }} onPress={() => Linking.openURL(`tel:${this.state.activeLead?.phone}`)} title="Call" icon={
                                        <Icon name="phone" size={18} style={{ padding: 3, marginRight: 5 }} color="white" />
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