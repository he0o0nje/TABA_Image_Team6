import React, { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Text,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Provider } from "react-redux";
import store from "./Store";
import Photo from "./Photo";

const BottomBar = ({ refresh }) => {
  const [image, setImage] = useState(null);
  const [isPhotoVisible, setIsPhotoVisible] = useState(false);

  const handleSubmitGallery = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.4,
        base64: true,
      });

      if (!result.canceled) {
        // 사진이 입력되었을 경우에만 showPhotoModal() 실행
        setImage(result);
        showPhotoModal();
      }
    } catch (error) {
      Alert.alert("이미지 처리 실패!");
    }
  };

  const handleSubmitCamera = async () => {
    try {
      let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("카메라 권한을 허용해주세요.");
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.4,
        base64: true,
      });
      if (!result.canceled) {
        // 사진이 입력되었을 경우에만 showPhotoModal() 실행
        setImage(result);
        showPhotoModal();
      }
    } catch (error) {
      Alert.alert("이미지 처리 실패!");
    }
  };

  // 일정 사진을 찍은 모달창을 보여줄지 여부
  const showPhotoModal = () => {
    setIsPhotoVisible(!isPhotoVisible);
    refresh();
  };

  return (
    <View style={styles.parentContainer}>
      <View style={styles.separator} />
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.leftContainer}
          onPress={handleSubmitGallery}
        >
          <View style={styles.contentContainer}>
            <Image
              source={require("../favicon/gallery.png")}
              style={styles.icon}
            />
            <Text style={styles.text}>앨범</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rightContainer}
          onPress={handleSubmitCamera}
        >
          <View style={styles.contentContainer}>
            <Image
              source={require("../favicon/camera.png")}
              style={styles.icon}
            />
            <Text style={styles.text}>카메라</Text>
          </View>
        </TouchableOpacity>
      </View>
      <Provider store={store}>
        <Photo
          isPhotoVisible={isPhotoVisible}
          showPhotoModal={showPhotoModal}
          image={image}
          refresh={refresh}
        />
      </Provider>
    </View>
  );
};

const styles = StyleSheet.create({
  parentContainer: {
    flexDirection: "column",
    borderBottomColor: "#bbbbbb",
    borderBottomWidth: 1,
    marginTop: 40,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    height: 107,
    width: 393,
    backgroundColor: "#004898", // 하단바 배경색
    marginTop: -10,
  },
  leftContainer: {
    height: 80,
    width: 195.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 45,
  },
  rightContainer: {
    height: 80,
    width: 195.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 45,
  },
  icon: {
    width: 24, // 이미지 너비
    height: 24, // 이미지 높이
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  text: {
    marginTop: 3,
    color: "#f5f5f5", // 텍스트 색상
    fontSize: 12, // 텍스트 크기
    fontWeight: 600,
  },
  separator: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
    width: "100%",
    marginBottom: 10,
    alignSelf: "center",
  },
});

export default BottomBar;
