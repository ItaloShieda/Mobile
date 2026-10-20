import { StyleSheet } from 'react-native';
import { GOLD, GREEN, PRIMARY, PAGE_BG } from '../ClienteHome/styles';

export { GOLD, GREEN, PRIMARY, PAGE_BG };

export const clienteProductStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSide: {
    width: 36,
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandQuick: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  brandStock: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 2,
  },
  sheet: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  imageCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: PRIMARY,
    marginBottom: 4,
  },
  volume: {
    fontSize: 14,
    color: '#8A93A3',
    marginBottom: 6,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  idText: {
    fontSize: 12,
    color: '#9AA3B2',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: PRIMARY,
  },
  unit: {
    fontSize: 14,
    color: '#8A93A3',
    fontWeight: '600',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E7F8EE',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stockTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: GREEN,
  },
  stockHint: {
    fontSize: 11,
    color: GREEN,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#8A93A3',
    textAlign: 'center',
    fontWeight: '600',
  },
  vendorCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vendorLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY,
    marginRight: 10,
  },
  vendorCopy: {
    flex: 1,
  },
  vendorLabel: {
    fontSize: 11,
    color: '#8A93A3',
    marginBottom: 2,
  },
  vendorName: {
    fontSize: 15,
    fontWeight: '800',
    color: PRIMARY,
    marginBottom: 4,
  },
  vendorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vendorCity: {
    fontSize: 12,
    color: '#8A93A3',
  },
  verQuiosque: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  feedback: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  bottomBar: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF1F6',
    paddingHorizontal: 12,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F5F8',
    borderRadius: 14,
    paddingHorizontal: 4,
    height: 40,
    flexShrink: 0,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    minWidth: 18,
    textAlign: 'center',
    fontWeight: '800',
    color: PRIMARY,
    fontSize: 14,
  },
  totalBlock: {
    flexGrow: 1,
    flexShrink: 0,
    minWidth: 88,
  },
  totalLabel: {
    fontSize: 11,
    color: '#8A93A3',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: PRIMARY,
  },
  addButton: {
    backgroundColor: GOLD,
    borderRadius: 18,
    height: 38,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
    maxWidth: 148,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
