import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import backArrow from '../../assets/backArrow.png';
import RuleItem from './components/RuleItem';

const RulesScreen = () => {

    const navigation = useNavigation();


    const back = () => {
        navigation.goBack();
    };

    const rules = [
        {
            header: 'Groups',
            body: 'Groups are formed for a joint task. For example, in an exercise group, members post pictures of themselves exercising a specified number of times per week, set in the settings to prevent burnout.'
        },
        {
            header: 'Buy-In',
            body: 'Members contribute a buy-in to join. Refunds are allowed before the group starts. Once started, the money is locked. Consistently posting pictures of task completion helps members move up the leaderboard and earn money.'
        },
        {
            header: 'Posts',
            body: 'Each 24-hour cycle, starting from the group\'s start time, members can post pictures and videos related to the task. Others can veto posts that do not represent the task. Members can edit their posts.'
        },
        {
            header: 'Leaderboard',
            body: 'The leaderboard tracks weekly posts, crediting up to the set number of tasks. Consistency is valued over exceeding the limit. The top half of the leaderboard earns from the bottom half, with varying earnings based on rank.'
        },
        {
            header: 'Veto',
            body: 'Posts can be vetoed if deemed unrelated to the task. Vetos are processed at the end of the next 24-hour cycle. Majority vetoes result in post removal and loss of credit.'
        },
        {
            header: 'End Game',
            body: 'Final posts are allowed until the end date and time. A 24-hour veto period follows. Then, the group is processed: vetos are finalized, the leaderboard is determined, and money is distributed based on leaderboard positions.'
        },
       
    ];
    
    

    return (
        <View style={styles.container}>
            <Pressable style={styles.backArrow} onPress={back}>
                <Image style={styles.backArrowImage} source={backArrow} />
            </Pressable>
            <Text style={styles.title}>Rules</Text>

            <ScrollView style={{marginTop:40}}>
                {
                    rules.map(r=><RuleItem header={r.header} body={r.body}></RuleItem>)
                }

            </ScrollView>
            
           
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    backArrow: {
        position: 'absolute',
        top: 40,
        left: 30,
        zIndex:10,
    },
    backArrowImage: {
        height: 40,
        width: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop:60,
        marginBottom:10
    },
    balance:{
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});

export default RulesScreen;
