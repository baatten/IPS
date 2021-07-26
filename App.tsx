import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from './src/globals';
import SplashScreen from './src/screens/splashScreen'
import SignInScreen from './src/screens/signInScreen'
import DisabledLocation from './src/screens/DisabledLocation';
import ActionSheet from "react-native-actions-sheet";
import * as Location from 'expo-location';
import { AppState, View, Text, Linking, Modal, TouchableOpacity, ActivityIndicator, StyleSheet, Platform, FlexAlignType } from 'react-native'
import { Button, CheckBox, Icon as SpecialIcon } from 'react-native-elements'
import { Alert, StatusBar } from 'react-native';
import { Tabs } from './src/components/utils/tabs'
import { NavigationContainer } from '@react-navigation/native';
import { AppContext } from './src/components/utils/appContext';
import { LoginReducer, initialState, LoginState } from './src/components/utils/reducers';
import { stateConditionString } from './src/components/utils/stateCondition';
import { createStackNavigator } from '@react-navigation/stack';
import { SignUpScreen } from './src/screens/SignUpScreen2'
import { InAppBrowser } from 'react-native-inappbrowser-reborn'
import { activateAdapty, adapty, AdaptyProduct } from 'react-native-adapty';
import { expo } from './app.json'

interface userModel {

  done: true,
  name: string,
  email: string,
  surname: string,
  userId: string,
  token: string
}

const Stack = createStackNavigator();

type AppProps = {};
type IPSState = {
  showMissingPermissions: boolean
  showSubscriptionWall: boolean
  subscribeLoading: boolean
  subscriptions: AdaptyProduct[]
  activeSubscription?: AdaptyProduct
  conditionAccepted: boolean
  loginState: LoginState
  user?: any
}

export default class App extends React.Component<AppProps, IPSState> {

  sheetRef: any;
  appStateChangedListener: any;

  constructor(props: AppProps) {
    super(props)

    this.sheetRef = React.createRef<ActionSheet>();

    this.state = {

      showMissingPermissions: false,
      showSubscriptionWall: false,
      subscribeLoading: false,
      subscriptions: [],
      activeSubscription: undefined,
      conditionAccepted: false,
      loginState: initialState
    }
  }

  componentDidMount() {

    this.appStateChangedListener = AppState.addEventListener('change', () => this.handleAppStateChange);
    activateAdapty({ sdkKey: 'public_live_IzA6ISaF.w70tuOGpyeOnvk8By66i' });

    this.start();
  }

  componentWillUnmount() {

    AppState.removeEventListener("change", this.appStateChangedListener);
  }

  async start() {

    let username;
    let password;

    try {
      username = await AsyncStorage.getItem('username');
      password = await AsyncStorage.getItem('password');
    } catch (e) {
      // Restoring token failed
    }

    if (username != null && password != null) {

      this.signIn(username, password);

    } else {
      this.dispatch({ type: 'TO_SIGNIN_PAGE' });
    }
  }

  dispatch(action: any) {
    this.setState({ loginState: LoginReducer(this.state.loginState, action) });
  }

  async allowPermissions() {

    this.sheetRef.current.setModalVisible(false);
    let { status } = await Location.requestForegroundPermissionsAsync()

    if (status == 'granted') {

      this.sheetRef.current.setModalVisible(false);
      this.setState({ showMissingPermissions: false });
      return true;
    }
    else {
      this.setState({ showMissingPermissions: true });
    }

    return false;
  }

  async checkPermissions(): Promise<boolean> {

    let { status } = await Location.getForegroundPermissionsAsync();

    if (status == 'granted') {

      this.setState({ showMissingPermissions: false });
      this.sheetRef.current.setModalVisible(false);
      return true;
    }

    else if (status == 'denied') {

      this.setState({ showMissingPermissions: true });
      return false;
    }
    else {

      this.sheetRef.current.setModalVisible(true);
    }

    return false;
  }

  async handleAppStateChange(state: any) {

    if (state == 'active') {

      this.checkPermissions();
      this.checkSubscriptionStatus();
    }
  }

  async checkSubscriptionStatus() {

    if (this.state.user != null) {

      try {
        const info = await adapty.purchases.getInfo({})
        // "premium" is an identifier of default access level

        console.log(info)

        if (info?.accessLevels!['premium']?.isActive) {
          // grant access to premium features

        }
        else {

          this.setState({ showSubscriptionWall: true })

          //force user to buy subscription
          try {
            const data = await adapty.paywalls.getPaywalls({ forceUpdate: true });

            if (this.state.subscriptions.length == 0)
              this.setState({ subscriptions: data.products })


            //console.log(data.products)

            //adapty.paywalls.getPaywalls({ forceUpdate: true })
          } catch (error: any) {

            //console.log(error)
          }
        }
      } catch (error: any) {

      }
    }
  }

  openLink = async () => {
    try {
      const url = 'https://api.t-65locator.com/privacyPolicy/'
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.open(url, {
          // iOS Properties
          dismissButtonStyle: 'close',
          preferredBarTintColor: '#2185d0',
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'fullScreen',
          modalTransitionStyle: 'coverVertical',
          modalEnabled: true,
          enableBarCollapsing: false,
          // Android Properties
          showTitle: true,
          toolbarColor: 'grey',
          secondaryToolbarColor: 'black',
          navigationBarColor: 'black',
          navigationBarDividerColor: 'white',
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: false,
          // Specify full animation resource identifier(package:anim/name)
          // or only resource name(in case of animation bundled with app).
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right'
          },
          headers: {
            'my-custom-header': 'my custom header value'
          }
        })
        //Alert.alert(JSON.stringify(result))
      }
      else Linking.openURL(url)
    } catch (error) {
      Alert.alert(error.message)
    }
  }

  signIn = async (emailAddress: string, password: string) => {

    if (emailAddress != null && password != null && await this.checkPermissions()) {

      const res = await fetch(GLOBALS.BASE_URL + '/api/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: emailAddress,
          password: password,
          release: expo.version,
          platform: Platform.OS,
          platformVersion: Platform.Version
        })
      })

      if (res.status === 200) {

        const responseData: userModel = await res.json();

        //console.log('user id', responseData.userId)
        //console.log('user object', responseData)

        if (responseData.done) {

          //this.authContextValue.user = responseData.token as any;
          this.setState({ user: responseData })

          await AsyncStorage.setItem('username', emailAddress);
          await AsyncStorage.setItem('password', password);

          const userIdString = responseData.userId.toString();

          //console.log('id:', userIdString)

          if (userIdString !== undefined && userIdString !== null && userIdString !== '') {

            try {

              //await activateAdapty({ sdkKey: 'public_live_IzA6ISaF.w70tuOGpyeOnvk8By66i',customerUserId:userIdString });
              //await adapty.user.logout();
              await adapty.user.identify(userIdString);

              await adapty.user.updateProfile({
                firstName: responseData.name,
                lastName: responseData.surname,
                email: responseData.email
              });

            } catch (error: any) {
              console.log('Morten testing', error)
            }

            this.dispatch({ type: 'SIGNED_IN', token: responseData.token });
            await this.checkSubscriptionStatus();

          }
          else {
            this.dispatch({ type: 'TO_SIGNIN_PAGE' });

          }
        }
        else {
          this.dispatch({ type: 'TO_SIGNIN_PAGE' });
          //console.log('sign error')

        }
      } else {
        //this.setState({loading:false,error:true})
        //throw new Error(await res.text())
        //console.log(await res.text());
        Alert.alert('Error', 'Username or password is wrong.');

        this.dispatch({ type: 'TO_SIGNIN_PAGE' });
      }

    } else {
      this.dispatch({ type: 'TO_SIGNIN_PAGE' });

    }

    return;
  }

  signOut = async () => {

    this.setState({ showSubscriptionWall: false })

    await adapty.user.logout();
    await AsyncStorage.removeItem('username');
    await AsyncStorage.removeItem('password');

    this.dispatch({ type: 'TO_SIGNIN_PAGE' });
    //dispatch({ type: 'SIGN_OUT' });
  }

  signUp = async (data: any) => {
    if (
      data &&
      data.emailAddress !== undefined &&
      data.password !== undefined
    ) {
      this.dispatch({ type: 'SIGNED_UP', token: 'dummy-auth-token' });
    } else {
      this.dispatch({ type: 'TO_SIGNUP_PAGE' });
    }
  }

  subScribe = async (product: AdaptyProduct) => {

    this.setState({ subscribeLoading: true })


    try {
      const { purchaserInfo } = await adapty.purchases.makePurchase(product);


      this.setState({ subscribeLoading: false })

      // "premium" is an identifier of default access level
      if (purchaserInfo?.accessLevels!['premium'].isActive) {
        // grant access to premium features

        this.setState({ showSubscriptionWall: false })
      }
    } catch (error: any) {

      this.setState({ subscribeLoading: false })
    }

  }

  chooseScreen = (state: LoginState) => {
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
          <Stack.Navigator screenOptions={{ headerShown: false, animationTypeForReplace: this.state.user != null ? 'pop' : 'push' }}>
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </Stack.Navigator>,
        );
        break;
      case 'LOAD_SIGNIN':
        arr.push(
          <Stack.Navigator screenOptions={{ headerShown: false ,animationEnabled:false}}>
            <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
          </Stack.Navigator>);
        break;

      case 'LOAD_HOME':
        arr.push(
          <Stack.Navigator screenOptions={{ headerShown: false, animationTypeForReplace: this.state.user == null ? 'pop' : 'push' }}>
            <Stack.Screen name="Home" component={Tabs} />
          </Stack.Navigator>
        );
        break;

      default:
        arr.push(
          <Stack.Navigator screenOptions={{ headerShown: false, animationTypeForReplace: this.state.user != null ? 'pop' : 'push' }}>
            <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
          </Stack.Navigator>);
        break;
    }

    return arr[0];
  };

  render() {

    return (

      <AppContext.Provider value={{
        signIn: this.signIn,
        signOut: this.signOut,
        signUp: this.signUp,
        subScribe: this.subScribe
      }}>
        <NavigationContainer >
          <StatusBar barStyle="light-content" hidden={false} backgroundColor="transparent" translucent={true} />
          {this.chooseScreen(this.state.loginState)}
        </NavigationContainer>
        <ActionSheet ref={this.sheetRef} closeOnPressBack={false} closeOnTouchBackdrop={false} bounceOnOpen={true} containerStyle={{ backgroundColor: '#1D7DD7' }}>
          <View style={{ padding: 50 }}>
            <Icon name='street-view' color='white' size={150} style={{ marginTop: 25, textAlign: 'center' }}></Icon>
            <Text style={{ fontWeight: '700', fontSize: 24, alignSelf: 'center', marginTop: 20, color: 'white' }}>Location Services</Text>
            <Text style={{ fontWeight: '300', fontSize: 16, marginTop: 10, color: 'white', alignSelf: 'center', textAlign: 'center' }}>We'll need your current location to show you leads nearby completely automatically and save your time.</Text>
            <Text style={{ fontWeight: '300', fontSize: 16, marginTop: 10, color: 'white', alignSelf: 'center', textAlign: 'center' }}>If you don't enable location access, the app cannot show you leads nearby.</Text>
            <Button onPress={() => this.allowPermissions()} title='Continue' titleStyle={{ color: '#1D7DD7' }} style={{ marginTop: 25 }} buttonStyle={{ backgroundColor: 'white', margin: 0, marginTop: 5, padding: 15, borderRadius: 10 }} />
            <Button onPress={() => this.sheetRef.current.setModalVisible(false)} title='Not now' type='clear' titleStyle={{ color: 'white' }} style={{ marginTop: 10 }} />
          </View>
        </ActionSheet>
        <Modal presentationStyle='pageSheet' visible={this.state.showMissingPermissions} animationType='slide'>
          <View style={{ backgroundColor: '#1D7DD7', padding: 50, height: '100%', minHeight: '100%' }}>
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
        </Modal>

        <Modal presentationStyle='fullScreen' visible={this.state.showSubscriptionWall} animationType='slide'>
          <View style={{ backgroundColor: '#f7fafb', padding: 20, height: '100%', minHeight: '100%', justifyContent: 'center' }}>
            <View style={{}}>
              <Text style={{ fontWeight: '700', fontSize: 28, alignSelf: 'center', color: '#2185d0' }}>T65 Locator</Text>
              <Text style={{ fontWeight: '500', color: '#2185d0', fontSize: 18, marginTop: 10, marginBottom: 25, alignSelf: 'center', textAlign: 'center' }}>Please choose a subscription to continue using T65.</Text>

            </View>
            {this.state.subscriptions != null && this.state.subscriptions.length > 1 ? (
              this.state.subscriptions.filter(prod => prod.price > 0).map((product: AdaptyProduct) => (
                <TouchableOpacity key={product.vendorProductId} activeOpacity={1} onPress={() => this.setState({ activeSubscription: product })}>
                  <View style={(this.state.activeSubscription?.localizedTitle == product.localizedTitle) ? (this.styles.subscriptionSelected) : (this.styles.subscription)}>
                    <View style={[{ flex: 1, flexDirection: 'column', marginRight: 15, borderRadius: 10, justifyContent: 'center', borderWidth: 1, borderColor: this.state.activeSubscription?.localizedTitle == product.localizedTitle ? 'white' : '#2185d0' }]}>
                      <SpecialIcon name='calendar-week' type='font-awesome-5' color={this.state.activeSubscription?.localizedTitle == product.localizedTitle ? 'white' : '#2185d0'} />
                    </View>
                    <View style={[{ flex: 3, flexDirection: 'column' }]}>
                      <Text style={{ color: this.state.activeSubscription?.localizedTitle == product.localizedTitle ? 'white' : '#2185d0', fontSize: 17, fontWeight: '600', marginBottom: 2 }}>{product.localizedTitle}</Text>
                      <Text style={{ color: this.state.activeSubscription?.localizedTitle == product.localizedTitle ? 'white' : '#2185d0', marginBottom: 2 }}>${product.price} / {product.localizedSubscriptionPeriod}</Text>
                      <Text style={{ color: this.state.activeSubscription?.localizedTitle == product.localizedTitle ? 'white' : '#2185d0' }}>Paid {product.localizedDescription}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))) :
              (
                <ActivityIndicator />
              )}
            <View style={{ flexDirection: 'row', backgroundColor: 'transparent', borderColor: '#2185d0', borderRadius: 5 }}>
              <View style={[{ flexDirection: 'column' }]}>
                <CheckBox onPress={() => this.setState({ conditionAccepted: !this.state.conditionAccepted })} checked={this.state.conditionAccepted} containerStyle={{ padding: 0, backgroundColor: 'transparent', borderRadius: 5, borderWidth: 0 }} />
              </View>
              <View style={[{ flexDirection: 'column', justifyContent: 'center' }]}>
                <Text style={{ lineHeight: 20 }}>By signing up you agree to the T65</Text>
                <Text onPress={this.openLink} style={{ color: '#2185d0' }}>Privacy Policy</Text>
              </View>
            </View>
            <Button loading={this.state.subscribeLoading} onPress={() => this.subScribe(this.state.activeSubscription!)} disabled={!this.state.conditionAccepted || this.state.activeSubscription == undefined} title='Buy subscription' containerStyle={{ marginTop: 25 }} buttonStyle={{ paddingVertical: 15, borderRadius: 15 }} titleStyle={{ fontWeight: '600' }} />
            <Button onPress={() => this.signOut()} title='Sign out' containerStyle={{ marginTop: 5 }} titleStyle={{ color: '#2185d0' }} buttonStyle={{ backgroundColor: 'transparent' }} />
          </View>
        </Modal>

      </AppContext.Provider>
    )
  }

  styles = StyleSheet.create({

    subscription: {

      borderColor: '#2185d0',
      borderWidth: 1,
      borderRadius: 10,
      alignContent: 'center',
      padding: 15,
      marginBottom: 20,
      flexDirection: 'row'
    },

    subscriptionSelected: {

      borderColor: '#2185d0',
      backgroundColor: '#2185d0',
      color: 'white',
      borderWidth: 1,
      borderRadius: 10,
      alignContent: 'center',
      padding: 15,
      marginBottom: 20,
      flexDirection: 'row'
    }
  })
}