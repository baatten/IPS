import React from 'react';
import { View, Text } from 'react-native';
import { Button, Card, Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../components/utils/authContext';
import { ScrollView } from 'react-native-gesture-handler';

const SettingsStack = createStackNavigator();
const url = 'https://1a15f1850a15.ngrok.io';

type settingsState = {
    name: string,
    email: string,
    isLoading: boolean
}

export class SettingsScreen extends React.Component<any, settingsState> {

    static contextType = AuthContext;

    constructor(props: settingsState) {
        super(props)

        this.state = { name: '', email: '', isLoading: false }
        this.getUser();
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

                    this.setState({ name: data.user.name, email: data.user.email })
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

    render() {

        const context = this.context;

        return (
            <AuthContext.Consumer>
                { (value: any) => (
                    <ScrollView>
                        <Card containerStyle={{ marginLeft: 0, marginRight: 0, borderWidth: 0 }} >
                            <Input label='Name' placeholder="Name" value={this.state.name} errorStyle={{ color: 'red' }} />

                            <Input label='E-mail' placeholder="E-mail" value={this.state.email} errorStyle={{ color: 'red' }} />
                        </Card>

                        <Card containerStyle={{ marginLeft: 0, marginRight: 0, borderWidth: 0 }} >
                            <Text style={{ fontSize: 18, marginLeft: 10 }}>Personal details</Text>
                        </Card>

                        <Card containerStyle={{ marginLeft: 0, marginRight: 0, borderWidth: 0 }} >
                            <Text style={{ fontSize: 16, marginLeft: 10 }}>Subscription</Text>
                        </Card>

                        <Button buttonStyle={{ margin: 25, padding: 15, borderRadius: 10 }} title='Sign Out' onPress={() => context.signOut()} />
                    </ScrollView>
                )}
            </AuthContext.Consumer>
        );
    }
}

export function SettingsStackScreen() {
    return (
        <SettingsStack.Navigator>
            <SettingsStack.Screen options={{
                headerShown: true,
                headerTintColor: '#fff',
                headerStyle: { backgroundColor: '#2185d0' },
                headerLeft: () => (
                    <Button onPress={() => alert('This is a button!')} title="" type='clear' icon={
                        <Icon name="filter" size={20} style={{ color: 'white', padding: 3 }} />
                    } />
                ), headerRight: () => (
                    <Button title='Save' onPress={() => alert('This is a button!')} style={{ paddingRight: 5 }} type='clear' titleStyle={{ color: 'white' }} />
                )
            }} name="Settings" component={SettingsScreen} />
        </SettingsStack.Navigator>
    );
}