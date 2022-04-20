import React from 'react'
import { SafeAreaView, Image, View, TouchableOpacity, Text} from 'react-native'
import Icon from 'react-native-vector-icons/AntDesign'
import { Dropdown } from 'react-native-element-dropdown'
import { Input } from 'react-native-elements'

export default function OnboardScreen(props) {
  const [name, setName] = React.useState('Alma Smiths')
  const [gender, setGender] = React.useState(1)
  const [date, setDate] = React.useState('16/02/95')

  return (
      <SafeAreaView style={{flex:1, backgroundColor : '#F9F0A3', alignItems : 'center'}}>
        <View style={{padding:20}}>
          <Text style={{fontSize : 18}}>
            On it! Can you provide the details below?
          </Text>
        </View>
        <View>
          <Input placeholder='name' value={name}
            onChange = {(event) => setName(event.value)}
            inputContainerStyle={{marginBottom : -10}}
            containerStyle={{backgroundColor : 'white', width : 280,borderRadius: 25, marginBottom : 10}}/>
          <Dropdown
            style={{backgroundColor : 'white', borderRadius : 25, height : 60, marginBottom : 10}}
            placeholder = 'Choose gender'
            value = {gender}
            valueField = 'value'
            labelField = 'label'
            data = {[{label : 'woman', value : 0}, {label : 'man', value : 1}, {label : 'non-binary', value : 2}]}
            onChange = { item => setGender(item.value)}
            renderItem = {(item) => (<Text>{item.label}</Text>)}
            />
          <Input placeholder='Date of Birth' value={date}
            inputContainerStyle={{marginBottom : -10}}
            onChange = { (event) => setDate(event.value)}
            containerStyle={{backgroundColor : 'white', width : 280,borderRadius: 25, marginBottom : 10}}/>
        </View>
        <View>
          <View style={{width : 300}}>
            <Text style={{fontSize : 12}}>
              By creating an account you agree to our Privacy Policy and Terms of Service.
            </Text>
          </View>
          <TouchableOpacity onPress={() => props.navigation.navigate('upload',{'gender' : gender})}
            style={{flexDirection : 'row', marginTop:20 ,justifyContent : 'center'}}>
            <View>
              <Text style={{fontSize : 28}}>
                Submit
              </Text>
            </View>
            <View style={{marginLeft : 20}}>
              <Icon name="rightcircle" size={30}/>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
  )
}
