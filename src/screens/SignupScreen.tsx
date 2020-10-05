import React, { useEffect, useState, useContext } from 'react';
import GLOBALS from '../globals';
import { View, Text, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Input, Card, Button } from 'react-native-elements';
import { StackNavigationProp } from '@react-navigation/stack';

import { Formik } from 'formik';
import * as Yup from 'yup';

type settingsState = {
    user: User
    isLoading: boolean
}

type User = {
    name: string,
    surname: string,
    address: string,
    city: string,
    state: string,
    zipCode: string
    email: string,
    phone: string
}

type Props = {
    navigation: StackNavigationProp<{}>;
};

export default class SignUpScreen extends React.Component<Props, settingsState> {

    form: any;

    constructor(props: Props) {
        super(props);

        this.form = React.createRef();

        this.state = { user: { name: '', surname: '', address: '', city: '', state: '', zipCode: '', email: '', phone: '' }, isLoading: false, }
    }

    async saveUserDetails(user: User) {

        console.log(user)

        try {
            const res = await fetch(GLOBALS.BASE_URL + '/api/client/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    { user }
                ),
            })
            if (res.status === 200) {

                const responseData = await res.json();

                Alert.alert('Your new details was saved.')
            }
            else {

            }
        }
        catch (error) {
            console.error('An unexpected error happened occurred:', error)
            //setErrorMsg(error.message)
        }
    }

    render() {
        return (
            <KeyboardAvoidingView style={{ padding: 15, backgroundColor: '#2185d0', flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior="padding" enabled keyboardVerticalOffset={0}>
                <Formik innerRef={p => (this.form = p)} enableReinitialize initialValues={this.state.user}


                    validationSchema={Yup.object({
                        name: Yup.string()
                            .min(2, 'Minimum 2 characters')
                            .required('Required'),
                        surname: Yup.string()
                            .min(2, 'Minimum 2 characters')
                            .required('Required'),
                        address: Yup.string()
                            .min(6, 'Minimum 6 characters')
                            .required('Required'),
                        city: Yup.string()
                            .min(2, 'Minimum 2 characters')
                            .required('Required'),
                        state: Yup.string()
                            .min(3, 'Minimum 3 characters')
                            .required('Required'),
                        zipCode: Yup.number()
                            .min(2, 'Minimum 4 characters')
                            .required('Required')
                            .integer('must be a number')
                    })}
                    onSubmit={values => this.saveUserDetails(values)}>
                    {({ handleChange, handleBlur, handleSubmit, values, touched, errors }) => (
                        <>
                            <View>
                            <Text style={{ color: 'white', fontSize: 30, fontWeight: '700', textAlign: "center", paddingBottom: 10 }}>Company Name</Text>
                            <Text style={{ color: 'white', fontSize: 18, fontWeight: '500', textAlign: "center", paddingBottom: 20 }}>Please sign up</Text>
                            </View>
                            <View style={[{ borderColor: 'orange', flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={[{ borderColor: 'orange', flex: 1, flexDirection: 'column', justifyContent: 'flex-start' }]}>
                                    <Input errorMessage={errors.name} onChangeText={handleChange('name')} label='Name' placeholder="Name" value={values.name} labelStyle={{ color: 'white', fontSize: 14 }}  inputStyle={{ backgroundColor: 'rgba(255,255,255,1)', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 15, color: 'white', borderWidth: 0, borderColor: 'rgba(255,255,255,0.5)' }} inputContainerStyle={{ borderBottomWidth: 0 }} />
                                </View>
                                <View style={[{ flex: 1, flexDirection: 'column' }]}>
                                    <Input errorMessage={errors.surname} onChangeText={handleChange('surname')} label='Surname' placeholder="Surname" value={values.surname} labelStyle={{ color: 'white', fontSize: 14 }} inputStyle={{backgroundColor: 'rgba(255,255,255,1)', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 12, color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                                </View>
                            </View>
                            <Input errorMessage={errors.address} onChangeText={handleChange('address')} label='E-mail' placeholder="Enter your e-mail" value={values.address} errorStyle={{ color: 'red' }} labelStyle={{ color: 'white', fontSize: 14 }} inputStyle={{ backgroundColor:'rgba(255,255,255,1)', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 12, color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                            <Input errorMessage={errors.city} onChangeText={handleChange('city')} label='Password' placeholder="Enter your password" value={values.city} errorStyle={{ color: 'red' }} labelStyle={{ color: 'white', fontSize: 14 }} inputStyle={{  backgroundColor: 'rgba(255,255,255,1)', borderRadius: 5, padding: 10, marginTop: 2, paddingLeft: 12, color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                            <View style={[{ margin: 0, marginTop: 5, borderColor: 'orange', flexDirection: 'row', alignItems: 'center', padding: 10 }]}>
                                <View style={[{ flex: 1, flexDirection: 'column', marginRight: 7 }]}>

                                    <Button onPress={() => this.props.navigation} buttonStyle={{ backgroundColor: 'transparent', padding: 10, borderColor: 'white', borderWidth: 1, borderRadius: 10 }} titleStyle={{ color: 'white', fontSize: 16 }} title='Back to sign in' />
                                </View>
                                <View style={[{ flex: 1, flexDirection: 'column', marginLeft: 7 }]}>

                                    <Button onPress={() => this.form.handleSubmit()} buttonStyle={{ backgroundColor: 'black', padding: 10, borderColor: 'black', borderWidth: 1, borderRadius: 10 }} titleStyle={{ color: 'white', fontSize: 16 }} title='Next' />
                                </View>
                            </View>
                        </>
                    )}
                </Formik>

            </KeyboardAvoidingView>
        );
    }
}