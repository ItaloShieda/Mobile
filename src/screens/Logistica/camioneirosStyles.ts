import { StyleSheet } from 'react-native';
import { COMPANY_COLORS } from '../../theme/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
    borderRadius: 10,
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
  summary: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COMPANY_COLORS.primaryBorder,
    alignItems: 'center',
  },
  summaryValue: {
    color: COMPANY_COLORS.primary,
    fontSize: 32,
    fontWeight: '800',
  },
  summaryLabel: {
    color: '#666',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COMPANY_COLORS.primaryBorder,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    color: '#222',
    fontWeight: '800',
    fontSize: 16,
  },
  route: {
    marginTop: 4,
    color: '#666',
    fontSize: 12,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusEmRota: {
    backgroundColor: '#EAF9EE',
  },
  statusCarregando: {
    backgroundColor: '#FFF4D6',
  },
  statusDisponivel: {
    backgroundColor: '#ECF4FF',
  },
  statusAtrasado: {
    backgroundColor: '#FFE7E7',
  },
  statusPadrao: {
    backgroundColor: '#F3F3F3',
  },
  vehicle: {
    marginTop: 14,
    color: '#333',
    fontSize: 13,
  },
  clientLabel: {
    marginTop: 12,
    color: '#666',
    fontSize: 12,
    fontWeight: '700',
  },
  clientName: {
    color: '#333',
    fontSize: 13,
    marginTop: 4,
  },
});
