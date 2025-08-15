import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

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
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row' as const,
      };

      switch (variant) {
        case 'pills':
          return {
            ...baseStyle,
            backgroundColor: isActive ? '#3A7DFF' : 'transparent',
            borderWidth: 1,
            borderColor: isActive ? '#3A7DFF' : '#E2E8F0',
          };
        case 'underline':
          return {
            ...baseStyle,
            borderBottomWidth: 2,
            borderBottomColor: isActive ? '#3A7DFF' : 'transparent',
            borderRadius: 0,
          };
        default:
          return {
            ...baseStyle,
            backgroundColor: isActive ? '#F1F5F9' : 'transparent',
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
            color: isActive ? '#FFFFFF' : '#64748B',
          };
        default:
          return {
            ...baseStyle,
            color: isActive ? '#3A7DFF' : '#64748B',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
  scrollableContainer: {
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  activeBadge: {
    backgroundColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default Tabs; 