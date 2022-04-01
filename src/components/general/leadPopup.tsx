import React from 'react';
import { StyleSheet, View, Text, Linking, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import openMap from 'react-native-open-maps';
import { Lead } from '../../lib/types'

type LeadPopUpProps = {

    activeLead?: Lead
    activeIndex?: number
    saveleadinteraction: (lead: Lead, index: number, newAction?: string) => void
    monthsToAge65: (date: Date) => string
    leadIsSaved: () => boolean
    removeSavedLead: () => void
    openDetails: () => void
};

type LeadPopUpState = {

};

export class LeadPopUp extends React.Component<LeadPopUpProps, LeadPopUpState> {

    constructor(props: LeadPopUpProps) {
        super(props);
    }

    async startCall() {

        this.setState({ isLoading: true })

        this.props.saveleadinteraction(this.props.activeLead!, this.props.activeIndex!, 'call');

        Linking.openURL(`tel:${this.props.activeLead?.phone}`)
    }

    async startNavigation(address: string, lead: Lead, index: number) {

        this.props.saveleadinteraction(lead, index, 'navigation');

        openMap({ travelType: 'drive', end: address, provider: 'apple' });
    }

    render() {
        return (
            <View style={{ borderTopStartRadius: 0, borderTopRightRadius: 0, padding: 20, backgroundColor: 'white', shadowColor: 'black', shadowOpacity: 0.15, shadowRadius: 5, shadowOffset: { width: 5, height: 50 } }}>
                <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                    <View style={[{ flex: 4, flexDirection: 'column' }]}>
                        <Text style={styles.titleText}>{this.props.activeLead?.firstname} {this.props.activeLead?.lastname}</Text>
                        <Text style={{ fontSize: 16, color: 'gray', marginTop: 1 }}>{(Math.round((this.props.activeLead?.distance || 0) * 10) / 10)} miles away</Text>
                        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 10 }}>Address</Text>
                        <Text style={{ fontSize: 16, color: 'gray', marginTop: 5 }}>{this.props.activeLead?.address}</Text>
                        <Text style={{ fontSize: 16, color: 'gray' }}>{this.props.activeLead?.city}</Text>
                        <Text style={{ fontSize: 16, color: 'gray' }}>{this.props.activeLead?.zipcode} {this.props.activeLead?.county}</Text>
                    </View>
                    <View style={[{ flex: 1, flexDirection: 'column', borderWidth: 1, borderColor: '#2185d0', borderRadius: 10, padding: 10 }]}>
                        <Text style={{ textAlign: 'center', color: '#2185d0', fontSize: 13 }}>{this.props.monthsToAge65(new Date(this.props.activeLead?.dobdate || ''))}</Text>
                    </View>
                </View>

                {(this.props.activeLead?.leadinteraction != null && this.props.activeLead?.leadinteraction.length > 0 && this.props.activeLead.leadinteraction[0]?.notes != null) && (
                    <View>
                        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 10 }}>Notes</Text>
                        <Text style={{ fontSize: 16, color: 'grey', marginTop: 5 }}>{this.props.activeLead.leadinteraction[0].notes}</Text>
                    </View>
                )}

                <View style={[{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 20 }]}>
                    <TouchableOpacity style={[{ flex: 1, flexDirection: 'column', alignItems: 'center', backgroundColor: '#2185d0', borderRadius: 10, padding: 15, marginRight: 5 }]} onPress={() => this.startNavigation(this.props.activeLead!.address + ' ' +
                        this.props.activeLead!.city + ' ' +
                        this.props.activeLead!.county + ' ' +
                        this.props.activeLead!.state, this.props.activeLead!, this.props.activeIndex!
                    )}>
                        <Icon tvParallaxProperties={undefined} name="car" type='font-awesome' color='white' />
                        <Text style={{ color: 'white', marginTop: 5, fontSize: 10 }}>Navigation</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[{ flex: 1, flexDirection: 'column', alignItems: 'center', backgroundColor: '#2185d0', borderRadius: 10, padding: 15, marginLeft: 5, marginRight: 5 }]} onPress={() => this.startCall()}>
                        <Icon tvParallaxProperties={undefined} name="phone" type='font-awesome' color='white' />
                        <Text style={{ color: 'white', marginTop: 5, fontSize: 12 }}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[{ flex: 1, flexDirection: 'column', alignItems: 'center', backgroundColor: this.props.leadIsSaved() ? ('grey') : ('#2185d0'), borderRadius: 10, padding: 15, marginLeft: 5 }]}
                        onPress={this.props.leadIsSaved() ? () => this.props.removeSavedLead() : () => this.props.openDetails()
                        }>
                        <Icon tvParallaxProperties={undefined} name={this.props.leadIsSaved() ? ('check') : ('plus')} type='font-awesome' color='white' />
                        <Text style={{ color: 'white', marginTop: 5, fontSize: 12 }}>Save{this.props.leadIsSaved() && (<>d</>)}</Text>
                    </TouchableOpacity>
                </View>
                <Text style={{ color: 'grey', fontSize: 15, textAlign: 'center', marginBottom: 10 }}>Built by <Text onPress={() => Linking.openURL('http://www.orbusmarketing.com')} style={{ color: '#2185d0', fontSize: 15, padding: 0, margin: 0 }}>T65 Locator</Text></Text>
            </View>
        )
    }
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