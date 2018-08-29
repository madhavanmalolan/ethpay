import './global';
import React from 'react';
import {infura,Theme,getJsonFromUrl, DB} from './Utils';
import { StyleSheet, Text, View, Modal, Alert, FlatList, TouchableOpacity,Linking, Dimensions } from 'react-native';
const Web3 = require('web3');
import Icon from 'react-native-vector-icons/Ionicons';
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(infura));
const { height,width } = Dimensions.get('window');
import Style from './Style';

import Accounts from './Accounts';
import Send from './Send';
import Receive from './Receive';
import Expo, { SQLite } from 'expo';
import Axios from 'axios';
const db = SQLite.openDatabase(DB);
const dummy = {
    to : '0x2db6ff6eb673138e2dcc96ea7b9037552f788af4',
    gas : 210000,
    value : 200,
};


export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state ={
      transactions : [],
      action : null,
      accountsModalOpen:false,
      refreshing : false,
      sendModalOpen:false,
      receiveModalOpen:false
      //currentGasPrice : web3.utils.toBN('0')
    }
  }




  componentDidMount() {
    Linking.addEventListener('url', (url)=>this.handleUrl(url));
    Linking.getInitialURL().then((url)=>this.handleUrl(url));

    db.transaction(tx => {
      tx.executeSql(
        'create table if not exists txns (id integer primary key not null, json text, status text, action text, actionMeta text, timestamp text);'
      );
    });
    this.loadTransactions(true);
    var self = this;
    web3.eth.getGasPrice().then(function(gasPrice){
      var g = new web3.utils.BN(gasPrice);
      self.setState({currentGasPrice : g});
    });
  }



  addTransaction(obj,status, action, meta){
    console.log(obj+status+action+meta);
    var self = this;
    console.log()
    db.transaction(tx=>{
        tx.executeSql(`insert into txns (json,status,action,actionMeta, timestamp) values(?,?,?,?,?)`,[obj, status, action, meta, (new Date()).toDateString()],(_)=>{
            self.loadTransactions();
        },(e)=>console.log(e),(b)=>console.log(b));
    });

}

handleUrl(url){
  console.log("URL");
  console.log(url);
  var params = {};
  if(typeof(url) == 'string')
    params = getJsonFromUrl(url)
  else if(typeof(url)=='object' && typeof(url.url)!='undefined'){
    params = getJsonFromUrl(url.url);
  }
  var txnParams = {};
  if(params.to)
    txnParams.to = params.to;
  if(params.value)
    txnParams.value = params.value;
  if(params.gas)
    txnParams.gas = params.gas;
  if(params.gasPrice)
    txnParams.gasPrice = params.gasPrice;
  if(params.data)
    txnParams.data = params.data;
  
  var meta = params.redirectUri;
  var action = params.action;
  if(Object.keys(txnParams).length > 0)
    this.addTransaction(JSON.stringify(txnParams),'unread',action,meta);
}



  loadTransactions(updatePending){
      this.setState({refreshing:true});
      var self = this;
      db.transaction(tx=>{
          tx.executeSql(`select * from txns`,[],(_, { rows: { _array } })=>{
              this.setState({transactions:_array, refreshing:false});
          })
      });
      if(updatePending == true){
      db.transaction(async (tx)=>{
        tx.executeSql(`select * from txns where status='pending'`,[],async (_, { rows: { _array } })=>{
          for(var i = 0 ; i < _array.length; i++){
            var row = _array[i];
            console.log(row.actionMeta);
            try{
            var transaction = await web3.eth.getTransaction(row.actionMeta);
            if(transaction.blockNumber){
              console.log("BLOCK"+row.actionMeta);
              db.transaction(
                tx2 => {
                  tx2.executeSql(`update txns set status = 'confirmed' where id = ?;`, [row.id]);
                },
                null,
                ()=>{
                  self.loadTransactions(false);
                });
        
            }
            }
            catch(e){
              console.log(e);
              continue;
            }
          }
        })
      
    });
  }
        
  }

  accountSelected(name, key){
    console.log(this.state.action);
    if(this.state.action != 'sign' && this.state.action != 'sendSignedTransaction' && this.state.action != 'signTransaction')
      return;
    var self = this;
      db.transaction(
        tx => {
          tx.executeSql(`update txns set status = 'waiting' where id = ?;`, [this.state.txn.id]);
        },
        null,
        ()=>{
          var value = new web3.utils.BN(this.state.signable.value?this.state.signable.value:0);
          if(this.state.signable.gasPrice && this.state.signable.gas){
            this.confirmTransaction(name,(new web3.utils.BN(this.state.signable.gasPrice)).mul(new web3.utils.BN(this.state.signable.gas)).add(value),this.state.txn,key);
          }
          if(this.state.signable.gas && !this.state.signable.gasPrice){
            var self = this;
            web3.eth.getGasPrice().then(function(gasPrice){
              var g = web3.utils.BN((new web3.utils.BN(gasPrice)).mul(new web3.utils.BN(self.state.signable.gas)).add(value));
              console.log(g);
              self.confirmTransaction(name, g,self.state.txn,key);
            });

          }
          else{
            this.confirmTransaction(name, value,this.state.txn,key);
          }
            this.setState({
            accountsModalOpen:false,
          })
        }
      );
  }


  confirmTransaction(name, amount, data,key){
    var transaction = this.state.txn;
    var self = this;
    Alert.alert("Confirm transaction","Are you sure you want to confirm the transaction for ETH "+web3.utils.fromWei(amount , 'ether') +" from account '"+name+"'",
  [
    {text:"Yes", onPress:()=>{
      if(data.action == 'sign'){
        var sign = web3.eth.accounts.sign(JSON.parse(data.json).data,key);
        Linking.openURL(data.actionMeta+"?signature="+sign.signature);
        db.transaction(
          tx => {
            tx.executeSql(`update txns set status = 'done', actionMeta = ? where id = ?;`, [sign.signature,transaction.id]);
          },
          null,
          ()=>self.loadTransactions()
        );

      }
      else if(data.action == 'signTransaction'){
        var json = JSON.parse(data.json);
        web3.eth.accounts.signTransaction(json, key).then(function(signed){
          Linking.openURL(data.actionMeta+"?signature="+signed);
          db.transaction(
            tx => {
              tx.executeSql(`update txns set status = 'done' and actionMeta = ? where id = ?;`, [ethTxn.transactionHash,transaction.id]);
            },
            null,
            ()=>self.loadTransactions()
          );  
        }).catch((e)=>{
          Alert.alert("Something went wrong", e.message);
        });
      }
      else if(data.action == 'sendSignedTransaction'){
        var json = JSON.parse(data.json);
        web3.eth.accounts.signTransaction(json, key).then(function(signed){
          console.log(signed);
          web3.eth.sendSignedTransaction(signed.rawTransaction, function(err,transactionHash){
            db.transaction(
              tx => {
                tx.executeSql(`update txns set status = 'pending', actionMeta = ?  where id = ?;`, [transactionHash,transaction.id]);
              },          
              null,
              ()=>self.loadTransactions()
    
            )      
          }).then((ethTxn)=>{
            db.transaction(
              tx => {
                tx.executeSql(`update txns set status = 'confirmed', actionMeta = ? where id = ?;`, [ethTxn.transactionHash,transaction.id]);
              },
              null,
              ()=>self.loadTransactions()
            );

          }).catch(console.log);
        }).catch((e)=>{
          Alert.alert("Something went wrong", e.message);
        });
      }
    }
    },
    {text: "No",onPress: ()=>{

    }}
  ]);
  }

  onTransactionSelected(item){
    if(item.item.status == "waiting" || item.item.status=='unread'){
      this.setState({
        accountsModalOpen:true,
        txn : item.item,
        signable : JSON.parse(item.item.json),
        action : item.item.action
      });
    }
    else if(item.item.status == 'confirmed' || item.item.status == 'pending'){
      Linking.openURL('https://etherscan.io/tx/'+item.item.actionMeta);
    }
  }

  getTransactionView(item){
    var status = {};
    var json = JSON.parse(item.item.json);
    if(item.item.status == 'unread'){
      status = {text:'Action required', color:"#7a0746"};
    }
    else if(item.item.status == 'waiting'){
      status = {text:'Action required', color:"#7a0746"};
    }
    else if(item.item.status == 'done' || item.item.status == 'confirmed'){
      status = {text:'Action completed', color:"#077a3b"};
    }
    else if(item.item.status == 'pending'){
      status = {text:'Awaiting confirmation', color:"#07467a"};
    }
    return <TouchableOpacity onPress={()=>this.onTransactionSelected(item)} style={Style.card} >
        <Text style={{color:"#b7b7b7"}}>{item.item.timestamp}</Text>
        {json.to?<Text style={Style.heavyTextDark}>To : {json.to}</Text>:null}
        {json.data?<Text style={Style.heavyTextDark}>Data : {json.data}</Text>:null}
        {json.value?<Text style={Style.heavyTextDark}>Value : {json.value}</Text>:null}
        {json.gas?<Text style={Style.heavyTextDark}>Gas : {json.gas}</Text>:null}
        {json.gasPrice?<Text style={Style.heavyTextDark}>Gas : {json.gasPrice}</Text>:null}
        <Text style={Style.textDark}> {item.item.actionMeta}</Text>
        <Text style={{color:status.color}}>{status.text}</Text>
      </TouchableOpacity>
  }


  render() {
    return <View style={Style.base}>
            <View style={{height : 30 + 64, width : width, backgroundColor : Theme.accent}}>
                <View style={{height : 64, marginTop : 30, flexDirection:'row', width:width}}>
                    <Text style={{marginLeft:32, color : Theme.accentText, fontSize : 20, lineHeight : 64, height : 64, width:width-64-32}}>Universal ETH Wallet </Text>
                    <TouchableOpacity onPress={()=>this.setState({accountsModalOpen:true, action:null})} style={{height:64,width:64, justifyContent:'center', alignItems:'center'}}>
                        <Icon name="md-person" style={{color:Theme.accentText}} size={32} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{flexDirection:'row'}}>
            <TouchableOpacity onPress={()=>this.setState({sendModalOpen : true})} style={Style.halfButton}>
                <Text style={Style.textLight}> Send ETH </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>this.setState({receiveModalOpen : true})} style={Style.halfButton}>
                <Text style={Style.textLight}> Recieve ETH </Text>
            </TouchableOpacity>


            </View>
            <FlatList
              refreshing={this.state.refreshing}
              onRefresh={()=>this.loadTransactions(true)}
              data={this.state.transactions.reverse()}
              renderItem={(item)=>this.getTransactionView(item)}
              keyExtractor={(item, index)=>index.toString()}
              />
            <Modal
                animationType="slide"
                transparent={false}
                onRequestClose={()=>this.setState({accountsModalOpen:false})}
                visible={this.state.accountsModalOpen} >
                <Accounts onSelect={(name,key)=>this.accountSelected(name,key)} onClose={()=>this.setState({accountsModalOpen:false})} />
            </Modal>
            <Modal
                animationType="slide"
                transparent={false}
                onRequestClose={()=>this.setState({sendModalOpen:false})}
                visible={this.state.sendModalOpen} >
                <Send onClose={()=>this.setState({sendModalOpen:false})} />
            </Modal>

            <Modal
                animationType="slide"
                transparent={false}
                onRequestClose={()=>this.setState({receiveModalOpen:false})}
                visible={this.state.receiveModalOpen} >
                <Receive onClose={()=>this.setState({receiveModalOpen:false})} />
            </Modal>



      </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
