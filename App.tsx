import React, { useReducer, useEffect, useMemo, createContext, useContext, useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-community/async-storage';
import { Alert, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeStackScreen } from './src/screens/homeScreen'
import { SettingsStackScreen } from './src/screens/settingsScreen'
import { AuthContext } from './src/components/utils/authContext';
import { LoginReducer, initialState } from './src/components/utils/reducers';
import { stateConditionString } from './src/components/utils/stateCondition';
import { createStackNavigator, HeaderTitle } from '@react-navigation/stack';
import SplashScreen from './src/screens/splashScreen'
import SignInScreen from './src/screens/signInScreen'

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
//const url = 'https://a0b79f3c31a0.ngrok.io';
const url = 'http://localhost:3000';

export default function App() {

  const [state, dispatch] = useReducer(LoginReducer, initialState);

  useEffect(() => {

    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let username;
      let password;

      try {
        username = await AsyncStorage.getItem('username');
        password = await AsyncStorage.getItem('password');
      } catch (e) {
        // Restoring token failed
        console.log('Restoring token failed');
      }

      if (username !== undefined && password !== undefined) {

        try {
          const res = await fetch(url + '/api/client/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
              { username: username, password: password }
            ),
          })
          if (res.status === 200) {

            const responseData = await res.json();

            if (responseData.done) {

              console.log('response data: ' + responseData)

              state.userToken = responseData.token;
              authContextValue.user = responseData.token;

              dispatch({ type: 'SIGNED_IN', token: responseData.token });
            }
            else {
              dispatch({ type: 'TO_SIGNIN_PAGE' });
              console.log('TO_SIGNIN_PAGE')
            }
          } else {
            //this.setState({loading:false,error:true})
            //throw new Error(await res.text())
            //console.log(await res.text());
            dispatch({ type: 'TO_SIGNIN_PAGE' });
          }
        } catch (error) {
          console.error('An unexpected error happened occurred:', error)
          //setErrorMsg(error.message)
        }
      } else {
        dispatch({ type: 'TO_SIGNIN_PAGE' });
        console.log('TO_SIGNIN_PAGE')
      }

      // After restoring token, we may need to validate it in production apps
      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      dispatch({ type: 'RESTORED_TOKEN' });
      console.log('RESTORED_TOKEN');
    };
    bootstrapAsync();
  }, []);

  const authContextValue = useMemo(() => ({
    user: {},
    signIn: async (data: any) => {

      if (data && data.emailAddress !== undefined && data.password !== undefined) {

        try {
          const res = await fetch(url + '/api/client/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
              { username: data.emailAddress, password: data.password }
            ),
          })
          if (res.status === 200) {

            const responseData = await res.json();

            if (responseData.done) {

              //console.log(responseData)

              //state.userToken = data.token;
              authContextValue.user = responseData.token;

              await AsyncStorage.setItem('username', data.emailAddress);
              await AsyncStorage.setItem('password', data.password);

              dispatch({ type: 'SIGNED_IN', token: responseData.token });
            }
            else {
              dispatch({ type: 'TO_SIGNIN_PAGE' });
              console.log('sign error')
            }
          } else {
            //this.setState({loading:false,error:true})
            //throw new Error(await res.text())
            //console.log(await res.text());
            Alert.alert('Error', 'Username or password is wrong.');

            dispatch({ type: 'TO_SIGNIN_PAGE' });
          }
        } catch (error) {
          console.error('An unexpected error happened occurred:', error)
          //setErrorMsg(error.message)
        }
      } else {
        dispatch({ type: 'TO_SIGNIN_PAGE' });
      }
    },
    signOut: async (data: any) => {

      console.log('sign out');

      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('password');

      dispatch({ type: 'SIGN_OUT' });
    },

    signUp: async (data: any) => {
      if (
        data &&
        data.emailAddress !== undefined &&
        data.password !== undefined
      ) {
        dispatch({ type: 'SIGNED_UP', token: 'dummy-auth-token' });
      } else {
        dispatch({ type: 'TO_SIGNUP_PAGE' });
      }
    },
  }),
    [],
  );

  const chooseScreen = (state: any) => {
    let navigateTo = stateConditionString(state);
    let arr = [];

    switch (navigateTo) {
      case 'LOAD_APP':
        arr.push(
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
          </Stack.Navigator>
        );
        break;

      case 'LOAD_SIGNUP':
        arr.push(
          <Stack.Navigator>
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{
                title: 'Sign Up',
                animationTypeForReplace: state.isSignout ? 'pop' : 'push',
              }}
            />
          </Stack.Navigator>,
        );
        break;
      case 'LOAD_SIGNIN':
        arr.push(
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SignIn" component={SignInScreen} />
          </Stack.Navigator>);
        break;

      case 'LOAD_HOME':
        arr.push(
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeTabs} />
          </Stack.Navigator>
        );
        break;

      default:
        arr.push(<Stack.Screen name="SignIn" component={SignInScreen} />);
        break;
    }

    return arr[0];
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <NavigationContainer >
        <StatusBar barStyle="light-content" hidden={false} backgroundColor="#00BCD4" translucent={false} />
        {chooseScreen(state)}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator initialRouteName="Home" screenOptions={({ route }) => ({
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
      tabBarOptions={{ activeTintColor: '#2185d0', inactiveTintColor: 'gray', }}>
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Settings" component={SettingsStackScreen} />
    </Tab.Navigator>
  );
}