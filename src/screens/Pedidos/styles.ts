import { StyleSheet } from 'react-native';
import { PRIMARY, PAGE_BG } from '../ClienteHome/styles';

export { GOLD, PRIMARY, PAGE_BG } from '../ClienteHome/styles';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandQuick: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  brandStock: {
    color: '#1F2937',
    fontSize: 20,
    fontWeight: '800',
  },
  title: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
  },
  sheet: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#EEF2F7',
    borderRadius: 22,
    padding: 4,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: PRIMARY,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFF',
  },
  listCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  pedidoRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F6',
  },
  pedidoRowLast: {
    borderBottomWidth: 0,
  },
  pedidoTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pedidoCode: {
    fontSize: 15,
    fontWeight: '800',
    color: PRIMARY,
  },
  pedidoDate: {
    fontSize: 12,
    color: '#8A93A3',
    marginTop: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipBlue: { backgroundColor: '#E8F1FB' },
  chipGold: { backgroundColor: '#FFF6DE' },
  chipGreen: { backgroundColor: '#E8F8EF' },
  chipGray: { backgroundColor: '#EEF2F7' },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chipTextBlue: { color: PRIMARY },
  chipTextGold: { color: '#C98912' },
  chipTextGreen: { color: '#1B7A4A' },
  chipTextGray: { color: '#6B7280' },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  storeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },
  storeHint: {
    fontSize: 12,
    color: '#8A93A3',
    marginTop: 2,
  },
  pedidoBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pedidoMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  pedidoTotal: {
    fontWeight: '800',
    color: PRIMARY,
  },
  detalhes: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: PRIMARY,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#8A93A3',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
    lineHeight: 19,
  },
  cta: {
    backgroundColor: '#F8B125',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  ctaText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryText: {
    color: '#F8B125',
    fontWeight: '700',
    textAlign: 'center',
  },
});
