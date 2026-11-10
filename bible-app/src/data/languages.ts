export type LangKey = "en" | "web" | "zh-hant" | "zh-hans";

export const LANGUAGES: { key: LangKey; label: string; speechLang: string }[] = [
  { key: "en", label: "KJV", speechLang: "en-US" },
  { key: "web", label: "WEB", speechLang: "en-US" },
  { key: "zh-hant", label: "繁體", speechLang: "zh-TW" },
  { key: "zh-hans", label: "简体", speechLang: "zh-CN" },
];

export interface UiStrings {
  chapterEyebrow: string;
  tabScripture: string;
  tabInsights: string;
  sectionLeft: string;
  sectionRight: string;
  aiTag: string;
  backTab: string;
  scriptureNote: string;
  drawerHome: string;
  drawerContents: string;
  drawerSearch: string;
  drawerBookmarks: string;
  drawerPlans: string;
  drawerSettings: string;
  bookmarksTitle: string;
  bookmarksEmptyLabel: string;
  bookmarkLabel: string;
  unbookmarkLabel: string;
  bookmarkAddedToast: string;
  bookmarkRemovedToast: string;
  bookmarkHintToast: string;
  shareLabel: string;
  shareCopiedToast: string;
  shareFailedToast: string;
  selectModeLabel: string;
  selectModeExitLabel: string;
  selectVerseLabel: string;
  selectedVerseLabel: string;
  shareSelectedLabel: string;
  plansTitle: string;
  planBackLabel: string;
  planStartButton: string;
  planResumeButton: string;
  planRestartButton: string;
  planTodayLabel: string;
  planDayTpl: string;
  planProgressTpl: string;
  planMarkCompleteButton: string;
  planMarkedCompleteLabel: string;
  planCompletedLabel: string;
  planAllDoneToast: string;
  planRetentionSectionLabel: string;
  planRetentionToggleLabel: string;
  planRetentionAfterLabel: string;
  planRetentionUnitDays: string;
  planRetentionUnitMonths: string;
  planRetentionUnitYears: string;
  storageFullToast: string;
  contentsTitle: string;
  contentsHint: string;
  goToChapterTpl: string;
  searchTitle: string;
  searchPlaceholder: string;
  scopeAll: string;
  scopeOT: string;
  scopeNT: string;
  recentLabel: string;
  noResults: string;
  fontSizeLabel: string;
  themeLabel: string;
  themeLight: string;
  themeDark: string;
  themeAuto: string;
  aboutLabel: string;
  versionLabel: string;
  listenLabel: string;
  stopLabel: string;
  listenPauseLabel: string;
  listenResumeLabel: string;
  listenFinishedToast: string;
  ttsUnavailable: string;
  loadingLabel: string;
  mapLabel: string;
  mapEnglishSection: string;
  mapChineseSection: string;
  offlineStatusLabel: string;
  offlinePreparingTpl: string;
  offlineReadyLabel: string;
  offlineReadyToast: string;
  updateStatusLabel: string;
  updateCheckButton: string;
  updateCheckingLabel: string;
  updateUpToDateLabel: string;
  updateAvailableLabel: string;
  updateApplyButton: string;
  prevChapterLabel: string;
  nextChapterLabel: string;
  explainSectionLabel: string;
  explainApplicationLabel: string;
  introLabel: string;
  introBackgroundLabel: string;
  introKeyPointsLabel: string;
  introUnavailableLabel: string;
  prevBookLabel: string;
  nextBookLabel: string;
  voiceLabel: string;
  voiceAutoLabel: string;
  voicePreviewLabel: string;
  voiceNoneLabel: string;
  peopleInChapterLabel: string;
  peopleShowMoreTpl: string;
  peopleShowLessLabel: string;
}

export const UI: Record<LangKey, UiStrings> = {
  en: {
    chapterEyebrow: "{book} · Chapter {c}",
    tabScripture: "Scripture",
    tabInsights: "Insights",
    sectionLeft: "3 Main Points",
    sectionRight: "AI-drawn",
    aiTag: "AI deep dive",
    backTab: "Back to chapter",
    scriptureNote: "King James Version · public domain",
    drawerHome: "Home",
    drawerContents: "Contents",
    drawerSearch: "Search",
    drawerBookmarks: "Bookmarks",
    drawerPlans: "Plans",
    drawerSettings: "Settings",
    bookmarksTitle: "Bookmarks",
    bookmarksEmptyLabel: "No bookmarks yet — tap a verse number to save it here.",
    bookmarkLabel: "Bookmark this verse",
    unbookmarkLabel: "Remove bookmark",
    bookmarkAddedToast: "Verse bookmarked",
    bookmarkRemovedToast: "Bookmark removed",
    bookmarkHintToast: "Tip: tap a verse number to bookmark it",
    shareLabel: "Share this verse",
    shareCopiedToast: "Copied to clipboard",
    shareFailedToast: "Couldn't share — try again",
    selectModeLabel: "Select",
    selectModeExitLabel: "Cancel",
    selectVerseLabel: "Select this verse",
    selectedVerseLabel: "Deselect this verse",
    shareSelectedLabel: "Share",
    plansTitle: "Reading Plans",
    planBackLabel: "Plans",
    planStartButton: "Start Plan",
    planResumeButton: "Resume",
    planRestartButton: "Restart",
    planTodayLabel: "Today's Reading",
    planDayTpl: "Day {d} of {total}",
    planProgressTpl: "{done} / {total} days",
    planMarkCompleteButton: "Mark Day Complete",
    planMarkedCompleteLabel: "Done for today",
    planCompletedLabel: "Plan completed",
    planAllDoneToast: "Plan complete — well done!",
    planRetentionSectionLabel: "Reading Plan History",
    planRetentionToggleLabel: "Automatically clean up finished plans",
    planRetentionAfterLabel: "after",
    planRetentionUnitDays: "days",
    planRetentionUnitMonths: "months",
    planRetentionUnitYears: "years",
    storageFullToast: "Storage is full — some data may not be saved",
    contentsTitle: "Contents",
    contentsHint: "Tap a book, then a chapter.",
    goToChapterTpl: "Go to Chapter {c}",
    searchTitle: "Search",
    searchPlaceholder: "Search verses & insights",
    scopeAll: "All",
    scopeOT: "OT",
    scopeNT: "NT",
    recentLabel: "Recent",
    noResults: "No matches found.",
    fontSizeLabel: "Text size",
    themeLabel: "Appearance",
    themeLight: "Light",
    themeDark: "Dark",
    themeAuto: "Auto",
    aboutLabel: "About",
    versionLabel: "Version",
    listenLabel: "Listen",
    stopLabel: "Stop",
    listenPauseLabel: "Pause",
    listenResumeLabel: "Resume",
    listenFinishedToast: "Reached the end — playback stopped.",
    ttsUnavailable: "Voice isn't available on this device/browser.",
    loadingLabel: "Loading…",
    mapLabel: "Map",
    mapEnglishSection: "English",
    mapChineseSection: "Chinese (Traditional / Simplified)",
    offlineStatusLabel: "Offline copy",
    offlinePreparingTpl: "Downloading… {n} / {total} — keep this open on wifi",
    offlineReadyLabel: "Ready — works with no connection",
    offlineReadyToast: "Offline copy ready — you can go offline now.",
    updateStatusLabel: "App updates",
    updateCheckButton: "Check for updates",
    updateCheckingLabel: "Checking…",
    updateUpToDateLabel: "You're on the latest version",
    updateAvailableLabel: "Update available",
    updateApplyButton: "Update now",
    prevChapterLabel: "Previous",
    nextChapterLabel: "Next",
    explainSectionLabel: "Further Insight",
    explainApplicationLabel: "Application:",
    introLabel: "Intro",
    introBackgroundLabel: "Background",
    introKeyPointsLabel: "Key Points",
    introUnavailableLabel: "This book's intro is on the way — check back soon.",
    prevBookLabel: "Previous book",
    nextBookLabel: "Next book",
    voiceLabel: "Voice",
    voiceAutoLabel: "Automatic (recommended)",
    voicePreviewLabel: "Preview",
    voiceNoneLabel: "No voices found for this language on this device.",
    peopleInChapterLabel: "People in this chapter",
    peopleShowMoreTpl: "+{n} more",
    peopleShowLessLabel: "Show less",
  },
  web: {
    chapterEyebrow: "{book} · Chapter {c}",
    tabScripture: "Scripture",
    tabInsights: "Insights",
    sectionLeft: "3 Main Points",
    sectionRight: "AI-drawn",
    aiTag: "AI deep dive",
    backTab: "Back to chapter",
    scriptureNote: "World English Bible · public domain",
    drawerHome: "Home",
    drawerContents: "Contents",
    drawerSearch: "Search",
    drawerBookmarks: "Bookmarks",
    drawerPlans: "Plans",
    drawerSettings: "Settings",
    bookmarksTitle: "Bookmarks",
    bookmarksEmptyLabel: "No bookmarks yet — tap a verse number to save it here.",
    bookmarkLabel: "Bookmark this verse",
    unbookmarkLabel: "Remove bookmark",
    bookmarkAddedToast: "Verse bookmarked",
    bookmarkRemovedToast: "Bookmark removed",
    bookmarkHintToast: "Tip: tap a verse number to bookmark it",
    shareLabel: "Share this verse",
    shareCopiedToast: "Copied to clipboard",
    shareFailedToast: "Couldn't share — try again",
    selectModeLabel: "Select",
    selectModeExitLabel: "Cancel",
    selectVerseLabel: "Select this verse",
    selectedVerseLabel: "Deselect this verse",
    shareSelectedLabel: "Share",
    plansTitle: "Reading Plans",
    planBackLabel: "Plans",
    planStartButton: "Start Plan",
    planResumeButton: "Resume",
    planRestartButton: "Restart",
    planTodayLabel: "Today's Reading",
    planDayTpl: "Day {d} of {total}",
    planProgressTpl: "{done} / {total} days",
    planMarkCompleteButton: "Mark Day Complete",
    planMarkedCompleteLabel: "Done for today",
    planCompletedLabel: "Plan completed",
    planAllDoneToast: "Plan complete — well done!",
    planRetentionSectionLabel: "Reading Plan History",
    planRetentionToggleLabel: "Automatically clean up finished plans",
    planRetentionAfterLabel: "after",
    planRetentionUnitDays: "days",
    planRetentionUnitMonths: "months",
    planRetentionUnitYears: "years",
    storageFullToast: "Storage is full — some data may not be saved",
    contentsTitle: "Contents",
    contentsHint: "Tap a book, then a chapter.",
    goToChapterTpl: "Go to Chapter {c}",
    searchTitle: "Search",
    searchPlaceholder: "Search verses & insights",
    scopeAll: "All",
    scopeOT: "OT",
    scopeNT: "NT",
    recentLabel: "Recent",
    noResults: "No matches found.",
    fontSizeLabel: "Text size",
    themeLabel: "Appearance",
    themeLight: "Light",
    themeDark: "Dark",
    themeAuto: "Auto",
    aboutLabel: "About",
    versionLabel: "Version",
    listenLabel: "Listen",
    stopLabel: "Stop",
    listenPauseLabel: "Pause",
    listenResumeLabel: "Resume",
    listenFinishedToast: "Reached the end — playback stopped.",
    ttsUnavailable: "Voice isn't available on this device/browser.",
    loadingLabel: "Loading…",
    mapLabel: "Map",
    mapEnglishSection: "English",
    mapChineseSection: "Chinese (Traditional / Simplified)",
    offlineStatusLabel: "Offline copy",
    offlinePreparingTpl: "Downloading… {n} / {total} — keep this open on wifi",
    offlineReadyLabel: "Ready — works with no connection",
    offlineReadyToast: "Offline copy ready — you can go offline now.",
    updateStatusLabel: "App updates",
    updateCheckButton: "Check for updates",
    updateCheckingLabel: "Checking…",
    updateUpToDateLabel: "You're on the latest version",
    updateAvailableLabel: "Update available",
    updateApplyButton: "Update now",
    prevChapterLabel: "Previous",
    nextChapterLabel: "Next",
    explainSectionLabel: "Further Insight",
    explainApplicationLabel: "Application:",
    introLabel: "Intro",
    introBackgroundLabel: "Background",
    introKeyPointsLabel: "Key Points",
    introUnavailableLabel: "This book's intro is on the way — check back soon.",
    prevBookLabel: "Previous book",
    nextBookLabel: "Next book",
    voiceLabel: "Voice",
    voiceAutoLabel: "Automatic (recommended)",
    voicePreviewLabel: "Preview",
    voiceNoneLabel: "No voices found for this language on this device.",
    peopleInChapterLabel: "People in this chapter",
    peopleShowMoreTpl: "+{n} more",
    peopleShowLessLabel: "Show less",
  },
  "zh-hant": {
    chapterEyebrow: "{book} · 第 {c} 章",
    tabScripture: "經文",
    tabInsights: "洞見",
    sectionLeft: "三個要點",
    sectionRight: "AI 生成",
    aiTag: "AI 深度解析",
    backTab: "返回本章",
    scriptureNote: "和合本 · 公有領域",
    drawerHome: "首頁",
    drawerContents: "目錄",
    drawerSearch: "搜尋",
    drawerBookmarks: "書籤",
    drawerPlans: "讀經計畫",
    drawerSettings: "設定",
    bookmarksTitle: "書籤",
    bookmarksEmptyLabel: "還沒有書籤——點一下經文編號即可收藏。",
    bookmarkLabel: "收藏這節經文",
    unbookmarkLabel: "移除書籤",
    bookmarkAddedToast: "已加入書籤",
    bookmarkRemovedToast: "已移除書籤",
    bookmarkHintToast: "提示：點一下經文編號即可收藏",
    shareLabel: "分享這節經文",
    shareCopiedToast: "已複製到剪貼簿",
    shareFailedToast: "分享失敗，請重試",
    selectModeLabel: "選取",
    selectModeExitLabel: "取消",
    selectVerseLabel: "選取這節經文",
    selectedVerseLabel: "取消選取這節經文",
    shareSelectedLabel: "分享",
    plansTitle: "讀經計畫",
    planBackLabel: "讀經計畫",
    planStartButton: "開始計畫",
    planResumeButton: "繼續",
    planRestartButton: "重新開始",
    planTodayLabel: "今日進度",
    planDayTpl: "第 {d} 天，共 {total} 天",
    planProgressTpl: "{done} / {total} 天",
    planMarkCompleteButton: "標記今日完成",
    planMarkedCompleteLabel: "今日已完成",
    planCompletedLabel: "計畫已完成",
    planAllDoneToast: "計畫完成了，做得好！",
    planRetentionSectionLabel: "讀經計畫紀錄",
    planRetentionToggleLabel: "自動清除已完成的計畫",
    planRetentionAfterLabel: "經過",
    planRetentionUnitDays: "天",
    planRetentionUnitMonths: "個月",
    planRetentionUnitYears: "年",
    storageFullToast: "儲存空間已滿，部分資料可能無法儲存",
    contentsTitle: "目錄",
    contentsHint: "先選書卷，再選章節。",
    goToChapterTpl: "前往第 {c} 章",
    searchTitle: "搜尋",
    searchPlaceholder: "搜尋經文與要點",
    scopeAll: "全部",
    scopeOT: "舊約",
    scopeNT: "新約",
    recentLabel: "最近搜尋",
    noResults: "沒有找到相符的結果。",
    fontSizeLabel: "文字大小",
    themeLabel: "外觀",
    themeLight: "淺色",
    themeDark: "深色",
    themeAuto: "自動",
    aboutLabel: "關於",
    versionLabel: "版本",
    listenLabel: "朗讀",
    stopLabel: "停止",
    listenPauseLabel: "暫停",
    listenResumeLabel: "繼續",
    listenFinishedToast: "已讀完全部章節，播放已停止。",
    ttsUnavailable: "此裝置或瀏覽器無法使用語音功能。",
    loadingLabel: "載入中……",
    mapLabel: "地圖",
    mapEnglishSection: "英文",
    mapChineseSection: "中文（繁體／簡體）",
    offlineStatusLabel: "離線副本",
    offlinePreparingTpl: "下載中…… {n} / {total}——請保持開啟並連線 Wi-Fi",
    offlineReadyLabel: "已就緒——無需連線即可使用",
    offlineReadyToast: "離線內容已下載完成，現在可以離線使用了。",
    updateStatusLabel: "應用程式更新",
    updateCheckButton: "檢查更新",
    updateCheckingLabel: "檢查中……",
    updateUpToDateLabel: "目前已是最新版本",
    updateAvailableLabel: "有可用更新",
    updateApplyButton: "立即更新",
    prevChapterLabel: "上一章",
    nextChapterLabel: "下一章",
    explainSectionLabel: "延伸解讀",
    explainApplicationLabel: "應用：",
    introLabel: "簡介",
    introBackgroundLabel: "背景",
    introKeyPointsLabel: "重點",
    introUnavailableLabel: "這卷書的簡介還在準備中，請稍後再回來看看。",
    prevBookLabel: "上一卷書",
    nextBookLabel: "下一卷書",
    voiceLabel: "語音",
    voiceAutoLabel: "自動（建議）",
    voicePreviewLabel: "試聽",
    voiceNoneLabel: "此裝置上找不到這個語言的語音。",
    peopleInChapterLabel: "本章人物",
    peopleShowMoreTpl: "還有 {n} 位",
    peopleShowLessLabel: "收合",
  },
  "zh-hans": {
    chapterEyebrow: "{book} · 第 {c} 章",
    tabScripture: "经文",
    tabInsights: "洞见",
    sectionLeft: "三个要点",
    sectionRight: "AI 生成",
    aiTag: "AI 深度解析",
    backTab: "返回本章",
    scriptureNote: "和合本 · 公有领域",
    drawerHome: "首页",
    drawerContents: "目录",
    drawerSearch: "搜索",
    drawerBookmarks: "书签",
    drawerPlans: "读经计划",
    drawerSettings: "设置",
    bookmarksTitle: "书签",
    bookmarksEmptyLabel: "还没有书签——点一下经文编号即可收藏。",
    bookmarkLabel: "收藏这节经文",
    unbookmarkLabel: "移除书签",
    bookmarkAddedToast: "已加入书签",
    bookmarkRemovedToast: "已移除书签",
    bookmarkHintToast: "提示：点一下经文编号即可收藏",
    shareLabel: "分享这节经文",
    shareCopiedToast: "已复制到剪贴板",
    shareFailedToast: "分享失败，请重试",
    selectModeLabel: "选取",
    selectModeExitLabel: "取消",
    selectVerseLabel: "选取这节经文",
    selectedVerseLabel: "取消选取这节经文",
    shareSelectedLabel: "分享",
    plansTitle: "读经计划",
    planBackLabel: "读经计划",
    planStartButton: "开始计划",
    planResumeButton: "继续",
    planRestartButton: "重新开始",
    planTodayLabel: "今日进度",
    planDayTpl: "第 {d} 天，共 {total} 天",
    planProgressTpl: "{done} / {total} 天",
    planMarkCompleteButton: "标记今日完成",
    planMarkedCompleteLabel: "今日已完成",
    planCompletedLabel: "计划已完成",
    planAllDoneToast: "计划完成了，做得好！",
    planRetentionSectionLabel: "读经计划记录",
    planRetentionToggleLabel: "自动清除已完成的计划",
    planRetentionAfterLabel: "经过",
    planRetentionUnitDays: "天",
    planRetentionUnitMonths: "个月",
    planRetentionUnitYears: "年",
    storageFullToast: "存储空间已满，部分数据可能无法保存",
    contentsTitle: "目录",
    contentsHint: "先选书卷，再选章节。",
    goToChapterTpl: "前往第 {c} 章",
    searchTitle: "搜索",
    searchPlaceholder: "搜索经文与要点",
    scopeAll: "全部",
    scopeOT: "旧约",
    scopeNT: "新约",
    recentLabel: "最近搜索",
    noResults: "没有找到相符的结果。",
    fontSizeLabel: "文字大小",
    themeLabel: "外观",
    themeLight: "浅色",
    themeDark: "深色",
    themeAuto: "自动",
    aboutLabel: "关于",
    versionLabel: "版本",
    listenLabel: "朗读",
    stopLabel: "停止",
    listenPauseLabel: "暂停",
    listenResumeLabel: "继续",
    listenFinishedToast: "已读完全部章节，播放已停止。",
    ttsUnavailable: "此设备或浏览器无法使用语音功能。",
    loadingLabel: "载入中……",
    mapLabel: "地图",
    mapEnglishSection: "英文",
    mapChineseSection: "中文（繁体／简体）",
    offlineStatusLabel: "离线副本",
    offlinePreparingTpl: "下载中…… {n} / {total}——请保持开启并连接 Wi-Fi",
    offlineReadyLabel: "已就绪——无需联网即可使用",
    offlineReadyToast: "离线内容已下载完成，现在可以离线使用了。",
    updateStatusLabel: "应用更新",
    updateCheckButton: "检查更新",
    updateCheckingLabel: "检查中……",
    updateUpToDateLabel: "目前已是最新版本",
    updateAvailableLabel: "有可用更新",
    updateApplyButton: "立即更新",
    prevChapterLabel: "上一章",
    nextChapterLabel: "下一章",
    explainSectionLabel: "延伸解读",
    explainApplicationLabel: "应用：",
    introLabel: "简介",
    introBackgroundLabel: "背景",
    introKeyPointsLabel: "重点",
    introUnavailableLabel: "这卷书的简介还在准备中，请稍后再回来看看。",
    prevBookLabel: "上一卷书",
    nextBookLabel: "下一卷书",
    voiceLabel: "语音",
    voiceAutoLabel: "自动（建议）",
    voicePreviewLabel: "试听",
    voiceNoneLabel: "此设备上找不到这个语言的语音。",
    peopleInChapterLabel: "本章人物",
    peopleShowMoreTpl: "还有 {n} 位",
    peopleShowLessLabel: "收合",
  },
};

export function fmt(tpl: string, vals: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vals[k] ?? ""));
}
