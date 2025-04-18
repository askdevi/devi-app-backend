import { StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#220038', // Background gradient color
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  textWhite: {
    color: '#ffffff',
  },
  buttonPrimary: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default globalStyles;
