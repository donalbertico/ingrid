import React from 'react'
import * as AWS from 'aws-sdk'
import { View, TouchableOpacity, Image, FlatList, SafeAreaView, useWindowDimensions} from 'react-native'
import { Text } from 'react-native-elements'
import { launchImageLibrary } from 'react-native-image-picker'
import RNFetchBlob from 'rn-fetch-blob'
import { unzip } from 'react-native-zip-archive'
import NavComponent from './NavComponent'

export default function UploadScreen(props) {
  const [cropped, setCropped] = React.useState()
  const [results, setResults] = React.useState([])
  const [sample, setSample] = React.useState()
  const [gender, setGender] = React.useState(props.route.params.gender)
  const window = useWindowDimensions()

  const uploadS3 = async (img) => {
    try {
      let res = await fetch(img.uri)
      let blob = await res.blob()
      s3.upload({
           Key: img.fileName,
           Body: blob,
           ACL: 'public-read'
      }, function(err, data) {
         if(err) console.log(err,'error');
         console.log('Successfully Uploaded!');
      })
    } catch (e) {
      console.log(e);
    }
  }
  const openGallery = () => {
    const data = new FormData()
    launchImageLibrary({mediaType : 'photo', includeBase64: true}, (pick) => {
      if (!pick?.assets || !pick.assets.length > 0) return;
      let img = pick.assets[0]
      let base = img.base64
      data.append('file',{
        name : img.fileName,
        type : img.type,
        uri : img.uri,
      })

      // fetch('http://10.3.148.122:80/detect',{
      fetch('http://35.178.165.171/detect',{
        method: 'POST',
        mode : 'cors',
        body: data
      })
      .then(res => res.blob())
      .then((res) => {
        let filereadr = new FileReader()
        filereadr.readAsDataURL(res)
        filereadr.onload = () => {
          let zipDir = RNFetchBlob.fs.dirs.CacheDir+'/zips/results.zip'
          RNFetchBlob.fs.writeFile(zipDir,filereadr.result.split('base64,')[1],'base64').then((ff) => {
            setCropped(true)
            setSample({uri : img.uri})
          })
        }
      })
      .catch(e => console.log(e))
    })
  }
  const _imageSlected = (selection) => {
    let data = new FormData()
    data.append('file',{
      name : selection.uri.split('/crops/')[1],
      type : 'image/jpeg',
      uri : selection.uri
    })
    data.append('gender',gender)
    // fetch('http://10.3.148.122:80/similar',{
    fetch('http://35.178.165.171/similar',{
      method: 'POST',
      mode : 'cors',
      body: data
    })
    .then(res => res.json())
    .then(res => props.navigation.navigate('similar',{
        sample : selection,
        results : res.similar,
        colors: res.colors,
        uncat_colors : res.uncat_colors,
        gender : gender
      }))
    .catch(e => console.log(e))
  }

  React.useEffect(() => {
    openGallery()
  },[])

  React.useEffect(() => {
    if(cropped) {
      let data = new FormData()
      let zip = RNFetchBlob.fs.dirs.CacheDir+'/zips/results.zip'
      let croppedPath = RNFetchBlob.fs.dirs.CacheDir+'/crops/'
      setResults([])
      RNFetchBlob.fs.unlink(RNFetchBlob.fs.dirs.CacheDir+'/crops')
        .then(() => {
          unzip(zip, croppedPath)
          .then((path) => {
            RNFetchBlob.fs.ls(path).then(files => {
              let imgs = []
              files.forEach((item, i) => {
                imgs.push({uri : 'file://'+path+item})
              });
              setResults(imgs)
              setCropped(false)
            }).catch(error => {
              console.log(error);
              setCropped(false)
            })
          })
          .catch((error) => {
            setCropped(false)
          })
        })
        .catch((err) => {
          unzip(zip, croppedPath)
          .then((path) => {
            RNFetchBlob.fs.ls(path).then(files => {
              let imgs = []
              files.forEach((item, i) => {
                imgs.push({uri : 'file://'+path+item})
              });
              setResults(imgs)
              setCropped(false)
            }).catch(error => {
              console.log(error);
              setCropped(false)
            })
          })
          .catch((error) => {
            setCropped(false)
          })
        })
    }
  },[cropped])

  return(
    <SafeAreaView style={{flex:1}}>
      <View style={{flex:1}}>
        <TouchableOpacity onPress={openGallery} style={{margin : 20}}>
          <Text>Upload</Text>
        </TouchableOpacity>
        { sample && (
          <View style={{flex:1, marginLeft:window.width/6}}>
            <TouchableOpacity stlye={{flex:1, alignItems : 'center'}} onPress={openGallery}>
              <Image style={{height : '100%', width : '75%'}} source={sample}/>
            </TouchableOpacity>
          </View>
        )}
        <View style={{margin : 20}}>
          <Text>Select to look up</Text>
        </View>
        <View style={{flex:1}}>
          <FlatList
            data={results}
            horizontal
            renderItem={({item}) => (
              <DetectedImage item={item} selectImage={(item) => _imageSlected(item)}/>
            )}/>
        </View>
      </View>
      <NavComponent navigation={props.navigation}/>
    </SafeAreaView>
  )
}

function DetectedImage({item,selectImage}) {
    const [image] = React.useState(item)
    const window = useWindowDimensions()
    const [width, setWidth] = React.useState(100)
    const [height, setHeight] = React.useState(100)

    const setImageRealSize = ({width, height}) => {
      let ratio = height / width
      if (ratio < 0 ) setHeight(height*ratio)
      else setHeight('80%')
      setWidth(window.width/2.2)
    }
    return (
      <TouchableOpacity style={{
          margin : 10,
        }} onPress={() => selectImage(item)}>
        <Image style={{height : '80%', width : width}}
          source={item}
          resizeMode='contain'
          onLoad={({nativeEvent: {source: {width, height}}}) => setImageRealSize({width, height})}
          />
        <Text>{item.uri.split('_')[1].split('-')[0]}</Text>
      </TouchableOpacity>
    )
}
