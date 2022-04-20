import React from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Ant from 'react-native-vector-icons/AntDesign'
import { Text } from 'react-native-elements'
import { styles } from '../styles'

export default function NavComponent({navigation, index}) {

  return (
    <View style={{justifyContent : 'center', backgroundColor : '#FFF6EA'}}>
      <View style={{flexDirection : 'row', alignItems : 'center'}}>
        <View style={{flex:1}}></View>
        <View style={{flex:3, margin:10}}>
          <TouchableOpacity
            onPress={() => navigation.navigate('onboard')}
            style={{flexDirection : 'row'}}>
            <View style={{alignItems : 'center', marginTop : 4}}>
              <Icon name="home-outline" size={30}/>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{flex:3, margin:10}}>
          <TouchableOpacity
            onPress={() => navigation.navigate('upload')}
            style={{flexDirection : 'row'}}>
            <View style={{alignItems : 'center', marginTop : 4}}>
              <Icon name="shirt-outline" size={30}/>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{flex:3, margin:10}}>
          <TouchableOpacity
            onPress={() => navigation.navigate('community')}
            style={{flexDirection : 'row'}}>
            <View style={{alignItems : 'center'}}>
              <Ant name="hearto" size={30}/>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{flex:3, margin:10}}>
          <TouchableOpacity
            onPress={() => navigation.navigate('community')}
            style={{flexDirection : 'row'}}>
            <View style={{alignItems : 'center'}}>
              <Ant name="user" size={30}/>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
