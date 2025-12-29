import { StyleSheet } from 'react-native';
import { neutral, primary } from './colors';
import { typography, spacingScale, borderRadius } from './responsive';

/**
 * Common reusable styles across the application
 */
export const commonStyles = StyleSheet.create({
  // Flex styles
  flex1: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyBetween: {
    justifyContent: 'space-between',
  },
  justifyAround: {
    justifyContent: 'space-around',
  },
  
  // Container styles
  container: {
    flex: 1,
    backgroundColor: neutral.neutral6,
  },
  screenPadding: {
    paddingHorizontal: spacingScale.xl,
  },
  contentContainer: {
    paddingHorizontal: spacingScale.xl,
    paddingTop: spacingScale.xl,
    paddingBottom: spacingScale.xxxl,
  },
  
  // Card styles
  card: {
    backgroundColor: neutral.neutral6,
    borderRadius: borderRadius.lg,
    padding: spacingScale.lg,
    shadowColor: 'rgba(54, 41, 183, 0.07)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 5,
  },
  
  // Text styles
  title: {
    fontSize: typography.title,
    fontWeight: '600',
    color: primary.primary1,
  },
  subtitle: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: neutral.neutral1,
  },
  label: {
    fontSize: typography.label,
    fontWeight: '600',
    color: '#979797',
    marginBottom: spacingScale.sm,
  },
  bodyText: {
    fontSize: typography.bodySmall,
    fontWeight: '500',
    color: neutral.neutral1,
  },
  captionText: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: neutral.neutral4,
  },
  linkText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: primary.primary1,
  },
  
  // Spacing styles
  mb8: { marginBottom: spacingScale.sm },
  mb12: { marginBottom: spacingScale.md },
  mb16: { marginBottom: spacingScale.lg },
  mb20: { marginBottom: spacingScale.xl * 0.83 },
  mb24: { marginBottom: spacingScale.xl },
  mb32: { marginBottom: spacingScale.xxl },
  mt8: { marginTop: spacingScale.sm },
  mt12: { marginTop: spacingScale.md },
  mt16: { marginTop: spacingScale.lg },
  mt24: { marginTop: spacingScale.xl },
  mt32: { marginTop: spacingScale.xxl },
  
  // Shadow styles
  shadowLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  shadowMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  shadowHeavy: {
    shadowColor: 'rgba(54, 41, 183, 0.15)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 8,
  },
  
  // Border styles
  rounded8: { borderRadius: borderRadius.sm },
  rounded12: { borderRadius: borderRadius.md },
  rounded15: { borderRadius: borderRadius.lg },
  rounded20: { borderRadius: borderRadius.xl },
  rounded30: { borderRadius: borderRadius.xxl },
  roundedFull: { borderRadius: borderRadius.full },
  
  // Background colors
  bgPrimary: {
    backgroundColor: primary.primary1,
  },
  bgSecondary: {
    backgroundColor: primary.primary4,
  },
  bgWhite: {
    backgroundColor: neutral.neutral6,
  },
  bgGray: {
    backgroundColor: neutral.neutral5,
  },
  
  // Width/Height helpers
  fullWidth: {
    width: '100%',
  },
  fullHeight: {
    height: '100%',
  },
});

export default commonStyles;
