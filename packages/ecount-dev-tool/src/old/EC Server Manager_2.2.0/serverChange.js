document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      let currentUrl = new URL(tabs[0].url);

    // test이고 ec5일 때
      if (currentUrl.hostname.includes('test') && currentUrl.href.includes('ec5/view/erp')) {
        const currentServer = 'test';
        const changeServer = document.getElementById('change-server');
        document.querySelectorAll('.current-server').forEach(element => {
          element.textContent = currentServer;
        });

        const hostname = currentUrl.hostname;
        const v5Domain = 'test';
        
        const v3DomainsParam = currentUrl.searchParams.get('__v3domains');
        let v3Domain;
        if (v3DomainsParam) {
            v3Domain = v3DomainsParam.replace(/zeus\d+/, '');
            // v3Domain이 빈 문자열이면 기본값 ba1 설정
            if (v3Domain === '') {
                v3Domain = 'ba1';
            }
        } else {
            v3Domain = 'ba1';
        }
        const v5Select = document.getElementById('v5-select');
        const v3Select = document.getElementById('v3-select');
        const v5Input = document.getElementById('v5-server');
        const v3Input = document.getElementById('v3-server');

        // v5 서버가 test면 input 모드로 전환
        document.getElementById('v5-select-type').style.display = 'none';
        document.getElementById('v5-input-type').style.display = 'flex';
        v5Input.value = 'test';
        
        // v3 서버가 test면 input 모드로 전환
        if (v3Domain === 'test') {
            document.getElementById('v3-select-type').style.display = 'none';
            document.getElementById('v3-input-type').style.display = 'flex';
            v3Input.value = 'test';
        } else {
            v3Select.value = v3Domain || 'ba1';
        }

        // 버튼 클릭 시 서버 변경
        changeServer.addEventListener('click', () => changeServerEc5(v3Select, v5Select, v3Input, v5Input));

        function changeServerEc5(v3Select, v5Select, v3Input, v5Input) {
            // input-type이 활성화되어 있는지 확인
            const v3InputType = document.getElementById('v3-input-type');
            const v5InputType = document.getElementById('v5-input-type');
            
            const toV3Server = v3InputType.style.display === 'none' ? 
                currentServer + v3Select.value : 
                v3Input.value;
            const toV5Server = v5InputType.style.display === 'none' ? 
                currentServer + v5Select.value : 
                v5Input.value;
            
            // 현재 URL에서 도메인 부분을 새로운 서버로 교체
            let newUrl = currentUrl.href.replace(/https:\/\/[^\/]+/, `https://${toV5Server}.ecount.com`);
            
            // 해시(#) 위치 찾기
            const hashIndex = newUrl.indexOf('#');
            const hashPart = hashIndex !== -1 ? newUrl.slice(hashIndex) : '';
            const baseUrl = hashIndex !== -1 ? newUrl.slice(0, hashIndex) : newUrl;
            
            // __v3domains 파라미터 처리
            let updatedBaseUrl = baseUrl.replace(/[?&]__v3domains=[^&#]*/, '');
            updatedBaseUrl += (updatedBaseUrl.includes('?') ? '&' : '?') + `__v3domains=${toV3Server}`;
            
            // 최종 URL 생성
            const finalUrl = updatedBaseUrl + hashPart;
            
            // URL 업데이트
            chrome.tabs.update(tabs[0].id, { url: finalUrl });
            window.close();
        };
      }

    // zeus이고 ec5일 때
    else if (currentUrl.hostname.startsWith('zeus') && currentUrl.href.includes('ec5/view/erp')) {
        // URL에서 current-Server 추출해서 반영
        const zeusNumber = currentUrl.href.match(/zeus(\d+)/)?.[1] || '01';
        const currentServer = `zeus${zeusNumber}`;
        const changeServer = document.getElementById('change-server');
        document.querySelectorAll('.current-server').forEach(element => {
          element.textContent = currentServer;
        });

        const hostname = currentUrl.hostname;
        let v5Domain;
        if (hostname.includes('test')) {
            v5Domain = 'test';
        } else {
            v5Domain = hostname.split('.')[0].replace(/zeus\d+/, '');
            // -dev 접미사 제거
            v5Domain = v5Domain.replace(/-dev$/, '');
            // v5Domain이 빈 문자열이거나 숫자가 없으면 기본값 lxba1 설정
            if (v5Domain === '' || v5Domain === 'lxba') {
                v5Domain = 'lxba1';
            }
        }
        
        const v3DomainsParam = currentUrl.searchParams.get('__v3domains');
        let v3Domain;
        if (v3DomainsParam) {
            v3Domain = v3DomainsParam.replace(/zeus\d+/, '');
            // v3Domain이 빈 문자열이면 기본값 ba1 설정
            if (v3Domain === '') {
                v3Domain = 'ba1';
            }
        } else {
            v3Domain = 'ba1';
        }
        const v5Select = document.getElementById('v5-select');
        const v3Select = document.getElementById('v3-select');
        const v5Input = document.getElementById('v5-server');
        const v3Input = document.getElementById('v3-server');

        // v5 서버가 test면 input 모드로 전환
        if (v5Domain === 'test') {
            document.getElementById('v5-select-type').style.display = 'none';
            document.getElementById('v5-input-type').style.display = 'flex';
            v5Input.value = 'test';
        } else {
            v5Select.value = v5Domain || 'lxba1';
        }
        
        // v3 서버가 test면 input 모드로 전환
        if (v3Domain === 'test') {
            document.getElementById('v3-select-type').style.display = 'none';
            document.getElementById('v3-input-type').style.display = 'flex';
            v3Input.value = 'test';
        } else {
            v3Select.value = v3Domain || 'ba1';
        }

        // 버튼 클릭 시 서버 변경
        changeServer.addEventListener('click', () => changeServerEc5(v3Select, v5Select, v3Input, v5Input));

        function changeServerEc5(v3Select, v5Select, v3Input, v5Input) {
            // input-type이 활성화되어 있는지 확인
            const v3InputType = document.getElementById('v3-input-type');
            const v5InputType = document.getElementById('v5-input-type');
            
            const toV3Server = v3InputType.style.display === 'none' ? 
                currentServer + v3Select.value : 
                v3Input.value;
            const toV5Server = v5InputType.style.display === 'none' ? 
                currentServer + v5Select.value : 
                v5Input.value;
            
            // 현재 URL에서 도메인 부분을 새로운 서버로 교체
            let newUrl = currentUrl.href.replace(/https:\/\/[^\/]+/, `https://${toV5Server}.ecount.com`);
            
            // 해시(#) 위치 찾기
            const hashIndex = newUrl.indexOf('#');
            const hashPart = hashIndex !== -1 ? newUrl.slice(hashIndex) : '';
            const baseUrl = hashIndex !== -1 ? newUrl.slice(0, hashIndex) : newUrl;
            
            // __v3domains 파라미터 처리
            let updatedBaseUrl = baseUrl.replace(/[?&]__v3domains=[^&#]*/, '');
            updatedBaseUrl += (updatedBaseUrl.includes('?') ? '&' : '?') + `__v3domains=${toV3Server}`;
            
            // 최종 URL 생성
            const finalUrl = updatedBaseUrl + hashPart;
            
            // URL 업데이트
            chrome.tabs.update(tabs[0].id, { url: finalUrl });
            window.close();
        };
      }

    // zeus 이고 ecp050m일 때 (나중에 걷어낼 로직)
    else if (currentUrl.hostname.startsWith('zeus') && currentUrl.href.includes('ECERP/ECP/ECP050M')) {
      // URL에서 current-Server 추출해서 반영
      const zeusNumber = currentUrl.href.match(/zeus(\d+)/)?.[1] || '01';
      const currentServer = `zeus${zeusNumber}`;
      const changeServer = document.getElementById('change-server');
      document.querySelectorAll('.current-server').forEach(element => {
        element.textContent = currentServer;
      });

      const hostname = currentUrl.hostname;
      let v3Domain;
      if (hostname.includes('test')) {
          v3Domain = 'test';
      } else {
          v3Domain = hostname.split('.')[0].replace(/zeus\d+/, '');
          // v3Domain이 빈 문자열이면 기본값 ba1 설정
          if (v3Domain === '') {
              v3Domain = 'ba1';
          }
      }
      
      const v5DomainsParam = currentUrl.searchParams.get('__v5domains');
      let v5Domain;
      if (v5DomainsParam) {
          v5Domain = v5DomainsParam.replace(/zeus\d+/, '');
          // v5Domain이 빈 문자열이면 기본값 lxba1 설정
          if (v5Domain === '') {
              v5Domain = 'lxba1';
          }
      } else {
          v5Domain = 'lxba1';
      }
      const v5Select = document.getElementById('v5-select');
      const v3Select = document.getElementById('v3-select');
      const v5Input = document.getElementById('v5-server');
      const v3Input = document.getElementById('v3-server');

      // v5 서버가 test면 input 모드로 전환
      if (v5Domain === 'test') {
          document.getElementById('v5-select-type').style.display = 'none';
          document.getElementById('v5-input-type').style.display = 'flex';
          v5Input.value = 'test';
      } else {
          v5Select.value = v5Domain || 'lxba1';
      }
      
      // v3 서버가 test면 input 모드로 전환
      if (v3Domain === 'test') {
          document.getElementById('v3-select-type').style.display = 'none';
          document.getElementById('v3-input-type').style.display = 'flex';
          v3Input.value = 'test';
      } else {
          v3Select.value = v3Domain || 'ba1';
      }

      // 버튼 클릭 시 서버 변경
      changeServer.addEventListener('click', () => changeServerEcp(v3Select, v5Select, v3Input, v5Input));

      function changeServerEcp(v3Select, v5Select, v3Input, v5Input) {
          // input-type이 활성화되어 있는지 확인
          const v3InputType = document.getElementById('v3-input-type');
          const v5InputType = document.getElementById('v5-input-type');
          
          const toV3Server = v3InputType.style.display === 'none' ? 
              currentServer + v3Select.value : 
              v3Input.value;
          const toV5Server = v5InputType.style.display === 'none' ? 
              currentServer + v5Select.value : 
              v5Input.value;
          
          // 현재 URL에서 도메인 부분을 새로운 서버로 교체
          let newUrl = currentUrl.href.replace(/https:\/\/[^\/]+/, `https://${toV3Server}.ecount.com`);
                          
          // 해시(#) 위치 찾기
          const hashIndex = newUrl.indexOf('#');
          const hashPart = hashIndex !== -1 ? newUrl.slice(hashIndex) : '';
          const baseUrl = hashIndex !== -1 ? newUrl.slice(0, hashIndex) : newUrl;

          // __v5domains 파라미터 처리
          let updatedBaseUrl = baseUrl.replace(/[?&]__v5domains=[^&#]*/, '');
          updatedBaseUrl += (updatedBaseUrl.includes('?') ? '&' : '?') + `__v5domains=${toV5Server}`;

          // 최종 URL 생성
          const finalUrl = updatedBaseUrl + hashPart;

          // URL 업데이트
          chrome.tabs.update(tabs[0].id, { url: finalUrl });
          window.close();
      };
    }

    // stage일 때
    else if (currentUrl.href.startsWith('https://stage')) {
      const stageButton = document.getElementById('stage-button');

      // stage 서버에 따라 버튼 텍스트를 다르게 표시
          if (currentUrl.href.includes('stageba.ecount.com') || currentUrl.href.includes('stageba-dev.ecount.com')) {
              stageButton.innerHTML = 'stageba2로 전환';
          } else if (currentUrl.href.includes('stagelxba2.ecount.com') || currentUrl.href.includes('stagelxba2-dev.ecount.com')) {
              stageButton.innerHTML = 'stageba1로 전환';
          }

      // stage 서버 변경 버튼 동작
      stageButton.addEventListener('click', () => {
              let newUrl;
              // stageba 서버에서 stagelxba2 서버로 변경
              if (currentUrl.href.includes('stageba.ecount.com') || currentUrl.href.includes('stageba-dev.ecount.com')) {
                  if (currentUrl.href.includes('stageba-dev.ecount.com')) {
                      newUrl = currentUrl.href.replace('stageba-dev.ecount.com', 'stagelxba2-dev.ecount.com');
                  } else {
                      newUrl = currentUrl.href.replace('stageba.ecount.com', 'stagelxba2.ecount.com');
                  }
                  if (!newUrl.includes('&__v3domains=stageba2')) {
                      const hashIndex = newUrl.indexOf('#');
                      if (hashIndex !== -1) {
                          newUrl = newUrl.slice(0, hashIndex) + '&__v3domains=stageba2' + newUrl.slice(hashIndex);
                      } else {
                          newUrl += '&__v3domains=stageba2';
                      }
                  }
              // stagelxba2 서버에서 stageba 서버로 변경
              } else if (currentUrl.href.includes('stagelxba2.ecount.com') || currentUrl.href.includes('stagelxba2-dev.ecount.com')) {
                  if (currentUrl.href.includes('stagelxba2-dev.ecount.com')) {
                      newUrl = currentUrl.href.replace('stagelxba2-dev.ecount.com', 'stageba-dev.ecount.com');
                  } else {
                      newUrl = currentUrl.href.replace('stagelxba2.ecount.com', 'stageba.ecount.com');
                  }
                  newUrl = newUrl.replace('&__v3domains=stageba2', '');
              }

              // URL 변경
              chrome.tabs.update(tabs[0].id, { url: newUrl });
              window.close();
        });
      }

      else {
        const v5Select = document.getElementById('v5-select');
        const v3Select = document.getElementById('v3-select');
        const changeServer = document.getElementById('change-server');

        document.querySelectorAll('.current-server').forEach(element => {
            element.textContent = '=====';
        });
        v5Select.value = '=====';
        v3Select.value = '=====';

        //버튼 클릭 시 알럿
        changeServer.addEventListener('click', () => {
          alert('지원되지 않는 환경입니다.')
        })
      }
    });

    // 3.0 로컬 버튼 클릭 이벤트
    const v3LocalButton = document.getElementById('v3-local');
    v3LocalButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            if (currentTab?.url.includes('ecount')) {
                chrome.scripting.executeScript({
                    target: { tabId: currentTab?.id },
                    func: switchV3TestServer,
                    args: [],
                });
                window.close();
            }
        });
    });

    // 5.0 로컬 버튼 클릭 이벤트
    const v5LocalButton = document.getElementById('v5-local');
    v5LocalButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            if (currentTab?.url.includes('ecount')) {
                chrome.scripting.executeScript({
                    target: { tabId: currentTab?.id },
                    func: switchV5TestServer,
                    args: [],
                });
                window.close();
            }
        });
    });

    // -dev로 이동 버튼 클릭 이벤트
    const devLocalButton = document.getElementById('dev-local');
    devLocalButton.addEventListener('click', async () => {
        const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (currentTab?.url && currentTab.url.includes('ecount')) {
            const injectionResults = await chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                func: debugAndGetPageInfo,
                world: 'MAIN',
            });

            if (!injectionResults || !injectionResults[0]?.result) {
                alert('페이지에서 정보를 가져오는데 실패했습니다.');
                return;
            }

            var url = new URL(currentTab.url);
            const pageInfo = injectionResults[0].result;

            if (url.hostname.startsWith('login')) {
                const domainIndex = url.hostname.indexOf('ecount');
                const baseDomain = url.hostname.substring(domainIndex);

                if (pageInfo.zoneNum) {
                    const zoneId = pageInfo.zoneNum.toLowerCase();
                    url.hostname = `loginlx${zoneId}.${baseDomain}`;
                } else {
                    if (!url.hostname.startsWith("loginlx")) {
                        url.hostname = url.hostname.replace("login", "loginlx");
                    }
                }
            }
            
            if (pageInfo.hasSetDevMode) {
                // --- 새 시스템 로직 ---
                url.searchParams.set("__disableMin", "Y");
            } else {
                // --- 레거시 시스템 로직 ---
                url = switchToDevServerForLegacy(url, pageInfo);
            }

            await chrome.tabs.update(currentTab.id, { url: url.href });
            window.close();
        }
    });
});

/** 3.0 서버 로컬로 변경 */
function switchV3TestServer() {
    var url = new URL(top.location.href);
    url.searchParams.set('__v3domains', 'test');
    top.location = url.href;
    console.log('%c✅ 3.0 로컬로 변경', 'background: green; color: white; font-weight: bold; padding: 2px 4px; border-radius: 4px;');
}

/** 5.0 서버 로컬로 변경 */
function switchV5TestServer() {
    var url = new URL(top.location.href);
    url.host = 'test.ecount.com:5001';
    url.href = url.href.replace('ECERP/ECP/ECP050M', 'ec5/view/erp');
    top.location = url.href;
    console.log('%c✅ 5.0 로컬로 변경', 'background: green; color: white; font-weight: bold; padding: 2px 4px; border-radius: 4px;');
}

/** -dev 서버로 변경(레거시 환경) */
function switchToDevServerForLegacy(url, pageInfo) {
    let serverPrefix;
    const hostname = url.hostname;

    if (hostname.startsWith('login')) {
        serverPrefix = 'login';
    } else if (hostname.startsWith('stage')) {
        serverPrefix = 'stage';
    } else if (hostname.startsWith('zeus')) {
        serverPrefix = `zeus`;
    }

    let currentV3Domain = url.searchParams.get("__v3domains");

    if (!currentV3Domain) {
        const zoneId = pageInfo?.zoneNum?.toLowerCase();
        if (zoneId) {
            currentV3Domain = serverPrefix + zoneId;
        }
    }

    const v3DomainWithDev = currentV3Domain.includes("-dev") ? currentV3Domain : currentV3Domain + "-dev";
    url.searchParams.set("__v3domains", v3DomainWithDev);

    if (!hostname.includes('-dev')) {
        url.hostname = hostname.replace(/(\.ecount\..*)$/, '-dev$1');
    }

    return url;
}

/**
 * 이 함수는 웹 페이지의 MAIN world에서 실행되어 페이지 정보를 상세히 진단하고 반환합니다.
 */
function debugAndGetPageInfo() {
    const debugInfo = {
        hasSetDevMode: typeof top?.$ECount?.setDevMode === 'function',
        hasECountApp: typeof top?.$ECountApp !== 'undefined',
        hasGetContext: false,
        hasConfig: false,
        zoneNum: null,
        error: null,
    };

    try {
        if (debugInfo.hasECountApp) {
            debugInfo.hasGetContext = typeof top.$ECountApp.getContext === 'function';
            if (debugInfo.hasGetContext) {
                const context = top.$ECountApp.getContext();
                debugInfo.hasConfig = context && typeof context.config !== 'undefined';
                if (debugInfo.hasConfig) {
                    debugInfo.zoneNum = context.config.ec_zone_num;
                }
            }
        }
    } catch (e) {
        debugInfo.error = e.toString();
    }
    return debugInfo;
}