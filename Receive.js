import React from 'react';
import { Text, Alert, TextInput, Image, View, TouchableOpacity, Dimensions, StyleSheet, Share, FlatList, Modal, Linking } from 'react-native';
import Expo, { SQLite } from 'expo';
const db = SQLite.openDatabase('db4.db');
import Titlebar from './Titlebar';
import Accounts from './Accounts';
import {infura,Theme} from './Utils';
import Icon from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-image';
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
            to : null,
            data : '',
            gas : '100000',
            gasPrice : '',
            advanced: false
        }
    }

    componentDidMount() {
    }

    selectAccount(){
        this.setState({accountsModalOpen:true,to:null});
    }

    accountSelected(name, key){
        this.setState({to:web3.eth.accounts.privateKeyToAccount(key).address, accountsModalOpen:false});
    }
    shareLink(){
        Share.share({title:'Share link', message:Expo.Linking.makeUrl()+"?ref=ethsign&to="+this.state.to+"&value="+this.state.amount});
    }


    
    render(){
        return <View style={Style.base}>
            <Titlebar onClose={()=>this.props.onClose()} title="New Transaction"/>
            <View style={Style.card}>
                <Text style={Style.heavyTextDark}> Amount : </Text>
                {this.state.to?<Text style={Style.textDark}>{this.state.amount}</Text>: <TextInput keyboardType="numeric" value={this.state.amount} onChangeText={(text)=>this.setState({amount:text})} />}
                
            </View>
            {this.state.to?<View style={{width:'100%',justifyContent:'center',alignItems:'center'}}>
                <QRCode
                    style={{margin:8}}
                    value={Expo.Linking.makeUrl()+"?ref=ethsign&to="+web3.eth.accounts.privateKeyToAccount(this.state.to).address+"&value="+this.state.amount}
                    size={200}
                    bgColor='#FFFFFF'
                    fgColor='#000000'/>
                <TouchableOpacity style={Style.fullButton} onPress={()=>this.shareLink()}><Text style={Style.textLight}>Share link</Text></TouchableOpacity>
                </View>:<TouchableOpacity onPress={()=>this.selectAccount()} style={Style.fullButton}>
                    <Text style={Style.textLight}>Select Account</Text>
            </TouchableOpacity>}


            <Modal
                animationType="slide"
                transparent={false}
                onRequestClose={()=>this.setState({accountsModalOpen:false})}
                visible={this.state.accountsModalOpen} >
                <Accounts onSelect={(name,key)=>this.accountSelected(name,key)} onClose={()=>this.setState({accountsModalOpen:false})} />
            </Modal>


        </View>
    }

}