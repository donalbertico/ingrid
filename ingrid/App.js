import React from 'react';
import type {Node} from 'react';
import * as AWS from 'aws-sdk'
import { ConfigurationOptions } from 'aws-sdk'
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import UploadScreen from './screens/UploadScreen'
import OnboardScreen from './screens/OnboardScreen'
import SimilarProductScreen from './screens/SimilarProductScreen'
import StylingScreen from './screens/StylingScreen'
import CommunityScreen from './screens/CommunityScreen'
import PostScreen from './screens/PostScreen'
import Ant from 'react-native-vector-icons/AntDesign'
import Ion from 'react-native-vector-icons/Ionicons'
import Font from 'react-native-vector-icons/FontAwesome'

const Stack = createNativeStackNavigator();

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  Ant.loadFont()
  Ion.loadFont()
  Font.loadFont()

  const backgroundStyle = {
    backgroundColor: isDarkMode ? 'white' : 'dark',
  };
  const configuration: ConfigurationOptions = {
    region: 'eu-west-2',
    secretAccessKey: 'wslnkpylixTUnlxKZUTJv9XxN8FYuPK4JD1ausU+',
    accessKeyId: 'AKIAVMDCSQUUPBCY2D7N'
  }
  AWS.config.update(configuration)

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown:false}}>
          <Stack.Screen name="onboard" component={OnboardScreen}/>
          <Stack.Screen name="upload" component={UploadScreen}/>
          <Stack.Screen name="similar" component={SimilarProductScreen}/>
          <Stack.Screen name="styling" component={StylingScreen}/>
          <Stack.Screen name="community" component={CommunityScreen}/>
          <Stack.Screen name="post" component={PostScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
