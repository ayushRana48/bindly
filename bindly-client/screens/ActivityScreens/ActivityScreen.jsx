import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import placeholder from '../../assets/GroupIcon.png';
import backArrow from '../../assets/backArrow.png';
import settings from '../../assets/settings.png';
import InviteList from "./components/InviteList";

const ActivityScreen = () => {
  const navigation = useNavigation();



 

  return (
    <View style={styles.container}>
        <InviteList></InviteList>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  backArrow: {
    position: 'absolute',
    top: 50,
    left: 30,
    width: 50,
    height: 50,
    zIndex: 10,
  },
  setting: {
    position: 'absolute',
    top: 50,
    right: 30,
    width: 50,
    height: 50,
    zIndex: 10,
  },
  logoContainer: {
    marginTop: 36,
    marginBottom: 36,
    alignItems: 'center',
  },
  title: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: 'bold',
  },
  centeredRow: {
    alignItems: 'center',
    marginTop: 16,
  },
});

export default ActivityScreen;
