import React from 'react';
import { View, StyleSheet,Text } from 'react-native';


const RuleItem = ({header,body}) => {
  
    return (
        <View style={{width:'full',borderColor:'lightgray',borderWidth:0.5,marginBottom:20,padding:10,borderRadius:10}}>
           <Text style={{fontWeight:700,fontSize:18, marginBottom:5}}>{header}</Text>
           <Text style={{fontSize:14}}>{body}</Text>
        </View>
    );
};

export default RuleItem;
