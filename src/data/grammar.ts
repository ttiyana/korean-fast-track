// Grammar patterns, ordered by how fast they pay off in shops, restaurants and dramas.
export type GrammarPoint = {
  id: string
  pattern: string
  meaning: string
  register: "polite" | "casual" | "both"
  level: 1 | 2 | 3
  note: string
  examples: { ko: string; en: string }[]
}

export const GRAMMAR: GrammarPoint[] = [
  {
    id: "ieyo",
    pattern: "N + 이에요 / 예요",
    meaning: "X is Y (polite 'to be')",
    register: "polite",
    level: 1,
    note: "Use 이에요 after a consonant, 예요 after a vowel. This is the single most used sentence ending in shops: 이거 뭐예요? = 'What is this?'",
    examples: [
      { ko: "이거 뭐예요?", en: "What is this?" },
      { ko: "저는 학생이에요.", en: "I'm a student." },
      { ko: "여기가 어디예요?", en: "Where is this place?" },
    ],
  },
  {
    id: "eunneun",
    pattern: "N + 은 / 는",
    meaning: "topic marker: 'as for X…'",
    register: "both",
    level: 1,
    note: "Marks what the sentence is about, and it also creates contrast ('unlike others'). 은 after consonants, 는 after vowels. Dramas use it constantly: 나는 몰라, 저는 괜찮아요.",
    examples: [
      { ko: "저는 커피는 안 마셔요.", en: "I don't drink coffee (though other things I do)." },
      { ko: "오늘은 바빠요.", en: "Today I'm busy." },
    ],
  },
  {
    id: "iga",
    pattern: "N + 이 / 가",
    meaning: "subject marker: who/what does it",
    register: "both",
    level: 1,
    note: "Use when the subject is new information or the answer to a question. Compare: 누가 왔어요? → 친구가 왔어요. If you confuse 은/는 and 이/가, you are still understood — Korean hears it as a nuance, not an error.",
    examples: [
      { ko: "물이 없어요.", en: "There's no water." },
      { ko: "시간이 없어요.", en: "I have no time." },
    ],
  },
  {
    id: "eulreul",
    pattern: "N + 을 / 를",
    meaning: "object marker: the thing acted on",
    register: "both",
    level: 1,
    note: "을 after consonants, 를 after vowels. It is dropped a lot in speech, so you mostly need to *recognise* it: 밥을 먹었어요, 커피를 주문했어요.",
    examples: [
      { ko: "김치를 좋아해요.", en: "I like kimchi." },
      { ko: "이거를 주세요.", en: "Please give me this one." },
    ],
  },
  {
    id: "e-eseo",
    pattern: "N + 에 / 에서",
    meaning: "to/at a place; 'from' a place",
    register: "both",
    level: 1,
    note: "에 = destination or static location (가게에 가요). 에서 = where an action happens (가게에서 일해요) and also 'from' (한국에서 왔어요).",
    examples: [
      { ko: "지하철역에 가요.", en: "I'm going to the subway station." },
      { ko: "편의점에서 샀어요.", en: "I bought it at the convenience store." },
      { ko: "어디에서 왔어요?", en: "Where are you from?" },
    ],
  },
  {
    id: "ayo-eoyo",
    pattern: "V + 아요 / 어요",
    meaning: "polite present tense (해요체)",
    register: "polite",
    level: 1,
    note: "The default polite ending — safe with shop staff, strangers, anyone older. Rule of thumb: if the stem's last vowel is ㅏ or ㅗ use 아요, otherwise 어요; 하다 becomes 해요. Learn every verb in this form and you can speak today.",
    examples: [
      { ko: "저는 매일 한국어를 공부해요.", en: "I study Korean every day." },
      { ko: "이거 좋아요.", en: "I like this / this is good." },
      { ko: "여기 앉아요.", en: "I'll sit here." },
    ],
  },
  {
    id: "past",
    pattern: "V + 았어요 / 었어요",
    meaning: "polite past tense",
    register: "polite",
    level: 1,
    note: "Same vowel rule as above: 았어요 after ㅏ/ㅗ, 었어요 otherwise, 했어요 for 하다. Watch for the ㅡ/ㅜ contractions: 배고프다 → 배고팠어요, 마시다 → 마셨어요.",
    examples: [
      { ko: "밥 먹었어요?", en: "Have you eaten? (very common small talk)" },
      { ko: "어제 친구를 만났어요.", en: "I met a friend yesterday." },
      { ko: "많이 기다렸어요?", en: "Did you wait long?" },
    ],
  },
  {
    id: "lgeyo",
    pattern: "V + (으)ㄹ게요",
    meaning: "'I'll…' — a promise or offer you just decided",
    register: "polite",
    level: 1,
    note: "The most useful 'I will' for real life: it signals you are doing it for the listener's sake. 카드로 할게요, 제가 할게요, 이따가 전화할게요. Compare -(으)ㄹ 거예요, which is a plan/fact ('I'm going to'), not a promise.",
    examples: [
      { ko: "카드로 할게요.", en: "I'll pay by card." },
      { ko: "제가 계산할게요.", en: "I'll get the bill (let me pay)." },
      { ko: "기다릴게요.", en: "I'll wait for you." },
    ],
  },
  {
    id: "lgeoyeyo",
    pattern: "V + (으)ㄹ 거예요",
    meaning: "will / be going to (plan, prediction)",
    register: "polite",
    level: 1,
    note: "Your default future: 내일 갈 거예요. In dramas it is also the classic stubborn line: 안 갈 거야! = 'I'm not going!'",
    examples: [
      { ko: "내일 다시 올 거예요.", en: "I'll come again tomorrow." },
      { ko: "아마 늦을 거예요.", en: "I'll probably be late." },
    ],
  },
  {
    id: "llaeyo",
    pattern: "V + (으)ㄹ래요?",
    meaning: "Do you want to…? / I'd rather…",
    register: "both",
    level: 2,
    note: "Casual-but-polite invitation: 뭐 마실래요? = 'What would you like to drink?'. In 반말 it becomes -(으)ㄹ래? and sounds like a friend asking.",
    examples: [
      { ko: "뭐 마실래요?", en: "What would you like to drink?" },
      { ko: "같이 갈래요?", en: "Do you want to come along?" },
      { ko: "저는 집에 있을래요.", en: "I'd rather stay home." },
    ],
  },
  {
    id: "lkkayo",
    pattern: "V + (으)ㄹ까요?",
    meaning: "Shall we? / Should I? / I wonder…",
    register: "polite",
    level: 2,
    note: "Great for taking initiative politely: 같이 갈까요? 도와드릴까요? With an adjective or past stem it turns into musing: 비가 올까? = 'Will it rain, I wonder?'",
    examples: [
      { ko: "뭐 드릴까요?", en: "What can I get you? (staff language)" },
      { ko: "여기서 기다릴까요?", en: "Shall we wait here?" },
    ],
  },
  {
    id: "gosipda",
    pattern: "V + 고 싶어요",
    meaning: "want to do",
    register: "polite",
    level: 1,
    note: "For 'I want a thing' use 갖고 싶어요 or the noun + 주세요 pattern instead. In 반말 it is -고 싶어, the sound of every drama wish.",
    examples: [
      { ko: "한국어를 잘하고 싶어요.", en: "I want to be good at Korean." },
      { ko: "물 마시고 싶어요.", en: "I want to drink water." },
    ],
  },
  {
    id: "juseyo",
    pattern: "V + 아/어 주세요",
    meaning: "please do X for me",
    register: "polite",
    level: 1,
    note: "Politeness engine of every transaction. Attached to 주다: 주세요 = 'give me'. More polite: -아/어 주시겠어요? Soften with 좀: 천천히 말해 주세요.",
    examples: [
      { ko: "천천히 말해 주세요.", en: "Please speak slowly." },
      { ko: "영수증 주세요.", en: "The receipt, please." },
      { ko: "이거 포장해 주세요.", en: "Please pack this to go." },
    ],
  },
  {
    id: "ado-doe",
    pattern: "V + 아/어도 돼요?",
    meaning: "May I…? / Is it okay if…?",
    register: "polite",
    level: 1,
    note: "Asking permission: 여기 앉아도 돼요? 카드 써도 돼요? The statement form -아/어도 돼요 means 'it's allowed' (되고요 / 안 돼요 = no).",
    examples: [
      { ko: "이거 입어 봐도 돼요?", en: "May I try this on?" },
      { ko: "여기 앉아도 돼요?", en: "May I sit here?" },
      { ko: "사진 찍어도 돼요?", en: "May I take a picture?" },
    ],
  },
  {
    id: "myeon-an-doe",
    pattern: "V + (으)면 안 돼요",
    meaning: "you must not / it's not allowed",
    register: "polite",
    level: 2,
    note: "Signs and staff say this constantly: 여기서 담배 피우면 안 돼요. As a question 면 안 돼요? it becomes 'do I have to…?'",
    examples: [
      { ko: "여기서 사진을 찍으면 안 돼요.", en: "You can't take pictures here." },
      { ko: "여기서 주차하면 안 돼요.", en: "You're not allowed to park here." },
    ],
  },
  {
    id: "aya-hae",
    pattern: "V + 아/어야 해요",
    meaning: "have to / must",
    register: "polite",
    level: 2,
    note: "As a softener Koreans also say -아/어야 돼요 (same meaning) or -아/어야죠. In 반말, 해야 돼.",
    examples: [
      { ko: "지금 가야 해요.", en: "I have to go now." },
      { ko: "약을 먹어야 해요.", en: "You have to take your medicine." },
    ],
  },
  {
    id: "seyo",
    pattern: "V + (으)세요",
    meaning: "polite command / honorific 'does'",
    register: "polite",
    level: 1,
    note: "Two jobs at once: instructions (여기서 내리세요) and respect for the subject (선생님이 오세요). Staff speech is full of it: 어서 오세요, 천천히 드세요.",
    examples: [
      { ko: "저쪽으로 가세요.", en: "Go that way (please)." },
      { ko: "여기에 이름을 쓰세요.", en: "Write your name here, please." },
    ],
  },
  {
    id: "go-isseo",
    pattern: "V + 고 있어요",
    meaning: "am/are doing right now (progressive)",
    register: "polite",
    level: 2,
    note: "Also the classic phone line: 지금 뭐 하고 있어요? = 'What are you doing (right now)?'",
    examples: [
      { ko: "지금 밥 먹고 있어요.", en: "I'm eating right now." },
      { ko: "뭐 하고 있어요?", en: "What are you doing?" },
    ],
  },
  {
    id: "a-bwass",
    pattern: "V + 아/어 봤어요",
    meaning: "have tried doing",
    register: "polite",
    level: 2,
    note: "봤어요 from 보다 = 'have experienced'. 이거 먹어 봤어요? = 'Have you tried this?'",
    examples: [
      { ko: "김치 먹어 봤어요?", en: "Have you tried kimchi?" },
      { ko: "한국에 가 봤어요.", en: "I've been to Korea." },
    ],
  },
  {
    id: "geot-gata",
    pattern: "V + 는 / (으)ㄴ 것 같아요",
    meaning: "it seems / I think (soft opinion)",
    register: "polite",
    level: 2,
    note: "How Koreans disagree politely: 그건 좀 아닌 것 같아요. Also the drama worry line: 비가 올 것 같아.",
    examples: [
      { ko: "맛있는 것 같아요.", en: "It seems delicious (I'd say it's tasty)." },
      { ko: "비가 올 것 같아요.", en: "It looks like it's going to rain." },
    ],
  },
  {
    id: "janyo",
    pattern: "V + 잖아요",
    meaning: "'you know / I told you' (shared knowledge)",
    register: "both",
    level: 3,
    note: "The drama disagreement marker: 내가 말했잖아! = 'I told you!' 친구잖아 = 'you're my friend, remember?'. Use it only when the listener already knows the fact, otherwise it sounds accusatory.",
    examples: [
      { ko: "내가 말했잖아요.", en: "I told you, didn't I." },
      { ko: "오늘 바쁘잖아요.", en: "You know I'm busy today." },
    ],
  },
  {
    id: "neunde",
    pattern: "V + 는데 / (으)ㄴ데",
    meaning: "…and / but / so (background before the point)",
    register: "both",
    level: 2,
    note: "One of the highest-frequency connectors in spoken Korean: it sets the scene. 지금 바쁜데요 = 'I'm busy right now (so…)'. Also used to soften requests: 저기요, 물 좀 주시겠어요… 하하, 죄송한데요.",
    examples: [
      { ko: "저 죄송한데요, 물 좀 주세요.", en: "Sorry, but could I have some water?" },
      { ko: "지금 배고픈데 뭐 먹을까요?", en: "I'm hungry right now — what should we eat?" },
    ],
  },
  {
    id: "nikkaseo",
    pattern: "V + 아/어서 / (으)니까",
    meaning: "because / so",
    register: "both",
    level: 2,
    note: "아/어서 is neutral cause (비가 와서 못 갔어요). (으)니까 sounds more assertive and works with commands: 바쁘니까 나중에 전화할게요.",
    examples: [
      { ko: "너무 매워서 못 먹었어요.", en: "It was so spicy I couldn't eat it." },
      { ko: "지금 바쁘니까 이따가 얘기해요.", en: "I'm busy now, so let's talk later." },
    ],
  },
  {
    id: "go",
    pattern: "V + 고",
    meaning: "and (joining actions or states)",
    register: "both",
    level: 1,
    note: "밥 먹고 커피 마셨어요 — 'I ate and drank coffee.' Tense is marked once, at the end.",
    examples: [
      { ko: "밥 먹고 커피 마셨어요.", en: "I ate and then had coffee." },
      { ko: "예쁘고 조용해요.", en: "It's pretty and quiet." },
    ],
  },
  {
    id: "jeone",
    pattern: "V + 기 전에 / (으)ㄴ 후에",
    meaning: "before / after doing",
    register: "both",
    level: 2,
    note: "Very useful for plans: 먹기 전에 약을 드세요 = 'Take the medicine before eating.'",
    examples: [
      { ko: "자기 전에 전화할게요.", en: "I'll call before I sleep." },
      { ko: "밥 먹은 후에 갈게요.", en: "I'll go after eating." },
    ],
  },
  {
    id: "ddae",
    pattern: "V + (으)ㄹ 때",
    meaning: "when / at the time of",
    register: "both",
    level: 2,
    note: "한국에 갈 때 = 'when I go to Korea'. Reacting in the moment: 이럴 때 어떻게 해요? = 'What do you do in this situation?'",
    examples: [
      { ko: "바쁠 때 말해 주세요.", en: "Tell me when you're busy." },
      { ko: "어릴 때 한국에 살았어요.", en: "I lived in Korea when I was little." },
    ],
  },
  {
    id: "jiyo",
    pattern: "V + 지요 / 죠",
    meaning: "…right? / surely you mean (confirming)",
    register: "both",
    level: 2,
    note: "이거 맞죠? = 'This is right, isn't it?' In shops you hear it as a friendly: 찾으시는 거 있으세요? 아, 이거죠?",
    examples: [
      { ko: "이거 맞죠?", en: "This is correct, right?" },
      { ko: "맛있죠?", en: "Tasty, isn't it?" },
    ],
  },
  {
    id: "neyo",
    pattern: "V + 네요",
    meaning: "'oh, it is…' — reacting to something you just noticed",
    register: "polite",
    level: 2,
    note: "The politest way to react: 맛있네요! 예쁘네요! 한국어 잘하시네요! Never used about your own feelings from inside — it reports what you observed.",
    examples: [
      { ko: "진짜 맛있네요!", en: "Wow, this is really tasty!" },
      { ko: "한국어 잘하시네요.", en: "Your Korean is good (compliment you'll hear a lot)." },
    ],
  },
  {
    id: "geodeunyo",
    pattern: "V + 거든요",
    meaning: "'you see, because…' (explaining what the listener doesn't know)",
    register: "both",
    level: 3,
    note: "Answers 'why?' without being asked harshly. 오늘 휴무거든요 = 'It's closed today, you see.'",
    examples: [
      { ko: "오늘 문을 안 열었거든요.", en: "You see, they didn't open today." },
      { ko: "지금 회의 중이거든요.", en: "I'm in a meeting right now, actually." },
    ],
  },
  {
    id: "ryeogo",
    pattern: "V + (으)려고",
    meaning: "in order to / intending to",
    register: "both",
    level: 3,
    note: "Purpose: 사려고 왔어요 = 'I came to buy it.' Casual variant: -(으)러 왔어요 with movement verbs (먹으러 왔어요).",
    examples: [
      { ko: "사려고 왔어요.", en: "I came to buy it." },
      { ko: "한국어를 배우려고 한국에 갈 거예요.", en: "I'm going to Korea to learn Korean." },
    ],
  },
  {
    id: "giro-haess",
    pattern: "V + 기로 했어요",
    meaning: "decided to / agreed to",
    register: "polite",
    level: 2,
    note: "Drama staple for plans: 우리 만나기로 했어. Also -기로 했는데… leaves the sentence hanging dramatically.",
    examples: [
      { ko: "내일 만나기로 했어요.", en: "We agreed to meet tomorrow." },
      { ko: "운동하기로 했어요.", en: "I decided to start exercising." },
    ],
  },
  {
    id: "su-isseo",
    pattern: "V + (으)ㄹ 수 있어요 / 없어요",
    meaning: "can / cannot",
    register: "both",
    level: 1,
    note: "한국어 조금 할 수 있어요 = 'I can speak a little Korean.' In 반말: 할 수 있어 / 할 수 없어.",
    examples: [
      { ko: "한국어 조금 할 수 있어요.", en: "I can speak a little Korean." },
      { ko: "오늘은 갈 수 없어요.", en: "I can't go today." },
    ],
  },
  {
    id: "ji-maseyo",
    pattern: "V + 지 마세요",
    meaning: "please don't do X",
    register: "polite",
    level: 2,
    note: "반말 version 하지 마 is one of the most shouted lines in K-drama. Ethically softer: 안 해도 돼요 = 'you don't have to'.",
    examples: [
      { ko: "걱정하지 마세요.", en: "Don't worry." },
      { ko: "여기서 사진 찍지 마세요.", en: "Please don't take pictures here." },
    ],
  },
  {
    id: "hante",
    pattern: "N + 한테 / 에게 (한테서 / 에게서)",
    meaning: "to a person / from a person",
    register: "both",
    level: 2,
    note: "People, not places: 친구한테 물어봤어요 = 'I asked a friend.' 한테 is spoken, 에게 is written. 한테서 = 'from'.",
    examples: [
      { ko: "친구한테 물어봤어요.", en: "I asked my friend." },
      { ko: "선생님한테 받았어요.", en: "I got it from the teacher." },
    ],
  },
  {
    id: "honorific-si",
    pattern: "V + (으)시-",
    meaning: "respect marker for the person you're talking about",
    register: "polite",
    level: 2,
    note: "Never used about yourself. Common pairs: 먹다/드시다, 자다/주무시다, 있다/계시다, 아프다/편찮으시다. Front-desk and drama elders' speech run on this.",
    examples: [
      { ko: "어머니는 지금 주무세요.", en: "Mother is sleeping now." },
      { ko: "여기 앉으세요.", en: "Please have a seat (sit down)." },
      { ko: "많이 드세요.", en: "Please eat a lot." },
    ],
  },
  {
    id: "banmal",
    pattern: "반말 bundle: -아/어, -야, -자, -냐?, -ㄴ다",
    meaning: "casual speech you only hear (friends, family, on screen)",
    register: "casual",
    level: 3,
    note: "You will hear this far more than you speak it. Understand it first: -아/어 = plain present (먹어, 가); -야 = 'it is' (이거야); -자 = 'let's' (가자); -냐?/-니? = question (어디 가냐?); -ㄴ다/-는다 = narration or talking to yourself. Do not start 반말 with a Korean you've just met — age and closeness decide it.",
    examples: [
      { ko: "밥 먹었어? 빨리 와, 같이 먹자.", en: "Did you eat? Come quick, let's eat together." },
      { ko: "어디 가냐? 나도 가.", en: "Where are you going? I'm coming too." },
      { ko: "몰라, 난 안 해.", en: "I don't know, I'm not doing it." },
    ],
  },
]

export type Source = { label: string; url: string; note?: string }

export const SOURCES: { group: string; items: Source[] }[] = [
  {
    group: "How long it really takes",
    items: [
      {
        label: "US Foreign Service Institute language difficulty ranking",
        url: "https://www.state.gov/foreign-service-institute/",
        note: "Korean sits in Category V: ~88 weeks / 2,200 class hours to professional proficiency — the hardest tier with Japanese, Mandarin and Arabic.",
      },
      { label: "FSI rankings summary (Atlas & Boots)", url: "https://www.atlasandboots.com/foreign-service-institute-language-difficulty/" },
      {
        label: "Refold: how long does it take to learn a language",
        url: "https://refold.la/roadmap/library/how-long-does-it-take-to-learn-a-language",
        note: "Broken down by immersion hours, with Korean in the 'distant languages' group for English speakers.",
      },
    ],
  },
  {
    group: "Why input + frequency is the shortcut",
    items: [
      {
        label: "Krashen's input hypothesis (i+1) and its reception",
        url: "https://onlinelibrary.wiley.com/doi/abs/10.1111/flan.12552",
        note: "Lichtman, 'Was Krashen right? Forty years later' (Foreign Language Annals, 2021) — what has held up and what has not.",
      },
      {
        label: "Beyond comprehensible input: a neuro-ecological critique",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12577063/",
        note: "Why input alone is not enough — output and interaction matter too. This app mixes all three.",
      },
      {
        label: "Lexical coverage in L1 and L2 viewing comprehension (Studies in Second Language Acquisition)",
        url: "https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/lexical-coverage-in-l1-and-l2-viewing-comprehension/DFCA6605076705D5762C98F286D16B27",
        note: "TV and film comprehension needs roughly 95–98% lexical coverage before it feels comfortable.",
      },
      {
        label: "Word families needed for 95% / 98% coverage of movies and TV",
        url: "https://www.researchgate.net/figure/The-amount-of-vocabulary-needed-to-achieve-85-95-and-98-coverage-for-online-newspapers_fig1_358817645",
        note: "About 3,000 word families for 95% coverage, ~7,000 for 98% (English-based study; Korean numbers are similar, plus grammar endings).",
      },
      {
        label: "KoFREN: Korean word frequency norms from speech corpora (LREC-COLING 2024)",
        url: "https://aclanthology.org/2024.lrec-main.866.pdf",
        note: "Evidence base for frequency-ordered Korean vocabulary, from spontaneous speech corpora.",
      },
      {
        label: "OpenSubtitles word frequency lists (FrequencyWords)",
        url: "https://github.com/hermitdave/FrequencyWords",
        note: "The source of this app's 'subtitle 120' list — real subtitle frequencies, which is why glued spoken forms like 거야 and 난 rank higher than dictionary words.",
      },
    ],
  },
  {
    group: "Making it stick",
    items: [
      {
        label: "FSRS-6: the scheduler behind this app's review queue",
        url: "https://github.com/open-spaced-repetition/srs-benchmark",
        note: "Benchmarked on ~10,000 Anki learners and ~350M reviews: FSRS matches SM-2's retention with 20–30% fewer reviews.",
      },
      { label: "FSRS vs SM-2 explainer", url: "https://atomus.app/blog/fsrs-vs-sm2" },
      {
        label: "Captions and subtitles in L2 listening (review of evidence)",
        url: "https://ijonmes.net/index.php/ijonmes/article/view/153",
        note: "Captions help form and meaning; use them as a ladder (Korean subs → none), not as a permanent crutch.",
      },
      {
        label: "Dual subtitles and vocabulary learning (CALLEJ)",
        url: "https://callej.org/index.php/journal/article/view/352",
        note: "For vocabulary, L1 + L2 subtitles beat L2-only captions. For listening, L2-only wins. That's why the ladder matters.",
      },
      {
        label: "Refold immersion methodology (from the AJATT lineage)",
        url: "https://refold.la/roadmap/",
        note: "Sentence mining, high-volume immersion and delayed output — the framework this app's daily loop is built on.",
      },
      {
        label: "Korean speech levels: 하십시오체 / 해요체 / 해체",
        url: "https://topiklord.com/blog/korean-honorifics-guide",
        note: "Why this app teaches 해요체 first and only *decodes* 반말 until you have someone to use it with.",
      },
    ],
  },
]
