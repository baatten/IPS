/**
 * @format
 */

import { AppRegistry, Text, TextInput } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

if (Text.defaultProps == null) Text.defaultProps = {};
    Text.defaultProps.maxFontSizeMultiplier = 1.3;
    
if (TextInput.defaultProps == null) TextInput.defaultProps = {};
    TextInput.defaultProps.maxFontSizeMultiplier = 1.3;

AppRegistry.registerComponent(appName, () => App);