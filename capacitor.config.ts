import { CapacitorConfig } from '@capacitor/cli';

const isDev = process.env.NODE_ENV !== 'production';

const config: CapacitorConfig = {
  appId: 'com.capstone.fieldops',
  appName: 'Field Ops',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Point to your deployed URL in production, e.g.:
    // url: 'https://your-app.vercel.app',
    // For local development with live reload, set to your machine's local IP:
    // url: 'http://192.168.1.x:3000',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
    StatusBar: {
      style: 'Default',
    },
  },
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
