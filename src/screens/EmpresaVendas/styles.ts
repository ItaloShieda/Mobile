import { StyleSheet } from 'react-native';
import { COMPANY_COLORS } from '../../theme/theme';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COMPANY_COLORS.pageBackground,
  },
  container: {
    flex: 1,
    backgroundColor: COMPANY_COLORS.pageBackground,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  headerButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COMPANY_COLORS.primary,
  },
  headerButtonText: {
    color: COMPANY_COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  summaryGrid: {
    marginTop: 8,
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COMPANY_COLORS.primaryBorder,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  positiveCard: {
    borderLeftWidth: 6,
    borderLeftColor: '#2DBE6A',
  },
  primaryCard: {
    borderLeftWidth: 6,
    borderLeftColor: COMPANY_COLORS.primary,
  },
  warningCard: {
    borderLeftWidth: 6,
    borderLeftColor: '#FF7D4D',
  },
  metricLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 6,
  },
  metricValue: {
    color: '#222',
    fontWeight: '800',
    fontSize: 24,
  },
  metricDelta: {
    marginTop: 6,
    color: '#555',
    fontSize: 11,
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: COMPANY_COLORS.primaryBorder,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#222',
    marginBottom: 12,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  kpiItem: {
    flex: 1,
    backgroundColor: '#FFF9EC',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3CF82',
  },
  kpiNumber: {
    fontSize: 20,
    color: COMPANY_COLORS.primary,
    fontWeight: '800',
  },
  kpiLabel: {
    marginTop: 4,
    color: '#555',
    fontSize: 11,
    textAlign: 'center',
  },
  saleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  saleClient: {
    color: '#222',
    fontWeight: '700',
    fontSize: 15,
  },
  saleMeta: {
    marginTop: 4,
    color: '#666',
    fontSize: 11,
  },
  saleRight: {
    alignItems: 'flex-end',
  },
  saleValue: {
    color: '#222',
    fontSize: 15,
    fontWeight: '800',
  },
  statusPill: {
    marginTop: 6,
    backgroundColor: '#FFF4D6',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#F5CB72',
  },
  statusText: {
    color: '#A66B00',
    fontSize: 10,
    fontWeight: '700',
  },
});
