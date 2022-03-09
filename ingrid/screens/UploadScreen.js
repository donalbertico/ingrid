import React from 'react'
import { View, TouchableOpacity, Image, FlatList} from 'react-native'
import { Text } from 'react-native-elements'
import { launchImageLibrary } from 'react-native-image-picker'
import RNFetchBlob from 'rn-fetch-blob'
import JSZip from 'jszip'
import { unzip } from 'react-native-zip-archive'

export default function UploadScreen(props) {
  const [cropped, setCropped] = React.useState()
  const [imgSrc, setImage] = React.useState(require('../assets/image1.jpeg'))
  const [results, setResults] = React.useState([])

  const openGallery = () => {
    const data = new FormData()
    launchImageLibrary({mediaType : 'photo', includeBase64: true}, (pick) => {
      if (!pick || !pick.assets.length > 0) return;
      let img = pick.assets[0]
      let base = img.base64
      data.append('file',{
        name : img.fileName,
        type : img.type,
        uri : img.uri
      })
      fetch('http://10.3.148.122:80/detect',{
        method: 'POST',
        mode : 'cors',
        body: data
      })
      .then(res => res.blob())
      .then((res) => {
        console.log();
        let filereadr = new FileReader()

        filereadr.readAsDataURL(res)
        filereadr.onload = () => {
          // console.log('CHUCHA',filereadr.result.split('base64,')[1]);
          let zipDir = RNFetchBlob.fs.dirs.CacheDir+'/zips/results.zip'
          RNFetchBlob.fs.writeFile(zipDir,filereadr.result.split('base64,')[1],'base64').then((ff) => {
            setCropped(true)
          })
        }
      })
      .catch(e => console.log(e))
      // .then((json) => {
      //   console.log(json);
      //   let newImageDir = RNFetchBlob.fs.dirs.CacheDir+'/cropped/new.jpeg'
      //   RNFetchBlob.fs.writeFile(newImageDir,base,'base64').then((ff) => {
      //     console.log('sisoo?',ff);
      //     setCropped(true)
      //   })
      // })
    })
  }
  const sendNew = () => {
    let uribe = 'file://'+RNFetchBlob.fs.dirs.CacheDir+'/cropped/new.jpeg'
    let data = new FormData()

    data.append('file',{
      name : 'new.jpeg',
      type : 'image/jpeg',
      uri : uribe
    })
    fetch('http://10.3.148.122:80/detect',{
      method: 'POST',
      body: data
    })
    .then((res) => console.log('?',res))

  }

  React.useEffect(() => {
    console.log('?');
    if(cropped) {
      let data = new FormData()
      let zip = RNFetchBlob.fs.dirs.CacheDir+'/zips/results.zip'
      let uribe = RNFetchBlob.fs.dirs.CacheDir+'/crops/'

      // RNFetchBlob.fs.ls(zip).then(files => {
      //   let imgs = []
      //   console.log(files);
      // }).catch(error => console.log(error))

      unzip(zip, uribe)
      .then((path) => {
        console.log('suiiii',path);
        RNFetchBlob.fs.ls(path).then(files => {
          let imgs = []
          files.forEach((item, i) => {
            imgs.push({uri : 'file://'+path+item})
          });
          console.log(imgs);
          setResults(imgs)
        }).catch(error => console.log(error))
      })
      .catch((error) => {
        console.log(error);
      })

      // setImage({uri: uribe})


      // RNFetchBlob.fs.readFile(RNFetchBlob.fs.dirs.CacheDir+'/cropped/new.jpeg', 'base64')
      //   .then((data) => {
      //     console.log(data);
      //   })


    }
  },[cropped])

  React.useEffect(() => {
    RNFetchBlob.fetch('GET','https://meatfreed.s3.eu-west-2.amazonaws.com/restaurant+logos/ChIJ4Wg_RV47a0gRZr0qr5rB60k.png',{

    })
    .then((res) => {
      RNFetchBlob.fs.writeFile(RNFetchBlob.fs.dirs.CacheDir+'/crops/prove.jpg',res.base64(),'base64').then((ff) => {
        console.log(ff);
      })
    })
  },[])

  return(
    <View>
      <TouchableOpacity onPress={openGallery}>
        <Text>Uploardo</Text>
      </TouchableOpacity>

      <FlatList
        data={results}
        renderItem={({item}) => (
          <>
          <Text>{item.uri}</Text>
          <Image style={{height : 100, width : 100}} source={item}/>
          </>
        )}
        />
      <Image style={{height : 100, width : 100}} source={{uri:'file:///data/user/0/com.ingrid/cache/crops/jacketploplo.jpeg'}}/>
        <TouchableOpacity >
          <Text>{imgSrc}</Text>
        </TouchableOpacity>
    </View>
  )
}
