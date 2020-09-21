import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Button, Card } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createStackNavigator } from '@react-navigation/stack';

const SettingsStack = createStackNavigator();

export class SettingsScreen extends React.Component<any, any> {

    render() {
        return (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

            <Card ><Text>test</Text></Card>

        </View>);
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

