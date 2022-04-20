import React from 'react'
import { SafeAreaView, View, TouchableOpacity, Image, FlatList} from 'react-native'
import Icon from 'react-native-vector-icons/AntDesign'
import Ion from 'react-native-vector-icons/Ionicons'
import RNFetchBlob from 'rn-fetch-blob'
import NavComponent from './NavComponent'
import { Text } from 'react-native-elements'

export default function StylingScreen(props){
  const [combos, setCombo] = React.useState([])
  const [index, setIndex] = React.useState(0)
  const [main, setMain] = React.useState(props.route.params.main)

  React.useEffect(() => {
    // fetch('http://10.3.148.122:80/combos?colour='+
    fetch('http://35.178.165.171/combos?colour='+
      `${props.route.params.main.colour}`+
      `&gender=${props.route.params.gender}`+
      `&category=${props.route.params.main.category}`)
      .then(res => res.json())
      .then((res) => {
        let combs = []
        for (var i = 0; i < 5; i++) {
          combs.push(res[i])
        }
        setCombo(combs)
      })
  },[])

  const donwloadItem = async () => {
    const { config, fs } = RNFetchBlob;
    let PictureDir = fs.dirs.PictureDir;
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        // Related to the Android only
        useDownloadManager: true,
        notification: true,
        path:
          PictureDir +
          '/' + main.s3,
        description: 'Image',
      },
    };
    try {
      config(options)
        .fetch('GET', 'https://ingrid-bucket.s3.eu-west-2.amazonaws.com/'+ main.s3)
        .then(res => {
          console.log('sisa');
          props.navigation.navigate('community')
        });
    } catch (e) {
      console.log('nola');
    }
  }

  return (
    <SafeAreaView style={{flex : 1 }}>
      <View style={{flex:1}}>
        <View style={{margin : 20, flexDirection : 'row'}}>
          <View>
            <Text>These our top styling options</Text>
          </View>
          <View style={{flex:1}}></View>
          <TouchableOpacity onPress={donwloadItem}>
            <Ion name="share-outline" size={28}/>
          </TouchableOpacity>
        </View>
        <View style={{flex:1,flexDirection : 'row', marginBottom : -40}}>
          <View style={{flex:1}}>
            { combos[index]?.top ? (
              <Image  style={{height : '100%', width: '100%'}} source={{ uri : 'https://ingrid-bucket.s3.eu-west-2.amazonaws.com/'+combos[index]?.top.s3}}/>
            ) : (
              <Image style={{height : '100%', width: '100%'}} source={{ uri : 'https://ingrid-bucket.s3.eu-west-2.amazonaws.com/'+combos[index]?.lowTop.s3}}/>
            )}
          </View>
          <View style={{flex:1, alignItems : 'center'}}>
            <Image style={{height : '100%', width: '100%'}} source={{ uri : 'https://ingrid-bucket.s3.eu-west-2.amazonaws.com/'+ main.s3}}/>
          </View>
        </View>
        <View style={{flexDirection : 'row', padding : 5}}>
          <TouchableOpacity
            style={{ left : 10, szIndex:100}}
            onPress={() => index < 1 ? setIndex(4) : setIndex((index) => index -1)}>
            <Icon name="arrowleft" size={30}/>
          </TouchableOpacity>
          <View style={{flex:1}}></View>
          <TouchableOpacity
            style={{szIndex:10, right: 10}}
            onPress={() => index > 3 ? setIndex(0) : setIndex((index) => index + 1)}>
            <Icon name="arrowright" size={30}/>
          </TouchableOpacity>
        </View>
        <View style={{flex : 1, flexDirection : 'row', marginTop : 5}}>
          <View style={{flex:1}}>
            { combos[index]?.bottom ? (
                <Image style={{height : '100%', width: '100%'}} source={{ uri : 'https://ingrid-bucket.s3.eu-west-2.amazonaws.com/'+ combos[index]?.bottom.s3}}/>
              ): ( (combos[index]?.lowTop?.category && combos[index]?.lowTop?.category != 10 && combos[index]?.top)  && (
                <Image style={{height : '100%', width: '100%'}} source={{ uri : 'https://ingrid-bucket.s3.eu-west-2.amazonaws.com/'+ combos[index]?.lowTop.s3}}/>
              )
            )}
          </View>
          <View style={{flex:1}}>
            { combos[index]?.shoes && (
              <Image style={{height : '50%', width: '85%'}} source={{ uri : 'https://ingrid-bucket.s3.eu-west-2.amazonaws.com/'+ combos[index]?.shoes.s3}}/>
            )}
            { combos[index]?.accesory && (
              <Image style={{height : '48%', width: '65%'}} source={{ uri : 'https://ingrid-bucket.s3.eu-west-2.amazonaws.com/'+ combos[index]?.accesory.s3}}/>
            )}
          </View>
        </View>
      </View>
      <NavComponent navigation={props.navigation}/>
    </SafeAreaView>
  )
}
