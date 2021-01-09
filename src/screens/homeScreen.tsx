import React from 'react';
import { StyleSheet, View, ScrollView, Text, Linking, TouchableOpacity, KeyboardAvoidingView, ActivityIndicator, AppState } from 'react-native';
import { Button, ButtonGroup, ListItem, Icon, Input, Divider } from 'react-native-elements';
import GLOBALS from '../globals';
import { StackNavigationProp, createStackNavigator } from '@react-navigation/stack';
import MapView, { Marker } from 'react-native-maps';
import ActionSheet from "react-native-actions-sheet";
import openMap from 'react-native-open-maps';
import type { KmlMarker, Camera } from 'react-native-maps';
import Popover, { PopoverPlacement } from 'react-native-popover-view';
import * as Location from 'expo-location'
import * as Permissions from 'expo-permissions'
import AsyncStorage from '@react-native-community/async-storage';

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
    LeadInteraction?: LeadInteraction[],
    distance: number,
    dobDate: Date
}

type LeadInteraction = {
    date?: any
    id: number
    leadId: number
    userId?: number
    action?: string
    notes?: string
}

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

type FilterDropDownProps = { radius: number, months: number, sortingType: string, sortingDirection: number, updateView: any, updateSorting: (sortingType: string) => void }
type FilterDropDownState = { radius: number, months: number }
class FilterDropDown extends React.Component<FilterDropDownProps, FilterDropDownState> {

    constructor(props: FilterDropDownProps) {
        super(props)

        this.state = { radius: this.props.radius, months: props.months, };
        this.updateView = this.updateView.bind(this)
        //this.updateSorting = this.updateSorting.bind(this)
    }

    updateView(radius: number) {


        this.setState({ radius: radius }, () => this.props.updateView(radius, this.state.months))
    }

    updateMonth(months: number) {
        this.setState({ months: months }, () => this.updateView(this.state.radius))
    }

    render() {

        return (
            <ScrollView style={{ maxHeight: 500 }}>
                <ListItem key={0} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateView(1)}>
                    <ListItem.Title>1 mile radius</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.radius == 1} />
                </ListItem>
                <ListItem key={1} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateView(3)}>
                    <ListItem.Title>3 miles radius</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.radius == 3} />
                </ListItem>
                <ListItem key={2} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateView(5)}>
                    <ListItem.Title>5 miles radius</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.radius == 5} />
                </ListItem>
                <ListItem key={3} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateView(10)}>
                    <ListItem.Title>10 miles radius</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.radius == 10} />
                </ListItem>
                <ListItem key={4} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateView(25)}>
                    <ListItem.Title>25 miles radius</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.radius == 25} />
                </ListItem>
                <ListItem key={5} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateView(50)}>
                    <ListItem.Title>50 miles radius</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon='check' uncheckedColor='white' checked={this.state.radius == 50} />
                </ListItem>
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

                <ListItem containerStyle={{ backgroundColor: '#eee' }} style={{ height: 5, backgroundColor: 'transparent' }}></ListItem>

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
    activeLeadNotes?: string,
    filterDistance: number
    activeView: number
    currentLocation?: Location,
    showRadiusFilter: boolean,
    filterMonths: number,
    leadSortingType: string,
    leadSortingDirection: number,
    showLocationUpdated: boolean
}

export class HomeScreen extends React.Component<HomeProps, HomeState> {

    sheetRef: any;
    mapRef: any;
    filterPopover: any;
    saveLeadSheetRef: any;

    constructor(props: HomeProps) {
        super(props);

        this.mapRef = React.createRef<MapView>();
        this.sheetRef = React.createRef<ActionSheet>();
        this.saveLeadSheetRef = React.createRef<ActionSheet>();
        this.filterPopover = React.createRef<Popover>();

        const leads: Lead[] = [];

        this.setStartLocation()

        this.state = { appState: AppState.currentState, leads: leads, isLoading: true, activeView: 0, filterDistance: 5, filterMonths: 3, savingLead: false, showRadiusFilter: false, leadSortingType: 'distance', leadSortingDirection: 1, showLocationUpdated: false };
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

        let location = await Location.getLastKnownPositionAsync()

        if (location != null)
            this.setState({ currentLocation: { latitude: location.coords.latitude, longitude: location.coords.longitude } });

        location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

        this.setState({ filterDistance: radius }, () => {
            if (location != null)
                this.setState({ currentLocation: { latitude: location.coords.latitude, longitude: location.coords.longitude } },
                    () => this.getLeads());
        })
    }

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);

        this.props.navigation.setOptions({
            headerShown: true,
            headerTitle: () => <LogoTitle activeView={this.state.activeView} updateView={this.changeView} />,
            headerTintColor: '#fff',
            headerStyle: { backgroundColor: '#2185d0' },
            headerRight: () => <Button ref={this.filterPopover} onPress={() => this.setState({ showRadiusFilter: true })} icon={<Icon name='map-marked-alt' color='white' size={18} type='font-awesome-5' style={{ color: 'white' }} />} buttonStyle={{ marginRight: 5, backgroundColor: 'transparent' }} />
        })
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState: any) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            console.log('App has come to the foreground!');
        }

        this.setState({ appState: nextAppState });
    };

    async changeFilterDistance(radius: number, months: number) {

        this.setState({ filterDistance: radius, filterMonths: months }, () => {
            this.setState({ showRadiusFilter: false })
            this.getLeads()
        })

        await AsyncStorage.setItem('radius', radius.toString());
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
                leads.sort((a, b) => b.dobmon - a.dobmon);
            else
                leads.sort((a, b) => a.dobmon - b.dobmon);
        }

        return leads;
    }

    changeView = (viewIndex: number) => {

        this.setState({ activeView: viewIndex }, () => { if (viewIndex == 0) this.animateViewToMarkers() });
    }

    async startNavigation(address: string, lead: Lead, index: number) {

        this.saveLeadInteraction(lead, index, 'navigation');

        openMap({ travelType: 'drive', end: address, provider: 'apple' });
    }

    async startCall() {

        this.setState({ isLoading: true })

        this.saveLeadInteraction(this.state.activeLead!, this.state.activeIndex!, 'call');

        Linking.openURL(`tel:${this.state.activeLead?.phone}`)
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

    animateViewToMarkers() {

        if (this != null && this.state.leads.length > 0) {


            const markerIds: string[] = this.state.leads.map((lead: Lead) => {

                if (lead.id != null)
                    return lead.id.toString();
                else
                    return ''
            })

            if (this.state.activeView == 0)
                this.mapRef.current.fitToSuppliedMarkers(markerIds);
        }
    }

    async saveLeadInteraction(lead: Lead, index: number, action?: string) {

        let actionString = 'seen';

        if (action != null && action != '')
            actionString = action;

        if (lead.LeadInteraction == null || lead.LeadInteraction.length < 1)
            lead.LeadInteraction = [{ id: 0, action: actionString, leadId: lead.id! }]
        else {
            if (lead.LeadInteraction[0].action == 'seen')
                lead.LeadInteraction[0].action = actionString;
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
                    let lead2: Lead = { ...leads[index] };

                    lead2.LeadInteraction![0] = data.leadInteraction
                    leads[index] = lead2;

                    this.setState({ isLoading: false, leads: leads })
                }
                else {

                }

            } else {

            }
        } catch (error) {
            console.error('An unexpected error happened occurred:', error)
        }

        return;
    }

    async showLeadData(lead: Lead, index: number) {

        this.setState({ activeLead: lead, activeIndex: index }, () => {

            this.saveLeadInteraction(lead, index);
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

        this.setState({ savingLead: false, activeLeadNotes: '' }, () => {

            const self = this;

            setTimeout(function () {

                self.sheetRef.current?.setModalVisible(true);

            }, 200);
        })
    }

    saveLead() {

        const lead = this.state.activeLead;

        if (lead!.LeadInteraction!.length > 0) {
            lead!.LeadInteraction![0].notes = this.state.activeLeadNotes;
            lead!.LeadInteraction![0].action = 'saved';
        }
        else
            lead!.LeadInteraction = [{ id: 0, action: 'saved', leadId: lead!.id!, notes: this.state.activeLeadNotes }]

        this.saveLeadInteraction(lead!, this.state.activeIndex!);

        this.saveLeadSheetRef.current?.setModalVisible(false);
        this.setState({ savingLead: false, activeLeadNotes: '' });
    }

    removeSavedLead() {

        const lead = this.state.activeLead;

        lead!.LeadInteraction![0].notes = '';
        lead!.LeadInteraction![0].action = '';

        this.saveLeadInteraction(lead!, this.state.activeIndex!);

    }

    monthsToAge65(date: Date) {

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        return 'Turns 65 ' + monthNames[date.getMonth()] + ' ' + date.getFullYear();
    }

    getPinColorForLead(lead: Lead) {

        let color = 'green'

        if (this.state.activeLead?.id == lead.id) {
            color = 'blue';
        }
        else if (lead.LeadInteraction != undefined && lead.LeadInteraction.length > 0) {

            if (lead.LeadInteraction![0].action == 'seen')
                color = 'orange';
            else if (lead.LeadInteraction![0].action == 'saved')
                color = 'purple';
            else if (lead.LeadInteraction![0].action == 'call')
                color = 'red'
            else if (lead.LeadInteraction![0].action == 'navigation')
                color = 'black'
        }

        return color;
    }

    leadIsSaved = () => {
        let saved = false;

        const lead = this.state.activeLead

        if (lead != null && lead.LeadInteraction!.length > 0 && lead.LeadInteraction![0].action == 'saved')
            saved = true;

        return saved;
    }

    userLocationChanged(e: any) {

        if (this.state.currentLocation == null ||
            this.state.currentLocation.latitude != e.nativeEvent.coordinate.latitude &&
            this.state.currentLocation?.longitude != e.nativeEvent.coordinate.longitudeDelta
        ) {

            const location: Location = e.nativeEvent.coordinate;

            this.setState({ currentLocation: location }, () => {

                this.setState({ showLocationUpdated: true })
            })
        }
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
                    {this.state.showLocationUpdated && (
                        <View style={{ top: 25, position: 'absolute', zIndex: 99999, backgroundColor: 'white', paddingLeft: 20, paddingRight: 20, paddingBottom: 10, paddingTop: 10, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 }}>
                            <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                                <TouchableOpacity onPress={() => this.getLeads()}>
                                    <View style={[{ flexDirection: 'column' }]}>
                                        <Text style={{ color: '#2185d0', fontWeight: '600' }}>Update Data Now</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    {this.state.currentLocation != undefined && (
                        <>
                            <Popover arrowShift={0} onRequestClose={() => this.setState({ showRadiusFilter: false })} from={this.filterPopover} isVisible={this.state.showRadiusFilter} popoverStyle={{ borderRadius: 10 }} backgroundStyle={{ backgroundColor: 'transparent' }} placement={PopoverPlacement.BOTTOM}>
                                <FilterDropDown
                                    updateSorting={(sortingType: string) => this.updateLeadSorting(sortingType)}
                                    sortingType={this.state.leadSortingType}
                                    sortingDirection={this.state.leadSortingDirection}
                                    radius={this.state.filterDistance}
                                    months={this.state.filterMonths}
                                    updateView={(radius: number, months: number) => this.changeFilterDistance(radius, months)} />
                            </Popover>

                            <MapView ref={this.mapRef} showsMyLocationButton={true} onUserLocationChange={(e) => this.userLocationChanged(e)} initialRegion={{ latitude: this.state.currentLocation.latitude, longitude: this.state.currentLocation.longitude, latitudeDelta: 0.5, longitudeDelta: 0.5 }} style={{ flex: 1, height: 400, width: '100%' }} showsUserLocation={true}>
                                {this.state.leads.map((lead: Lead, index: any) => (
                                    <Marker identifier={lead.id?.toString()} key={index}
                                        pinColor={this.getPinColorForLead(lead)}
                                        onPress={() => this.showLeadData(lead, index)} coordinate={lead.marker!.coordinate} />
                                ))}
                            </MapView>
                        </>
                    )}
                    <ActionSheet ref={this.sheetRef} bounceOnOpen={true} onClose={() => this.closeLeadData()}>
                        <View style={{
                            borderTopStartRadius: 0, borderTopRightRadius: 0, padding: 20, backgroundColor: 'white',
                            shadowColor: 'black', shadowOpacity: 0.15, shadowRadius: 5, shadowOffset: { width: 5, height: 50 }
                        }}>
                            <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={[{ flex: 4, flexDirection: 'column' }]}>
                                    <Text style={styles.titleText}>{this.state.activeLead?.firstname} {this.state.activeLead?.lastName}</Text>
                                    <Text style={{ fontSize: 16, color: 'gray', marginTop: 1 }}>{(Math.round((this.state.activeLead?.distance || 0) * 10) / 10)} miles away</Text>
                                    <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 10 }}>Address</Text>
                                    <Text style={{ fontSize: 16, color: 'gray', marginTop: 5 }}>{this.state.activeLead?.address}</Text>
                                    <Text style={{ fontSize: 16, color: 'gray' }}>{this.state.activeLead?.city}</Text>
                                    <Text style={{ fontSize: 16, color: 'gray' }}>{this.state.activeLead?.zipCode} {this.state.activeLead?.county}</Text>
                                </View>
                                <View style={[{ flex: 1, flexDirection: 'column', borderWidth: 1, borderColor: '#2185d0', borderRadius: 10, padding: 10 }]}>
                                    <Text style={{ textAlign: 'center', color: '#2185d0', fontSize: 13 }}>{this.monthsToAge65(new Date(this.state.activeLead?.dobDate || ''))}</Text>
                                </View>
                            </View>

                            {(this.state.activeLead?.LeadInteraction != null && this.state.activeLead?.LeadInteraction.length > 0 && this.state.activeLead.LeadInteraction[0].notes != null) && (
                                <View>
                                    <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 10 }}>Notes</Text>
                                    <Text style={{ fontSize: 16, color: 'grey', marginTop: 5 }}>{this.state.activeLead.LeadInteraction[0].notes}</Text>
                                </View>
                            )}

                            <View style={[{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 20 }]}>
                                <TouchableOpacity style={[{ flex: 1, flexDirection: 'column', alignItems: 'center', backgroundColor: '#2185d0', borderRadius: 10, padding: 15, marginRight: 5 }]} onPress={() => this.startNavigation(this.state.activeLead!.address + ' ' +
                                    this.state.activeLead!.city + ' ' +
                                    this.state.activeLead!.county + ' ' +
                                    this.state.activeLead!.state, this.state.activeLead!, this.state.activeIndex!
                                )}>
                                    <Icon name="car" type='font-awesome' color='white' />
                                    <Text style={{ color: 'white', marginTop: 5, fontSize: 10 }}>Navigation</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[{ flex: 1, flexDirection: 'column', alignItems: 'center', backgroundColor: '#2185d0', borderRadius: 10, padding: 15, marginLeft: 5, marginRight: 5 }]} onPress={() => this.startCall()}>
                                    <Icon name="phone" type='font-awesome' color='white' />
                                    <Text style={{ color: 'white', marginTop: 5, fontSize: 12 }}>Call</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[{ flex: 1, flexDirection: 'column', alignItems: 'center', backgroundColor: this.leadIsSaved() ? ('grey') : ('#2185d0'), borderRadius: 10, padding: 15, marginLeft: 5 }]}
                                    onPress={this.leadIsSaved() ? () => this.removeSavedLead() : () => this.openDetails()
                                    }>
                                    <Icon name={this.leadIsSaved() ? ('check') : ('plus')} type='font-awesome' color='white' />
                                    <Text style={{ color: 'white', marginTop: 5, fontSize: 12 }}>Save{this.leadIsSaved() && (<>d</>)}</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={{ color: 'grey', fontSize: 15, textAlign: 'center', marginBottom: 10 }}>Built by <Text onPress={() => Linking.openURL('http://www.empowerbrokerage.com')} style={{ color: '#2185d0', fontSize: 15, padding: 0, margin: 0 }}>T65 Locator</Text></Text>
                        </View>

                    </ActionSheet>
                    <ActionSheet keyboardShouldPersistTaps='always' ref={this.saveLeadSheetRef} bounceOnOpen={true} onClose={() => this.setState({ savingLead: false, activeLead: undefined })}>
                        <View style={{ borderTopStartRadius: 0, borderTopRightRadius: 0, backgroundColor: 'white', shadowColor: 'black', shadowOpacity: 0.15, shadowRadius: 5, shadowOffset: { width: 5, height: 50 } }}>

                            <View style={[{ flexDirection: 'row', padding: 20, }]}>
                                <View style={{ flexDirection: 'column' }}>
                                    <Icon name="user" type='font-awesome' color='white' backgroundColor='#2185d0' style={{ padding: 10, borderRadius: 10 }} />
                                </View>
                                <View style={{ flexDirection: 'column', marginLeft: 10 }}>
                                    <Text style={styles.titleText}>{this.state.activeLead?.firstname} {this.state.activeLead?.lastName}</Text>
                                    <Text style={{ fontSize: 16, color: 'gray', marginTop: 5 }}>{this.state.activeLead?.address}</Text>

                                    <Text style={{ fontSize: 16, color: 'gray' }}>{this.state.activeLead?.zipCode} {this.state.activeLead?.county}</Text>
                                </View>
                            </View>

                            <Divider />

                            <View style={{ padding: 10 }}>
                                <Text style={{ fontSize: 18, fontWeight: '600', margin: 10 }}>Add notes to remind yourself of this lead</Text>
                                <Input value={this.state.activeLeadNotes} onChange={(e) => this.setState({ activeLeadNotes: e.nativeEvent.text })}
                                    style={{ borderWidth: 0 }}
                                    inputContainerStyle={{ borderBottomWidth: 0 }}
                                    inputStyle={{ margin: 0, padding: 0, height: 200, borderWidth: 0 }}
                                    numberOfLines={10} multiline={true} placeholder='Add your notes here'></Input>
                            </View>

                            <KeyboardAvoidingView behavior='position' keyboardVerticalOffset={120} style={[{}]}>
                                <Divider />
                                <View style={{ flexDirection: 'row', paddingBottom: 30, paddingLeft: 20, paddingRight: 20, paddingTop: 10 }}>
                                    <TouchableOpacity style={[{ flex: 1, flexDirection: 'column' }]} onPress={() => this.cancelSaveDetails()}>
                                        <Text style={{ color: 'grey', marginTop: 5, fontSize: 16 }}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[{ flex: 1, flexDirection: 'column', alignItems: 'flex-end' }]} onPress={() => this.saveLead()}>
                                        <Text style={{ color: '#2185d0', marginTop: 5, fontSize: 16 }}>Save</Text>
                                    </TouchableOpacity>


                                </View>
                            </KeyboardAvoidingView>
                        </View>
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
                            radius={this.state.filterDistance} months={this.state.filterMonths} updateView={(radius: number, months: number) => this.changeFilterDistance(radius, months)} />
                    </Popover>
                    <ScrollView>
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
                        {
                            this.state.leads.length > 0 && (
                                this.state.leads.map((lead: Lead, i) => (
                                    <ListItem key={i} bottomDivider onPress={() => this.showLeadData(lead, i)} >
                                        <ListItem.Content>
                                            <ListItem.Title style={{
                                                fontWeight: '600', color: this.getPinColorForLead(lead)
                                            }}>{lead.firstname} {lead.lastName}</ListItem.Title>
                                            <ListItem.Subtitle style={{ color: 'grey' }}>{lead.address}, {lead.city}</ListItem.Subtitle>
                                        </ListItem.Content>
                                        <ListItem.Subtitle style={{ textAlign: 'center' }}>
                                            <Text>{this.monthsToAge65(new Date(lead.dobDate || '')) + "\n"}
                                            </Text>

                                            <Text style={{ color: 'grey' }}>

                                                {Math.round(lead.distance * 10) / 10 + ' mi. away'}
                                            </Text>
                                        </ListItem.Subtitle>

                                    </ListItem>
                                ))
                            )}
                        <ActionSheet ref={this.sheetRef} bounceOnOpen={true} onClose={() => this.setState({ savingLead: false })}>
                            <View style={{
                                borderTopStartRadius: 0, borderTopRightRadius: 0, padding: 20, backgroundColor: 'white',
                                shadowColor: 'black', shadowOpacity: 0.15, shadowRadius: 5, shadowOffset: { width: 5, height: 50 }
                            }}>
                                <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                                    <View style={[{ flex: 4, flexDirection: 'column' }]}>
                                        <Text style={styles.titleText}>{this.state.activeLead?.firstname} {this.state.activeLead?.lastName}</Text>
                                        <Text style={{ fontSize: 16, color: 'gray', marginTop: 1 }}>{(Math.round((this.state.activeLead?.distance || 0) * 10) / 10)} miles away</Text>
                                        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 10 }}>Address</Text>
                                        <Text style={{ fontSize: 16, color: 'gray', marginTop: 5 }}>{this.state.activeLead?.address}</Text>
                                        <Text style={{ fontSize: 16, color: 'gray' }}>{this.state.activeLead?.city}</Text>
                                        <Text style={{ fontSize: 16, color: 'gray' }}>{this.state.activeLead?.zipCode} {this.state.activeLead?.county}</Text>
                                    </View>
                                    <View style={[{ flex: 1, flexDirection: 'column', borderWidth: 1, borderColor: '#2185d0', borderRadius: 10, padding: 10 }]}>
                                        <Text style={{ textAlign: 'center', color: '#2185d0', fontSize: 13 }}>{this.monthsToAge65(new Date(this.state.activeLead?.dobDate || ''))}</Text>
                                    </View>
                                </View>

                                {(this.state.activeLead?.LeadInteraction != null && this.state.activeLead?.LeadInteraction.length > 0 && this.state.activeLead.LeadInteraction[0].notes != null) && (

                                    <View>
                                        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 10 }}>Notes</Text>
                                        <Text style={{ fontSize: 16, color: 'grey', marginTop: 5 }}>{this.state.activeLead?.LeadInteraction![0].notes}</Text>
                                    </View>
                                )}

                                <View style={[{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 20 }]}>
                                    <TouchableOpacity style={[{ flex: 1, flexDirection: 'column', alignItems: 'center', backgroundColor: '#2185d0', borderRadius: 10, padding: 15, marginRight: 5 }]} onPress={() => this.startNavigation(this.state.activeLead!.address + ' ' +
                                        this.state.activeLead!.city + ' ' +
                                        this.state.activeLead!.county + ' ' +
                                        this.state.activeLead!.state, this.state.activeLead!, this.state.activeIndex!
                                    )}>
                                        <Icon name="car" type='font-awesome' color='white' />
                                        <Text style={{ color: 'white', marginTop: 5, fontSize: 10 }}>Navigation</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[{ flex: 1, flexDirection: 'column', alignItems: 'center', backgroundColor: '#2185d0', borderRadius: 10, padding: 15, marginLeft: 5, marginRight: 5 }]} onPress={() => Linking.openURL(`tel:${this.state.activeLead?.phone}`)}>
                                        <Icon name="phone" type='font-awesome' color='white' />
                                        <Text style={{ color: 'white', marginTop: 5, fontSize: 12 }}>Call</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[{ flex: 1, flexDirection: 'column', alignItems: 'center', backgroundColor: this.leadIsSaved() ? ('grey') : ('#2185d0'), borderRadius: 10, padding: 15, marginLeft: 5, marginRight: 5 }]}
                                        onPress={
                                            this.leadIsSaved() ?
                                                () => this.removeSavedLead()
                                                :
                                                () => this.openDetails()
                                        }>
                                        <Icon name={this.leadIsSaved() ? ('check') : ('plus')} type='font-awesome' color='white' />
                                        <Text style={{ color: 'white', marginTop: 5, fontSize: 12 }}>Save{this.leadIsSaved() && (<>d</>)}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={{ color: 'grey', fontSize: 15, textAlign: 'center', marginBottom: 10 }}>Built by <Text onPress={() => Linking.openURL('http://www.empowerbrokerage.com')} style={{ color: '#2185d0', fontSize: 15, padding: 0, margin: 0 }}>T65 Locator</Text></Text>

                            </View>
                        </ActionSheet>
                        <ActionSheet keyboardShouldPersistTaps='always' ref={this.saveLeadSheetRef} bounceOnOpen={true} onClose={() => this.setState({ savingLead: false })}>
                            <View style={{ borderTopStartRadius: 0, borderTopRightRadius: 0, backgroundColor: 'white', shadowColor: 'black', shadowOpacity: 0.15, shadowRadius: 5, shadowOffset: { width: 5, height: 50 } }}>

                                <View style={[{ flexDirection: 'row', padding: 20, }]}>
                                    <View style={{ flexDirection: 'column' }}>
                                        <Icon name="user" type='font-awesome' color='white' backgroundColor='#2185d0' style={{ padding: 10, borderRadius: 10 }} />
                                    </View>
                                    <View style={{ flexDirection: 'column', marginLeft: 10 }}>
                                        <Text style={styles.titleText}>{this.state.activeLead?.firstname} {this.state.activeLead?.lastName}</Text>
                                        <Text style={{ fontSize: 16, color: 'gray' }}>{this.state.activeLead?.address}</Text>

                                        <Text style={{ fontSize: 16, color: 'gray' }}>{this.state.activeLead?.zipCode} {this.state.activeLead?.county}</Text>
                                    </View>
                                </View>

                                <Divider />

                                <View style={{ padding: 10 }}>
                                    <Text style={{ fontSize: 18, fontWeight: '600', margin: 10 }}>Add notes to remind yourself of this lead</Text>
                                    <Input value={this.state.activeLeadNotes} onChange={(e) => this.setState({ activeLeadNotes: e.nativeEvent.text })}
                                        style={{ borderWidth: 0 }}
                                        inputContainerStyle={{ borderBottomWidth: 0 }}
                                        inputStyle={{ margin: 0, padding: 0, height: 200, borderWidth: 0 }}
                                        numberOfLines={10} multiline={true} placeholder='Add your notes here'></Input>
                                </View>

                                <KeyboardAvoidingView behavior='position' keyboardVerticalOffset={120} style={[{}]}>
                                    <Divider />
                                    <View style={{ flexDirection: 'row', paddingBottom: 30, paddingLeft: 20, paddingRight: 20, paddingTop: 10 }}>
                                        <TouchableOpacity style={[{ flex: 1, flexDirection: 'column' }]} onPress={() => this.cancelSaveDetails()}>
                                            <Text style={{ color: 'grey', marginTop: 5, fontSize: 16 }}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[{ flex: 1, flexDirection: 'column', alignItems: 'flex-end' }]} onPress={() => this.saveLead()}>
                                            <Text style={{ color: '#2185d0', marginTop: 5, fontSize: 16 }}>Save</Text>
                                        </TouchableOpacity>


                                    </View>
                                </KeyboardAvoidingView>
                            </View>

                        </ActionSheet>
                    </ScrollView>
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