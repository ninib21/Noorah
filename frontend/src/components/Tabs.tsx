import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { theme } from '../styles/theme';

interface Tab {
  key: string;
  title: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  scrollable?: boolean;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabPress,
  variant = 'default',
  scrollable = false,
}) => {
  const renderTab = (tab: Tab) => {
    const isActive = activeTab === tab.key;

    const getTabStyle = () => {
      const baseStyle = {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        flexDirection: 'row' as const,
      };

      switch (variant) {
        case 'pills':
          return {
            ...baseStyle,
            backgroundColor: isActive ? 'rgba(124, 58, 237, 0.25)' : 'transparent',
            borderWidth: 1,
            borderColor: isActive ? 'rgba(124, 58, 237, 0.6)' : 'rgba(148, 163, 184, 0.25)',
          };
        case 'underline':
          return {
            ...baseStyle,
            borderBottomWidth: 2,
            borderBottomColor: isActive ? theme.colors.accent : 'transparent',
            borderRadius: 0,
          };
        default:
          return {
            ...baseStyle,
            backgroundColor: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
            borderWidth: isActive ? 1 : 0,
            borderColor: isActive ? 'rgba(148, 163, 184, 0.25)' : 'transparent',
          };
      }
    };

    const getTextStyle = () => {
      const baseStyle = {
        fontSize: 14,
        fontWeight: '600' as const,
      };

      switch (variant) {
        case 'pills':
          return {
            ...baseStyle,
            color: isActive ? theme.colors.white : theme.colors.textSecondary,
          };
        default:
          return {
            ...baseStyle,
            color: isActive ? theme.colors.primary : theme.colors.textSecondary,
          };
      }
    };

    return (
      <TouchableOpacity
        key={tab.key}
        style={getTabStyle()}
        onPress={() => onTabPress(tab.key)}
        activeOpacity={0.7}
      >
        {tab.icon && (
          <View style={styles.iconContainer}>
            {tab.icon}
          </View>
        )}
        <Text style={getTextStyle()}>{tab.title}</Text>
        {tab.badge && tab.badge > 0 && (
          <View style={[styles.badge, isActive && styles.activeBadge]}>
            <Text style={styles.badgeText}>
              {tab.badge > 99 ? '99+' : tab.badge}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const TabContainer = scrollable ? ScrollView : View;
  const tabContainerProps = scrollable
    ? {
        horizontal: true,
        showsHorizontalScrollIndicator: false,
        contentContainerStyle: styles.scrollableContainer,
      }
    : { style: styles.container };

  return (
    <TabContainer {...tabContainerProps}>
      {tabs.map(renderTab)}
    </TabContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: theme.borderRadius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
  },
  scrollableContainer: {
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginRight: 8,
  },
  badge: {
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  activeBadge: {
    backgroundColor: theme.colors.white,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.background,
  },
});

export default Tabs; 

