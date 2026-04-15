import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import StudentTabs from './src/navigation/StudentTabs';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './src/notifications';
import api from './src/api';

const Stack = createStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('user'),
      AsyncStorage.getItem('token'),
    ]).then(([savedUser, token]) => {
      if (savedUser && token) setUser(JSON.parse(savedUser));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    registerForPushNotificationsAsync()
      .then(token => {
        if (token) return api.put('/auth/fcm-token', { token });
      })
      .catch(() => {});
  }, [user]);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login">
            {props => <LoginScreen {...props} setUser={setUser} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="StudentTabs">
            {props => <StudentTabs {...props} setUser={setUser} user={user} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
