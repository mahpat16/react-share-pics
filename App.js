/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Image,
  Button,
  Text,
  PermissionsAndroid,
  StatusBar,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

class App extends Component {
  constructor() {
    super();
    this.state = {
      photos: []
    }
  }
  render() {
    async function hasAndroidPermission() {
      console.log("Asking for permissions")
      const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
    
      const hasPermission = await PermissionsAndroid.check(permission);
      if (!hasPermission) {
        await PermissionsAndroid.request(permission);
      }

      const rPermission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
    
      const rhasPermission = await PermissionsAndroid.check(rPermission);
      if (!rhasPermission) {
        await PermissionsAndroid.request(rPermission);
      }
      console.log("Done with permissions")
    }
    hasAndroidPermission();
    return (
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={{ uri: "file:///storage/emulated/0/WhatsApp/Media/WhatsApp Images/IMG-20200708-WA0013.jpg"}} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    alignItems: 'stretch'
  },
  image: {
    flex: 1
  },
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
