import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GivenScreen, { RootStackParamList } from './components/GivenScreen';
import UserScreen from './components/UserScreen';
import HintScreen from './components/HintScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="GivenScreen" component={GivenScreen} />
        <Stack.Screen name="UserScreen" component={UserScreen} />
        <Stack.Screen name="HintScreen" component={HintScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
