import React from 'react';
import { View, Text, Animated,ScrollView } from 'react-native';
import { Button, Card, Input, Slider, ButtonGroup } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createStackNavigator } from '@react-navigation/stack';
import { AppContext } from '../components/utils/appContext';


const PersonalDetailsStack = createStackNavigator();
//const url = 'https://a0b79f3c31a0.ngrok.io';
const url = 'http://localhost:3000';

type settingsState = {
    name: string,
    address: string,
    city: string,
    state: string,
    zipCode: string
    email: string,
    isLoading: boolean
}

type settingsProps = {
    User:object
}

export class PersonalDetailsScreen extends React.Component<settingsProps, settingsState> {

    static contextType = AppContext;

    constructor(props: settingsProps) {
        super(props)

        this.state = { name: '', address: '', city: '', state: '', zipCode: '', email: '', isLoading: false }
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

                    this.setState({
                        name: data.user.name,
                        address: data.user.address,
                        city: data.user.city,
                        state: data.user.state,
                        zipCode: data.user.zipCode,
                        email: data.user.email
                    })
                    //console.log(data)
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

        const buttons = ['Map', 'List']

        const context = this.context;

        return (
            <View>
                <Input label='Name' placeholder="Name" value={this.state.name} errorStyle={{ color: 'red' }} />
                <Input label='Address' placeholder="Address" value={this.state.address} errorStyle={{ color: 'red' }} />
                <Input label='City' placeholder="City" value={this.state.city} errorStyle={{ color: 'red' }} />
                <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                    <View style={[{ flex: 1, flexDirection: 'column' }]}>
                        <Input label='Zip' placeholder="Zip" value={this.state.zipCode} errorStyle={{ color: 'red' }} />
                    </View>
                    <View style={[{ flex: 1, flexDirection: 'column' }]}>
                        <Input label='State' placeholder="State" value={this.state.state} errorStyle={{ color: 'red' }} />
                    </View>
                </View>
            </View>
        );
    }
}

export function PersonalDetailsStackScreen() {
    return (
        <PersonalDetailsStack.Navigator>
            <PersonalDetailsStack.Screen options={{
                headerShown: true,
                headerTintColor: '#fff',
                headerStyle: { backgroundColor: '#2185d0' },
                headerRight: () => (
                    <Button title='Save' onPress={() => alert('This is a button!')} style={{ paddingRight: 5 }} type='clear' titleStyle={{ color: 'white' }} />
                )
            }} name="Settings" component={PersonalDetailsScreen} />
        </PersonalDetailsStack.Navigator>
    );
}