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

const SignupScreen = ({navigation}: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const signup = useAuthStore(state => state.signup);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'All fields are required.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password too short', 'Use at least 6 characters.');
      return;
    }

    if (!agreedTerms) {
      Alert.alert('Terms required', 'Please accept the terms to continue.');
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword: password,
      });

      Alert.alert('Account created', 'Please log in with your new account.', [
        {text: 'Continue', onPress: () => navigation.navigate('Login')},
      ]);
    } catch (error: any) {
      Alert.alert(
        'Signup failed',
        error?.message || 'Please try a different email address.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.surfaceDim} />

      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomLeft} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            JOIN THE{'\n'}
            <Text style={styles.heroPulse}>PULSE</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Create your runner profile to start tracking GPS runs and climb local leaderboards.
          </Text>
        </View>

        <NeonInput
          label="Full Name"
          placeholder="Alex Runner"
          value={name}
          onChangeText={setName}
        />
        <NeonInput
          label="Email Address"
          placeholder="runner@runsphere.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <NeonInput
          label="Password"
          placeholder="••••••••"
          isPassword
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAgreedTerms(value => !value)}>
          <View
            style={[
              styles.checkbox,
              agreedTerms ? styles.checkboxChecked : undefined,
            ]}>
            {agreedTerms ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
          <Text style={styles.termsText}>
            I agree to the <Text style={styles.termsLink}>Terms of Performance</Text> and privacy policy.
          </Text>
        </TouchableOpacity>

        <View style={{marginTop: 16}}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.neonYellow} />
          ) : (
            <GradientButton title="Initialize Training" onPress={handleSignup} />
          )}
        </View>

        <View style={styles.socialSection}>
          <Text style={styles.socialDivider}>Or continue with</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialLabel}>GOOGLE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialLabel}>APPLE</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.loginPrompt}>
            Already a member?{' '}
            <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
              Log in here
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
    top: -60,
    right: -60,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary + '1A',
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: Colors.secondary + '1A',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  heroSection: {
    marginBottom: 40,
  },
  heroTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 44,
    fontWeight: '900',
    color: Colors.onSurface,
    letterSpacing: -2,
  },
  heroPulse: {
    color: Colors.primaryContainer,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    marginTop: 12,
    lineHeight: 24,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.onPrimary,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primaryContainer,
    textDecorationLine: 'underline',
  },
  socialSection: {
    marginTop: 40,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant + '1A',
    alignItems: 'center',
    gap: 20,
  },
  socialDivider: {
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  socialButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(25,37,64,0.6)',
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '33',
  },
  socialLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: 2,
  },
  loginPrompt: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  loginLink: {
    color: Colors.neonBlue,
    fontWeight: '700',
  },
});

export default SignupScreen;
