import React from 'react';
import { StyleSheet, View, Text, } from 'react-native';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import {StackNavigationProp, createStackNavigator } from '@react-navigation/stack';
import MapView, { Marker } from 'react-native-maps';
import ActionSheet from "react-native-actions-sheet";
import openMap from 'react-native-open-maps';
import type { KmlMarker } from 'react-native-maps';

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
    dobmon: number,
    latitude: number,
    longitude: number,
    marker?: KmlMarker
}

//const url = 'https://a0b79f3c31a0.ngrok.io';
const url = 'http://localhost:3000';

const HomeStack = createStackNavigator();

type Props = {
    navigation: StackNavigationProp<{}>;
};

type HomeState = {
    leads: Lead[],
    isLoading: boolean,
    activeLead?: Lead
}

export class HomeScreen extends React.Component<Props, HomeState> {

    sheetRef: any;

    constructor(props: Props) {
        super(props);

        this.sheetRef = React.createRef();

        this.props.navigation.setOptions({
            headerShown: true,
            headerTintColor: '#fff',
            headerStyle: { backgroundColor: '#2185d0' }
        })

        const leads: Lead[] = [];

        this.state = { leads: leads, isLoading: true };

        this.getLeads();
    }

    startNavigation(address: string) {

        //console.log('test goto map');

        openMap({ travelType: 'drive', start: 'Houston, USA', end: address, provider: 'apple' });
    }

    async getLeads() {

        try {
            const res = await fetch(url + '/api/client/getLeads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            })
            if (res.status === 200) {

                const data: any = await res.json();

                if (data) {

                    const leads: Lead[] = data.leads;
                    //const leadsWithMarker

                    for (let index = 0; index < leads.length; index++) {
                        const lead = leads[index];

                    }

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

    test() {

    }

    showLeadData(lead: Lead) {

        console.log('test');

        this.setState({ activeLead: lead }, this.sheetRef.current?.setModalVisible())
    }

    render() {
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
                                <Text style={styles.baseText}>{this.state.activeLead?.address}</Text>
                                <Text style={styles.baseText}>{this.state.activeLead?.city}</Text>
                                <Text style={styles.baseText}>{this.state.activeLead?.zipCode} {this.state.activeLead?.county}</Text>
                            </View>
                            <View style={[{ justifyContent: 'space-evenly', flexDirection: 'column' }]}>
                                <Text style={{ textAlign: 'center' }}>Turns 65 in{"\n"}4 months</Text>
                            </View>
                        </View>
                        <Button buttonStyle={{ borderRadius: 10, padding: 10, marginTop: 15, marginBottom: 15 }} onPress={() => this.startNavigation(this.state.activeLead!.address + ' ' +
                            this.state.activeLead!.city + ' ' +
                            this.state.activeLead!.county + ' ' +
                            this.state.activeLead!.state
                        )} title="Get Directions" icon={
                            <Icon name="car" size={18} style={{ padding: 3, marginRight: 5 }} color="white" />
                        } />
                    </View>
                </ActionSheet>
            </View>);
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