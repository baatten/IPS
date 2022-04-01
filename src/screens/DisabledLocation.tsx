import React from 'react';
import { Text, View } from 'react-native';
import { Icon, Button } from 'react-native-elements'

export default class DisabledLocation extends React.Component {

    render() {

        return (
            <View style={{padding:50,backgroundColor:'#1D7DD7',height:'100%'}}>
                <Icon tvParallaxProperties={undefined} name='street-view' type='font-awesome-5' color='white' size={150} style={{ marginTop: 100 }}></Icon>
                <Text style={{ fontWeight: '700', fontSize: 24, alignSelf: 'center', marginTop: 50, color: 'white' }}>Location Services</Text>
                <Text style={{ fontWeight: '300', fontSize: 16, marginTop: 30, color: 'white', alignSelf: 'center', textAlign: 'center' }}>We'll need your location to show you leads nearby completely automatically and save your time.</Text>
                <Text style={{ fontWeight: '500', fontSize: 18, alignSelf: 'center', marginTop: 30, color: 'white' }}>How to enable location services?</Text>
                <View>
                    <Text style={{ fontWeight: '300', fontSize: 16, marginTop: 30, color: 'white' }}>1. Go to settings.</Text>
                    <Text style={{ fontWeight: '300', fontSize: 16, marginTop: 8, color: 'white' }}>2. Scroll to the T65 and click the app icon.</Text>
                    <Text style={{ fontWeight: '300', fontSize: 16, marginTop: 8, color: 'white' }}>3. Click the location setting.</Text>
                    <Text style={{ fontWeight: '300', fontSize: 16, marginTop: 8, color: 'white' }}>4. choose "while using the app".</Text>
                    <Text style={{ fontWeight: '300', fontSize: 16, marginTop: 8, color: 'white' }}>5. Open T65 app again.</Text>
                </View>

                <Button title='Open Settings' titleStyle={{ color: '#1D7DD7' }} style={{ marginTop: 50 }} buttonStyle={{ backgroundColor: 'white', }} />
            </View>
        );
    }
}