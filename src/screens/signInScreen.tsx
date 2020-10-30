import React, { useState, useContext } from 'react';
import { validateAll } from 'indicative/validator';
import { View, Text, KeyboardAvoidingView, ImageBackground } from 'react-native';
import { Input, Button, Icon } from 'react-native-elements';

import { AuthContext } from '../components/utils/authContext';
import { LoginReducer } from '../components/utils/reducers';

export default function SignInScreen() {

    const [emailAddress, setemailAddress] = useState('baatten@gmail.com');
    const [password, setPassword] = useState('mmm');
    const [isLoading, setisLoading] = useState(false);
    const [SignUpErrors, setSignUpErrors] = useState({});

    const { signIn, signUp, user }: any = useContext(AuthContext);

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
    };

    const signInf = async() => {

        const test = await signIn({ emailAddress, password });

        setisLoading(false);
    }

    return (
        <ImageBackground source={require('../../assets/images/background.png')} style={{ flex: 1, alignSelf: 'stretch' }}>
            <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior="padding" enabled keyboardVerticalOffset={0}>
                <View style={{ padding: 25 }}>
                    <Text style={{ color: 'white', fontSize: 30, fontWeight: '700', textAlign: "center", paddingBottom: 10 }}>Company Name</Text>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '300', textAlign: "center", paddingBottom: 25 }}>Lorem ipsum, or lipsum as it is sometimes known, is dummy text used in laying out print, graphic or web designs</Text>
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
                            <Button buttonStyle={{ margin: 0, marginTop: 5, marginLeft: 10, padding: 15, borderRadius: 10, backgroundColor: 'grey' }} title="Register" onPress={() => signUp()} />
                        </View>

                    </View>
                    <Text style={{ fontSize: 16, color: 'white', alignSelf: 'center', marginTop: 20 }}>
                        Did you forget your Password?
                </Text>

                </View>

            </KeyboardAvoidingView>

        </ImageBackground>
    );
};