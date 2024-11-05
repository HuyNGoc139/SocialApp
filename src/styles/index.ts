import { StyleSheet } from 'react-native';

import { Colors } from './colors';

export * from './fonts';
const CommonStyles = StyleSheet.create({
  tabBarStyle: {
    paddingBottom: 10,
    paddingTop: 10,
    height: 70,
  },
  borderBlack15: {
    borderColor: Colors.black15,
    borderWidth: 1,
    borderRadius: 14,
  },
});

export { Colors, CommonStyles };
