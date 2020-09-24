import React, { useState, useContext } from 'react';
import { validateAll } from 'indicative/validator';
import { View, Text, KeyboardAvoidingView, ImageBackground } from 'react-native';
import { Input, Button } from 'react-native-elements';

import { AuthContext } from '../components/utils/authContext';

export default function SignInScreen() {

    const [emailAddress, setemailAddress] = useState('svitlana@mscp.dk');
    const [password, setPassword] = useState('mmm');
    const [SignUpErrors, setSignUpErrors] = useState({});

    const { signIn, signUp }:any = useContext(AuthContext);

    const handleSignIn = () => {
        const rules = {
            email: 'required|email',
            password: 'required|string|min:1|max:40'
        };

        const data = {
            email: emailAddress,
            password: password
        };

        const messages = {
            required: (field:any) => `${field} is required`,
            'username.alpha': 'Username contains unallowed characters',
            'email.email': 'Please enter a valid email address',
            'password.min': 'Wrong Password?'
        };

        validateAll(data, rules, messages)
            .then(() => {
                //console.log('success sign in');
                signIn({ emailAddress, password });
            })
            .catch(err => {
                const formatError = {};
                err.forEach((err:any) => {
                    formatError[err.field] = err.message;
                });
                setSignUpErrors(formatError);
            });
    };

    return (
        <ImageBackground source={require('../../assets/images/background.png')} style={{flex: 1,alignSelf:'stretch'}}>
        <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior="padding" enabled keyboardVerticalOffset={0}>
            <View style={{padding:25}}>
                <Text style={{color: 'white', fontSize: 30, fontWeight: '700', textAlign: "center", paddingBottom: 10 }}>Company Name</Text>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '300', textAlign: "center", paddingBottom: 25 }}>Lorem ipsum, or lipsum as it is sometimes known, is dummy text used in laying out print, graphic or web designs</Text>
                <Text style={{ color: 'white', fontSize: 20, fontWeight: '500', textAlign: "center", paddingBottom: 15 }}>Please sign in:</Text>

                <Input style={{backgroundColor:'white',borderTopRightRadius:10,borderTopLeftRadius:10, padding:15,marginBottom:0}} containerStyle={{margin:0,padding:0}}
                    placeholder="E-mail"
                    value={emailAddress}
                    onChangeText={setemailAddress}
                    errorStyle={{ color: 'red' }}
                    errorMessage={SignUpErrors ? SignUpErrors.email : null}
                />
                <Input style={{backgroundColor:'white',borderBottomRightRadius:10,borderBottomLeftRadius:10, padding:15, marginTop:-24,marginBottom:-20}}  containerStyle={{margin:0,padding:0}}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    errorStyle={{ color: 'red' }}
                    errorMessage={SignUpErrors ? SignUpErrors.password : null}
                />
                <Button buttonStyle={{ margin: 10, marginTop: 5,padding:15,borderRadius:10 }} title="Sign in" onPress={() => handleSignIn()} />
                <Text style={{fontSize:16,color: 'white',alignSelf:'center',  marginTop:10}} onPress={() => signUp()}>
                    No Acount? Sign Up
                </Text>
            </View>


        </KeyboardAvoidingView>
        </ImageBackground>
    );
};