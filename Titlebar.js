import React from 'react';
import { Text, View, Dimensions, TouchableOpacity } from 'react-native';
const { height,width } = Dimensions.get('window');
import Icon from 'react-native-vector-icons/Ionicons';
import {Theme} from './Utils';



export default class Titlebar extends React.Component {

    constructor(props){
        super(props);
        this.props = props;
        this.state = {
        };
        var self = this;
    }


  render() {
    return <View style={{height : 64, width : width, backgroundColor : Theme.accent}}>
            <View style={{height : 64, flexDirection:'row', width:width}}>
                <TouchableOpacity onPress={()=>this.props.onClose()} style={{height:64,width:64, justifyContent:'center', alignItems:'center'}}>
                    <Icon name='ios-arrow-back' style={{color:Theme.accentText}} size={32} />
                </TouchableOpacity>
                <Text style={{color : Theme.accentText, fontSize : 20, lineHeight : 64, height : 64, width:width-128}}>{this.props.title} </Text>
                {this.props.actionIcon?<TouchableOpacity onPress={()=>this.props.onAction()} style={{height:64,width:64, justifyContent:'center', alignItems:'center'}}>
                    <Icon name={this.props.actionIcon} style={{color:Theme.accentText}} size={32} />
                </TouchableOpacity>:null}
            </View>
        </View>
    
  }
}
