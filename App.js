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
  TouchableHighlight,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import ImageResizer from 'react-native-image-resizer';
import PubNub from 'pubnub';
import { PubNubProvider, PubNubConsumer } from 'pubnub-react';
import CameraRoll from "@react-native-community/cameraroll";

var RNFS = require('react-native-fs');

class App extends Component {
  constructor() {
    super();
    this.state = {
      sharedImg: null,
      photos: [],
    }
    this.pubnub = new PubNub({
      publishKey: 'pub-c-f4a5342c-6ad7-45f0-8239-6c44d94c2305',
      subscribeKey: 'sub-c-c5207010-bf0c-11ea-a57f-4e41fc185ce6',
      uuid: "0",
      subscribeRequestTimeout: 60000,
      presenceTimeout: 122
    });

    this.listener = {
      message: envelope => {
        if (envelope.message.img != null) {
          console.log("Got draw message " + envelope.message.img.length);
          let newImg = 'data:image/jpeg;base64,' + envelope.message.img;
          this.setState({sharedImg: newImg});
        }
      }
    };

    this.pubnub.addListener(this.listener);
    this.pubnub.subscribe({ channels: ["draw"] })
  }


  compressImg = async(img) => {
    let compression = 90;
    while (compression > 30) {
      compression -= 3;
      try {
        const rtn = await ImageResizer.createResizedImage(img, 200, 400, 'JPEG', compression);
        const {uri} = rtn;
        const base64URI = await RNFS.readFile(uri, 'base64');
        if (base64URI.length < 25000) {
          return base64URI;
        }
      } catch(e) {
        console.log("compressImg: Error: " + e)
        return null;
      }
    }
    console.log("Could not compress below 25K")
  }

  handleShareImage = async (newuri) => {
    console.log("handleShareImage: " + newuri);
    const compressedImg = await this.compressImg(newuri);
    if (compressedImg == null) {
      console.log("Failed to compress uri: " + newuri);
      return;
    }
    console.log("Base64: " + compressedImg.length);
    const message = {
      img: compressedImg
    };
    console.log("Publishing to pubnub")
    this.pubnub.publish({channel: "draw", message});
    console.log("Done publishing")
  }

  handleLoadImages = () => {
    console.log("handleLoadImages");
    CameraRoll.getPhotos({
        first: 20,
        assetType: 'Photos',
      })
      .then(r => {
        this.setState({ photos: r.edges });
      })
      .catch((err) => {
          //Error Loading Images
          console.log("Failed to get photos: " + err)
      });
  };

  hasAndroidPermission = async() => {
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

  render() {
    this.hasAndroidPermission();
    return (
      <PubNubProvider style={{flex:1}} client={this.pubnub}>
        <MyApp 
          style={{flex:1}} 
          photos={this.state.photos} 
          handleLoadImages={this.handleLoadImages} 
          handleShareImage={this.handleShareImage} 
          sharedImg={this.state.sharedImg}/>
      </PubNubProvider>
    );
  }
}

class MyApp extends Component {
  constructor(props) {
    super();
    this.props = props;
  }

  render() {
    let {photos, sharedImg, handleShareImage, handleLoadImages} = this.props;
    return (
      <View style={{flex:1}}>
        <Image style={styles.imagefull} source={{ uri: sharedImg}} />
        <Button style={{flex:1}} title="Load Images" onPress={handleLoadImages} />
        <ScrollView horizontal={true} style={{flex: 1}}>
          {photos.map((p, i) => {
            return (
              <TouchableHighlight
                key={i}
                activeOpacity={0.1} 
                underlayColor='#FFFFFF' 
                onPress={() => handleShareImage(p.node.image.uri)}>
                <Image
                  style={styles.thumbnail} 
                  source={{ uri: p.node.image.uri }}
                />
              </TouchableHighlight>);
            })
          }
        </ScrollView>
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
  imagefull: {
    flex: 3,
    resizeMode: "cover",
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    flex: 1,
    resizeMode: "cover",
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
  },
});

export default App;