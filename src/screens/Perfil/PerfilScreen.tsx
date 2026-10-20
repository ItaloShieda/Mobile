import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NotificationsModal } from '../../components/Card/NotificationsModal';
import { BottomTabBar, useBottomTabBarHeight } from '../../components/layout/BottomTabBar';
import { useAuth } from '../../context/AuthContext';
import { useConfirmDialog } from '../../context/ConfirmDialogContext';
import { useHeaderTopPadding } from '../../utils/safeArea';
import { RootStackParamList } from '../../navigation/types';
import { PRIMARY, styles } from './styles';

const MENU = [
  {
    key: 'cliente',
    icon: 'person-outline' as const,
    title: 'Dados do cliente',
    hint: 'Nome, e-mail e informações da conta',
    screen: 'Configuracoes' as const,
  },
  {
    key: 'endereco',
    icon: 'location-outline' as const,
    title: 'Endereço',
    hint: 'Gerencie seus endereços',
    screen: 'Enderecos' as const,
  },
  {
    key: 'pagamento',
    icon: 'card-outline' as const,
    title: 'Pagamento',
    hint: 'Cartões, PIX e outras formas',
    screen: 'FormasPagamento' as const,
  },
];

export function PerfilScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, signOut } = useAuth();
  const { confirm } = useConfirmDialog();
  const topPadding = useHeaderTopPadding(8);
  const tabBarHeight = useBottomTabBarHeight();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = () => {
    confirm({
      title: 'Sair da conta',
      message: 'Deseja encerrar sua sessão?',
      confirmText: 'Sair',
      destructive: true,
      onConfirm: signOut,
    });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
      >
        <View style={[styles.header, { paddingTop: topPadding }]}>
          <View style={styles.headerTop}>
            <View style={styles.brandRow}>
              <Text style={styles.brandQuick}>Quick</Text>
              <Text style={styles.brandStock}>Stock</Text>
            </View>
            <TouchableOpacity
              style={styles.bellButton}
              onPress={() => setNotificationsOpen(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Meu perfil</Text>
          <Text style={styles.subtitle}>Gerencie suas informações e preferências.</Text>
        </View>

        <View style={styles.sheet}>
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Ionicons name="person-outline" size={24} color={PRIMARY} />
            </View>
            <View style={styles.userCopy}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.nome || user?.empresa?.nome || 'Conta QuickStock'}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email || '—'}
              </Text>
            </View>
          </View>

          <View style={styles.menuCard}>
            {MENU.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.menuRow}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.8}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon} size={20} color={PRIMARY} />
                </View>
                <View style={styles.menuCopy}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuHint}>{item.hint}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#C5CAD3" />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => setNotificationsOpen(true)}
              activeOpacity={0.8}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name="notifications-outline" size={20} color={PRIMARY} />
              </View>
              <View style={styles.menuCopy}>
                <Text style={styles.menuTitle}>Notificações</Text>
                <Text style={styles.menuHint}>Escolha como deseja ser informado</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#C5CAD3" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() =>
                confirm({
                  title: 'Ajuda',
                  message:
                    'Dúvidas e suporte: fale com a equipe QuickStock pelo e-mail de cadastro da sua conta.',
                  confirmText: 'Ok',
                  cancelText: 'Fechar',
                  onConfirm: () => undefined,
                })
              }
              activeOpacity={0.8}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name="help-circle-outline" size={20} color={PRIMARY} />
              </View>
              <View style={styles.menuCopy}>
                <Text style={styles.menuTitle}>Ajuda</Text>
                <Text style={styles.menuHint}>Dúvidas e suporte</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#C5CAD3" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutCard} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={20} color="#E23B3B" />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomTabBar activeRoute="Perfil" />

      <NotificationsModal
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        empresaId={user?.empresa?.id}
      />
    </View>
  );
}
