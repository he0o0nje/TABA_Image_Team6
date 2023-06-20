import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Provider } from "react-redux";
import store from "./Store";
import Profile from "./Profile";

const TopBar = ({ month, year }) => {
  // 프로필 모달 표시 여부
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  // 프로필 클릭 이벤트 처리 함수
  const handleProfile = () => {
    setIsProfileVisible(!isProfileVisible);
  };

  return (
    <View style={styles.parentContainer}>
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          <TouchableOpacity onPress={handleProfile}>
            <Image
              source={require("../favicon/profile.png")}
              style={styles.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.selectmonth}>
            <Text style={styles.label}>
              {year}년 {month}월
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer} />
        <View style={styles.rightContainer}>
          <TouchableOpacity style={styles.selectmonth}>
            <Image
              source={require("../favicon/search.png")}
              style={styles.icon1}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.selectmonth}>
            <Image
              source={require("../favicon/alert.png")}
              style={styles.icon1}
            />
          </TouchableOpacity>
        </View>
        {isProfileVisible && (
          <Provider store={store}>
            <Profile
              isProfileVisible={isProfileVisible}
              handleProfile={handleProfile}
            />
          </Provider>
        )}
      </View>
      <View style={styles.separator} />
    </View>
  );
};

const styles = StyleSheet.create({
  parentContainer: {
    flexDirection: "column",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 115,
    width: 393,
    backgroundColor: "#F5F5F5",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
    marginLeft: 10,
  },
  selectmonth: {
    marginLeft: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    marginLeft: -3,
    marginTop: 3,
    fontSize: 19,
    fontWeight: 500,
  },
  centerContainer: {
    flex: 1,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
    marginRight: 10,
  },
  icon: {
    width: 32,
    height: 32,
  },
  icon1: {
    width: 26,
    height: 26,
  },
  text: {
    marginLeft: 8,
  },
  separator: {
    borderBottomColor: "#bbbbbb",
    borderBottomWidth: 1,
    width: "100%",
    marginBottom: 10,
    alignSelf: "center",
  },
});

export default TopBar;
