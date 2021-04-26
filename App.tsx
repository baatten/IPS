import React, { useReducer, useEffect, useMemo, useState } from 'react';
import { AppState, View, Text,Linking } from 'react-native'
import { Button } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from './src/globals';
import { Alert, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeStackScreen } from './src/screens/homeScreen'
import { SettingsStackScreen } from './src/screens/settingsScreen'
import { AuthContext } from './src/components/utils/authContext';
import { LoginReducer, initialState } from './src/components/utils/reducers';
import { stateConditionString } from './src/components/utils/stateCondition';
import { createStackNavigator } from '@react-navigation/stack';
import { SignUpScreen } from './src/screens/SignUpScreen2'
import { SavedLeadsStackScreen } from './src/screens/savedLeads'
import SplashScreen from './src/screens/splashScreen'
import SignInScreen from './src/screens/signInScreen'
import DisabledLocation from './src/screens/DisabledLocation';
import ActionSheet from "react-native-actions-sheet";
import * as Location from 'expo-location';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {

  const [state, dispatch] = useReducer(LoginReducer, initialState);
  const sheetRef: any = React.useRef();
  const [Undetermined, setUndetermined] = useState(false)

  const allowPermissions = async () => {

    sheetRef.current.setModalVisible(false);

    let { status } = await Location.requestForegroundPermissionsAsync()

    if (status == 'granted') {

      sheetRef.current.setModalVisible(false);
      return true;
    }
    else {
      setUndetermined(false);
      sheetRef.current.setModalVisible(true);
    }
  }

  const checkPermissions = async () => {

    let { status } = await Location.requestForegroundPermissionsAsync();



    if (status == 'granted') {

      sheetRef.current.setModalVisible(false);
      return true;
    }

    if (status == 'undetermined') {
      setUndetermined(true);
      sheetRef.current.setModalVisible(true);
    }
    else {

      let { status } = await Location.requestForegroundPermissionsAsync()

      if (status == 'granted')
        return true;
      else
        sheetRef.current.setModalVisible(true);
    }

    return false;
  }

  const handleAppStateChange = (state: any) => {

    if (state == 'active')
      checkPermissions();
  }

  useEffect(() => {

    AppState.addEventListener('change', handleAppStateChange);

    const bootstrapAsync = async () => {

      let username;
      let password;

      try {
        username = await AsyncStorage.getItem('username');
        password = await AsyncStorage.getItem('password');
      } catch (e) {
        // Restoring token failed
      }

      if (username !== undefined && password !== undefined && await checkPermissions()) {

        try {
          const res = await fetch(GLOBALS.BASE_URL + '/api/client/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
              { username: username, password: password }
            ),
          })
          if (res.status === 200) {

            const responseData = await res.json();

            if (responseData.done) {

              state.userToken = responseData.token;
              authContextValue.user = responseData.token;

              dispatch({ type: 'SIGNED_IN', token: responseData.token });
            }
            else {
              dispatch({ type: 'TO_SIGNIN_PAGE' });
            }
          } else {

            dispatch({ type: 'TO_SIGNIN_PAGE' });
          }
        } catch (error) {
          console.error('An unexpected error happened occurred:', error)
          //setErrorMsg(error.message)
        }
      } else {
        dispatch({ type: 'TO_SIGNIN_PAGE' });
      }

      // After restoring token, we may need to validate it in production apps
      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      dispatch({ type: 'RESTORED_TOKEN' });
    };

    bootstrapAsync();
  }, []);

  const authContextValue = useMemo(() => ({

    user: { user: null },
    checkPermissions: async () => checkPermissions(),
    signIn: async (data: any) => {

      if (data && data.emailAddress !== undefined && data.password !== undefined) {

        try {
          const res = await fetch(GLOBALS.BASE_URL + '/api/client/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
              { username: data.emailAddress, password: data.password }
            ),
          })
          if (res.status === 200) {

            const responseData = await res.json();

            if (responseData.done) {

              authContextValue.user = responseData.token;

              await AsyncStorage.setItem('username', data.emailAddress);
              await AsyncStorage.setItem('password', data.password);

              dispatch({ type: 'SIGNED_IN', token: responseData.token });
              return { user: 'test' }
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

      case 'LOAD_Location_Services_Disabled':
        arr.push(
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Location Services Disabled" component={DisabledLocation} />
          </Stack.Navigator>
        );
        break;

      case 'LOAD_APP':
        arr.push(
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
          </Stack.Navigator>
        );
        break;

      case 'LOAD_SIGNUP':
        arr.push(
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </Stack.Navigator>,
        );
        break;
      case 'LOAD_SIGNIN':
        arr.push(
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SignIn" component={SignInScreen} options={{headerShown:false}} />
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
    <>
      <AuthContext.Provider value={authContextValue}>
        <NavigationContainer >
          <StatusBar barStyle="light-content" hidden={false} backgroundColor="transparent" translucent={true} />
          {chooseScreen(state)}
        </NavigationContainer>
      </AuthContext.Provider>

      <ActionSheet ref={sheetRef} closeOnPressBack={false} closeOnTouchBackdrop={false} bounceOnOpen={true} containerStyle={{ backgroundColor: '#1D7DD7', padding: 50, height: '100%', minHeight: '100%' }}>
        {Undetermined ? (
          <View>
            <Icon name='street-view' color='white' size={150} style={{ marginTop: 25, textAlign: 'center' }}></Icon>
            <Text style={{ fontWeight: '700', fontSize: 24, alignSelf: 'center', marginTop: 20, color: 'white' }}>Location Services</Text>
            <Text style={{ fontWeight: '300', fontSize: 16, marginTop: 10, color: 'white', alignSelf: 'center', textAlign: 'center' }}>We'll need your location to show you leads nearby completely automatically and save your time.</Text>
            <Button onPress={() => allowPermissions()} title='Sure, thank you' titleStyle={{ color: '#1D7DD7' }} style={{ marginTop: 25 }} buttonStyle={{ backgroundColor: 'white', margin: 0, marginTop: 5, padding: 15, borderRadius: 10 }} />
            <Button onPress={() => sheetRef.current.setModalVisible(false)} title='Not now' type='clear' titleStyle={{ color: 'white' }} style={{ marginTop: 10 }} />
          </View>
        ) : (
            <View>
              <Icon name='street-view' color='white' size={150} style={{ marginTop: 25, textAlign: 'center' }}></Icon>
              <View>
                <Text style={{ fontWeight: '700', fontSize: 24, alignSelf: 'center', marginTop: 20, color: 'white' }}>Location Services</Text>
                <Text style={{ fontWeight: '300', fontSize: 16, marginTop: 10, color: 'white', alignSelf: 'center', textAlign: 'center' }}>We'll need your location to show you leads nearby completely automatically and save your time.</Text>
                <Text style={{ fontWeight: '500', fontSize: 18, alignSelf: 'center', marginTop: 30, color: 'white' }}>How to enable location services?</Text>
              </View>

              <View>
                <Text style={{ fontWeight: '300', fontSize: 16, marginTop: 15, color: 'white' }}>1. Go to settings.</Text>
                <Text style={{ fontWeight: '300', fontSize: 16, marginTop: 10, color: 'white' }}>2. Scroll to the T65 and click the app icon.</Text>
                <Text style={{ fontWeight: '300', fontSize: 16, marginTop: 10, color: 'white' }}>3. Click the location setting.</Text>
                <Text style={{ fontWeight: '300', fontSize: 16, marginTop: 10, color: 'white' }}>4. choose "while using the app".</Text>
                <Text style={{ fontWeight: '300', fontSize: 16, marginTop: 10, color: 'white' }}>5. Open T65 app again.</Text>
              </View>

              <Button onPress={() => Linking.openSettings()} title='Open Settings' titleStyle={{ color: '#1D7DD7' }} style={{ marginTop: 25 }} buttonStyle={{ backgroundColor: 'white', borderRadius: 10, padding: 15 }} />
            </View>
          )}
      </ActionSheet>
    </>
  )
}

function HomeTabs() {

  //StatusBar.setBackgroundColor('#2185d0');

  return (
    <Tab.Navigator initialRouteName="Home" screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused
            ? 'home'
            : 'home';
        } else if (route.name === 'Account') {
          iconName = focused ? 'user' : 'user';
        } else if (route.name === 'Saved Leads') {
          iconName = focused ? 'columns' : 'columns';
        } else { iconName = '' }

        // You can return any component that you like here!
        return <Icon name={iconName} size={size} color={color} style={{ padding: 0, margin: -15 }} />;
      },
    })}
      tabBarOptions={{ activeTintColor: '#2185d0', inactiveTintColor: 'gray' }}>
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Saved Leads" component={SavedLeadsStackScreen} />
      <Tab.Screen name="Account" component={SettingsStackScreen} />
    </Tab.Navigator>
  );
}