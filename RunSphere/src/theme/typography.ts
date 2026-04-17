// Typography tokens from DESIGN.md
// Headline/Display: Lexend | Body/Label: Inter

import {Platform} from 'react-native';

const fontFamily = {
  headline: Platform.OS === 'ios' ? 'Lexend' : 'Lexend-Black',
  headlineBold: Platform.OS === 'ios' ? 'Lexend-Bold' : 'Lexend-Bold',
  body: Platform.OS === 'ios' ? 'Inter' : 'Inter-Regular',
  bodyMedium: Platform.OS === 'ios' ? 'Inter-Medium' : 'Inter-Medium',
  bodyBold: Platform.OS === 'ios' ? 'Inter-Bold' : 'Inter-Bold',
  label: Platform.OS === 'ios' ? 'Inter' : 'Inter-Regular',
};

export const Typography = {
  displayLg: {
    fontFamily: fontFamily.headline,
    fontSize: 96,
    fontWeight: '900' as const,
    letterSpacing: -3,
  },
  displayMd: {
    fontFamily: fontFamily.headline,
    fontSize: 72,
    fontWeight: '900' as const,
    letterSpacing: -2,
  },
  displaySm: {
    fontFamily: fontFamily.headline,
    fontSize: 56,
    fontWeight: '900' as const,
    letterSpacing: -1.5,
  },
  headlineLg: {
    fontFamily: fontFamily.headline,
    fontSize: 40,
    fontWeight: '900' as const,
    letterSpacing: -1,
  },
  headlineMd: {
    fontFamily: fontFamily.headline,
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  headlineSm: {
    fontFamily: fontFamily.headline,
    fontSize: 24,
    fontWeight: '700' as const,
  },
  titleLg: {
    fontFamily: fontFamily.headline,
    fontSize: 20,
    fontWeight: '700' as const,
  },
  titleMd: {
    fontFamily: fontFamily.headlineBold,
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  titleSm: {
    fontFamily: fontFamily.headlineBold,
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: 1.5,
  },
  bodyLg: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodySm: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  labelLg: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  labelMd: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  labelSm: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
};

export default Typography;
