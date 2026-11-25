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
  tabDevotional: string;
  devotionalEmptyLabel: string;
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
  drawerNotes: string;
  drawerSettings: string;
  bookmarksTitle: string;
  bookmarksEmptyLabel: string;
  bookmarkLabel: string;
  unbookmarkLabel: string;
  bookmarkAddedToast: string;
  bookmarkRemovedToast: string;
  bookmarkHintToast: string;
  verseNoteLabel: string;
  notesTitle: string;
  notesEmptyLabel: string;
  noteEditorTitle: string;
  noteColorLabel: string;
  noteColorNone: string;
  noteColorYellow: string;
  noteColorGreen: string;
  noteColorBlue: string;
  noteColorPink: string;
  noteTextPlaceholder: string;
  noteCharCountTpl: string;
  noteSaveLabel: string;
  noteDeleteLabel: string;
  noteSavedToast: string;
  noteDeletedToast: string;
  noteRetentionSectionLabel: string;
  noteRetentionToggleLabel: string;
  redLetterSectionLabel: string;
  redLetterToggleLabel: string;
  shareLabel: string;
  shareCopiedToast: string;
  shareFailedToast: string;
  selectModeLabel: string;
  selectModeExitLabel: string;
  selectVerseLabel: string;
  selectedVerseLabel: string;
  shareSelectedLabel: string;
  compareToggleLabel: string;
  compareLabel: string;
  xrefSeeAlsoLabel: string;
  xrefRefTpl: string;
  xrefRefRangeTpl: string;
  backToTpl: string;
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
  searchUnavailableOffline: string;
  fontSizeLabel: string;
  themeLabel: string;
  themeLight: string;
  themeDark: string;
  themeAuto: string;
  aboutLabel: string;
  versionLabel: string;
  creditsButtonLabel: string;
  creditsTitle: string;
  creditsIntro: string;
  creditsKjvHeading: string;
  creditsKjvBody: string;
  creditsWebHeading: string;
  creditsWebBody: string;
  creditsCuvHeading: string;
  creditsCuvBody: string;
  creditsInsightsHeading: string;
  creditsInsightsBody: string;
  creditsXrefHeading: string;
  creditsXrefBody: string;
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
  mapTempleSection: string;
  mapTempleAlt: string;
  mapTempleAltZhSame: string;
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
    tabDevotional: "Devotional",
    devotionalEmptyLabel: "A devotional for this chapter is coming soon.",
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
    drawerNotes: "Highlights & Notes",
    drawerSettings: "Settings",
    bookmarksTitle: "Bookmarks",
    bookmarksEmptyLabel: "No bookmarks yet — tap a verse number to save it here.",
    bookmarkLabel: "Bookmark this verse",
    unbookmarkLabel: "Remove bookmark",
    bookmarkAddedToast: "Verse bookmarked",
    bookmarkRemovedToast: "Bookmark removed",
    bookmarkHintToast: "Tip: tap a verse number to bookmark it",
    verseNoteLabel: "Highlight or add a note",
    notesTitle: "Highlights & Notes",
    notesEmptyLabel: "No highlights or notes yet — tap any verse's text to add one.",
    noteEditorTitle: "Highlight & Note",
    noteColorLabel: "Highlight",
    noteColorNone: "None",
    noteColorYellow: "Yellow",
    noteColorGreen: "Green",
    noteColorBlue: "Blue",
    noteColorPink: "Pink",
    noteTextPlaceholder: "Write a note…",
    noteCharCountTpl: "{n}/{max}",
    noteSaveLabel: "Save",
    noteDeleteLabel: "Delete",
    noteSavedToast: "Saved",
    noteDeletedToast: "Removed",
    noteRetentionSectionLabel: "Highlights & Notes History",
    noteRetentionToggleLabel: "Automatically clean up old notes",
    redLetterSectionLabel: "Red Letter",
    redLetterToggleLabel: "Show Jesus's words in red",
    shareLabel: "Share this verse",
    shareCopiedToast: "Copied to clipboard",
    shareFailedToast: "Couldn't share — try again",
    selectModeLabel: "Select",
    selectModeExitLabel: "Cancel",
    selectVerseLabel: "Select this verse",
    selectedVerseLabel: "Deselect this verse",
    shareSelectedLabel: "Share",
    compareToggleLabel: "Compare versions",
    compareLabel: "Compare with",
    xrefSeeAlsoLabel: "See also",
    xrefRefTpl: "{book} {c}:{v}",
    xrefRefRangeTpl: "{book} {c}:{v}-{e}",
    backToTpl: "Back to {ref}",
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
    searchUnavailableOffline: "Search isn't available offline yet — connect to the internet once to download it.",
    fontSizeLabel: "Text size",
    themeLabel: "Appearance",
    themeLight: "Light",
    themeDark: "Dark",
    themeAuto: "Auto",
    aboutLabel: "About",
    versionLabel: "Version",
    creditsButtonLabel: "Credits",
    creditsTitle: "Credits",
    creditsIntro: "This app uses the following public-domain translations and original content:",
    creditsKjvHeading: "King James Version (KJV)",
    creditsKjvBody: "Public domain. Sourced from the aruljohn/Bible-kjv dataset.",
    creditsWebHeading: "World English Bible (WEB)",
    creditsWebBody: "Public domain -- dedicated to the public domain by its translators. Sourced from the TehShrike/world-english-bible dataset. This app renders the Hebrew divine name (YHWH) as “Jehovah” rather than the original WEB's “Yahweh”, to match the transliteration used in the Chinese text below.",
    creditsCuvHeading: "和合本 (Chinese Union Version, Traditional & Simplified)",
    creditsCuvBody: "Public domain (published 1919). Traditional text sourced from the zh/cuv dataset (MaatheusGois/bible); the Simplified text is mechanically derived from the Traditional original via OpenCC, the standard tool for this conversion. A handful of archaic 1919 proper-noun spellings (Lebanon, Spain, Damascus, Crete, Cyprus, and the title “Caesar”) have been updated to the modern standard spelling used throughout contemporary Chinese publishing, e.g. 利巴嫩 → 黎巴嫩 for Lebanon. Separately, a naive character-by-character Simplified rendering of “Italy” (义大利) was corrected to the actual Mainland standard term, 意大利.",
    creditsInsightsHeading: "AI Insights, Explanations & Devotionals",
    creditsInsightsBody: "Original commentary written for this app -- not sourced from any translation or outside work.",
    creditsXrefHeading: "Cross-References",
    creditsXrefBody: "\"See also\" suggestions are drawn from OpenBible.info's community cross-reference dataset (CC BY 2016), trimmed to the most strongly supported references.",
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
    mapTempleSection: "Temple of the LORD — Diagram",
    mapTempleAlt: "Diagram of the Temple of the LORD: exterior view 60 cubits long, 20 cubits wide, and 30 cubits high (about 90 by 30 by 45 feet); floor plan showing the 20-by-10-cubit porch, the 40-by-20-cubit Holy Place, and the 20-by-20-cubit Most Holy Place, for a total length of 70 cubits; a cross-section showing the veil between the Holy Place and Most Holy Place, with 10-cubit cherubim; and the temple courtyard with the bronze altar (about 15 feet high) and the bronze sea (about 5 feet high and 10 feet across).",
    mapTempleAltZhSame: "The same temple diagram, with its labels in Chinese instead of English.",
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
    tabDevotional: "Devotional",
    devotionalEmptyLabel: "A devotional for this chapter is coming soon.",
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
    drawerNotes: "Highlights & Notes",
    drawerSettings: "Settings",
    bookmarksTitle: "Bookmarks",
    bookmarksEmptyLabel: "No bookmarks yet — tap a verse number to save it here.",
    bookmarkLabel: "Bookmark this verse",
    unbookmarkLabel: "Remove bookmark",
    bookmarkAddedToast: "Verse bookmarked",
    bookmarkRemovedToast: "Bookmark removed",
    bookmarkHintToast: "Tip: tap a verse number to bookmark it",
    verseNoteLabel: "Highlight or add a note",
    notesTitle: "Highlights & Notes",
    notesEmptyLabel: "No highlights or notes yet — tap any verse's text to add one.",
    noteEditorTitle: "Highlight & Note",
    noteColorLabel: "Highlight",
    noteColorNone: "None",
    noteColorYellow: "Yellow",
    noteColorGreen: "Green",
    noteColorBlue: "Blue",
    noteColorPink: "Pink",
    noteTextPlaceholder: "Write a note…",
    noteCharCountTpl: "{n}/{max}",
    noteSaveLabel: "Save",
    noteDeleteLabel: "Delete",
    noteSavedToast: "Saved",
    noteDeletedToast: "Removed",
    noteRetentionSectionLabel: "Highlights & Notes History",
    noteRetentionToggleLabel: "Automatically clean up old notes",
    redLetterSectionLabel: "Red Letter",
    redLetterToggleLabel: "Show Jesus's words in red",
    shareLabel: "Share this verse",
    shareCopiedToast: "Copied to clipboard",
    shareFailedToast: "Couldn't share — try again",
    selectModeLabel: "Select",
    selectModeExitLabel: "Cancel",
    selectVerseLabel: "Select this verse",
    selectedVerseLabel: "Deselect this verse",
    shareSelectedLabel: "Share",
    compareToggleLabel: "Compare versions",
    compareLabel: "Compare with",
    xrefSeeAlsoLabel: "See also",
    xrefRefTpl: "{book} {c}:{v}",
    xrefRefRangeTpl: "{book} {c}:{v}-{e}",
    backToTpl: "Back to {ref}",
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
    searchUnavailableOffline: "Search isn't available offline yet — connect to the internet once to download it.",
    fontSizeLabel: "Text size",
    themeLabel: "Appearance",
    themeLight: "Light",
    themeDark: "Dark",
    themeAuto: "Auto",
    aboutLabel: "About",
    versionLabel: "Version",
    creditsButtonLabel: "Credits",
    creditsTitle: "Credits",
    creditsIntro: "This app uses the following public-domain translations and original content:",
    creditsKjvHeading: "King James Version (KJV)",
    creditsKjvBody: "Public domain. Sourced from the aruljohn/Bible-kjv dataset.",
    creditsWebHeading: "World English Bible (WEB)",
    creditsWebBody: "Public domain -- dedicated to the public domain by its translators. Sourced from the TehShrike/world-english-bible dataset. This app renders the Hebrew divine name (YHWH) as “Jehovah” rather than the original WEB's “Yahweh”, to match the transliteration used in the Chinese text below.",
    creditsCuvHeading: "和合本 (Chinese Union Version, Traditional & Simplified)",
    creditsCuvBody: "Public domain (published 1919). Traditional text sourced from the zh/cuv dataset (MaatheusGois/bible); the Simplified text is mechanically derived from the Traditional original via OpenCC, the standard tool for this conversion. A handful of archaic 1919 proper-noun spellings (Lebanon, Spain, Damascus, Crete, Cyprus, and the title “Caesar”) have been updated to the modern standard spelling used throughout contemporary Chinese publishing, e.g. 利巴嫩 → 黎巴嫩 for Lebanon. Separately, a naive character-by-character Simplified rendering of “Italy” (义大利) was corrected to the actual Mainland standard term, 意大利.",
    creditsInsightsHeading: "AI Insights, Explanations & Devotionals",
    creditsInsightsBody: "Original commentary written for this app -- not sourced from any translation or outside work.",
    creditsXrefHeading: "Cross-References",
    creditsXrefBody: "\"See also\" suggestions are drawn from OpenBible.info's community cross-reference dataset (CC BY 2016), trimmed to the most strongly supported references.",
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
    mapTempleSection: "Temple of the LORD — Diagram",
    mapTempleAlt: "Diagram of the Temple of the LORD: exterior view 60 cubits long, 20 cubits wide, and 30 cubits high (about 90 by 30 by 45 feet); floor plan showing the 20-by-10-cubit porch, the 40-by-20-cubit Holy Place, and the 20-by-20-cubit Most Holy Place, for a total length of 70 cubits; a cross-section showing the veil between the Holy Place and Most Holy Place, with 10-cubit cherubim; and the temple courtyard with the bronze altar (about 15 feet high) and the bronze sea (about 5 feet high and 10 feet across).",
    mapTempleAltZhSame: "The same temple diagram, with its labels in Chinese instead of English.",
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
    tabDevotional: "靈修",
    devotionalEmptyLabel: "本章的靈修內容即將推出。",
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
    drawerNotes: "標記與筆記",
    drawerSettings: "設定",
    bookmarksTitle: "書籤",
    bookmarksEmptyLabel: "還沒有書籤——點一下經文編號即可收藏。",
    bookmarkLabel: "收藏這節經文",
    unbookmarkLabel: "移除書籤",
    bookmarkAddedToast: "已加入書籤",
    bookmarkRemovedToast: "已移除書籤",
    bookmarkHintToast: "提示：點一下經文編號即可收藏",
    verseNoteLabel: "標記或新增筆記",
    notesTitle: "標記與筆記",
    notesEmptyLabel: "還沒有標記或筆記——點一下經文內容即可新增。",
    noteEditorTitle: "標記與筆記",
    noteColorLabel: "標記顏色",
    noteColorNone: "無",
    noteColorYellow: "黃色",
    noteColorGreen: "綠色",
    noteColorBlue: "藍色",
    noteColorPink: "粉色",
    noteTextPlaceholder: "寫下筆記…",
    noteCharCountTpl: "{n}/{max}",
    noteSaveLabel: "儲存",
    noteDeleteLabel: "刪除",
    noteSavedToast: "已儲存",
    noteDeletedToast: "已刪除",
    noteRetentionSectionLabel: "標記與筆記紀錄",
    noteRetentionToggleLabel: "自動清除舊的筆記",
    redLetterSectionLabel: "紅字版",
    redLetterToggleLabel: "以紅色顯示耶穌的話語",
    shareLabel: "分享這節經文",
    shareCopiedToast: "已複製到剪貼簿",
    shareFailedToast: "分享失敗，請重試",
    selectModeLabel: "選取",
    selectModeExitLabel: "取消",
    selectVerseLabel: "選取這節經文",
    selectedVerseLabel: "取消選取這節經文",
    shareSelectedLabel: "分享",
    compareToggleLabel: "版本對照",
    compareLabel: "對照版本",
    xrefSeeAlsoLabel: "參見",
    xrefRefTpl: "{book} {c}:{v}",
    xrefRefRangeTpl: "{book} {c}:{v}-{e}",
    backToTpl: "返回{ref}",
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
    searchUnavailableOffline: "搜尋功能尚未離線可用——請先連上網路一次，以下載搜尋資料。",
    fontSizeLabel: "文字大小",
    themeLabel: "外觀",
    themeLight: "淺色",
    themeDark: "深色",
    themeAuto: "自動",
    aboutLabel: "關於",
    versionLabel: "版本",
    creditsButtonLabel: "版本來源",
    creditsTitle: "版本來源與授權",
    creditsIntro: "本應用程式使用以下公有領域譯本及原創內容：",
    creditsKjvHeading: "英王詹姆士譯本（KJV）",
    creditsKjvBody: "公有領域。文字取自 aruljohn/Bible-kjv 資料集。",
    creditsWebHeading: "世界英語聖經（WEB）",
    creditsWebBody: "公有領域，譯者已將全文獻入公有領域。文字取自 TehShrike/world-english-bible 資料集。本應用程式將原文中代表希伯來文聖名（YHWH）的〔Yahweh〕改為〔Jehovah〕，以配合下方中文譯本採用的音譯方式（耶和華）。",
    creditsCuvHeading: "和合本（繁體／簡體）",
    creditsCuvBody: "公有領域（1919年出版）。繁體文字取自 zh/cuv 資料集（MaatheusGois/bible）；簡體文字則透過 OpenCC（業界標準轉換工具）由繁體原文機械轉換而成。另外，本應用程式已將數個1919年版和合本的舊式地名音譯（利巴嫩、士班雅、大馬色、革哩底、居比路）及稱謂「該撒」，更新為現代中文出版品通用的標準寫法，例如「利巴嫩」改為「黎巴嫩」。此外，簡體文字曾誤將「義大利」機械轉換為「义大利」，已更正為中國大陸標準用詞「意大利」。",
    creditsInsightsHeading: "AI 洞見、解經與靈修內容",
    creditsInsightsBody: "本應用程式原創撰寫的註釋內容，並非取自任何譯本或其他著作。",
    creditsXrefHeading: "交叉引用",
    creditsXrefBody: "「參見」交叉引用建議取自 OpenBible.info 的社群交叉引用資料集（CC BY 2016 授權），並篩選至獲得最多認同的部分。",
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
    mapTempleSection: "耶和華的殿 — 圖解",
    mapTempleAlt: "耶和華的殿圖解：外觀長60肘、寬20肘、高30肘（約90×30×45英尺）；平面圖顯示門廊20×10肘、聖所40×20肘、至聖所20×20肘，全長70肘；剖面圖顯示聖所與至聖所之間的幔子，以及高10肘的基路伯；院子中有銅祭壇（高約15英尺）與銅海（高約5英尺，直徑10英尺）。",
    mapTempleAltZhSame: "同一份聖殿圖解，標示改為中文。",
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
    tabDevotional: "灵修",
    devotionalEmptyLabel: "本章的灵修内容即将推出。",
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
    drawerNotes: "标记与笔记",
    drawerSettings: "设置",
    bookmarksTitle: "书签",
    bookmarksEmptyLabel: "还没有书签——点一下经文编号即可收藏。",
    bookmarkLabel: "收藏这节经文",
    unbookmarkLabel: "移除书签",
    bookmarkAddedToast: "已加入书签",
    bookmarkRemovedToast: "已移除书签",
    bookmarkHintToast: "提示：点一下经文编号即可收藏",
    verseNoteLabel: "标记或添加笔记",
    notesTitle: "标记与笔记",
    notesEmptyLabel: "还没有标记或笔记——点一下经文内容即可添加。",
    noteEditorTitle: "标记与笔记",
    noteColorLabel: "标记颜色",
    noteColorNone: "无",
    noteColorYellow: "黄色",
    noteColorGreen: "绿色",
    noteColorBlue: "蓝色",
    noteColorPink: "粉色",
    noteTextPlaceholder: "写下笔记…",
    noteCharCountTpl: "{n}/{max}",
    noteSaveLabel: "保存",
    noteDeleteLabel: "删除",
    noteSavedToast: "已保存",
    noteDeletedToast: "已删除",
    noteRetentionSectionLabel: "标记与笔记记录",
    noteRetentionToggleLabel: "自动清除旧的笔记",
    redLetterSectionLabel: "红字版",
    redLetterToggleLabel: "以红色显示耶稣的话语",
    shareLabel: "分享这节经文",
    shareCopiedToast: "已复制到剪贴板",
    shareFailedToast: "分享失败，请重试",
    selectModeLabel: "选取",
    selectModeExitLabel: "取消",
    selectVerseLabel: "选取这节经文",
    selectedVerseLabel: "取消选取这节经文",
    shareSelectedLabel: "分享",
    compareToggleLabel: "版本对照",
    compareLabel: "对照版本",
    xrefSeeAlsoLabel: "参见",
    xrefRefTpl: "{book} {c}:{v}",
    xrefRefRangeTpl: "{book} {c}:{v}-{e}",
    backToTpl: "返回{ref}",
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
    searchUnavailableOffline: "搜索功能尚未离线可用——请先连上网络一次，以下载搜索数据。",
    fontSizeLabel: "文字大小",
    themeLabel: "外观",
    themeLight: "浅色",
    themeDark: "深色",
    themeAuto: "自动",
    aboutLabel: "关于",
    versionLabel: "版本",
    creditsButtonLabel: "版本来源",
    creditsTitle: "版本来源与授权",
    creditsIntro: "本应用程序使用以下公有领域译本及原创内容：",
    creditsKjvHeading: "英王詹姆士译本（KJV）",
    creditsKjvBody: "公有领域。文字取自 aruljohn/Bible-kjv 数据集。",
    creditsWebHeading: "世界英语圣经（WEB）",
    creditsWebBody: "公有领域，译者已将全文献入公有领域。文字取自 TehShrike/world-english-bible 数据集。本应用程序将原文中代表希伯来文圣名（YHWH）的〔Yahweh〕改为〔Jehovah〕，以配合下方中文译本采用的音译方式（耶和华）。",
    creditsCuvHeading: "和合本（繁体/简体）",
    creditsCuvBody: "公有领域（1919年出版）。繁体文字取自 zh/cuv 数据集（MaatheusGois/bible）；简体文字则通过 OpenCC（行业标准转换工具）由繁体原文机械转换而成。另外，本应用程序已将数个1919年版和合本的旧式地名音译（利巴嫩、士班雅、大马色、革哩底、居比路）及称谓「该撒」，更新为现代中文出版品通用的标准写法，例如「利巴嫩」改为「黎巴嫩」。此外，简体文字曾误将「義大利」机械转换为「义大利」，已更正为中国大陆标准用词「意大利」。",
    creditsInsightsHeading: "AI 洞见、解经与灵修内容",
    creditsInsightsBody: "本应用程序原创撰写的注释内容，并非取自任何译本或其他著作。",
    creditsXrefHeading: "交叉引用",
    creditsXrefBody: "“参见”交叉引用建议取自 OpenBible.info 的社区交叉引用数据集（CC BY 2016 授权），并筛选至获得最多认同的部分。",
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
    mapTempleSection: "耶和华的殿 — 图解",
    mapTempleAlt: "耶和华的殿图解：外观长60肘、宽20肘、高30肘（约90×30×45英尺）；平面图显示门廊20×10肘、圣所40×20肘、至圣所20×20肘，全长70肘；剖面图显示圣所与至圣所之间的幔子，以及高10肘的基路伯；院子中有铜祭坛（高约15英尺）与铜海（高约5英尺，直径10英尺）。",
    mapTempleAltZhSame: "同一份圣殿图解，标示改为中文。",
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
