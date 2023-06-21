import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
} from "react-native";
import { Modal } from "react-native";
import { useSelector } from "react-redux";
import moment from "moment";

//사진 처리 모달 컴포넌트
function Photo({ isPhotoVisible, showPhotoModal, image, refresh }) {
  const ipAddress = useSelector((state) => state.ipAddress);
  const id_key = useSelector((state) => state.idKey); // 로그인한 사용자의 id_key
  const [saveImage, setSaveImage] = useState(image);
  const [title, setTitle] = useState("");
  const [startDay, setStartDay] = useState("");
  const [endDay, setEndDay] = useState("");

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

  //사진을 서버로 보내고 제목과 일정을 받아옴
  useEffect(() => {
    if (isPhotoVisible) {
      const selectedAsset = image && image.assets && image.assets[0]; // 선택한 에셋

      if (selectedAsset) {
        const base64Data = selectedAsset.base64; // 선택한 에셋의 base64 데이터

        if (base64Data) {
          const userData = {
            id_key: id_key,
            image: `data:image/jpeg;base64,${base64Data}`,
          };

          const postData = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          };

          fetch(`http://${ipAddress}:8000/photo`, postData)
            .then((response) => {
              if (response.ok) {
                return response.json();
              } else {
                throw new Error("이미지 처리 실패!");
              }
            })
            .then((data) => {
              // Base64 string을 blob으로 변환
              fetch(`data:image/jpeg;base64,${data.image}`)
                .then((res) => res.blob())
                .then((blob) => {
                  setSaveImage(URL.createObjectURL(blob));
                });

              setTitle(data.title);
              setStartDay(data.startDay);
              setEndDay(data.endDay);
            })
            .catch((error) => {
              console.error("이미지 처리 오류!", error);
            });
        }
      }
    }
  }, [isPhotoVisible]);

  // 일정 데이터 저장
  const handleSubmit = () => {
    setColor(getRandomColor);
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

    if (title.trim() === "") {
      alert("일정 제목을 입력해주세요.");
      return;
    }

    if (saveImage) {
      fetch(saveImage)
        .then((response) => response.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = reader.result;
            const userData = {
              id_key: id_key,
              image: base64Data,
              title: title,
              startDay: startDay,
              endDay: endDay,
              color: color,
            };

            const postData = {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(userData),
            };

            fetch(`http://${ipAddress}:8000/addphotopost`, postData) // 서버의 API 엔드포인트를 적절히 수정하세요
              .then((response) => {
                if (response.ok) {
                  refresh();
                  return response.json();
                } else {
                  throw new Error("이미지 저장 실패!");
                }
              });
          };

          reader.readAsDataURL(blob);
        })
        .catch((error) => {
          alert("이미지 데이터 가져오기 오류:", error);
        });
    }

    showPhotoModal(); // 이미지 저장 후 모달 닫기
  };

  return (
    <Modal
      animationType="none" //화면에 띄워질 때 애니메이션
      transparent={true} //모달 화면의 투명도
      visible={isPhotoVisible} //모달 화면의 show 여부
      onRequestClose={showPhotoModal} //뒤로가기 시 모달창 닫음(안드로이드 용)
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.closelocation}>
            <TouchableOpacity
              style={styles.close}
              onPress={() => {
                showPhotoModal();
              }}
            >
              <Image
                source={require("../favicon/X.png")}
                style={[styles.closetxt, { width: 20, height: 20 }]}
              />
            </TouchableOpacity>
          </View>
          <View>
            {saveImage && (
              <Image
                source={{ uri: saveImage }}
                style={[styles.image, { alignSelf: "center" }]}
              />
            )}
          </View>
          <TextInput
            style={[styles.input, { marginTop: 15, marginBottom: 3 }]}
            placeholder="일정 제목"
            placeholderTextColor="#bbbbbb"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, { marginBottom: -3 }]}
            placeholder="일정 시작날짜"
            placeholderTextColor="#bbbbbb"
            value={startDay}
            onChangeText={setStartDay}
          />
          <TextInput
            style={[styles.input, { marginBottom: 0 }]}
            placeholder="일정 종료날짜"
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20, // 이미지의 상단 여백을 조정할 수 있습니다.
  },
  image: {
    width: 250,
    height: 300,
  },
});

export default Photo;
