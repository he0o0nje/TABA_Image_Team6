import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  Image,
} from "react-native";
import { Modal } from "react-native";
import { format } from "date-fns";
import ko from "date-fns/locale/ko";
import { useSelector } from "react-redux";
import moment from "moment";

//일정 추가 모달 컴포넌트
function AddPost({
  isAddPostVisible,
  showModal,
  showAddPostModal,
  selectedDate,
}) {
  const ipAddress = useSelector((state) => state.ipAddress);
  const [postTitle, setPostTitle] = useState(""); // 일정 제목 상태 관리
  const [startDay, setStartDay] = useState(""); // 일정 시작 날짜
  const [endDay, setEndDay] = useState(""); // 일정 종료 날짜
  const id_key = useSelector((state) => state.idKey); // 로그인한 사용자의 id_key

  //일정 바 랜덤 색상
  const getRandomColor = () => {
    const colors = [
      "#E57373", // 빨강
      "#F06292", // 분홍
      "#BA68C8", // 보라
      "#9575CD", // 진보라
      "#7986CB", // 남색
      "#64B5F6", // 파랑
      "#4FC3F7", // 연한 파랑
      "#4DD0E1", // 청록
      "#4DB6AC", // 틸
      "#81C784", // 초록
      "#AED581", // 연한 초록
      "#DCE775", // 라임
      "#FFF176", // 노랑
      "#FFD54F", // 황갈색
      "#FFB74D", // 주황
      "#FF8A65", // 진한 주황
      "#A1887F", // 갈색
      "#90A4AE", // 청회색
      "#D7CCC8", // 회색
    ];

    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };
  const [color, setColor] = useState(getRandomColor()); // 일정 색상

  const handleSubmit = () => {
    // 날짜 유효성 및 시작일/종료일 비교 검사
    const isValidStartDate =
      /^\d{4}\d{2}\d{2}$/.test(startDay) ||
      /^\d{4}-\d{2}-\d{2}$/.test(startDay) ||
      moment(startDay, "YYYYMMDD", true).isValid();
    const isValidEndDate =
      /^\d{4}\d{2}\d{2}$/.test(endDay) ||
      /^\d{4}-\d{2}-\d{2}$/.test(endDay) ||
      moment(endDay, "YYYYMMDD", true).isValid();
    const startDate = isValidStartDate
      ? moment(startDay, ["YYYYMMDD", "YYYY-MM-DD"]).toDate()
      : null;
    const endDate = isValidEndDate
      ? moment(endDay, ["YYYYMMDD", "YYYY-MM-DD"]).toDate()
      : null;
    const isStartDateBeforeEndDate =
      startDate !== null &&
      endDate !== null &&
      startDate.getTime() <= endDate.getTime();

    if (!isValidStartDate || !isValidEndDate) {
      alert(
        "유효한 날짜 형식이 아닙니다. YYYYMMDD, YYYY-MM-DD 형식으로 입력해주세요."
      );
      return;
    }

    if (!isStartDateBeforeEndDate) {
      alert("시작일이 종료일보다 뒤에 있어야 합니다.");
      return;
    }

    if (postTitle.trim() === "") {
      alert("일정 제목을 입력해주세요.");
      return;
    }

    setColor(getRandomColor());
    const DateData = {
      id_key: id_key,
      title: postTitle,
      startDay: startDay,
      endDay: endDay,
      color: color,
    };

    // 서버로 전송할 데이터 객체(아이디, 제목, 날짜)
    const postData = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(DateData),
    };

    fetch(`http://${ipAddress}:8000/addpost`, postData).then((response) => {
      if (response.ok) {
        // 요청이 성공한 경우
        return response.json(); // JSON 형식으로 변환된 응답 반환
      } else {
        // 요청이 실패한 경우
        alert("일정 추가 실패!");
      }
    });

    // 전송 후 모달 창 닫음
    showAddPostModal();
    showModal();
  };

  return (
    <Modal
      animationType="none" //화면에 띄워질 때 애니메이션
      transparent={true} //모달 화면의 투명도
      visible={isAddPostVisible} //모달 화면의 show 여부
      onRequestClose={showAddPostModal} //뒤로가기 시 모달창 닫음(안드로이드 용)
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.closelocation}>
            <TouchableOpacity
              style={styles.close}
              onPress={() => {
                showModal();
                showAddPostModal();
              }}
            >
              <Image
                source={require("../favicon/X.png")}
                style={[styles.closetxt, { width: 20, height: 20 }]}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.day}>
            {format(new Date(selectedDate), "M월 d일 EEEE", { locale: ko })}
          </Text>
          <TextInput
            style={[styles.input, { marginBottom: 50 }]}
            placeholder="제목"
            placeholderTextColor="#bbbbbb"
            value={postTitle}
            onChangeText={setPostTitle}
          />
          <TextInput
            style={[styles.input, { marginBottom: 20 }]}
            placeholder="시작 ex) 20230302"
            placeholderTextColor="#bbbbbb"
            value={startDay}
            onChangeText={setStartDay}
          />
          <TextInput
            style={[styles.input, { marginBottom: 20 }]}
            placeholder="종료 ex) 20230616"
            placeholderTextColor="#bbbbbb"
            value={endDay}
            onChangeText={setEndDay}
          />
          <View style={styles.buttonlocation}>
            <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
              <Text style={styles.text}>등록</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    height: 600,
    width: 400,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: 330,
    height: 500,
    padding: 20,
    marginTop: 270,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#004898",
  },
  closelocation: {
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  close: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  closetxt: {
    width: 12,
    height: 12,
  },
  day: {
    marginLeft: 20,
    paddingBottom: 20,
    marginBottom: 20,
    fontSize: 16,
    fontWeight: 500,
  },
  input: {
    width: 200,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
    marginLeft: 15,
  },
  buttonlocation: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  addButton: {
    width: 77,
    height: 30,
    backgroundColor: "#004898",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginTop: 20,
    marginHorizontal: 10,
  },
  text: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default AddPost;
