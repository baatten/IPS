import React from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createStackNavigator } from '@react-navigation/stack';
import MapView, { Marker, Callout } from 'react-native-maps';
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

const url = 'https://1a15f1850a15.ngrok.io';

const HomeStack = createStackNavigator();

type HomeState = {
    leads: Lead[],
    isLoading: boolean,
    activeLead?: Lead
}

export class HomeScreen extends React.Component<any, HomeState> {

    sheetRef: any;

    constructor(props: HomeState) {
        super(props);

        this.sheetRef = React.createRef();

        const leads: Lead[] = [];

        this.state = { leads: leads, isLoading: true };

        this.getLeads();
    }

    startNavigation(address: string) {

        //console.log('test goto map');

        openMap({ travelType: 'drive', start: 'Houston, USA', end: address, provider: 'google' });
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
                <ActionSheet ref={this.sheetRef}>
                    <View style={{
                        borderTopStartRadius: 0, borderTopRightRadius: 0, padding: 20, backgroundColor: 'white',
                        shadowColor: 'black', shadowOpacity: 0.15, shadowRadius: 5, shadowOffset: { width: 5, height: 50 }
                    }}>
                        <Text style={styles.titleText}>{this.state.activeLead?.firstname} {this.state.activeLead?.lastName}</Text>
                        <Text style={styles.baseText}>Turns 65 in 4 months</Text>

                        <Text style={styles.baseText}>{this.state.activeLead?.address}</Text>
                        <Text style={styles.baseText}>{this.state.activeLead?.city}</Text>
                        <Text style={styles.baseText}>{this.state.activeLead?.zipCode} {this.state.activeLead?.county}</Text>

                        <Text style={styles.baseText}>8 miles away</Text>

                        <Button buttonStyle={{ borderRadius: 10,padding:10,marginTop:15,marginBottom:15 }} onPress={() => this.startNavigation(this.state.activeLead!.address + ' ' +
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
            <HomeStack.Screen options={{
                headerShown: true,
                headerTintColor: '#fff',
                headerStyle: { backgroundColor: '#2185d0' },
                headerRight: () => (
                    <Button onPress={() => alert('This is a button!')} title="" type='clear' icon={
                        <Icon name="filter" size={20} style={{ color: 'white', padding: 3 }} />
                    } />
                ), headerLeft: () => (
                    <Button onPress={() => alert('This is a button!')} title="" containerStyle={{}} type='clear' icon={<Icon name="refresh" size={20} style={{ color: 'white', padding: 3 }} />}></Button>
                )
            }} name="Home" component={HomeScreen} />
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