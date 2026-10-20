import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useBottomInset } from '../../utils/safeArea';
import { ClienteTabBar } from './ClienteTabBar';
import { COMPANY_COLORS } from '../../theme/theme';

export const TAB_BAR_HEIGHT = 68;

/** Espaço extra no fim do scroll (tab bar não sobrepõe mais o conteúdo). */
export function useTabBarScrollPadding(extraSpacing = 24): number {
  return extraSpacing;
}

export function useBottomTabBarHeight(): number {
  const bottomInset = useBottomInset();
  return TAB_BAR_HEIGHT + bottomInset;
}

export type BottomTabRoute = 'Home' | 'Explorar' | 'Reservas' | 'Pedidos' | 'Perfil' | 'Quiosque' | 'Cart' | 'Sacola' | 'Cards' | 'FormasPagamento' | 'AddItem' | 'Configuracoes' | 'Enderecos' | 'PedidoAcompanhamento' | 'EmpresaVendas' | 'ClienteQuiosques' | 'ClienteQuiosqueForm';

type CompanyTab = {
  route: Extract<BottomTabRoute, 'Home' | 'Quiosque' | 'AddItem' | 'EmpresaVendas' | 'Configuracoes'>;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
};

const COMPANY_TABS: CompanyTab[] = [
  { route: 'Home', label: 'Início', icon: 'home-outline', activeIcon: 'home' },
  { route: 'Quiosque', label: 'Quiosques', icon: 'storefront-outline', activeIcon: 'storefront' },
  { route: 'AddItem', label: 'Produtos', icon: 'cube-outline', activeIcon: 'cube' },
  { route: 'EmpresaVendas', label: 'Vendas', icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
  { route: 'Configuracoes', label: 'Ajustes', icon: 'settings-outline', activeIcon: 'settings' },
];

const TAB_MUTED = 'rgba(255,255,255,0.72)';

interface BottomTabBarProps {
  activeRoute?: BottomTabRoute;
}

export function BottomTabBar({ activeRoute }: BottomTabBarProps) {
  const navigation = useNavigation<any>();
  const { perfilUso } = useAuth();
  const bottomInset = useBottomInset();

  if (perfilUso === 'Cliente') {
    return <ClienteTabBar activeRoute={activeRoute} />;
  }

  return (
    <View style={[styles.shell, { paddingBottom: bottomInset }]}>
      <View style={styles.bottomBar}>
        {COMPANY_TABS.map((tab) => {
          const active = activeRoute === tab.route;
          return (
          <TouchableOpacity
            key={tab.route}
            style={styles.tabItem}
            onPress={() => !active && navigation.navigate(tab.route)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={active ? tab.activeIcon : tab.icon}
              size={22}
              color={active ? '#FFF' : TAB_MUTED}
            />
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: COMPANY_COLORS.primary,
  },
  bottomBar: {
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: 12,
  },
  tabLabel: {
    color: TAB_MUTED,
    fontSize: 10,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#FFF',
    fontWeight: '800',
  },
});
