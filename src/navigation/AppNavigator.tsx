import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { PurchaseCartProvider } from '../context/PurchaseCartContext';
import { useAuth } from '../context/AuthContext';
import { useSafeTopPadding } from '../utils/safeArea';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

export function AppNavigator() {
  const { isLoading, isAuthenticated } = useAuth();
  const safeTopPadding = useSafeTopPadding();

  if (isLoading) {
    return <SafeAreaView style={[styles.loading, { paddingTop: safeTopPadding }]} edges={['left', 'right', 'bottom']}>
      <ActivityIndicator size="large" color="#FFAD19" />
    </SafeAreaView>;
  }

  return <NavigationContainer>
    {isAuthenticated ? <PurchaseCartProvider><MainNavigator /></PurchaseCartProvider> : <AuthNavigator />}
  </NavigationContainer>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
});
