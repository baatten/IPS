import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MapView, { Marker, Callout } from 'react-native-maps';
import type { KmlMarker } from 'react-native-maps';
import { Button, withTheme } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

/*
interface IState {
  markers?: MarkerType[];
}
*/

//lat: 49.99514663
//long: 36.23015285
//this.state.setState();

class HomeScreen extends React.Component<{}, any> {

  constructor(props: any) {
    super(props);

    const markers: KmlMarker[] = [];

    markers.push({ id: "test2", title: 'Tom Johnson', description: '', coordinate: { latitude: 49.99514663, longitude: 36.2301528 }, position: { x: 0, y: 0 } });
    markers.push({ id: "test2", title: 'test', description: '', coordinate: { latitude: 50.0015053, longitude: 36.22005701 }, position: { x: 0, y: 0 } });
    markers.push({ id: "test2", title: 'test', description: '', coordinate: { latitude: 50.00445676, longitude: 36.2426734 }, position: { x: 0, y: 0 } });
    markers.push({ id: "test2", title: 'test', description: '', coordinate: { latitude: 49.97739033, longitude: 36.223104 }, position: { x: 0, y: 0 } });

    this.state = { markers: markers };
  }

  test() {

  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <MapView initialRegion={{ latitude: 49.99229117, longitude: 36.23333931, latitudeDelta: 0.00051, longitudeDelta: 0.05, }} style={{ flex: 1, height: 400, width: '100%', }} showsUserLocation={true}>
          {this.state.markers.map((marker: KmlMarker, index: any) => (

            <Marker key={index} title={marker.title as string} description={marker.description as string} coordinate={marker.coordinate}>
              <Callout tooltip>
                <View style={{
                  borderTopStartRadius: 15, borderTopRightRadius: 15, padding: 20, backgroundColor: 'white',
                  shadowColor: 'black', shadowOpacity: 0.15, shadowRadius: 5, shadowOffset: { width: 5, height: 50 }
                }}>
                  <Text style={styles.titleText}>Tom Jensen Johnson</Text>
                  <Text style={styles.baseText}>Turns 65 in 4 months</Text>
                  <Text style={styles.baseText}>8 miles away</Text>

                </View>
                <Button buttonStyle={{
                  borderTopStartRadius: 0,
                  borderTopRightRadius: 0
                }} containerStyle={{
                  borderTopStartRadius: 0,
                  borderTopRightRadius: 0,
                  borderBottomLeftRadius: 15,
                  borderBottomRightRadius: 15
                }} onPress={this.test} title="Get Directions" icon={
                  <Icon
                    name="car"
                    size={18}
                    style={{ padding: 3, marginRight: 5 }}
                    color="white"
                  />
                } />
              </Callout>
            </Marker>
          ))}
        </MapView>
        <Button buttonStyle={{ backgroundColor: 'white',          shadowColor: 'black',
          shadowOpacity: 0.75,
          shadowRadius: 1,
          shadowOffset: { width: 15, height: 15 }, }} onPress={this.test} icon={
          <Icon name="car" size={18} style={{ padding: 3 }} color="black" />}
          containerStyle={{

          position: "absolute",
          left: 30,
          borderRadius: 50,
          top: 50, backgroundColor: 'white;'
        }} />
      </View>
    );
  }
}

export default class App extends React.Component {

  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} options={{
            headerShown: false, headerRight: () => (
              <Button onPress={() => alert('This is a button!')} title="" type='clear' icon={
                <Icon
                  name="cloud-download"
                  size={20}
                  style={{ padding: 3 }}

                />
              } />
            ), headerLeft: () => (
              <Button onPress={() => alert('This is a button!')} title="" type='clear' icon={
                <Icon
                  name="user"
                  size={20}
                  style={{ padding: 5 }}

                />
              } />
            )
          }

          } />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

const Stack = createStackNavigator();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontSize: 18,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold"
  }
  ,
});
