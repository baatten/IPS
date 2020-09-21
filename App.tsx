import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import { HomeStackScreen } from './src/screens/homeScreen'
import { SettingsStackScreen } from './src/screens/settingsScreen'

const Tab = createBottomTabNavigator();

export default class App extends React.Component {

  render() {
    return (
      
      <NavigationContainer >
        <StatusBar barStyle = "light-content" hidden = {false} backgroundColor = "#00BCD4" translucent = {true}/>
        <Tab.Navigator initialRouteName="Settings" screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused
                ? 'home'
                : 'home';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'gear' : 'gear';
            } else { iconName = '' }

            // You can return any component that you like here!
            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
          tabBarOptions={{ activeTintColor: '#2185d0', inactiveTintColor: 'gray' }}>
          <Tab.Screen name="Home" component={HomeStackScreen} />
          <Tab.Screen name="Settings" component={SettingsStackScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}