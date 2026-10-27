/* ==========================================================================
   🌐 API通信用 共通サービス関数（バックエンドルーティング完全適合版）
   ========================================================================== */

const BASE_URL = 'http://localhost:8000'; 

/**
 * 1. 共通ユーザ登録
 * POST /create/new_account
 */
export async function registerAccount({ nickname, userID, password, confirmationPassword }) {
  const response = await fetch(`${BASE_URL}/create/new_account`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      user_id: userID,
      nickname: nickname,
      password: password,
      confirmation_Password: confirmationPassword
    })
  });
  
  const result = await response.json();
  if (result.status !== 'success') {
    throw new Error(result.message || 'ユーザ登録に失敗しました');
  }
  return result;
}

/**
 * 2. ユーザログイン
 * POST /login
 */
export async function login({ userID, password }) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      user_id: userID,
      password: password
    })
  });
  
  const result = await response.json();
  if (result.status !== 'success') {
    throw new Error(result.message || 'ログインに失敗しました');
  }
  return result;
}

/**
 * 3. 幹事：イベント新規作成
 * POST /create/new_event
 */
export async function createEvent(eventPayload) {
  const response = await fetch(`${BASE_URL}/create/new_event`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json'
    },
    body: JSON.stringify(eventPayload)
  });
  
  // 💡 バックエンドから返ってきた生のステータスコードと結果をまるごとログに出す
  console.log("HTTPステータスコード:", response.status);
  const result = await response.json();
  console.log("バックエンドからの生の応答データ:", result);
  
  if (result.status !== 'success') {
    // バックエンドが詳細なメッセージを持っていればそれを優先、なければ詳細なオブジェクトをエラーに載せる
    throw new Error(result.message || `サーバーエラー: ${JSON.stringify(result)}`);
  }
  return result;
}

/**
 * 4. 幹事：作成イベント一覧取得
 * GET /manager/events?manager_id={managerId}
 */
export async function fetchHostEvents(managerId) {
  const response = await fetch(`${BASE_URL}/manager/events?manager_id=${managerId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error('HTTPエラーが発生しました');
  }
  
  const result = await response.json();
  if (result.status !== 'success') {
    throw new Error(result.message || '幹事イベント一覧の取得に失敗しました');
  }
  return result.data;
}

/**
 * 5. 幹事：管理・集計詳細画面情報の取得
 * GET /event/detail?event_id={eventId}
 */
export async function fetchAdminEventDetail(eventId) {
  const response = await fetch(`${BASE_URL}/event/detail?event_id=${eventId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error('HTTPエラーが発生しました');
  }
  
  const result = await response.json();
  if (result.status !== 'success') {
    throw new Error(result.message || '管理用集計データの取得に失敗しました');
  }
  return result.data;
}

/**
 * 6. 幹事：イベントの最終開催確定
 * POST /confirm_information
 */
export async function confirmEvent(confirmPayload) {
  const response = await fetch(`${BASE_URL}/confirm_information`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json'
    },
    body: JSON.stringify(confirmPayload)
  });
  
  const result = await response.json();
  if (result.status !== 'success') {
    throw new Error(result.message || 'イベント確定情報登録に失敗しました');
  }
  return result;
}

/**
 * 7. 参加者：参加イベント一覧取得
 * GET /participant/events?participant_id={participantId}
 */
export async function fetchGuestEvents(participantId) {
  const response = await fetch(`${BASE_URL}/participant/events?participant_id=${participantId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error('HTTPエラーが発生しました');
  }
  
  const result = await response.json();
  if (result.status !== 'success') {
    throw new Error(result.message || '参加イベント一覧の取得に失敗しました');
  }
  return result.data;
}

/**
 * 8. 参加者：イベント詳細情報・過去回答取得
 * GET /event/detail?event_id={eventId}&participant_id={participantId}
 */
export async function fetchEventDetail(eventId, participantId) {
  const response = await fetch(`${BASE_URL}/event/detail?event_id=${eventId}&participant_id=${participantId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error('HTTPエラーが発生しました');
  }
  
  const result = await response.json();
  if (result.status !== 'success') {
    throw new Error(result.message || 'イベント詳細情報の取得に失敗しました');
  }
  return result.data;
}

/**
 * 9. 参加者：アンケート新規回答
 * POST /participant/create/answer
 */
export async function submitAnswer(answerData) {
  const response = await fetch(`${BASE_URL}/participant/create/answer`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json'
    },
    body: JSON.stringify(answerData)
  });
  
  const result = await response.json();
  if (result.status !== 'success') {
    throw new Error(result.message || '回答の送信に失敗しました');
  }
  return result;
}

/**
 * 10. 参加者：アンケート再回答（修正送信）
 * POST /participant/create/answer
 */
export async function submitReAnswer(answerData) {
  const response = await fetch(`${BASE_URL}/participant/create/answer`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json'
    },
    body: JSON.stringify(answerData)
  });
  
  const result = await response.json();
  if (result.status !== 'success') {
    throw new Error(result.message || '回答の更新に失敗しました');
  }
  return result;
}