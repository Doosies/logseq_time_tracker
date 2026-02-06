///////////* 로그인 정보 딕셔너리 *////////////
/////// ,"회사코드§아이디" : "비밀번호" ///////
/// 회사코드+아이디 별 하나만 등록 가능합니다.//
/////////////////////////////////////////////

const loginDict = {
  "313786§뚜뚜": "1q2w3e4r",
  "600317§루리": "1q2w3e4r5t",
  "305000§은경": "1q2w3e4r",
  "300000§기수": "1q2w3e4r",
  "600320§예진": "1q2w3e4r",
  "313773§cm": "1q2w3e4r",
  "300001§치민": "1q2w3e4r",
  "664841§test": "1q2w3e4r",
  "665226§test": "1q2w3e4r",
};

/////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
  // 버튼을 생성하는 컨테이너 요소
  const container = document.getElementById("button-container");

  // 딕셔너리의 각 항목에 대해 버튼 생성
  for (const [key, value] of Object.entries(loginDict)) {
    const button = document.createElement("button");
    button.textContent = key.split("§")[0] + " / " + key.split("§")[1];

    //생성된 버튼의 디자인 설정
    button.style.width = "130px";
    button.style.height = "36px";
    button.style.backgroundColor = "#3250b9";
    button.style.fontSize = "12px";
    button.style.color = "white";
    button.style.padding = "7px 10px";
    button.style.margin = "4px 0px";
    button.style.border = "none";
    button.style.borderRadius = "4px";
    button.style.cursor = "pointer";
    button.style.float = "left";

    //버튼 클릭시 기능 실행
    button.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        tabs.forEach((currentTab) => {
          chrome.scripting.executeScript({
            target: { tabId: currentTab?.id },
            func: inputLogin,
            args: [key, value],
          });
        });
      });
    });
    container.appendChild(button);
  }
});

//로그인 화면에 값을 넣어주는 기능
function inputLogin(key, value) {
  document.getElementById("com_code").value = key.split("§")[0];
  document.getElementById("id").value = key.split("§")[1];
  document.getElementById("passwd").value = value;
}
