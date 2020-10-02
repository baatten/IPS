import React from 'react';
import { View, Text, Alert, Modal, TouchableHighlight } from 'react-native';
import GLOBALS from '../globals';
import { Button, Card, Input } from 'react-native-elements';
import { StackNavigationProp, createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../components/utils/authContext';
import { ScrollView } from 'react-native-gesture-handler';
import { Formik, FormikBag } from 'formik';

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
    email: string
}

type Props = {
    navigation: StackNavigationProp<{}>;
};

export class SettingsScreen extends React.Component<Props, settingsState> {

    static contextType = AuthContext;
    form: any;
    PasswordForm: any;

    constructor(props: Props) {
        super(props)

        this.form = React.createRef();
        this.PasswordForm = React.createRef();

        this.props.navigation.setOptions({
            headerShown: true,
            headerTintColor: '#fff',
            headerStyle: { backgroundColor: '#2185d0' },
            headerRight: () => (
                <Button title='Save' onPress={() => this.form.handleSubmit()} style={{ paddingRight: 5 }} type='clear' titleStyle={{ color: 'white' }} />
            ),
            headerLeft: () => (
                <Button title='Sign out' onPress={() => this.signout()} style={{ paddingLeft: 5 }} type='clear' titleStyle={{ color: 'white' }} />
            )
        })

        this.state = { user: { name: '', surname: '', address: '', city: '', state: '', zipCode: '', email: '' }, isLoading: false, accountDetailsIsValid: true, modalVisible: false }
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

        try {
            const res = await fetch(GLOBALS.BASE_URL + '/api/client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            })
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
                            email: data.user.email
                        }
                    })
                    console.log(data)
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

        //console.log('testing saveuserdetails');
        //console.log(user);

        try {
            const res = await fetch(GLOBALS.BASE_URL + '/api/client/updateDetails', {
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

    async updateUserPassword(password: string, newPassword: string) {

        console.log('trying to change password')

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

    accountDetailsIsValid() {

        if (this.state.user.name.length > 0 &&
            this.state.user.surname.length > 0 &&
            this.state.user.address.length > 0 &&
            this.state.user.city.length > 0 &&
            this.state.user.state.length > 0 &&
            this.state.user.zipCode.length > 0) {
            this.setState({ accountDetailsIsValid: true });
        }
        else
            this.setState({ accountDetailsIsValid: false });
    }

    render() {

        //const buttons = ['Map', 'List']
        const context = this.context;

        return (
            <Formik innerRef={p => (this.form = p)} enableReinitialize initialValues={this.state.user} onSubmit={values => this.saveUserDetails(values)}>
                {({ handleChange, handleBlur, handleSubmit, values }) => (
                    <ScrollView>
                        <Card containerStyle={{ margin: 0, paddingTop: 15, paddingLeft: 5, paddingRight: 5, paddingBottom: 0 }}>
                            <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={[{ flex: 1, flexDirection: 'column' }]}>
                                    <Input onChangeText={handleChange('name')} label='Name' placeholder="Name" value={values.name} errorStyle={{ color: 'red' }} />
                                </View>
                                <View style={[{ flex: 1, flexDirection: 'column' }]}>
                                    <Input onChangeText={handleChange('surname')} label='Surname' placeholder="Surname" value={values.surname} errorStyle={{ color: 'red' }} />
                                </View>
                            </View>
                            <Input onChangeText={handleChange('address')} label='Address' placeholder="Address" value={values.address} errorStyle={{ color: 'red' }} />
                            <Input onChangeText={handleChange('city')} label='City' placeholder="City" value={values.city} errorStyle={{ color: 'red' }} />
                            <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                                <View style={[{ flex: 1, flexDirection: 'column' }]}>
                                    <Input onChangeText={handleChange('zipCode')} label='Zip' placeholder="Zip" value={values.zipCode} errorStyle={{ color: 'red' }} />
                                </View>
                                <View style={[{ flex: 1, flexDirection: 'column' }]}>
                                    <Input onChangeText={handleChange('state')} label='State' placeholder="State" value={values.state} errorStyle={{ color: 'red' }} />
                                </View>
                            </View>
                        </Card>
                        <Card containerStyle={{ marginLeft: 0, marginRight: 0, borderWidth: 0 }} >
                            <Button onPress={() => this.setModalVisible(true)} buttonStyle={{ backgroundColor: 'transparent', padding: 0 }} titleStyle={{ fontSize: 18, color: 'black' }} title='Change Password' />
                        </Card>
                        <Modal animationType="slide" presentationStyle='formSheet' visible={this.state.modalVisible} >
                            <View style={[{}]}>
                                <View style={[{ paddingBottom: 10, paddingTop: 10, paddingLeft: 0, paddingRight: 0, flexDirection: 'row', alignItems: 'center', backgroundColor: '#2185d0', alignContent: 'center' }]}>
                                    <View style={{ flex: 1, flexDirection: 'column' }}>
                                        <Button type='clear' titleStyle={{ color: 'white' }} title='Cancel' onPress={() => { this.setModalVisible(!this.state.modalVisible); }} />
                                    </View>
                                    <View style={{ flex: 2, flexDirection: 'column' }}>
                                        <Text style={{ alignSelf: 'center', fontWeight: '500', fontSize: 18, color: 'white' }}>Change password</Text>
                                    </View>
                                    <View style={{ flex: 1, flexDirection: 'column', alignContent: 'flex-end' }}>
                                        <Button type='clear' titleStyle={{ color: 'white' }} title='Save' onPress={() => { this.PasswordForm.handleSubmit(); }} />
                                    </View>
                                </View>

                                <Formik innerRef={p => (this.PasswordForm = p)} initialValues={{ password: '', newPassword: '', newPassConfirm: '' }} onSubmit={values => this.updateUserPassword(values.password, values.newPassword)}>
                                    {({ handleChange, handleBlur, handleSubmit, values }) => (
                                        <Card containerStyle={{ padding: 15, margin: 0, borderWidth: 0 }}>
                                            <Input onChangeText={handleChange('password')} label='Current Password' placeholder="Enter Current Password" value={values.password} errorStyle={{ color: 'red' }} />
                                            <Input onChangeText={handleChange('newPassword')} label='New Password' placeholder="Enter New Password" value={values.newPassword} errorStyle={{ color: 'red' }} />
                                            <Input onChangeText={handleChange('password')} label='Confirm New Password' placeholder="re-enter new password" value={values.newPassConfirm} errorStyle={{ color: 'red' }} />
                                        </Card>
                                    )}
                                </Formik>

                            </View>
                        </Modal>
                    </ScrollView>
                )}
            </Formik>
        );
    }
}

export function SettingsStackScreen() {
    return (
        <SettingsStack.Navigator>
            <SettingsStack.Screen name="Settings" component={SettingsScreen} />
        </SettingsStack.Navigator>
    );
}