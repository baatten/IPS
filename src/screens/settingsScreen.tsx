import React from 'react';
import { View, Text, Alert } from 'react-native';
import { Button, Card, Input } from 'react-native-elements';
import { StackNavigationProp, StackNavigationOptions, createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../components/utils/authContext';
import { ScrollView } from 'react-native-gesture-handler';
import { Formik, FormikBag } from 'formik';

const SettingsStack = createStackNavigator();
//const url = 'https://a0b79f3c31a0.ngrok.io';
const url = 'http://localhost:3000';

type settingsState = {
    user: User
    isLoading: boolean,
    accountDetailsIsValid: boolean
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

export class SettingsScreen extends React.Component<any, settingsState> {

    static contextType = AuthContext;
    form: any;

    constructor(props: any) {
        super(props)

        this.form = React.createRef();

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

        this.state = { user: { name: '', surname: '', address: '', city: '', state: '', zipCode: '', email: '' }, isLoading: false, accountDetailsIsValid: true }
        this.getUser();
    }

    signout(){

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
            const res = await fetch(url + '/api/client', {
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
            const res = await fetch(url + '/api/client/updateDetails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    { user }
                ),
            })
            if (res.status === 200) {

                const responseData = await res.json();

                Alert.alert('')
            }
            else {

            }
        }
        catch (error) {
            console.error('An unexpected error happened occurred:', error)
            //setErrorMsg(error.message)
        }
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
                        <Text style={{ fontSize: 16, color: 'grey', marginLeft: 15, marginTop: 15 }}>Personal Details</Text>
                        <Card containerStyle={{ margin: 0, paddingTop: 15, paddingLeft: 5, paddingRight: 5, paddingBottom: 0, marginTop: 5 }}>
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
                            <Button buttonStyle={{backgroundColor:'transparent',padding:0}} titleStyle={{ fontSize:18, color:'black' }} title='Change Password'/>
                        </Card>
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