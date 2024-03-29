import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, AppState, FlatList, Alert, Platform } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import GLOBALS from '../globals';
import { StackNavigationProp, createStackNavigator } from '@react-navigation/stack';
import MapView, { Marker, EventUserLocation, LatLng } from 'react-native-maps';
import ActionSheet from "react-native-actions-sheet";
import type { Camera } from 'react-native-maps';
import Popover, { PopoverPlacement } from 'react-native-popover-view';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lead } from '../lib/types'
import { LeadPopUp } from '../components/general/leadPopup';
import { LeadPopUpSave } from '../components/general/leadPopupSave';
import type { Location } from '../lib/types'
import { HeaderMenu } from '../components/home/headerMenu';
import { FilterDropDown } from '../components/home/filterDropDown';
import { DateDropDown } from '../components/home/dateDropDown';

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

        Geolocation.getCurrentPosition(
            (response) => {

                //console.log(response)
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
    }

    componentDidMount() {

        this.appStateSubscription = AppState.addEventListener('change', this._handleAppStateChange);

        this.props.navigation.setOptions({
            headerShown: true,
            headerTitle: () => <HeaderMenu activeView={this.state.activeView} updateView={this.changeView} />,
            headerTitleAlign: 'center',
            headerTintColor: '#fff',
            headerStyle: { backgroundColor: '#2185d0' },
            headerRight: () =>
                <TouchableOpacity ref={this.filterPopover} onPressIn={() => this.setState({ showRadiusFilter: true })} style={{ marginRight: 10, backgroundColor: 'transparent' }} >
                    <Icon tvParallaxProperties={undefined} name='map-marked-alt' color='white' size={22} type='font-awesome-5' style={{ color: 'white' }} />
                </TouchableOpacity>,
            headerLeft: () =>
                <TouchableOpacity ref={this.datePopover} onPressIn={() => this.setState({ showDateFilter: true })} style={{ marginLeft: 10, backgroundColor: 'transparent' }} >
                    <Icon tvParallaxProperties={undefined} name='calendar-week' color='white' size={22} type='font-awesome-5' style={{ color: 'white' }} />
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









            if (this.state.activeView == 0) {


                //console.log('fitToCoordinates')

                /*
                    
*/
                if (Platform.OS == 'ios') {

                    /*
                    const markerIds: string[] = this.state.leads.map((lead: Lead) => {

                        return lead.id!.toString();
                    })
                    */

                    //this.mapRef.fitToSuppliedMarkers(markerIds);

                    const coordinates: LatLng[] = this.state.leads.map((lead: Lead) => {

                        return { latitude: lead.latitude, longitude: lead.longitude };
                    })

                    this.mapRef.fitToCoordinates(coordinates, {
                        edgePadding: {
                            bottom: 50,
                            left: 50,
                            right: 50,
                            top: 50,
                        },
                        animated: true
                    })
                }

                else {

                    setTimeout(() => {

                        this.mapRef.fitToElements({
                            edgePadding: {
                                bottom: 50,
                                left: 50,
                                right: 50,
                                top: 50,
                            },
                        });

                    }, (500));


                }





                //console.log(markerIds[0])
                //console.log(this.mapRef.getCamera())
                //this.mapRef.fitToSuppliedMarkers(markerIds);

                /*
                
                */
            }
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
            const camera: Camera = await this.mapRef.getCamera();

            camera.center = {
                latitude: lead.latitude,
                longitude: lead.longitude,
            };

            this.mapRef.animateCamera(camera);
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

        this.setState({ leads: leads, isLoading: false, activeLead: undefined, activeIndex: undefined });
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
                            <Popover arrowSize={{ width: 0, height: 0 }} onRequestClose={() => this.setState({ showRadiusFilter: false })} from={this.filterPopover} isVisible={this.state.showRadiusFilter} popoverStyle={{ borderRadius: 10 }} backgroundStyle={{ backgroundColor: 'transparent' }} placement={PopoverPlacement.BOTTOM}>
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
                            <Popover arrowSize={{ width: 0, height: 0 }} onRequestClose={() => this.setState({ showDateFilter: false })} from={this.datePopover} isVisible={this.state.showDateFilter} popoverStyle={{ borderRadius: 10 }} backgroundStyle={{ backgroundColor: 'transparent' }} placement={PopoverPlacement.BOTTOM}>
                                <DateDropDown
                                    updateMonth={(month) => this.changeFilterMonth(month)}
                                    months={this.state.filterMonths} />
                            </Popover>
                            <MapView toolbarEnabled={false} loadingEnabled ref={(ref) => { this.mapRef = ref; }}
                                showsMyLocationButton={true} onUserLocationChange={(e) => this.userLocationChanged(e)} initialRegion={{ latitude: this.state.currentLocation.latitude, longitude: this.state.currentLocation.longitude, latitudeDelta: 0.5, longitudeDelta: 0.5 }} style={StyleSheet.absoluteFill} showsUserLocation={true}>

                                {this.state.leads.map((lead: Lead, index: any) => (
                                    <Marker
                                        draggable={false}
                                        key={(Platform.OS == 'android' && this.state.activeIndex == index) ? index + 'Active' : index}
                                        identifier={(this.state.activeIndex == index) ? index + 'Active' : index.toString()}
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
                            saveLead={(text: string) => this.saveLead(text)}
                            activeLead={this.state.activeLead}
                        />
                    </ActionSheet>
                </View>);
        }
        else {
            return (
                <>
                    <Popover arrowSize={{ width: 0, height: 0 }} arrowShift={0} onRequestClose={() => this.setState({ showRadiusFilter: false })} from={this.filterPopover} isVisible={this.state.showRadiusFilter} popoverStyle={{ borderRadius: 10 }} backgroundStyle={{ backgroundColor: 'transparent' }} placement={PopoverPlacement.BOTTOM}>
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

                    <Popover arrowSize={{ width: 0, height: 0 }} arrowShift={0} onRequestClose={() => this.setState({ showDateFilter: false })} from={this.datePopover} isVisible={this.state.showDateFilter} popoverStyle={{ borderRadius: 10 }} backgroundStyle={{ backgroundColor: 'transparent' }} placement={PopoverPlacement.BOTTOM}>
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
                                <ListItem hasTVPreferredFocus={undefined} tvParallaxProperties={undefined} key={index} bottomDivider onPress={() => this.showLeadData(item.lead, index)} >
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
                            saveLead={(text: string) => this.saveLead(text)}
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
            <HomeStack.Screen name="HomeScreen 2" component={HomeScreen} />
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