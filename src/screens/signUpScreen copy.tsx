import React, { useEffect, useState, useContext, useImperativeHandle } from 'react';
import GLOBALS from '../globals';
import { View, Text, ScrollView, KeyboardAvoidingView, Alert } from 'react-native';
import { Input, Card, Button } from 'react-native-elements';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthContext } from '../components/utils/authContext';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

type settingsState = {
    user: User
    isLoading: boolean
}

type User = {
    name: string,
    surname: string,
    address: string,
    city: string,
    state: string,
    zipCode: string
    email: string,
    phone: string
}

type Props = {
    navigation: StackNavigationProp<{}>;
};

export default class SignUpScreen extends React.Component<Props, settingsState> {

    static contextType = AuthContext;
    form: any;

    constructor(props: Props) {
        super(props);



        this.form = React.createRef();

        this.state = { user: { name: '', surname: '', address: '', city: '', state: '', zipCode: '', email: '', phone: '' }, isLoading: false, }
    }

    async saveUserDetails(user: User) {

        console.log(user)

        try {
            const res = await fetch(GLOBALS.BASE_URL + '/api/client/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    { user }
                ),
            })
            if (res.status === 200) {

                const responseData = await res.json();

                Alert.alert('Your new details was saved.')
            }
            else {

            }
        }
        catch (error) {
            console.error('An unexpected error happened occurred:', error)
            //setErrorMsg(error.message)
        }
    }

    render() {

        const values: User = this.state.user;

        return (
            <KeyboardAvoidingView style={{ padding: 15, backgroundColor: '#f7fafb', flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior="padding" enabled keyboardVerticalOffset={0}>
                <Wizard initialValues={values} onSubmit={async (values: User) => console.log('Wizard submit', values)} >
                    <WizardStep onSubmit={() => console.log('Step1 onSubmit')}
                        validationSchema={Yup.object({
                            name: Yup.string().required('required')
                            
                            .min(3,''),
                            surname: Yup.string().required('required'),
                        })} >

                        <View>
                            <Text>First Name</Text>
                            <Input value={values.name} placeholder="First Name" />
                        </View>

                        <View>
                            <Text>Last Name</Text>
                            <Input placeholder="Last Name" />
                        </View>
                    </WizardStep>
                    <WizardStep
                        onSubmit={() => console.log('Step2 onSubmit')}
                        validationSchema={Yup.object({
                            email: Yup.string()
                                .email('Invalid email address')
                                .required('required'),
                        })} >
                        <View>
                            <Text>Email</Text>
                            <Input placeholder="Email" />

                        </View>
                    </WizardStep>
                </Wizard>

            </KeyboardAvoidingView>
        );
    }
}

const WizardStep = ({ children }) => children;

const Wizard = ({ children, initialValues, onSubmit }) => {
    const [stepNumber, setStepNumber] = useState(0);
    const steps = React.Children.toArray(children);
    const [snapshot, setSnapshot] = useState(initialValues);

    const step = steps[stepNumber];
    const totalSteps = steps.length;
    const isLastStep = stepNumber === totalSteps - 1;

    const next = values => {
        setSnapshot(values);
        setStepNumber(Math.min(stepNumber + 1, totalSteps - 1));
    };

    const previous = values => {
        setSnapshot(values);
        setStepNumber(Math.max(stepNumber - 1, 0));
    };

    const handleSubmit = async (values, bag) => {
        if (step.props.onSubmit) {
            await step.props.onSubmit(values, bag);
        }
        if (isLastStep) {
            return onSubmit(values, bag);
        } else {
            //bag.setTouched({});
            next(values);
        }
    };

    return (
        <Formik
            initialValues={snapshot}
            onSubmit={handleSubmit}
            validationSchema={step.props.validationSchema}  >
            {formik => (
                <View>
                    <Text style={{ alignSelf: 'center' }}>
                        Step {stepNumber + 1} of {totalSteps}
                    </Text>
                    {step}

                    <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                        <View style={[{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start', marginRight: 10 }]}>
                            {stepNumber > 0 && (
                                <Button onPress={() => previous(formik.values)} title='Back' />
                            )}
                        </View>
                        <View style={[{ flex: 1, flexDirection: 'column', justifyContent: 'flex-start' }]}>
                            <Button onPress={() => handleSubmit(formik.values)} disabled={formik.isSubmitting} title={isLastStep ? 'Submit' : 'Next'} />
                        </View>
                    </View>
                </View>
            )}
        </Formik>
    );
};