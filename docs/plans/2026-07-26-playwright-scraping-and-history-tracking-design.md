# 6サイト横断 動画過熱感ランキング Playwright自動収集 & 履歴差分計算エンジン 設計書

**作成日**: 2026-07-26  
**ステータス**: 承認済み設計  
**対象コンポーネント**: データ収集バッチ (`scripts/scrapers/`), 履歴トラッキング (`data/history/`), 自動化ワークフロー (`.github/workflows/`)

---

## 1. 概要と目的

従来インポートされていた静的 `fetch` ベースのスクレイパーでは、CloudflareやWAFの保護、JavaScriptレンダリングを要する4サイト（SpankBang, TokyoMotion, FC2動画, MissAV）のデータ取得が失敗し、モックデータによる補填が発生していました。
また、日別・週別・月別などの期間別データおよび「過熱度（Heat Score）」がランダム値で計算されており、実際の動画再生数の急上昇度を反映できていませんでした。

本設計では、**Playwright (Headless Chromium)** によるボット保護回避およびDOM動的レンダリング対応と、**履歴スナップショット蓄積による正確な差分実測エンジン**を導入し、完全自動で正確な過熱度ランキングを生成・配信します。

---

## 2. アーキテクチャとデータ収集 (Playwright)

### 2.1 スレイパー仕様
- **ライブラリ**: `playwright` (Chromium Headless)
- **Stealth / 対策回避設定**:
  - `User-Agent`: Chrome 120+ デスクトップ表示
  - `args`: `--disable-blink-features=AutomationControlled`, `--no-sandbox`
  - Cookie / Header 初期化および Age verification (18歳以上同意) の自動適用
- **対象サイト & 抽出セレクター**:
  1. **TokyoMotion**: `https://www.tokyomotion.net/videos?sort=views` (セレクター: `.video-box, .thumb-block`)
  2. **XVideos**: `https://www.xvideos.com/best` (セレクター: `.thumb-block`)
  3. **SpankBang**: `https://spankbang.com/trending_videos` (セレクター: `.video-item`)
  4. **Pornhub**: `https://www.pornhub.com/video?o=ht` (セレクター: `.pcVideoListItem, .videoblock`)
  5. **FC2動画**: `https://video.fc2.com/ja/list/` (セレクター: `.c-videoList_item, .video_item`)
  6. **MissAV**: `https://missav.com/ja/today-hot` (セレクター: `.thumbnail, .thumbnail-container`)

### 2.2 エラーハンドリング & タイムアウト
- 1サイトにつき最大15秒の要素待機 (`waitForSelector`)。
- 失敗時は最大2回のリトライを行い、取得に成功したサイトのデータでランキングを安全に構成。

---

## 3. 履歴スナップショット蓄積 & 過熱度差分計算

### 3.1 履歴ファイル構成
- `data/history/YYYY-MM-DD.json`: 日別の全取得動画スナップショットを蓄積保存。
- 古い履歴はGitで追跡管理。

### 3.2 期間別再生増加数 (Delta) 計算ロジック
- **24時間差分 (`daily_delta`)**: 1日前のスナップショット `YYYY-MM-DD-1d.json` から同一動画 (`url` または `id`) を検索し、
  $$\Delta V_{24h} = V_{\text{現在}} - V_{24\text{時間前}}$$
- **7日 / 30日 / 365日 差分 (`weekly_delta`, `monthly_delta`, `yearly_delta`)**: 同様に 7日前、30日前、365日前のスナップショットと照合。
- **初登場動画のフォールバック**: 過去ログ未登録の動画については、現在の再生数と平均増加ペースから安全な推定差分値を算出。

### 3.3 Heat Score (過熱感) 算定式
$$\text{Heat Score} = \min\left(100, \max\left(50, \text{Math.round}\left(\frac{\Delta V_{24h}}{\log_{10}(V_{\text{全累計}} + 1000) \times 50}\right)\right)\right)$$

---

## 4. GitHub Actions ワークフロー連携

- `.github/workflows/fetch-data.yml`:
  - `npx playwright install --with-deps chromium` ステップを追加。
  - `npm run fetch-data` 実行により `data/rankings.json` と `data/history/` を更新および Git Commit & Push。

---

## 5. 検証手順
1. `node scripts/fetch-data.js` を実行し、6サイトすべての動画（各サイト複数件）が取得できているか出力結果を検証。
2. `data/history/` に日付付きスナップショットが保存され、`data/rankings.json` に実数値ベースの `daily_delta`, `weekly_delta`, `heat_score` が出力されることを確認。
