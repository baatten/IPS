import React from 'react';
import { Text, ActivityIndicator, ImageBackground } from 'react-native';

export default class ResetPassword extends React.Component {

    render() {

        return (
            <ImageBackground source={require('../../assets/splash.png')} style={{ flex: 1, alignSelf: 'stretch', paddingTop: '100%' }}>
                <ActivityIndicator size="large" color='white'></ActivityIndicator>
                <Text style={{ marginTop: 10, alignSelf: 'center', color: 'white', fontSize: 24 }}>Loading</Text>
            </ImageBackground>
        );
    }
}