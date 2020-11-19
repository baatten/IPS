import React from 'react';
import { StyleSheet, View, ScrollView, Text, Linking, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import GLOBALS from '../globals';
import { StackNavigationProp, createStackNavigator } from '@react-navigation/stack';
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
    dobmon: any,
    latitude: number,
    longitude: number,
    marker?: KmlMarker,
    LeadInteraction?: LeadInteraction[],
    distance: number,
    dobDate:Date
}

type LeadInteraction = {
    date?: any
    id: number
    leadId: number
    userId?: number
    action?: string
    notes?: string
}

const SaveLeadsStack = createStackNavigator();

type SaveLeadProps = {
    navigation: StackNavigationProp<{}>;
};

type SaveLeadState = {
    leads: Lead[],
    isLoading: boolean,
    activeLead?: Lead,
    activeIndex?: number,
    savingLead: boolean,
    activeLeadNotes?: string,
    filterDistance: number
    activeView: number
}

export class SavedLeadsScreen extends React.Component<SaveLeadProps, SaveLeadState> {

    sheetRef: any;
    saveLeadSheetRef: any;

    constructor(props: SaveLeadProps) {
        super(props);

        this.sheetRef = React.createRef<ActionSheet>();
        this.saveLeadSheetRef = React.createRef<ActionSheet>();

        const leads: Lead[] = [];

        this.state = { leads: leads, isLoading: true, activeView: 0, filterDistance: 50, savingLead: false };
    }

    componentDidMount() {

        this.props.navigation.setOptions({
            headerShown: true,
            headerTitle: 'Saved Leads',
            headerTintColor: '#fff',
            headerStyle: { backgroundColor: '#2185d0' }
        })

        this.props.navigation.addListener('focus', (e) => {
            
            this.getLeads();
        });
    }

    componentWillUnmount(){
        this.props.navigation.removeListener('focus', () => {
            
        })
    }

    changeView = (viewIndex: number) => {

        this.setState({ activeView: viewIndex });
    }

    async startNavigation(address: string, lead: Lead, index: number) {

        await this.saveLeadInteraction(lead, index, 'navigation');

        openMap({ travelType: 'drive', end: address, provider: 'apple' });
    }

    updateFilterDistance(filter: number) {

        this.setState({ filterDistance: filter }, () => this.getLeads())
    }

    async getLeads() {

        this.setState({ isLoading: true })
        
        try {
            const res = await fetch(GLOBALS.BASE_URL + '/api/client/getSavedLeads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ radius: this.state.filterDistance })
            })

            this.setState({ isLoading: false })

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

    monthsToAge65(date: Date) {

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        return 'Turns 65 ' + monthNames[date.getMonth()] + ' ' + date.getFullYear();
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
                    {this.state.isLoading && (
                        <View style={{ top: 25, alignSelf: 'center', position: 'absolute', zIndex: 99999, backgroundColor: 'white', paddingLeft: 25, paddingRight: 25, paddingBottom: 10, paddingTop: 10, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 }}>
                            <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={[{ flexDirection: 'column' }]}>
                                    <ActivityIndicator color="black" style={{ marginRight: 10 }} />
                                </View>
                                <View style={[{ flexDirection: 'column' }]}>
                                    <Text>Loading...</Text>
                                </View>

                            </View>
                        </View>
                    )}
                    {
                        this.state.leads.map((lead: Lead, i) => (
                            <ListItem key={i} bottomDivider onPress={() => this.showLeadData(lead, i)} >
                                <ListItem.Content>
                                    <ListItem.Title style={{
                                        fontWeight: '600', color: this.getPinColorForLead(lead)
                                    }}>{lead.firstname} {lead.lastName}</ListItem.Title>
                                    <ListItem.Subtitle style={{ color: 'grey' }}>{lead.address}, {lead.city}</ListItem.Subtitle>
                                </ListItem.Content>
                                <ListItem.Subtitle >{this.monthsToAge65(new Date(lead.dobDate || ''))}</ListItem.Subtitle>
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
                                    <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 10 }}>Address</Text>
                                    <Text style={{ fontSize: 16, color: 'gray', marginTop: 5 }}>{this.state.activeLead?.address}</Text>
                                    <Text style={{ fontSize: 16, color: 'gray' }}>{this.state.activeLead?.city}</Text>
                                    <Text style={{ fontSize: 16, color: 'gray' }}>{this.state.activeLead?.zipCode} {this.state.activeLead?.county}</Text>
                                </View>
                                <View style={[{ flex: 1, flexDirection: 'column', borderWidth: 1, borderColor: '#2185d0', borderRadius: 10, padding: 10,marginRight:5 }]}>
                                    <Text style={{ textAlign: 'center', color: '#2185d0', fontSize: 13 }}>{this.monthsToAge65(new Date(this.state.activeLead?.dobDate || ''))}</Text>
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
                            <Text style={{color:'grey',fontSize:15,textAlign:'center',marginBottom:10}}>Built by <Text onPress={() => Linking.openURL('http://www.empowerbrokerage.com')} style={{color:'#2185d0',fontSize:15,padding:0,margin:0}}>T65 Locator</Text></Text>
                        </View>
                    </ActionSheet>
                </ScrollView>
            )
        }
        else if (this.state.isLoading && this.state.leads.length == 0)
            return (
                <View>
                    {this.state.isLoading && (
                        <View style={{ top: 25, alignSelf: 'center', position: 'absolute', zIndex: 99999, backgroundColor: 'white', paddingLeft: 25, paddingRight: 25, paddingBottom: 10, paddingTop: 10, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 }}>
                            <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={[{ flexDirection: 'column' }]}>
                                    <ActivityIndicator color="black" style={{ marginRight: 10 }} />
                                </View>
                                <View style={[{ flexDirection: 'column' }]}>
                                    <Text>Loading...</Text>
                                </View>

                            </View>
                        </View>
                    )}
                </View>
            )

        else
            return (
                <View>
                    {this.state.isLoading && (
                        <View style={{ top: 25, alignSelf: 'center', position: 'absolute', zIndex: 99999, backgroundColor: 'white', padding: 15, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 }}>
                            <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={[{ flexDirection: 'column' }]}>
                                    <ActivityIndicator color="black" style={{ marginRight: 10 }} />
                                </View>
                                <View style={[{ flexDirection: 'column' }]}>
                                    <Text>Loading...</Text>
                                </View>

                            </View>
                        </View>
                    )}
                    <Text style={{ marginTop: 250, opacity: 0.5, fontSize: 20, fontWeight: '400', alignSelf: 'center' }}>You have no saved leads</Text>
                </View>
            )
    }
}

export function SavedLeadsStackScreen() {
    return (
        <SaveLeadsStack.Navigator>
            <SaveLeadsStack.Screen name="Saved Leads" component={SavedLeadsScreen} />
        </SaveLeadsStack.Navigator>
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