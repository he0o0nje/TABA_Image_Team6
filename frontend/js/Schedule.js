import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { Modal } from "react-native";
import { format } from "date-fns";
import ko from "date-fns/locale/ko";
import { Provider } from "react-redux";
import store from "./Store";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/FontAwesome";
import AddPost from "./AddPost";
import UpdatePost from "./UpdatePost";

//일정 클릭 시 일정을 보여주는 모달 컴포넌트
function Schedule({ isVisible, showModal, selectedDate }) {
  const ipAddress = useSelector((state) => state.ipAddress);
  const [isAddPostVisible, setIsAddPostVisible] = useState(false); //날짜 클릭시 일정 모달 창 보여주기
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState(0);
  const [isUpdatePostVisible, setIsUpdatePostVisible] = useState(false); //일정 클릭시 일정 수정 모달 창 보여주기
  const id_key = useSelector((state) => state.idKey); // 로그인한 사용자의 id_key

  //해당 모달창을 보여줄지 여부
  const showAddPostModal = () => {
    setIsAddPostVisible(!isAddPostVisible);
  };

  //일정 클릭시 화면에 보여질 모달창의 show 여부
  const showUpdatePostModal = () => {
    setIsUpdatePostVisible(!isUpdatePostVisible);
  };

  //일정 클릭시 화면에 보여질 모달창의 show 여부
  const handleTitleClick = (schedule_id) => {
    setSelectedScheduleId(schedule_id);
    showUpdatePostModal();
  };

  const handleDeleted = () => {
    setSelectedScheduleId(0);
  };

  useEffect(() => {
    if (isVisible) {
      const scheduleData = {
        id_key: id_key,
        selectedDate: selectedDate,
      };

      // 서버로 전송할 데이터 객체(아이디 Key, 날짜)
      const postData = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData),
      };

      fetch(`http://${ipAddress}:8000/schedule`, postData)
        .then((response) => {
          if (response.ok) {
            // 요청이 성공한 경우
            return response.json(); // JSON 형식으로 변환된 응답 반환
          } else {
            // 요청이 실패한 경우
            alert("일정 불러오기 실패했습니다.");
          }
        })
        .then((data) => {
          // 서버에서 반환한 데이터 처리
          const scheduleData = data.schedule.map((schedule) => ({
            title: schedule.title,
            id: schedule.schedule_id,
            color: schedule.color,
          }));
          setScheduleData(scheduleData);
        });
    }
  }, [isVisible]);

  return (
    <Modal
      animationType="slide" //화면에 띄워질 때 애니메이션
      transparent={true} //모달 화면의 투명도
      visible={isVisible} //모달 화면의 show 여부
      onRequestClose={showModal} //뒤로가기 시 모달창 닫음(안드로이드 용)
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.closelocation}>
            <TouchableOpacity style={styles.close} onPress={showModal}>
              <Image
                source={require("../favicon/X.png")}
                style={[styles.closetxt, { width: 20, height: 20 }]}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.day}>
            {format(new Date(selectedDate), "M월 d일 EEEE", { locale: ko })}
          </Text>
          <View style={{ height: 310 }}>
            {scheduleData.length === 0 ? (
              <Text style={styles.daysch}>일정이 없습니다.</Text>
            ) : (
              <ScrollView>
                {scheduleData.map((scheduleItem, index) => (
                  <TouchableOpacity
                    style={styles.schedule}
                    key={index}
                    onPress={() => handleTitleClick(scheduleItem.id)}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Icon
                        name="circle"
                        size={25}
                        color={scheduleItem.color}
                        style={{ marginRight: 10 }}
                      />
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: 500,
                          width: 210,
                        }}
                      >
                        {scheduleItem.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
          <View style={styles.buttonlocation}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={showAddPostModal}
            >
              <Text style={styles.text}>추가</Text>
            </TouchableOpacity>
          </View>
          <Provider store={store}>
            <AddPost
              isAddPostVisible={isAddPostVisible}
              showModal={showModal}
              showAddPostModal={showAddPostModal}
              selectedDate={selectedDate}
            />
          </Provider>
          <UpdatePost
            isUpdatePostVisible={isUpdatePostVisible}
            showModal={showModal}
            showUpdatePostModal={showUpdatePostModal}
            selectedScheduleId={selectedScheduleId}
            onDeleted={handleDeleted}
          />
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
    fontSize: 16,
    fontWeight: 500,
  },
  daysch: {
    margin: 20,
    fontSize: 15,
    fontWeight: 500,
    color: "#bbbbbb",
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
  schedule: {
    margin: 15,
  },
});

export default Schedule;
