import { EventArg } from '@react-navigation/native';
import React, { ChangeEvent } from 'react';
import { View, Text, ActivityIndicator, KeyboardAvoidingView, TextInputChangeEventData,ScrollView } from 'react-native';
import { Input, Icon, Button } from 'react-native-elements';


type ResetPasswordProps = {

    didSendEmail: boolean,
    updateDidSendEmail: (didsendEmail:boolean) => void
    isLoading: boolean
    updateIsloading: (isloading:boolean) => void
    email: string
    handleEmailUpdate:(email:string) => void
}

export default class ResetPassword extends React.PureComponent<ResetPasswordProps> {


    constructor(props: ResetPasswordProps) {
        super(props)
    }

     sendResetPasswordEmail = () => {

        //console.log(this.props.email)

        this.props.updateDidSendEmail(true);
    }

    render() {

        return (
            <ScrollView style={{ marginTop: -50, marginBottom: 200 }}>
                <KeyboardAvoidingView behavior='position' keyboardVerticalOffset={260} style={{ marginLeft: 25, marginRight: 25, marginBottom: 0 }}>

                    <Icon color='rgba(255,255,255,0.15)' containerStyle={{ alignSelf: 'center', margin: 20 }} style={{}} name="lock" iconStyle={{ color: 'white', alignSelf: 'center' }} size={50} reverse />
                    <Text style={{ fontSize: 24, fontWeight: '700', textAlign: 'center', color: 'white', marginBottom: 10 }}>Recover password</Text>
                    <Text style={{ fontSize: 16, fontWeight: '400', textAlign: 'center', color: 'white', marginBottom: 20 }}>We can always help you recover your password by your username.</Text>
                    <Input inputStyle={{ padding: 10 }}
                        inputContainerStyle={{ borderBottomWidth: 0, }}
                        containerStyle={{ backgroundColor: 'white', borderTopLeftRadius: 10, borderTopRightRadius: 10, height: 48, marginBottom: 1 }}
                        placeholder="Enter e-mail address"
                        leftIcon={<Icon color='rgba(0,0,0,0.50)' name='user' type='font-awesome' />}
                        leftIconContainerStyle={{ margin: 5 }}
                        keyboardType='email-address'
                        value={this.props.email}
                        onChangeText={(text) => this.props.handleEmailUpdate(text)}
                    />
                    <Button onPress={this.sendResetPasswordEmail} title='Reset password'
                        buttonStyle={{ padding: 15, backgroundColor: 'rgba(0,0,0,0.20)', borderBottomLeftRadius: 10!, borderBottomRightRadius: 10, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
                        containerStyle={{ borderRadius: 0 }} loading={this.props.didSendEmail} />

                </KeyboardAvoidingView>
            </ScrollView>
        );
    }
}