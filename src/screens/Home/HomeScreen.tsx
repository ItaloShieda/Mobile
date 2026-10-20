import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/Header/ScreenHeader';
import { CalendarDatePill } from '../../components/Header/CalendarDatePill';
import { BottomTabBar } from '../../components/layout/BottomTabBar';
import { ProductStockCard } from './components/ProductCard';
import { FinancialDonutChart } from './components/FinancialDonutChart';
import { formatarPreco } from '../../services/productService';
import { styles } from './styles';
import { useHome } from './useHome';
import { useAuth } from '../../context/AuthContext';
import { ClienteHomeScreen } from '../ClienteHome/ClienteHomeScreen';
import { COMPANY_COLORS } from '../../theme/theme';

export default function HomeScreen() {
  const { perfilUso } = useAuth();
  if (perfilUso === 'Cliente') {
    return <ClienteHomeScreen />;
  }
  return <EmpresaHomeScreen />;
}

function EmpresaHomeScreen() {
  const {
    navigation,
    user,
    produtos,
    loading,
    resumoFinanceiro,
    loadingFinanceiro,
    totalCatalogo,
    valorCatalogo,
    totalUnidadesEstoque,
    abrirDetalheProduto,
    totalCompras,
    totalVendas,
    lucroTotal,
    margemPercentual,
    quickActions,
    scrollBottomPadding,
  } = useHome();

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['left', 'right']}>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPadding }]}
          showsVerticalScrollIndicator={false}
        >
        
        {/* CABEÇALHO */}
        <ScreenHeader
          showGreeting
          greeting="Gerencie seu estoque e suas vendas."
          name={user?.empresa?.nome ?? user?.nome?.split(' ')[0] ?? 'Sua empresa'}
          overlap
        >
          {/* BARRA DE PESQUISA */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={COMPANY_COLORS.primary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar..."
              placeholderTextColor="#999"
            />
          </View>
        </ScreenHeader>

        {/* ÚLTIMO ESTOQUE */}
        <View style={[styles.mainCard, styles.mainCardOverlap]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleBlock}>
              <View style={styles.cardTitleContainer}>
                <View style={[styles.dot, { backgroundColor: '#D64545' }]} />
                <Text style={styles.cardTitle}>Último estoque</Text>
              </View>
              <Text style={styles.cardSubtitle}>Produtos cadastrados na empresa</Text>
            </View>
            <CalendarDatePill compact />
          </View>
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{totalCatalogo} produto(s)</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{totalUnidadesEstoque} un. em estoque</Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {loading ? (
              <ActivityIndicator color={COMPANY_COLORS.primary} style={{ marginVertical: 12 }} />
            ) : produtos.length === 0 ? (
              <Text style={styles.emptyProductsText}>Nenhum produto cadastrado.</Text>
            ) : (
              produtos.map((produto) => (
                <ProductStockCard
                  key={produto.id}
                  produto={produto}
                  onPress={() => abrirDetalheProduto(produto)}
                />
              ))
            )}
          </ScrollView>
        </View>

        {/* AÇÕES RÁPIDAS */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.quickActionsTitle}>Ações rápidas</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((item) => (
              <TouchableOpacity
                key={item.screen}
                style={styles.quickActionCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={styles.quickActionIconWrap}>
                  <Ionicons name={item.icon} size={22} color={COMPANY_COLORS.primary} />
                </View>
                <Text style={styles.quickActionText} numberOfLines={1}>{item.title}</Text>
                {item.subtitle ? (
                  <Text style={styles.quickActionHint} numberOfLines={2}>{item.subtitle}</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ESTOQUE ONLINE */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleBlock}>
              <View style={styles.cardTitleContainer}>
                <View style={[styles.dot, { backgroundColor: '#32CD32' }]} />
                <Text style={styles.cardTitle}>Estoque online</Text>
              </View>
              <Text style={styles.cardSubtitle}>Visão rápida do catálogo ativo</Text>
            </View>
            <CalendarDatePill compact />
          </View>
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Valor ref. {formatarPreco(valorCatalogo)}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>
                {user?.empresa?.nome ?? 'Sua empresa'}
              </Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {produtos.slice(0, 6).map((produto) => (
              <ProductStockCard
                key={`online-${produto.id}`}
                produto={produto}
                onPress={() => abrirDetalheProduto(produto)}
              />
            ))}
          </ScrollView>
        </View>

        {/* RESUMO FINANCEIRO */}
        <View style={styles.mainCard}>
          <View style={styles.financeHeader}>
            <Text style={styles.cardTitle}>Resumo financeiro</Text>
            <Text style={styles.cardSubtitle}>Compras, vendas e lucro da conta</Text>
          </View>
          <View style={styles.financialContainer}>
            <View style={[styles.financialBox, styles.financialBoxSpend]}>
              <Text style={styles.financialLabel}>Total gasto</Text>
              <Text style={[styles.financialValue, { color: '#D64545' }]}>
                {loadingFinanceiro ? '...' : formatarPreco(totalCompras)}
              </Text>
            </View>
            <View style={[styles.financialBox, styles.financialBoxProfit]}>
              <Text style={styles.financialLabel}>Total de lucro</Text>
              <Text style={[styles.financialValue, { color: lucroTotal < 0 ? '#D64545' : '#2E7D32' }]}>
                {loadingFinanceiro ? '...' : formatarPreco(lucroTotal)}
              </Text>
            </View>
          </View>
          <FinancialDonutChart
            totalCompras={totalCompras}
            totalVendas={totalVendas}
            lucroTotal={lucroTotal}
            margemPercentual={margemPercentual}
            loading={loadingFinanceiro}
          />
        </View>

      </ScrollView>
      </SafeAreaView>

      <BottomTabBar activeRoute="Home" />
    </View>
  );
}
