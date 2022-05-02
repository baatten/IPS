import * as React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeStackScreen } from '../../../src/screens/homeScreen'
import { SettingsStackScreen } from '../../../src/screens/settingsScreen'
import { SavedLeadsStackScreen } from '../../../src/screens/savedLeads'
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator();

export class Tabs extends React.Component {

    constructor(props: any) {
        super(props);
    }

    render() {

        return (
            <Tab.Navigator screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home';
                    } else if (route.name === 'Account') {
                        iconName = focused ? 'user' : 'user';
                    } else if (route.name === 'Saved Leads') {
                        iconName = focused ? 'columns' : 'columns';
                    } else { iconName = '' }

                    // You can return any component that you like here!
                    return <Icon name={iconName} size={size} color={color} style={{}} />;
                },
                tabBarLabelStyle: Platform.OS == 'android' ? { marginBottom: 4, marginTop:-4 } : {fontSize:12, marginTop:-2}
            })}>
                <Tab.Screen name="Home" component={HomeStackScreen} options={{ headerShown: false }} />
                <Tab.Screen name="Saved Leads" component={SavedLeadsStackScreen} options={{ headerShown: false }} />
                <Tab.Screen name="Account" component={SettingsStackScreen} options={{ headerShown: false }} />
            </Tab.Navigator>
        );
    }
}