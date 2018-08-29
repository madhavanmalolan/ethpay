import React from 'react';
import { Text, Alert, TextInput, Image, View, TouchableOpacity, Dimensions, StyleSheet, Share, FlatList, Modal, Linking } from 'react-native';
import Expo, { SQLite } from 'expo';
const db = SQLite.openDatabase('db4.db');
import Titlebar from './Titlebar';
import {infura,Theme} from './Utils';
import Icon from 'react-native-vector-icons/Ionicons';
import Style from './Style';

const Web3 = require('web3');
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(infura));

export default class Send extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            accountsModalOpen : false,
            amount : '',
            to : '',
            data : '',
            gas : '100000',
            gasPrice : '',
            advanced: false
        }
    }

    componentDidMount() {
    }

    
    createTransaction(){
        var base = Expo.Linking.makeUrl() + "?ref=ethsign&action=sendSignedTransaction";
        console.log(this.state);
        if(this.state.to && this.state.to.length > 0){
            if(web3.utils.isAddress(this.state.to)){
                base += "&to="+this.state.to;
            }
            else{
                Alert.alert("Incorrect address", "Please enter a valid ETH address for 'To'. ETH accounts look like 0x2db6ff6eb673138e2dcc96ea7b9037552f788af4");
                return;
            }
        }
        if(this.state.amount && this.state.amount.length > 0){
            if(isNaN(this.state.amount.trim()) || !Number.isInteger(Number.parseFloat(this.state.amount.trim()))){
                Alert.alert("Invalid amount", "Amount is in the denomination of Wei. Please convert ETH to Wei before proceeding.");
                return;
            }
            else{
                base+='&value='+this.state.amount.trim();
            }
        }
        if(this.state.data && this.state.data.length > 0){
            base+="&data="+this.state.data;
        }
        if(this.state.gas&&this.state.gas.length > 0){
            if(isNaN(this.state.gas.trim()) || !Number.isInteger(Number.parseFloat(this.state.gas.trim()))){
                Alert.alert("Invalid gas", "Gas has to be an integer");
                return;
            }
            else{
                base+="&gas="+this.state.gas.trim();
            }
        }
        else{
            Alert.alert("Gas is a required field", "Typically, gas should be set higher than 21,000");
        }
        if(this.state.gasPrice&&this.state.gasPrice.length > 0){
            if(isNaN(this.state.gasPrice.trim()) || !Number.isInteger(Number.parseFloat(this.state.gasPrice.trim()))){
                Alert.alert("Invalid gas price", "Gas price is in the denomination of Wei. Please convert ETH to Wei before proceeding.");
                return;
            }
            else{
                base+="&gasPrice="+this.state.gasPrice.trim();
            }
        }
        Linking.openURL(base);
        console.log(base);
        this.props.onClose();
    }
    render(){
        return <View style={Style.base}>
            <Titlebar onClose={()=>this.props.onClose()} title="New Transaction"/>
            <View style={Style.card}>
                <Text style={Style.heavyTextDark}> To : </Text>
                <TextInput value={this.state.to} onChangeText={(text)=>this.setState({to:text})} />
                <Text style={Style.heavyTextDark}> Amount (in Wei) : </Text>
                <TextInput keyboardType="numeric" value={this.state.amount} onChangeText={(text)=>this.setState({amount:text})} />
                {this.state.advanced?<View>
                        <Text style={Style.heavyTextDark}> Data (plain text) : </Text>
                        <TextInput value={this.state.data} onChangeText={(text)=>this.setState({data:text})} />
                        <Text style={Style.heavyTextDark}> Gas : </Text>
                        <TextInput keyboardType="numeric" value={this.state.gas} onChangeText={(text)=>this.setState({gas:text})} />
                        <Text style={Style.heavyTextDark}> Gas Price (in Wei) : </Text>
                        <TextInput keyboardType="numeric" value={this.state.gasPrice} onChangeText={(text)=>this.setState({gasPrice:text})} />
                    </View>:<TouchableOpacity onPress={()=>this.setState({advanced:true})}><Text style={{color:"#aaa"}}><Icon name='md-add' size={16}/> Advanced options</Text></TouchableOpacity>}
                
            </View>
            <TouchableOpacity onPress={()=>this.createTransaction()} style={Style.fullButton}>
                    <Text style={Style.textLight}>Done</Text>
            </TouchableOpacity>

        </View>
    }

}