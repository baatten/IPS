import React from 'react';
import { View, Text, Alert, ScrollView, Modal, Linking } from 'react-native';
import GLOBALS from '../globals';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Avatar, Button, Card, ListItem, Input, Icon } from 'react-native-elements';
import { StackNavigationProp, createStackNavigator } from '@react-navigation/stack';
import { AppContext } from '../components/utils/appContext';
import { SettingsScreen } from './settingsScreen';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const AccountStack = createStackNavigator();

type settingsState = {
    user: User
    isLoading: boolean,
    accountDetailsIsValid: boolean,
    modalVisible: boolean,
    showDeleteAccount: boolean
}

type User = {
    name: string,
    surname: string,
    address: string,
    city: string,
    state: string,
    zipCode: string
    email: string,
    phone: string,
    mobile: string
}

type SettingsProps = {
    navigation: StackNavigationProp<{}>;
};

export class AccountScreen extends React.Component<SettingsProps, settingsState> {


    //declare context: React.ContextType<typeof AppContext>
    static contextType = AppContext;

    form: any;
    PasswordForm: any;

    constructor(props: SettingsProps) {
        super(props)

        this.form = React.createRef();
        this.PasswordForm = React.createRef();

        this.state = { user: { name: '', surname: '', address: '', city: '', state: '', zipCode: '', email: '', phone: '', mobile: '' }, isLoading: true, accountDetailsIsValid: true, modalVisible: false, showDeleteAccount: false }
    }

    componentDidMount() {

        this.props.navigation.setOptions({
            headerShown: true,
            title: 'Account',
            headerTintColor: '#fff',
            headerTitleAlign: 'center',
            headerStyle: { backgroundColor: '#2185d0' },
            headerLeft: () => (
                <Button title='Sign out' onPress={() => this.signout()} style={{ paddingLeft: 5 }} type='clear' titleStyle={{ color: 'white' }} />
            )
        })
    }

    signout() {

        Alert.alert(
            'Sign out',
            'Are you sure you want to sign out?',
            [
                {
                    text: 'No',
                    style: 'cancel'
                },
                { text: 'Yes', onPress: () => this.context.signOut() }
            ],
            { cancelable: false }
        );
    }

    async updateUserPassword(password: string, newPassword: string) {

        try {
            const res = await fetch(GLOBALS.BASE_URL + '/api/client/updatePassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    { currentPass: password, newPass: newPassword }
                ),
            })
            if (res.status === 200) {

                //this.setModalVisible(false);
                this.setState({ modalVisible: false });
            }
            else {
                Alert.alert('error happened.')
            }
        }
        catch (error) {
            console.error('An unexpected error happened occurred:', error)
            //setErrorMsg(error.message)
        }
    }

    async deleteAccount() {

    }

    render() {

        const context = this.context;

        return (
            <>
                <ScrollView style={{ padding: 15 }}>
                    <Avatar containerStyle={{ marginTop: 15, alignSelf: 'center' }} rounded title="CR" size='xlarge' titleStyle={{ color: 'white' }} overlayContainerStyle={{ backgroundColor: '#9f9f9f' }} />
                    <View style={{ marginTop: 35 }}>
                        <ListItem onPress={() => this.props.navigation.navigate('SettingsScreen' as never, {} as never)} tvParallaxProperties={null} hasTVPreferredFocus={null} bottomDivider style={{ borderTopLeftRadius: 10, borderTopEndRadius: 10 }} containerStyle={{ borderTopLeftRadius: 10, borderTopEndRadius: 10 }}>
                            <ListItem.Content>
                                <ListItem.Title>Personal details</ListItem.Title>

                            </ListItem.Content>
                            <ListItem.Chevron size={20} tvParallaxProperties={null} />
                        </ListItem>

                        <ListItem onPress={() => this.setState({ modalVisible: true })} tvParallaxProperties={null} hasTVPreferredFocus={null} style={{ borderBottomEndRadius: 10, borderBottomLeftRadius: 10 }} containerStyle={{ borderBottomEndRadius: 10, borderBottomLeftRadius: 10 }}>
                            <ListItem.Content>
                                <ListItem.Title >Change password</ListItem.Title>
                            </ListItem.Content>
                            <ListItem.Chevron size={20} tvParallaxProperties={null} />
                        </ListItem>
                    </View>
                    <View style={{ marginTop: 25 }}>
                        <ListItem onPress={() => this.setState({ showDeleteAccount: true })} tvParallaxProperties={null} hasTVPreferredFocus={null} style={{ borderRadius: 10 }} containerStyle={{ borderRadius: 10, backgroundColor: '#D73131' }}>
                            <ListItem.Title style={{ flex: 1, color: 'white', textAlign: 'center' }} >Delete my account</ListItem.Title>
                        </ListItem>
                    </View>
                    <TouchableOpacity onPress={() => Linking.openURL('https://web.t-65locator.com/privacyPolicy')}>
                        <Text style={{ fontSize: 16, marginTop: 25, alignSelf: 'center', color: '#909090' }}>Privacy Policy</Text>
                    </TouchableOpacity>
                </ScrollView>
                <Modal animationType="slide" presentationStyle='formSheet' visible={this.state.modalVisible} >
                    <View>
                        <View style={[{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#2185d0', alignContent: 'space-between', paddingVertical: 10 }]}>
                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                <Button type='clear' titleStyle={{ color: 'white' }} title='Cancel' onPress={() => { this.setState({ modalVisible: false }) }} />
                            </View>
                            <View style={{ flex: 2, flexDirection: 'column' }}>
                                <Text style={{ alignSelf: 'center', fontWeight: '500', fontSize: 18, color: 'white', textAlign: 'center' }}>Change password</Text>
                            </View>


                            <View style={{ flex: 1, alignSelf: 'flex-end' }}>
                                <Button title='Save' onPress={() => this.PasswordForm.handleSubmit()} style={{ paddingRight: 5 }} type='clear' titleStyle={{ color: 'white' }} />
                            </View>
                        </View>
                        <Formik innerRef={p => (this.PasswordForm = p)}
                            initialValues={{ password: '', newPassword: '', newPassConfirm: '' }}
                            onSubmit={values => this.updateUserPassword(values.password, values.newPassword)}
                            validationSchema={Yup.object({
                                password: Yup.string()
                                    .min(1, 'Minimum 1 characters')
                                    .required('Required'),
                                newPassword: Yup.string()
                                    .min(1, 'Minimum 1 characters')
                                    .required('Required'),
                                newPassConfirm: Yup.string()
                                    .min(1, 'Minimum 6 characters')
                                    .required('Required')
                                    .test('passwords-match', 'Passwords must match!', function (value) {
                                        return this.parent.newPassword === value;
                                    }),
                            })}>
                            {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
                                <Card containerStyle={{ padding: 15, margin: 0, borderWidth: 0 }}>
                                    <Input autoCompleteType={undefined} secureTextEntry={true} autoCapitalize='none' errorMessage={errors.password} onChangeText={handleChange('password')} label='Current Password' placeholder="Enter Current Password" value={values.password} />
                                    <Input autoCompleteType={undefined} secureTextEntry={true} autoCapitalize='none' errorMessage={errors.newPassword} onChangeText={handleChange('newPassword')} label='New Password' placeholder="Enter New Password" value={values.newPassword} />
                                    <Input autoCompleteType={undefined} secureTextEntry={true} autoCapitalize='none' errorMessage={errors.newPassConfirm} onChangeText={handleChange('newPassConfirm')} label='Confirm New Password' placeholder="re-enter new password" value={values.newPassConfirm} />
                                </Card>
                            )}
                        </Formik>
                    </View>
                </Modal>
                <Modal visible={this.state.showDeleteAccount} presentationStyle='formSheet' animationType='slide'>


                    <ScrollView style={{ flex: 1, marginTop: 25, padding: 25 }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <SafeAreaView style={{ flexGrow: 1 }}>
                            <Icon color='#D73131' size={150} name='exclamation' type='font-awesome-5' tvParallaxProperties={null} />

                            <Text style={{ color: '#D73131', fontSize: 32, fontWeight: 'bold', marginTop: 25, marginBottom: 15, textAlign: 'center' }}>Delete My Account</Text>
                            <Text style={{ marginBottom: 10, fontSize: 17, lineHeight: 24, fontWeight: 'bold' }}>You are about to delete your account. The following changes will take effect permanently, if you continue:</Text>

                            <Text style={{ fontSize: 16, marginBottom: 5 }}> - Deletes all personal data</Text>
                            <Text style={{ fontSize: 16, marginBottom: 5 }}> - Deletes your activity within the App</Text>
                            <Text style={{ fontSize: 16, marginBottom: 5 }}> - Deletes your E-mail and password history</Text>
                            <Text style={{ fontSize: 16, marginBottom: 15 }}> - Deletes Your leads history</Text>

                            <Text style={{ marginBottom: 25, fontSize: 16, lineHeight: 24, fontWeight: 'bold' }}>Do you wish to proceed with this permanent change?</Text>

                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
                                <Button style={{ flexDirection: 'column' }} buttonStyle={{ paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#909090', borderRadius: 10 }} title='Keep account' onPress={() => this.setState({ showDeleteAccount: false })} />
                                <Button style={{ flexDirection: 'column' }} buttonStyle={{ marginLeft: 10, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#D73131', borderRadius: 10 }} title='Delete Account' onPress={() => this.deleteAccount()} />
                            </View>
                        </SafeAreaView>
                    </ScrollView>


                </Modal>
            </>
        );
    }
}

export function AccountStackScreen() {
    return (
        <AccountStack.Navigator>
            <AccountStack.Screen name="AccountScreen" component={AccountScreen} />
            <AccountStack.Screen name="SettingsScreen" component={SettingsScreen} />
        </AccountStack.Navigator>
    );
}