import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { BackButton } from '../Header/BackButton';
import { AuthBrand } from './AuthBrand';
import { AUTH_CREAM, AUTH_NAVY } from '../../theme/authTheme';
import { useAppGoBack } from '../../hooks/useAppGoBack';
import { useHeaderTopPadding } from '../../utils/safeArea';

interface AuthScreenShellProps {
  subtitle?: string;
  children: ReactNode;
  showBack?: boolean;
}

export function AuthScreenShell({
  subtitle = 'BEM-VINDO AO STOCK4EVENT',
  children,
  showBack = true,
}: AuthScreenShellProps) {
  const topPadding = useHeaderTopPadding(8);
  const goBack = useAppGoBack('Welcome');

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        {showBack ? (
          <View style={styles.backWrap}>
            <BackButton onPress={goBack} iconColor={AUTH_NAVY} />
          </View>
        ) : (
          <View style={styles.backSpacer} />
        )}
        <AuthBrand light size="md" />
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH_CREAM,
  },
  header: {
    backgroundColor: AUTH_NAVY,
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
  },
  backWrap: {
    alignSelf: 'stretch',
    marginBottom: 8,
  },
  backSpacer: {
    height: 32,
    marginBottom: 8,
  },
  subtitle: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  body: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 36,
  },
});
