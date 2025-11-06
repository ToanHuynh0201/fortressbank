import { StyleSheet } from 'react-native';
import { neutral, primary } from './colors';

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
    paddingHorizontal: 24,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  
  // Card styles
  card: {
    backgroundColor: neutral.neutral6,
    borderRadius: 15,
    padding: 16,
    shadowColor: 'rgba(54, 41, 183, 0.07)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 5,
  },
  
  // Text styles
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: primary.primary1,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: neutral.neutral1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#979797',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    fontWeight: '500',
    color: neutral.neutral1,
  },
  captionText: {
    fontSize: 12,
    fontWeight: '500',
    color: neutral.neutral4,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '600',
    color: primary.primary1,
  },
  
  // Spacing styles
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mb16: { marginBottom: 16 },
  mb20: { marginBottom: 20 },
  mb24: { marginBottom: 24 },
  mb32: { marginBottom: 32 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
  mt16: { marginTop: 16 },
  mt24: { marginTop: 24 },
  mt32: { marginTop: 32 },
  
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
  rounded8: { borderRadius: 8 },
  rounded12: { borderRadius: 12 },
  rounded15: { borderRadius: 15 },
  rounded20: { borderRadius: 20 },
  rounded30: { borderRadius: 30 },
  roundedFull: { borderRadius: 9999 },
  
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
