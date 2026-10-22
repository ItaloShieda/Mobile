import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthBrand } from '../../components/auth/AuthBrand';
import { BottlesHero } from '../../components/auth/BottlesHero';
import { AUTH_GOLD, AUTH_NAVY } from '../../theme/authTheme';

export function AnimationScreen() {
  const navigation = useNavigation<any>();
  const [phase, setPhase] = useState<'loading' | 'splash'>('loading');
  const progress = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const run = Animated.sequence([
      Animated.timing(progress, {
        toValue: 1,
        duration: 1600,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(fade, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]);

    run.start(() => {
      setPhase('splash');
      fade.setValue(0);
      Animated.timing(fade, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }).start();
    });

    const timeout = setTimeout(() => navigation.replace('Welcome'), 3400);
    return () => {
      run.stop();
      clearTimeout(timeout);
    };
  }, [fade, navigation, progress]);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['8%', '100%'],
  });

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.center, { opacity: fade }]}>
        {phase === 'loading' ? (
          <>
            <Image
              source={require('../../assets/brand/avatar.png')}
              style={styles.avatar}
              accessibilityLabel="Stock4event"
            />
            <View style={styles.track}>
              <Animated.View style={[styles.fill, { width: barWidth }]} />
            </View>
            <Text style={styles.loading}>Carregando...</Text>
          </>
        ) : (
          <>
            <AuthBrand light slogan size="lg" />
            <View style={styles.splashArt}>
              <BottlesHero compact />
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH_NAVY,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 28,
  },
  track: {
    width: 180,
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: AUTH_GOLD,
  },
  loading: {
    marginTop: 14,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  splashArt: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
  },
});
