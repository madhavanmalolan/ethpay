import React from 'react';
import {infura,Theme,DB} from './Utils';
import { Text, Alert, TextInput, Image, View, TouchableOpacity, Dimensions, StyleSheet, Share, FlatList, Modal } from 'react-native';
import Expo, { SQLite } from 'expo';
const db = SQLite.openDatabase(DB);
import Titlebar from './Titlebar';
const Web3 = require('web3');
const web3 = new Web3();
import Style from './Style';
web3.setProvider(new web3.providers.HttpProvider(infura));

export default class Accounts extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            key : "",
            accountName:"",
            accountsModalOpen:false,
            accounts : [],
            balances : {},
            refreshing:false
        }
    }

    componentDidMount() {
        db.transaction(tx => {
          tx.executeSql(
            'create table if not exists accounts (id integer primary key not null, name text, key text);'
          );
        });
        this.loadAccounts(true);
    }

    loadAccounts(fetchBalance){
        this.setState({refreshing:true})
        console.log("LOAD");
        var self = this;
        db.transaction(tx=>{
            tx.executeSql(`select * from accounts`,[],(_, { rows: { _array } })=>{
                this.setState({accounts:_array, refreshing:false});
                for(var i = 0 ; i < _array.length; i++){
                    var address = web3.eth.accounts.privateKeyToAccount(_array[i].key).address;
                    if(fetchBalance){
                        web3.eth.getBalance(address).then(function(b){
                            console.log(address+":"+b);
                            var balances = self.state.balances;
                            balances[address] = b;
                            self.setState({balances:balances});
                            //self.loadAccounts(false);
                        });
                    }
                }
            })
        })
    }

    openAddAccount(){
        this.setState({
            accountName:"",
            key : "",
            accountsModalOpen : true
        });
    }

    addAccount(){
        var key = this.state.key.startsWith('0x')?this.state.key:'0x'+this.state.key;
        try{
            var account = web3.eth.accounts.privateKeyToAccount(key);
            var self = this;
            db.transaction(tx=>{
                tx.executeSql(`insert into accounts (name,key) values(?,?)`,[this.state.accountName,key],(_)=>{
                    Alert.alert("Success!", "Your new account has been added");
                    self.loadAccounts(true);
                    self.setState({            accountsModalOpen : false                });
                })
            });
        }
        catch(e){
            Alert.alert("Something went wrong",e.message);
        }

    }

    accountView(item){
        var bal = this.state.balances[web3.eth.accounts.privateKeyToAccount(item.item.key).address];
        console.log(typeof(bal));
        return <TouchableOpacity onPress={()=>this.props.onSelect(item.item.name, item.item.key)} style={{padding:16, margin:8, borderRadius:8, backgroundColor:"#fefefe"}}>
        <Text style={{fontWeight:'bold'}}>Name : {item.item.name} </Text>
        <Text>Address : {web3.eth.accounts.privateKeyToAccount(item.item.key).address} </Text>
        <Text>Balance : {bal?bal+" Wei":"Loading ..."}</Text>
        </TouchableOpacity>
    }

    render(){
        return <View style={Style.base}>
            <Titlebar onClose={()=>this.props.onClose()} title="Select account"/>

            <FlatList
                onRefresh={()=>this.loadAccounts(true)}
                refreshing={this.state.refreshing}
                data={this.state.accounts}
                renderItem={(item)=>this.accountView(item)}
                keyExtractor={(item)=>item.key}
                />
            <TouchableOpacity onPress={()=>this.openAddAccount()} style={Style.fullButton}>
                <Text style={Style.textLight}> Add account </Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={false}
                onRequestClose={()=>this.setState({accountsModalOpen:false})}
                visible={this.state.accountsModalOpen} >
                <View style={Style.base}>
                <Titlebar onClose={()=>this.setState({accountsModalOpen:false})} title="Add account" />
                <View style={Style.card}>
                <Text style={Style.heavyTextDark}> Name for this account </Text>
                <TextInput value={this.state.accountName} onChangeText={(value)=>this.setState({accountName:value})} />
                <Text style={Style.heavyTextDark}> Private key </Text>
                <TextInput
                    multiline={true}
                    numberOfLines={4}
                    value={this.state.key}
                    onChangeText={(value)=>this.setState({key:value})} />
                </View>
                <Text style={Style.textDark}> This app is in Beta. Please make sure you keep your private key stored safely elsewhere too. </Text>
                <TouchableOpacity onPress={()=>this.addAccount()} style={Style.bottomFullButton}>
                    <Text style={Style.textLight}> Add new account </Text>
                </TouchableOpacity>
                </View>
            </Modal>
                
        </View>
    }

}