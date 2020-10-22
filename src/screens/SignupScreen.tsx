import React from 'react';
import GLOBALS from '../globals';
import { View, Text, KeyboardAvoidingView, Alert, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Input, Button, Icon } from 'react-native-elements';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthContext } from '../components/utils/authContext';
import { Formik, } from 'formik';
import Wizard from "react-native-wizard"
import * as Yup from 'yup';

type Person = {
    email: string,
    password: string
    name: string,
    surname: string,
    address?: string,
    city?: string,
    state?: string,
    zipCode?: string,
    phone: string
}

type Props = {
    navigation: StackNavigationProp<{}>;
}

type settingsState = {
    user: Person
    isLoading: boolean,
    isFirstStep: boolean,
    isLastStep: boolean,
    currentStep: any,
    isCurrentViewValid: boolean,
    currentForm: any,
    subscrptionIndex?: number
}

export class SignUpScreen extends React.Component<Props, settingsState> {

    static contextType = AuthContext;
    formUser: any;
    formPersonal: any;
    formSubscription: any
    wizard: any;

    constructor(props: Props) {
        super(props);

        this.formUser = React.createRef();
        this.formPersonal = React.createRef();
        this.formSubscription = React.createRef();
        this.wizard = React.createRef();

        this.state = {
            user: { name: '', surname: '', address: '', city: '', state: '', zipCode: '', phone: '',email:'',password:'' },
            isLoading: false,
            isFirstStep: true,
            isLastStep: false,
            currentStep: 2,
            isCurrentViewValid: false,
            currentForm: this.formUser
        }
    }

    async saveUserDetails() {

        this.setState({ isLoading: true })
        this.wizard.current.next();

        const account = this.state.user;

        let subscription = 'annually'

        if (this.state.subscrptionIndex == 1)
            subscription = 'monthly';

        try {
            const res = await fetch(GLOBALS.BASE_URL + '/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    { accountData: account, subscription }
                )
            })
            if (res.status === 200) {

                const responseData = await res.json();

                this.setState({ isLoading: false })
            }
            else {
                this.setState({ isLoading: false })
            }
        }
        catch (error) {
            console.error('An unexpected error happened occurred:', error)
        }
    }

    updateStep(step: any) {

        if (step.currentStep == 0)
            this.setState({ currentForm: this.formUser })
        else if (step.currentStep == 1)
            this.setState({ currentForm: this.formPersonal })

        this.setState(step)
    }

    render() {

        const stepList = [
            {
                content: <Formik innerRef={p => (this.formUser = p)} enableReinitialize
                    initialValues={{ name: this.state.user.name, surname: this.state.user.surname, email: this.state.user.email, password: this.state.user.password }}
                    validateOnChange

                    validationSchema={Yup.object({
                        name: Yup.string()
                            .min(2, 'Minimum 2 characters')
                            .required('Required')
                    })}
                    onSubmit={(values, { setSubmitting }) => {

                        this.wizard.current.next()

                        const user = this.state.user;

                        user.name = values.name;
                        user.surname = values.surname;
                        user.email = values.email;
                        user.password = values.password;

                        this.setState({ user: user });
                    }}>
                    {({ values, errors, handleChange }) => (
                        <View>
                            <View style={[{ borderColor: 'orange', flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={[{ borderColor: 'orange', flex: 1, flexDirection: 'column', justifyContent: 'flex-start' }]}>
                                    <Input errorMessage={errors.name} onChangeText={handleChange('name')} label='Name' placeholder="Name" value={values.name} labelStyle={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }} inputStyle={{ backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 15, borderWidth: 1, color: '#4b4b4b', borderColor: '#DDDEE1' }} inputContainerStyle={{ borderBottomWidth: 0 }} />
                                </View>
                                <View style={[{ flex: 1, flexDirection: 'column' }]}>
                                    <Input errorMessage={errors.surname} onChangeText={handleChange('surname')} label='Surname' placeholder="Surname" value={values.surname} labelStyle={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }} inputStyle={{ backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 12, color: '#4b4b4b', borderWidth: 1, borderColor: '#DDDEE1' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                                </View>
                            </View>
                            <Input errorMessage={errors.email} onChangeText={handleChange('email')} label='E-mail' placeholder="Enter your e-mail" value={values.email} errorStyle={{ color: 'red' }} labelStyle={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }} inputStyle={{ backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 12, color: '#4b4b4b', borderWidth: 1, borderColor: '#DDDEE1' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                            <Input errorMessage={errors.password} onChangeText={handleChange('password')} label='Password' placeholder="Enter your password" value={values.password} errorStyle={{ color: 'red' }} labelStyle={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }} inputStyle={{ backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 12, color: '#4b4b4b', borderWidth: 1, borderColor: '#DDDEE1' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                        </View>
                    )}
                </Formik>
            },
            {
                content: <Formik innerRef={p => (this.formPersonal = p)}
                    initialValues={this.state.user}
                    onSubmit={(values, { setSubmitting }) => {

                        const user = this.state.user;

                        user.address = values.address;
                        user.city = values.city;
                        user.zipCode = values.zipCode;
                        user.state = values.state;
                        user.phone = values.phone;

                        this.setState({ user: user });

                        this.wizard.current.next()
                    }} >
                    {({ values, errors, handleChange }) => (
                        <>
                            <Input errorMessage={errors.address} onChangeText={handleChange('address')} label='Address' placeholder="Address" value={values.address} errorStyle={{ color: 'red' }} labelStyle={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }} inputStyle={{ backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 12, color: '#4b4b4b', borderWidth: 1, borderColor: '#DDDEE1' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                            <Input errorMessage={errors.city} onChangeText={handleChange('city')} label='City' placeholder="City" value={values.city} errorStyle={{ color: 'red' }} labelStyle={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }} inputStyle={{ backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 12, color: '#4b4b4b', borderWidth: 1, borderColor: '#DDDEE1' }} inputContainerStyle={{ borderBottomWidth: 0, }} />

                            <View style={[{ borderColor: 'orange', flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={[{ borderColor: 'orange', flex: 1, flexDirection: 'column', justifyContent: 'flex-start' }]}>
                                    <Input errorMessage={errors.zipCode} onChangeText={handleChange('zipCode')} label='Zip' placeholder="Zip code" value={values.zipCode} labelStyle={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }} inputStyle={{ backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 15, color: '#4b4b4b', borderWidth: 1, borderColor: '#DDDEE1' }} inputContainerStyle={{ borderBottomWidth: 0 }} />
                                </View>
                                <View style={[{ flex: 1, flexDirection: 'column' }]}>
                                    <Input errorMessage={errors.state} onChangeText={handleChange('state')} label='State' placeholder="State" value={values.state} labelStyle={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }} inputStyle={{ backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 12, color: '#4b4b4b', borderWidth: 1, borderColor: '#DDDEE1' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                                </View>
                            </View>
                            <Input errorMessage={errors.phone} onChangeText={handleChange('phone')} label='Phone' placeholder="Phone" value={values.phone} errorStyle={{ color: 'red' }} labelStyle={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }} inputStyle={{ backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 12, color: '#4b4b4b', borderWidth: 1, borderColor: '#DDDEE1' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                        </>
                    )}
                </Formik>
            },
            {
                content: <View style={{ padding: 15 }} >
                    <TouchableOpacity activeOpacity={1} onPress={() => this.setState({ subscrptionIndex: 0 })}>
                        <View style={(this.state.subscrptionIndex == 0) ? (styles.subscriptionSelected) : (styles.subscription)}>
                            <View style={[{ flex: 1, flexDirection: 'column', marginRight: 25, borderRadius: 10, justifyContent: 'center', borderWidth: 1, borderColor: '#2185d0' }]}>
                                <Icon name='calendar-week' type='font-awesome-5' color='#2185d0' />
                            </View>
                            <View style={[{ flex: 3, flexDirection: 'column' }]}>
                                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 5, color: '#2185d0' }}>Annual Plan</Text>
                                <Text style={{ color: 'rgba(0,0,0,0.7)', marginBottom: 5 }}>$99.9 / year</Text>
                                <Text style={{ color: 'rgba(0,0,0,0.7)' }}>Paid yearly</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} onPress={() => this.setState({ subscrptionIndex: 1 })}>
                        <View style={(this.state.subscrptionIndex == 1) ? (styles.subscriptionSelected) : (styles.subscription)}>
                            <View style={[{ flex: 1, flexDirection: 'column', marginRight: 25, borderRadius: 10, justifyContent: 'center', borderWidth: 1, borderColor: '#2185d0' }]}>
                                <Icon name='calendar-day' type='font-awesome-5' color='#2185d0' />
                            </View>
                            <View style={[{ flex: 3, flexDirection: 'column' }]}>
                                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 5, color: '#2185d0' }}>Monthly Plan</Text>
                                <Text style={{ color: 'rgba(0,0,0,0.7)', marginBottom: 5 }}>$9.99 / month</Text>
                                <Text style={{ color: 'rgba(0,0,0,0.7)' }}>Paid monthly</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            },
            {
                content:

                    this.state.isLoading ? (
                        <View style={{ padding: 15, alignItems: 'center' }} >
                            <ActivityIndicator size="large" style={{ marginBottom: 25 }} />
                            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 5, color: '#2185d0' }}>Registering your account.</Text>
                            <Text style={{ color: 'rgba(0,0,0,0.7)', marginBottom: 5 }}>Please wait a minute...</Text>
                        </View>
                    ) : (
                            <View style={{ padding: 15, alignItems: 'center' }} >

                                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 5, color: '#2185d0' }}>Registering your account.</Text>
                                <Text style={{ color: 'rgba(0,0,0,0.7)', marginBottom: 5 }}>Done</Text>
                            </View>
                        )
            }
        ]

        return (
            <KeyboardAvoidingView style={{ padding: 15, backgroundColor: '#f7fafb', flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior="padding" enabled keyboardVerticalOffset={0}>
                <View>
                    <Text style={{ color: 'rgba(0,0,0,0.7)', fontSize: 30, fontWeight: '700', textAlign: "center", paddingBottom: 10 }}>Company Name</Text>

                    {!this.state.isLastStep && (
                        <>
                            {this.state.currentStep == 2 ? (
                                <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 18, fontWeight: '500', textAlign: "center", paddingBottom: 20 }}>Please choose a plan</Text>
                            ) : (
                                    <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 18, fontWeight: '500', textAlign: "center", paddingBottom: 20 }}>Please sign up</Text>
                                )}
                            <Text style={{ alignSelf: 'center', opacity: 0 }}>{this.state.currentStep + 1}. Step</Text>
                        </>
                    )}

                    <Wizard ref={this.wizard} steps={stepList}
                        currentStep={({ currentStep, isLastStep, isFirstStep }) => { this.updateStep({ currentStep, isLastStep, isFirstStep }) }}
                    />
                    {!this.state.isLastStep ? (
                        <View style={[{ margin: 0, marginTop: 5, borderColor: 'orange', flexDirection: 'row', alignItems: 'center', padding: 10 }]}>
                            <View style={[{ flex: 1, flexDirection: 'column', marginRight: 7 }]}>
                                {this.state.isFirstStep ? (
                                    <Button onPress={() => this.context.signIn()} buttonStyle={{ backgroundColor: 'transparent', padding: 10, borderColor: 'rgba(0,0,0,0.33)', borderWidth: 1, borderRadius: 10 }} titleStyle={{ color: 'rgba(0,0,0,0.7)', fontSize: 16 }} title='Back to sign in' />
                                ) : (
                                        <Button onPress={() => this.wizard.current.prev()} buttonStyle={{ backgroundColor: 'transparent', padding: 10, borderColor: 'rgba(0,0,0,0.33)', borderWidth: 1, borderRadius: 10 }} titleStyle={{ color: 'rgba(0,0,0,0.7)', fontSize: 16 }} title='Previous' />
                                    )}
                            </View>
                            <View style={[{ flex: 1, flexDirection: 'column', marginLeft: 7 }]}>
                                {this.state.currentStep == 2 ? (
                                    <Button onPress={() => this.saveUserDetails()} buttonStyle={{ backgroundColor: '#2185d0', padding: 10, borderColor: '#2185d0', borderWidth: 1, borderRadius: 10 }} titleStyle={{ color: 'white', fontSize: 16 }} title='Sign up' />
                                ) : (
                                        <Button onPress={() => this.state.currentForm.handleSubmit()} buttonStyle={{ backgroundColor: '#2185d0', padding: 10, borderColor: '#2185d0', borderWidth: 1, borderRadius: 10 }} titleStyle={{ color: 'white', fontSize: 16 }} title='Next' />
                                    )}
                            </View>
                        </View>
                    ) : (
                            !this.state.isLoading && (
                                <Button onPress={() => this.context.signIn()} buttonStyle={{ backgroundColor: '#2185d0', marginLeft: 50, marginRight: 50, borderColor: '#2185d0', borderWidth: 1, borderRadius: 10 }} titleStyle={{ color: 'white', fontSize: 16 }} title='Get Started' />
                            ))}
                </View>
            </KeyboardAvoidingView>
        );
    }
}

var styles = StyleSheet.create({

    subscription: {

        borderColor: '#2185d0',
        borderWidth: 1,
        borderRadius: 10,
        alignContent: 'center',
        padding: 15,
        marginBottom: 20,
        flexDirection: 'row',
        opacity: 0.33
    },

    subscriptionSelected: {

        borderColor: '#2185d0',
        borderWidth: 1,
        borderRadius: 10,
        alignContent: 'center',
        padding: 15,
        marginBottom: 20,
        flexDirection: 'row'
    }
})