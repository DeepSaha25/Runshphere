import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import HomeScreen from '../screens/HomeScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import {Colors} from '../theme/colors';
import {MainTabParamList} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, {icon: string; label: string}> = {
  Home: {icon: '⌂', label: 'Home'},
  Leaderboards: {icon: '⌁', label: 'Ranks'},
  History: {icon: '↺', label: 'History'},
  Profile: {icon: '◉', label: 'Profile'},
};

const BottomTabNavigator = ({navigation}: any) => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.hiddenTabBar,
    }}
    tabBar={({state, navigation: tabNavigation}) => (
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBarInner}>
          <View style={styles.sideGroup}>
            {state.routes.slice(0, 2).map((route, index) => {
              const config = TAB_ICONS[route.name as keyof MainTabParamList];
              const isFocused = state.index === index;

              return (
                <TouchableOpacity
                  key={route.key}
                  style={styles.sideTab}
                  onPress={() => tabNavigation.navigate(route.name as never)}>
                  <Text style={[styles.sideIcon, isFocused && styles.sideIconActive]}>
                    {config.icon}
                  </Text>
                  <Text style={[styles.sideLabel, isFocused && styles.sideLabelActive]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('RunTracking')}
            style={styles.runButtonWrapper}>
            <LinearGradient
              colors={[Colors.neonYellowLight, Colors.neonYellow]}
              style={styles.runButton}>
              <Text style={styles.runButtonIcon}>▶</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.sideGroup}>
            {state.routes.slice(2).map((route, offset) => {
              const index = offset + 2;
              const config = TAB_ICONS[route.name as keyof MainTabParamList];
              const isFocused = state.index === index;

              return (
                <TouchableOpacity
                  key={route.key}
                  style={styles.sideTab}
                  onPress={() => tabNavigation.navigate(route.name as never)}>
                  <Text style={[styles.sideIcon, isFocused && styles.sideIconActive]}>
                    {config.icon}
                  </Text>
                  <Text style={[styles.sideLabel, isFocused && styles.sideLabelActive]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    )}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Leaderboards" component={LeaderboardScreen} />
    <Tab.Screen name="History" component={HistoryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  hiddenTabBar: {
    display: 'none',
  },
  tabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 32,
    backgroundColor: Colors.brandDark + 'F2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -8},
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 18,
  },
  sideGroup: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  sideTab: {
    minWidth: 62,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideIcon: {
    color: Colors.slateInactive,
    fontSize: 22,
    opacity: 0.55,
  },
  sideIconActive: {
    color: Colors.onSurface,
    opacity: 1,
  },
  sideLabel: {
    marginTop: 2,
    color: Colors.slateInactive,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sideLabelActive: {
    color: Colors.onSurface,
  },
  runButtonWrapper: {
    marginHorizontal: 8,
  },
  runButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.neonYellow,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  runButtonIcon: {
    color: Colors.brandOnNeon,
    fontSize: 28,
    marginLeft: 4,
  },
});

export default BottomTabNavigator;
