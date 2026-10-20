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
  heroCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COMPANY_COLORS.primaryBorder,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  heroTitle: {
    color: '#666',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroValue: {
    marginTop: 12,
    color: '#222',
    fontWeight: '800',
    fontSize: 30,
  },
  heroSubtitle: {
    marginTop: 6,
    color: '#555',
    fontSize: 13,
  },
  timelineCard: {
    marginTop: 20,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COMPANY_COLORS.primaryBorder,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepMarkerWrap: {
    width: 26,
    alignItems: 'center',
    marginRight: 12,
  },
  stepMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  stepMarkerDone: {
    backgroundColor: '#2DBE6A',
    borderColor: '#2DBE6A',
  },
  stepMarkerPending: {
    backgroundColor: '#FFF',
    borderColor: '#D2D2D2',
  },
  stepLine: {
    width: 2,
    height: 28,
    backgroundColor: '#E5E5E5',
    marginTop: 4,
  },
  stepContent: {
    flex: 1,
    paddingVertical: 10,
  },
  stepName: {
    color: '#222',
    fontWeight: '700',
    fontSize: 14,
  },
  stepTime: {
    marginTop: 4,
    color: '#666',
    fontSize: 12,
  },
  summaryGrid: {
    marginTop: 20,
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COMPANY_COLORS.primaryBorder,
  },
  metricLabel: {
    color: '#666',
    fontSize: 12,
  },
  metricValue: {
    marginTop: 6,
    color: '#222',
    fontWeight: '800',
    fontSize: 20,
  },
});
