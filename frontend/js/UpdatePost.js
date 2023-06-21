import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  Image,
} from "react-native";
import { Modal } from "react-native";
import moment from "moment";
import { useSelector } from "react-redux";

//일정 추가 모달 컴포넌트
function UpdatePost({
  isUpdatePostVisible,
  showModal,
  showUpdatePostModal,
  selectedScheduleId,
  onDeleted,
}) {
  const ipAddress = useSelector((state) => state.ipAddress);
  const [postTitle, setPostTitle] = useState(""); // 일정 제목 상태 관리
  const [startDay, setStartDay] = useState(""); // 일정 시작 날짜
  const [endDay, setEndDay] = useState(""); // 일정 종료 날짜
  const [image, setImage] = useState(""); // 포스터 이미지

  useEffect(() => {
    if (selectedScheduleId !== 0) {
      // 만약 selectedScheduleId가 0이 아니라면
      const DateData = {
        title_key: selectedScheduleId,
      };

      // 서버로 전송할 데이터 객체(아이디, 제목, 날짜)
      const postData = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(DateData),
      };

      fetch(`http://${ipAddress}:8000/updatepost`, postData)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            alert("선택 일정 불러오기 실패!");
          }
        })
        .then((data) => {
          setPostTitle(data.title);
          setStartDay(data.start_date.split("T")[0]);
          setEndDay(data.end_date.split("T")[0]);
          // 이미지 데이터가 존재하는지 확인
          if (data.image) {
            setImage(`data:image/png;base64,${data.image}`); // 이미지 디코딩
          } else {
            setImage(null);
          }
        })
        .catch((error) => {
          console.error("선택 일정 불러오기 오류!", error);
        });
    }
  }, [showUpdatePostModal]);

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

    const DateData = {
      title_key: selectedScheduleId,
      title: postTitle,
      startDay: startDay,
      endDay: endDay,
    };

    // 서버로 전송할 데이터 객체(아이디, 제목, 날짜)
    const postData = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(DateData),
    };

    fetch(`http://${ipAddress}:8000/updateresult`, postData).then(
      (response) => {
        if (response.ok) {
          // 요청이 성공한 경우
          return response.json(); // JSON 형식으로 변환된 응답 반환
        } else {
          // 요청이 실패한 경우
          alert("일정 수정 실패!");
        }
      }
    );

    // 전송 후 모달 창 닫음
    showUpdatePostModal();
    showModal();
  };

  const handleDeleteSubmit = () => {
    const DateData = {
      title_key: selectedScheduleId,
    };

    // 서버로 전송할 데이터 객체(아이디, 제목, 날짜)
    const postData = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(DateData),
    };

    fetch(`http://${ipAddress}:8000/deletepost`, postData).then((response) => {
      if (response.ok) {
        // 요청이 성공한 경우
        return response.json(); // JSON 형식으로 변환된 응답 반환
      } else {
        // 요청이 실패한 경우
        alert("일정 삭제 실패!");
      }
    });

    onDeleted();
    // 전송 후 모달 창 닫음
    showUpdatePostModal();
    showModal();
  };

  return (
    <Modal
      animationType="none" //화면에 띄워질 때 애니메이션
      transparent={true} //모달 화면의 투명도
      visible={isUpdatePostVisible} //모달 화면의 show 여부
      onRequestClose={showUpdatePostModal} //뒤로가기 시 모달창 닫음(안드로이드 용)
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.closelocation}>
            <TouchableOpacity
              style={styles.close}
              onPress={() => {
                showModal();
                showUpdatePostModal();
              }}
            >
              <Image
                source={require("../favicon/X.png")}
                style={[styles.closetxt, { width: 20, height: 20 }]}
              />
            </TouchableOpacity>
          </View>
          {image ? (
            <Image
              source={{ uri: image }}
              style={[styles.image, { alignSelf: "center" }]}
            />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.imgempty}>이미지가 없는 일정입니다.</Text>
            </View>
          )}
          <TextInput
            style={[styles.input, { marginTop: 15, marginBottom: 3 }]}
            value={postTitle}
            onChangeText={setPostTitle}
          />
          <TextInput
            style={[styles.input, { marginBottom: -3 }]}
            value={startDay}
            onChangeText={setStartDay}
          />
          <TextInput
            style={[styles.input, { marginBottom: 0 }]}
            value={endDay}
            onChangeText={setEndDay}
          />
          <View style={styles.buttonlocation}>
            <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
              <Text style={styles.text}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleDeleteSubmit}
            >
              <Text style={styles.text}>삭제</Text>
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
    height: 580,
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
  input: {
    width: 230,
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 15,
    padding: 7,
  },
  buttonlocation: {
    flex: 1,
    flexDirection: "row",
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
  image: {
    width: 250,
    height: 300,
  },
  empty: {
    height: 300,
    justifyContent: "center",
  },
  imgempty: {
    color: "grey",
    textAlign: "center",
  },
});

export default UpdatePost;
