import React, { useState } from 'react';
import { Text, ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { AuthScreenShell } from '../../components/auth/AuthScreenShell';
import { CustomInput } from '../../components/Input/CustomInput';
import { CustomButton } from '../../components/Button/CustomButton';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { AUTH_NAVY } from '../../theme/authTheme';
import { styles } from './styles';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
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

  const handleTestLogin = async (testEmail: string) => {
    setEmail(testEmail);
    setSenha('1234');
    await performLogin(testEmail, '1234');
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

      <View style={styles.testAccessSection}>
        <Text style={styles.testAccessTitle}>Acessos locais para teste</Text>
        <View style={styles.testAccessRow}>
          <TouchableOpacity
            style={styles.testAccessButton}
            onPress={() => handleTestLogin('fornecedor@teste.com')}
            disabled={loading}
          >
            <Text style={styles.testAccessButtonText}>Fornecedor</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.testAccessButton}
            onPress={() => handleTestLogin('cliente@teste.com')}
            disabled={loading}
          >
            <Text style={styles.testAccessButtonText}>Cliente</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.testAccessHint}>Senha dos dois acessos: 1234</Text>
      </View>

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
