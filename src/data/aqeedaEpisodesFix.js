// One-time data fix for the "العقيدة الاسلامية (علاء حامد)" podcast folder.
// Dropbox links pasted with `dl=0`/`dl=1` serve audio as `application/binary`
// with Content-Disposition: attachment, which <audio>/<video> elements refuse
// to play — `raw=1` serves the same file as `audio/mpeg` inline instead, which
// works. Applied once from the admin panel (writes need an authenticated
// admin session, which this codebase/session does not have).
//
// `docId` entries update an existing episode (found via Firestore). Entries
// without `docId` are new episodes (20-27) that didn't exist yet and get
// created in this folder.

const AQEEDA_FOLDER_ID = 'IB6eORXCO2vZsvxeaggk'

const aqeedaEpisodesFix = {
    folderId: AQEEDA_FOLDER_ID,
    episodes: [
        { docId: '7Meybf3Z4KC4XqP4htCm', title: '001 - سبب لدراسة العقيدة (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/5fxy6bjai2fsfa7fu1f22/001.mp3?rlkey=qsjxigewaerkk12b2gbv75usg&st=vam3jegc&raw=1' },
        { docId: 'Phs2OvvqXJOQMoLFfWfH', title: '003 - مناقشة الملحدين - (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/jrbomlext7dx77w3a511z/003.mp3?rlkey=8nvq4fatzcy4i43hp5gp4u4pc&st=amtvyncs&raw=1' },
        { docId: 'DU6w0osgwIvS5UpuoXjR', title: '004 - اعبد ربنا صح (توحيد الألوهية) - (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/j6toyd2x6431y9y7f5xjk/004.mp3?rlkey=673lrt4cmybhk070yqgfiphip&st=5gm3jv50&raw=1' },
        { docId: 'WzwKyY6Ba9KAO1EiVIos', title: '005 - أنواع العبادات و كيف تتجنب الشرك فيها توحيد الألوهية', audioUrl: 'https://www.dropbox.com/scl/fi/1x976fwxx5q87d4purslu/005.mp3?rlkey=6bcbr4gz275188zc07wnjsdqf&st=co2ilef8&raw=1' },
        { docId: 'a8tyk2qo6HSzELoSsA2W', title: '006 - مسائل هامة حول القبور و التوسل (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/180yblej86v12bq12gx6v/006.mp3?rlkey=maxwnxd3siksbldt07xaedaee&st=vut36vdp&raw=1' },
        { docId: 'pkrWWHPKJdGq0GRLqBdi', title: '007 - التوسل الممنوع (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/vn2l9lmkeq83cxzj1jwgs/007.mp3?rlkey=bluq5svf84n4j977hw3mfz65s&st=dj5u0383&raw=1' },
        { docId: 'JqsHvVJWL5Hip6FvaYAo', title: '008 - أنواع الشرك (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/fmabxreohanijuh1itgy4/008.mp3?rlkey=g79ubtiklgvvphpi6uha75hrx&st=i52dbhuz&raw=1' },
        { docId: 'd97ov9a1jGrAYZX8fdOD', title: '009 - السحر والتنجيم و الكهانة (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/46xtbr532920hcu027gc9/009.mp3?rlkey=gig71gexgfvizcdb4h7muwxmm&st=w1vm4pzp&raw=1' },
        { docId: 'IFL4Zz7FbTznuaR5EG4K', title: '010 - أهمية الإيمان الصحيح بالأسماء و الصفات (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/bq2iecph29gupkw6ry5qm/010.mp3?rlkey=wseehsf311u45mp9zjozoftu9&st=uvmk9qpb&raw=1' },
        { docId: 'Ficc8mB2P3H3ejw11rm8', title: '011 - كيف تصحح إيماننا بأسماء الله وصفاته (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/1t85af0dkj8d5iic821er/011.mp3?rlkey=4y1vhjtc8sov5nbo8ncirrdd3&st=xu5wq6ck&raw=1' },
        { docId: '517Bk8QWciECkE1nOeAS', title: '012 - الرد على أهل البدع والتعبد إلى الله بالأسماء والصفات (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/6umh0gx5h9tkobfsn5nc7/012.mp3?rlkey=eu0e1a2oe5kwnwxx2kltz3gvz&st=5qj1rsqo&raw=1' },
        { docId: 'sb1VM01RpMSG7S08QhZG', title: '013 - الملائكة عالم يحبنا ونحبه (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/s0u9hgiho4gx6oger72tz/013.mp3?rlkey=ng8wd9y69vup9lgzy8iz1h1dc&st=woifgw8p&raw=1' },
        { docId: 'QVCZdxJdeYbc44qYKNUW', title: '014 - الإيمان بالكتب (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/n2ykh6r1lfj2xsz52zpj6/014.mp3?rlkey=rxo19dab5l7mbpariu8sk68f3&st=plgf5kux&raw=1' },
        { docId: 'JuM8AP22XchxmD4x6UZt', title: '015 - الإيمان بالرسل وخصائص نبينا صلى الله عليه وسلم (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/s5mf1a0xb12cnee4k1y3y/015.mp3?rlkey=4act0csuxsaeweodr03vuq12n&st=1ytrp4go&raw=1' },
        { docId: 'QDMUI6Mu9x6WTl26tB5s', title: '016 - حقوق النبي على الأمة وحكم ادعاء النبوة بعده (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/to6226rug938mufcd7bgt/016.mp3?rlkey=zeqhu2su6rctr9423ssfkg57d&st=253obkxf&raw=1' },
        { docId: 'WAZMQQKoCX8hLQfCws2Y', title: '017 - حقيقة الإسراء والمعراج و المعجزات و كرامات الأولياء (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/ls6r93ppn7x20gk6w4lo7/017.mp3?rlkey=q9lfjxa7yzafhbi3xgkufkmqc&st=29m2vk29&raw=1' },
        { docId: '3Uz5Y9BfwplVsxEWdmRR', title: '018 - أشراط الساعة الصغرى (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/bivv98a9nqvti7a24g2ed/018.mp3?rlkey=wg6824foecse67titgv8sf3xb&st=kg3owy8p&raw=1' },
        { docId: 'oL5STNebrUCVWvPIerZr', title: '019 - أشراط الساعة الكبرى (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/guvc6f221b8eotjwiu2xd/019.mp3?rlkey=yc0mzkeihaan0a9vznfs2xxmr&st=bp4anv33&raw=1' },
        { title: '020 - نعيم القبر وعذابه ... حقيقة أم خيال ؟ (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/woz828nug226rvq9muwcg/020.mp3?rlkey=wzi1845l6aifgykpimjgswzsl&st=3wrb29h9&raw=1' },
        { title: '021 - مشاهد يوم القيامة (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/lhjb8q1qto4vysf2nm42w/021.mp3?rlkey=q2c7szq8w6gqrplhfnjolmxmr&st=rhypqh4t&raw=1' },
        { title: '022 - هل الإنسان مخير أم مسير ؟ (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/uab329niz08aun7y0clgb/022.mp3?rlkey=jbr5gyau3m1kuckzdaywypszh&st=fjbj2rbc&raw=1' },
        { title: '023 - الفهم الصحيح لقضايا الإيمان والكفر (1) (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/iaf6cugf8tlnl1l95ltxv/023.mp3?rlkey=0x1lk5clt3e4ymm7xqy7qh815&st=3pkyj91x&raw=1' },
        { title: '024 - الفهم الصحيح لقضايا الإيمان والكفر (2) (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/7ma65x18ruo7wh72molr1/024.mp3?rlkey=nvmfctwpisush88jr1g9zz9jq&st=irtdkhqd&raw=1' },
        { title: '025 - كيف نتعامل مع غير المسلمين (الولاء والبراء) (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/ps17gy8cfs1xkg6wiqt3q/025.mp3?rlkey=2lfcd1ad71ut23rc2qr964mgi&st=31rdiwzz&raw=1' },
        { title: '026 - عقيدتنا في الصحابة (شرح كتاب أصول الإيمان)', audioUrl: 'https://www.dropbox.com/scl/fi/i6n9hxhwcnuwa4c2hazxr/026.mp3?rlkey=gpa7rjkps9dyaxx97eq1ci4ay&st=tpwjga9p&raw=1' },
        { title: '027 - اعرف عقائد الشيعة من كتبهم و أقوالهم', audioUrl: 'https://www.dropbox.com/scl/fi/vvgul2hyxs18a7oafxz2f/027.mp3?rlkey=p7ptrba1wixk00g0lrogfs6j7&st=6kyzk9g5&raw=1' }
    ]
}

export default aqeedaEpisodesFix
