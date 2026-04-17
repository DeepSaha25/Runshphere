import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {Colors} from '../theme/colors';
import AppHeader from '../components/AppHeader';
import CommunityService from '../services/communityService';

const CommunityFeedScreen = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = useCallback(async () => {
    try {
      const res = await CommunityService.getFeed(1, 20);
      setPosts(res.posts || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  const handleLike = async (postId: string) => {
    try {
      await CommunityService.toggleLike(postId);
      loadFeed(); // Refresh
    } catch {}
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
  };

  if (loading) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryContainer} />
        }>
        <Text style={styles.title}>COMMUNITY</Text>
        <Text style={styles.subtitle}>Your Pulse on the World</Text>

        {posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptyText}>Be the first to share your run with the community!</Text>
          </View>
        ) : (
          posts.map(post => (
            <View key={post._id} style={styles.feedCard}>
              <View style={styles.userRow}>
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userInitial}>
                      {post.userId?.name?.[0] || '?'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>
                      {post.userId?.name || 'Unknown Runner'}
                    </Text>
                    <Text style={styles.userMeta}>{formatDate(post.createdAt)}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.postText}>{post.text}</Text>

              {/* Run data if attached */}
              {post.runId && (
                <View style={styles.trailMetrics}>
                  <View style={styles.trailMetricItem}>
                    <Text style={styles.trailMetricLabel}>DIST</Text>
                    <Text style={[styles.trailMetricValue, {color: Colors.primary}]}>
                      {post.runId.distance?.toFixed(1)}
                      <Text style={styles.trailMetricUnit}>KM</Text>
                    </Text>
                  </View>
                  <View style={styles.trailMetricItem}>
                    <Text style={styles.trailMetricLabel}>PACE</Text>
                    <Text style={[styles.trailMetricValue, {color: Colors.secondary}]}>
                      {post.runId.avgSpeed ? (60 / post.runId.avgSpeed).toFixed(1) : '--'}
                      <Text style={styles.trailMetricUnit}>MIN/KM</Text>
                    </Text>
                  </View>
                </View>
              )}

              {/* Engagement */}
              <View style={styles.engagementRow}>
                <TouchableOpacity
                  style={styles.engageBtn}
                  onPress={() => handleLike(post._id)}>
                  <Text style={{fontSize: 18}}>❤️</Text>
                  <Text style={styles.engageCount}>{post.likesCount || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.engageBtn}>
                  <Text style={{fontSize: 18}}>💬</Text>
                  <Text style={styles.engageCount}>{post.commentsCount || 0}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{height: 100}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.surface},
  content: {paddingHorizontal: 16},
  title: {fontFamily: 'Lexend-Bold', fontSize: 32, fontWeight: '900', color: Colors.primary, letterSpacing: -1, marginBottom: 4},
  subtitle: {fontFamily: 'Inter-Regular', fontSize: 14, color: Colors.onSurfaceVariant, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24},
  emptyState: {alignItems: 'center', paddingVertical: 60},
  emptyIcon: {fontSize: 48, marginBottom: 16},
  emptyTitle: {fontFamily: 'Lexend-Bold', fontSize: 20, fontWeight: '700', color: Colors.onSurface, marginBottom: 8},
  emptyText: {fontFamily: 'Inter-Regular', fontSize: 14, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 22, paddingHorizontal: 32},
  feedCard: {backgroundColor: Colors.surfaceContainerLow, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: Colors.outlineVariant + '1A', gap: 16},
  userRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  userInfo: {flexDirection: 'row', alignItems: 'center', gap: 12},
  userAvatar: {width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: Colors.primaryContainer, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center'},
  userInitial: {fontFamily: 'Lexend-Bold', fontSize: 18, fontWeight: '700', color: Colors.onSurface},
  userName: {fontFamily: 'Lexend-Bold', fontSize: 16, fontWeight: '700', color: Colors.onSurface},
  userMeta: {fontFamily: 'Inter-Regular', fontSize: 12, color: Colors.onSurfaceVariant},
  postText: {fontFamily: 'Inter-Regular', fontSize: 14, color: Colors.onSurface, lineHeight: 22},
  trailMetrics: {flexDirection: 'row', gap: 8},
  trailMetricItem: {flex: 1, backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12, padding: 14, alignItems: 'center'},
  trailMetricLabel: {fontFamily: 'Inter-Bold', fontSize: 9, fontWeight: '700', color: Colors.onSurfaceVariant, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6},
  trailMetricValue: {fontFamily: 'Lexend-Bold', fontSize: 20, fontWeight: '900'},
  trailMetricUnit: {fontSize: 10, marginLeft: 2},
  engagementRow: {flexDirection: 'row', alignItems: 'center', gap: 24, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.outlineVariant + '1A'},
  engageBtn: {flexDirection: 'row', alignItems: 'center', gap: 6},
  engageCount: {fontFamily: 'Inter-Bold', fontSize: 12, fontWeight: '700', color: Colors.onSurfaceVariant},
});

export default CommunityFeedScreen;
