export function getDailyKanjiRoute() {
    return `${process.env.REACT_APP_BACKEND ? process.env.REACT_APP_BACKEND : ''}/dailyKanji`;
}

export function getDailyVocabRoute(kanji) {
    return `${process.env.REACT_APP_BACKEND ? process.env.REACT_APP_BACKEND : ''}/vocabForKanji?kanji=${kanji}`;
}