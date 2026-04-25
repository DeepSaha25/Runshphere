import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import CommunityFeedScreen from '../screens/CommunityFeedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import {Colors} from '../theme/colors';
import {MainTabParamList} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_CONFIG: Record<keyof MainTabParamList, {label: string}> = {
  Home: {label: 'Home'},
  Leaderboards: {label: 'Ranks'},
  Community: {label: 'Social'},
  Profile: {label: 'Me'},
};

const BottomTabNavigator = ({navigation}: any) => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.hiddenTabBar,
    }}
    tabBar={({state, navigation: tabNavigation}) => (
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, state.index === 0 && styles.activeTabItem]}
          onPress={() => tabNavigation.navigate('Home')}>
          <Text style={[styles.tabLabel, state.index === 0 && styles.activeText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.runTabItem}
          onPress={() => navigation.navigate('RunTracking')}>
          <Text style={styles.runTabLabel}>Run</Text>
        </TouchableOpacity>

        {state.routes.slice(1).map((route, offset) => {
          const routeIndex = offset + 1;
          const config = TAB_CONFIG[route.name as keyof MainTabParamList];
          const isFocused = state.index === routeIndex;

          return (
            <TouchableOpacity
              key={route.key}
              style={[styles.tabItem, isFocused && styles.activeTabItem]}
              onPress={() => tabNavigation.navigate(route.name as never)}>
              <Text style={[styles.tabLabel, isFocused && styles.activeText]}>
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    )}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Leaderboards" component={LeaderboardScreen} />
    <Tab.Screen name="Community" component={CommunityFeedScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  hiddenTabBar: {
    display: 'none',
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 84,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 18,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface + '99',
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: -8},
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 18,
  },
  tabItem: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    color: Colors.slateInactive,
    fontFamily: 'Lexend-Bold',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  activeTabItem: {
    backgroundColor: Colors.primary + '14',
  },
  runTabItem: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  runTabLabel: {
    color: Colors.onPrimaryFixed,
    fontFamily: 'Lexend-Bold',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  activeText: {
    color: Colors.primary,
    textShadowColor: 'rgba(153,247,255,0.8)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 8,
  },
});

export default BottomTabNavigator;
