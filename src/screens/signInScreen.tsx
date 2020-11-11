import React, { useState, useContext, useEffect } from 'react';
import { validateAll } from 'indicative/validator';
import { View, Text, KeyboardAvoidingView, ImageBackground, Alert, TouchableOpacity } from 'react-native';
import { Input, Button, Icon } from 'react-native-elements';
import * as Location from 'expo-location';
import { AuthContext } from '../components/utils/authContext';
import ActionSheet from "react-native-actions-sheet";
import ResetPassword from '../components/resetPassword/resetPassword'

export default function SignInScreen() {

    const sheetRef: any = React.useRef();
    const [emailAddress, setemailAddress] = useState('baatten@gmail.com');
    const [password, setPassword] = useState('mmm');
    const [isLoading, setisLoading] = useState(false);
    const [SignUpErrors, setSignUpErrors] = useState({});
    const { signIn, signUp, checkPermissions, user }: any = useContext(AuthContext);

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        //checkLocationPermissions();
    });

    const handleSignIn = async () => {

        let { status } = await Location.getPermissionsAsync();

        if (status == 'granted') {

            const rules = {
                email: 'required|email',
                password: 'required|string|min:1|max:40'
            };

            const data = {
                email: emailAddress,
                password: password
            };

            const messages = {
                required: (field: any) => `${field} is required`,
                'username.alpha': 'Username contains unallowed characters',
                'email.email': 'Please enter a valid email address',
                'password.min': 'Wrong Password?'
            };

            validateAll(data, rules, messages)
                .then(() => {
                    console.log('success sign in');

                    setisLoading(true);
                    signInf();

                })
                .catch(err => {
                    const formatError = {};

                    setSignUpErrors(formatError);
                });
        }
        else
            checkPermissions();
    };

    const signInf = async () => {

        await signIn({ emailAddress, password });
        setisLoading(false);
    }

    const test = () => {
        console.log('test')
    }

    return (

        <ImageBackground source={require('../../assets/splash.png')} style={{ flex: 1, alignSelf: 'stretch' }}>
            <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior="padding" enabled keyboardVerticalOffset={0}>
                <View style={{ padding: 25 }}>
                    <Text style={{ color: 'white', fontSize: 30, fontWeight: '700', textAlign: "center", paddingBottom: 10 }}>T65 Locator</Text>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '300', textAlign: "center", paddingBottom: 25, lineHeight: 24 }}>We pride ourselves on our thorough and friendly support. We work in the trenches with you, like no other FMO in the country! </Text>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: '500', textAlign: "center", paddingBottom: 15 }}>Please sign in:</Text>

                    <Input inputStyle={{ padding: 10 }}
                        inputContainerStyle={{ borderBottomWidth: 0, }}
                        containerStyle={{ backgroundColor: 'white', borderTopLeftRadius: 10, borderTopRightRadius: 10, height: 48, marginBottom: 1 }}
                        placeholder="E-mail"
                        leftIcon={<Icon name='user' type='font-awesome' />}
                        leftIconContainerStyle={{ margin: 5 }}
                        value={emailAddress}
                        onChangeText={setemailAddress}
                    />
                    <Input inputStyle={{ padding: 10 }}
                        inputContainerStyle={{ borderBottomWidth: 0, }}
                        containerStyle={{ backgroundColor: 'white', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, height: 48, marginBottom: 5 }}
                        placeholder="Password"
                        leftIcon={<Icon name='lock' type='font-awesome' />}
                        leftIconContainerStyle={{ margin: 5 }}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true} autoCapitalize='none'
                    />

                    <View style={[{ flexDirection: 'row', width: '100%' }]}>
                        <View style={[{ flexDirection: 'column', width: '50%' }]}>
                            <Button loading={isLoading} style={{ width: '100%' }} buttonStyle={{ margin: 0, marginTop: 5, padding: 15, borderRadius: 10 }} title="Sign in" onPress={() => handleSignIn()} />
                        </View>
                        <View style={[{ flexDirection: 'column', width: '50%' }]}>
                            <Button buttonStyle={{ margin: 0, marginTop: 5, marginLeft: 10, padding: 15, borderRadius: 10, backgroundColor: 'gray' }} title="Register" onPress={() => signUp()} />
                        </View>

                    </View>
                    <Text onPress={() => sheetRef.current.setModalVisible()} style={{ fontSize: 16, color: 'white', alignSelf: 'center', marginTop: 20 }}>
                        Did you forget your Password?
                </Text>

                </View>

            </KeyboardAvoidingView>
            <ActionSheet defaultOverlayOpacity={0.90} ref={sheetRef}

                closeOnPressBack={false}
                closeOnTouchBackdrop={false}
                bounceOnOpen={true}
                containerStyle={{ backgroundColor: '#1D7DD7', height: '100%', minHeight: '100%' }}>
                <TouchableOpacity onPress={() => sheetRef.current.setModalVisible()}>
                    <Icon onPress={() => test()}
                        color='rgba(255,255,255,0.15)'
                        containerStyle={{ alignSelf: 'flex-end', margin: 20 }} style={{}} name="close"
                        iconStyle={{ color: 'white', alignSelf: 'center' }} size={16} reverse />
                </TouchableOpacity>
                <ResetPassword />
            </ActionSheet>
        </ImageBackground>
    );
};