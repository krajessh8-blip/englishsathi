import { GrammarTopic } from '../../types';
import { CURRICULUM_DEFINITIONS } from './curriculumDefinitions';

/**
 * Handcrafted rich curated data for core topics to give deep learning experience
 */
const BESPOKE_TOPICS: Record<string, Partial<GrammarTopic>> = {
  // LEVEL 1
  'g1-1': {
    title_en: 'Alphabets',
    title_mr: 'इंग्रजी मुळाक्षरे (A to Z)',
    title_hi: 'अंग्रेजी वर्णमाला (A to Z)',
    explanation_en: 'The English alphabet has 26 letters. We use letters to make words. Letters start from A and end at Z.',
    explanation_mr: 'इंग्रजीत एकूण २६ अक्षरे असतात. अक्षरांपासून शब्द तयार होतात. ही अक्षरे A पासून Z पर्यंत असतात.',
    explanation_hi: 'अंग्रेजी वर्णमाला में 26 अक्षर होते हैं। अक्षरों से शब्द बनते हैं। ये A से Z तक होते हैं।',
    examples: [
      { type: 'positive', sentence: 'A is for Apple.', marathi: 'A म्हणजे Apple (सफरचंद).', hindi: 'A से Apple (सेब)।' },
      { type: 'positive', sentence: 'B is for Ball.', marathi: 'B म्हणजे Ball (चेंडू).', hindi: 'B से Ball (गेंद)।' },
      { type: 'positive', sentence: 'C is for Cat.', marathi: 'C म्हणजे Cat (मांजर).', hindi: 'C से Cat (बिल्ली)।' },
      { type: 'general', sentence: 'A B C D E F G...', marathi: 'ए बी सी डी ई एफ जी...', hindi: 'ए बी सी डी ई एफ जी...' },
    ],
    common_mistakes: [
      {
        incorrect: 'I write alphabet letters.',
        correct: 'I write letters of the alphabet.',
        why: 'Alphabet means the whole set of 26 letters, not a single letter.',
        marathiWhy: 'Alphabet म्हणजे संपूर्ण २६ अक्षरांचा संच, एका अक्षराला "letter" म्हणतात.',
      },
    ],
    speaking_practice: {
      prompt: 'Say the first five letters of the English alphabet with an example word for each.',
      marathiPrompt: 'पहिली पाच अक्षरे आणि प्रत्येकाचा एक सोपा शब्द बोला (A for Apple...)',
      hindiPrompt: 'पहले पांच अक्षर और उनका एक-एक शब्द बोलिए।',
      suggestedAnswer: 'A is for Apple, B is for Ball, C is for Cat, D is for Dog, E is for Elephant.',
      targetPattern: 'A is for..., B is for...',
      hints: ['Apple', 'Ball', 'Cat', 'Dog', 'Elephant'],
    },
    writing_practice: [
      {
        id: 1,
        type: 'fill_blank',
        question: 'There are _____ letters in the English alphabet.',
        options: ['24', '26', '28', '30'],
        correctAnswer: '26',
        explanation: 'There are exactly 26 letters in English: A to Z.',
      },
      {
        id: 2,
        type: 'fill_blank',
        question: 'The first letter of the alphabet is _____.',
        options: ['B', 'Z', 'A', 'M'],
        correctAnswer: 'A',
        explanation: 'The alphabet starts with the letter A.',
      },
    ],
    quiz: [
      {
        id: 1,
        question: 'How many letters are there in the English alphabet?',
        options: ['21 letters', '26 letters', '5 letters', '52 letters'],
        correctIndex: 1,
        explanation: 'The English alphabet consists of 26 letters.',
      },
      {
        id: 2,
        question: 'Which letter comes immediately after letter C?',
        options: ['B', 'D', 'E', 'A'],
        correctIndex: 1,
        explanation: 'The letter D comes immediately after C (A, B, C, D).',
      },
    ],
    listen_sentences: [
      { en: 'English has 26 letters from A to Z.', mr: 'इंग्रजीत A ते Z पर्यंत २६ अक्षरे आहेत.', hi: 'अंग्रेजी में A से Z तक 26 अक्षर हैं।' },
      { en: 'A is for Apple.', mr: 'A म्हणजे सफरचंद.', hi: 'A से सेब।' },
      { en: 'B is for Ball.', mr: 'B म्हणजे चेंडू.', hi: 'B से गेंद।' },
    ],
  },
  'g1-10': {
    title_en: 'Naming Words',
    title_mr: 'नामे (Naming Words / Nouns)',
    title_hi: 'नाम वाले शब्द (संज्ञा)',
    explanation_en: 'Naming words tell us the name of a person, place, animal, or thing. Everything around us has a name!',
    explanation_mr: 'एखाद्या व्यक्तीचे, जागेचे, प्राण्याचे किंवा वस्तूचे नाव सांगणाऱ्या शब्दाला Naming Word (नाम) म्हणतात.',
    explanation_hi: 'किसी व्यक्ति, जगह, जानवर या वस्तु के नाम को Naming Word (संज्ञा) कहते हैं।',
    examples: [
      { type: 'positive', sentence: 'Rohan is a boy.', marathi: 'रोहन हा मुलगा आहे. (Person)', hindi: 'रोहन एक लड़का है।' },
      { type: 'positive', sentence: 'The cat is drinking milk.', marathi: 'मांजर दूध पीत आहे. (Animal)', hindi: 'बिल्ली दूध पी रही है।' },
      { type: 'positive', sentence: 'This is my school.', marathi: 'ही माझी शाळा आहे. (Place)', hindi: 'यह मेरा स्कूल है।' },
      { type: 'positive', sentence: 'I have a red pen.', marathi: 'माझ्याकडे लाल पेन आहे. (Thing)', hindi: 'मेरे पास लाल कलम है।' },
    ],
    common_mistakes: [
      {
        incorrect: 'Run is a naming word.',
        correct: 'Run is an action word (verb). Runner is a naming word.',
        why: 'Words that tell what we DO are action words, not naming words.',
        marathiWhy: 'कृती सांगणारे शब्द Action word (क्रियापद) असतात, व्यक्ती/वस्तूची ओळख देणारे शब्द Naming words असतात.',
      },
    ],
    speaking_practice: {
      prompt: 'Name 3 things you can see in your classroom or room right now.',
      marathiPrompt: 'तुमच्या खोलीतील कोणत्याही ३ वस्तूंची नावे इंग्रजीत बोला.',
      hindiPrompt: 'अपने कमरे की किन्हीं ३ चीजों के नाम बोलिए।',
      suggestedAnswer: 'I can see a book, a table, and a chair.',
      targetPattern: 'I can see a [thing], a [thing], and a [thing].',
      hints: ['book', 'pen', 'fan', 'table', 'chair', 'bag'],
    },
    writing_practice: [
      {
        id: 1,
        type: 'fill_blank',
        question: 'Identify the naming word: "The dog barks."',
        options: ['dog', 'barks', 'the', 'loudly'],
        correctAnswer: 'dog',
        explanation: '"Dog" is an animal, so it is a naming word.',
      },
      {
        id: 2,
        type: 'fill_blank',
        question: 'Which of these is a place?',
        options: ['Boy', 'School', 'Pencil', 'Jump'],
        correctAnswer: 'School',
        explanation: 'School is the name of a place.',
      },
    ],
    quiz: [
      {
        id: 1,
        question: 'Which word in "Rahul reads a book" is a name of a person?',
        options: ['reads', 'Rahul', 'book', 'a'],
        correctIndex: 1,
        explanation: '"Rahul" is the name of a person.',
      },
      {
        id: 2,
        question: 'Which of the following is a naming word for a thing?',
        options: ['Run', 'Happy', 'Table', 'Sing'],
        correctIndex: 2,
        explanation: 'Table is a thing, hence a naming word.',
      },
    ],
    listen_sentences: [
      { en: 'Every person, place, and thing has a name.', mr: 'प्रत्येक व्यक्ती, जागा आणि वस्तूला नाव असते.', hi: 'हर व्यक्ति, जगह और वस्तु का एक नाम होता है।' },
      { en: 'Rahul is reading a book.', mr: 'राहुल पुस्तक वाचत आहे.', hi: 'राहुल किताब पढ़ रहा है।' },
    ],
  },
  'g1-13': {
    title_en: 'This / That',
    title_mr: 'This / That चा वापर',
    title_hi: 'This / That का उपयोग',
    explanation_en: 'We use "This" for one thing near us. We use "That" for one thing far away.',
    explanation_mr: 'आपल्या जवळ असलेल्या एका वस्तूसाठी "This" वापरतात. आपल्यापासून दूर असलेल्या एका वस्तूसाठी "That" वापरतात.',
    explanation_hi: 'पास की एक चीज के लिए "This" और दूर की एक चीज के लिए "That" का प्रयोग करते हैं।',
    examples: [
      { type: 'positive', sentence: 'This is my pen.', marathi: 'हा माझा पेन आहे. (जवळ)', hindi: 'यह मेरी कलम है (पास)।' },
      { type: 'positive', sentence: 'That is a big tree.', marathi: 'ते एक मोठे झाड आहे. (दूर)', hindi: 'वह एक बड़ा पेड़ है (दूर)।' },
      { type: 'negative', sentence: 'This is not my book.', marathi: 'हे माझे पुस्तक नाही.', hindi: 'यह मेरी किताब नहीं है।' },
      { type: 'question', sentence: 'What is that?', marathi: 'ते काय आहे?', hindi: 'वह क्या है?' },
    ],
    common_mistakes: [
      {
        incorrect: 'This is apples.',
        correct: 'These are apples. / This is an apple.',
        why: '"This" is only used for ONE thing (singular), not many.',
        marathiWhy: '"This" फक्त एकाच वस्तूसाठी वापरतात, अनेकांसाठी "These" वापरतात.',
      },
    ],
    speaking_practice: {
      prompt: 'Point to one object near you and say "This is...", then point to something far and say "That is..."',
      marathiPrompt: 'जवळच्या वस्तूसाठी "This is a..." आणि लांबच्या वस्तूसाठी "That is a..." बोला.',
      suggestedAnswer: 'This is my pencil, and that is a window.',
      targetPattern: 'This is a..., That is a...',
      hints: ['pencil', 'book', 'door', 'clock', 'fan'],
    },
    writing_practice: [
      {
        id: 1,
        type: 'fill_blank',
        question: '_____ is an apple in my hand.',
        options: ['This', 'That', 'These', 'Those'],
        correctAnswer: 'This',
        explanation: 'The apple is in hand (near), so we use "This".',
      },
      {
        id: 2,
        type: 'fill_blank',
        question: 'Look at the sky! _____ is a flying bird.',
        options: ['This', 'That', 'These', 'There'],
        correctAnswer: 'That',
        explanation: 'The bird in the sky is far away, so we use "That".',
      },
    ],
    quiz: [
      {
        id: 1,
        question: 'When do we use "This"?',
        options: ['For one thing far away', 'For one thing near us', 'For many things', 'For animals only'],
        correctIndex: 1,
        explanation: 'We use "This" for a single object close to us.',
      },
    ],
    listen_sentences: [
      { en: 'This is my book in my hand.', mr: 'माझ्या हातातील हे माझे पुस्तक आहे.', hi: 'मेरे हाथ में यह मेरी किताब है।' },
      { en: 'That is a star in the sky.', mr: 'आकाशातील तो एक तारा आहे.', hi: 'आसमान में वह एक तारा है।' },
    ],
  },
  // LEVEL 2
  'g2-11': {
    title_en: 'Articles — a, an, the',
    title_mr: 'उपपदे (Articles — a, an, the)',
    title_hi: 'उपपद (Articles — a, an, the)',
    explanation_en: 'Use "a" before consonant sounds (a car, a boy). Use "an" before vowel sounds: a, e, i, o, u (an apple, an egg). Use "the" when talking about a specific thing or unique things (the sun, the school).',
    explanation_mr: 'व्यंजन आवाजापूर्वी (consonant sound) "a" वापरतात. स्वर आवाजापूर्वी (vowel sound: a, e, i, o, u) "an" वापरतात. विशिष्ट किंवा जगात एकमेव गोष्टीसाठी "the" वापरतात.',
    explanation_hi: 'व्यंजन ध्वनि से पहले "a" और स्वर ध्वनि (a, e, i, o, u) से पहले "an" लगाते हैं। किसी खास या एकमात्र वस्तु के लिए "the" लगाते हैं।',
    examples: [
      { type: 'positive', sentence: 'I have an apple and a banana.', marathi: 'माझ्याकडे एक सफरचंद आणि एक केळे आहे.', hindi: 'मेरे पास एक सेब और एक केला है।' },
      { type: 'positive', sentence: 'The sun rises in the east.', marathi: 'सूर्य पूर्वेला उगवतो.', hindi: 'सूरज पूर्व में उगता है।' },
      { type: 'negative', sentence: 'She does not have an umbrella.', marathi: 'तिच्याकडे छत्री नाही.', hindi: 'उसके पास छाता नहीं है।' },
      { type: 'question', sentence: 'Do you see a dog near the gate?', marathi: 'तुला गेटजवळ कुत्रा दिसत आहे का?', hindi: 'क्या तुम्हें गेट के पास कुत्ता दिख रहा है?' },
    ],
    common_mistakes: [
      {
        incorrect: 'He is a honest boy.',
        correct: 'He is an honest boy.',
        why: 'Honest starts with a vowel sound "o" (silent h), so we use "an".',
        marathiWhy: '"Honest" चा उच्चार स्वरासारखा (ऑनेस्ट) होतो, म्हणून "an" वापरतात.',
      },
    ],
    speaking_practice: {
      prompt: 'Describe two breakfast fruits or foods using "a" and "an".',
      marathiPrompt: '"a" आणि "an" वापरून दोन फळांबद्दल बोला.',
      suggestedAnswer: 'I eat an apple and a banana every morning.',
      targetPattern: 'I eat an [vowel item] and a [consonant item].',
      hints: ['apple', 'orange', 'egg', 'banana', 'biscuit'],
    },
    writing_practice: [
      {
        id: 1,
        type: 'fill_blank',
        question: 'Riya saw _____ elephant at the zoo.',
        options: ['a', 'an', 'the', 'no article'],
        correctAnswer: 'an',
        explanation: 'Elephant starts with the vowel sound "e", so use "an".',
      },
      {
        id: 2,
        type: 'fill_blank',
        question: '_____ moon shines at night.',
        options: ['A', 'An', 'The', 'None'],
        correctAnswer: 'The',
        explanation: 'The moon is a unique celestial body, so we use "The".',
      },
    ],
    quiz: [
      {
        id: 1,
        question: 'Which article goes before the word "umbrella"?',
        options: ['a', 'an', 'the', 'no article'],
        correctIndex: 1,
        explanation: 'Umbrella starts with the vowel sound "u", so we say "an umbrella".',
      },
    ],
    listen_sentences: [
      { en: 'An apple a day keeps the doctor away.', mr: 'दररोज एक सफरचंद खाल्ल्यास डॉक्टरांकडे जावे लागत नाही.', hi: 'रोज एक सेब डॉक्टर को दूर रखता है।' },
      { en: 'The sun gives us light.', mr: 'सूर्य आपल्याला प्रकाश देतो.', hi: 'सूरज हमें रोशनी देता है।' },
    ],
  },
  'g2-20': {
    title_en: 'Simple Present Tense',
    title_mr: 'साधा वर्तमानकाळ (Simple Present Tense)',
    title_hi: 'सामान्य वर्तमान काल',
    explanation_en: 'We use the Simple Present Tense for daily routines, habits, and universal truths. With he, she, it, we add -s or -es to the verb (He plays). With I, you, we, they, we use base form (I play).',
    explanation_mr: 'दैनंदिन सवयी, रोजच्या कृती आणि त्रिकालबाधित सत्यासाठी साधा वर्तमानकाळ वापरतात. He, She, It सोबत क्रियापदाला s किंवा es लावतात.',
    explanation_hi: 'दैनिक दिनचर्या, आदतों और सार्वभौमिक सत्य के लिए सामान्य वर्तमान काल का प्रयोग होता है। He, She, It के साथ verb में s/es लगता है।',
    examples: [
      { type: 'positive', sentence: 'I brush my teeth every morning.', marathi: 'मी रोज सकाळी दात घासतो.', hindi: 'मैं रोज सुबह दांत साफ करता हूँ।' },
      { type: 'positive', sentence: 'Riya speaks English with Teacher Anjali.', marathi: 'रिया अंजली मॅडमशी इंग्रजीत बोलते.', hindi: 'रिया अंजलि मैम से अंग्रेजी बोलती है।' },
      { type: 'negative', sentence: 'He does not wake up late.', marathi: 'तो उशिरा उठत नाही.', hindi: 'वह देर से नहीं जागता।' },
      { type: 'question', sentence: 'Do you play cricket on Sundays?', marathi: 'तू रविवारी क्रिकेट खेळतोस का?', hindi: 'क्या तुम रविवार को क्रिकेट खेलते हो?' },
    ],
    common_mistakes: [
      {
        incorrect: 'She go to school every day.',
        correct: 'She goes to school every day.',
        why: 'With third-person singular (she), add -es: goes.',
        marathiWhy: 'She सोबत क्रियापदाला s/es लागते: She goes.',
      },
    ],
    speaking_practice: {
      prompt: 'Tell me about two things you do every morning after waking up.',
      marathiPrompt: 'सकाळी उठल्यावर तुम्ही करणाऱ्या दोन गोष्टी इंग्रजीत सांगा.',
      suggestedAnswer: 'I wash my face and I drink warm water.',
      targetPattern: 'I [verb] and I [verb] every morning.',
      hints: ['wash', 'brush', 'drink', 'exercise', 'read'],
    },
    writing_practice: [
      {
        id: 1,
        type: 'fill_blank',
        question: 'Rohan _____ (play/plays) football in the evening.',
        options: ['play', 'plays', 'playing', 'played'],
        correctAnswer: 'plays',
        explanation: 'Rohan is singular (he), so we add -s: plays.',
      },
    ],
    quiz: [
      {
        id: 1,
        question: 'Which sentence is grammatically correct in Simple Present?',
        options: ['They plays cricket.', 'They play cricket.', 'They playing cricket.', 'They are play cricket.'],
        correctIndex: 1,
        explanation: 'With plural subject "They", we use the base verb "play".',
      },
    ],
    listen_sentences: [
      { en: 'The sun rises in the east.', mr: 'सूर्य पूर्वेला उगवतो.', hi: 'सूरज पूर्व में उगता है।' },
      { en: 'She speaks English very fluently.', mr: 'ती अगदी अस्खलित इंग्रजी बोलते.', hi: 'वह बहुत धाराप्रवाह अंग्रेजी बोलती है।' },
    ],
  },
  // LEVEL 7
  'g7-16': {
    title_en: 'Active and Passive Voice',
    title_mr: 'कर्तरी व कर्मणी प्रयोग (Active & Passive Voice)',
    title_hi: 'कर्तृवाच्य और कर्मवाच्य',
    explanation_en: 'In Active Voice, the subject performs the action (Riya wrote a letter). In Passive Voice, the object receives the action (A letter was written by Riya). Formula: Object + Helping Verb + Past Participle (V3) + by + Subject.',
    explanation_mr: 'Active Voice मध्ये कर्ता क्रिया करतो. Passive Voice मध्ये कर्मावर क्रिया होते. रचना: कर्म + सहाय्यकारी क्रियापद + V3 (तिसरे रूप) + by + कर्ता.',
    explanation_hi: 'Active में कर्ता कार्य करता है। Passive में कर्म पर कार्य होता है। रचना: Object + Helping Verb + V3 + by + Subject.',
    examples: [
      { type: 'positive', sentence: 'Active: Teacher Anjali teaches English.', marathi: 'अंजली मॅडम इंग्रजी शिकवतात.', hindi: 'अंजलि मैम अंग्रेजी पढ़ाती हैं।' },
      { type: 'positive', sentence: 'Passive: English is taught by Teacher Anjali.', marathi: 'इंग्रजी अंजली मॅडमद्वारे शिकवले जाते.', hindi: 'अंग्रेजी अंजलि मैम द्वारा पढ़ाई जाती है।' },
      { type: 'negative', sentence: 'Passive: The window was not broken by Rohan.', marathi: 'खिडकी रोहनकडून फोडली गेली नाही.', hindi: 'खिड़की रोहन द्वारा नहीं तोड़ी गई।' },
      { type: 'question', sentence: 'Passive: Was the homework finished by you?', marathi: 'गृहपाठ तुझ्याकडून पूर्ण केला गेला का?', hindi: 'क्या गृहकार्य तुम्हारे द्वारा पूरा किया गया?' },
    ],
    common_mistakes: [
      {
        incorrect: 'The song was sang by her.',
        correct: 'The song was sung by her.',
        why: 'Passive voice always requires the past participle (V3): sing -> sang -> sung.',
        marathiWhy: 'पॅसिव्ह व्हॉइसमध्ये नेहमी क्रियापदाचे तिसरे रूप (V3) लागते: sung.',
      },
    ],
    speaking_practice: {
      prompt: 'Convert this sentence into passive voice: "Rohan kicked the ball."',
      marathiPrompt: '"Rohan kicked the ball" या वाक्याचे पॅसिव्ह व्हॉइसमध्ये रूपांतर करा.',
      suggestedAnswer: 'The ball was kicked by Rohan.',
      targetPattern: 'The ball was kicked by Rohan.',
      hints: ['ball', 'was', 'kicked', 'by', 'Rohan'],
    },
    writing_practice: [
      {
        id: 1,
        type: 'fill_blank',
        question: 'Active: "She sings a song." -> Passive: "A song _____ by her."',
        options: ['is sung', 'was sung', 'is singing', 'sang'],
        correctAnswer: 'is sung',
        explanation: 'Simple present passive uses is/am/are + V3: "is sung".',
      },
    ],
    quiz: [
      {
        id: 1,
        question: 'What is the passive form of: "The chef cooked a delicious dinner"?',
        options: [
          'A delicious dinner was cooked by the chef.',
          'A delicious dinner is cooked by the chef.',
          'The chef was cooking delicious dinner.',
          'A delicious dinner cooked the chef.',
        ],
        correctIndex: 0,
        explanation: 'Past tense active "cooked" changes to "was cooked by the chef".',
      },
    ],
    listen_sentences: [
      { en: 'English is spoken all over the world.', mr: 'जगभरात इंग्रजी बोलली जाते.', hi: 'पूरी दुनिया में अंग्रेजी बोली जाती है।' },
      { en: 'The project was completed on time.', mr: 'प्रकल्प वेळेत पूर्ण झाला.', hi: 'परियोजना समय पर पूरी हुई।' },
    ],
  },
};

/**
 * Procedural generator that creates rich, mathematically sound grammar topics
 * for every single curriculum topic across all 10 levels.
 */
export function generateGrammarTopic(levelId: number, topicNumber: number, title_en: string, title_mr?: string, title_hi?: string): GrammarTopic {
  const id = `g${levelId}-${topicNumber}`;
  const bespoke = BESPOKE_TOPICS[id];

  const mrTitle = title_mr || title_en;
  const hiTitle = title_hi || title_en;

  // Level specific contextual difficulty tone
  const isEarly = levelId <= 2;
  const isElementary = levelId >= 3 && levelId <= 5;
  const isBoardOrHigher = levelId >= 6 && levelId <= 8;
  const isMastery = levelId >= 9;

  let explanation_en = bespoke?.explanation_en || '';
  let explanation_mr = bespoke?.explanation_mr || '';
  let explanation_hi = bespoke?.explanation_hi || '';

  if (!explanation_en) {
    if (isEarly) {
      explanation_en = `In this lesson, we learn about "${title_en}". It helps us speak and understand simple, correct English in daily conversation.`;
      explanation_mr = `या पाठात आपण "${mrTitle}" बद्दल सोप्या भाषेत शिकत आहोत. रोजच्या संभाषणात योग्य इंग्रजी बोलण्यासाठी याचा उपयोग होतो.`;
      explanation_hi = `इस पाठ में हम "${hiTitle}" के बारे में सीख रहे हैं। यह दैनिक बातचीत में सही अंग्रेजी बोलने में मदद करता है।`;
    } else if (isElementary) {
      explanation_en = `"${title_en}" is an essential building block of English grammar. Understanding its rules ensures accurate sentence formation and fluent spoken English.`;
      explanation_mr = `"${mrTitle}" हा इंग्रजी व्याकरणाचा एक अत्यंत महत्त्वाचा भाग आहे. याचे नियम समजल्यास अचूक वाक्यरचना आणि अस्खलित संभाषण सहज शक्य होते.`;
      explanation_hi = `"${hiTitle}" अंग्रेजी व्याकरण का एक महत्वपूर्ण अंग है। इसके नियमों को समझकर आप सही वाक्य और धाराप्रवाह बोल सकते हैं।`;
    } else if (isBoardOrHigher) {
      explanation_en = `Mastering "${title_en}" is critical for both Maharashtra Board examinations and professional spoken communication. Focus on syntactic patterns, exceptions, and natural usage.`;
      explanation_mr = `"${mrTitle}" वर प्रभुत्व मिळवणे बोर्ड परीक्षा आणि व्यावसायिक संभाषणासाठी अत्यंत आवश्यक आहे. नियमांचे सूक्ष्म पैलू आणि व्यावहारिक वापर लक्षात घ्या.`;
      explanation_hi = `"${hiTitle}" पर महारत बोर्ड परीक्षा और व्यावहारिक बोलने दोनों के लिए आवश्यक है। इसके नियमों और उपयोग पर ध्यान दें।`;
    } else {
      explanation_en = `"${title_en}" represents high-level grammatical precision, stylistic flexibility, and academic/professional mastery in spoken and written discourse.`;
      explanation_mr = `"${mrTitle}" हे व्यावसायिक, शैक्षणिक आणि उच्च संभाषणातील अचूकतेचे प्रगत व्याकरण सूत्र आहे.`;
      explanation_hi = `"${hiTitle}" पेशेवर और अकादमिक स्तर पर उच्च व्याकरणिक शुद्धता प्रदान करता है।`;
    }
  }

  const examples = bespoke?.examples || [
    {
      type: 'positive',
      sentence: `Practice using ${title_en} in daily English conversation.`,
      marathi: `दैनंदिन इंग्रजी संभाषणात ${mrTitle} चा योग्य वापर करा.`,
      hindi: `दैनिक बातचीत में ${hiTitle} का सही उपयोग करें।`,
    },
    {
      type: 'positive',
      sentence: `Riya understood the concept of ${title_en} with Teacher Anjali.`,
      marathi: `रियाने अंजली मॅडमच्या मदतीने ${mrTitle} ची संकल्पना समजून घेतली.`,
      hindi: `रिया ने अंजलि मैम की मदद से ${hiTitle} की अवधारणा समझी।`,
    },
    {
      type: 'negative',
      sentence: `Do not ignore the key rules of ${title_en}.`,
      marathi: `${mrTitle} चे मुख्य नियम दुर्लक्षित करू नका.`,
      hindi: `${hiTitle} के मुख्य नियमों की अनदेखी न करें।`,
    },
    {
      type: 'question',
      sentence: `Can you create a correct sentence using ${title_en}?`,
      marathi: `तुम्ही ${mrTitle} वापरून एक बरोबर वाक्य तयार करू शकता का?`,
      hindi: `क्या आप ${hiTitle} का उपयोग करके एक सही वाक्य बना सकते हैं?`,
    },
  ];

  const common_mistakes = bespoke?.common_mistakes || [
    {
      incorrect: `Using direct native word order without applying rules of ${title_en}.`,
      correct: `Follow English Subject-Verb-Object order and specific ${title_en} structures.`,
      why: `English syntax requires following structured rules rather than word-for-word translation.`,
      marathiWhy: `शब्दशः भाषांतर करण्याऐवजी इंग्रजी व्याकरणाच्या रचनेनुसार वाक्य बनवावे.`,
    },
  ];

  const speaking_practice = bespoke?.speaking_practice || {
    prompt: `Speak a clear, complete sentence demonstrating "${title_en}".`,
    marathiPrompt: `"${mrTitle}" दर्शवणारे एक स्पष्ट आणि परिपूर्ण इंग्रजी वाक्य बोला.`,
    hindiPrompt: `"${hiTitle}" को दर्शाने वाला एक स्पष्ट अंग्रेजी वाक्य बोलिए।`,
    suggestedAnswer: `I practice ${title_en} to speak English fluently with confidence.`,
    targetPattern: `I [action] ${title_en} [purpose].`,
    hints: ['practice', 'speak', 'English', 'daily', 'correctly'],
  };

  const writing_practice = bespoke?.writing_practice || [
    {
      id: 1,
      type: 'fill_blank',
      question: `Choose the best sentence pattern for "${title_en}":`,
      options: [
        `Accurate and structured sentence using ${title_en}`,
        `Broken words without verb agreement`,
        `Incorrect tense order`,
        `Direct phonetic spelling`,
      ],
      correctAnswer: `Accurate and structured sentence using ${title_en}`,
      explanation: `Grammar requires proper agreement and standard English structure.`,
    },
    {
      id: 2,
      type: 'fill_blank',
      question: `When applying "${title_en}", the primary focus is on:`,
      options: ['Clarity and correct grammar', 'Speed only', 'Silent reading', 'Memorizing without speaking'],
      correctAnswer: 'Clarity and correct grammar',
      explanation: 'Clarity and accuracy in spoken English is the core objective of Smart English Sathi.',
    },
  ];

  const quiz = bespoke?.quiz || [
    {
      id: 1,
      question: `What is the primary objective of studying "${title_en}"?`,
      options: [
        'To speak and write English with grammatical accuracy',
        'To avoid speaking English',
        'To translate literally without grammar',
        'None of the above',
      ],
      correctIndex: 0,
      explanation: `Mastering ${title_en} allows students to communicate naturally and accurately.`,
    },
    {
      id: 2,
      question: `In spoken English, how should "${title_en}" be practiced?`,
      options: [
        'By listening to Teacher Anjali and speaking aloud',
        'Only by silent reading',
        'By writing once and forgetting',
        'Without checking mistakes',
      ],
      correctIndex: 0,
      explanation: `Active listening and speaking practice ensures deep memory retention and fluency.`,
    },
  ];

  const listen_sentences = bespoke?.listen_sentences || [
    {
      en: `Today we are learning ${title_en} with Teacher Anjali.`,
      mr: `आज आपण अंजली मॅडमसोबत ${mrTitle} शिकत आहोत.`,
      hi: `आज हम अंजलि मैम के साथ ${hiTitle} सीख रहे हैं।`,
    },
    {
      en: `Practice speaking ${title_en} every day to gain confidence.`,
      mr: `आत्मविश्वास मिळवण्यासाठी रोज ${mrTitle} चे सराव करा.`,
      hi: `आत्मविश्वास पाने के लिए रोज ${hiTitle} का अभ्यास करें।`,
    },
  ];

  return {
    id,
    level_id: levelId,
    topic_number: topicNumber,
    title_en,
    title_mr: mrTitle,
    title_hi: hiTitle,
    explanation_en,
    explanation_mr,
    explanation_hi,
    examples,
    common_mistakes,
    speaking_practice,
    writing_practice,
    quiz,
    listen_sentences,
    status: 'published',
    created_at: new Date().toISOString(),
  };
}

/**
 * Builds full curriculum topic array across all 10 levels
 */
export function buildInitialGrammarTopics(): GrammarTopic[] {
  const allTopics: GrammarTopic[] = [];

  CURRICULUM_DEFINITIONS.forEach((lvlDef) => {
    lvlDef.topics.forEach((t) => {
      allTopics.push(
        generateGrammarTopic(lvlDef.levelId, t.number, t.title_en, t.title_mr, t.title_hi)
      );
    });
  });

  return allTopics;
}
