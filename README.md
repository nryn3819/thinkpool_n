# 모듈 작업 사용법 - 54.html

## module.html

### (두페이지 동일합니다. RC팀에서는 module.html 페이지를 보시면됩니다.)

1. 섹션 - 모듈 테두리

```html
  <section class="module-section"></section>
```

2. 박스 - 모듈 묶음

```html
  <div class="modulebox">
    <div class="left">
    </div>
    
    <div class="right">
    </div>
  </div>
```

3. left 작성법

```html
  <div class="module-content">
    상・하단 컨텐츠 - tit, txt(소스참조) 사용
  </div>
```

4. right 작성법

```html
  <div class="module-content">
    텍스트 - module-tbl-txt > strong, span, div.dot 등
    테이블 - module-tbl > table
    테이블 2단 - module-tbl > half-table-box > div + div
    테이블 3단 - module-tbl > third-table-box > div + div + div
    단위 및 기준 등의 우측상단 - module-tbl > module-tbl-guide > span
    텍스트박스(배경있는 텍스트박스) - module-txt-box
    차트 - module-chart
  </div>
```

5. 도움말 
  + 텍스트 
    - 레드 색상 클래스명 up
    - 블루 색상 클래스명 dn
    - 흐린 색사 클래스명 c999
   
   + 여백 - mt-5 ~ mt-40 // 5단위 상단여백
   + 좌・우 측 붙이기
    - 좌측 붙이기 클래스명 : pull-left
    - 우측 붙이기 클래스명 : pull-right

6. 참조 - [부트스트랩](http://bootstrapk.com/css/#helper-classes)

#### 2020.03.17 변경사항
  - 더보기 버튼 module-content 밖으로 빼기 
```html
  //right 내용
  <div class="module-content"></div>
  <a href="#" class="more pull-right">⟶더보기</a>
```

##### 2020.03.18 변경사항

  + 2,3단 테이블 높이값 변경 (css변경)

    - 2단테이블 - 58px

    - 3단테이블 - 76px

#### 2020.03.19 변경사항 

  * 테이블 tfoot(외국계추정합) 부분 tbody 통합 

  ```html
    <tfoot>
        <tr>
            <th scope="row" class="text-center">
                <span>외국계추정합</span>
            </th>
            <td class="text-center">
                <span>1</span>
            </td>
            <td class="text-center">
                <span>1</span>
            </td>
            <td class="text-center">
                <span></span>
            </td>
            <td class="text-center">
                <span></span>
            </td>
            <td class="text-center">
                <span></span>
            </td>
        </tr>
    </tfoot>
    <!-- 삭제 -->

    <tbody>
      <tr class="success"></tr>
    </tbody>
    <!-- 변경 -->
  ```
