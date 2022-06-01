import React from 'react';
import { View, Text, Alert, Modal, ActivityIndicator,ScrollView } from 'react-native';
import GLOBALS from '../globals';
import { Button, Card, Input } from 'react-native-elements';
import { StackNavigationProp, createStackNavigator } from '@react-navigation/stack';
import { AppContext } from '../components/utils/appContext';
import { Formik } from 'formik';
import * as Yup from 'yup';

type settingsState = {
    user: User
    isLoading: boolean,
    accountDetailsIsValid: boolean,
    modalVisible: boolean
}

type User = {
    name: string,
    surname: string,
    address: string,
    city: string,
    state: string,
    zipCode: string
    email: string,
    phone: string,
    mobile: string
}

type SettingsProps = {
    navigation: StackNavigationProp<{}>;
};

export class SettingsScreen extends React.Component<SettingsProps, settingsState> {

    declare context: React.ContextType<typeof AppContext>
    form: any;
    PasswordForm: any;

    constructor(props: SettingsProps) {
        super(props)

        this.form = React.createRef();
        this.PasswordForm = React.createRef();

        this.state = { user: { name: '', surname: '', address: '', city: '', state: '', zipCode: '', email: '', phone: '', mobile: '' }, isLoading: true, accountDetailsIsValid: true, modalVisible: false }
    }

    componentDidMount() {

        this.props.navigation.setOptions({
            headerShown: true,
            title:'Personal',
            headerTintColor: '#fff',
            headerTitleAlign:'center',
            headerStyle: { backgroundColor: '#2185d0' },
            headerRight: () => (
                <Button title='Save' onPress={() => this.form.handleSubmit()} style={{ paddingLeft: 5 }} type='clear' titleStyle={{ color: 'white' }} />
            )
        })

        this.getUser();
    }

    signout() {

        Alert.alert(
            'Sign out',
            'Are you sure you want to sign out?',
            [
                {
                    text: 'No',
                    style: 'cancel'
                },
                { text: 'Yes', onPress: () => this.context.signOut() }
            ],
            { cancelable: false }
        );
    }

    async getUser() {

        this.setState({ isLoading: true })

        try {
            const res = await fetch(GLOBALS.BASE_URL + '/api/client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            })

            this.setState({ isLoading: false })

            if (res.status === 200) {

                const data = await res.json();

                if (data) {

                    this.setState({
                        user: {
                            name: data.user.name,
                            surname: data.user.surname,
                            address: data.user.address,
                            city: data.user.city,
                            state: data.user.state,
                            zipCode: data.user.zipCode,
                            email: data.user.email,
                            phone: data.user.phone,
                            mobile: data.user.mobile
                        }
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

    async saveUserDetails(user: User) {

        this.setState({ isLoading: true })

        try {
            const res = await fetch(GLOBALS.BASE_URL + '/api/client/updateDetails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    { user }
                ),
            })

            this.setState({ isLoading: false })

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

    async updateUserPassword(password: string, newPassword: string) {

        try {
            const res = await fetch(GLOBALS.BASE_URL + '/api/client/updatePassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    { currentPass: password, newPass: newPassword }
                ),
            })
            if (res.status === 200) {

                this.setModalVisible(false);
            }
            else {
                Alert.alert('error happened.')
            }
        }
        catch (error) {
            console.error('An unexpected error happened occurred:', error)
            //setErrorMsg(error.message)
        }
    }

    setModalVisible(visible: boolean) {
        this.setState({ modalVisible: visible });
    }

    render() {

        //const buttons = ['Map', 'List']
        const context = this.context;

        return (
            <ScrollView>
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
                        .min(2, 'Minimum 2 characters')
                        .required('Required'),
                    zipCode: Yup.number()
                        .min(2, 'Minimum 4 characters')
                        .required('Required')
                        .integer('must be a number'),

                    phone: Yup.string()
                        .min(8, 'Min. 8 characters')
                        .required('Required'),
                    mobile: Yup.string()
                        .min(8, 'Min. 8 characters')
                        .required('Required'),
                })}
                onSubmit={values => this.saveUserDetails(values)}>
                {({ handleChange, handleBlur, handleSubmit, values, touched, errors }) => (

                    <View style={{ backgroundColor: 'white', borderWidth: 0, shadowRadius: 0 }}>
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
                        <Card wrapperStyle={{ borderWidth: 0, shadowRadius: 0 }} containerStyle={{ borderWidth: 0, margin: 0, paddingTop: 15, paddingLeft: 5, paddingRight: 5, paddingBottom: 0, shadowRadius: 0 }}>
                            <View style={[{ borderColor: 'orange', flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={[{ borderColor: 'orange', flex: 1, flexDirection: 'column', justifyContent: 'flex-start' }]}>

                                    <Input autoCompleteType={undefined} errorMessage={errors.name} onChangeText={handleChange('name')} label='Name' placeholder="Name" value={values.name} labelStyle={{ fontSize: 12 }} inputStyle={{ borderWidth: 1, borderRadius: 5, padding: 5, marginTop: 2, paddingLeft: 12, borderColor: 'lightgray', color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0 }} />

                                </View>
                                <View style={[{ flex: 1, flexDirection: 'column' }]}>

                                    <Input autoCompleteType={undefined} errorMessage={errors.surname} onChangeText={handleChange('surname')} label='Last Name' placeholder="Last Name" value={values.surname} labelStyle={{ fontSize: 12 }} inputStyle={{ borderWidth: 1, borderRadius: 5, padding: 5, marginTop: 2, paddingLeft: 12, borderColor: 'lightgray', color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0, }} />

                                </View>
                            </View>
                            <Input autoCompleteType={undefined} errorMessage={errors.address} onChangeText={handleChange('address')} label='Address' placeholder="Address" value={values.address} errorStyle={{ color: 'red' }} labelStyle={{ fontSize: 12 }} inputStyle={{ borderWidth: 1, borderRadius: 5, padding: 5, marginTop: 2, paddingLeft: 12, borderColor: 'lightgray', color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                            <Input autoCompleteType={undefined} errorMessage={errors.city} onChangeText={handleChange('city')} label='City' placeholder="City" value={values.city} errorStyle={{ color: 'red' }} labelStyle={{ fontSize: 12 }} inputStyle={{ borderWidth: 1, borderRadius: 5, padding: 5, marginTop: 2, paddingLeft: 12, borderColor: 'lightgray', color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                            <View style={[{ borderColor: 'orange', flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={[{ flex: 2, flexDirection: 'column' }]}>
                                    <Input autoCompleteType={undefined} errorMessage={errors.state} onChangeText={handleChange('state')} label='State' placeholder="State" value={values.state} errorStyle={{ color: 'red' }} labelStyle={{ fontSize: 12 }} inputStyle={{ borderWidth: 1, borderRadius: 5, padding: 5, marginTop: 2, paddingLeft: 12, borderColor: 'lightgray', color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                                </View>
                                <View style={[{ flex: 1, flexDirection: 'column' }]}>
                                    <Input autoCompleteType={undefined} errorMessage={errors.zipCode} onChangeText={handleChange('zipCode')} label='Zip' placeholder="Zip" value={values.zipCode} errorStyle={{ color: 'red' }} labelStyle={{ fontSize: 12 }} inputStyle={{ borderWidth: 1, borderRadius: 5, padding: 5, marginTop: 2, paddingLeft: 12, borderColor: 'lightgray', color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                                </View>
                            </View>
                            <Input autoCompleteType={undefined} disabled errorMessage={errors.email} onChangeText={handleChange('email')} label='E-mail' placeholder="E-mail" value={values.email} errorStyle={{ color: 'red' }} labelStyle={{ fontSize: 12 }} inputStyle={{ borderWidth: 1, borderRadius: 5, padding: 5, marginTop: 2, paddingLeft: 12, borderColor: 'lightgray', color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                            <Input autoCompleteType={undefined} errorMessage={errors.phone} onChangeText={handleChange('phone')} label='Phone' placeholder="Phone number" value={values.phone} errorStyle={{ color: 'red' }} labelStyle={{ fontSize: 12 }} inputStyle={{ borderWidth: 1, borderRadius: 5, padding: 5, marginTop: 2, paddingLeft: 12, borderColor: 'lightgray', color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                            <Input autoCompleteType={undefined} errorMessage={errors.mobile} onChangeText={handleChange('mobile')} label='Mobile' placeholder="Mobile number" value={values.mobile} errorStyle={{ color: 'red' }} labelStyle={{ fontSize: 12 }} inputStyle={{ borderWidth: 1, borderRadius: 5, padding: 5, marginTop: 2, paddingLeft: 12, borderColor: 'lightgray', color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                        </Card>
                    </View>
                )}
            </Formik>
            </ScrollView>
        );
    }
}