// One-time data fix for the "دروس حياة المؤمن (ياسر الدوسري)" podcast folder,
// same Dropbox raw=1 fix as aqeedaEpisodesFix.js. The 11 links the user
// supplied have no episode number in the filename, so they're matched here
// by list order against the folder's existing 11 episodes in creation order
// (the same order the admin panel lists them in) — double-check the titles
// below against the intended lesson order before running the fix button.

const MUMEN_FOLDER_ID = 'VPn62PYtOySOoMTbDLeQ'

const mumenEpisodesFix = {
    folderId: MUMEN_FOLDER_ID,
    episodes: [
        { docId: 'Iqvv9AOxnaSBoF3lqZp9', title: 'النية الخالصة لله', audioUrl: 'https://www.dropbox.com/scl/fi/ukamqfrcbljma0gmbv92t/.mp3?rlkey=8lin44go6qsomif54ulutsbfd&st=xkn8fbyp&raw=1' },
        { docId: 'RrpLsHNWGfmK8riDNsxC', title: 'الشكر', audioUrl: 'https://www.dropbox.com/scl/fi/rylfzrwp3rz0gxlfewrwx/.mp3?rlkey=gjq5mf1d649uxgn10vo2jfsfq&st=vtahjva1&raw=1' },
        { docId: 'uCKRta3AUD9FuwWNiSaA', title: 'المسميات الباطلة', audioUrl: 'https://www.dropbox.com/scl/fi/b9dwn79zypide7cf82n7m/.mp3?rlkey=xb7jxmbwxpwjy0zr5trv5sviw&st=lh5rgl57&raw=1' },
        { docId: 'O8R6mFyw9XI9J1UJ6mor', title: 'حياة المسلم', audioUrl: 'https://www.dropbox.com/scl/fi/30sjtasb75vyh7o8mzb1p/.mp3?rlkey=hkq2ugphv5g4trb9jde3kk9m0&st=xf6dsj7s&raw=1' },
        { docId: '7GS89Aj0o6WuR3x6Hxz6', title: 'الصديق الصالح', audioUrl: 'https://www.dropbox.com/scl/fi/87idk58myaydp7ylr7ek6/.mp3?rlkey=t8g3cp1m0cvck5vji5rodxi6p&st=sw68pjul&raw=1' },
        { docId: 'un7794b4pNJAKHrxJYsj', title: 'لا ترجو الا الله', audioUrl: 'https://www.dropbox.com/scl/fi/kt0nwsdn73hkqtpwipwno/.mp3?rlkey=hkxoi81nneana3yhx79lqxcau&st=8w63n7b3&raw=1' },
        { docId: 'bX0LhrE0UZFmYA1QN52U', title: 'كيف تتخذ قرارات سليمة', audioUrl: 'https://www.dropbox.com/scl/fi/dekslavlh88hp0doxx251/.mp3?rlkey=lkvgl25j11v887genucmxj8rh&st=ewntf1vl&raw=1' },
        { docId: '5NFsqhPrQy3Ht7pRNmzM', title: 'الابتلاء', audioUrl: 'https://www.dropbox.com/scl/fi/1tvftg6vrv8xc8nw0n35k/.mp3?rlkey=uy0z2hybnz8dx3b91opjxlo13&st=4oh93bqm&raw=1' },
        { docId: 'BcOlAA3FrdO5Jvsn0HS1', title: 'عظمة الخالق', audioUrl: 'https://www.dropbox.com/scl/fi/58fcylhe9ns7xuzqez855/.mp3?rlkey=6zz46c6dyztkhhfi2ckmec0ky&st=yx99qnva&raw=1' },
        { docId: 'pLT5WzZINFGea3mSarF6', title: 'لا اله الا الله', audioUrl: 'https://www.dropbox.com/scl/fi/6k84w2dd34i8r5pa5kcd1/.mp3?rlkey=b2xmtlx7e39qqpjrbobokav7e&st=xnqme007&raw=1' },
        { docId: 'UenuxlingCrSqIUBDGon', title: 'الصدقة', audioUrl: 'https://www.dropbox.com/scl/fi/h7b59j3guq8x0oyyf9fuv/.mp3?rlkey=ll2lyxehvhvzfo554ujc2jblw&st=mqnxr9ra&raw=1' }
    ]
}

export default mumenEpisodesFix
