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
  forgotPassword: {
    marginTop: 18,
    color: AUTH_NAVY,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
