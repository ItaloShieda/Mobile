import { StyleSheet } from 'react-native';
import { COMPANY_COLORS } from '../../theme/theme';

const ACCENT = COMPANY_COLORS.primary;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0E6CC',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    paddingVertical: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 95,
  },

  banner: {
    height: 160,
    marginHorizontal: 15,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E8E8E8',
    position: 'relative',
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },

  storeCard: {
    marginHorizontal: 15,
    marginTop: -28,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COMPANY_COLORS.primaryBorder,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    marginBottom: 16,
  },

  storeLogo: {
    position: 'absolute',
    top: -28,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#FFF',
  },

  storeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COMPANY_COLORS.primary,
    textAlign: 'center',
  },

  delivery: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  deliveryMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 16,
    borderRadius: 20,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COMPANY_COLORS.primary,
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#888',
  },
  highlightsRow: {
    paddingRight: 4,
  },
  twoColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  productSmall: {
    width: '48%',
    marginBottom: 12,
    backgroundColor: COMPANY_COLORS.primarySoft,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: COMPANY_COLORS.primaryBorder,
  },
  productFeatured: {
    width: 148,
    marginRight: 12,
    marginBottom: 0,
  },
  productSmallDisabled: {
    opacity: 0.72,
  },

  imageBox: {
    width: '100%',
    height: 108,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  stockPill: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  stockPillText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    paddingHorizontal: 20,
  },

  price: {
    fontSize: 14,
    fontWeight: '700',
    color: COMPANY_COLORS.primary,
    marginTop: 8,
  },

  name: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
    minHeight: 32,
  },
  productCode: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
    marginTop: 2,
  },
  stockHint: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },

  cartButton: {
    position: 'absolute',
    right: 15,
    bottom: 20,
    backgroundColor: ACCENT,
    height: 50,
    paddingHorizontal: 25,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    zIndex: 20,
  },

  cartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});