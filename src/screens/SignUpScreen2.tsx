import React from 'react';
import GLOBALS from '../globals';
import { View, Text, KeyboardAvoidingView, ActivityIndicator, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Input, Button, Icon, CheckBox } from 'react-native-elements';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthContext } from '../components/utils/authContext';
import { Formik } from 'formik';
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
    phone: string,
    mobile?: string,
    dateOfBirth?: Date
    dateOfBirthString?: string
}

type Props = {
    navigation: StackNavigationProp<{}>;
}

type agentType = {
    id?: number,
    title: string,
    chosen: boolean
}

type settingsState = {
    user: Person
    isLoading: boolean,
    isFirstStep: boolean,
    isLastStep: boolean,
    currentStep: any,
    isCurrentViewValid: boolean,
    currentForm: any,
    subscriptionIndex?: number
    emailIsfree: boolean,
    checkingEmail: boolean,
    agentTypes: agentType[],
    nonFormValidateError?: string,
    keyboardIsActive: boolean,
    contactAccepted: boolean
}

export class SignUpScreen extends React.Component<Props, settingsState> {

    static contextType = AuthContext;
    formUser: any;
    formPersonal: any;
    formContacts: any;
    formSubscription: any
    wizard: any;

    constructor(props: Props) {
        super(props);

        const agentTypes: agentType[] = [
            { title: 'Medicare Advantage', chosen: false },
            { title: 'Medicare Supplement', chosen: false },
            { title: 'Life', chosen: false },
            { title: 'Annuities', chosen: false },
            { title: 'U65', chosen: false },
            { title: 'Hospital Indemnity', chosen: false },
            { title: 'Dental', chosen: false },
            { title: 'Cancer', chosen: false }
        ];

        this.formUser = React.createRef();
        this.formPersonal = React.createRef();
        this.formContacts = React.createRef();
        this.formSubscription = React.createRef();
        this.wizard = React.createRef();

        this.state = {
            user: { name: '', surname: '', address: '', city: '', state: '', zipCode: '', phone: '', email: '', password: '' },
            isLoading: false,
            isFirstStep: true,
            isLastStep: false,
            currentStep: 0,
            isCurrentViewValid: false,
            currentForm: this.formUser,
            agentTypes: agentTypes,
            emailIsfree: false,
            checkingEmail: false,
            keyboardIsActive: false,
            contactAccepted: true
        }
    }

    async saveUserDetails() {

        //check if a subscription has been selected.
        if (this.state.subscriptionIndex != undefined) {

            this.setState({ isLoading: true })
            this.wizard.current.next();

            const account = this.state.user;

            const date = this.getDateFromString(account.dateOfBirthString!);

            if (date != null)
                account.dateOfBirth = date;

            let subscription = 'annually'

            if (this.state.subscriptionIndex == 1)
                subscription = 'monthly';

            const types: string[] = []

            this.state.agentTypes.forEach(element => {

                if (element.chosen)
                    types.push(element.title);
            });

            try {
                const res = await fetch(GLOBALS.BASE_URL + '/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(
                        { accountData: account, subscription: subscription, agentTypes: types.join(',') }
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
        else
            this.setState({ nonFormValidateError: 'you must choose a subscription' })
    }

    updateStep(step: any) {

        if (step.currentStep == 0)
            this.setState({ currentForm: this.formUser })
        else if (step.currentStep == 1)
            this.setState({ currentForm: this.formPersonal })
        else if (step.currentStep == 2)
            this.setState({ currentForm: this.formContacts })

        this.setState(step)
    }

    getDateFromString(dateToConvert: string): Date | null {

        let date: Date;
        const dateStrings = dateToConvert.split('/');

        if (dateStrings.length != 3)
            return null
        else {
            const day = parseInt(dateStrings[1]);
            const month = parseInt(dateStrings[0]);
            const year = parseInt(dateStrings[2]);

            date = new Date();
            date.setUTCFullYear(year);
            date.setUTCMonth(month - 1,day);
            date.setUTCHours(0);
            date.setUTCMinutes(0);
            date.setUTCSeconds(0);
            date.setUTCMilliseconds(0);

            return date;
        }
    }

    isDateValid(dateToTest: string): boolean {

        if (dateToTest != null) {

            let valid = true;
            const dateStrings = dateToTest.split('/');

            if (dateStrings.length != 3)
                return false
            else {

                const day = parseInt(dateStrings[1]);
                const month = parseInt(dateStrings[0]);
                const year = parseInt(dateStrings[2]);

                console.log(year)

                if (day < 1 || day > 31)
                    valid = false;

                if (month < 1 || month > 12)
                    valid = false;

                if (isNaN(year) || year < 1900 || year > new Date().getFullYear())
                    valid = false;

                return valid;
            }
        } else
            return false;
    }

    validEmail(email: string): boolean {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    async checkIfEmailIsUsed(email: string): Promise<boolean> {

        if (email != null && email != '' && this.validEmail(email)) {
            try {
                const res = await fetch(GLOBALS.BASE_URL + '/api/checkEmailUnique', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email })
                })
                if (res.status === 200) {

                    const data = await res.json();

                    if (data) {

                        const emailCanBeUsed = data.emailIsreadyForUse;

                        if (emailCanBeUsed)
                            this.setState({ emailIsfree: true, checkingEmail: false }, () => {
                                this.formUser.validateForm()
                            })
                        else
                            this.setState({ emailIsfree: false, checkingEmail: true }, () => {
                                this.formUser.validateForm()
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
        return true;
    }

    toggleType(index: number) {

        const agentTypes = [...this.state.agentTypes];

        const agentType = agentTypes[index];

        agentType.chosen = !agentType.chosen;

        this.setState({ agentTypes: agentTypes, nonFormValidateError: '' })
    }

    validateNonForm() {

        if (this.state.currentStep == 3) {

            //check if any types has been selected
            let agentTypeIsValid = false

            this.state.agentTypes.forEach(element => {

                if (element.chosen)
                    agentTypeIsValid = true;
            });

            if (agentTypeIsValid)
                this.setState({ nonFormValidateError: '' }, this.wizard.current.next())
            else
                this.setState({ nonFormValidateError: 'you must choose at lease one option.' })
        }
    }

    render() {

        const stepList = [
            {
                content: <Formik innerRef={p => (this.formUser = p)} enableReinitialize
                    initialValues={{ name: this.state.user.name, surname: this.state.user.surname, email: this.state.user.email, password: this.state.user.password }}
                    validationSchema={Yup.object({
                        name: Yup.string()
                            .min(2, 'Min. 2 characters')
                            .required('Required'),
                        surname: Yup.string()
                            .min(2, 'Min. 2 characters')
                            .required('Required'),
                        email: Yup.string()
                            .required()
                            .min(5)
                            .email()
                            .test('Email is unique',
                                'The email you entered already has an account',
                                email => !(this.state.checkingEmail && !this.state.emailIsfree)
                            ),
                        password: Yup.string()
                            .min(6, 'Min. 6 characters')
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
                                    <Input errorMessage={errors.name} onChangeText={handleChange('name')} label='Name' placeholder="Name"
                                        value={values.name} labelStyle={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }}
                                        inputStyle={{ backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 15, borderWidth: 1, color: '#4b4b4b', borderColor: '#DDDEE1' }}
                                        inputContainerStyle={{ borderBottomWidth: 0 }} />
                                </View>
                                <View style={[{ flex: 1, flexDirection: 'column' }]}>
                                    <Input errorMessage={errors.surname} onChangeText={handleChange('surname')} label='Surname' placeholder="Surname"
                                        value={values.surname} labelStyle={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }}
                                        inputStyle={{ backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 12, color: '#4b4b4b', borderWidth: 1, borderColor: '#DDDEE1' }}
                                        inputContainerStyle={{ borderBottomWidth: 0, }} />
                                </View>
                            </View>
                            <Input errorMessage={errors.email} onEndEditing={() => this.checkIfEmailIsUsed(values.email)}
                                onChangeText={handleChange('email')} label='E-mail' placeholder="Enter your e-mail" value={values.email} errorStyle={{ color: 'red' }} labelStyle={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }}
                                inputStyle={{ backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 12, color: '#4b4b4b', borderWidth: 1, borderColor: '#DDDEE1' }}
                                inputContainerStyle={{ borderBottomWidth: 0, }} keyboardType='email-address' />
                            <Input errorMessage={errors.password} onChangeText={handleChange('password')} label='Password'
                                placeholder="Enter your password" value={values.password} errorStyle={{ color: 'red' }} secureTextEntry labelStyle={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }}
                                inputStyle={{ backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 12, color: '#4b4b4b', borderWidth: 1, borderColor: '#DDDEE1' }}
                                inputContainerStyle={{ borderBottomWidth: 0, }} />
                        </View>
                    )}
                </Formik>
            },
            {
                content: <Formik innerRef={p => (this.formPersonal = p)}
                    initialValues={this.state.user}
                    
                                        validationSchema={Yup.object({
                                            address: Yup.string()
                                                .min(4, 'Min. 4 characters')
                                                .required('Required'),
                                            city: Yup.string()
                                                .min(2, 'Min. 2 characters')
                                                .required('Required'),
                                            zipCode: Yup.string()
                                                .min(2, 'Min. 2 characters')
                                                .required('Required'),
                                            state: Yup.string()
                                                .min(2, 'Min. 2 characters')
                                                .required('Required')
                                        })}
                    
                    onSubmit={(values, { setSubmitting }) => {

                        const user = this.state.user;

                        user.address = values.address;
                        user.city = values.city;
                        user.zipCode = values.zipCode;
                        user.state = values.state;

                        this.setState({ user: user });

                        this.wizard.current.next()
                    }} >
                    {({ values, errors, handleChange }) => (
                        <>
                            <Input errorMessage={errors.address} onChangeText={handleChange('address')} label='Address' placeholder="Address" value={values.address} errorStyle={{ color: 'red' }} labelStyle={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }} inputStyle={{ backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 12, color: '#4b4b4b', borderWidth: 1, borderColor: '#DDDEE1' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                            <Input errorMessage={errors.city} onChangeText={handleChange('city')} label='City' placeholder="City" value={values.city} errorStyle={{ color: 'red' }} labelStyle={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }} inputStyle={{ backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 12, color: '#4b4b4b', borderWidth: 1, borderColor: '#DDDEE1' }} inputContainerStyle={{ borderBottomWidth: 0, }} />

                            <View style={[{ borderColor: 'orange', flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={[{ borderColor: 'orange', flex: 1, flexDirection: 'column', justifyContent: 'flex-start' }]}>
                                    <Input errorMessage={errors.zipCode} onChangeText={handleChange('zipCode')} keyboardType='phone-pad' label='Zip Code' placeholder="Zip code" value={values.zipCode} labelStyle={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }} inputStyle={{ backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 15, color: '#4b4b4b', borderWidth: 1, borderColor: '#DDDEE1' }} inputContainerStyle={{ borderBottomWidth: 0 }} />
                                </View>
                                <View style={[{ flex: 1, flexDirection: 'column' }]}>
                                    <Input errorMessage={errors.state} onChangeText={handleChange('state')} label='State' placeholder="State" value={values.state} labelStyle={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }} inputStyle={{ backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 12, color: '#4b4b4b', borderWidth: 1, borderColor: '#DDDEE1' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                                </View>
                            </View>
                        </>
                    )}
                </Formik>
            },
            {
                content: <Formik innerRef={p => (this.formContacts = p)}
                    initialValues={this.state.user}

                    validationSchema={Yup.object({
                        phone: Yup.string()
                            .min(8, 'Min. 8 characters')
                            .required('Required'),
                        mobile: Yup.string()
                            .min(8, 'Min. 8 characters')
                            .required('Required'),
                        dateOfBirthString: Yup.string()
                            .required('Required')
                            .test('test date', 'Date must be in the format of: MM/DD/YYYY', value => this.isDateValid(value!))
                    })}

                    onSubmit={(values, { setSubmitting }) => {

                        const user = this.state.user;

                        user.phone = values.phone;
                        user.mobile = values.mobile;
                        user.dateOfBirthString = values.dateOfBirthString;

                        this.setState({ user: user });
                        this.wizard.current.next()
                    }} >
                    {({ values, errors, handleChange, setFieldValue }) => (
                        <>
                            <Input errorMessage={errors.phone} onChangeText={handleChange('phone')} keyboardType='phone-pad' label='Phone' placeholder="Phone" value={values.phone} errorStyle={{ color: 'red' }} labelStyle={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }} inputStyle={{ backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 12, color: '#4b4b4b', borderWidth: 1, borderColor: '#DDDEE1' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                            <Input errorMessage={errors.mobile} onChangeText={handleChange('mobile')} keyboardType='phone-pad' label='Mobile phone' placeholder="Mobile Phone" value={values.mobile} errorStyle={{ color: 'red' }} labelStyle={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }} inputStyle={{ backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 12, color: '#4b4b4b', borderWidth: 1, borderColor: '#DDDEE1' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                            <Input errorMessage={errors.dateOfBirthString} onChangeText={handleChange('dateOfBirthString')} keyboardType='numbers-and-punctuation' label='Date of birthday' placeholder="MM/DD/YYYY" value={values.dateOfBirthString} errorStyle={{ color: 'red' }} labelStyle={{ color: 'rgba(0,0,0,0.6)', fontSize: 14 }} inputStyle={{ backgroundColor: 'white', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 12, color: '#4b4b4b', borderWidth: 1, borderColor: '#DDDEE1' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                        </>
                    )}
                </Formik>
            },
            {
                content: <View style={{ marginLeft: 10, marginRight: 10, padding: 10, backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: '#DDDEE1' }} >

                    {this.state.agentTypes.map((type, index) => (
                        <CheckBox key={index} checked={type.chosen} title={type.title} onPress={() => this.toggleType(index)} checkedIcon='dot-circle-o' uncheckedIcon='circle-o' containerStyle={styles.typeCheckbox} />
                    ))}
                </View>
            },
            {
                content: <View style={{ padding: 15 }} >
                    <TouchableOpacity activeOpacity={1} onPress={() => this.setState({ subscriptionIndex: 0, nonFormValidateError: '' })}>
                        <View style={(this.state.subscriptionIndex == 0) ? (styles.subscriptionSelected) : (styles.subscription)}>
                            <View style={[{ flex: 1, flexDirection: 'column', marginRight: 25, borderRadius: 10, justifyContent: 'center', borderWidth: 1, borderColor: '#2185d0' }]}>
                                <Icon name='calendar-week' type='font-awesome-5' color='#2185d0' />
                            </View>
                            <View style={[{ flex: 3, flexDirection: 'column' }]}>
                                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 5, color: '#2185d0' }}>Annual Plan</Text>
                                <Text style={{ color: 'rgba(0,0,0,0.7)', marginBottom: 5 }}>$149.99 / year</Text>
                                <Text style={{ color: 'rgba(0,0,0,0.7)' }}>Paid yearly</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} onPress={() => this.setState({ subscriptionIndex: 1, nonFormValidateError: '' })}>
                        <View style={(this.state.subscriptionIndex == 1) ? (styles.subscriptionSelected) : (styles.subscription)}>
                            <View style={[{ flex: 1, flexDirection: 'column', marginRight: 25, borderRadius: 10, justifyContent: 'center', borderWidth: 1, borderColor: '#2185d0' }]}>
                                <Icon name='calendar-day' type='font-awesome-5' color='#2185d0' />
                            </View>
                            <View style={[{ flex: 3, flexDirection: 'column' }]}>
                                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 5, color: '#2185d0' }}>Monthly Plan</Text>
                                <Text style={{ color: 'rgba(0,0,0,0.7)', marginBottom: 5 }}>$14.99 / month</Text>
                                <Text style={{ color: 'rgba(0,0,0,0.7)' }}>Paid monthly</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', backgroundColor: 'transparent', borderColor: '#2185d0', borderRadius: 5 }}>
                        <View style={[{ flexDirection: 'column' }]}>
                            <CheckBox wrapperStyle={{ margin: 0, padding: 0 }} onPress={() => this.setState({ contactAccepted: !this.state.contactAccepted })} checked={this.state.contactAccepted} containerStyle={{ backgroundColor: 'transparent', borderRadius: 5, borderWidth: 0 }} />
                        </View>
                        <View style={[{ flexDirection: 'column', justifyContent: 'center' }]}>
                            <Text style={{ lineHeight: 20 }}>By signing up you agree to the T65</Text>
                            <Text style={{ color: '#2185d0' }}>Privacy Policy</Text>
                        </View>
                    </View>
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
            <KeyboardAvoidingView style={{ paddingLeft: 15, paddingRight: 15, backgroundColor: '#f7fafb', flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior="padding" enabled keyboardVerticalOffset={0}>
                <StatusBar barStyle='dark-content' />
                <View style={(this.state.currentStep == 1) && ({ marginTop: -80 })}>
                    <Text style={{ color: 'rgba(0,0,0,0.7)', fontSize: 30, fontWeight: '700', textAlign: "center", paddingTop: 50 }}>T65 Locator</Text>
                    {!this.state.isLastStep && (
                        this.state.currentStep == 3 ? (
                            <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 18, fontWeight: '500', textAlign: "center", paddingBottom: 20 }}>Please choose a plan</Text>
                        ) : (
                                <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 18, fontWeight: '500', textAlign: "center", paddingBottom: 20 }}>Please sign up</Text>
                            )
                    )}
                    <Wizard ref={this.wizard} steps={stepList}
                        currentStep={({ currentStep, isLastStep, isFirstStep }) => { this.updateStep({ currentStep, isLastStep, isFirstStep }) }}
                    />
                    {!this.state.isLastStep ? (
                        <View style={[{ margin: 0, marginTop: 5, borderColor: 'orange', flexDirection: 'row', alignItems: 'center', padding: 10 }]}>
                            <View style={[{ flex: 1, flexDirection: 'column', marginRight: 7 }]}>
                                {this.state.isFirstStep ? (
                                    <Button onPress={() => this.context.signIn()}
                                        buttonStyle={{ backgroundColor: 'transparent', padding: 10, borderColor: 'rgba(0,0,0,0.33)', borderWidth: 1, borderRadius: 10 }}
                                        titleStyle={{ color: 'rgba(0,0,0,0.7)', fontSize: 16 }} title='Back to sign in' />
                                ) : (
                                        <Button onPress={() => this.wizard.current.prev()}
                                            buttonStyle={{ backgroundColor: 'transparent', padding: 10, borderColor: 'rgba(0,0,0,0.33)', borderWidth: 1, borderRadius: 10 }}
                                            titleStyle={{ color: 'rgba(0,0,0,0.7)', fontSize: 16 }} title='Previous' />
                                    )}
                            </View>
                            <View style={[{ flex: 1, flexDirection: 'column', marginLeft: 7 }]}>
                                {this.state.currentStep == 4 ? (
                                    <Button onPress={() => this.saveUserDetails()} disabled={!this.state.contactAccepted}
                                        buttonStyle={{ backgroundColor: '#2185d0', padding: 10, borderColor: '#2185d0', borderWidth: 1, borderRadius: 10 }}
                                        titleStyle={{ color: 'white', fontSize: 16 }} title='Sign up' />
                                ) : (
                                        <View>
                                            {this.state.currentStep == 3 || this.state.currentStep == 4 ? (
                                                <>
                                                    <Button onPress={() => this.validateNonForm()}
                                                        buttonStyle={{ backgroundColor: '#2185d0', padding: 10, borderColor: '#2185d0', borderWidth: 1, borderRadius: 10 }}
                                                        titleStyle={{ color: 'white', fontSize: 16 }} title='Next' />
                                                </>
                                            ) : (
                                                    <Button onPress={() => this.state.currentForm.handleSubmit()}
                                                        buttonStyle={{ backgroundColor: '#2185d0', padding: 10, borderColor: '#2185d0', borderWidth: 1, borderRadius: 10 }}
                                                        titleStyle={{ color: 'white', fontSize: 16 }} title='Next' />
                                                )}
                                        </View>
                                    )}
                            </View>

                        </View>
                    ) : (
                            !this.state.isLoading && (
                                <Button onPress={() => this.context.signIn()}
                                    buttonStyle={{ backgroundColor: '#2185d0', marginLeft: 50, marginRight: 50, borderColor: '#2185d0', borderWidth: 1, borderRadius: 10 }}
                                    titleStyle={{ color: 'white', fontSize: 16 }} title='Get Started' />
                            ))}
                </View>
                <Text style={{ color: 'red', textAlign: 'center' }}>{this.state.nonFormValidateError}</Text>
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
    },

    typeCheckbox:
    {
        padding: 2,
        borderWidth: 0,
        backgroundColor: 'white'
    }
})