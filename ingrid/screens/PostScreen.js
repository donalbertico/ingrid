import React from 'react'
import * as AWS from 'aws-sdk'
import { View, TouchableOpacity ,Image, FlatList, SafeAreaView, useWindowDimensions} from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import { nanoid } from 'nanoid/non-secure'
import { Input } from 'react-native-elements'
import { useFocusEffect } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/AntDesign'
import Ion from 'react-native-vector-icons/Ionicons'
import Font from 'react-native-vector-icons/FontAwesome'
import { Text, Button } from 'react-native-elements'
import NavComponent from './NavComponent'

export default function PostScreen(props){
  const [post, setPost] = React.useState()
  const [image,setImage] = React.useState({uri:'//'})
  const [comments,setComments] = React.useState([])
  const [description,setDescription] = React.useState('')
  const [date,setDate] = React.useState(new Date().toDateString())
  const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'})

  const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: {Bucket: 'ingrid-posts'}
  })

  const uploadPost = async () => {
    let date = new Date()
    try {
      let res = await fetch(image.uri)
      let blob = await res.blob()

      s3.upload({
           Key: image.fileName,
           Body: blob,
           ACL: 'public-read'
      }, function(err, data) {
         if(err) console.log(err,'error');
         ddb.putItem({
           TableName: 'Post',
           Item: {
             'id' : {S : nanoid()},
             'createdAt' : {S :
                // date.toLocaleDateString('en-US',{day:'2-digit', month: 'long', year: 'numeric'})
                date.toDateString()
              },
             'description' : {S : description},
             's3' : {S : image.fileName}
           }
         }, (err,data) => {
           console.log('chuchaaa',err,data);
           props.navigation.navigate('community')
         })
      })
    } catch (e) {
      console.log(e);
    }
  }
  const openGallery = () => {
    launchImageLibrary({mediaType : 'photo', includeBase64: true}, (pick) => {
      if (!pick?.assets || !pick.assets.length > 0) return;
      let img = pick.assets[0]
      setImage(img)
    })
  }


  React.useEffect(() => {
    if(props.route.params?.post){
      setPost(props.route.params.post)
      setImage({ uri : 'https://ingrid-posts.s3.eu-west-2.amazonaws.com/'+props.route.params.post.s3})
    } else openGallery()
  },[props.route.params])

  return (
    <SafeAreaView style={{flex:1}}>
      { !post && (
        <TouchableOpacity onPress={() => openGallery()} style={{padding: 10}}>
          <Text>Post in Ingrid</Text>
        </TouchableOpacity>
      )}
      <View style={{flex: post? 2: 1}}>
        <Image
          source = {{uri : image.uri}}
          resizeMode='contain'
          style={{margin: post? 0: 10, width : '100%', height : '100%'}}/>
      </View>
      <View style={{flex:1}}>
        { post ? (
          <View style={{margin : 5}}>
            <View style={{flexDirection : 'row'}}>
              <TouchableOpacity>
                <Icon style={{margin : 8}} name="hearto" size={30}/>
                <Text></Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Font style={{margin : 6}} name="commenting-o" size={30}/>
                <Text></Text>
              </TouchableOpacity>
              <View style={{flex:1}}></View>
              <Ion style={{margin : 8}} name="bookmark-outline" size={30}/>
            </View>
            <View style={{margin : 5}}>
              <Text style={{fontWeight : 'bold'}}>{post.createdAt}</Text>
              <Text>{post.description}</Text>
            </View>
          </View>
        ) : (
          <View style={{margin : 10}}>
            <Input placeholder='describe the style' value={description}
              onChangeText = {(des) => setDescription(des)}/>
            <View style={{ flexDirection : 'row'}}>
              <View style={{flex:1}}></View>
              <Button
                title="Post"
                containerStyle = {{width : '30%'}}
                titleStyle = {{color : 'black'}}
                buttonStyle={{backgroundColor : '#F9F0A3'}}
                onPress = {uploadPost}/>
              <View style={{flex:1}}></View>
            </View>
          </View>
        )}
      </View>
      <NavComponent navigation={props.navigation}/>
    </SafeAreaView>
  )
}
