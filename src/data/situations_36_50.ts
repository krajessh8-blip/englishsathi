import { Situation } from '../types';

export const SITUATIONS_36_50: Situation[] = [
  // --- LEVEL 8 (Class 12 Advanced+: 36 - 40) ---
  {
    id: 36,
    level: 8,
    group: 'D',
    title: 'Physics practical viva assessment',
    subtitle: 'Explaining potentiometer calibration and internal resistance',
    setting: 'Physics Lab • External Examiner Viva Voce',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Candidate, explain the null deflection principle of the potentiometer.', marathi: 'पोटेन्शियोमीटरच्या शून्य विक्षेपण तत्त्वाविषयी माहिती सांगा.', hindi: 'पोटेंशियोमीटर के शून्य विक्षेपण सिद्धांत की व्याख्या करें।' },
      { id: 2, who: 'riya', text: 'At balance point, no current flows through the galvanometer, measuring true electromotive force.', marathi: 'संतुलन बिंदूवर गॅल्व्हानोमीटरमधून विद्युतप्रवाह वाहत नाही, ज्यामुळे अचूक ईएमएफ मोजता येतो.', hindi: 'संतुलन बिंदु पर गैल्वेनोमीटर से कोई धारा नहीं बहती, जिससे वास्तविक ईएमएफ मापा जाता है।' },
      { id: 3, who: 'teacher', text: 'Why is a potentiometer favored over a standard digital voltmeter?', marathi: 'साध्या व्होल्टमीटरपेक्षा पोटेन्शियोमीटर का श्रेष्ठ मानला जातो?', hindi: 'साधारण वोल्टमीटर की तुलना में पोटेंशियोमीटर को प्राथमिकता क्यों दी जाती है?' },
      { id: 4, who: 'riya', text: 'Because a voltmeter draws a finite current, introducing systematic measurement error.', marathi: 'कारण व्होल्टमीटर विद्युतप्रवाह खेचून घेतो, ज्यामुळे मोजमापात त्रुटी येऊ शकते.', hindi: 'क्योंकि वोल्टमीटर धारा खींचता है, जिससे मापन में त्रुटि आ सकती है।' },
      { id: 5, who: 'teacher', text: 'Outstanding conceptual clarity. Maximum marks awarded for your viva.', marathi: 'उत्कृष्ट शास्त्रीय ज्ञान. प्रात्यक्षिक परीक्षेत पूर्ण गुण दिले आहेत.', hindi: 'शानदार सैद्धांतिक समझ। आपको पूरे अंक दिए जाते हैं।' },
    ],
    vocabulary: [
      { word: 'deflection', partOfSpeech: 'noun', meaning: 'The movement of a pointer on an instrument scale', marathi: 'काट्याचे विक्षेपण / हालचाल', hindi: 'विक्षेपण / सुई का घूमना', example: 'The needle showed zero deflection at balance.' },
      { word: 'systematic', partOfSpeech: 'adjective', meaning: 'Done according to a fixed plan or inherent error', marathi: 'नियमित / पद्धतशीर', hindi: 'क्रमबद्ध / व्यवस्थित', example: 'Calibrate instruments to avoid systematic error.' },
    ],
    questions: [
      { id: 1, speaker: 'riya', fullSentence: 'Zero deflection indicates the true balance point.', missingWord: 'deflection', marathi: 'शून्य विक्षेपण अचूक संतुलन दर्शवते.', hindi: 'शून्य विक्षेपण संतुलन दर्शाता है।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'What precautions must be observed during the potentiometer experiment?',
        teacherMarathi: 'पोटेन्शियोमीटर प्रयोगात कोणती काळजी घ्यावी?', teacherHindi: 'इस प्रयोग में क्या सावधानी बरतनी चाहिए?',
        suggestedRiyaReplies: ['Do not drag the jockey along the wire to prevent altering its uniform diameter.'],
        keyWordsNeeded: ['jockey', 'wire', 'precautions', 'uniform'],
        encouragement: 'High-caliber practical laboratory mastery.',
      },
    ],
  },
  {
    id: 37,
    level: 8,
    group: 'D',
    title: 'University hostel check-in',
    subtitle: 'Meeting dorm warden and agreeing on roommate guidelines',
    setting: 'Campus Residence Hall • Room handover and settling in',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Welcome to Gargi Hostel, Riya. Here are your room keys and inventory checklist.', marathi: 'गार्गी वसतिगृहात आपले स्वागत आहे. या खोलीच्या चाव्या आणि साहित्याची यादी.', hindi: 'गार्गी छात्रावास में आपका स्वागत है। यह रही चाबी और सामान की सूची।' },
      { id: 2, who: 'riya', text: 'Thank you, ma’am. Could you clarify quiet study hours and library return curfew?', marathi: 'धन्यवाद मॅडम. अभ्यासाच्या शांततेच्या वेळा आणि रात्री परतण्याचे नियम सांगाल का?', hindi: 'धन्यवाद मैम। क्या आप अध्ययन के शांत समय और रात के नियम स्पष्ट कर सकती हैं?' },
      { id: 3, who: 'teacher', text: 'Quiet hours begin at 10 PM. The main foyer biometric gates lock at 9:30 PM.', marathi: 'शांतता रात्री १० वाजता सुरू होते. मुख्य दरवाजा रात्री ९:३० वाजता बंद होतो.', hindi: 'रात 10 बजे से शांति समय शुरू होता है और मुख्य द्वार 9:30 बजे बंद होता है।' },
      { id: 4, who: 'riya', text: 'Understood. My roommate and I will coordinate study lamps and morning alarms respectfully.', marathi: 'समजले. मी आणि माझी खोलीतील मैत्रीण एकमेकांचा मान राखून वेळा सांभाळू.', hindi: 'समझ गई। मैं और मेरी रूममेट एक-दूसरे की सुविधा का ध्यान रखेंगे।' },
      { id: 5, who: 'teacher', text: 'Have an enriching and peaceful academic year on campus.', marathi: 'आपले शैक्षणिक वर्ष आनंददायी आणि प्रगतीचे जावो.', hindi: 'परिसर में आपका शैक्षणिक वर्ष सुखद और सफल रहे।' },
    ],
    vocabulary: [
      { word: 'inventory', partOfSpeech: 'noun', meaning: 'A complete list of items in a room or store', marathi: 'वस्तूंची तपशीलवार यादी', hindi: 'सामान की सूची', example: 'Check the room furniture inventory.' },
      { word: 'curfew', partOfSpeech: 'noun', meaning: 'A rule requiring people to remain indoors between specified hours', marathi: 'वेळेचे बंधन / कडक नियम', hindi: 'नियत समय सीमा', example: 'Students must observe the hostel curfew.' },
    ],
    questions: [
      { id: 1, speaker: 'teacher', fullSentence: 'Sign the room inventory sheet upon arrival.', missingWord: 'inventory', marathi: 'साहित्याच्या यादीवर स्वाक्षरी करा.', hindi: 'सामान की सूची पर हस्ताक्षर करें।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'Hello roommate! How shall we divide wardrobe shelves and cleaning duties?',
        teacherMarathi: 'आपण कपाटाचे कप्पे आणि स्वच्छतेचे काम कसे वाटून घेऊया?', teacherHindi: 'हम अलमारी और सफाई का काम कैसे बाँटें?',
        suggestedRiyaReplies: ['We can split the shelves equally and alternate cleaning duties weekly.'],
        keyWordsNeeded: ['split', 'cleaning', 'alternate', 'equally'],
        encouragement: 'Mature communal living communication.',
      },
    ],
  },
  {
    id: 38,
    level: 8,
    group: 'D',
    title: 'Internship interview at startup',
    subtitle: 'Discussing frontend development and open source contributions',
    setting: 'Innovation Incubator • Technical hiring interview',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Riya, what intrigued you to apply for our AI EdTech development internship?', marathi: 'आमच्या एआय शैक्षणिक सॉफ्टवेअर इंटर्नशिपसाठी अर्ज करण्यास कशाने प्रेरित केले?', hindi: 'हमारी एडटेक इंटर्नशिप के लिए आवेदन करने हेतु आपको क्या प्रेरणा मिली?' },
      { id: 2, who: 'riya', text: 'Your platform democratizes vernacular language learning using real-time speech analytics.', marathi: 'आपले व्यासपीठ प्रादेशिक भाषांमधील इंग्रजी शिक्षण सोपे करते हे मला भावले.', hindi: 'आपका प्लेटफॉर्म क्षेत्रीय भाषाओं में अंग्रेजी सीखने को सुलभ बनाता है।' },
      { id: 3, who: 'teacher', text: 'Walk me through a component or project you built recently.', marathi: 'नुकताच तयार केलेला एखादा प्रकल्प किंवा कॉम्पोनंट समजावून सांगा.', hindi: 'हाल ही में बनाए किसी प्रोजेक्ट या कोड के बारे में बताइए।' },
      { id: 4, who: 'riya', text: 'I created an accessible speech practice interface with interactive waveform feedback and offline state caching.', marathi: 'मी ध्वनितरंग आणि ऑफलाइन सुविधेसह बोलण्याचा सराव करणारे वेब ॲप बनवले.', hindi: 'मैंने ऑडियो वेवफॉर्म और ऑफलाइन सुविधा के साथ एक स्पीच प्रैक्टिस ऐप बनाया।' },
      { id: 5, who: 'teacher', text: 'Very impressive engineering intuition. We would love to offer you the internship.', marathi: 'उत्कृष्ट तांत्रिक कौशल्य! आम्ही तुम्हाला इंटर्नशिप ऑफर करत आहोत.', hindi: 'बेहतरीन तकनीकी सूझबूझ! हम आपको इंटर्नशिप का प्रस्ताव देते हैं।' },
    ],
    vocabulary: [
      { word: 'democratizes', partOfSpeech: 'verb', meaning: 'Makes something accessible to everyone', marathi: 'सर्वांसाठी खुले / सुलभ करणे', hindi: 'सुलभ व सर्वव्यापी बनाना', example: 'Open source technology democratizes education.' },
      { word: 'intuition', partOfSpeech: 'noun', meaning: 'The ability to understand something instinctively', marathi: 'सहज अंतर्ज्ञान', hindi: 'सहज ज्ञान / अंतर्दृष्टि', example: 'She possessed strong architectural intuition.' },
    ],
    questions: [
      { id: 1, speaker: 'riya', fullSentence: 'Digital tools democratize quality schooling.', missingWord: 'democratize', marathi: 'डिजिटल साधने शिक्षण सुलभ करतात.', hindi: 'डिजिटल उपकरण शिक्षा को सुलभ बनाते हैं।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'How do you prioritize deliverables when juggling tight deadlines?',
        teacherMarathi: 'कमी वेळेत महत्त्वाची कामे कशी पूर्ण करता?', teacherHindi: 'कम समय में जरूरी काम कैसे पूरे करते हैं?',
        suggestedRiyaReplies: ['I break projects into modular milestones and address critical dependencies first.'],
        keyWordsNeeded: ['milestones', 'modular', 'dependencies', 'prioritize'],
        encouragement: 'Professional software engineering fluency.',
      },
    ],
  },
  {
    id: 39,
    level: 8,
    group: 'D',
    title: 'Hospital emergency desk triage',
    subtitle: 'Reporting acute allergic reaction and medical history',
    setting: 'City Hospital Emergency Ward • Triage nurse assessment',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Triage desk. Please state the patient symptoms and immediate cause.', marathi: 'तातडीचा विभाग. रुग्णाची लक्षणे आणि कारण सांगा.', hindi: 'आपातकालीन डेस्क। मरीज के लक्षण और कारण बताइए।' },
      { id: 2, who: 'riya', text: 'My friend suffered sudden breathing difficulty and hives ten minutes after consuming peanut sauce.', marathi: 'शेंगदाण्याची चटणी खाल्ल्यानंतर मैत्रिणीला श्वास घेण्यास त्रास आणि अंगावर पुरळ उठले आहे.', hindi: 'मूंगफली की चटनी खाने के दस मिनट बाद मेरी सहेली को साँस लेने में तकलीफ और चकत्ते हो गए।' },
      { id: 3, who: 'teacher', text: 'Does she have a known history of anaphylaxis or asthma?', marathi: 'पूर्वी अशा प्रकारच्या तीव्र ॲलर्जीचा किंवा दम्याचा त्रास होता का?', hindi: 'क्या उन्हें पहले कभी तीव्र एलर्जी या अस्थमा की शिकायत रही है?' },
      { id: 4, who: 'riya', text: 'She is mildly asthmatic, but this rapid swelling is unprecedented.', marathi: 'थोड्या प्रमाणात दम्याचा त्रास आहे, पण अशी सूज पहिल्यांदाच आली आहे.', hindi: 'हल्का अस्थमा है, लेकिन इतनी सूजन पहले कभी नहीं हुई।' },
      { id: 5, who: 'teacher', text: 'Doctor, prepare epinephrine and oxygen immediately! Room 3, right now.', marathi: 'डॉक्टर, तातडीने इंजेक्शन आणि ऑक्सिजन सज्ज करा! तिसऱ्या रूममध्ये घ्या.', hindi: 'डॉक्टर, तुरंत इंजेक्शन और ऑक्सीजन तैयार कीजिए! रूम 3 में ले जाइए।' },
    ],
    vocabulary: [
      { word: 'anaphylaxis', partOfSpeech: 'noun', meaning: 'A severe, potentially life-threatening allergic reaction', marathi: 'अतिशय तीव्र ॲलर्जीचा झटका', hindi: 'गंभीर एलर्जिक प्रतिक्रिया', example: 'Peanut allergy can cause anaphylaxis.' },
      { word: 'unprecedented', partOfSpeech: 'adjective', meaning: 'Never done or known before', marathi: 'अभूतपूर्व / पूर्वी कधीही न घडलेले', hindi: 'अभूतपूर्व', example: 'The patient experienced unprecedented swelling.' },
    ],
    questions: [
      { id: 1, speaker: 'riya', fullSentence: 'This allergic reaction was completely unprecedented.', missingWord: 'unprecedented', marathi: 'ही ॲलर्जी यापूर्वी कधीही झाली नव्हती.', hindi: 'यह एलर्जी अभूतपूर्व थी।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'Can you provide the patient emergency guardian contact number?',
        teacherMarathi: 'पालकांचा आपत्कालीन संपर्क क्रमांक देऊ शकाल का?', teacherHindi: 'अभिभावक का आपातकालीन नंबर बता सकते हैं?',
        suggestedRiyaReplies: ['Yes, here is her father mobile number: plus ninety-one nine-eight-two...'],
        keyWordsNeeded: ['contact', 'number', 'mobile', 'father'],
        encouragement: 'Calm and precise emergency communication.',
      },
    ],
  },
  {
    id: 40,
    level: 8,
    group: 'D',
    title: 'Airport security and boarding',
    subtitle: 'Checking baggage weight and clearing biometric gate',
    setting: 'International Airport Terminal • Baggage drop counter',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Good afternoon. Passport, national ID, and digital boarding pass please.', marathi: 'शुभ दुपार. कृपया पासपोर्ट, ओळखपत्र आणि बोर्डिंग पास दाखवा.', hindi: 'शुभ दोपहर। कृपया पासपोर्ट, पहचान पत्र और बोर्डिंग पास दिखाइए।' },
      { id: 2, who: 'riya', text: 'Here are my boarding documents. I have one check-in suitcase and a laptop backpack.', marathi: 'हे घ्या कागदपत्रे. माझ्याकडे एक मोठी बॅग आणि लॅपटॉपची बॅग आहे.', hindi: 'यह रहे दस्तावेज। मेरे पास एक चेक-इन बैग और एक लैपटॉप बैग है।' },
      { id: 3, who: 'teacher', text: 'Place your suitcase on the conveyor belt. 14.8 kilograms—well within baggage allowance.', marathi: 'बॅग पट्ट्यावर ठेवा. १४.८ किलो वजन आहे—मर्यादेत आहे.', hindi: 'सूटकेस बेल्ट पर रखिए। 14.8 किलो—बिल्कुल सही वजन है।' },
      { id: 4, who: 'riya', text: 'Excellent. Which security channel leads to Boarding Gate 18?', marathi: 'उत्तम. गेट १८ कडे जाणारा सुरक्षा तपासणी मार्ग कोणता आहे?', hindi: 'सुरक्षा जाँच का कौन सा रास्ता गेट 18 की ओर जाता है?' },
      { id: 5, who: 'teacher', text: 'Turn left through DigiYatra e-gates. Have a safe and pleasant flight!', marathi: 'डावीकडील ई-गेट्समधून जा. आपला प्रवास सुखकर होवो!', hindi: 'बाएँ मुड़कर ई-गेट से निकलें। आपकी यात्रा सुखद हो!' },
    ],
    vocabulary: [
      { word: 'allowance', partOfSpeech: 'noun', meaning: 'The amount of baggage permitted without extra charge', marathi: 'परवानगी दिलेले वजन', hindi: 'सामान की सीमा', example: 'Keep within the 15kg airline baggage allowance.' },
      { word: 'biometric', partOfSpeech: 'adjective', meaning: 'Relating to biological characteristics used for identification', marathi: 'बायोमेट्रिक / जैविक ओळख', hindi: 'बायोमेट्रिक पहचान', example: 'Biometric gates speed up airport boarding.' },
    ],
    questions: [
      { id: 1, speaker: 'teacher', fullSentence: 'Your bag is well within the weight allowance.', missingWord: 'allowance', marathi: 'बॅगचे वजन नियमात आहे.', hindi: 'बैग वजन की सीमा के भीतर है।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'Do you have any power banks or lithium batteries inside your check-in baggage?',
        teacherMarathi: 'मोठ्या बॅगेत पॉवर बँक किंवा बॅटरी आहे का?', teacherHindi: 'क्या चेक-इन बैग में कोई पावर बैंक है?',
        suggestedRiyaReplies: ['No, all lithium batteries and devices are in my cabin carry-on bag.'],
        keyWordsNeeded: ['batteries', 'cabin', 'carry-on', 'devices'],
        encouragement: 'Flawless international travel protocol.',
      },
    ],
  },

  // --- LEVEL 9 (Fluent 1: 41 - 45) ---
  {
    id: 41,
    level: 9,
    group: 'D',
    title: 'Corporate behavioral job interview',
    subtitle: 'Demonstrating leadership using the STAR framework',
    setting: 'Corporate Headquarters • Executive Talent Interview',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Welcome Riya. Describe a situation where you mediated a severe team conflict.', marathi: 'संघातील गंभीर मतभेद तू कसे सोडवले याचा एखादा प्रसंग सांग.', hindi: 'एक ऐसी स्थिति का वर्णन करें जहाँ आपने टीम के विवाद को सुलझाया।' },
      { id: 2, who: 'riya', text: 'During our robotics competition, two engineers disagreed on sensor placement, halting testing.', marathi: 'रोबोटिक्स स्पर्धेत सेन्सर बसवण्यावरून दोन सदस्यांत वाद होऊन काम थांबले होते.', hindi: 'रोबोटिक्स प्रतियोगिता में दो साथियों में मतभेद के कारण काम रुक गया था।' },
      { id: 3, who: 'teacher', text: 'What precise action did you initiate to realign the team?', marathi: 'काम पूर्ववत करण्यासाठी तू नक्की काय पाऊल उचललेस?', hindi: 'टीम को पुनः एकजुट करने के लिए आपने क्या ठोस कदम उठाया?' },
      { id: 4, who: 'riya', text: 'I conducted objective benchmark trials for both configurations, letting data decide the final design.', marathi: 'मी दोन्ही पद्धतींची चाचणी घेऊन डेटाच्या आधारे अंतिम निर्णय घेतला.', hindi: 'मैंने दोनों विधियों का परीक्षण किया और डेटा के आधार पर सर्वसम्मत निर्णय लिया।' },
      { id: 5, who: 'teacher', text: 'Decisive, data-driven leadership. That articulates executive maturity.', marathi: 'अभ्यासू आणि परिपक्व नेतृत्व! अतिशय प्रभावी उत्तर.', hindi: 'तथ्यों पर आधारित नेतृत्व। यह उत्कृष्ट परिपक्वता को दर्शाता है।' },
    ],
    vocabulary: [
      { word: 'mediated', partOfSpeech: 'verb', meaning: 'Intervened between people to bring about agreement', marathi: 'मध्यस्थी केली', hindi: 'सुलह कराई / मध्यस्थता की', example: 'She mediated the workplace dispute.' },
      { word: 'benchmark', partOfSpeech: 'noun / verb', meaning: 'A standard by which things may be measured or tested', marathi: 'तुलनात्मक प्रमाण / निकष', hindi: 'मानक / तुलना बिंदु', example: 'Set high benchmarks for engineering quality.' },
    ],
    questions: [
      { id: 1, speaker: 'riya', fullSentence: 'We established objective performance benchmarks.', missingWord: 'benchmarks', marathi: 'आम्ही कामगिरीचे निकष ठरवले.', hindi: 'हमने प्रदर्शन के मानक तय किए।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'What is your philosophy on receiving constructive criticism?',
        teacherMarathi: 'रचनात्मक टीकेकडे तुम्ही कसे पाहता?', teacherHindi: 'रचनात्मक आलोचना को आप किस दृष्टिकोण से लेते हैं?',
        suggestedRiyaReplies: ['I view constructive feedback as the most expedited path toward professional excellence.'],
        keyWordsNeeded: ['feedback', 'constructive', 'excellence', 'growth'],
        encouragement: 'Top-tier corporate communication.',
      },
    ],
  },
  {
    id: 42,
    level: 9,
    group: 'D',
    title: 'Startup investor pitch deck',
    subtitle: 'Presenting unit economics and market scalability',
    setting: 'Venture Capital Boardroom • Seed funding round presentation',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Founders, articulate your customer acquisition cost and lifetime customer value.', marathi: 'ग्राहक मिळवण्याचा खर्च आणि त्यातून मिळणारे उत्पन्न स्पष्ट करा.', hindi: 'ग्राहक अधिग्रहण लागत और आजीवन ग्राहक मूल्य स्पष्ट कीजिए।' },
      { id: 2, who: 'riya', text: 'Our organic school referral loops hold CAC under five dollars, while LTV exceeds seventy dollars over three academic cycles.', marathi: 'शाळांच्या शिफारशींमुळे ग्राहक खर्च खूप कमी असून उत्पन्न तिप्पट आहे.', hindi: 'रेफरल के कारण लागत बेहद कम है और दीर्घकालिक मुनाफा चौदह गुना है।' },
      { id: 3, who: 'teacher', text: 'What defends your business against well-capitalized multinational competitors?', marathi: 'मोठ्या परदेशी कंपन्यांपासून तुमच्या व्यवसायाचे रक्षण कशामुळे होईल?', hindi: 'बड़ी बहुराष्ट्रीय कंपनियों के मुकाबले आपका क्या सुरक्षा कवच है?' },
      { id: 4, who: 'riya', text: 'Our proprietary dialect speech corpus and deep institutional trust form an insurmountable local moat.', marathi: 'स्थानिक बोलीभाषेचा समृद्ध डेटाबेस ही आमची सर्वात मोठी ताकद आहे.', hindi: 'स्थानीय भाषाओं का हमारा अनूठा डेटाबेस हमारी सबसे मजबूत ढाल है।' },
      { id: 5, who: 'teacher', text: 'A compelling investment thesis. We are ready to draft the term sheet.', marathi: 'अतिशय प्रभावी व्यवसाय आराखडा! आम्ही गुंतवणूक करण्यास तयार आहोत.', hindi: 'शानदार प्रस्ताव! हम निवेश पत्र तैयार करने के लिए सहमत हैं।' },
    ],
    vocabulary: [
      { word: 'proprietary', partOfSpeech: 'adjective', meaning: 'Exclusively owned by a private creator or entity', marathi: 'स्वतःच्या मालकीचे', hindi: 'मालिकाना / निजी', example: 'They built proprietary speech recognition algorithms.' },
      { word: 'insurmountable', partOfSpeech: 'adjective', meaning: 'Too great to be overcome', marathi: 'अभेद्य / पार करण्यास अशक्य', hindi: 'अजेय / जिसे पार न किया जा सके', example: 'Their network effects created an insurmountable moat.' },
    ],
    questions: [
      { id: 1, speaker: 'riya', fullSentence: 'Our proprietary model ensures competitive advantage.', missingWord: 'proprietary', marathi: 'आमचे स्वतःचे मॉडेल हीच ताकद आहे.', hindi: 'हमारा मालिकाना मॉडल हमें बढ़त दिलाता है।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'How will you deploy the seed capital over the next twelve months?',
        teacherMarathi: 'पुढील वर्षभरात तुम्ही भांडवलाचा विनियोग कसा कराल?', teacherHindi: 'अगले बारह महीनों में पूँजी का उपयोग कैसे करेंगे?',
        suggestedRiyaReplies: ['Sixty percent will fund native voice model expansion and engineering hires.'],
        keyWordsNeeded: ['capital', 'engineering', 'expansion', 'model'],
        encouragement: 'Masterful venture pitch storytelling.',
      },
    ],
  },
  {
    id: 43,
    level: 9,
    group: 'D',
    title: 'Agile team sprint retrospective',
    subtitle: 'Analyzing velocity, cycle time, and system bottlenecks',
    setting: 'Engineering Scrum Room • Two-week sprint review',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Welcome engineers. Sprint 14 finished with 92% story point completion.', marathi: 'अभिनंदन अभियंत्यांनो! १४वा स्प्रिंट ९२% यशस्वी झाला.', hindi: 'इंजीनियर्स, 14वां स्प्रिंट 92% कार्य समाप्ति के साथ पूरा हुआ।' },
      { id: 2, who: 'riya', text: 'The automated integration testing saved 14 developer hours during release deployment.', marathi: 'स्वयंचलित चाचणीमुळे रिलीज दरम्यान डेव्हलपर्सचे १४ तास वाचले.', hindi: 'ऑटोमेटेड टेस्टिंग से रिलीज के दौरान डेवलपर्स के 14 घंटे बचे।' },
      { id: 3, who: 'teacher', text: 'What impeded the remaining eight percent from shipping to staging?', marathi: 'उरलेले आठ टक्के काम वेळेत पूर्ण का होऊ शकले नाही?', hindi: 'बचे हुए आठ प्रतिशत कार्य में क्या बाधा आई?' },
      { id: 4, who: 'riya', text: 'Third-party webhook rate limits throttled asynchronous voice generation queues.', marathi: 'बाह्य सर्व्हरच्या मर्यादांमुळे व्हॉईस निर्मितीच्या रांगेत अडथळा आला.', hindi: 'थर्ड-पार्टी सर्वर की लिमिट के कारण वॉइस क्यू में रुकावट आई।' },
      { id: 5, who: 'teacher', text: 'Let us provision distributed Redis workers to decouple that pipeline.', marathi: 'ती प्रक्रिया स्वतंत्र करण्यासाठी स्वतंत्र सर्व्हर वापरूया.', hindi: 'उस प्रक्रिया को सुगम बनाने के लिए अलग सर्वर जोड़ते हैं।' },
    ],
    vocabulary: [
      { word: 'impeded', partOfSpeech: 'verb', meaning: 'Delayed or prevented progress', marathi: 'अडथळा आणला', hindi: 'बाधा डाली / रोका', example: 'Network latency impeded real-time syncing.' },
      { word: 'decouple', partOfSpeech: 'verb', meaning: 'Separate or disengage connected systems', marathi: 'परस्परावलंबी यंत्रणा वेगळी करणे', hindi: 'अलग करना / स्वतंत्र करना', example: 'Decouple microservices for higher resilience.' },
    ],
    questions: [
      { id: 1, speaker: 'teacher', fullSentence: 'Bottlenecks impeded sprint completion.', missingWord: 'impeded', marathi: 'अडथळ्यांमुळे कामात उशीर झाला.', hindi: 'रुकावटों ने कार्य की गति धीमी कर दी।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'What action item should we commit to in our next sprint iteration?',
        teacherMarathi: 'पुढील स्प्रिंटसाठी आपण कोणता संकल्प करावा?', teacherHindi: 'अगले स्प्रिंट के लिए हमें क्या संकल्प लेना चाहिए?',
        suggestedRiyaReplies: ['We will implement response caching to mitigate external API throttling.'],
        keyWordsNeeded: ['caching', 'implement', 'mitigate', 'API'],
        encouragement: 'Refined agile software dialogue.',
      },
    ],
  },
  {
    id: 44,
    level: 9,
    group: 'D',
    title: 'Enterprise client conflict de-escalation',
    subtitle: 'Resolving service downtime grievance with proactive remediation',
    setting: 'Executive Customer Success Call • Managing major corporate client',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Your unexpected server outage interrupted our school district assessments this morning!', marathi: 'तुमच्या सर्व्हर डाऊनमुळे आज सकाळी आमच्या परीक्षा खोळंबल्या!', hindi: 'आपके सर्वर डाउन होने से आज सुबह हमारे स्कूल की परीक्षाएँ बाधित हुईं!' },
      { id: 2, who: 'riya', text: 'We sincerely apologize for this disruption, Dr. Deshpande. I fully empathize with your frustration.', marathi: 'झालेल्या त्रासाबद्दल आम्ही मनापासून दिलगीर आहोत. आपली अडचण मी समजू शकते.', hindi: 'इस असुविधा के लिए हम हृदय से क्षमा चाहते हैं। आपकी परेशानी हम समझ सकते हैं।' },
      { id: 3, who: 'teacher', text: 'What guarantees do we have that this won’t recur during annual examinations?', marathi: 'वार्षिक परीक्षेच्या वेळी याची पुनरावृत्ती होणार नाही याची काय हमी?', hindi: 'क्या गारंटी है कि वार्षिक परीक्षाओं में ऐसा दोबारा नहीं होगा?' },
      { id: 4, who: 'riya', text: 'We have enabled multi-region auto-failover and credited two complimentary service months to your account.', marathi: 'आम्ही पर्यायी सर्व्हर सिस्टीम सुरू केली असून दोन महिन्यांची मोफत सेवा दिली आहे.', hindi: 'हमने बैकअप सर्वर सक्रिय कर दिया है और दो माह की निःशुल्क सेवा दी है।' },
      { id: 5, who: 'teacher', text: 'Thank you for handling this crisis with honesty, speed, and professionalism.', marathi: 'प्रश्नाचे तत्परतेने आणि प्रामाणिकपणे निवारण केल्याबद्दल धन्यवाद.', hindi: 'सच्चाई, तत्परता और पेशेवर अंदाज में हल निकालने के लिए धन्यवाद।' },
    ],
    vocabulary: [
      { word: 'remediation', partOfSpeech: 'noun', meaning: 'The act of correcting or resolving a fault or deficiency', marathi: 'दोषनिवारण / उपाययोजना', hindi: 'सुधार / समाधान', example: 'Prompt remediation restored client trust.' },
      { word: 'proactive', partOfSpeech: 'adjective', meaning: 'Controlling a situation before it happens rather than waiting to respond', marathi: 'दूरदर्शी / अगोदरच उपाय करणारा', hindi: 'सक्रिय / दूरदर्शी', example: 'Proactive monitoring prevents outages.' },
    ],
    questions: [
      { id: 1, speaker: 'riya', fullSentence: 'We implemented proactive server monitoring.', missingWord: 'proactive', marathi: 'आम्ही अगोदरच उपाययोजना केली.', hindi: 'हमने सक्रिय निगरानी व्यवस्था लागू की।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'How do you keep clients reassured during an unexpected incident?',
        teacherMarathi: 'अनपेक्षित अडचणीच्या वेळी ग्राहकांना दिलासा कसा देता?', teacherHindi: 'संकट के समय ग्राहकों को आश्वस्त कैसे रखते हैं?',
        suggestedRiyaReplies: ['By maintaining complete transparency, rapid status updates, and actionable solutions.'],
        keyWordsNeeded: ['transparency', 'updates', 'solutions', 'calm'],
        encouragement: 'Exemplary diplomatic empathy.',
      },
    ],
  },
  {
    id: 45,
    level: 9,
    group: 'D',
    title: 'Media press conference address',
    subtitle: 'Announcing educational AI initiative to journalists',
    setting: 'National Press Club • Official Product Launch Q&A',
    dialogs: [
      { id: 1, who: 'riya', text: 'Good morning ladies and gentlemen of the press. We are thrilled to launch the Rural Spoken English Mission.', marathi: 'पत्रकार मित्रांनो शुभ प्रभात. ग्रामीण इंग्रजी संभाषण अभियान जाहीर करताना आम्हाला आनंद होत आहे.', hindi: 'पत्रकार साथियों शुभ प्रभात। ग्रामीण स्पोकन इंग्लिश मिशन शुरू करते हुए हमें अपार हर्ष हो रहा है।' },
      { id: 2, who: 'teacher', text: 'Reporter Mehta from Daily Times. How will non-English teachers utilize this platform effectively?', marathi: 'इंग्रजी नसलेले शिक्षक हे व्यासपीठ कसे वापरतील?', hindi: 'गैर-अंग्रेजी शिक्षक इस प्लेटफॉर्म का प्रभावी उपयोग कैसे करेंगे?' },
      { id: 3, who: 'riya', text: 'The interface is voice-guided in Marathi and Hindi, requiring zero technical training to orchestrate lessons.', marathi: 'ॲपमध्ये मराठी व हिंदी आवाज मार्गदर्शन असल्याने कोणत्याही विशेष प्रशिक्षणाची गरज नाही.', hindi: 'यह ऐप मराठी और हिंदी में वॉइस-गाइडेड है, इसलिए किसी तकनीकी प्रशिक्षण की आवश्यकता नहीं है।' },
      { id: 4, who: 'teacher', text: 'What is the projected target over the upcoming academic fiscal year?', marathi: 'पुढील शैक्षणिक वर्षात किती विद्यार्थ्यांपर्यंत पोहोचण्याचे उद्दिष्ट आहे?', hindi: 'आगामी शैक्षणिक वर्ष में कितने छात्रों तक पहुँचने का लक्ष्य है?' },
      { id: 5, who: 'riya', text: 'Empowering 50,000 students across 400 rural schools with conversational fluency and dignity.', marathi: '४०० शाळांमधील ५०,००० विद्यार्थ्यांना आत्मविश्वासाने इंग्रजी बोलण्यास सक्षम करणे.', hindi: '400 ग्रामीण स्कूलों के 50,000 छात्रों को धाराप्रवाह अंग्रेजी बोलने में सक्षम बनाना।' },
    ],
    vocabulary: [
      { word: 'orchestrate', partOfSpeech: 'verb', meaning: 'Direct or coordinate the elements of a situation', marathi: 'सुसूत्रीकरण करणे / चालवणे', hindi: 'संचालित करना / समन्वय करना', example: 'Teachers easily orchestrate speaking drills.' },
      { word: 'dignity', partOfSpeech: 'noun', meaning: 'The state or quality of being worthy of honor or respect', marathi: 'स्वाभिमान / प्रतिष्ठा', hindi: 'गरिमा / आत्मसम्मान', example: 'Fluency in English builds career dignity.' },
    ],
    questions: [
      { id: 1, speaker: 'riya', fullSentence: 'Language confidence instills lifelong personal dignity.', missingWord: 'dignity', marathi: 'भाषेचा आत्मविश्वास स्वाभिमान देतो.', hindi: 'भाषा का आत्मविश्वास गरिमा देता है।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'How will you measure genuine learning outcomes across these rural classrooms?',
        teacherMarathi: 'विद्यार्थ्यांची खरी प्रगती कशी मोजाल?', teacherHindi: 'छात्रों की वास्तविक प्रगति का मूल्यांकन कैसे होगा?',
        suggestedRiyaReplies: ['Through automated phoneme pronunciation scoring and monthly roleplay transcripts.'],
        keyWordsNeeded: ['phoneme', 'pronunciation', 'scoring', 'measure'],
        encouragement: 'Stately and compelling public address.',
      },
    ],
  },

  // --- LEVEL 10 (Fluent 2 Master: 46 - 50) ---
  {
    id: 46,
    level: 10,
    group: 'D',
    title: 'Global diplomatic summit address',
    subtitle: 'Keynote oration on ethical artificial intelligence and youth empowerment',
    setting: 'World Youth Council Plenary Hall • Global Keynote Address',
    dialogs: [
      { id: 1, who: 'teacher', text: 'The plenary floor is yours, Riya Sharma, Youth Ambassador of India.', marathi: 'युवा राजदूत रिया शर्मा, आपण आपले विचार मांडावेत.', hindi: 'युवा राजदूत रिया शर्मा, मंच आपका है।' },
      { id: 2, who: 'riya', text: '"Honored delegates: Technology without universal equity is merely privilege cloaked in silicon."', marathi: '"सन्माननीय प्रतिनिधींनो: सर्वांना समान संधी न देणारे तंत्रज्ञान केवळ श्रीमंतीचे प्रदर्शन ठरते."', hindi: '"सम्मानित प्रतिनिधियों: सर्वसुलभ समानता के बिना तकनीक केवल एक छलावा है।"' },
      { id: 3, who: 'riya', text: '"When we educate a young mind in rural Maharashtra or Nairobi to articulate ideas fearlessly, we expand humanity’s collective horizon."', marathi: '"जेव्हा आपण खेड्यापाड्यातील मुलाला निर्भयपणे विचार मांडण्यास सक्षम करतो, तेव्हा संपूर्ण जगाची प्रगती होते."', hindi: '"जब हम किसी ग्रामीण बच्चे को निडर होकर अपनी बात कहना सिखाते हैं, तो पूरी मानवता आगे बढ़ती है।"' },
      { id: 4, who: 'teacher', text: 'A standing ovation echoes throughout the plenary chamber from sixty nations.', marathi: '६० देशांच्या प्रतिनिधींनी उभे राहून टाळ्यांच्या गजरात दाद दिली.', hindi: 'साठ देशों के प्रतिनिधियों ने खड़े होकर तालियों की गूँज से अभिनंदन किया।' },
      { id: 5, who: 'riya', text: '"Let us pledge that no child ever feels silenced by the language barrier. Thank you."', marathi: '"कोणतेही मूल भाषेच्या अडचणीमुळे मागे राहणार नाही असा संकल्प करूया. धन्यवाद."', hindi: '"आइए संकल्प लें कि भाषा की रुकावट से कोई बच्चा पीछे न रहे। धन्यवाद।"' },
    ],
    vocabulary: [
      { word: 'plenary', partOfSpeech: 'adjective', meaning: 'Attended by all members of an assembly; unqualified and absolute', marathi: 'सर्वसमावेशक / पूर्ण सभा', hindi: 'पूर्ण अधिवेशन', example: 'The plenary session united delegates from all nations.' },
      { word: 'cloaked', partOfSpeech: 'verb / adjective', meaning: 'Disguised or concealed', marathi: 'पांघरलेले / लपवलेले', hindi: 'ढका हुआ / छिपा हुआ', example: 'Inequality was cloaked in complex jargon.' },
    ],
    questions: [
      { id: 1, speaker: 'riya', fullSentence: 'She addressed the global plenary assembly.', missingWord: 'plenary', marathi: 'तिने जागतिक सभेला संबोधित केले.', hindi: 'उसने वैश्विक अधिवेशन को संबोधित किया।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'What closing message would you bestow upon youth worldwide seeking their voice?',
        teacherMarathi: 'स्वतःचा आवाज शोधणाऱ्या तरुणांना काय संदेश द्याल?', teacherHindi: 'अपना मुकाम तलाश रहे युवाओं को क्या संदेश देंगी?',
        suggestedRiyaReplies: ['Never apologize for your humble origins; let your authentic voice reshape the world.'],
        keyWordsNeeded: ['voice', 'origins', 'authentic', 'world'],
        encouragement: 'Historic, timeless oratory excellence.',
      },
    ],
  },
  {
    id: 47,
    level: 10,
    group: 'D',
    title: 'Boardroom M&A strategic negotiation',
    subtitle: 'Negotiating equity distribution and technology IP transfer',
    setting: 'High-Rise Executive Boardroom • Multi-party merger conference',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Counsel, our venture syndicate requires forty percent voting stock for the IP transfer.', marathi: 'तंत्रज्ञान हस्तांतरणासाठी आम्हाला ४०% मतदानाचा हक्क हवा आहे.', hindi: 'तकनीकी हस्तांतरण के लिए हमारे सिंडिकेट को 40% वोटिंग शेयर चाहिए।' },
      { id: 2, who: 'riya', text: 'A forty percent dilution impairs founder governance. We propose twenty-five percent with non-dilutive board observation rights.', marathi: '४०% मुळे संस्थापकांचे नियंत्रण कमी होईल. आम्ही २५% आणि संचालक मंडळात प्रतिनिधी देऊ.', hindi: '40% से संस्थापकों का नियंत्रण घटेगा। हम 25% और बोर्ड में पर्यवेक्षक अधिकार का प्रस्ताव देते हैं।' },
      { id: 3, who: 'teacher', text: 'How will you guarantee retention of senior speech synthesis researchers post-closing?', marathi: 'विलिनीकरणानंतर मुख्य शास्त्रज्ञ कंपनीतच राहतील याची काय खात्री?', hindi: 'विलय के बाद मुख्य वैज्ञानिक कंपनी में बने रहेंगे इसकी क्या गारंटी है?' },
      { id: 4, who: 'riya', text: 'We have structured a four-year vesting cliff with performance milestone bonuses.', marathi: 'आम्ही चार वर्षांची शेअर योजना आणि कामगिरीवर आधारित बोनस ठरवला आहे.', hindi: 'हमने चार वर्षीय शेयर योजना और प्रदर्शन आधारित बोनस तय किया है।' },
      { id: 5, who: 'teacher', text: 'Equitable terms. Let us sign the definitive merger agreement.', marathi: 'न्याय्य अटी. करारपत्रावर स्वाक्षरी करूया.', hindi: 'संतुलित शर्तें। आइए अंतिम समझौते पर हस्ताक्षर करें।' },
    ],
    vocabulary: [
      { word: 'dilution', partOfSpeech: 'noun', meaning: 'Reduction in the ownership percentage of a share of stock', marathi: 'भागभांडवलातील वाटा कमी होणे', hindi: 'शेयर हिस्सेदारी में कमी', example: 'Careful negotiation prevented excessive equity dilution.' },
      { word: 'vesting', partOfSpeech: 'noun', meaning: 'The conveying to an employee of unconditional rights to stock over time', marathi: 'हक्कप्राप्ती / शेअर्सचे अधिकार मिळणे', hindi: 'अधिकार प्राप्ति', example: 'A four-year vesting schedule incentivized retention.' },
    ],
    questions: [
      { id: 1, speaker: 'riya', fullSentence: 'The agreement limits unnecessary equity dilution.', missingWord: 'dilution', marathi: 'कराराने हिस्सा कमी होण्यापासून वाचवले.', hindi: 'समझौते ने हिस्सेदारी घटने से बचाया।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'What is your non-negotiable principle in any corporate partnership?',
        teacherMarathi: 'कोणत्याही भागीदारीत तुमची न बदलणारी अट कोणती?', teacherHindi: 'किसी भी साझेदारी में आपकी अटल शर्त क्या रहती है?',
        suggestedRiyaReplies: ['Preserving ethical governance and transparency toward all stakeholders.'],
        keyWordsNeeded: ['ethical', 'governance', 'transparency', 'stakeholders'],
        encouragement: 'High-stakes executive negotiation acumen.',
      },
    ],
  },
  {
    id: 48,
    level: 10,
    group: 'D',
    title: 'International doctoral defense',
    subtitle: 'Defending algorithmic thesis on quantum phoneme synthesis',
    setting: 'University Examination Hall • Academic Doctoral Panel',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Candidate, defend your mathematical derivation of non-linear acoustic harmonics.', marathi: 'अकॉस्टिक ध्वनितरंगांचे गणितीय सूत्र सिद्ध करून दाखवा.', hindi: 'ध्वनि तरंगों के गणितीय समीकरण को सिद्ध कीजिए।' },
      { id: 2, who: 'riya', text: 'By modeling vocal tract resonance as an evolving Hilbert space, we eliminate spectral phase discontinuities.', marathi: 'स्वरयंत्राच्या कंपनांचे हिल्बर्ट स्पेस मॉडेल वापरून आम्ही ध्वनीतील तुटलेपण नाहीसे केले.', hindi: 'स्वरतंत्री के कंपनों को गणितीय रूप देकर हमने ध्वनि की रुकावटों को समाप्त किया।' },
      { id: 3, who: 'teacher', text: 'Does your theorem hold under heavy environmental signal-to-noise degradation?', marathi: 'गोंधळाच्या वातावरणातही हे सूत्र काम करते का?', hindi: 'क्या अत्यधिक शोर वाले वातावरण में भी यह समीकरण काम करता है?' },
      { id: 4, who: 'riya', text: 'Yes, because our stochastic kalman filter dynamically dampens background noise.', marathi: 'होय, कारण आमचे फिल्टर आपोआप बाह्य आवाज दाबून टाकते.', hindi: 'हाँ, क्योंकि हमारा फिल्टर बाहरी शोर को स्वतः ही निष्प्रभावी कर देता है।' },
      { id: 5, who: 'teacher', text: 'Unanimous recommendation by the faculty. Congratulations, Doctor Sharma.', marathi: 'परीक्षकांचा एकमुखी निर्णय. अभिनंदन, डॉक्टर शर्मा!', hindi: 'समिति का सर्वसम्मत निर्णय। बधाई हो, डॉक्टर शर्मा!' },
    ],
    vocabulary: [
      { word: 'spectral', partOfSpeech: 'adjective', meaning: 'Relating to a spectrum, especially frequencies of sound or light', marathi: 'ध्वनितरंगांच्या वर्णपटाशी संबंधित', hindi: 'वर्णक्रमीय / स्पेक्ट्रल', example: 'Spectral analysis revealed clear vocal harmonics.' },
      { word: 'stochastic', partOfSpeech: 'adjective', meaning: 'Having a random probability distribution', marathi: 'संभाव्यतेवर आधारित', hindi: 'प्रायिकता संबंधी / संभाव्य', example: 'Stochastic models account for natural voice fluctuations.' },
    ],
    questions: [
      { id: 1, speaker: 'riya', fullSentence: 'Spectral analysis confirmed vocal clarity.', missingWord: 'spectral', marathi: 'ध्वनीच्या वर्णपटाने स्पष्टता सिद्ध केली.', hindi: 'स्पेक्ट्रल विश्लेषण ने ध्वनि की स्पष्टता सिद्ध की।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'What future research avenues does your thesis unlock?',
        teacherMarathi: 'या संशोधनामुळे भविष्यात कोणत्या नव्या वाटा खुल्या होतील?', teacherHindi: 'यह शोध भविष्य के लिए क्या नई राहें खोलता है?',
        suggestedRiyaReplies: ['Real-time cross-language neural speech conversion with preserved vocal timbre.'],
        keyWordsNeeded: ['neural', 'speech', 'timbre', 'conversion'],
        encouragement: 'World-class scholarly defense.',
      },
    ],
  },
  {
    id: 49,
    level: 10,
    group: 'D',
    title: 'High-stakes crisis negotiation',
    subtitle: 'Resolving regional power grid disruption and public safety',
    setting: 'Disaster Management Command Center • Emergency task force briefing',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Director, severe cyclonic gusts have severed three high-tension transmission towers.', marathi: 'संचालक महोदया, वादळामुळे तीन मुख्य वीज मनोरे कोसळले आहेत.', hindi: 'निदेशक महोदया, भीषण चक्रवात से तीन मुख्य बिजली टॉवर ध्वस्त हो गए हैं।' },
      { id: 2, who: 'riya', text: 'Reroute auxiliary power to district hospitals and clean water pumping stations immediately.', marathi: 'रुग्णालये आणि पिण्याच्या पाण्याच्या केंद्रांना पर्यायी वीजपुरवठा तातडीने वळवा.', hindi: 'अस्पतालों और पेयजल संयंत्रों को तुरंत आपातकालीन बिजली से जोड़ें।' },
      { id: 3, who: 'teacher', text: 'Grid engineers report an imminent overload on Substation 7 if auxiliary power spikes.', marathi: 'अतिरिक्त भाराने सातव्या सबस्टेशनवर ताण येण्याची शक्यता आहे.', hindi: 'लोड बढ़ने से सबस्टेशन 7 के ठप होने का खतरा है।' },
      { id: 4, who: 'riya', text: 'Execute controlled industrial load shedding for 90 minutes while mobile diesel generators mobilize.', marathi: 'डिझेल जनरेटर येईपर्यंत कारखान्यांची वीज ९० मिनिटे बंद ठेवा.', hindi: 'जनरेटर पहुँचने तक औद्योगिक क्षेत्रों में 90 मिनट की बिजली कटौती लागू करें।' },
      { id: 5, who: 'teacher', text: 'Crisis mitigated without single casualty. Masterful emergency command, Director.', marathi: 'कोणतीही दुर्घटना न होता संकट टळले. अतिशय कौतुकास्पद नेतृत्व!', hindi: 'बिना किसी नुकसान के संकट टल गया। आपका नेतृत्व सचमुच प्रेरणादायी रहा।' },
    ],
    vocabulary: [
      { word: 'auxiliary', partOfSpeech: 'adjective', meaning: 'Providing supplementary or additional help and support', marathi: 'पर्यायी / राखीव मदत करणारा', hindi: 'सहायक / अतिरिक्त', example: 'Switch immediately to auxiliary generators.' },
      { word: 'imminent', partOfSpeech: 'adjective', meaning: 'About to happen very soon', marathi: 'नजीकच्या / तात्काळ घडणारे', hindi: 'आसन्न / शीघ्र होने वाला', example: 'Prompt action averted imminent disaster.' },
    ],
    questions: [
      { id: 1, speaker: 'riya', fullSentence: 'Activate the auxiliary power generators.', missingWord: 'auxiliary', marathi: 'पर्यायी जनरेटर सुरू करा.', hindi: 'सहायक जनरेटर चालू कीजिए।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'How do you keep ground teams motivated during intense crisis operations?',
        teacherMarathi: 'संकटाच्या वेळी सहकाऱ्यांचे मनोबल कसे टिकवून ठेवता?', teacherHindi: 'संकट के समय टीम का मनोबल कैसे बनाए रखते हैं?',
        suggestedRiyaReplies: ['By radiating calm composure, giving clear directives, and trusting their expertise.'],
        keyWordsNeeded: ['calm', 'directives', 'trusting', 'expertise'],
        encouragement: 'Peerless high-pressure leadership communication.',
      },
    ],
  },
  {
    id: 50,
    level: 10,
    group: 'D',
    title: 'Masterclass valedictory oratory',
    subtitle: 'Final graduating address on language mastery and transforming destiny',
    setting: 'Grand Convocation Amphitheater • Lifetime Academic Convocation',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Riya Sharma, after fifty master situations, the convocation podium awaits your valedictory words.', marathi: 'रिया शर्मा, पन्नास प्रसंग पूर्ण केल्यानंतर, दीक्षांत समारंभाचे व्यासपीठ तुझ्या अंतिम भाषणाची वाट पाहत आहे.', hindi: 'रिया शर्मा, पचास प्रसंगों के बाद यह दीक्षांत मंच आपके अंतिम भाषण की प्रतीक्षा कर रहा है।' },
      { id: 2, who: 'riya', text: '"Honored mentors, visionary teachers, and my beloved fellow learners from every corner of India: Good evening."', marathi: '"आदरणीय गुरुजन आणि संपूर्ण भारतातील माझ्या प्रिय सहकारी मित्रांनो: शुभ संध्याकाळ."', hindi: '"आदरणीय गुरुजनों और देश के कोने-कोने से आए मेरे प्रिय साथियों: शुभ संध्या।"' },
      { id: 3, who: 'riya', text: '"When we began at Situation One, English felt like a foreign labyrinth of grammar rules and timid hesitation."', marathi: '"जेव्हा आपण पहिल्या प्रसंगापासून सुरुवात केली, तेव्हा इंग्रजी ही नियमांची भीतीदायक वाट वाटत होती."', hindi: '"जब हमने पहले प्रसंग से शुरुआत की थी, तब अंग्रेजी झिझक और नियमों की एक भूलभुलैया जैसी लगती थी।"' },
      { id: 4, who: 'riya', text: '"Today, through fifty rigorous real-world dialogues, we have transformed language from a barrier into a bridge of empathy, leadership, and boundless possibility."', marathi: '"आज पन्नास सराव प्रसंगानंतर, आपण भाषेला अडथळ्याऐवजी प्रगती आणि आत्मविश्वासाचा सेतू बनवले आहे."', hindi: '"आज पचास सजीव संवादों के बाद, हमने भाषा को रुकावट के बजाय सहानुभूति और सफलता का सेतु बना दिया है।"' },
      { id: 5, who: 'teacher', text: 'The entire audience rises in thunderous applause! You are the quintessential exemplar of Spoken English mastery, Riya.', marathi: 'टाळ्यांचा प्रचंड कडकडाट! रिया, तू इंग्रजी संभाषण कौशल्याचा जिवंत आदर्श आहेस.', hindi: 'पूरा सभागार तालियों की गड़गड़ाहट से गूँज उठा! रिया, तुम अंग्रेजी संभाषण का सर्वोत्तम आदर्श हो।' },
    ],
    vocabulary: [
      { word: 'labyrinth', partOfSpeech: 'noun', meaning: 'A complicated irregular network of passages or paths', marathi: 'गुंतागुंतीची भूलभुलैया', hindi: 'भूलभुलैया', example: 'Language is no longer a confusing labyrinth.' },
      { word: 'exemplar', partOfSpeech: 'noun', meaning: 'A person or thing serving as a typical or excellent example', marathi: 'सर्वोत्कृष्ट आदर्श / उदाहरण', hindi: 'सर्वोत्तम उदाहरण / आदर्श', example: 'She is an exemplar of linguistic eloquence.' },
    ],
    questions: [
      { id: 1, speaker: 'teacher', fullSentence: 'Riya is an exemplar of spoken fluency.', missingWord: 'exemplar', marathi: 'रिया ही संभाषण कौशल्याचा आदर्श आहे.', hindi: 'रिया स्पोकन इंग्लिश का आदर्श है।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'What final pledge do you take as a Master Communicator of Smart English Sathi?',
        teacherMarathi: 'स्मार्ट इंग्लिश साथीचे पदवीधर म्हणून आपण कोणता अंतिम संकल्प करता?', teacherHindi: 'स्मार्ट इंग्लिश साथी के स्नातकोत्तर के रूप में आप क्या अंतिम संकल्प लेते हैं?',
        suggestedRiyaReplies: ['I pledge to mentor upcoming learners, speak with truth and empathy, and inspire my community forever.'],
        keyWordsNeeded: ['pledge', 'mentor', 'empathy', 'inspire', 'community'],
        encouragement: 'The pinnacle of spoken English mastery! Fifty situations completed with legendary brilliance.',
      },
    ],
  },
];
