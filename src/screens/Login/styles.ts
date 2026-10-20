import { StyleSheet } from 'react-native';
import { AUTH_NAVY } from '../../theme/authTheme';

export const styles = StyleSheet.create({
  errorText: {
    color: '#C62828',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 14,
  },
  loader: {
    marginTop: 20,
    marginBottom: 12,
  },
  testAccessSection: {
    marginTop: 18,
  },
  testAccessTitle: {
    color: AUTH_NAVY,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  testAccessRow: {
    flexDirection: 'row',
    gap: 8,
  },
  testAccessButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: AUTH_NAVY,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  testAccessButtonText: {
    color: AUTH_NAVY,
    fontSize: 13,
    fontWeight: '700',
  },
  testAccessHint: {
    color: '#8A93A3',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
  },
  forgotPassword: {
    marginTop: 18,
    color: AUTH_NAVY,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
