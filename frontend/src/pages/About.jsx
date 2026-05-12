/**
 * 【頁面說明】About.jsx — 本廟簡介頁
 *
 * 展示廟宇的詳細介紹：廟宇照片、建廟影片（可選）、廟宇歷史、基本資訊、入廟須知。
 *
 * 學習重點：
 *   - useEffect + [] 空陣列：進頁面時捲到頂端，只執行一次
 *   - useSettings：取得後台設定的自訂 Hook
 *   - 條件渲染：依影片類型決定渲染 <iframe> 或 <video>
 *   - .map() 渲染物件陣列與字串陣列
 */

// useSettings：取得後台設定值（廟名、地址、電話等）的自訂 Hook
import { useSettings } from '../context/SettingsContext';
import SEOHead from '../components/SEOHead';
// PageTitle：共用的「大標題 + 金色裝飾分隔線」元件
import PageTitle from '../components/PageTitle';
// useScrollToTop：自訂 Hook，進頁面時自動捲到最頂端
import useScrollToTop from '../hooks/useScrollToTop';

// 工具函式：判斷影片連結類型，回傳 'youtube'、'direct' 或 null
function getVideoType(url) {
  if (!url) return null; // 若網址為空，回傳 null（不顯示影片區塊）
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  // 正規表達式：判斷結尾是否為 .mp4、.webm、.mov
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return 'direct';
  return null;
}

// 工具函式：將各種 YouTube 連結格式轉成可嵌入的 embed URL
function toYouTubeEmbed(url) {
  if (url.includes('youtube.com/embed/')) return url; // 已是 embed 格式
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/); // 短網址 youtu.be/ID
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const watchMatch = url.match(/[?&]v=([^?&]+)/); // 標準格式 ?v=ID
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  return url;
}

export default function About() {
  // useSettings()：從 SettingsContext 讀取全域設定物件
  const settings = useSettings();

  // useScrollToTop()：進入頁面時捲到最頂端（自訂 Hook）
  // 取代原本的 useEffect(() => window.scrollTo(0,0), [])，更簡潔
  useScrollToTop();

  return (
    // max-w-5xl：最大寬度 64rem；mx-auto：水平置中；px-4 py-12：內距
    <main className="max-w-5xl mx-auto px-4 py-12">
      <SEOHead title="本廟簡介" />

      {/*
        PageTitle：共用的頁面標題元件
        className="mb-12" 覆蓋預設的 mb-10，讓標題下方有更多間距
      */}
      <PageTitle title="本廟簡介" className="mb-12" />

      {/* ── 廟宇照片（兩張並排）──────────────────────────────────
          grid md:grid-cols-2：桌面版兩欄，手機版單欄
          h-56：固定高度 14rem（讓兩張圖等高）
          object-cover：圖片裁切填滿，不變形
      */}
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        <img
          src="https://picsum.photos/seed/temple_main/600/400"
          alt="廟宇正面"
          className="w-full h-56 object-cover rounded-sm shadow-md border-2 border-temple-gold/30"
        />
        <img
          src="https://picsum.photos/seed/temple_hall/600/400"
          alt="正殿內部"
          className="w-full h-56 object-cover rounded-sm shadow-md border-2 border-temple-gold/30"
        />
      </div>

      {/* ── 建廟過程影片（有填網址才顯示）────────────────────────
          條件渲染寫法：{條件 && <元素 />}
          getVideoType() 若回傳非 null → 才渲染此 <section>
      */}
      {getVideoType(settings.intro_video_url) && (
        <section className="temple-card p-6 md:p-8 mb-8">
          <h2 className="font-serif text-xl text-temple-green mb-4 border-b border-temple-gold/30 pb-2">
            建廟過程
          </h2>
          {/* 16:9 響應式影片容器：relative + paddingTop 56.25% + absolute inset-0 */}
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            {/*
              三元運算子條件渲染：
              語法：{條件 ? 成立時的 JSX : 不成立時的 JSX}
              youtube → 渲染 <iframe>（嵌入式播放器）
              否則   → 渲染 <video>（原生播放器）
            */}
            {getVideoType(settings.intro_video_url) === 'youtube' ? (
              // absolute inset-0：絕對定位，上下左右都是 0，填滿容器
              <iframe
                className="absolute inset-0 w-full h-full rounded-sm"
                src={toYouTubeEmbed(settings.intro_video_url)}
                title="建廟過程影片"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                className="absolute inset-0 w-full h-full rounded-sm"
                src={settings.intro_video_url}
                controls
                preload="metadata"
              />
            )}
          </div>
        </section>
      )}

      {/* ── 廟宇歷史文字 ─────────────────────────────────────────
          leading-relaxed：行高 1.625（較寬鬆，適合長文）
          whitespace-pre-line：保留後台輸入的換行符號（\n）
          text-justify：兩端對齊
      */}
      <section className="temple-card p-6 md:p-8 mb-8">
        <h2 className="font-serif text-xl text-temple-green mb-4 border-b border-temple-gold/30 pb-2">
          廟宇歷史
        </h2>
        <p className="text-gray-700 leading-relaxed text-justify whitespace-pre-line">
          {settings.about_text || '載入中...'}
        </p>
      </section>

      {/* ── 基本資訊 ─────────────────────────────────────────────
          <dl> <dt> <dd>：HTML 定義清單語義化標籤
          grid-cols-1 sm:grid-cols-2：手機單欄，小螢幕(640px+)兩欄
      */}
      <section className="temple-card p-6 md:p-8 mb-8">
        <h2 className="font-serif text-xl text-temple-green mb-4 border-b border-temple-gold/30 pb-2">
          基本資訊
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/*
            .map() 渲染資料物件陣列：
              先建立陣列，再 .map() 轉成 JSX
              { label, value }：解構賦值，直接取出物件屬性
              key={label}：用 label 字串作為唯一 key
          */}
          {[
            { label: '廟名', value: settings.site_name },
            { label: '主祀神明', value: settings.main_deity },
            { label: '創建年份', value: settings.founding_year },
            { label: '開放時間', value: settings.open_hours },
            { label: '地址', value: settings.address },
            { label: '電話', value: settings.phone },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-2">
              {/* shrink-0：禁止縮小；w-20：固定寬度讓所有 label 對齊 */}
              <dt className="shrink-0 text-sm font-medium text-temple-green-dark w-20">{label}</dt>
              {/* value || '—'：若無資料則顯示破折號 */}
              <dd className="text-sm text-gray-700">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── 入廟須知 ─────────────────────────────────────────────
          space-y-2：清單項目間垂直間距 0.5rem
          .map((item, idx))：
            item：字串內容；idx：元素的索引（0, 1, 2, ...）
            key={idx}：字串無唯一 id，用索引作 key（靜態清單可以這樣做）
      */}
      <section className="temple-card p-6 md:p-8">
        <h2 className="font-serif text-xl text-temple-green mb-4 border-b border-temple-gold/30 pb-2">
          入廟須知
        </h2>
        <ul className="space-y-2 text-sm text-gray-700">
          {[
            '請著整齊服裝，勿穿著暴露或破損衣物入廟',
            '廟內請保持安靜，勿高聲喧嘩嬉戲',
            '禁止在廟內飲食（供品除外）',
            '請勿隨意觸碰神像及祭祀器具',
            '拍照前請先徵得廟方人員同意',
            '廟內嚴禁吸菸及飲酒',
            '寵物請繫牽繩並注意清潔，避免進入主殿',
            '請依禮俗順序禮拜，勿搶先或插隊',
            '如需問事或點光明燈，請向服務人員詢問',
            '廟內嚴禁賭博及一切不法行為',
          ].map((item, idx) => (
            <li key={idx} className="flex gap-2">
              {/* shrink-0：讓菱形符號不被壓縮 */}
              <span className="shrink-0 text-temple-gold">◆</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
