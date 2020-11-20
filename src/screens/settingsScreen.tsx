import React from 'react';
import { View, Text, Alert, Modal, ActivityIndicator } from 'react-native';
import GLOBALS from '../globals';
import { Button, Card, Input } from 'react-native-elements';
import { StackNavigationProp, createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../components/utils/authContext';
import { Formik } from 'formik';
import * as Yup from 'yup';

const SettingsStack = createStackNavigator();

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

    static contextType = AuthContext;
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
            headerTintColor: '#fff',
            headerStyle: { backgroundColor: '#2185d0' },
            headerLeft: () => (
                <Button title='Sign out' onPress={() => this.signout()} style={{ paddingLeft: 5 }} type='clear' titleStyle={{ color: 'white' }} />
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
                            mobile:data.user.mobile
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
                        .integer('must be a number')
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

                                    <Input errorMessage={errors.name} onChangeText={handleChange('name')} label='Name' placeholder="Name" value={values.name} labelStyle={{ fontSize: 12 }} inputStyle={{ borderWidth: 1, borderRadius: 5, padding: 5, marginTop: 2, paddingLeft: 12, borderColor: 'lightgray', color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0 }} />

                                </View>
                                <View style={[{ flex: 1, flexDirection: 'column' }]}>

                                    <Input errorMessage={errors.surname} onChangeText={handleChange('surname')} label='Surname' placeholder="Surname" value={values.surname} labelStyle={{ fontSize: 12 }} inputStyle={{ borderWidth: 1, borderRadius: 5, padding: 5, marginTop: 2, paddingLeft: 12, borderColor: 'lightgray', color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0, }} />

                                </View>
                            </View>
                            <Input errorMessage={errors.address} onChangeText={handleChange('address')} label='Address' placeholder="Address" value={values.address} errorStyle={{ color: 'red' }} labelStyle={{ fontSize: 12 }} inputStyle={{ borderWidth: 1, borderRadius: 5, padding: 5, marginTop: 2, paddingLeft: 12, borderColor: 'lightgray', color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                            <Input errorMessage={errors.city} onChangeText={handleChange('city')} label='City' placeholder="City" value={values.city} errorStyle={{ color: 'red' }} labelStyle={{ fontSize: 12 }} inputStyle={{ borderWidth: 1, borderRadius: 5, padding: 5, marginTop: 2, paddingLeft: 12, borderColor: 'lightgray', color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                            <View style={[{ borderColor: 'orange', flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={[{ flex: 2, flexDirection: 'column' }]}>
                                    <Input errorMessage={errors.state} onChangeText={handleChange('state')} label='State' placeholder="State" value={values.state} errorStyle={{ color: 'red' }} labelStyle={{ fontSize: 12 }} inputStyle={{ borderWidth: 1, borderRadius: 5, padding: 5, marginTop: 2, paddingLeft: 12, borderColor: 'lightgray', color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                                </View>
                                <View style={[{ flex: 1, flexDirection: 'column' }]}>
                                    <Input errorMessage={errors.zipCode} onChangeText={handleChange('zipCode')} label='Zip' placeholder="Zip" value={values.zipCode} errorStyle={{ color: 'red' }} labelStyle={{ fontSize: 12 }} inputStyle={{ borderWidth: 1, borderRadius: 5, padding: 5, marginTop: 2, paddingLeft: 12, borderColor: 'lightgray', color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                                </View>
                            </View>
                            <Input errorMessage={errors.email} onChangeText={handleChange('email')} label='E-mail' placeholder="E-mail" value={values.email} errorStyle={{ color: 'red' }} labelStyle={{ fontSize: 12 }} inputStyle={{ borderWidth: 1, borderRadius: 5, padding: 5, marginTop: 2, paddingLeft: 12, borderColor: 'lightgray', color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                            <Input errorMessage={errors.phone} onChangeText={handleChange('phone')} label='Phone' placeholder="Phone number" value={values.phone} errorStyle={{ color: 'red' }} labelStyle={{ fontSize: 12 }} inputStyle={{ borderWidth: 1, borderRadius: 5, padding: 5, marginTop: 2, paddingLeft: 12, borderColor: 'lightgray', color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                            <Input errorMessage={errors.mobile} onChangeText={handleChange('mobile')} label='Mobile' placeholder="Mobile number" value={values.mobile} errorStyle={{ color: 'red' }} labelStyle={{ fontSize: 12 }} inputStyle={{ borderWidth: 1, borderRadius: 5, padding: 5, marginTop: 2, paddingLeft: 12, borderColor: 'lightgray', color: '#4b4b4b' }} inputContainerStyle={{ borderBottomWidth: 0, }} />
                            <View style={[{ margin: 0, marginTop: -15, borderColor: 'orange', flexDirection: 'row', alignItems: 'center', padding: 10, paddingBottom: 20 }]}>
                                <View style={[{ flex: 1, flexDirection: 'column', marginRight: 7 }]}>

                                    <Button onPress={() => this.setModalVisible(true)} buttonStyle={{ backgroundColor: 'gray', padding: 15, borderRadius: 10 }} titleStyle={{ color: 'white', fontSize: 16 }} title='Change Password' />
                                </View>
                                <View style={[{ flex: 1, flexDirection: 'column', marginLeft: 7 }]}>

                                    <Button loading={this.state.isLoading} onPress={() => this.form.handleSubmit()} buttonStyle={{ backgroundColor: '#2185d0', padding: 15, borderRadius: 10 }} titleStyle={{ color: 'white', fontSize: 16 }} title='Save Profile' />
                                </View>
                            </View>

                        </Card>

                        <Modal animationType="slide" presentationStyle='formSheet' visible={this.state.modalVisible} >
                            <View>
                                <View style={[{ paddingBottom: 10, paddingTop: 10, paddingLeft: 0, paddingRight: 0, flexDirection: 'row', alignItems: 'center', backgroundColor: '#2185d0', alignContent: 'center' }]}>
                                    <View style={{ flex: 1, flexDirection: 'column' }}>
                                        <Button type='clear' titleStyle={{ color: 'white' }} title='Cancel' onPress={() => { this.setModalVisible(!this.state.modalVisible); }} />
                                    </View>
                                    <View style={{ flex: 2, flexDirection: 'column' }}>
                                        <Text style={{ alignSelf: 'center', fontWeight: '500', fontSize: 18, color: 'white' }}>Change password</Text>
                                    </View>
                                    <View style={{ flex: 1, flexDirection: 'column', alignContent: 'flex-end' }}>
                                        <Button loading={this.state.isLoading} type='clear' titleStyle={{ color: 'white' }} buttonStyle={{ borderRadius: 10, padding: 15 }} title='Save' onPress={() => { this.PasswordForm.handleSubmit(); }} />
                                    </View>
                                </View>

                                <Formik innerRef={p => (this.PasswordForm = p)}
                                    initialValues={{ password: '', newPassword: '', newPassConfirm: '' }}
                                    onSubmit={values => this.updateUserPassword(values.password, values.newPassword)}
                                    validationSchema={Yup.object({
                                        password: Yup.string()
                                            .min(1, 'Minimum 1 characters')
                                            .required('Required'),
                                        newPassword: Yup.string()
                                            .min(1, 'Minimum 1 characters')
                                            .required('Required'),
                                        newPassConfirm: Yup.string()
                                            .min(1, 'Minimum 6 characters')
                                            .required('Required')
                                            .test('passwords-match', 'Passwords must match ya fool', function (value) {
                                                return this.parent.newPassword === value;
                                            }),
                                    })}>
                                    {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
                                        <Card containerStyle={{ padding: 15, margin: 0, borderWidth: 0 }}>
                                            <Input secureTextEntry={true} autoCapitalize='none' errorMessage={errors.password} onChangeText={handleChange('password')} label='Current Password' placeholder="Enter Current Password" value={values.password} />
                                            <Input secureTextEntry={true} autoCapitalize='none' errorMessage={errors.newPassword} onChangeText={handleChange('newPassword')} label='New Password' placeholder="Enter New Password" value={values.newPassword} />
                                            <Input secureTextEntry={true} autoCapitalize='none' errorMessage={errors.newPassConfirm} onChangeText={handleChange('newPassConfirm')} label='Confirm New Password' placeholder="re-enter new password" value={values.newPassConfirm} />
                                        </Card>
                                    )}
                                </Formik>

                            </View>
                        </Modal>
                    </View>
                )}
            </Formik>
        );
    }
}

export function SettingsStackScreen() {
    return (
        <SettingsStack.Navigator>
            <SettingsStack.Screen name="Account" component={SettingsScreen} />
        </SettingsStack.Navigator>
    );
}