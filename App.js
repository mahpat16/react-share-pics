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
      uri: "https://images.unsplash.com/photo-1594046243098-0fceea9d451e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80",
      photoIndex: 1,
      imgW: 400,
      imgH: 600,
      sharedImg: null,
      photos: [],
    }
    this.photos = ["https://upload.wikimedia.org/wikipedia/commons/5/5d/M%C3%BCnster%2C_Historisches_Rathaus_--_2018_--_1211-29.jpg",
                   "file:///storage/emulated/0/WhatsApp/Media/WhatsApp Images/IMG-20200708-WA0013.jpg"];
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
            console.log("GGot draw message " + envelope.message.img.length);
            newImg = 'data:image/jpeg;base64,' + envelope.message.img;
            this.setState({sharedImg: newImg, imgW:320, imgH: 640});
          }
        }
      };

    this.pubnub.addListener(this.listener);
    this.pubnub.subscribe({ channels: ["draw"] })

    this.compressImg = async(img) => {
      let compression = 90;
      while (compression > 50) {
        compression -= 3;
        try {
          const rtn = await ImageResizer.createResizedImage(img, 320, 640, 'JPEG', compression);
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
    }
  }

  _handleButtonPress = () => {
    console.log("In get photos button");
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

  _handleTouchPress = (uri) => {
    console.log("Pressed: " + uri);
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

    const buttonClick = async() => {
      var newIndex = (this.state.photoIndex + 1) % this.photos.length;
      console.log("Photos index is: " + newIndex);
      var newuri = this.photos[newIndex];
      console.log("Photos uri is: " + newuri);
      const compressedImg = await this.compressImg(newuri);
      if (compressedImg == null) {
        this.setState({photoIndex: newIndex});
        return;
      }
      console.log("Base64 of img is: " + compressedImg.length);
      const message = {
        img: compressedImg
      };
      console.log("Publishing to pubnub")
      this.pubnub.publish({channel: "draw", message});
      console.log("Done publishing")
    }

    hasAndroidPermission();

    return (
      <PubNubProvider client={this.pubnub}>
      <View style={styles.imageContainer}>
        <Button title={"Change Image"} onPress={buttonClick}/>
        <Image style={{height: this.state.imgH, width: this.state.imgW}} source={{ uri: this.state.sharedImg}} />
        <Button title="Load Images" onPress={this._handleButtonPress} />
        <ScrollView horizontal={true} style={{flex: 1}}>
          {this.state.photos.map((p, i) => {
          return (
            <TouchableHighlight
              key={i}
              activeOpacity={0.2} 
              underlayColor='#000000' 
              onPress={() => this._handleTouchPress(p.node.image.uri)}>
              <Image
                style={styles.thumbnail} 
                source={{ uri: p.node.image.uri }}
              />
            </TouchableHighlight>
          );
        })}
        </ScrollView>
      </View>
      </PubNubProvider>
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