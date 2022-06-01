import React from 'react';
import { validateAll } from 'indicative/validator';
import { View, Text, KeyboardAvoidingView, ImageBackground, Modal, Alert, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Input, Button, Icon } from 'react-native-elements';
import { AppContext } from '../components/utils/appContext';
import ActionSheet from "react-native-actions-sheet";
import GLOBALS from '../globals';
import { ScrollView } from 'react-native-gesture-handler';

type SignInScreenState = {

    emailAddress: string
    password: string
    isLoading: boolean
    SignUpErrors?: any
    isSendingEmail: boolean
    didSendEmail: boolean
    email: string
    securityCode: string
    modelIsOpen: boolean
    passwordWasResat: boolean
}

export default class SignInScreen extends React.Component<any, SignInScreenState> {

    declare context: React.ContextType<typeof AppContext>
    sheetRef: any;

    constructor(props: any) {
        super(props)

        this.sheetRef = React.createRef<ActionSheet>();

        this.state = {
            emailAddress: '',
            password: '', email: '',
            securityCode: '',
            isSendingEmail: false,
            didSendEmail: false,
            isLoading: false,
            modelIsOpen: false,
            passwordWasResat: false
        };
    }

    async handleSignIn() {

        const rules = {
            email: 'required|email',
            password: 'required|string|min:1|max:40'
        };

        const data = {
            email: this.state.emailAddress,
            password: this.state.password
        };

        const messages = {
            required: (field: any) => `${field} is required`,
            'username.alpha': 'Username contains unallowed characters',
            'email.email': 'Please enter a valid email address',
            'password.min': 'Wrong Password?'
        };

        validateAll(data, rules, messages)
            .then(() => {
                //.log('success sign in');

                this.setState({ isLoading: true })
                this.signIn();

            })
            .catch((err: { "field": string, "message": string, "validation": string }[]) => {
                const formatError = {};


                Alert.alert(err[0].message)
                //setSignUpErrors(formatError);
            });
        //}
    };

    async signIn() {

        await this.context.signIn(this.state.emailAddress, this.state.password);

        this.setState({ isLoading: false })
    }

    validEmail(email: string): boolean {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    async sendResetPasswordEmail() {

        if (this.validEmail(this.state.email)) {

            //Keyboard.dismiss();
            this.setState({ isSendingEmail: true })

            try {
                const res = await fetch(GLOBALS.BASE_URL + '/api/client/sendResetPasswordCode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(
                        { email: this.state.email }
                    ),
                })

                this.setState({ isSendingEmail: false, didSendEmail: true })

                if (res.status === 200) {

                    //console.log('test works')
                }
                else {
                    console.log('error')
                }
            }
            catch (error) {
                console.error('An unexpected error happened occurred:', error)
                //setErrorMsg(error.message)
            }
        }
        else {
            Alert.alert('You did not enter a valid e-mail.')
        }
    }

    async sendNewPasswordToUser() {

        if (this.state.securityCode.length == 6) {

            this.setState({ isSendingEmail: true })

            try {
                const res = await fetch(GLOBALS.BASE_URL + '/api/client/resetPasswordWithCode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(
                        { email: this.state.email, code: this.state.securityCode }
                    ),
                })

                if (res.status === 200) {

                    this.setState({ passwordWasResat: true })
                }
                else {
                    console.log('error')
                    this.setState({ isSendingEmail: false, didSendEmail: true })
                }
            }
            catch (error) {
                console.error('An unexpected error happened occurred:', error)
                //setErrorMsg(error.message)
            }
        }
        else {
            Alert.alert('You did not enter a valid e-mail.')
        }

    }

    emailIsValid = (): boolean => {

        return !this.validEmail(this.state.email);
    }

    closeModal() {

        this.setState({
            email: '',
            securityCode: '',
            isSendingEmail: false,
            didSendEmail: false,
            modelIsOpen: false,
            passwordWasResat: false
        });
    }

    render() {

        return (
            <View style={{ flex: 1 }}>
                <ImageBackground source={require('../../assets/splash.png')} style={{ flex: 1, alignSelf: 'stretch' }}>
                    <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} enabled >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={{ padding: 25 }}>
                                <Text style={{ color: 'white', fontSize: 30, fontWeight: '700', textAlign: "center", paddingBottom: 10 }}>T65 Locator</Text>
                                <Text style={{ color: 'white', fontSize: 16, fontWeight: '300', textAlign: "center", paddingBottom: 25, lineHeight: 24 }}>We pride ourselves on our thorough and friendly support. We work in the trenches with agents like you to help make your jobs easier and more financially rewarding.</Text>
                                <Text style={{ color: 'white', fontSize: 20, fontWeight: '500', textAlign: "center", paddingBottom: 15 }}>Please sign in:</Text>
                                <Input autoCompleteType={undefined} inputStyle={{ padding: 10 }}
                                    inputContainerStyle={{ borderBottomWidth: 0, }}
                                    containerStyle={{ backgroundColor: 'white', borderTopLeftRadius: 10, borderTopRightRadius: 10, height: 48, marginBottom: 1 }}
                                    placeholder="E-mail"
                                    leftIcon={<Icon tvParallaxProperties={undefined} name='user' type='font-awesome' />}
                                    leftIconContainerStyle={{ margin: 5 }}
                                    value={this.state.emailAddress}
                                    onChangeText={(text) => this.setState({ emailAddress: text })}
                                    keyboardType='email-address'
                                    autoCapitalize='none'
                                />
                                <Input autoCompleteType={undefined} inputStyle={{ padding: 10 }}
                                    inputContainerStyle={{ borderBottomWidth: 0, }}
                                    containerStyle={{ backgroundColor: 'white', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, height: 48, marginBottom: 5 }}
                                    placeholder="Password"
                                    leftIcon={<Icon tvParallaxProperties={undefined} name='lock' type='font-awesome' />}
                                    leftIconContainerStyle={{ margin: 5 }}
                                    value={this.state.password}
                                    onChangeText={(text => this.setState({ password: text }))}
                                    secureTextEntry={true} autoCapitalize='none'
                                />

                                <View style={[{ flexDirection: 'row', width: '100%' }]}>
                                    <View style={[{ flexDirection: 'column', width: '50%' }]}>
                                        <Button loading={this.state.isLoading} style={{ width: '100%' }} buttonStyle={{ margin: 0, marginTop: 5, padding: 15, borderRadius: 10 }} title="Sign in" onPress={() => this.handleSignIn()} />
                                    </View>
                                    <View style={[{ flexDirection: 'column', width: '50%' }]}>
                                        <Button buttonStyle={{ margin: 0, marginTop: 5, marginLeft: 10, padding: 15, borderRadius: 10, backgroundColor: 'gray' }} title="Register" onPress={() => this.context.signUp()} />
                                    </View>
                                </View>
                                <Button type='clear' title='Forgot your Password?' onPress={() => this.setState({ modelIsOpen: true })}
                                    style={{ alignSelf: 'center', marginTop: 5 }} titleStyle={{ color: 'white' }} />
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </ImageBackground>

                <Modal animationType="slide" presentationStyle='fullScreen' visible={this.state.modelIsOpen}>
                    <ScrollView style={{ backgroundColor: '#1D7DD7', height: '100%', flex: 1, alignSelf: 'stretch' }} keyboardShouldPersistTaps='always'>
                        <View style={{ backgroundColor: '#1D7DD7', flex: 1 }}>
                            <Icon tvParallaxProperties={undefined} color='rgba(255,255,255,0.15)' onPress={() => this.closeModal()} containerStyle={{ alignSelf: 'flex-end', marginTop: 50, marginRight: 25, zIndex: 99 }} style={{}} name="close" iconStyle={{ color: 'white', alignSelf: 'center', marginLeft: 2, marginTop: 1, zIndex: 999 }} size={18} reverse />
                            <KeyboardAvoidingView behavior={Platform.OS == 'android' ? "height" : 'height'} keyboardVerticalOffset={50} style={{ marginLeft: 25, marginRight: 25, flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                                <Icon tvParallaxProperties={undefined} color='rgba(255,255,255,0.15)' containerStyle={{ alignSelf: 'center', margin: 20 }} style={{}} name="lock" iconStyle={{ color: 'white', alignSelf: 'center' }} size={70} reverse />
                                <Text style={{ fontSize: 24, fontWeight: '700', textAlign: 'center', color: 'white', marginBottom: 10 }}>Recover password</Text>
                                {this.state.passwordWasResat ? (
                                    <>
                                        <Text style={{ fontSize: 16, fontWeight: '400', textAlign: 'center', color: 'white', marginBottom: 20 }}>Your pass was reset and the new pass is in your e-mail inbox. if you don't see it, check your spam folder.</Text>
                                        <Button title='Sign in now' onPress={() => this.closeModal()}
                                            buttonStyle={{ padding: 15, backgroundColor: 'rgba(0,0,0,0.20)', borderRadius: 10 }}
                                            disabledStyle={{ backgroundColor: 'rgba(0,0,0,0.20)' }}
                                            disabledTitleStyle={{ color: 'rgba(255,255,255,0.5)' }}
                                            containerStyle={{ borderRadius: 0 }} />
                                    </>
                                ) : (
                                    !this.state.didSendEmail ? (
                                        <>
                                            <Text style={{ fontSize: 16, fontWeight: '400', textAlign: 'center', color: 'white', marginBottom: 20 }}>We can always help you recover your password by your username.</Text>
                                            <Input autoCompleteType={undefined} autoFocus={true} inputStyle={{ padding: 10 }}
                                                inputContainerStyle={{ borderBottomWidth: 0 }}
                                                containerStyle={{ backgroundColor: 'white', borderRadius: 10, height: 48, marginBottom: 15 }}
                                                placeholder="Enter e-mail address"
                                                leftIcon={<Icon tvParallaxProperties={undefined} color='rgba(0,0,0,0.50)' name='user' type='font-awesome' />}
                                                leftIconContainerStyle={{ margin: 5 }}
                                                keyboardType='email-address'
                                                autoCapitalize='none'
                                                value={this.state.email}
                                                onChangeText={(text) => this.setState({ email: text })}
                                            />

                                            <Button title={!this.emailIsValid() ? 'Reset password' : 'Enter a valid e-mail'} onPress={() => this.sendResetPasswordEmail()} disabled={this.emailIsValid()}
                                                buttonStyle={{ padding: 15, backgroundColor: 'rgba(0,0,0,0.20)', borderRadius: 10 }}
                                                disabledStyle={{ backgroundColor: 'rgba(0,0,0,0.20)' }}
                                                disabledTitleStyle={{ color: 'rgba(255,255,255,0.5)' }}
                                                containerStyle={{ borderRadius: 0 }} loading={this.state.isSendingEmail} />
                                        </>

                                    ) : (
                                        <>
                                            <Text style={{ fontSize: 16, fontWeight: '400', textAlign: 'center', color: 'white', marginBottom: 20 }}>A security code has been sent to your email. Enter the code here.</Text>
                                            <Input autoCompleteType={undefined} autoFocus={true} inputStyle={{ padding: 10 }}
                                                inputContainerStyle={{ borderBottomWidth: 0 }}
                                                containerStyle={{ backgroundColor: 'white', borderRadius: 10, height: 48, marginBottom: 15 }}
                                                placeholder="Enter the security code"
                                                leftIcon={<Icon tvParallaxProperties={undefined} color='rgba(0,0,0,0.50)' name='lock' type='font-awesome' />}
                                                leftIconContainerStyle={{ margin: 5 }}
                                                keyboardType='numeric'
                                                value={this.state.securityCode}
                                                onChangeText={(text) => this.setState({ securityCode: text })}
                                            />

                                            <Button title={'Reset password'} onPress={() => this.sendNewPasswordToUser()}
                                                buttonStyle={{ padding: 15, backgroundColor: 'rgba(0,0,0,0.20)', borderRadius: 10 }}
                                                disabledStyle={{ backgroundColor: 'rgba(0,0,0,0.20)' }}
                                                disabledTitleStyle={{ color: 'rgba(255,255,255,0.5)' }}
                                                containerStyle={{ borderRadius: 0 }} loading={this.state.isSendingEmail} />
                                        </>
                                    )
                                )}
                            </KeyboardAvoidingView>
                        </View>
                    </ScrollView>
                </Modal>
            </View>
        )
    }
}