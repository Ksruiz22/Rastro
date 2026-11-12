import { Platform } from 'react-native';

export const colors = {
  background: '#131F2E',
  card: '#1B2A3D',
  line: 'rgba(242,239,233,0.10)',
  text: '#F2EFE9',
  muted: 'rgba(242,239,233,0.60)',
  blue: '#3F7FBF',
  lightBlue: '#7FB6E6',
  orange: '#E8853A',
  yellow: '#E8C36A',
};

export const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });
