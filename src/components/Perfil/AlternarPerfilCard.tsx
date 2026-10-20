import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';
import type { ModoAtivo } from '../../services/perfilStorage';
import { CLIENTE_COLORS, COMPANY_COLORS } from '../../theme/theme';

const OPCOES: { modo: ModoAtivo; label: string; icon: keyof typeof Ionicons.glyphMap; cor: string }[] = [
  { modo: 'Cliente', label: 'Cliente', icon: 'person-outline', cor: CLIENTE_COLORS.primary },
  { modo: 'Fornecedor', label: 'Fornecedor', icon: 'storefront-outline', cor: COMPANY_COLORS.primary },
];

/** Troca entre as telas de cliente e de fornecedor; só aparece na conta demo. */
export function AlternarPerfilCard() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { podeAlternarPerfil, perfilUso, alternarPerfil } = useAuth();

  if (!podeAlternarPerfil) return null;

  const handleAlternar = async (modo: ModoAtivo) => {
    if (modo === perfilUso) return;
    await alternarPerfil(modo);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Alternar visão</Text>
      <Text style={styles.subtitle}>Sua conta tem acesso às telas de cliente e de fornecedor.</Text>
      <View style={styles.row}>
        {OPCOES.map((opcao) => {
          const ativo = perfilUso === opcao.modo;
          return (
            <TouchableOpacity
              key={opcao.modo}
              style={[styles.option, ativo && { backgroundColor: opcao.cor, borderColor: opcao.cor }]}
              onPress={() => handleAlternar(opcao.modo)}
              activeOpacity={0.85}
            >
              <Ionicons name={opcao.icon} size={18} color={ativo ? '#FFFFFF' : opcao.cor} />
              <Text style={[styles.optionText, { color: ativo ? '#FFFFFF' : opcao.cor }]}>
                {opcao.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
