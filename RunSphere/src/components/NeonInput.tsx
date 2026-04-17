import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import {Colors} from '../theme/colors';

interface NeonInputProps extends TextInputProps {
  label: string;
  icon?: string;
  isPassword?: boolean;
}

const NeonInput: React.FC<NeonInputProps> = ({
  label,
  icon,
  isPassword = false,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [secureEntry, setSecureEntry] = useState(isPassword);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          focused ? styles.inputWrapperFocused : undefined,
        ]}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.outline + '80'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={secureEntry}
          {...props}
        />
        {isPassword ? (
          <TouchableOpacity onPress={() => setSecureEntry(value => !value)}>
            <Text style={styles.toggleText}>{secureEntry ? 'SHOW' : 'HIDE'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {focused ? <View style={styles.focusBar} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Lexend-Bold',
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  inputWrapperFocused: {
    borderBottomColor: Colors.secondary,
  },
  icon: {
    fontSize: 18,
    marginRight: 12,
    color: Colors.outline,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.onSurface,
    padding: 0,
  },
  toggleText: {
    color: Colors.primaryContainer,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  focusBar: {
    height: 2,
    backgroundColor: Colors.secondary,
    borderRadius: 1,
    marginTop: -2,
  },
});

export default NeonInput;
