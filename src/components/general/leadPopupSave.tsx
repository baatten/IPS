import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { Icon, Input, Divider } from 'react-native-elements';
import { Lead } from '../../lib/types'

type LeadPopUpProps = {

    activeLead?: Lead,
    cancelSaveDetails: () => void
    saveLead: (text: string) => void
};

type LeadPopUpState = {
    activeLeadNotes: string
};

export class LeadPopUpSave extends React.Component<LeadPopUpProps, LeadPopUpState> {

    constructor(props: LeadPopUpProps) {
        super(props);

        this.state = { activeLeadNotes: '' }
    }

    render() {
        return (
            <View style={{ borderTopStartRadius: 0, borderTopRightRadius: 0, backgroundColor: 'white', shadowColor: 'black', shadowOpacity: 0.15, shadowRadius: 5, shadowOffset: { width: 5, height: 50 } }}>
                <View style={[{ flexDirection: 'row', padding: 20, }]}>
                    <View style={{ flexDirection: 'column' }}>
                        <Icon tvParallaxProperties={undefined} name="user" type='font-awesome' color='white' backgroundColor='#2185d0' style={{ padding: 10, borderRadius: 10 }} />
                    </View>
                    <View style={{ flexDirection: 'column', marginLeft: 10 }}>
                        <Text style={styles.titleText}>{this.props.activeLead?.firstname} {this.props.activeLead?.lastname}</Text>
                        <Text style={{ fontSize: 16, color: 'gray', marginTop: 5 }}>{this.props.activeLead?.address}</Text>

                        <Text style={{ fontSize: 16, color: 'gray' }}>{this.props.activeLead?.zipcode} {this.props.activeLead?.county}</Text>
                    </View>
                </View>

                <Divider />

                <View style={{ padding: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', margin: 10 }}>Add notes to remind yourself of this lead</Text>
                    <Input autoCompleteType={undefined} value={this.state.activeLeadNotes} onChange={(e) => this.setState({ activeLeadNotes: e.nativeEvent.text })}
                        style={{ borderWidth: 0 }}
                        inputContainerStyle={{ borderBottomWidth: 0 }}
                        inputStyle={{ margin: 0, padding: 0, height: 150, borderWidth: 0 }}
                        numberOfLines={10} multiline={true} placeholder='Add your notes here'></Input>
                </View>

                <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={220} style={[{}]}>
                    <Divider />
                    <View style={{ flexDirection: 'row', paddingBottom: 30, paddingLeft: 20, paddingRight: 20, paddingTop: 10 }}>
                        <TouchableOpacity style={[{ flex: 1, flexDirection: 'column' }]} onPress={() => this.props.cancelSaveDetails()}>
                            <Text style={{ color: 'grey', marginTop: 5, fontSize: 16 }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[{ flex: 1, flexDirection: 'column', alignItems: 'flex-end' }]} onPress={() => this.props.saveLead(this.state.activeLeadNotes!)}>
                            <Text style={{ color: '#2185d0', marginTop: 5, fontSize: 16 }}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
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