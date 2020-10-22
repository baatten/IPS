import React from 'react';
import { StyleSheet, View, ScrollView, Text, Linking, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { Button, ButtonGroup, ListItem, Icon, Input, Divider } from 'react-native-elements';
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
    LeadInteraction?: LeadInteraction[],
    distance:number
}

type LeadInteraction = {
    date?: any
    id: number
    leadId: number
    userId?: number
    action?: string
    notes?: string
}

const HomeStack = createStackNavigator();

type Props = {
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
}

export class SavedLeadsScreen extends React.Component<Props, HomeState> {

    sheetRef: any;
    saveLeadSheetRef: any;

    constructor(props: Props) {
        super(props);

        this.sheetRef = React.createRef<ActionSheet>();
        this.saveLeadSheetRef = React.createRef<ActionSheet>();

        const leads: Lead[] = [];

        this.state = { leads: leads, isLoading: true, activeView: 0, filterDistance: 50, savingLead: false };

        this.props.navigation.addListener('focus', (e) => {
            // Prevent default behavior
            this.getLeads();

            // Do something manually
            // ...
        });
    }

    componentDidMount(){

        this.props.navigation.setOptions({
            headerShown: true,
            headerTitle: 'Saved Leads',
            headerTintColor: '#fff',
            headerStyle: { backgroundColor: '#2185d0' }
        })
    }

    changeView = (viewIndex: number) => {

        this.setState({ activeView: viewIndex });
    }

    async startNavigation(address: string, lead: Lead, index: number) {

        await this.saveLeadInteraction(lead, index, 'navigation');

        openMap({ travelType: 'drive', start: 'Houston, USA', end: address, provider: 'apple' });
    }

    updateFilterDistance(filter: number) {

        this.setState({ filterDistance: filter }, () => this.getLeads())
    }

    async getLeads() {

        try {
            const res = await fetch(GLOBALS.BASE_URL + '/api/client/getSavedLeads', {
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

    async saveLeadInteraction(lead: Lead, index: number, action?: string) {

        let actionString = '';

        if (action != null && action != '')
            actionString = action;

        if (lead.LeadInteraction == null || lead.LeadInteraction.length < 1)
            lead.LeadInteraction = [{ id: 0, action: actionString, leadId: lead.id! }]
        else {
            if (lead.LeadInteraction[0].action == '')
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

                    /*
                    let leads: Lead[] = [...this.state.leads];
                    let lead2: Lead = { ...leads[index] };

                    lead2.LeadInteraction![0] = data.leadInteraction
                    leads[index] = lead2;

                    this.setState({ isLoading: false, leads: leads })
                    */
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

    showLeadData(lead: Lead, index: number) {

        this.setState({ activeLead: lead, activeIndex: index }, this.sheetRef.current?.setModalVisible())

        this.saveLeadInteraction(lead, index);
    }

    openDetails() {

        this.sheetRef.current?.setModalVisible(false);

        //this.sheetRef.current?.setModalVisible(true);
        this.setState({ savingLead: true }, () => {

            const self = this;
            //this.sheetRef.current?.setModalVisible(false);
            setTimeout(function () {

                self.saveLeadSheetRef.current?.setModalVisible(true);

            }, 200);
        })
    }

    cancelSaveDetails() {

        this.saveLeadSheetRef.current?.setModalVisible(false);

        //this.sheetRef.current?.setModalVisible(true);
        this.setState({ savingLead: false, activeLeadNotes: '' }, () => {

            const self = this;
            //this.sheetRef.current?.setModalVisible(false);
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

        this.cancelSaveDetails()
    }

    monthsToAge65(dob: number) {

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        //let date:Date = new Date();
        //date.setFullYear(2020, (dob - 1));

        return 'Turns 65 ' + monthNames[dob - 1] + ' 2020';
    }

    removeSavedLead() {

        const lead = this.state.activeLead;
        const index = this.state.activeIndex;

        lead!.LeadInteraction![0].notes = '';
        lead!.LeadInteraction![0].action = '';

        this.saveLeadInteraction(lead!, this.state.activeIndex!);

        let leads: Lead[] = [...this.state.leads];
        leads.splice(index!, 1);

        this.setState({ isLoading: false, leads: leads });
        this.sheetRef.current?.setModalVisible(false);
    }

    getPinColorForLead(lead: Lead) {
        let color = 'green'

        if (lead.LeadInteraction!.length > 0) {
            if (lead.LeadInteraction![0].action == '')
                color = 'orange';
            else if (lead.LeadInteraction![0].action == 'saved')
                color = 'purple';

            else
                color = 'red'
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

    render() {

        if (this.state.leads != undefined && this.state.leads.length > 0) {
            return (
                <ScrollView>
                    {
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
                        ))}
                    <ActionSheet ref={this.sheetRef} bounceOnOpen={true} onClose={() => this.setState({ savingLead: false })}>
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
                                <View style={[{flex:1, flexDirection: 'column',borderWidth:1,borderColor:'#2185d0',borderRadius:10,padding:10 }]}>
                                    <Text style={{ textAlign: 'center',color:'#2185d0',fontSize:13 }}>{this.monthsToAge65(this.state.activeLead?.dobmon)}</Text>
                                </View>
                            </View>

                            {(this.state.activeLead?.LeadInteraction![0].notes != '' && this.state.activeLead?.LeadInteraction![0].notes != null) && (
                                <>
                                    <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 10 }}>Notes</Text>
                                    <Text style={{ fontSize: 16, color: 'grey', marginTop: 5 }}>{this.state.activeLead?.LeadInteraction![0].notes}</Text>
                                </>
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
                                <TouchableOpacity style={[{ flex: 1, flexDirection: 'column', alignItems: 'center', backgroundColor: '#FF4949', borderRadius: 10, padding: 15, marginLeft: 5, marginRight: 5 }]}
                                    onPress={() => this.removeSavedLead()}>
                                    <Icon name='close' type='font-awesome' color='white' />
                                    <Text style={{ color: 'white', marginTop: 5, fontSize: 12 }}>Remove</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ActionSheet>
                </ScrollView>
            )
        } else
            return (
                <View>
                    <Text style={{ marginTop: 250, opacity: 0.5, fontSize: 20, fontWeight: '400', alignSelf: 'center' }}>You have no saved leads</Text>
                </View>
            )
    }
}

export function SavedLeadsStackScreen() {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen name="Saved Leads" component={SavedLeadsScreen} />
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