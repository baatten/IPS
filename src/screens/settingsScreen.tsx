import React from 'react';
import { View, Text } from 'react-native';
import { Button, Card, Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../components/utils/authContext';

const SettingsStack = createStackNavigator();
const url = 'https://1a15f1850a15.ngrok.io';

type settingsState = {
    name: string,
    email: string
}

export class SettingsScreen extends React.Component<any, settingsState> {

    static contextType = AuthContext;

    constructor(props: settingsState) {
        super(props)

        this.state = { name: '', email: '' }
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
                    <View style={{}}>
                        <Card >
                            <Input label='Name' placeholder="Name" value={this.state.name} errorStyle={{ color: 'red' }} />

                            <Input label='E-mail' placeholder="E-mail" value={this.state.email} errorStyle={{ color: 'red' }} />
                        </Card>
                        <Card containerStyle={{padding:0,borderWidth:0}}>
                        <Button title='Sign Out' onPress={() => context.signOut()} />
                        </Card>
                        
                    </View>
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
                headerRight: () => (
                    <Button onPress={() => alert('This is a button!')} title="" type='clear' icon={
                        <Icon name="filter" size={20} style={{ color: 'white', padding: 3 }} />
                    } />
                ), headerLeft: () => (
                    <Button onPress={() => alert('This is a button!')} title="" containerStyle={{}} type='clear'>Save</Button>
                )
            }} name="Settings" component={SettingsScreen} />
        </SettingsStack.Navigator>
    );
}