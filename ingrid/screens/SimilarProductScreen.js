import React from 'react'
import { View, TouchableOpacity, Image, FlatList, SafeAreaView, useWindowDimensions} from 'react-native'
import { Text } from 'react-native-elements'
import Icon from 'react-native-vector-icons/Ionicons'
import NavComponent from './NavComponent'

export default function SimilarProductScreen(props) {
  const [allResults, setAllResults] = React.useState(props.route.params.results)
  const [results, setResults] = React.useState([])
  const [colors] = React.useState(props.route.params.colors)
  const [uncat_colors] = React.useState(props.route.params.uncat_colors)
  const [sample, setSample] = React.useState(props.route.params.sample)
  const [items, setItems] = React.useState([])
  const window = useWindowDimensions()
  const color = {
    "light_blue" : "1E90FF",
    "blue" : "#0000FF",
    "dark_blue" : "#000080",
    "light_green" : "#7FFFD4",
    "green" : "#008000",
    "dark_green" : "#006400",
    "light_grey" : "#D3D3D3",
    "grey" : "#808080",
    "dark_grey" : "#696969",
    "light_orange" :'#FFA07A',
    "orange" : '#FFA500',
    "dark_orange" : '#FF8C00',
    "black" : "#000000",
    "light_purple" : "#9370DB",
    "purple" : "#800080",
    "dark_purple" : '#663399',
    "light_brown" : '#F4A460',
    "brown" : '#A52A2A',
    "dark_brown" : '#8B4513',
    "light_beige" : '#FDF5E6',
    "beige" : '#F5F5DC',
    "dark_beige" : '#B8860B',
    "light_pink" : '#FFB6C1' ,
    "pink" : '#FFC0CB' ,
    "dark_pink" : '#FF1493',
    "white" : "#FFFFF",
    "light_yellow" : "#FFFACD",
    "yellow" : "#FFFF00",
    "dark_yellow" : "#FFD700",
    "light_red" : "#F08080",
    "red" : "#FF0000",
    "dark_red" : "#8B0000",
   }
  const sortResult = (colour) => {
    const match = allResults.filter( e => {
       console.log(e.colour, colour);
       if(e.colour == colour) return true
    })
    console.log(match);
    if (match) setResults(match)
  }

  React.useEffect(() => {
    let imgs = []
    results.forEach((item, i) => {
      imgs.push(item)
    });
    setItems(imgs)
  },[results])

  React.useEffect(() => {
    if(allResults) setResults(allResults)
    console.log(allResults);
  },[allResults])


  return (
    <SafeAreaView style={{flex:1}}>
      <View style={{flex:1}}>
        <Text style={{margin : 10}}> INGRID found these Items for you</Text>
        <View style={{flex:1, marginLeft:window.width/7}}>
          <Image style={{height : '100%', width : '80%'}} resizeMode='contain' source={sample}/>
        </View>
        <View style={{flexDirection : 'row', padding : 10}}>
          <View style={{flex:2, justifyContent : 'center'}}>
            <Text>Colors: </Text>
          </View>
          <FlatList horizontal data={colors}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => sortResult(item)}
                style={{width : 50, height : 50, marginLeft : 5, shadowColor: '#000',marginRight: 5, shadowOffset: { width: 0, height: 2 }, elevation: 5, backgroundColor: color[item]}}>
              </TouchableOpacity>
            )}/>
          <View style={{flex:1}}></View>
        </View>
        { items.length > 0 && (
          <Text style={{margin : 10}}> Select to style</Text>
        )}
        <View style={{flex:1}}>
          <FlatList
            data={items}
            horizontal
            renderItem={({item}) => (
              <TouchableOpacity onPress={() => props.navigation.navigate('styling',{main : item, gender : props.route.params.gender })} style={{margin:10}}>
                <Image style={{height : '80%', width : window.width/3, marginBottom : 10}} source={{uri : 'https://ingrid-bucket.s3.eu-west-2.amazonaws.com/'+item.s3}}/>
                <Text style={{width : 100}}>{item.s3}</Text>
              </TouchableOpacity>
            )}
            />
        </View>
      </View>
      <NavComponent navigation={props.navigation}/>
    </SafeAreaView>
  )
}
