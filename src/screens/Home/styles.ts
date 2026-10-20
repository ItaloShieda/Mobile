import { StyleSheet } from 'react-native';
import { COMPANY_COLORS } from '../../theme/theme';

export const styles = StyleSheet.create({
  // ==========================================
  // ESTRUTURA E CONFIGURAÇÕES GERAIS
  // ==========================================
  container: { 
    flex: 1, 
    backgroundColor: COMPANY_COLORS.pageBackground,
  },
  root: {
    flex: 1,
    backgroundColor: COMPANY_COLORS.pageBackground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
  },
  emptyProductsText: {
    color: '#666',
    fontSize: 14,
    paddingVertical: 12,
  },

  // ==========================================
  // CABEÇALHO (HEADER) — ver ScreenHeader
  // ==========================================
  // FILTRO / BARRA DE PESQUISA
  // ==========================================
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    marginTop: 16, 
    paddingHorizontal: 12, 
    height: 42, 
    borderRadius: 21, 
  },
  searchInput: { 
    flex: 1, 
    marginLeft: 8, 
    fontSize: 14,
    color: '#333',
    paddingVertical: 0,
  },

  // ==========================================
  // CARDS PRINCIPAIS (MAIN CARD)
  // ==========================================
  mainCard: { 
    backgroundColor: '#FFF', 
    marginHorizontal: 15, 
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 16, 
    elevation: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 10,
  },
  mainCardOverlap: {
    marginTop: -64,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 12,
  },
  cardTitleBlock: {
    flex: 1,
    marginRight: 8,
  },
  cardTitleContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  dot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    marginRight: 8,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: COMPANY_COLORS.primary,
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#888',
  },
  financeHeader: {
    marginBottom: 14,
  },
  tagsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: { 
    backgroundColor: COMPANY_COLORS.primarySoft,
    borderWidth: 1, 
    borderColor: COMPANY_COLORS.primaryBorder,
    borderRadius: 16, 
    paddingHorizontal: 10, 
    paddingVertical: 5,
  },
  tagText: { 
    fontSize: 11, 
    color: '#666',
    fontWeight: '600',
  },

  // ==========================================
  // ELEMENTOS DE ITENS DO ESTOQUE
  // ==========================================
  horizontalScroll: { 
    flexDirection: 'row',
  },
  horizontalScrollContent: {
    paddingVertical: 4,
    paddingRight: 4,
  },
  stockItemCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    borderWidth: 1.5, 
    borderColor: COMPANY_COLORS.primary,
    borderRadius: 25, 
    padding: 10, 
    marginRight: 10, 
    minWidth: 160,
  },
  stockIcon: { 
    marginRight: 8,
  },
  stockTextContainer: { 
    justifyContent: 'center',
  },
  stockItemName: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#000',
  },
  stockItemTotal: { 
    fontSize: 12, 
    color: '#000', 
    fontWeight: 'bold',
  },
  stockItemTotalNumber: { 
    color: COMPANY_COLORS.primary,
    fontSize: 16,
  },

  // ==========================================
  // SESSÃO FINANCEIRA E GRÁFICOS
  // ==========================================
  financialContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  },
  financialBox: { 
    flex: 1,
    backgroundColor: COMPANY_COLORS.primarySoft,
    borderWidth: 1, 
    borderColor: COMPANY_COLORS.primaryBorder,
    borderRadius: 16, 
    paddingVertical: 12, 
    paddingHorizontal: 12, 
    alignItems: 'flex-start',
  },
  financialBoxSpend: {
    borderLeftWidth: 4,
    borderLeftColor: '#D64545',
  },
  financialBoxProfit: {
    borderLeftWidth: 4,
    borderLeftColor: '#32CD32',
  },
  financialLabel: { 
    fontSize: 12, 
    color: '#888',
  },
  financialValue: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333', 
    marginTop: 4,
  },
  quickActionsSection: {
    marginHorizontal: 15,
    marginBottom: 18,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  quickActionCard: {
    width: '48.5%',
    backgroundColor: '#FFF',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  quickActionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COMPANY_COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    color: COMPANY_COLORS.primary,
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 2,
  },
  quickActionHint: {
    color: '#8A93A3',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 13,
  },

  // ==========================================
  // BARRA DE NAVEGAÇÃO INFERIOR (BOTTOM BAR)
  // ==========================================
  bottomBar: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: 70, 
    backgroundColor: COMPANY_COLORS.primary,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 15,
  },
  tabItem: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  floatingButtonContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  floatingButton: { 
    width: 76, 
    height: 76, 
    borderRadius: 38, 
    backgroundColor: '#FFF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    position: 'absolute', 
    bottom: -15, 
    borderWidth: 2, 
    borderColor: COMPANY_COLORS.primary,
    elevation: 6, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 5,
  },
});
