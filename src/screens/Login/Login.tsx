import React, { useState } from 'react';
import { Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { AuthScreenShell } from '../../components/auth/AuthScreenShell';
import { CustomInput } from '../../components/Input/CustomInput';
import { CustomButton } from '../../components/Button/CustomButton';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { AUTH_NAVY } from '../../theme/authTheme';
import { styles } from './styles';

// Login salvo só na máquina de quem desenvolve, via .env.local (fora do git).
const LOGIN_SALVO_EMAIL = __DEV__ ? process.env.EXPO_PUBLIC_LOGIN_EMAIL ?? '' : '';
const LOGIN_SALVO_SENHA = __DEV__ ? process.env.EXPO_PUBLIC_LOGIN_SENHA ?? '' : '';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signIn } = useAuth();
  const [email, setEmail] = useState(LOGIN_SALVO_EMAIL);
  const [senha, setSenha] = useState(LOGIN_SALVO_SENHA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const performLogin = async (loginEmail: string, loginSenha: string) => {
    setError('');
    setLoading(true);
    try {
      await signIn({ email: loginEmail, senha: loginSenha });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      setError('Preencha e-mail e senha.');
      return;
    }

    await performLogin(email.trim().toLowerCase(), senha.trim());
  };

  return (
    <AuthScreenShell>
      <CustomInput
        iconName="mail"
        placeholder="Digite seu e-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <CustomInput
        iconName="lock"
        placeholder="Digite sua senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator color={AUTH_NAVY} style={styles.loader} />
      ) : (
        <CustomButton title="Entrar" showArrow onPress={handleLogin} />
      )}

      <TouchableOpacity
        onPress={() =>
          navigation.navigate('ForgotPassword', {
            email: email.trim() || undefined,
          })
        }
      >
        <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
      </TouchableOpacity>
    </AuthScreenShell>
  );
}
