import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useBottomInset } from '../../utils/safeArea';
import { usePurchaseCart } from '../../context/PurchaseCartContext';
import { CLIENTE_COLORS } from '../../theme/theme';

const PRIMARY = CLIENTE_COLORS.primary;
const ACTIVE = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.72)';

type ClienteTab = 'Home' | 'Explorar' | 'Reservas' | 'Pedidos' | 'ClienteQuiosques' | 'Perfil';

const TABS: {
  key: ClienteTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'Home', label: 'Início', icon: 'home-outline', iconActive: 'home' },
  { key: 'Explorar', label: 'Produtos', icon: 'search-outline', iconActive: 'search' },
  { key: 'Reservas', label: 'Carrinho', icon: 'cart-outline', iconActive: 'cart' },
  { key: 'Pedidos', label: 'Pedidos', icon: 'receipt-outline', iconActive: 'receipt' },
  { key: 'ClienteQuiosques', label: 'Quiosques', icon: 'storefront-outline', iconActive: 'storefront' },
  { key: 'Perfil', label: 'Perfil', icon: 'person-outline', iconActive: 'person' },
];

function resolveActive(activeRoute?: string): ClienteTab {
  if (activeRoute === 'Reservas' || activeRoute === 'Sacola') return 'Reservas';
  if (activeRoute === 'Explorar' || activeRoute === 'Cart') return 'Explorar';
  if (activeRoute === 'Pedidos' || activeRoute === 'PedidoAcompanhamento') return 'Pedidos';
  if (activeRoute === 'ClienteQuiosques' || activeRoute === 'ClienteQuiosqueForm') return 'ClienteQuiosques';
  if (
    activeRoute === 'Perfil' ||
    activeRoute === 'Configuracoes' ||
    activeRoute === 'Enderecos' ||
    activeRoute === 'Cards' ||
    activeRoute === 'FormasPagamento'
  ) {
    return 'Perfil';
  }
  return 'Home';
}

export function ClienteTabBar({
  activeRoute,
}: {
  activeRoute?: string;
}) {
  const navigation = useNavigation<any>();
  const bottomInset = useBottomInset();
  const { itemCount } = usePurchaseCart();
  const active = resolveActive(activeRoute);

  return (
    <View style={[styles.shell, { paddingBottom: Math.max(bottomInset, 8) }]}>
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          const color = isActive ? ACTIVE : MUTED;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.item}
              onPress={() => active !== tab.key && navigation.navigate(tab.key)}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={isActive ? tab.iconActive : tab.icon}
                  size={22}
                  color={color}
                />
                {tab.key === 'Reservas' && itemCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {itemCount > 99 ? '99+' : itemCount}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.label, { color }, isActive && styles.labelActive]}>
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
    backgroundColor: PRIMARY,
  },
  bar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconWrap: {
    width: 28,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: PRIMARY,
    fontSize: 9,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
  labelActive: {
    fontWeight: '800',
  },
});
