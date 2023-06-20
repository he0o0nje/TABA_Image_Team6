import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import "../locales/ko";
import { Calendar } from "react-native-calendars";
import { format, setYear } from "date-fns";
import Schedule from "./Schedule";
import BottomBar from "./BottomBar";
import { useSelector } from "react-redux";
import { Provider } from "react-redux";
import store from "./Store";
import TopBar from "./TopBar";

function Main() {
  const [month, setMonth] = useState(new Date().getMonth() + 1); //해당 달력의 년도
  const [year, setYear] = useState(new Date().getFullYear()); //해당 달력의 월

  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );

  const [isVisible, setIsVisible] = useState(false); //날짜 클릭시 일정 모달 창 보여주기
  const showModal = () => {
    setIsVisible(!isVisible);
  };

  const id_key = useSelector((state) => state.idKey); // 로그인한 사용자의 id_key
  const ipAddress = useSelector((state) => state.ipAddress); // 서버 ip 값

  const [scheduleTitle, setScheduleTitle] = useState([]); //사용자의 일정 제목
  const [scheduleStartData, setScheduleStartData] = useState([]); //사용자의 일정 시작 날짜
  const [scheduleEndData, setScheduleEndData] = useState([]); //사용자의 일정 종료 날짜
  const [scheduleColor, setScheduleColor] = useState([]); //사용자의 일정 색상

  // 이미지 처리 후 일정 변동이 생기면 재랜더링
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

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

      fetch(`http://${ipAddress}:8000/calendar`, postData)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            alert("일정 불러오기 실패!");
          }
        })
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setScheduleTitle(data.map((item) => item.title));
            setScheduleStartData(
              data.map((item) => item.start_date.split("T")[0])
            );
            setScheduleEndData(data.map((item) => item.end_date.split("T")[0]));
            setScheduleColor(data.map((item) => item.color));
          } else {
            setScheduleTitle([]);
            setScheduleStartData([]);
            setScheduleEndData([]);
            setScheduleColor([]);
          }
        })
        .catch((error) => {
          console.error("일정 불러오기 오류!", error);
        });
    };
    fetchData();
  }, [id_key, isVisible, refreshKey]);

  // const today = format(new Date(), "yyyy-MM-dd"); //오늘 날짜 색칠

  const markedDates =
    // Object.assign({}, //오늘 날짜 색칠
    scheduleStartData.reduce((acc, current, index) => {
      const startDate = current;
      const endDate = scheduleEndData[index];
      const color = scheduleColor[index]; // 수정된 부분

      const startPeriod = {
        startingDay: true,
        endingDay: false,
        color: color,
        textColor: "white",
      };

      const period = {
        startingDay: false,
        endingDay: false,
        color: color,
        textColor: "white",
      };

      const endPeriod = {
        startingDay: false,
        endingDay: true,
        color: color,
        textColor: "white",
      };

      const startDayObj = acc[startDate] || {}; // 시작 날짜 객체 가져오기
      const startPeriods = startDayObj.periods || []; // periods 배열 가져오기

      if (startDate === endDate) {
        // 시작 날짜와 종료 날짜가 같은 경우
        startPeriods.push({ ...startPeriod, endingDay: true }); // periods에 시작/종료 날짜 상태 추가
        startDayObj.periods = startPeriods; // 시작 날짜 객체에 periods 배열 설정
        acc[startDate] = startDayObj; // 수정된 시작 날짜 객체를 markedDates 객체에 할당
      } else {
        let currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + 1);

        while (currentDate < new Date(endDate)) {
          const formattedDate = format(currentDate, "yyyy-MM-dd");
          const dayObj = acc[formattedDate] || {}; // 날짜 객체 가져오기
          const periods = dayObj.periods || []; // periods 배열 가져오기
          periods.push({ ...period, color: color }); // periods에 상태 추가
          dayObj.periods = periods; // 날짜 객체에 periods 배열 설정
          acc[formattedDate] = dayObj; // 수정된 날짜 객체를 markedDates 객체에 할당
          currentDate.setDate(currentDate.getDate() + 1);
        }

        const endDayObj = acc[endDate] || {}; // 종료 날짜 객체 가져오기
        const endPeriods = endDayObj.periods || []; // periods 배열 가져오기
        endPeriods.push(endPeriod); // periods에 종료 날짜 상태 추가
        endDayObj.periods = endPeriods; // 종료 날짜 객체에 periods 배열 설정
        acc[endDate] = endDayObj; // 수정된 종료 날짜 객체를 markedDates 객체에 할당

        startPeriods.push(startPeriod); // periods에 시작 날짜 상태 추가
        startDayObj.periods = startPeriods; // 시작 날짜 객체에 periods 배열 설정
        acc[startDate] = startDayObj; // 수정된 시작 날짜 객체를 markedDates 객체에 할당
      }

      return acc;
    }, {});
  //   ,{
  //     [today]: {
  //       selected: true,
  //       selectedColor: "#004898",
  //       textStyle: { fontWeight: "bold", color: "white" },
  //     },
  //   }
  // ); // 오늘 날짜 색칠

  return (
    <View>
      <TopBar month={month} year={year} />
      <View>
        <Calendar
          style={styles.calendar}
          markingType="multi-period"
          markedDates={markedDates}
          theme={{
            calendarBackground: "white", //캘린더 배경색
            textSectionTitleColor: "black", //월 ~ 일요일 색상
            selectedDayTextColor: "blue", //선택된 날짜 글자 색상
            todayTextColor: "blue", //오늘 날짜 글자 색상
            dayTextColor: "grey", //일반 날짜 글자 색상
            textDayHeaderFontWeight: "500",
          }}
          //날짜 선택시 실행될 함수
          onDayPress={(day) => {
            setSelectedDate(day.dateString); //선택한 날짜를 selectedDate에 저장
            setIsVisible(true); //선택한 날짜의 Schedule 컴포넌트를 보여줌
          }}
          monthFormat={""}
          onMonthChange={(month) => {
            setMonth(month.month);
            setYear(month.year);
          }}
          // 기본 화살표를 커스텀화살표로 대체 (방향은 '왼쪽'이나 '오른쪽')
          renderArrow={(direction) => (
            <Text style={styles.arrow}>{direction === "left" ? "<" : ">"}</Text>
          )}
          // 이번 달 페이지에 다른 달 숫자를 보이지 않게 함, Default = false
          hideExtraDays={false}
        />
      </View>

      {scheduleStartData.length === 0 ? (
        <View style={styles.txtcontainer}>
          <Text style={styles.txtst}>일정이 없습니다.</Text>
        </View>
      ) : (
        <ScrollView style={styles.scr}>
          {scheduleStartData
            .map((startDate, index) => ({
              startDate,
              title: scheduleTitle[index],
              endDate: scheduleEndData[index],
              color: scheduleColor[index],
            }))
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
            .map((schedule, index) => (
              <View key={index} style={styles.scheduleItem}>
                <View
                  style={[styles.TopBar, { backgroundColor: schedule.color }]}
                />
                <Text
                  style={styles.scheduleText}
                >{`${schedule.startDate} ~ ${schedule.endDate} : ${schedule.title}`}</Text>
              </View>
            ))}
        </ScrollView>
      )}
      <Provider store={store}>
        <View>
          <Schedule
            isVisible={isVisible}
            showModal={showModal}
            selectedDate={selectedDate}
          />
        </View>
      </Provider>
      <BottomBar refresh={refresh} />
    </View>
  );
}

const styles = StyleSheet.create({
  calendar: {
    marginTop: -10,
    height: 370,
  },
  arrow: {
    fontSize: 18,
    color: "black",
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  TopBar: {
    width: 10,
    height: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  scheduleText: {
    fontSize: 16,
  },
  scr: {
    padding: 30,
    marginRight: 30,
    height: 225,
    maxHeight: 225,
  },
  txtcontainer: {
    height: 225,
    justifyContent: "center",
    alignItems: "center",
  },
  txtst: {
    fontSize: 16,
    fontWeight: "500",
    color: "#bbbbbb",
    textAlign: "center",
  },
});

export default Main;
