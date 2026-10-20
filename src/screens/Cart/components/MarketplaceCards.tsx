import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RemoteImage } from '../../../components/media/RemoteImage';
import { getImageUrl } from '../../../config/api';
import { Fornecedor, labelTipoFornecedor } from '../../../services/marketplaceService';
import { styles } from '../styles';
import {
  FEATURED_HEIGHT,
  FEATURED_WIDTH,
  PARTNER_CARD_WIDTH,
  PARTNER_COVER_HEIGHT,
  STORE_COVER_WIDTH,
} from '../cartLayout';
import { COMPANY_COLORS } from '../../../theme/theme';

export function LogoAvatar({
  nome,
  logoUrl,
  size = 50,
  style,
}: {
  nome: string;
  logoUrl?: string;
  size?: number;
  style?: object;
}) {
  return (
    <RemoteImage
      uri={getImageUrl(logoUrl)}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
      fallbackLabel={nome}
      resizeMode="cover"
    />
  );
}

export function CoverImage({
  capaUrl,
  nome,
  width,
  height,
}: {
  capaUrl?: string;
  nome: string;
  width: number;
  height: number;
}) {
  const uri = getImageUrl(capaUrl);
  const frameStyle = { width, height };

  return (
    <View style={[styles.coverFrame, frameStyle]}>
      {uri ? (
        <RemoteImage
          uri={uri}
          style={styles.coverImage}
          fallbackLabel={nome}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={[COMPANY_COLORS.primary, COMPANY_COLORS.primaryMuted]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.coverImage}
        />
      )}
    </View>
  );
}

interface FeaturedBannerProps {
  fornecedor: Fornecedor;
  onPress: () => void;
}

export const FeaturedBanner = ({ fornecedor, onPress }: FeaturedBannerProps) => (
  <TouchableOpacity
    style={styles.featuredCard}
    activeOpacity={0.88}
    onPress={onPress}
  >
    <CoverImage
      capaUrl={fornecedor.capaUrl}
      nome={fornecedor.nome}
      width={FEATURED_WIDTH}
      height={FEATURED_HEIGHT}
    />
    <LinearGradient
      colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.78)']}
      locations={[0.35, 0.72, 1]}
      style={styles.featuredOverlay}
    />
    <View style={styles.featuredFooter}>
      <LogoAvatar
        nome={fornecedor.nome}
        logoUrl={fornecedor.logoUrl}
        size={48}
        style={styles.featuredLogo}
      />
      <View style={styles.featuredTextWrap}>
        <Text style={styles.featuredTitle} numberOfLines={1}>
          {fornecedor.nome}
        </Text>
        <Text style={styles.featuredSubtitle} numberOfLines={1}>
          {labelTipoFornecedor(fornecedor.tipo)} · {fornecedor.totalProdutos} produtos
        </Text>
      </View>
      <View style={styles.featuredBadge}>
        <Text style={styles.featuredBadgeText}>Ver loja</Text>
        <Ionicons name="chevron-forward" size={14} color={COMPANY_COLORS.primary} />
      </View>
    </View>
  </TouchableOpacity>
);

interface PartnerCardProps {
  fornecedor: Fornecedor;
  onPress: () => void;
}

export const PartnerCard = ({ fornecedor, onPress }: PartnerCardProps) => (
  <TouchableOpacity
    style={styles.partnerCard}
    activeOpacity={0.88}
    onPress={onPress}
  >
    <View style={styles.partnerCoverWrap}>
      <CoverImage
        capaUrl={fornecedor.capaUrl}
        nome={fornecedor.nome}
        width={PARTNER_CARD_WIDTH}
        height={PARTNER_COVER_HEIGHT}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.35)']}
        style={styles.partnerCoverGradient}
      />
    </View>
    <View style={styles.partnerBody}>
      <LogoAvatar
        nome={fornecedor.nome}
        logoUrl={fornecedor.logoUrl}
        size={42}
        style={styles.partnerLogo}
      />
      <Text style={styles.partnerName} numberOfLines={2}>
        {fornecedor.nome}
      </Text>
      <Text style={styles.partnerMeta} numberOfLines={1}>
        {fornecedor.totalProdutos} produtos
      </Text>
    </View>
  </TouchableOpacity>
);

interface HorizontalCardProps {
  fornecedor: Fornecedor;
  subtitle: string;
  onPress: () => void;
  isLast?: boolean;
}

export const HorizontalCard = ({ fornecedor, subtitle, onPress, isLast }: HorizontalCardProps) => (
  <TouchableOpacity
    style={[styles.requestCard, isLast && styles.requestCardLast]}
    activeOpacity={0.85}
    onPress={onPress}
  >
    <LogoAvatar nome={fornecedor.nome} logoUrl={fornecedor.logoUrl} size={40} style={styles.requestLogo} />
    <View style={styles.requestCopy}>
      <Text style={styles.requestTitle} numberOfLines={1}>{fornecedor.nome}</Text>
      <Text style={styles.requestHint} numberOfLines={2}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color="#D4B56A" />
  </TouchableOpacity>
);

interface StoreCardProps {
  fornecedor: Fornecedor;
  onPress: () => void;
}

export const StoreCard = ({ fornecedor, onPress }: StoreCardProps) => (
  <TouchableOpacity style={styles.storeCard} activeOpacity={0.8} onPress={onPress}>
    <View style={styles.storeCoverWrap}>
      <CoverImage
        capaUrl={fornecedor.capaUrl}
        nome={fornecedor.nome}
        width={STORE_COVER_WIDTH}
        height={96}
      />
    </View>
    <View style={styles.storeContent}>
      <View style={styles.storeHeaderRow}>
        <LogoAvatar nome={fornecedor.nome} logoUrl={fornecedor.logoUrl} size={46} style={styles.storeLogo} />
        <View style={styles.storeTextContainer}>
          <Text style={styles.storeName} numberOfLines={1}>{fornecedor.nome}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="storefront-outline" size={14} color={COMPANY_COLORS.primary} />
            <Text style={styles.ratingText}>{labelTipoFornecedor(fornecedor.tipo)}</Text>
            <Text style={styles.reviewsText}>({fornecedor.totalProdutos} produtos)</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#D4B56A" />
      </View>
      <Text style={styles.deliveryText} numberOfLines={2}>
        {fornecedor.descricao || 'Bebidas para revenda em atacado.'}
      </Text>
    </View>
  </TouchableOpacity>
);
