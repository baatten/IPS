import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Icon, Input, Divider, Button } from 'react-native-elements';
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
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <View style={{ justifyContent: "space-around", borderTopStartRadius: 0, borderTopRightRadius: 0, backgroundColor: 'white' }}>
                    <View style={[{ flexDirection: 'row', padding: 20, }]}>
                        <View style={{ flexDirection: 'column' }}>
                            <Icon tvParallaxProperties={undefined} name="user" type='font-awesome' color='white' backgroundColor='#2185d0' style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 }} />
                        </View>
                        <View style={{ flexDirection: 'column', marginLeft: 10 }}>
                            <Text style={styles.titleText}>{this.props.activeLead?.firstname} {this.props.activeLead?.lastname}</Text>
                            <Text style={{ fontSize: 16, color: 'gray', marginTop: 5 }}>{this.props.activeLead?.address}</Text>

                            <Text style={{ fontSize: 16, color: 'gray' }}>{this.props.activeLead?.zipcode} {this.props.activeLead?.county}</Text>
                        </View>
                    </View>

                    <Divider />

                    <View style={{ padding: 10 }}>
                        <Input autoCompleteType={undefined} value={this.state.activeLeadNotes} onChange={(e) => this.setState({ activeLeadNotes: e.nativeEvent.text })}
                            style={{ borderWidth: 0 }} autoFocus
                            inputContainerStyle={{ borderBottomWidth: 0 }}
                            inputStyle={{ margin: 0, padding: 0, height: 150, borderWidth: 0, textAlignVertical: 'top' }}
                            numberOfLines={10} multiline={true} placeholder='Add your notes here'></Input>
                    </View>

                    <Divider />

                    <View style={{ flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 15, justifyContent:'space-between' }}>
                        <Button title='Cancel' onPress={() => this.props.cancelSaveDetails()} accessibilityViewIsModal
                            buttonStyle={[{ backgroundColor: 'white', paddingVertical: 10, paddingHorizontal: 0, borderRadius: 8 }]}
                            titleStyle={{ color: '#909090' }}
                        />

                        <Button title='Save' onPress={() => this.props.saveLead(this.state.activeLeadNotes)}

                            buttonStyle={[{ backgroundColor: '#2185d0', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 }]}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
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