import React from 'react';
import { Text, ActivityIndicator, ImageBackground } from 'react-native';

export default function SplashScreen() {

    return (
            <ImageBackground source={require('../../assets/images/background.png')} style={{flex: 1,alignSelf:'stretch',paddingTop:'100%'}}>
                <ActivityIndicator size="large" color='white'></ActivityIndicator>
                <Text style={{marginTop:10,alignSelf:'center',color:'white',fontSize:24}}>Loading</Text>
            </ImageBackground>
    );
};