import React from 'react'
import * as AWS from 'aws-sdk'
import { View, TouchableOpacity, Image, FlatList, SafeAreaView, useWindowDimensions} from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import { nanoid } from 'nanoid/non-secure'
import { useFocusEffect } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/AntDesign'
import { Text } from 'react-native-elements'

export default function CommunityScreen(props) {
  const [posts,setPosts] = React.useState([])
  const docClient = new AWS.DynamoDB.DocumentClient()
  const window = useWindowDimensions()

  useFocusEffect(
    React.useCallback(() => {
      let results = []
      docClient.scan({
        TableName: 'Post'
      }, (err,data) => {
        results = data.Items
        setPosts(results.reverse())
      })
    },[])
  )

  return (
    <SafeAreaView style={{flex:1, margin : 5}}>
      <TouchableOpacity
        onPress={() => props.navigation.navigate('post')}
        style={{
          justifyContent : 'center',
          alignItems : 'center',
          position : 'absolute',
          zIndex: 3,
          bottom :5, right :5,
          height : 80, width : 80,
          borderRadius : 50,
          backgroundColor : '#F9F0A3'}}>
          <Text style={{fontSize: 40, fontWeight : '100'}}>+</Text>
      </TouchableOpacity>
      <FlatList
        data={posts}
        numColumns = {2}
        contentContainerstyle={{ marginTop:20 ,justifyContent : 'center'}}
        renderItem={({item}) => (
          <TouchableOpacity onPress={() => props.navigation.navigate('post',{post: item})} style={{padding : 5}}>
            <Image
              style={{
                borderRadius : 10,
                height: window.height? window.height/2.5 : 300,
                width: window.width? window.width/2.2 : 100
              }}
              source={{uri : 'https://ingrid-posts.s3.eu-west-2.amazonaws.com/'+item.s3}}/>
            <View style={{position : 'absolute', bottom : 10, left : 10}}>
              <Text style={{color:'white', fontWeight:'bold'}}>{item.createdAt}</Text>
              <Text style={{color:'white'}}>{item.description}</Text>
            </View>
         </TouchableOpacity>
        )}
        />
    </SafeAreaView>
  )
}
