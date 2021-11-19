import React from 'react';
import { StyleSheet, View, ScrollView, Text, Linking, TouchableOpacity, KeyboardAvoidingView, ActivityIndicator, AppState, FlatList, Alert } from 'react-native';
import { ButtonGroup, ListItem, Icon, Input, Divider, Button } from 'react-native-elements';
import GLOBALS from '../globals';
import { StackNavigationProp, createStackNavigator } from '@react-navigation/stack';
import MapView, { Marker, EventUserLocation, LatLng } from 'react-native-maps';
import ActionSheet from "react-native-actions-sheet";
import type { Camera } from 'react-native-maps';
import Popover, { PopoverPlacement } from 'react-native-popover-view';
//import * as Location from 'expo-location'
//import Geolocation from '@react-native-community/geolocation';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lead } from '../lib/types'
import { LeadPopUp } from '../components/general/leadPopup';
import { LeadPopUpSave } from '../components/general/leadPopupSave';

type Location = {
    accuracy?: number,
    altitude?: number,
    altitudeAccuracy?: number,
    latitude: number,
    longitude: number
    speed?: number,
    timestamp?: string,
} | null

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
class FilterDropDown extends React.Component<FilterDropDownProps, FilterDropDownState> {

    constructor(props: FilterDropDownProps) {
        super(props)

        this.state = { radius: this.props.radius, useCustomLocation: props.useCustomLocation, zipCode: props.zipCode };
        //this.updateView = this.updateView.bind(this)
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
                <ListItem key={8} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.useCustomLocation(false)}>
                    <ListItem.Title>Use My Location</ListItem.Title>
                    {!this.state.useCustomLocation && (
                        <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' checked={!this.state.useCustomLocation} />
                    )}
                </ListItem>
                <ListItem key={9} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.useCustomLocation(true)}>
                    <ListItem.Title>Use Zipcode</ListItem.Title>
                    {this.state.useCustomLocation && (
                        <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' checked={this.state.useCustomLocation} />
                    )}
                </ListItem>
                {this.state.useCustomLocation && (
                    <ListItem key={10} bottomDivider containerStyle={{ padding: 3 }}>
                        <ListItem.Content>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View style={{ flex: 3 }}>
                                    <Input inputStyle={{ padding: 0 }}
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
                                    //iconRight
                                    //icon={<Icon size={12} containerStyle={{marginLeft:5}} name='chevron-right' type='font-awesome-5' color='white' />}
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
                    <ListItem containerStyle={{ backgroundColor: '#eee' }} style={{ height: 5, backgroundColor: 'transparent' }}></ListItem>

                    <ListItem key={0} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateRadius(1)}>
                        <ListItem.Title>1 mile radius</ListItem.Title>
                        <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.radius == 1} />
                    </ListItem>
                    <ListItem key={1} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateRadius(3)}>
                        <ListItem.Title>3 miles radius</ListItem.Title>
                        <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.radius == 3} />
                    </ListItem>
                    <ListItem key={2} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateRadius(5)}>
                        <ListItem.Title>5 miles radius</ListItem.Title>
                        <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.radius == 5} />
                    </ListItem>
                    <ListItem key={3} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateRadius(10)}>
                        <ListItem.Title>10 miles radius</ListItem.Title>
                        <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.radius == 10} />
                    </ListItem>
                    <ListItem key={4} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateRadius(25)}>
                        <ListItem.Title>25 miles radius</ListItem.Title>
                        <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.radius == 25} />
                    </ListItem>
                    <ListItem key={5} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateRadius(50)}>
                        <ListItem.Title>50 miles radius</ListItem.Title>
                        <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.radius == 50} />
                    </ListItem>
                </>


                <ListItem containerStyle={{ backgroundColor: '#eee' }} style={{ height: 5, backgroundColor: 'transparent' }}></ListItem>

                <ListItem key={6} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.props.updateSorting('distance')}>
                    <ListItem.Title>Sort By Distance</ListItem.Title>
                    {this.props.sortingType == 'distance' && (
                        <ListItem.CheckBox size={18} checkedIcon='chevron-up' uncheckedIcon='chevron-down' checked={this.props.sortingDirection == 1} />
                    )}
                </ListItem>
                <ListItem key={7} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.props.updateSorting('birthday')}>
                    <ListItem.Title>Sort By Birthday</ListItem.Title>
                    {this.props.sortingType == 'birthday' && (
                        <ListItem.CheckBox size={18} checkedIcon='chevron-up' uncheckedIcon='chevron-down' checked={this.props.sortingDirection == 1} />
                    )}
                </ListItem>



            </ScrollView>
        );
    }
}

type DateDropDownProps = { months: number, updateMonth: (month: number) => void }
type DateDropDownState = { months: number }
class DateDropDown extends React.Component<DateDropDownProps, DateDropDownState> {

    constructor(props: DateDropDownProps) {
        super(props)

        this.state = { months: props.months };
        //this.updateView = this.updateView.bind(this)
    }

    updateMonth(months: number) {
        this.setState({ months: months }, () => this.props.updateMonth(months));
    }

    render() {

        return (
            <ScrollView style={{ maxHeight: 500 }}>
                <ListItem key={8} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateMonth(1)}>
                    <ListItem.Title>1 month</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.months == 1} />
                </ListItem>
                <ListItem key={9} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateMonth(2)}>
                    <ListItem.Title>2 months</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.months == 2} />
                </ListItem>
                <ListItem key={10} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateMonth(3)}>
                    <ListItem.Title>3 months</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.months == 3} />
                </ListItem>
                <ListItem key={11} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateMonth(4)}>
                    <ListItem.Title>4 months</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.months == 4} />
                </ListItem>
                <ListItem key={12} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateMonth(5)}>
                    <ListItem.Title>5 months</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.months == 5} />
                </ListItem>
                <ListItem key={13} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateMonth(6)}>
                    <ListItem.Title>6 months</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.months == 6 || this.state.months == 0} />
                </ListItem>
                <ListItem key={14} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateMonth(7)}>
                    <ListItem.Title>7 months</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.months == 7} />
                </ListItem>
                <ListItem key={15} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateMonth(8)}>
                    <ListItem.Title>8 months</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.months == 8} />
                </ListItem>
                <ListItem key={16} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateMonth(9)}>
                    <ListItem.Title>9 months</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.months == 9} />
                </ListItem>
            </ScrollView>
        );
    }
}

const HomeStack = createStackNavigator();
type HomeProps = {
    navigation: StackNavigationProp<{}>;
};

type HomeState = {
    appState: any
    leads: Lead[],
    isLoading: boolean,
    activeLead?: Lead,
    activeIndex?: number,
    savingLead: boolean,
    filterDistance: number
    activeView: number
    currentLocation?: Location,
    showRadiusFilter: boolean,
    showDateFilter: boolean,
    filterMonths: number,
    leadSortingType: string,
    leadSortingDirection: number,
    showLocationUpdated: boolean,
    useCustomLocation: boolean,
    zipCode?: string
}

export class HomeScreen extends React.Component<HomeProps, HomeState> {

    sheetRef: any;
    mapRef: any;
    filterPopover: any;
    datePopover: any;
    saveLeadSheetRef: any;
    appStateSubscription: any;

    constructor(props: HomeProps) {
        super(props);

        this.mapRef = React.createRef<MapView>();
        this.sheetRef = React.createRef<ActionSheet>();
        this.saveLeadSheetRef = React.createRef<ActionSheet>();
        this.filterPopover = React.createRef<TouchableOpacity>();
        this.datePopover = React.createRef<TouchableOpacity>();


        const leads: Lead[] = [];

        this.setStartLocation()

        this.state = {
            appState: AppState.currentState,
            leads: leads,
            isLoading: true,
            activeView: 0,
            filterDistance: 5,
            filterMonths: 9,
            savingLead: false,
            showRadiusFilter: false,
            showDateFilter: false,
            leadSortingType: 'distance',
            leadSortingDirection: 1,
            showLocationUpdated: false,
            useCustomLocation: false
        };
    }

    async setStartLocation() {

        let radiusStore;
        let radius = 5;

        try {
            radiusStore = await AsyncStorage.getItem('radius');

        } catch (e) {
            // Restoring token failed
        }

        if (radiusStore !== undefined && radiusStore != null) {
            radius = parseInt(radiusStore);
        }

        //let location = await Location.getLastKnownPositionAsync()

        //if (location != null)
        //    this.setState({ currentLocation: { latitude: location.coords.latitude, longitude: location.coords.longitude } });

        Geolocation.getCurrentPosition(
            (response) => {

                console.log(response)
                //success
                this.setState({ filterDistance: radius }, () => {

                    this.setState({ currentLocation: { latitude: response.coords.latitude, longitude: response.coords.longitude } },
                        () => this.getLeads());
                })
            },
            (error: any) => {
                //error
                console.log(error)
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });

        //location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });


    }

    componentDidMount() {

        this.appStateSubscription = AppState.addEventListener('change', this._handleAppStateChange);

        this.props.navigation.setOptions({
            headerShown: true,
            headerTitle: () => <LogoTitle activeView={this.state.activeView} updateView={this.changeView} />,
            headerTitleAlign: 'center',
            headerTintColor: '#fff',
            headerStyle: { backgroundColor: '#2185d0' },
            headerRight: () => <TouchableOpacity ref={this.filterPopover} onPressIn={() => this.setState({ showRadiusFilter: true })} style={{ marginRight: 10, backgroundColor: 'transparent' }} >
                <Icon name='map-marked-alt' color='white' size={22} type='font-awesome-5' style={{ color: 'white' }} />
            </TouchableOpacity>,
            headerLeft: () =>
                <TouchableOpacity ref={this.datePopover} onPressIn={() => this.setState({ showDateFilter: true })} style={{ marginLeft: 10, backgroundColor: 'transparent' }} >
                    <Icon name='calendar-week' color='white' size={22} type='font-awesome-5' style={{ color: 'white' }} />
                </TouchableOpacity>
        })

        this.props.navigation.addListener('focus', (e) => {

            this.getLeads();
        });
    }

    componentWillUnmount() {

        this.appStateSubscription.remove();
        //AppState.removeEventListener('change', this._handleAppStateChange);
        this.props.navigation.removeListener('focus', () => null);
    }

    _handleAppStateChange = (nextAppState: any) => {

        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {

            //this.getLeads();
        }

        this.setState({ appState: nextAppState });
    };

    async changeFilterDistance(radius: number) {

        this.setState({ filterDistance: radius }, () => {
            this.setState({ showRadiusFilter: false })

            if (this.state.useCustomLocation)
                this.getLeadsFromZip(this.state.zipCode!)
            else
                this.getLeads()
        })

        await AsyncStorage.setItem('radius', radius.toString());
    }

    async changeFilterMonth(months: number) {

        this.setState({ filterMonths: months, showDateFilter: false }, () => {

            if (this.state.useCustomLocation)
                this.getLeadsFromZip(this.state.zipCode!)
            else
                this.getLeads()
        })

        //await AsyncStorage.setItem('radius', radius.toString());
    }

    updateLeadSorting(sortingType: string) {

        this.setState({ showRadiusFilter: false, isLoading: true }, () => {

            let direction = this.state.leadSortingDirection;

            const leadsToSort = [...this.state.leads];

            if (this.state.leadSortingType == sortingType) {
                if (direction == 0)
                    direction = 1
                else
                    direction = 0
            }

            const leads = this.sortLeads(leadsToSort, sortingType, direction)

            this.setState({ leads: leads, leadSortingType: sortingType, leadSortingDirection: direction }, () => {
                this.setState({ isLoading: false })
            })
        })
    }

    sortLeads(leads: Lead[], sortingType: string, direction: number): Lead[] {

        if (sortingType == 'distance') {
            if (direction == 0)
                leads.sort((a, b) => b.distance - a.distance);
            else
                leads.sort((a, b) => a.distance - b.distance);
        }

        if (sortingType == 'birthday') {
            if (direction == 0)
                leads.sort((a, b) => new Date(b.dobdate).getTime() - new Date(a.dobdate).getTime());
            else
                leads.sort((a, b) => new Date(a.dobdate).getTime() - new Date(b.dobdate).getTime());
        }

        return leads;
    }

    changeView = (viewIndex: number) => {

        this.setState({ activeView: viewIndex }, () => { if (viewIndex == 0) this.animateViewToMarkers() });
    }

    async getLeads() {

        let location = this.state.currentLocation;

        if (location != null) {
            //GPS test inputs:
            //texas:                    Dallas:                 Austin
            //LAT: 31.8160381           LAT: 32.7762719         30.267153
            //LON: -99.5120986          LON: -96.7968559        -97.7430608

            //const location: Location = { latitude: 30.267153, longitude: -97.7430608 }
            //const location = this.state.currentLocation;

            this.setState({ isLoading: true, showLocationUpdated: false })

            try {
                const res = await fetch(GLOBALS.BASE_URL + '/api/client/getLeads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ location: { lat: location.latitude, lon: location.longitude }, radius: this.state.filterDistance, filterMonths: this.state.filterMonths })
                })

                this.setState({ isLoading: false })

                if (res.status === 200) {

                    const data: any = await res.json();

                    if (data) {

                        //console.log(data.leads[0])
                        const leads = this.sortLeads(data.leads, this.state.leadSortingType, this.state.leadSortingDirection)

                        this.setState({ leads: leads }, () => {

                            if (this.state.leads.length > 0)
                                this.animateViewToMarkers();
                        })
                    }
                    else {

                    }

                } else {

                }
            } catch (error) {
                console.error('An unexpected error happened occurred:', error)
            }
        }
    }

    async getLeadsFromZip(zipcode: string) {

        this.setState({ isLoading: true, showLocationUpdated: false, useCustomLocation: true, zipCode: zipcode })

        try {
            const res = await fetch(GLOBALS.BASE_URL + '/api/client/getLeads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    radius: this.state.filterDistance,
                    filterMonths: this.state.filterMonths,
                    useZip: true,
                    zipcode: zipcode
                })
            })

            this.setState({ isLoading: false })

            if (res.status === 200) {

                const data: any = await res.json();

                if (data) {

                    //console.log(data.leads[0])
                    const leads = this.sortLeads(data.leads, this.state.leadSortingType, this.state.leadSortingDirection)

                    this.setState({ leads: leads }, () => {

                        if (this.state.leads.length > 0)
                            this.animateViewToMarkers();
                        else
                            Alert.alert('No leads found!', 'We currently have no leads with zipcode ' + this.state.zipCode)
                    })
                }
                else {

                }

            } else {

            }
        } catch (error) {
            console.error('An unexpected error happened occurred:', error)
        }

    }

    animateViewToMarkers() {

        if (this != null && this.state.leads.length > 0) {



            //const markerIds: string[] = this.state.leads.map((lead: Lead) => {

            //         return lead.id!.toString();
            // })

            /*
            const coordinates: LatLng[] = this.state.leads.map((lead: Lead) => {

                return { latitude: lead.latitude, longitude: lead.longitude };
            })
            */

            if (this.state.activeView == 0)

                /*
                    this.mapRef.current.fitToCoordinates(coordinates, {
                        edgePadding: {
                            bottom: 50,
                            left: 50,
                            right: 50,
                            top: 50,
                        },
                    })
                    */

                //console.log(markerIds[0])
                //console.log(this.mapRef.current.getCamera())
                //this.mapRef.current.fitToSuppliedMarkers(markerIds);

                this.mapRef.current.fitToElements({
                    edgePadding: {
                        bottom: 50,
                        left: 50,
                        right: 50,
                        top: 50,
                    },
                });
        }
    }

    async saveleadinteraction(lead: Lead, index: number, newAction?: string) {

        let actionString = 'seen'

        if (newAction != null)
            actionString = newAction

        else if (lead.leadinteraction != null && lead.leadinteraction[0]?.action != null) {
            actionString = lead.leadinteraction[0].action;
        }

        if (lead.leadinteraction == null || lead.leadinteraction.length < 1 || lead.leadinteraction[0] == null)
            lead.leadinteraction = [{ id: 0, action: actionString, leadId: lead.id!, saved: false }]
        else {

            lead.leadinteraction[0].action = actionString;
        }

        try {
            const res = await fetch(GLOBALS.BASE_URL + '/api/client/saveLeadInteraction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead: lead })
            })
            if (res.status === 200) {

                const data: any = await res.json();

                if (data) {

                    let leads: Lead[] = [...this.state.leads];
                    let lead2 = leads.find(le => le.id == lead.id)
                    lead2 = lead;

                    this.setState({ isLoading: false, leads: leads })
                }
                else {

                }

            } else {


                console.log('something happened', res)
            }
        } catch (error) {
            console.error('An unexpected error happened occurred:', error)
        }

        return;
    }

    async showLeadData(lead: Lead, index: number) {

        this.setState({ activeLead: lead, activeIndex: index }, () => {

            this.saveleadinteraction(lead, index);
            this.sheetRef.current.setModalVisible()

        })

        if (this.state.activeView == 0) {
            const camera: Camera = await this.mapRef.current.getCamera();

            camera.center = {
                latitude: lead.latitude,
                longitude: lead.longitude,
            };

            this.mapRef.current.animateCamera(camera);
        }
    }

    closeLeadData() {

        if (!this.state.savingLead)
            this.setState({ activeIndex: undefined, activeLead: undefined })
    }

    openDetails() {

        this.setState({ savingLead: true }, () => {

            this.sheetRef.current?.setModalVisible(false);
            const self = this;

            setTimeout(function () {

                self.saveLeadSheetRef.current?.setModalVisible(true);

            }, 200);
        })
    }

    cancelSaveDetails() {

        this.saveLeadSheetRef.current?.setModalVisible(false);

        this.setState({ savingLead: false }, () => {

            const self = this;

            /*
            setTimeout(function () {
     
                //self.sheetRef.current?.setModalVisible(true);
     
            }, 200);
            */
        })
    }

    saveLead(text: string) {

        const lead = this.state.activeLead;

        if (lead!.leadinteraction!.length > 0) {
            lead!.leadinteraction![0].notes = text;
            lead!.leadinteraction![0].saved = true;
        }
        else
            lead!.leadinteraction = [{ id: 0, action: 'seen', leadId: lead!.id!, notes: text, saved: true }]

        this.saveleadinteraction(lead!, this.state.activeIndex!);

        this.saveLeadSheetRef.current?.setModalVisible(false);
        //this.cancelSaveDetails()
    }

    async removeSavedLead() {

        const lead = this.state.activeLead;
        const index = this.state.activeIndex;

        //lead!.leadinteraction![0].action = 'seen';
        lead!.leadinteraction![0].notes = '';
        lead!.leadinteraction![0].saved = false;

        this.sheetRef.current?.setModalVisible(false);
        await this.saveleadinteraction(lead!, this.state.activeIndex!, 'seen');

        let leads: Lead[] = [...this.state.leads];
        //leads = leads.filter(le => le.id != lead!.id)
        let updateLead = leads.find(le => le.id != lead!.id)

        updateLead = lead;

        this.setState({ leads: leads, isLoading: false, activeLead: undefined, activeIndex: undefined, activeLeadNotes: undefined });
    }

    monthsToAge65(date: Date): string {

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        return 'Turns 65 ' + monthNames[date.getMonth()] + ' ' + date.getFullYear();
    }

    getPinColorForLead(lead: Lead) {

        let color = 'green'

        if (this.state.activeLead?.id == lead.id) {
            color = 'blue';
        }
        else if (lead.leadinteraction != undefined && lead.leadinteraction.length > 0) {

            if (lead.leadinteraction[0].action == 'seen' && !lead.leadinteraction[0].saved)
                color = 'orange';
            else if (lead.leadinteraction[0].saved)
                color = 'purple';
            else if (lead.leadinteraction[0].action == 'call')
                color = 'red'
            else if (lead.leadinteraction[0].action == 'navigation')
                color = 'black'
        }

        return color;
    }

    leadIsSaved = () => {
        let saved = false;

        const lead = this.state.activeLead

        if (lead != null && lead.leadinteraction != null && lead.leadinteraction.length > 0 && lead.leadinteraction[0]?.action != null && lead.leadinteraction[0].saved)
            saved = true;

        return saved;
    }

    userLocationChanged(locationEvent: EventUserLocation) {

        if (this.state.currentLocation == null ||
            this.state.currentLocation.latitude != locationEvent.nativeEvent.coordinate.latitude &&
            this.state.currentLocation?.longitude != locationEvent.nativeEvent.coordinate.longitude
        ) {

            const location: Location = {
                latitude: locationEvent.nativeEvent.coordinate.latitude,
                longitude: locationEvent.nativeEvent.coordinate.longitude
            };

            this.setState({ currentLocation: location }, () => {

                this.setState({ showLocationUpdated: true })
            })
        }
    }

    async setCustomLocation(zipCode: string) {

        this.setState({ showRadiusFilter: false, useCustomLocation: true, zipCode: zipCode });
        this.getLeadsFromZip(zipCode);
    }

    render() {

        if (this.state.activeView == 0) {
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    {this.state.isLoading && (
                        <View style={{ top: 25, position: 'absolute', zIndex: 99999, backgroundColor: 'white', paddingLeft: 25, paddingRight: 25, paddingBottom: 10, paddingTop: 10, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 }}>
                            <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={[{ flexDirection: 'column' }]}>
                                    <ActivityIndicator color="black" style={{ marginRight: 10 }} />
                                </View>
                                <View style={[{ flexDirection: 'column' }]}>
                                    <Text>Loading data...</Text>
                                </View>
                            </View>
                        </View>
                    )}
                    {this.state.currentLocation != undefined && (
                        <View style={StyleSheet.absoluteFillObject}>
                            <Popover arrowStyle={{ backgroundColor: 'transparent' }} onRequestClose={() => this.setState({ showRadiusFilter: false })} from={this.filterPopover} isVisible={this.state.showRadiusFilter} popoverStyle={{ borderRadius: 10 }} backgroundStyle={{ backgroundColor: 'transparent' }} placement={PopoverPlacement.BOTTOM}>
                                <FilterDropDown
                                    updateSorting={(sortingType: string) => this.updateLeadSorting(sortingType)}
                                    sortingType={this.state.leadSortingType}
                                    sortingDirection={this.state.leadSortingDirection}
                                    radius={this.state.filterDistance}
                                    setCustomLocation={(zipCode: string) => this.setCustomLocation(zipCode)}
                                    updateView={(radius: number) => this.changeFilterDistance(radius)}
                                    useCustomLocation={this.state.useCustomLocation}
                                    zipCode={this.state.zipCode?.toString()}
                                    useMyLocation={() => this.setState({ useCustomLocation: false, showRadiusFilter: false }, () => this.getLeads())}
                                />

                            </Popover>

                            <Popover arrowStyle={{ backgroundColor: 'transparent' }} onRequestClose={() => this.setState({ showDateFilter: false })} from={this.datePopover} isVisible={this.state.showDateFilter} popoverStyle={{ borderRadius: 10 }} backgroundStyle={{ backgroundColor: 'transparent' }} placement={PopoverPlacement.BOTTOM}>
                                <DateDropDown

                                    updateMonth={(month) => this.changeFilterMonth(month)}
                                    months={this.state.filterMonths} />
                            </Popover>

                            <MapView loadingEnabled ref={this.mapRef} showsMyLocationButton={true} onUserLocationChange={(e) => this.userLocationChanged(e)} initialRegion={{ latitude: this.state.currentLocation.latitude, longitude: this.state.currentLocation.longitude, latitudeDelta: 0.5, longitudeDelta: 0.5 }} style={StyleSheet.absoluteFill} showsUserLocation={true}>
                                {this.state.leads.map((lead: Lead, index: any) => (
                                    <Marker
                                        draggable={false}
                                        key={index}
                                        pinColor={this.getPinColorForLead(lead)}
                                        onPress={() => this.showLeadData(lead, index)}
                                        coordinate={lead.marker!.coordinate}
                                    />
                                ))}
                            </MapView>
                        </View>
                    )}
                    <ActionSheet ref={this.sheetRef} bounceOnOpen={true} onClose={() => this.closeLeadData()}>
                        <LeadPopUp
                            activeIndex={this.state.activeIndex}
                            leadIsSaved={this.leadIsSaved}
                            monthsToAge65={this.monthsToAge65}
                            openDetails={() => this.openDetails()}
                            removeSavedLead={() => this.removeSavedLead()}
                            saveleadinteraction={this.saveleadinteraction}
                            activeLead={this.state.activeLead}
                        />
                    </ActionSheet>
                    <ActionSheet keyboardShouldPersistTaps='always' ref={this.saveLeadSheetRef} bounceOnOpen={true} onClose={() => this.setState({ savingLead: false, activeLead: undefined })}>
                        <LeadPopUpSave
                            cancelSaveDetails={() => this.cancelSaveDetails()}
                            saveLead={(text:string) => this.saveLead(text)}
                            activeLead={this.state.activeLead}
                        />
                    </ActionSheet>
                </View>);
        }
        else {
            return (
                <>
                    <Popover arrowShift={0} onRequestClose={() => this.setState({ showRadiusFilter: false })} from={this.filterPopover} isVisible={this.state.showRadiusFilter} popoverStyle={{ borderRadius: 10 }} backgroundStyle={{ backgroundColor: 'transparent' }} placement={PopoverPlacement.BOTTOM}>
                        <FilterDropDown
                            updateSorting={(sortingType: string) => this.updateLeadSorting(sortingType)}
                            sortingType={this.state.leadSortingType}
                            sortingDirection={this.state.leadSortingDirection}
                            radius={this.state.filterDistance}
                            useCustomLocation={this.state.useCustomLocation}
                            zipCode={this.state.zipCode?.toString()}
                            updateView={(radius: number) => this.changeFilterDistance(radius)}
                            setCustomLocation={(zipCode: string) => this.setCustomLocation(zipCode)}
                            useMyLocation={() => this.setState({ useCustomLocation: false, showRadiusFilter: false }, () => this.getLeads())}

                        />

                    </Popover>

                    <Popover arrowShift={0} onRequestClose={() => this.setState({ showDateFilter: false })} from={this.datePopover} isVisible={this.state.showDateFilter} popoverStyle={{ borderRadius: 10 }} backgroundStyle={{ backgroundColor: 'transparent' }} placement={PopoverPlacement.BOTTOM}>
                        <DateDropDown
                            months={this.state.filterMonths}
                            updateMonth={(month) => this.changeFilterMonth(month)}
                        />
                    </Popover>

                    {this.state.isLoading && (
                        <View style={{ top: 25, alignSelf: 'center', position: 'absolute', zIndex: 99999, backgroundColor: 'white', paddingLeft: 25, paddingRight: 25, paddingBottom: 10, paddingTop: 10, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 }}>
                            <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={[{ flexDirection: 'column' }]}>
                                    <ActivityIndicator color="black" style={{ marginRight: 10 }} />
                                </View>
                                <View style={[{ flexDirection: 'column' }]}>
                                    <Text>Loading data...</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    <FlatList keyboardShouldPersistTaps='always'
                        data={this.state.leads.map(x => ({ lead: x }))}
                        keyExtractor={item => item.lead.id!.toString()}
                        renderItem={({ item, index }: { item: { lead: Lead }, index: number }) => {
                            return (
                                <ListItem key={index} bottomDivider onPress={() => this.showLeadData(item.lead, index)} >
                                    <ListItem.Content>
                                        <ListItem.Title style={{ fontWeight: '600', color: this.getPinColorForLead(item.lead) }}>
                                            {item.lead.firstname} {item.lead.lastname}
                                        </ListItem.Title>
                                        <ListItem.Subtitle style={{ color: 'grey' }}>{item.lead.address}, {item.lead.city}</ListItem.Subtitle>
                                    </ListItem.Content>
                                    <ListItem.Subtitle style={{ textAlign: 'center' }}>
                                        <Text>
                                            {this.monthsToAge65(new Date(item.lead.dobdate || '')) + "\n"}
                                        </Text>
                                        <Text style={{ color: 'grey' }}>
                                            {Math.round(item.lead.distance * 10) / 10 + ' mi. away'}
                                        </Text>
                                    </ListItem.Subtitle>
                                </ListItem>
                            );
                        }}
                    />
                    <ActionSheet ref={this.sheetRef} bounceOnOpen={true} onClose={() => this.closeLeadData()}>
                        <LeadPopUp
                            activeIndex={this.state.activeIndex}
                            leadIsSaved={this.leadIsSaved}
                            monthsToAge65={this.monthsToAge65}
                            openDetails={() => this.openDetails()}
                            removeSavedLead={() => this.removeSavedLead()}
                            saveleadinteraction={this.saveleadinteraction}
                            activeLead={this.state.activeLead}
                        />
                    </ActionSheet>
                    <ActionSheet keyboardShouldPersistTaps='always' ref={this.saveLeadSheetRef} bounceOnOpen={true} onClose={() => this.setState({ savingLead: false, activeLead: undefined })}>
                        <LeadPopUpSave
                            cancelSaveDetails={() => this.cancelSaveDetails()}
                            saveLead={(text:string) => this.saveLead(text)}
                            activeLead={this.state.activeLead}
                        />
                    </ActionSheet>
                </>
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