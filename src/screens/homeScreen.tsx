import React from 'react';
import { StyleSheet, View, ScrollView, Text, Linking, TouchableOpacity, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { Button, ButtonGroup, ListItem, Icon, Input, Divider } from 'react-native-elements';
import GLOBALS from '../globals';
import { StackNavigationProp, createStackNavigator } from '@react-navigation/stack';
import MapView, { Marker } from 'react-native-maps';
import ActionSheet from "react-native-actions-sheet";
import openMap from 'react-native-open-maps';
import type { KmlMarker, Camera } from 'react-native-maps';
import Popover, { PopoverPlacement } from 'react-native-popover-view';
import * as Location from 'expo-location';

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
    distance: number
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
    latitude: Number,
    longitude: number
    speed?: number,
    timestamp?: string,
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

type FilterDropDownProps = { radius: number, updateView: any }
type FilterDropDownState = { radius: number }
class FilterDropDown extends React.Component<FilterDropDownProps, FilterDropDownState> {

    constructor(props: FilterDropDownProps) {
        super(props)

        this.state = { radius: this.props.radius };
        this.updateView = this.updateView.bind(this)
    }

    updateView(radius: number) {

        this.setState({ radius: radius }, () => this.props.updateView(radius))
    }

    render() {

        return (
            <>
                <ListItem key={0} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateView(10)}>
                    <ListItem.Title>10 miles radius</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon={null} checked={this.state.radius == 10} />
                </ListItem>
                <ListItem key={1} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateView(25)}>
                    <ListItem.Title>25 miles radius</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon={null} checked={this.state.radius == 25} />
                </ListItem>
                <ListItem key={2} bottomDivider containerStyle={{ padding: 12 }} onPress={() => this.updateView(50)}>
                    <ListItem.Title>50 miles radius</ListItem.Title>
                    <ListItem.CheckBox size={18} checkedIcon='check' uncheckedIcon={null} checked={this.state.radius == 50} />
                </ListItem>
            </>
        );
    }
}

const HomeStack = createStackNavigator();
type HomeProps = {
    navigation: StackNavigationProp<{}>;
};

type HomeState = {
    leads: Lead[],
    isLoading: boolean,
    activeLead?: Lead,
    activeIndex?: number,
    savingLead: boolean,
    activeLeadNotes?: string,
    filterDistance: number
    activeView: number
    currentLocation?: Location,
    showRadiusFilter: boolean
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

        this.state = { leads: leads, isLoading: true, activeView: 0, filterDistance: 10, savingLead: false, showRadiusFilter: false };
    }

    componentDidMount() {

        this.props.navigation.setOptions({
            headerShown: true,
            headerTitle: () => <LogoTitle activeView={this.state.activeView} updateView={this.changeView} />,
            headerTintColor: '#fff',
            headerStyle: { backgroundColor: '#2185d0' },
            headerRight: () => <Button ref={this.filterPopover} onPress={() => this.setState({ showRadiusFilter: true })} icon={<Icon name='map-marked-alt' color='white' size={18} type='font-awesome-5' style={{ color: 'white' }} />} buttonStyle={{ marginRight: 5, backgroundColor: 'transparent' }} />
        })
    }

    changeFilterDistance(radius: number) {

        this.setState({ filterDistance: radius }, () => {
            this.setState({ showRadiusFilter: false })
            this.getLeads()
        })
    }

    changeView = (viewIndex: number) => {


        this.setState({ activeView: viewIndex }, () => { if (viewIndex == 0) this.animateViewToMarkers() });
    }

    async startNavigation(address: string, lead: Lead, index: number) {

        this.saveLeadInteraction(lead, index, 'navigation');

        openMap({ travelType: 'drive', start: 'Houston, USA', end: address, provider: 'apple' });
    }

    async startCall() {

        this.saveLeadInteraction(this.state.activeLead!, this.state.activeIndex!, 'call');

        Linking.openURL(`tel:${this.state.activeLead?.phone}`)
    }

    async getLeads() {

        if (this.state.currentLocation != null) {
            //GPS test inputs:
            //texas:                    Dallas:                 Austin
            //LAT: 31.8160381           LAT: 32.7762719         30.267153
            //LON: -99.5120986          LON: -96.7968559        -97.7430608

            const location: Location = { latitude: 30.267153, longitude: -97.7430608 }
            //const location = this.state.currentLocation;

            this.setState({ isLoading: true })

            try {
                const res = await fetch(GLOBALS.BASE_URL + '/api/client/getLeads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ location: { lat: location.latitude, lon: location.longitude }, radius: this.state.filterDistance })
                })

                this.setState({ isLoading: false })

                if (res.status === 200) {

                    const data: any = await res.json();

                    if (data) {

                        //console.log(data.leads[0])

                        this.setState({ leads: data.leads }, () => {

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

    monthsToAge65(dob: number) {

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        //let date:Date = new Date();
        //date.setFullYear(2020, (dob - 1));

        return 'Turns 65 ' + monthNames[dob - 1] + ' 2020';
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

        if (this.state.currentLocation == null) {

            const location: Location = e.nativeEvent.coordinate;

            this.setState({ currentLocation: location }, () => {

                if (this.state.leads.length < 1)
                    this.getLeads();
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
                    <Popover arrowShift={0} onRequestClose={() => this.setState({ showRadiusFilter: false })} from={this.filterPopover} isVisible={this.state.showRadiusFilter} popoverStyle={{ borderRadius: 10 }} backgroundStyle={{ backgroundColor: 'transparent' }} placement={PopoverPlacement.BOTTOM}>
                        <FilterDropDown radius={this.state.filterDistance} updateView={(radius: number) => this.changeFilterDistance(radius)} />
                    </Popover>
                    <MapView ref={this.mapRef} showsMyLocationButton={true} onUserLocationChange={(e) => this.userLocationChanged(e)} initialRegion={{ latitude: 31.968599, longitude: -99.901810, latitudeDelta: 10, longitudeDelta: 10, }} style={{ flex: 1, height: 400, width: '100%' }} showsUserLocation={true}>
                        {this.state.leads.map((lead: Lead, index: any) => (
                            <Marker identifier={lead.id?.toString()} key={index}
                                pinColor={this.getPinColorForLead(lead)}
                                onPress={() => this.showLeadData(lead, index)} coordinate={lead.marker!.coordinate} />
                        ))}
                    </MapView>
                    <ActionSheet ref={this.sheetRef} bounceOnOpen={true} onClose={() => this.closeLeadData()}>
                        <View style={{
                            borderTopStartRadius: 0, borderTopRightRadius: 0, padding: 20, backgroundColor: 'white',
                            shadowColor: 'black', shadowOpacity: 0.15, shadowRadius: 5, shadowOffset: { width: 5, height: 50 }
                        }}>
                            <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={[{ flex: 4, flexDirection: 'column' }]}>
                                    <Text style={styles.titleText}>{this.state.activeLead?.firstname} {this.state.activeLead?.lastName}</Text>
                                    <Text style={{ fontSize: 16, color: 'gray', marginTop: 1 }}>{this.state.activeLead?.distance.toFixed(1)} miles away</Text>
                                    <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 10 }}>Address</Text>
                                    <Text style={{ fontSize: 16, color: 'gray', marginTop: 5 }}>{this.state.activeLead?.address}</Text>
                                    <Text style={{ fontSize: 16, color: 'gray' }}>{this.state.activeLead?.city}</Text>
                                    <Text style={{ fontSize: 16, color: 'gray' }}>{this.state.activeLead?.zipCode} {this.state.activeLead?.county}</Text>
                                </View>
                                <View style={[{ flex: 1, flexDirection: 'column', borderWidth: 1, borderColor: '#2185d0', borderRadius: 10, padding: 10 }]}>
                                    <Text style={{ textAlign: 'center', color: '#2185d0', fontSize: 13 }}>{this.monthsToAge65(this.state.activeLead?.dobmon)}</Text>
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
                                    <Text style={{ color: 'white', marginTop: 5, fontSize: 12 }}>Navigation</Text>
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
                                    <Text style={{ fontSize: 16, color: 'gray', marginTop: 0 }}>{this.state.activeLead?.address}</Text>

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
                <ScrollView>
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
                                    <ListItem.Subtitle >{this.monthsToAge65(lead.dobmon)}</ListItem.Subtitle>
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
                                    <Text style={{ fontSize: 16, color: 'gray', marginTop: 5 }}>{this.state.activeLead?.address}</Text>
                                    <Text style={{ fontSize: 16, color: 'gray' }}>{this.state.activeLead?.city}</Text>
                                    <Text style={{ fontSize: 16, color: 'gray' }}>{this.state.activeLead?.zipCode} {this.state.activeLead?.county}</Text>
                                </View>
                                <View style={[{ flex: 1, flexDirection: 'column', borderWidth: 1, borderColor: '#2185d0', borderRadius: 10, padding: 10 }]}>
                                    <Text style={{ textAlign: 'center', color: '#2185d0', fontSize: 13 }}>{this.monthsToAge65(this.state.activeLead?.dobmon)}</Text>
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
                                    <Text style={{ color: 'white', marginTop: 5, fontSize: 12 }}>Navigation</Text>
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
                                    <Text style={{ fontSize: 16, color: 'gray', marginTop: 0 }}>{this.state.activeLead?.address}</Text>

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