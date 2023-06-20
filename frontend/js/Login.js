import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { setIdKey } from "./Store";

const Login = ({ successLogin, signup_show }) => {
  const ipAddress = useSelector((state) => state.ipAddress);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isIdInputEmpty, setIdInputEmpty] = useState(true); // 추가된 코드
  const [isPasswordInputEmpty, setPasswordInputEmpty] = useState(true); // 추가된 코드

  const handleIdChange = (text) => {
    // 추가된 코드
    setId(text);
    setIdInputEmpty(text.length === 0);
  };

  const handlePasswordChange = (text) => {
    // 추가된 코드
    setPassword(text);
    setPasswordInputEmpty(text.length === 0);
  };

  const dispatch = useDispatch();

  const handleLogin = () => {
    const userData = {
      id: id,
      password: password,
    };

    // 서버로 전송할 데이터 객체(아이디, 비밀번호)
    const postData = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    };

    fetch(`http://${ipAddress}:8000/login`, postData)
      .then((response) => {
        if (response.ok) {
          // 요청이 성공한 경우
          return response.json(); // JSON 형식으로 변환된 응답 반환
        } else {
          // 요청이 실패한 경우
          alert("로그인이 실패!");
        }
      })
      .then((data) => {
        // 서버에서 반환한 데이터 처리
        if (data.login_result) {
          successLogin(data.login_result);
          dispatch(setIdKey(data.id_key)); //로그인 한 사용자의 id_key 값을 저장
        } else {
          alert("아이디 또는 비밀번호가 틀립니다!");
        }
      })
      .catch((error) => {
        if (error.response) {
          // 요청이 이루어졌으며 서버가 2xx의 범위를 벗어나는 상태 코드로 응답했습니다.
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // 요청이 이루어 졌으나 응답을 받지 못했습니다.
          // `error.request`는 브라우저의 XMLHttpRequest 인스턴스 또는
          // Node.js의 http.ClientRequest 인스턴스입니다.
          console.log(error.request);
        } else {
          // 오류를 발생시킨 요청을 설정하는 중에 문제가 발생했습니다.
          console.log("Error", error.message);
        }
        console.log(error.config);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AuViS</Text>
      <Text style={styles.title1}>쉬운 기록의 시작.</Text>
      <View style={styles.separator} />
      <TextInput
        style={[
          styles.input,
          { marginTop: 35 },
          isIdInputEmpty ? styles.empty : styles.filled,
        ]} // 변경된 코드
        placeholder="ID"
        onChangeText={handleIdChange}
        value={id}
      />
      <TextInput
        style={[
          styles.input,
          isPasswordInputEmpty ? styles.empty : styles.filled,
        ]} // 변경된 코드
        placeholder="PW"
        secureTextEntry
        onChangeText={handlePasswordChange}
        value={password}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={signup_show}>
          <View>
            <Text style={styles.buttonText}>회원가입</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <View>
            <Text style={styles.buttonText}>로그인</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 374,
  },
  buttonContainer: {
    flex: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
  },
  title: {
    fontSize: 40,
    fontWeight: "600",
    marginBottom: 15,
    color: "black",
    height: 50,
  },
  title1: {
    fontSize: 20,
    fontWeight: "400",
    color: "black",
    height: 45,
  },
  input: {
    width: 170, // 수정된 스타일
    height: 30,
    color: "#bbbbbb",
    borderWidth: 1,
    borderColor: "#004898",
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 10,
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
  empty: {
    color: "#bbbbbb",
  },
  filled: {
    color: "black",
  },
  separator: {
    borderBottomColor: "#bbbbbb",
    borderBottomWidth: 1,
    width: "80%",
    marginBottom: 10,
    alignSelf: "center",
  },
});

export default Login;
