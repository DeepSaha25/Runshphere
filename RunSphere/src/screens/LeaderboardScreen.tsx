import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import AppHeader from '../components/AppHeader';
import {LeaderboardLevel, TimePeriod} from '../services/leaderboardService';
import {useLeaderboardStore} from '../store/leaderboardStore';
import {Colors} from '../theme/colors';
import {formatRelativeRunDate} from '../utils/runMetrics';

const scopeTabs: {label: string; value: LeaderboardLevel}[] = [
  {label: 'Local', value: 'local'},
  {label: 'City', value: 'city'},
  {label: 'District', value: 'district'},
  {label: 'State', value: 'state'},
];

const periodTabs: {label: string; value: TimePeriod}[] = [
  {label: 'Today', value: 'today'},
  {label: 'Week', value: 'weekly'},
  {label: 'Month', value: 'monthly'},
];

const LeaderboardScreen = () => {
  const [scope, setScope] = useState<LeaderboardLevel>('local');
  const [period, setPeriod] = useState<TimePeriod>('today');
  const loadLeaderboard = useLeaderboardStore(state => state.loadLeaderboard);
  const entriesState = useLeaderboardStore(state => state.entries);
  const ranksState = useLeaderboardStore(state => state.ranks);
  const loadingState = useLeaderboardStore(state => state.loading);
  const [refreshing, setRefreshing] = useState(false);

  const currentKey = `${scope}:${period}` as const;
  const entries = entriesState[currentKey] || [];
  const yourRank = ranksState[currentKey] ?? null;
  const loading = loadingState[currentKey];

  const loadCurrent = useCallback(async () => {
    await loadLeaderboard(scope, period, 30);
  }, [loadLeaderboard, period, scope]);

  useFocusEffect(
    useCallback(() => {
      loadCurrent();
    }, [loadCurrent]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCurrent();
    } finally {
      setRefreshing(false);
    }
  };

  const podium = useMemo(() => entries.slice(0, 3), [entries]);
  const listEntries = useMemo(() => entries.slice(3), [entries]);

  if (loading && entries.length === 0) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color={Colors.primaryContainer} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surfaceDim} />
      <AppHeader />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primaryContainer}
          />
        }>
        <Text style={styles.title}>LEADERBOARDS</Text>
        <Text style={styles.subtitle}>
          {yourRank ? `Your current rank is #${yourRank}` : 'Complete a synced outdoor run to earn a ranking.'}
        </Text>

        <View style={styles.periodSwitcher}>
          {periodTabs.map(tab => (
            <TouchableOpacity
              key={tab.value}
              style={[
                styles.periodChip,
                period === tab.value ? styles.periodChipActive : undefined,
              ]}
              onPress={() => setPeriod(tab.value)}>
              <Text
                style={[
                  styles.periodChipText,
                  period === tab.value ? styles.periodChipTextActive : undefined,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scopeRow}>
          {scopeTabs.map(tab => (
            <TouchableOpacity
              key={tab.value}
              style={[
                styles.scopeChip,
                scope === tab.value ? styles.scopeChipActive : undefined,
              ]}
              onPress={() => setScope(tab.value)}>
              <Text
                style={[
                  styles.scopeChipText,
                  scope === tab.value ? styles.scopeChipTextActive : undefined,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No rankings yet</Text>
            <Text style={styles.emptyText}>
              Sync your location in Profile and finish a GPS run to populate this board.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.podiumRow}>
              {podium.map(entry => (
                <View key={entry.userId} style={styles.podiumCard}>
                  <Text style={styles.podiumRank}>#{entry.rank}</Text>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {entry.name}
                  </Text>
                  <Text style={styles.podiumDistance}>
                    {Number(entry.totalDistance || 0).toFixed(1)} km
                  </Text>
                  <Text style={styles.podiumMeta}>
                    {entry.totalRuns} runs
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.listSection}>
              {listEntries.map(entry => (
                <View key={entry.userId} style={styles.listRow}>
                  <Text style={styles.listRank}>#{entry.rank}</Text>
                  <View style={styles.listBody}>
                    <Text style={styles.listName}>{entry.name}</Text>
                    <Text style={styles.listMeta}>
                      {entry.totalRuns} runs • {entry.lastRunAt ? formatRelativeRunDate(entry.lastRunAt) : 'No recent run'}
                    </Text>
                  </View>
                  <Text style={styles.listDistance}>
                    {Number(entry.totalDistance || 0).toFixed(1)} km
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{height: 120}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: Colors.onSurface,
    letterSpacing: -2,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    color: Colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 22,
  },
  periodSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 18,
    padding: 6,
    marginBottom: 14,
  },
  periodChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  periodChipActive: {
    backgroundColor: Colors.neonYellow,
  },
  periodChipText: {
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  periodChipTextActive: {
    color: Colors.brandOnNeon,
  },
  scopeRow: {
    gap: 10,
    marginBottom: 18,
  },
  scopeChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  scopeChipActive: {
    backgroundColor: Colors.primaryContainer,
  },
  scopeChipText: {
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  scopeChipTextActive: {
    color: Colors.onPrimaryFixed,
  },
  emptyState: {
    marginTop: 80,
    padding: 24,
    borderRadius: 24,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
  },
  emptyTitle: {
    color: Colors.onSurface,
    fontSize: 20,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 8,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  podiumRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  podiumCard: {
    flex: 1,
    padding: 18,
    borderRadius: 22,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '22',
  },
  podiumRank: {
    color: Colors.neonYellow,
    fontSize: 16,
    fontWeight: '800',
  },
  podiumName: {
    marginTop: 8,
    color: Colors.onSurface,
    fontSize: 16,
    fontWeight: '800',
  },
  podiumDistance: {
    marginTop: 10,
    color: Colors.primaryContainer,
    fontSize: 22,
    fontWeight: '900',
  },
  podiumMeta: {
    marginTop: 6,
    color: Colors.onSurfaceVariant,
    fontSize: 12,
  },
  listSection: {
    gap: 12,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '22',
  },
  listRank: {
    width: 36,
    color: Colors.primaryContainer,
    fontSize: 16,
    fontWeight: '900',
  },
  listBody: {
    flex: 1,
  },
  listName: {
    color: Colors.onSurface,
    fontSize: 15,
    fontWeight: '700',
  },
  listMeta: {
    marginTop: 4,
    color: Colors.onSurfaceVariant,
    fontSize: 12,
  },
  listDistance: {
    color: Colors.onSurface,
    fontSize: 14,
    fontWeight: '800',
  },
});

export default LeaderboardScreen;
