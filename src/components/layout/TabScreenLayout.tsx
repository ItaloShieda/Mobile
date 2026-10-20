import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../Header/ScreenHeader';
import { PageContent } from './PageContent';
import { useTabBarScrollPadding } from './BottomTabBar';
import { COMPANY_COLORS } from '../../theme/theme';

interface ScreenHeaderConfig {
  name?: string;
  greeting?: string;
  showGreeting?: boolean;
  showCartBadge?: boolean;
  cartItemCount?: number;
  onCartPress?: () => void;
  style?: ViewStyle;
}

interface TabScreenLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  scrollContentStyle?: StyleProp<ViewStyle>;
  screenHeaderProps?: ScreenHeaderConfig;
  /** Conteúdo extra dentro do cabeçalho (ex.: campo de busca), como nas telas do cliente. */
  headerContent?: React.ReactNode;
  wrapContent?: boolean;
  footer?: React.ReactNode;
  tabBar?: React.ReactNode;
}

export function TabScreenLayout({
  title,
  subtitle,
  children,
  scrollContentStyle,
  screenHeaderProps,
  headerContent,
  wrapContent = true,
  footer,
  tabBar,
}: TabScreenLayoutProps) {
  const scrollBottomPadding = useTabBarScrollPadding();

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['left', 'right']}>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: scrollBottomPadding },
            scrollContentStyle,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader {...screenHeaderProps} title={title} subtitle={subtitle}>
            {headerContent}
          </ScreenHeader>
          {wrapContent ? (
            <PageContent style={styles.content}>{children}</PageContent>
          ) : (
            <View style={styles.content}>{children}</View>
          )}
        </ScrollView>

        {footer}
      </SafeAreaView>

      {tabBar}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COMPANY_COLORS.pageBackground,
  },
  container: {
    flex: 1,
    backgroundColor: COMPANY_COLORS.pageBackground,
  },
  content: {
    paddingTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {},
});
