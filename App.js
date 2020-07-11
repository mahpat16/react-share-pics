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

import ImageResizer from 'react-native-image-resizer';
var RNFS = require('react-native-fs');

class App extends Component {
  constructor() {
    super();
    this.state = {
      uri: "https://images.unsplash.com/photo-1594046243098-0fceea9d451e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80",
      photoIndex: 1,
      imgW: 400,
      imgH: 600,
    }
    this.photos = ["https://upload.wikimedia.org/wikipedia/commons/5/5d/M%C3%BCnster%2C_Historisches_Rathaus_--_2018_--_1211-29.jpg",
                   "file:///storage/emulated/0/WhatsApp/Media/WhatsApp Images/IMG-20200708-WA0013.jpg"];
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

    const buttonClick = () => {
      var newIndex = (this.state.photoIndex + 1) % this.photos.length;
      console.log("Photos index is: " + newIndex);
      var newuri = this.photos[newIndex];
      console.log("Photos uri is: " + newuri);
      ImageResizer.createResizedImage(newuri, 200, 300, 'JPEG', 100)
      .then(({uri}) => {
        console.log("Trying to set base64 image: " + uri)
        RNFS.readFile(uri, 'base64')
          .then(base64String => {
            console.log("Base64 of img is: " + base64String);
            compressedImg = 'data:image/jpeg;base64,' + base64String;
            this.photos.push(compressedImg);
            this.setState({photoIndex: (this.photos.length - 1), imgW: 300, imgH: 500 });
          });
      }).catch(err => {
        console.log("Error resizing image: " + err)
        this.setState({photoIndex: newIndex});
      })
    }

    hasAndroidPermission();
    return (
      <View style={styles.imageContainer}>
        <Button title={"Change Image"} onPress={buttonClick}/>
        <Image style={{height: this.state.imgH, width: this.state.imgW}} source={{ uri: this.photos[this.state.photoIndex]}} />
      </View>
    )
  }
}
        //<Image style={styles.image} source={{ uri: "file:///storage/emulated/0/WhatsApp/Media/WhatsApp Images/IMG-20200708-WA0013.jpg"}} />

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    alignItems: 'stretch'
  },
  image: {
    width: 300,
    height: 600
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
