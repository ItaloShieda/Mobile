import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RemoteImage } from '../../components/media/RemoteImage';
import { NotificationsModal } from '../../components/Card/NotificationsModal';
import { BottomTabBar } from '../../components/layout/BottomTabBar';
import { getImageUrl } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useHeaderTopPadding } from '../../utils/safeArea';
import { PRIMARY, styles } from './styles';
import { useClienteHome } from './useClienteHome';

export function ClienteHomeScreen() {
  const { user } = useAuth();
  const topPadding = useHeaderTopPadding(8);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const {
    lojasEmDestaque,
    loading,
    tabBarHeight,
    distanciaDaLoja,
    abrirMarketplace,
    abrirSacola,
    abrirPedidos,
    abrirLoja,
  } = useClienteHome();

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

          <Text style={styles.greeting}>Olá, cliente!</Text>
          <Text style={styles.greetingHint}>Abasteça seu negócio com praticidade.</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.heroCard}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Bebidas para{'\n'}o seu negócio</Text>
              <Text style={styles.heroSubtitle}>
                Compre direto de fornecedores e acompanhe a disponibilidade.
              </Text>
              <TouchableOpacity
                style={styles.heroButton}
                onPress={abrirMarketplace}
                activeOpacity={0.85}
              >
                <Text style={styles.heroButtonText}>Ver bebidas</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ações rápidas</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionCard} onPress={abrirMarketplace} activeOpacity={0.85}>
                <View style={styles.actionIconWrap}>
                  <Ionicons name="search-outline" size={22} color={PRIMARY} />
                </View>
                <Text style={styles.actionTitle}>Buscar</Text>
                <Text style={styles.actionHint}>Bebidas e quiosques</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard} onPress={abrirSacola} activeOpacity={0.85}>
                <View style={styles.actionIconWrap}>
                  <Ionicons name="cart-outline" size={22} color={PRIMARY} />
                </View>
                <Text style={styles.actionTitle}>Carrinho</Text>
                <Text style={styles.actionHint}>Itens do seu pedido</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard} onPress={abrirPedidos} activeOpacity={0.85}>
                <View style={styles.actionIconWrap}>
                  <Ionicons name="cube-outline" size={22} color={PRIMARY} />
                </View>
                <Text style={styles.actionTitle}>Pedidos</Text>
                <Text style={styles.actionHint}>Acompanhe aqui</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Quiosques disponíveis</Text>
              <TouchableOpacity onPress={abrirMarketplace} activeOpacity={0.8}>
                <Text style={styles.seeAll}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator color={PRIMARY} style={{ marginVertical: 16 }} />
            ) : lojasEmDestaque.length === 0 ? (
              <Text style={styles.emptyStores}>Nenhum quiosque disponível no momento.</Text>
            ) : (
              lojasEmDestaque.map((loja, index) => (
                <TouchableOpacity
                  key={loja.id}
                  style={styles.storeCard}
                  onPress={() => abrirLoja(loja)}
                  activeOpacity={0.85}
                >
                  <RemoteImage
                    uri={getImageUrl(loja.capaUrl || loja.logoUrl)}
                    style={styles.storeCover}
                    fallbackLabel={loja.nome}
                    resizeMode="cover"
                  />
                  <View style={styles.storeCopy}>
                    <Text style={styles.storeName} numberOfLines={1}>
                      {loja.nome}
                    </Text>
                    <Text style={styles.storeHint} numberOfLines={1}>
                      {loja.descricao || 'Bebidas do fornecedor'}
                    </Text>
                    <View style={styles.storeMeta}>
                      <Ionicons name="location-outline" size={14} color="#8A93A3" />
                      <Text style={styles.storeDistance}>{distanciaDaLoja(index)}</Text>
                      <View style={styles.openBadge}>
                        <Text style={styles.openBadgeText}>Aberto</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <BottomTabBar activeRoute="Home" />

      <NotificationsModal
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        empresaId={user?.empresa?.id}
      />
    </View>
  );
}
