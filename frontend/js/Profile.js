import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { Modal } from "react-native";

const Profile = ({ isProfileVisible, handleProfile }) => {
  const ipAddress = useSelector((state) => state.ipAddress);
  const id_key = useSelector((state) => state.idKey); // 로그인한 사용자의 id_key
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchData = () => {
      const userData = {
        id_key: id_key,
      };

      const postData = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      };

      fetch(`http://${ipAddress}:8000/profile`, postData)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            alert("사용자 정보 불러오기 실패!");
          }
        })
        .then((data) => {
          setUserId(data.user_id);
          setUserName(data.user_name);
          setBirthDate(data.date_of_birth.substring(0, 10));
          setEmail(data.email);
        })
        .catch((error) => {
          console.error("Error fetching schedule data:", error);
        });
    };

    fetchData();
  }, []);

  return (
    <Modal
      animationType="none" // 화면에 띄워질 때 애니메이션
      transparent={false} // 모달 화면의 투명도
      visible={isProfileVisible} // 모달 화면의 show 여부
      onRequestClose={handleProfile} // 뒤로가기 시 모달창 닫음(안드로이드 용)
    >
      <View style={styles.container}>
        <Text style={styles.title}>My Page</Text>
        <View style={styles.separator} />
        <View style={styles.infoContainer}>
          <Text style={styles.label}>ID:</Text>
          <Text style={styles.value}>{userId}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{userName}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Birthday:</Text>
          <Text style={styles.value}>{birthDate}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{email}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleProfile} // 취소 버튼 눌렀을 때 모달창 닫음
          >
            <Text style={styles.buttonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: "600",
    marginBottom: 80,
    color: "black",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginLeft: 50,
  },
  label: {
    fontWeight: "bold",
    marginRight: 10,
  },
  value: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 50,
  },
  button: {
    width: 77,
    height: 30,
    backgroundColor: "#004898",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginTop: 20,
    marginHorizontal: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  separator: {
    borderBottomColor: "#bbbbbb",
    borderBottomWidth: 1,
    width: "80%",
    marginBottom: 10,
    alignSelf: "center",
  },
});

export default Profile;
