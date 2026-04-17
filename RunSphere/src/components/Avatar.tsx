import React from 'react';
import {View, Image, StyleSheet, ViewStyle} from 'react-native';
import {Colors} from '../theme/colors';

interface AvatarProps {
  uri?: string;
  size?: number;
  borderColor?: string;
  style?: ViewStyle;
}

const Avatar: React.FC<AvatarProps> = ({
  uri,
  size = 48,
  borderColor = Colors.outlineVariant + '33',
  style,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor,
        },
        style,
      ]}>
      {uri ? (
        <Image
          source={{uri}}
          style={[
            styles.image,
            {width: size - 4, height: size - 4, borderRadius: (size - 4) / 2},
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: size - 4,
              height: size - 4,
              borderRadius: (size - 4) / 2,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
});

export default Avatar;
