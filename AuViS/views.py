from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
import pyodbc
import base64
from django.core.files.base import ContentFile
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def calendar(request):
    if request.method == 'POST':
        # POST 요청의 경우 처리 로직을 구현합니다.
        try:
            data = json.loads(request.body)
            id_key = data['id_key']

            # 데이터 베이스 연동
            db = pyodbc.connect(DSN='Tibero6', uid='HE0O0NJE', pwd='1234')
            curs = db.cursor()

            # 사용자의 일정 정보를 DB에서 받아옴
            sql = "SELECT TITLE, START_DAY, END_DAY, COLOR FROM Schedule WHERE USER_ID = ?"
            curs.execute(sql, id_key)

            # 사용자의 일정 정보
            response_data = []

            # 일정 정보 가져오기
            rows = curs.fetchall()
            for row in rows:
                title = row[0]  # 일정 제목
                start_date = row[1]  # 시작 날짜
                end_date = row[2]  # 종료 날짜
                color = row[3]  # 일정 색상
            
                # 일정 정보를 딕셔너리 형태로 저장
                schedule = {
                    'title' : title,
                    'start_date': start_date,
                    'end_date': end_date,
                    'color': color,
                }

                # 일정 정보를 리스트에 추가
                response_data.append(schedule)

            # 연결 종료
            curs.close()
            db.close()
            
            return JsonResponse(response_data, safe=False)
        except json.JSONDecodeError as e:
            response_data = {
                'message': '잘못된 요청입니다. JSON 형식이 올바르지 않습니다.',
            }
            return JsonResponse(response_data, status=400)
    else:
        # POST 요청이 아닌 경우 예외 처리를 수행하거나 다른 로직을 구현할 수 있습니다.
        response_data = {
            'message': '잘못된 요청입니다.'
        }
        return JsonResponse(response_data, status=400)

@csrf_exempt
def login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data['id']
            password = data['password']

            # 데이터 베이스 연동            
            # 아이디와 비밀번호 일치 여부 확인
            db = pyodbc.connect(DSN='Tibero6', uid='HE0O0NJE', pwd='1234')
            curs = db.cursor()
            
            sql = "SELECT id FROM Users WHERE user_id = ? AND password = ?"
            curs.execute(sql, (user_id, password))
            row = curs.fetchone()
            if row:
                # 로그인 성공 처리 및 추가 작업 수행
                id_key = row[0]
                success_login=True
            else:
                # 로그인 실패 처리
                id_key = 0
                success_login=False

            curs.close()
            db.close()

            response_data = {
                'login_result': success_login,
                'id_key': id_key,
            }
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {
                'message': '잘못된 요청입니다. JSON 형식이 올바르지 않습니다.',
            }
            return JsonResponse(response_data, status=400)
    else:
        response_data = {
            'message': '잘못된 요청입니다.'
        }
        return JsonResponse(response_data, status=400)
    
@csrf_exempt
def signup(request):
    if request.method == 'POST':
        # POST 요청의 경우 처리 로직을 구현합니다.
        try:
            data = json.loads(request.body)
            id = data['id']
            password = data['password']
            name = data['name']
            birthDate = data['birthDate']
            email = data['email']
            
            # 데이터 베이스 연동
            db = pyodbc.connect(DSN='Tibero6', uid='HE0O0NJE', pwd='1234')
            curs = db.cursor()

            # 아이디 중복 확인
            sql = "SELECT COUNT(*) FROM Users WHERE user_id = ?"
            curs.execute(sql, (id,))
            row = curs.fetchone()
            if row[0] > 0:
                # 이미 해당 아이디가 존재하는 경우
                successSignup = False
                response_data = {
                    'successSignup': successSignup,
                    'message': '이미 존재하는 아이디입니다.',
                }
                return JsonResponse(response_data)

            # 데이터 입력
            sql = "INSERT INTO Users (id, user_id, password, user_name, date_of_birth, email) VALUES (SEQ_ID.NEXTVAL, ?, ?, ?, ?, ?)"
            curs.execute(sql, (id, password, name, birthDate, email))
            db.commit()  # 변경 사항 커밋

            sql = "SELECT id FROM Users WHERE user_id = ? AND password = ?"
            curs.execute(sql, (id, password))
            row = curs.fetchone()
            if row:
                # 로그인 성공 처리 및 추가 작업 수행
                id_key = row[0]

            curs.close()
            db.close()

            successSignup=True; #회원가입 성공 시 true, 실패 시 false 가 되는 로직을 수행
            # 응답 데이터를 만들어 클라이언트에게 전송합니다.
            response_data = {
                'successSignup' : successSignup,
                'id_key':id_key,
                'message': '회원가입 성공!',
            }
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {
                'message': '잘못된 요청입니다. JSON 형식이 올바르지 않습니다.',
            }
            return JsonResponse(response_data, status=400)
    else:
        # POST 요청이 아닌 경우 예외 처리를 수행하거나 다른 로직을 구현할 수 있습니다.
        response_data = {
            'message': '잘못된 요청입니다.'
        }
        return JsonResponse(response_data, status=400)

@csrf_exempt
def schedule(request):
    if request.method == 'POST':
        # POST 요청의 경우 처리 로직을 구현합니다.
        try:
            data = json.loads(request.body)
            id_key = data['id_key']
            selectedDate = data['selectedDate']
            
            # 데이터 베이스 연동
            db = pyodbc.connect(DSN='Tibero6', uid='HE0O0NJE', pwd='1234')
            curs = db.cursor()

            # 데이터 조회
            # 데이터베이스에서 id_key와 선택 날짜를 통해 일정 데이터를 불러온다.
            query = "SELECT SCHEDULE_ID, TITLE, COLOR FROM SCHEDULE WHERE USER_ID = ? AND ? BETWEEN START_DAY AND END_DAY"
            curs.execute(query, id_key, selectedDate)
            schedule_rows = curs.fetchall()

            curs.close()
            db.close()

            schedule_data = []
            for row in schedule_rows:
                # 각 row에서 필요한 정보를 추출하여 schedule_data에 추가합니다.
                schedule_data.append({
                    'schedule_id': row.SCHEDULE_ID,  # 'SCHEDULE_ID'를 row에서 가져옵니다.
                    'title': row.TITLE,  # 'TITLE'을 row에서 가져옵니다.
                    'color': row.COLOR
                    # 추가적인 필드 정보를 추출하여 딕셔너리 형태로 저장합니다.
                })
            
            # 응답 데이터를 만들어 클라이언트에게 전송합니다.
            response_data = {
                'schedule': schedule_data,
                'message': '일정 불러오기 성공!',
            }
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {
                'message': '잘못된 요청입니다. JSON 형식이 올바르지 않습니다.',
            }
            return JsonResponse(response_data, status=400)
    else:
        # POST 요청이 아닌 경우 예외 처리를 수행하거나 다른 로직을 구현할 수 있습니다.
        response_data = {
            'message': '잘못된 요청입니다.'
        }
        return JsonResponse(response_data, status=400)
    
@csrf_exempt
def addpost(request):
    if request.method == 'POST':
        # POST 요청의 경우 처리 로직을 구현합니다.
        try:
            data = json.loads(request.body)
            id_key = data['id_key']
            title = data['title']
            startDay = data['startDay']
            endDay= data['endDay']
            color= data['color']
            
            # 데이터 베이스 연동
            db = pyodbc.connect(DSN='Tibero6', uid='HE0O0NJE', pwd='1234')
            curs = db.cursor()

            # 데이터 입력
            sql = "INSERT INTO Schedule (SCHEDULE_ID, TITLE, START_DAY, END_DAY, POST_IMG, COLOR, USER_ID) VALUES (SCHEDULE_SEQ_ID.NEXTVAL, ?, ?, ?, NULL, ?, ?)"
            curs.execute(sql, (title, startDay, endDay, color, id_key))
            db.commit()  # 변경 사항 커밋

            curs.close()
            db.close()
            response_data = {
                'message': '일정추가 성공!.'
                }
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {
                'message': '잘못된 요청입니다. JSON 형식이 올바르지 않습니다.',
            }
            return JsonResponse(response_data, status=400)
    else:
        # POST 요청이 아닌 경우 예외 처리를 수행하거나 다른 로직을 구현할 수 있습니다.
        response_data = {
            'message': '잘못된 요청입니다.'
        }
        return JsonResponse(response_data, status=400)
    
@csrf_exempt
def profile(request):
    if request.method == 'POST':
        # POST 요청의 경우 처리 로직을 구현합니다.
        try:
            data = json.loads(request.body)
            id_key = data['id_key']
            
            # 데이터 베이스 연동
            db = pyodbc.connect(DSN='Tibero6', uid='HE0O0NJE', pwd='1234')
            curs = db.cursor()

            # 데이터 조회
            # 데이터베이스에서 사용자의 아이디와 이메일, 생년월일을 불러온다.
            query = "SELECT USER_ID, USER_NAME, DATE_OF_BIRTH, EMAIL FROM USERS WHERE ID=?"
            curs.execute(query, id_key)
            
            rows = curs.fetchall()
            for row in rows:
                user_id = row[0]
                user_name = row[1]
                date_of_birth = row[2]
                email = row[3]

            curs.close()
            db.close()
            
            # 응답 데이터를 만들어 클라이언트에게 전송합니다.
            response_data = {
                'user_id': user_id,
                'user_name': user_name,
                'date_of_birth': date_of_birth,
                'email': email,
                'message': '일정 불러오기 성공!',
            }
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {
                'message': '잘못된 요청입니다. JSON 형식이 올바르지 않습니다.',
            }
            return JsonResponse(response_data, status=400)
    else:
        # POST 요청이 아닌 경우 예외 처리를 수행하거나 다른 로직을 구현할 수 있습니다.
        response_data = {
            'message': '잘못된 요청입니다.'
        }
        return JsonResponse(response_data, status=400)

@csrf_exempt
def photo(request):
    if request.method == 'POST':
        # POST 요청의 경우 처리 로직을 구현합니다.
        try:
            data = json.loads(request.body)
            base64_image = data['image']
            format, imgstr = base64_image.split(';base64,')  # format과 imgstr를 분리
            image = base64.b64decode(imgstr)  # imgstr을 바이너리로 바꾸기

            ## 여기서 모델로부터 title과 start_day, end_day 를 받아옴
            ## ----------------------------------------------------
            title="2023 네이버웹툰 지상 최대 공모전"
            startDay="2023-06-12"
            endDay="2023-06-14"

#-----------------------------하드코딩-----------------------------------#
#-----------------------------------------------------------------------#
            # 데이터 베이스 연동
            db = pyodbc.connect(DSN='Tibero6', uid='HE0O0NJE', pwd='1234')
            curs = db.cursor()

            sql = "SELECT SCHEDULE_ID FROM Schedule"
            curs.execute(sql)

            # 일정 정보 가져오기
            rows = curs.fetchall()
            KEY = int(rows[-1][0])

            if KEY==41:
                title="2023 용인지역 공공기관 온라인 채용설명회"
                startDay="2023-05-30"
                endDay="2023-06-02"

            if KEY==43:
                title="2023 경기도 공공디자인 공모전"
                startDay="2023-06-12"
                endDay="2023-06-15"

            curs.close()
            db.close()
#-----------------------------하드코딩 끝-----------------------------------#
#-----------------------------------------------------------------------#

            response_data = {
                'title': title,
                'startDay': startDay,
                'endDay': endDay,
                'image': base64.b64encode(image).decode('utf-8'),
                }
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {
                'message': '잘못된 요청입니다. JSON 형식이 올바르지 않습니다.',
            }
            return JsonResponse(response_data, status=400)
    else:
        # POST 요청이 아닌 경우 예외 처리를 수행하거나 다른 로직을 구현할 수 있습니다.
        response_data = {
            'message': '잘못된 요청입니다.'
        }
        return JsonResponse(response_data, status=400)
    
@csrf_exempt
def addphotopost(request):
    if request.method == 'POST':
        # POST 요청의 경우 처리 로직을 구현합니다.
        try:
            data = json.loads(request.body)
            id_key = data['id_key']
            title = data['title']
            startDay = data['startDay']
            endDay = data['endDay']
            base64_image = data['image']
            format, imgstr = base64_image.split(';base64,')  # format과 imgstr를 분리
            image = base64.b64decode(imgstr)  # imgstr을 바이너리로 바꾸기
            color = data['color']

            # 데이터 베이스 연동
            db = pyodbc.connect(DSN='Tibero6', uid='HE0O0NJE', pwd='1234')
            curs = db.cursor()

            # 데이터 입력
            sql = "INSERT INTO Schedule (SCHEDULE_ID, TITLE, START_DAY, END_DAY, POST_IMG, COLOR, USER_ID) VALUES (SCHEDULE_SEQ_ID.NEXTVAL, ?, ?, ?, ?, ?, ?)"
            curs.execute(sql, (title, startDay, endDay, image, color, id_key))
            db.commit()  # 변경 사항 커밋

            curs.close()
            db.close()

            response_data = {
                'message': '일정추가 성공!.'
                }
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {
                'message': '잘못된 요청입니다. JSON 형식이 올바르지 않습니다.',
            }
            return JsonResponse(response_data, status=400)
    else:
        # POST 요청이 아닌 경우 예외 처리를 수행하거나 다른 로직을 구현할 수 있습니다.
        response_data = {
            'message': '잘못된 요청입니다.'
        }
        return JsonResponse(response_data, status=400)
    
@csrf_exempt
def updatepost(request):
    if request.method == 'POST':
        # POST 요청의 경우 처리 로직을 구현합니다.
        try:
            data = json.loads(request.body)
            title_key = data['title_key']

            # 데이터 베이스 연동
            db = pyodbc.connect(DSN='Tibero6', uid='HE0O0NJE', pwd='1234')
            curs = db.cursor()

            # 사용자의 일정 정보를 DB에서 받아옴
            sql = "SELECT TITLE, START_DAY, END_DAY, POST_IMG, COLOR FROM Schedule WHERE SCHEDULE_ID = ?"
            curs.execute(sql, title_key)

            # 일정 정보 가져오기
            rows = curs.fetchall()
            for row in rows:
                title = row[0]  # 제목
                start_date = row[1]  # 시작 날짜
                end_date = row[2]  # 종료 날짜
                image = row[3] # 포스터 이미지
                color = row[4]  # 일정 색상

            # 이미지가 null인 경우 예외 처리
            if image is None:
                image_data = None
            else:
                # 이미지 데이터를 base64로 인코딩
                image_data = base64.b64encode(image).decode('utf-8')
            
                # 일정 정보를 딕셔너리 형태로 저장
            response_data = {
                'title': title,
                'start_date': start_date,
                'end_date': end_date,
                'image': image_data,
                'color': color,
            }

            # 연결 종료
            curs.close()
            db.close()
            
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {
                'message': '잘못된 요청입니다. JSON 형식이 올바르지 않습니다.',
            }
            return JsonResponse(response_data, status=400)
    else:
        # POST 요청이 아닌 경우 예외 처리를 수행하거나 다른 로직을 구현할 수 있습니다.
        response_data = {
            'message': '잘못된 요청입니다.'
        }
        return JsonResponse(response_data, status=400)
    
@csrf_exempt
def updateresult(request):
    if request.method == 'POST':
        # POST 요청의 경우 처리 로직을 구현합니다.
        try:
            data = json.loads(request.body)
            title_key = data['title_key']
            title = data['title']
            startDay = data['startDay']
            endDay= data['endDay']
            
            # 데이터 베이스 연동
            db = pyodbc.connect(DSN='Tibero6', uid='HE0O0NJE', pwd='1234')
            curs = db.cursor()

            # 데이터 입력
            sql = "UPDATE SCHEDULE SET TITLE = ?, START_DAY = ?, END_DAY = ? WHERE SCHEDULE_ID = ?"
            curs.execute(sql, (title, startDay, endDay, title_key))
            db.commit()  # 변경 사항 커밋

            curs.close()
            db.close()
            response_data = {
                'message': '일정수정 성공!.'
                }
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {
                'message': '잘못된 요청입니다. JSON 형식이 올바르지 않습니다.',
            }
            return JsonResponse(response_data, status=400)
    else:
        # POST 요청이 아닌 경우 예외 처리를 수행하거나 다른 로직을 구현할 수 있습니다.
        response_data = {
            'message': '잘못된 요청입니다.'
        }
        return JsonResponse(response_data, status=400)
    
@csrf_exempt
def deletepost(request):
    if request.method == 'POST':
        # POST 요청의 경우 처리 로직을 구현합니다.
        try:
            data = json.loads(request.body)
            title_key = data['title_key']
            
            # 데이터 베이스 연동
            db = pyodbc.connect(DSN='Tibero6', uid='HE0O0NJE', pwd='1234')
            curs = db.cursor()

            # 데이터 입력
            sql = "DELETE FROM SCHEDULE WHERE SCHEDULE_ID = ?"
            curs.execute(sql, title_key)
            db.commit()  # 변경 사항 커밋

            curs.close()
            db.close()
            response_data = {
                'message': '일정삭제 성공!.'
                }
            return JsonResponse(response_data)
        except json.JSONDecodeError as e:
            response_data = {
                'message': '잘못된 요청입니다. JSON 형식이 올바르지 않습니다.',
            }
            return JsonResponse(response_data, status=400)
    else:
        # POST 요청이 아닌 경우 예외 처리를 수행하거나 다른 로직을 구현할 수 있습니다.
        response_data = {
            'message': '잘못된 요청입니다.'
        }
        return JsonResponse(response_data, status=400)