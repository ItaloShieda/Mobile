import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { AuthBrand } from '../../components/auth/AuthBrand';
import { BottlesHero } from '../../components/auth/BottlesHero';
import { CustomButton } from '../../components/Button/CustomButton';
import { RootStackParamList } from '../../navigation/types';
import { useHeaderTopPadding } from '../../utils/safeArea';
import { styles } from './styles';

export function WelcomeScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'Welcome'>>();
  const topPadding = useHeaderTopPadding(16);
  const [mensagemSucesso, setMensagemSucesso] = useState(route.params?.mensagemSucesso);

  useEffect(() => {
    if (!route.params?.mensagemSucesso) return;
    setMensagemSucesso(route.params.mensagemSucesso);
    const timer = setTimeout(() => setMensagemSucesso(undefined), 4000);
    return () => clearTimeout(timer);
  }, [route.params?.mensagemSucesso]);

  return (
    <View style={styles.root}>
      <View style={[styles.hero, { paddingTop: topPadding }]}>
        {mensagemSucesso ? (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>{mensagemSucesso}</Text>
          </View>
        ) : null}
        <AuthBrand light size="lg" />
        <Text style={styles.kicker}>BEM-VINDO AO STOCK4EVENT</Text>
        <Text style={styles.description}>Gerenciamento inteligente</Text>
      </View>

      <View style={styles.sheet}>
        <BottlesHero />
        <CustomButton title="Entrar" showArrow onPress={() => navigation.navigate('Login')} />
        <CustomButton
          title="Criar conta"
          variant="outline"
          onPress={() => navigation.navigate('Cli_For')}
        />
      </View>
    </View>
  );
}
