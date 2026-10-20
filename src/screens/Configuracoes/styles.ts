import { StyleSheet } from 'react-native';
import { CLIENTE_COLORS, COMPANY_COLORS } from '../../theme/theme';

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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COMPANY_COLORS.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COMPANY_COLORS.primaryBorder,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    marginTop: 8,
  },
  hint: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COMPANY_COLORS.primaryBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    backgroundColor: COMPANY_COLORS.primarySoft,
  },
  errorText: {
    color: '#D64545',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  successText: {
    color: '#2E7D32',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: COMPANY_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
});

const PRIMARY = CLIENTE_COLORS.primary;
const GOLD = '#F8B125';
const PAGE_BG = '#F3F5F8';

export const clienteStyles = StyleSheet.create({
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
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
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  sheet: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: PRIMARY,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#8A93A3',
    marginTop: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 6,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F7FB',
    borderRadius: 16,
    paddingHorizontal: 12,
    minHeight: 48,
    marginBottom: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    paddingVertical: 10,
  },
  saveButton: {
    backgroundColor: GOLD,
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  successText: {
    color: '#2E7D32',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
});
