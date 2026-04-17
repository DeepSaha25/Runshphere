import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import GradientButton from '../components/GradientButton';
import NeonInput from '../components/NeonInput';
import {useAuthStore} from '../store/authStore';
import {Colors} from '../theme/colors';

const LoginScreen = ({navigation}: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      await login({email: email.trim(), password});
    } catch (error: any) {
      Alert.alert(
        'Login failed',
        error?.message || 'Please check your credentials and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surface} />

      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomLeft} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Text style={styles.logoIcon}>⚡</Text>
            <Text style={styles.logoText}>RUNSPHERE</Text>
          </View>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.subtitle}>Ready to own your city again?</Text>
        </View>

        <View style={styles.form}>
          <NeonInput
            label="Email Address"
            placeholder="runner@kinetic.com"
            icon="@"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <NeonInput
            label="Security Key"
            placeholder="••••••••"
            icon="*"
            isPassword
            value={password}
            onChangeText={setPassword}
          />

          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setRememberMe(value => !value)}>
              <View
                style={[
                  styles.checkbox,
                  rememberMe ? styles.checkboxChecked : undefined,
                ]}>
                {rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.forgotText}>FORGOT?</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={Colors.neonYellow} />
          ) : (
            <GradientButton
              title="Enter Sphere"
              icon={<Text style={{fontSize: 18}}>⚡</Text>}
              onPress={handleLogin}
            />
          )}
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>INSTANT ACCESS</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialLabel}>GOOGLE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialLabel}>APPLE</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            New to the grid?{' '}
            <Text style={styles.joinLink} onPress={() => navigation.navigate('Signup')}>
              JOIN NOW
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  glowTopRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary + '1A',
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: Colors.secondary + '1A',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: 28,
    color: Colors.primaryContainer,
  },
  logoText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    color: Colors.primaryContainer,
    letterSpacing: 4,
  },
  welcomeText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  form: {
    marginBottom: 24,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primaryContainer,
  },
  checkmark: {
    color: Colors.onPrimaryContainer,
    fontSize: 12,
    fontWeight: '900',
  },
  rememberText: {
    color: Colors.onSurfaceVariant,
    fontSize: 14,
  },
  forgotText: {
    color: Colors.secondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.outlineVariant + '4D',
  },
  dividerText: {
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 3,
    marginHorizontal: 16,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '33',
  },
  socialLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  footerText: {
    color: Colors.onSurfaceVariant,
    fontSize: 14,
  },
  joinLink: {
    fontWeight: '900',
    color: Colors.primaryContainer,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});

export default LoginScreen;
