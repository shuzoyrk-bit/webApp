/* ==========================================================================
   🕒 日時表示の共通フォーマッタ
   ========================================================================== */

/**
 * バックエンドの ISO 形式 ("2026-07-20T19:00:00") を "2026/07/20 19:00" に整形する。
 * 値が無い場合や想定外の形式の場合は fallback（既定は元の文字列）を返す。
 */
export function formatDateTime(value, fallback = "") {
  if (!value) return fallback;

  const matched = String(value).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!matched) return String(value);

  const [, year, month, day, hour, minute] = matched;
  return `${year}/${month}/${day} ${hour}:${minute}`;
}
