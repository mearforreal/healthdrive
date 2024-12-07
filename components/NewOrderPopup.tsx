import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";

const NewOrderPopup = ({ newOrder, onDecline, onAccept }: any) => {
  console.log(newOrder);
  return (
    <View style={styles.root}>
      <Pressable onPress={onDecline} style={styles.declineBtn}>
        <Text style={styles.declineText}>Decline</Text>
      </Pressable>
      <Pressable onPress={onAccept} style={styles.popupContainer}>
        <View style={styles.row}>
          <Text style={styles.uberType}>Name:{newOrder.user.name}</Text>
          <Text style={styles.uberType}>Calories: {newOrder.calories}</Text>
        </View>
        <Text style={styles.uberType}>Date: {newOrder.createdAt}</Text>
      </Pressable>
    </View>
  );
};

export default NewOrderPopup;

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    width: "100%",
    bottom: 0,
    height: "100%",
    padding: 10,
    paddingBottom: 20,
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  popupContainer: {
    backgroundColor: "black",

    borderRadius: 10,
    height: 250,
    alignItems: "center",
    justifyContent: "space-around",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  minutes: {
    color: "lightgrey",
    fontSize: 36,
  },
  distance: {
    color: "lightgrey",
    fontSize: 25,
  },
  uberType: {
    color: "lightgrey",
    fontSize: 20,
    marginHorizontal: 10,
  },
  userBackground: {
    backgroundColor: "#008bff",
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60,
  },
  declineBtn: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 50,
    width: 100,
    alignItems: "center",
  },
  declineText: {
    color: "white",
    fontWeight: "bold",
  },
});
