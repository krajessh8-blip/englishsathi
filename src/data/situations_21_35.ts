import { Situation } from '../types';

export const SITUATIONS_21_35: Situation[] = [
  // --- LEVEL 5 (Class 9 Intermediate: 21 - 25) ---
  {
    id: 21,
    level: 5,
    group: 'C',
    title: 'Science exhibition project',
    subtitle: 'Demonstrating water purification model to visitors',
    setting: 'Science Lab • Explaining filtration layers to guests',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Riya, can you explain how your filtration model works?', marathi: 'रिया, तुझे पाणी शुद्धीकरण मॉडेल कसे काम करते ते समजावून सांगशील का?', hindi: 'रिया, क्या तुम समझा सकती हो कि तुम्हारा जल शोधन मॉडल कैसे काम करता है?' },
      { id: 2, who: 'riya', text: 'Yes, ma’am! We use charcoal, fine sand, and gravel to filter impurities.', marathi: 'होय मॅडम! आम्ही अशुद्धता गाळण्यासाठी कोळसा, बारीक वाळू आणि खडे वापरतो.', hindi: 'हाँ मैम! हम अशुद्धियों को छानने के लिए चारकोल, बारीक रेत और कंकड़ का उपयोग करते हैं।' },
      { id: 3, who: 'teacher', text: 'That is impressive. How does activated charcoal assist the process?', marathi: 'छान. सक्रिय कोळसा या प्रक्रियेत कशी मदत करतो?', hindi: 'यह प्रभावशाली है। सक्रिय चारकोल इस प्रक्रिया में कैसे सहायता करता है?' },
      { id: 4, who: 'riya', text: 'It adsorbs harmful toxins, chlorine, and bad odor efficiently.', marathi: 'तो हानिकारक रसायने आणि दुर्गंधी शोषून घेतो.', hindi: 'यह हानिकारक विषाक्त पदार्थों और दुर्गंध को कुशलतापूर्वक सोख लेता है।' },
      { id: 5, who: 'teacher', text: 'Splendid scientific presentation. Keep demonstrating with confidence.', marathi: 'उत्कृष्ट सादरीकरण. आत्मविश्वासाने माहिती देत राहा.', hindi: 'शानदार वैज्ञानिक प्रस्तुति। आत्मविश्वास के साथ समझाते रहो।' },
    ],
    vocabulary: [
      { word: 'filtration', partOfSpeech: 'noun', meaning: 'The process of passing liquid through a filter', marathi: 'गाळण्याची प्रक्रिया', hindi: 'छानने की प्रक्रिया', example: 'Water filtration removes sediment.' },
      { word: 'impurities', partOfSpeech: 'noun', meaning: 'Unwanted substances', marathi: 'अशुद्धता', hindi: 'अशुद्धियाँ', example: 'The sand traps large impurities.' },
      { word: 'adsorb', partOfSpeech: 'verb', meaning: 'Hold molecules on a surface', marathi: 'पृष्ठावर शोषून घेणे', hindi: 'सतह पर सोखना', example: 'Charcoal adsorbs chemical odors.' },
    ],
    questions: [
      { id: 1, speaker: 'riya', fullSentence: 'Charcoal adsorbs chlorine and toxins.', missingWord: 'adsorbs', marathi: 'कोळसा रसायने शोषून घेतो.', hindi: 'चारकोल क्लोरीन और विषाक्त पदार्थों को सोखता है।' },
      { id: 2, speaker: 'teacher', fullSentence: 'Explain your water filtration model.', missingWord: 'filtration', marathi: 'तुझे मॉडेल समजावून सांग.', hindi: 'अपना मॉडल समझाओ।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'Welcome to the science stall. What does your working model demonstrate?',
        teacherMarathi: 'तुमचे मॉडेल काय दर्शवते?', teacherHindi: 'आपका मॉडल क्या दर्शाता है?',
        suggestedRiyaReplies: ['Our model demonstrates low-cost multi-layer water purification.', 'It showcases sustainable filtration for rural communities.'],
        keyWordsNeeded: ['model', 'water', 'purification', 'demonstrates', 'filtration'],
        encouragement: 'Clear, engaging introduction for visitors.',
      },
    ],
  },
  {
    id: 22,
    level: 5,
    group: 'C',
    title: 'Computer lab coding bug',
    subtitle: 'Debugging a Python loop with teacher assistance',
    setting: 'Computer Lab • Finding syntax error in code',
    dialogs: [
      { id: 1, who: 'riya', text: 'Sir, my Python program is stuck in an infinite loop.', marathi: 'सर, माझा पायथन प्रोग्राम अखंड लूपमध्ये अडकला आहे.', hindi: 'सर, मेरा पायथन प्रोग्राम अनन्त लूप में फँस गया है।' },
      { id: 2, who: 'teacher', text: 'Check your increment statement inside the while loop.', marathi: 'व्हाइल लूपमधील इंक्रीमेंट स्टेटमेंट तपासा.', hindi: 'व्हाइल लूप के अंदर अपना इन्क्रीमेंट स्टेटमेंट देखें।' },
      { id: 3, who: 'riya', text: 'Oh! I forgot to increment the counter variable by one.', marathi: 'अरे हो! मी काउंटर एकने वाढवायला विसरले.', hindi: 'अरे! मैं काउंटर वेरिएबल को एक से बढ़ाना भूल गई थी।' },
      { id: 4, who: 'teacher', text: 'Fix that and execute your script again.', marathi: 'ते नीट करून पुन्हा चालवा.', hindi: 'उसे ठीक करो और अपनी स्क्रिप्ट दोबारा चलाओ।' },
      { id: 5, who: 'riya', text: 'It worked perfectly! Thank you for identifying the bug.', marathi: 'आता कोड व्यवस्थित चालला! धन्यवाद सर.', hindi: 'यह बिल्कुल सही काम कर रहा है! धन्यवाद सर।' },
    ],
    vocabulary: [
      { word: 'infinite', partOfSpeech: 'adjective', meaning: 'Limitless or never-ending', marathi: 'अमर्याद / अखंड', hindi: 'अनंत', example: 'Avoid writing infinite loops.' },
      { word: 'increment', partOfSpeech: 'verb', meaning: 'Increase by a specified value', marathi: 'किंमत वाढवणे', hindi: 'मूल्य बढ़ाना', example: 'Increment the counter each time.' },
    ],
    questions: [
      { id: 1, speaker: 'riya', fullSentence: 'My while loop became infinite.', missingWord: 'infinite', marathi: 'लूप अखंड चालू राहिला.', hindi: 'लूप अनंत हो गया।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'What problem are you facing with your code?',
        teacherMarathi: 'कोडमध्ये काय अडचण येत आहे?', teacherHindi: 'कोड में क्या दिक्कत आ रही है?',
        suggestedRiyaReplies: ['Sir, my program is not stopping because the counter is not updating.'],
        keyWordsNeeded: ['program', 'counter', 'loop', 'stopping'],
        encouragement: 'Great technical description.',
      },
    ],
  },
  {
    id: 23,
    level: 5,
    group: 'C',
    title: 'Drama club audition',
    subtitle: 'Performing monologue and expressing character emotion',
    setting: 'Auditorium Stage • Testing vocal delivery for school play',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Welcome Riya. Deliver your monologue with steady projection.', marathi: 'रिया, तुझा स्वगत संवाद स्पष्ट आवाजात सादर कर.', hindi: 'रिया, अपना मोनोलॉग स्पष्ट आवाज में प्रस्तुत करो।' },
      { id: 2, who: 'riya', text: '"Friends, lend me your ears! I speak not to disprove what Brutus spoke..."', marathi: '"मित्रांनो, माझे ऐका! ब्रूटसच्या शब्दांचा विरोध करण्यासाठी मी येथे नाही..."', hindi: '"मित्रों, मेरी बात सुनो! मैं ब्रूटस की बात काटने नहीं आया हूँ..."' },
      { id: 3, who: 'teacher', text: 'Good resonance. Now pause slightly before the emotional climax.', marathi: 'छान सूर. आता भावना उत्कट होण्यापूर्वी थोडा विराम घे.', hindi: 'अच्छी ध्वनि। अब मुख्य संवाद से पहले हल्का विराम लो।' },
      { id: 4, who: 'riya', text: 'I understand, sir. Pacing builds dramatic suspense.', marathi: 'समजले सर. योग्य गतीने संवादात रंगत वाढते.', hindi: 'समझ गई सर। सही गति से नाटक में गहराई आती है।' },
      { id: 5, who: 'teacher', text: 'You have been shortlisted for the lead character!', marathi: 'तुझी मुख्य पात्रासाठी निवड झाली आहे!', hindi: 'तुम्हें मुख्य भूमिका के लिए शॉर्टलिस्ट किया गया है!' },
    ],
    vocabulary: [
      { word: 'monologue', partOfSpeech: 'noun', meaning: 'A long speech by one actor', marathi: 'स्वगत भाषण', hindi: 'एकपात्री भाषण', example: 'She memorized the famous monologue.' },
      { word: 'resonance', partOfSpeech: 'noun', meaning: 'Quality in a sound of being deep and clear', marathi: 'आवाजाची खोली व नाद', hindi: 'गूँज और स्पष्टता', example: 'Speak with strong vocal resonance.' },
    ],
    questions: [
      { id: 1, speaker: 'teacher', fullSentence: 'Deliver the monologue with vocal clarity.', missingWord: 'monologue', marathi: 'स्वगत भाषण स्पष्टपणे बोल.', hindi: 'मोनोलॉग स्पष्टता से बोलो।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'Tell me which role you are auditioning for and why.',
        teacherMarathi: 'तू कोणत्या भूमिकेसाठी ऑडिशन देत आहेस?', teacherHindi: 'तुम किस भूमिका के लिए ऑडिशन दे रही हो?',
        suggestedRiyaReplies: ['I am auditioning for the lead orator because I love dramatic expression.'],
        keyWordsNeeded: ['auditioning', 'role', 'lead', 'expression'],
        encouragement: 'Confident theatrical presentation.',
      },
    ],
  },
  {
    id: 24,
    level: 5,
    group: 'C',
    title: 'School bus commute conversation',
    subtitle: 'Discussing inter-school tournament with peer',
    setting: 'School Bus • Talking about volleyball practice',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Are you ready for the inter-school volleyball tournament tomorrow?', marathi: 'उद्याच्या आंतरशालेय व्हॉलीबॉल स्पर्धेसाठी तू सज्ज आहेस का?', hindi: 'क्या तुम कल के इंटर-स्कूल वॉलीबॉल टूर्नामेंट के लिए तैयार हो?' },
      { id: 2, who: 'riya', text: 'Yes, our team practiced defensive blocks and serving drills all week.', marathi: 'होय, आमच्या संघाने संपूर्ण आठवडाभर ब्लॉक आणि सर्व्हिसचा सराव केला.', hindi: 'हाँ, हमारी टीम ने पूरे हफ्ते डिफेंस और सर्विस का अभ्यास किया है।' },
      { id: 3, who: 'teacher', text: 'Which school is our main rival in the tournament?', marathi: 'स्पर्धेत आपली मुख्य प्रतिस्पर्धी शाळा कोणती आहे?', hindi: 'टूर्नामेंट में हमारा मुख्य प्रतिद्वंद्वी स्कूल कौन सा है?' },
      { id: 4, who: 'riya', text: 'St. Mary’s Academy has tall smashers, but our teamwork is stronger.', marathi: 'त्यांच्याकडे उंच खेळाडू आहेत, पण आमची सांघिक भावना अधिक मजबूत आहे.', hindi: 'उनके खिलाड़ी ऊँचे हैं, लेकिन हमारा टीमवर्क बेहतर है।' },
      { id: 5, who: 'teacher', text: 'Play with sportsmanship and bring home the trophy!', marathi: 'खेळाडूवृत्तीने खेळा आणि करंडक जिंका!', hindi: 'खेल भावना से खेलो और ट्रॉफी जीतकर लाओ!' },
    ],
    vocabulary: [
      { word: 'tournament', partOfSpeech: 'noun', meaning: 'A series of sports contests', marathi: 'क्रीडा स्पर्धा', hindi: 'प्रतियोगिता', example: 'Our school won the regional tournament.' },
      { word: 'sportsmanship', partOfSpeech: 'noun', meaning: 'Fair, generous, and polite behavior in sports', marathi: 'खेळाडूवृत्ती', hindi: 'खेल भावना', example: 'Always display true sportsmanship.' },
    ],
    questions: [
      { id: 1, speaker: 'teacher', fullSentence: 'Play with genuine sportsmanship.', missingWord: 'sportsmanship', marathi: 'खेळाडूवृत्तीने खेळा.', hindi: 'सच्ची खेल भावना से खेलो।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'How has your team prepared for the big match?',
        teacherMarathi: 'मोठ्या सामन्यासाठी संघाची तयारी कशी झाली आहे?', teacherHindi: 'मैच के लिए टीम की तैयारी कैसी रही?',
        suggestedRiyaReplies: ['We practiced every morning and worked on coordinated passing.'],
        keyWordsNeeded: ['practiced', 'team', 'passing', 'match'],
        encouragement: 'Active athletic dialogue.',
      },
    ],
  },
  {
    id: 25,
    level: 5,
    group: 'C',
    title: 'School garden eco-drive',
    subtitle: 'Planting indigenous trees and setting up vermicompost',
    setting: 'School Botanical Garden • Environment Club project',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Why did we choose neem and banyan saplings for planting today?', marathi: 'आज आपण कडुलिंब आणि वडाची रोपे का निवडली?', hindi: 'आज हमने नीम और बरगद के पौधे लगाने के लिए क्यों चुने?' },
      { id: 2, who: 'riya', text: 'Because indigenous trees support local biodiversity and need less water.', marathi: 'कारण स्थानिक झाडे जैवविविधता टिकवून ठेवतात आणि कमी पाण्यात वाढतात.', hindi: 'क्योंकि देशी पेड़ स्थानीय जैव विविधता का पोषण करते हैं और कम पानी लेते हैं।' },
      { id: 3, who: 'teacher', text: 'What organic waste should we deposit into the vermicompost pit?', marathi: 'गांडूळ खत खड्ड्यात कोणता सेंद्रिय कचरा टाकावा?', hindi: 'वर्मीकम्पोस्ट गड्ढे में कौन सा जैविक कचरा डालना चाहिए?' },
      { id: 4, who: 'riya', text: 'Fallen dry leaves, vegetable peels, and fruit scraps from our lunch boxes.', marathi: 'सुकी पाने, भाज्यांची साले आणि डब्यातील फळांचे तुकडे.', hindi: 'सूखे पत्ते, सब्जियों के छिलके और लंच बॉक्स का बचा हुआ फल।' },
      { id: 5, who: 'teacher', text: 'Remarkable environmental leadership! Our school garden looks vibrant.', marathi: 'पर्यावरण संवर्धनाचा उत्तम आदर्श! आपली बाग सुंदर दिसत आहे.', hindi: 'पर्यावरण संरक्षण की बेहतरीन मिसाल! हमारा बगीचा जीवंत लग रहा है।' },
    ],
    vocabulary: [
      { word: 'indigenous', partOfSpeech: 'adjective', meaning: 'Originating naturally in a particular region', marathi: 'स्थानिक / देशी', hindi: 'देशी / स्थानीय', example: 'Plant indigenous trees for ecological balance.' },
      { word: 'biodiversity', partOfSpeech: 'noun', meaning: 'Variety of plant and animal life in a habitat', marathi: 'जैवविविधता', hindi: 'जैव विविधता', example: 'Rainforests possess rich biodiversity.' },
    ],
    questions: [
      { id: 1, speaker: 'riya', fullSentence: 'We must protect native biodiversity.', missingWord: 'biodiversity', marathi: 'आपण जैवविविधतेचे रक्षण केले पाहिजे.', hindi: 'हमें जैव विविधता की रक्षा करनी चाहिए।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'What steps can students take to reduce plastic waste on campus?',
        teacherMarathi: 'प्लॅस्टिक कमी करण्यासाठी काय करता येईल?', teacherHindi: 'प्लास्टिक कचरा कम करने के लिए क्या कर सकते हैं?',
        suggestedRiyaReplies: ['We can carry stainless steel bottles and cloth lunch bags.'],
        keyWordsNeeded: ['bottles', 'plastic', 'reduce', 'carry'],
        encouragement: 'Thoughtful eco-friendly ideas.',
      },
    ],
  },

  // --- LEVEL 6 (Class 10 Intermediate+: 26 - 30) ---
  {
    id: 26,
    level: 6,
    group: 'C',
    title: 'Board exam strategy session',
    subtitle: 'Structuring revision timetable with academic counselor',
    setting: 'Counseling Room • Planning subject priority and rest intervals',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Riya, with pre-boards approaching, how are you allocating your study hours?', marathi: 'बोर्ड परीक्षा जवळ येत असल्याने तू अभ्यासाच्या वेळेचे नियोजन कसे करत आहेस?', hindi: 'बोर्ड परीक्षा नज़दीक आते हुए तुम पढ़ाई के घंटों का बंटवारा कैसे कर रही हो?' },
      { id: 2, who: 'riya', text: 'I divide four hours daily into focused blocks of mathematics, science, and languages.', marathi: 'मी दररोज चार तास गणित, विज्ञान आणि भाषा यांच्यात विभागून अभ्यास करते.', hindi: 'मैं रोज़ाना चार घंटे गणित, विज्ञान और भाषाओं के बीच बाँटकर पढ़ाई करती हूँ।' },
      { id: 3, who: 'teacher', text: 'How frequently do you solve past five-year question papers?', marathi: 'मागील पाच वर्षांच्या प्रश्नपत्रिका तू किती वेळा सोडवतेस?', hindi: 'पिछले पाँच वर्षों के प्रश्न पत्र तुम कितनी बार हल करती हो?' },
      { id: 4, who: 'riya', text: 'Every Sunday morning under timed exam conditions without distractions.', marathi: 'दर रविवारी सकाळी वेळेचे बंधन ठेवून शांततेत सोडवते.', hindi: 'हर रविवार सुबह बिना किसी व्यवधान के निर्धारित समय में हल करती हूँ।' },
      { id: 5, who: 'teacher', text: 'Consistent revision and disciplined sleep will secure outstanding marks.', marathi: 'नियमित सराव आणि शांत झोप यामुळे नक्कीच उत्तम गुण मिळतील.', hindi: 'लगातार अभ्यास और अनुशासित नींद से शानदार अंक प्राप्त होंगे।' },
    ],
    vocabulary: [
      { word: 'allocating', partOfSpeech: 'verb', meaning: 'Distributing resources or time for a purpose', marathi: 'वेळेचे नियोजन करणे', hindi: 'आबंटित करना / बाँटना', example: 'Allocating study time helps cover all subjects.' },
      { word: 'distractions', partOfSpeech: 'noun', meaning: 'Things that prevent concentration', marathi: 'लक्ष विचलित करणाऱ्या गोष्टी', hindi: 'ध्यान भटकाने वाली चीज़ें', example: 'Keep phones away to eliminate distractions.' },
    ],
    questions: [
      { id: 1, speaker: 'teacher', fullSentence: 'Avoid all electronic distractions while studying.', missingWord: 'distractions', marathi: 'अभ्यास करताना मोबाईलपासून दूर राहा.', hindi: 'पढ़ाई के दौरान ध्यान भटकाने वाली चीज़ों से दूर रहें।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'Which subject feels most challenging and what is your plan for it?',
        teacherMarathi: 'कोणता विषय कठीण वाटतो आणि तुझी तयारी कशी आहे?', teacherHindi: 'कौन सा विषय कठिन लगता है और तुम्हारी क्या योजना है?',
        suggestedRiyaReplies: ['Physics formulas require extra problem solving, so I practice numericals daily.'],
        keyWordsNeeded: ['practice', 'formulas', 'daily', 'challenging'],
        encouragement: 'Pragmatic and disciplined response.',
      },
    ],
  },
  {
    id: 27,
    level: 6,
    group: 'C',
    title: 'Mathematics olympiad problem solving',
    subtitle: 'Proving geometric circle theorems on whiteboard',
    setting: 'Math Club Room • Discussing tangent and chord properties',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Who can deduce that angles in the same segment of a circle are equal?', marathi: 'एकाच वर्तुळखंडातील कोन समान असतात हे कोण सिद्ध करू शकेल?', hindi: 'कौन सिद्ध कर सकता है कि एक ही वृत्तखंड के कोण बराबर होते हैं?' },
      { id: 2, who: 'riya', text: 'I can demonstrate it by drawing subtended angles to the central radius.', marathi: 'मी केंद्रबिंदूवर आंतरित केलेल्या कोनांच्या मदतीने ते सिद्ध करू शकते.', hindi: 'मैं केंद्र पर बने कोणों की सहायता से इसे सिद्ध कर सकती हूँ।' },
      { id: 3, who: 'teacher', text: 'Proceed to the board and walk us through each corollary.', marathi: 'फळ्यावर येऊन प्रत्येक पायरी समजावून सांग.', hindi: 'बोर्ड पर आकर प्रत्येक चरण समझाइए।' },
      { id: 4, who: 'riya', text: 'Since the central angle is twice any inscribed angle, both subtended angles must be identical.', marathi: 'केंद्रीय कोन आंतरित कोनाच्या दुप्पट असल्याने दोन्ही कोन समान असले पाहिजेत.', hindi: 'चूँकि केंद्रीय कोण परिधि पर बने कोण का दुगुना होता है, इसलिए दोनों कोण समान होंगे।' },
      { id: 5, who: 'teacher', text: 'Rigorous geometric deduction. Perfect mathematical reasoning!', marathi: 'अचूक आणि तर्कशुद्ध मांडणी! खूप छान.', hindi: 'सटीक ज्यामितीय निष्कर्ष। बेहतरीन तर्कशक्ति!' },
    ],
    vocabulary: [
      { word: 'subtended', partOfSpeech: 'verb / adjective', meaning: 'Formed or enclosed by lines from endpoints', marathi: 'आंतरित केलेला', hindi: 'आंतरित', example: 'The chord subtends an angle at the center.' },
      { word: 'deduction', partOfSpeech: 'noun', meaning: 'Drawing logical conclusions from facts', marathi: 'तर्कशुद्ध निष्कर्ष', hindi: 'तार्किक निष्कर्ष', example: 'Mathematical deduction verifies the proof.' },
    ],
    questions: [
      { id: 1, speaker: 'teacher', fullSentence: 'Logical deduction proves the theorem.', missingWord: 'deduction', marathi: 'तर्काने प्रमेय सिद्ध होते.', hindi: 'तार्किक निष्कर्ष से प्रमेय सिद्ध होता है।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'How do you approach solving a complex trigonometry problem?',
        teacherMarathi: 'त्रिकोणमितीचे कठीण गणित कसे सोडवता?', teacherHindi: 'त्रिकोणमिति का कठिन सवाल कैसे हल करते हैं?',
        suggestedRiyaReplies: ['I simplify equations into sine and cosine terms first to find identities.'],
        keyWordsNeeded: ['simplify', 'equations', 'terms', 'identities'],
        encouragement: 'Sharp analytical communication.',
      },
    ],
  },
  {
    id: 28,
    level: 6,
    group: 'C',
    title: 'Prefect council meeting',
    subtitle: 'Organizing annual cultural fest logistics and crowd safety',
    setting: 'Student Council Room • Assigning volunteer duties for festival',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Prefects, we expect over 800 parents for the annual cultural evening.', marathi: 'विद्यार्थी प्रतिनिधींनो, वार्षिक स्नेहसंमेलनासाठी ८०० हून अधिक पालक येतील.', hindi: 'छात्र प्रतिनिधियों, वार्षिक उत्सव के लिए ८०० से अधिक अभिभावकों के आने की उम्मीद है।' },
      { id: 2, who: 'riya', text: 'The hospitality committee has designated clear signage and parking corridors.', marathi: 'स्वागत समितीने दिशादर्शक फलक आणि वाहनतळ नियोजन केले आहे.', hindi: 'स्वागत समिति ने स्पष्ट संकेत बोर्ड और पार्किंग क्षेत्र तय किए हैं।' },
      { id: 3, who: 'teacher', text: 'What is our protocol if someone requires immediate first aid?', marathi: 'तात्काळ प्रथमोपचाराची गरज भासल्यास काय योजना आहे?', hindi: 'यदि किसी को तुरंत प्राथमिक चिकित्सा की आवश्यकता हो तो क्या योजना है?' },
      { id: 4, who: 'riya', text: 'Red Cross volunteers will be stationed at entrance gates with basic medical kits.', marathi: 'रेड क्रॉसचे स्वयंसेवक प्रवेशद्वारावर प्रथमोपचार पेटीसह उपस्थित राहतील.', hindi: 'रेड क्रॉस स्वयंसेवक प्रवेश द्वारों पर प्राथमिक उपचार किट के साथ तैनात रहेंगे।' },
      { id: 5, who: 'teacher', text: 'Commendable foresight. Your leadership ensures a smooth festival.', marathi: 'उत्तम पूर्वतयारी. तुमच्या सहकार्यामुळे कार्यक्रम यशस्वी होईल.', hindi: 'सराहनीय दूरदर्शिता। आपके नेतृत्व से कार्यक्रम सुव्यवस्थित होगा।' },
    ],
    vocabulary: [
      { word: 'hospitality', partOfSpeech: 'noun', meaning: 'Friendly reception and care of guests', marathi: 'अतिथी सत्कार / स्वागत', hindi: 'अतिथि सत्कार', example: 'The hospitality team welcomed the chief guests.' },
      { word: 'protocol', partOfSpeech: 'noun', meaning: 'Official procedure or set of rules', marathi: 'नियमावली / कार्यपद्धती', hindi: 'नियम / कार्यप्रणाली', example: 'Follow emergency safety protocol.' },
    ],
    questions: [
      { id: 1, speaker: 'teacher', fullSentence: 'Always observe the safety protocol.', missingWord: 'protocol', marathi: 'सुरक्षा नियमावलीचे पालन करा.', hindi: 'सुरक्षा नियमों का पालन करें।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'How will you handle crowd management near the auditorium doors?',
        teacherMarathi: 'सभागृहाच्या दाराजवळ गर्दीचे नियोजन कसे कराल?', teacherHindi: 'सभागार के प्रवेश द्वार पर भीड़ को कैसे नियंत्रित करेंगे?',
        suggestedRiyaReplies: ['We will form organized entry queues and guide attendees row by row.'],
        keyWordsNeeded: ['queues', 'organized', 'guide', 'attendees'],
        encouragement: 'Responsible organizational communication.',
      },
    ],
  },
  {
    id: 29,
    level: 6,
    group: 'C',
    title: 'Interschool quiz semi-final',
    subtitle: 'Coordinating rapid buzzer round on world geography',
    setting: 'Quiz Hall • Competitive knowledge round with rival schools',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Contestants, finger on the buzzer. Name the longest river in Asia.', marathi: 'स्पर्धकांनो, बझरवर बोट ठेवा. आशियातील सर्वात लांब नदी कोणती?', hindi: 'प्रतियोगियों, बजर पर हाथ रखें। एशिया की सबसे लंबी नदी कौन सी है?' },
      { id: 2, who: 'riya', text: '(Presses buzzer) The Yangtze River in China!', marathi: '(बझर दाबत) चीनमधील यांग्त्से नदी!', hindi: '(बजर दबाते हुए) चीन में यांग्त्से नदी!' },
      { id: 3, who: 'teacher', text: 'Spot on! Ten points to Smart English Sathi School. Next question...', marathi: 'अगदी बरोबर! दहा गुण मिळाले. पुढील प्रश्न...', hindi: 'बिल्कुल सही! दस अंक मिले। अगला प्रश्न...' },
      { id: 4, who: 'riya', text: 'Thank you. We are ready for the tie-breaker round.', marathi: 'धन्यवाद. आम्ही पुढील फेरीसाठी तयार आहोत.', hindi: 'धन्यवाद। हम अगले राउंड के लिए तैयार हैं।' },
      { id: 5, who: 'teacher', text: 'With that swift answer, your school enters the grand finals!', marathi: 'या अचूक उत्तरामुळे तुमची शाळा महाअंतिम फेरीत पोहोचली!', hindi: 'इस सटीक उत्तर के साथ आपका स्कूल फाइनल में पहुँच गया!' },
    ],
    vocabulary: [
      { word: 'contestant', partOfSpeech: 'noun', meaning: 'A participant in a competition', marathi: 'स्पर्धक', hindi: 'प्रतियोगी', example: 'Each contestant had thirty seconds to respond.' },
      { word: 'swift', partOfSpeech: 'adjective', meaning: 'Happening quickly or moving fast', marathi: 'चपळ / तात्काळ', hindi: 'तेज़ / त्वरित', example: 'Her swift response earned bonus points.' },
    ],
    questions: [
      { id: 1, speaker: 'teacher', fullSentence: 'The swift buzzer response clinched the victory.', missingWord: 'swift', marathi: 'चपळ उत्तराने विजय मिळवून दिला.', hindi: 'त्वरित उत्तर ने जीत दिलाई।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'What strategy do you follow when deciding whether to buzz on a question?',
        teacherMarathi: 'बझर दाबायचा की नाही हे तुम्ही कसे ठरवता?', teacherHindi: 'बजर दबाने का निर्णय आप कैसे लेते हैं?',
        suggestedRiyaReplies: ['I only buzz when I am at least ninety percent certain to avoid negative points.'],
        keyWordsNeeded: ['buzz', 'certain', 'points', 'negative'],
        encouragement: 'Strategic competitive speaking.',
      },
    ],
  },
  {
    id: 30,
    level: 6,
    group: 'C',
    title: 'Career stream selection',
    subtitle: 'Deciding between Science, Commerce, and Humanities after Class 10',
    setting: 'Career Counseling Cell • Aligning aptitude with future goals',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Riya, have you deliberated on your academic stream for Class 11?', marathi: 'रिया, इयत्ता ११वी साठी कोणत्या शाखेत प्रवेश घ्यायचा याचा तू विचार केलास का?', hindi: 'रिया, क्या तुमने ग्यारहवीं कक्षा के लिए अपनी स्ट्रीम पर विचार किया है?' },
      { id: 2, who: 'riya', text: 'I am passionate about computer science and environmental analytics.', marathi: 'मला कॉम्प्युटर सायन्स आणि पर्यावरण विश्लेषणाची खूप आवड आहे.', hindi: 'मुझे कंप्यूटर साइंस और पर्यावरण विश्लेषण में गहरी रुचि है।' },
      { id: 3, who: 'teacher', text: 'Then Physics, Chemistry, and Mathematics with Informatics is ideal.', marathi: 'मग भौतिकशास्त्र, रसायनशास्त्र, गणित आणि इन्फॉर्मेशन टेक्नॉलॉजी उत्तम ठरेल.', hindi: 'तो भौतिकी, रसायन, गणित और आईटी विषय सबसे उपयुक्त रहेंगे।' },
      { id: 4, who: 'riya', text: 'Will this combination keep options open for multidisciplinary research?', marathi: 'यामुळे पुढील संशोधनासाठी सर्व वाटा खुल्या राहतील ना?', hindi: 'क्या इससे आगे बहुविषयक शोध के विकल्प खुले रहेंगे?' },
      { id: 5, who: 'teacher', text: 'Undoubtedly. Your strong foundation guarantees versatile career paths.', marathi: 'नक्कीच! तुझा पाया पक्का असल्याने अनेक उत्तम संधी मिळतील.', hindi: 'निःसंदेह। तुम्हारी मजबूत नींव से कई बेहतरीन रास्ते खुलेंगे।' },
    ],
    vocabulary: [
      { word: 'deliberated', partOfSpeech: 'verb', meaning: 'Carefully considered or discussed', marathi: 'सखोल विचार केला', hindi: 'गहन विचार किया', example: 'She deliberated before selecting her college major.' },
      { word: 'multidisciplinary', partOfSpeech: 'adjective', meaning: 'Combining several academic disciplines', marathi: 'बहुविद्याशाखीय', hindi: 'बहुविषयक', example: 'Data science is a multidisciplinary field.' },
    ],
    questions: [
      { id: 1, speaker: 'riya', fullSentence: 'I aim to pursue multidisciplinary research.', missingWord: 'multidisciplinary', marathi: 'मला बहुविद्याशाखीय संशोधन करायचे आहे.', hindi: 'मैं बहुविषयक शोध करना चाहती हूँ।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'What factors influenced your decision to select the Science stream?',
        teacherMarathi: 'विज्ञान शाखा निवडण्यामागे तुझी काय कारणे आहेत?', teacherHindi: 'विज्ञान स्ट्रीम चुनने के पीछे आपकी क्या प्रेरणा है?',
        suggestedRiyaReplies: ['My curiosity for mathematical modeling and technology inspired this choice.'],
        keyWordsNeeded: ['curiosity', 'technology', 'science', 'choice'],
        encouragement: 'Mature vision and career clarity.',
      },
    ],
  },

  // --- LEVEL 7 (Class 11 Advanced: 31 - 35) ---
  {
    id: 31,
    level: 7,
    group: 'D',
    title: 'College entrance seminar',
    subtitle: 'Analyzing university admissions and competitive entrance formats',
    setting: 'College Auditorium • Q&A with admission directors',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Riya, what criteria do premier engineering and design institutes evaluate?', marathi: 'रिया, नामांकित संस्था प्रवेशासाठी कोणती निकष तपासतात?', hindi: 'रिया, प्रमुख संस्थान प्रवेश के लिए किन मानदंडों का मूल्यांकन करते हैं?' },
      { id: 2, who: 'riya', text: 'Beyond standardized test ranks, they assess portfolio projects, analytical essays, and interview rigor.', marathi: 'परीक्षेच्या गुणांव्यतिरिक्त ते प्रकल्प, निबंध आणि मुलाखतीचे मूल्यमापन करतात.', hindi: 'परीक्षा रैंक के अलावा वे प्रोजेक्ट्स, निबंध और साक्षात्कार का मूल्यांकन करते हैं।' },
      { id: 3, who: 'teacher', text: 'How do you articulate extracurricular achievements without sounding boastful?', marathi: 'अहंकारी न वाटता स्वतःचे यश आत्मविश्वासाने कसे मांडावे?', hindi: 'अहंकारी लगे बिना अपनी उपलब्धियों को विनम्रता से कैसे प्रस्तुत करें?' },
      { id: 4, who: 'riya', text: 'Focus on collaboration, lessons learned from obstacles, and community impact.', marathi: 'सहकार्य, अडचणींतून घेतलेले धडे आणि समाजोपयोगी कार्यावर भर देऊन.', hindi: 'टीमवर्क, गलतियों से सीखी गई बातों और सामाजिक प्रभाव पर ध्यान केंद्रित करके।' },
      { id: 5, who: 'teacher', text: 'A balanced perspective that impresses the most discerning interview panels.', marathi: 'अतिशय समतोल विचारसरणी! मुलाखतकार प्रभावित होतील.', hindi: 'एक संतुलित दृष्टिकोण जो चयन समिति को अत्यंत प्रभावित करेगा।' },
    ],
    vocabulary: [
      { word: 'standardized', partOfSpeech: 'adjective', meaning: 'Conforming to an established norm or test', marathi: 'प्रमाणित', hindi: 'मानकीकृत', example: 'Standardized exams ensure fair comparison.' },
      { word: 'discerning', partOfSpeech: 'adjective', meaning: 'Having or showing good judgment', marathi: 'पारखी / सूक्ष्म दृष्टी असलेला', hindi: 'पारखी / विवेकशील', example: 'The discerning panel selected top candidates.' },
    ],
    questions: [
      { id: 1, speaker: 'teacher', fullSentence: 'The discerning judges evaluated all portfolios.', missingWord: 'discerning', marathi: 'पारखी परीक्षकांनी मूल्यमापन केले.', hindi: 'पारखी जजों ने सभी पोर्टफोलियो का मूल्यांकन किया।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'How will you describe your biggest learning experience outside textbooks?',
        teacherMarathi: 'पुस्तकाबाहेरील सर्वात मोठा अनुभव कसा सांगाल?', teacherHindi: 'किताबों के बाहर अपना सबसे बड़ा अनुभव कैसे बयाँ करेंगे?',
        suggestedRiyaReplies: ['Leading the school eco-club taught me resilience, budgeting, and team delegation.'],
        keyWordsNeeded: ['leading', 'resilience', 'team', 'experience'],
        encouragement: 'Eloquent, introspective oratory.',
      },
    ],
  },
  {
    id: 32,
    level: 7,
    group: 'D',
    title: 'Research paper presentation',
    subtitle: 'Presenting findings on solar microgrid efficiency',
    setting: 'Conference Hall • Defending research methodology before judges',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Please outline your hypothesis regarding decentralized rooftop solar arrays.', marathi: 'विकेंद्रित सौर पॅनेल्सविषयी तुमचे गृहीतक मांडून दाखवा.', hindi: 'छत पर सौर ग्रिड की दक्षता पर अपनी परिकल्पना प्रस्तुत करें।' },
      { id: 2, who: 'riya', text: 'We hypothesized that integrating battery storage reduces transmission line losses by 18%.', marathi: 'बॅटरी साठवणुकीमुळे वीजवहनातील नुकसान १८% कमी होते हे आमचे गृहीतक होते.', hindi: 'हमारा मानना था कि बैटरी स्टोरेज से ट्रांसमिशन का नुकसान 18% कम होता है।' },
      { id: 3, who: 'teacher', text: 'What empirical data supports your assertion?', marathi: 'तुमच्या दाव्याला कोणता प्रत्यक्ष डेटा आधार देतो?', hindi: 'आपके दावे का कौन सा प्रायोगिक डेटा समर्थन करता है?' },
      { id: 4, who: 'riya', text: 'Continuous smart meter telemetry collected over six months across thirty test households.', marathi: 'तीस घरांतून सहा महिने गोळा केलेला स्मार्ट मीटरचा अचूक डेटा.', hindi: 'तीस घरों से छह महीने तक स्मार्ट मीटर द्वारा जुटाया गया सटीक डेटा।' },
      { id: 5, who: 'teacher', text: 'Your rigorous statistical sampling withstands scholarly scrutiny.', marathi: 'तुमचे सांख्यिकी विश्लेषण शास्त्रीय निकषांवर खरे उतरते.', hindi: 'आपका सांख्यिकीय विश्लेषण वैज्ञानिक मानकों पर खरा उतरता है।' },
    ],
    vocabulary: [
      { word: 'hypothesis', partOfSpeech: 'noun', meaning: 'A proposed explanation based on limited evidence', marathi: 'गृहीतक', hindi: 'परिकल्पना', example: 'Test the hypothesis through repeated trials.' },
      { word: 'empirical', partOfSpeech: 'adjective', meaning: 'Based on observation rather than theory', marathi: 'प्रत्यक्ष अनुभवावर आधारित', hindi: 'प्रायोगिक / वास्तविक', example: 'Empirical data confirmed our findings.' },
    ],
    questions: [
      { id: 1, speaker: 'riya', fullSentence: 'Our empirical findings validated the theory.', missingWord: 'empirical', marathi: 'प्रत्यक्ष नोंदींनी सिद्धांताला पुष्टी दिली.', hindi: 'प्रायोगिक तथ्यों ने सिद्धांत की पुष्टि की।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'What limitations did you encounter during data collection?',
        teacherMarathi: 'माहिती गोळा करताना कोणत्या मर्यादा आल्या?', teacherHindi: 'डेटा संग्रह के दौरान क्या सीमाएँ सामने आईं?',
        suggestedRiyaReplies: ['Cloud cover during monsoons caused periodic dropouts in solar yield measurements.'],
        keyWordsNeeded: ['dropouts', 'measurements', 'weather', 'limitations'],
        encouragement: 'High-level academic defense.',
      },
    ],
  },
  {
    id: 33,
    level: 7,
    group: 'D',
    title: 'Model United Nations debate',
    subtitle: 'Representing country delegation on renewable energy transition',
    setting: 'MUN Assembly Hall • Delivering formal diplomatic caucus speech',
    dialogs: [
      { id: 1, who: 'teacher', text: 'The chair recognizes the Delegate of India. You have 90 seconds.', marathi: 'अध्यक्ष भारताच्या प्रतिनिधींना बोलण्याची परवानगी देतात. ९० सेकंद वेळ आहे.', hindi: 'सभापति भारत के प्रतिनिधि को बोलने की अनुमति देते हैं। आपके पास 90 सेकंड हैं।' },
      { id: 2, who: 'riya', text: 'Honorable Chair and distinguished delegates: Climate equity demands global financial technology transfers.', marathi: 'आदरणीय अध्यक्ष आणि सन्माननीय प्रतिनिधींनो: हवामान न्यायासाठी जागतिक तंत्रज्ञान सहकार्य आवश्यक आहे.', hindi: 'माननीय अध्यक्ष एवं साथी प्रतिनिधियों: जलवायु न्याय के लिए वित्तीय और तकनीकी सहयोग अनिवार्य है।' },
      { id: 3, who: 'teacher', text: 'Will the delegate yield time to points of information?', marathi: 'माननीय प्रतिनिधी प्रश्नांसाठी वेळ देणार आहेत का?', hindi: 'क्या प्रतिनिधि प्रश्नों के उत्तर के लिए समय देंगे?' },
      { id: 4, who: 'riya', text: 'The delegate welcomes questions regarding solar alliance investments and emissions targets.', marathi: 'सौर आघाडी आणि प्रदूषण मुक्तीच्या उद्दिष्टांवरील सर्व प्रश्नांचे आम्ही स्वागत करतो.', hindi: 'सौर गठबंधन और उत्सर्जन लक्ष्यों से संबंधित प्रश्नों का हम स्वागत करते हैं।' },
      { id: 5, who: 'teacher', text: 'A masterclass in diplomatic poise and articulate international advocacy.', marathi: 'मुत्सद्दी भाषा आणि प्रभावी वक्तृत्वाचा उत्कृष्ट नमुना.', hindi: 'राजनयिक शालीनता और प्रभावी अंतरराष्ट्रीय वक्तृत्व का बेहतरीन उदाहरण।' },
    ],
    vocabulary: [
      { word: 'distinguished', partOfSpeech: 'adjective', meaning: 'Dignified or noted for excellence', marathi: 'सन्माननीय / नामवंत', hindi: 'विशिष्ट / सम्मानित', example: 'Welcome the distinguished delegates.' },
      { word: 'advocacy', partOfSpeech: 'noun', meaning: 'Public support for a particular cause or policy', marathi: 'समर्थन / पाठपुरावा', hindi: 'समर्थन / वकालत', example: 'Global advocacy accelerated climate action.' },
    ],
    questions: [
      { id: 1, speaker: 'teacher', fullSentence: 'She addressed the distinguished assembly.', missingWord: 'distinguished', marathi: 'तिने सन्माननीय सभेला संबोधित केले.', hindi: 'उसने सम्मानित सभा को संबोधित किया।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'How do you propose developing nations balance industrial growth with carbon limits?',
        teacherMarathi: 'विकास आणि प्रदूषण नियंत्रण यांचा समतोल कसा साधाल?', teacherHindi: 'विकास और प्रदूषण नियंत्रण में संतुलन कैसे स्थापित करेंगे?',
        suggestedRiyaReplies: ['Through subsidized clean technology adoption and decentralized solar installations.'],
        keyWordsNeeded: ['technology', 'clean', 'solar', 'subsidized'],
        encouragement: 'Statesmanlike international diplomacy.',
      },
    ],
  },
  {
    id: 34,
    level: 7,
    group: 'D',
    title: 'Bank account opening & KYC',
    subtitle: 'Handling student savings account and mobile banking inquiry',
    setting: 'National Bank Branch • Meeting branch manager for documentation',
    dialogs: [
      { id: 1, who: 'teacher', text: 'Good morning. How may our banking associates assist you today?', marathi: 'शुभ प्रभात. बँक आपणास कशी मदत करू शकते?', hindi: 'शुभ प्रभात। आज बैंक आपकी किस प्रकार सहायता कर सकता है?' },
      { id: 2, who: 'riya', text: 'Good morning. I wish to open a student savings account with digital UPI access.', marathi: 'मला डिजिटल युपीआय सुविधेसह विद्यार्थी बचत खाते उघडायचे आहे.', hindi: 'मुझे डिजिटल यूपीआई सुविधा के साथ छात्र बचत खाता खोलना है।' },
      { id: 3, who: 'teacher', text: 'Did you bring your Aadhaar, school bona fide certificate, and passport photos?', marathi: 'तुम्ही आधार कार्ड, शालेय प्रमाणपत्र आणि छायाचित्रे आणली आहेत का?', hindi: 'क्या आप आधार कार्ड, स्कूल प्रमाण पत्र और पासपोर्ट फोटो लाए हैं?' },
      { id: 4, who: 'riya', text: 'Yes, here are the attested duplicates along with the signed KYC declaration.', marathi: 'होय, हे साक्षांकित कागदपत्रे आणि स्वाक्षरी केलेला अर्ज.', hindi: 'हाँ, यह रहे प्रमाणित दस्तावेज और हस्ताक्षरित केवाईसी फॉर्म।' },
      { id: 5, who: 'teacher', text: 'Your credentials are verified. Your debit card will arrive within three business days.', marathi: 'कागदपत्रे तपासली गेली. तीन दिवसांत डेबिट कार्ड घरपोच मिळेल.', hindi: 'दस्तावेज सत्यापित हो गए। तीन कार्य दिवसों में डेबिट कार्ड पहुँच जाएगा।' },
    ],
    vocabulary: [
      { word: 'credentials', partOfSpeech: 'noun', meaning: 'Documents proving qualifications or identity', marathi: 'ओळखपत्रे / कागदपत्रे', hindi: 'प्रमाण पत्र / परिचय दस्तावेज', example: 'Verify bank credentials securely.' },
      { word: 'attested', partOfSpeech: 'adjective', meaning: 'Formally verified as true or authentic', marathi: 'साक्षांकित / प्रमाणित', hindi: 'सत्यापित / प्रमाणित', example: 'Submit attested copies of your marksheet.' },
    ],
    questions: [
      { id: 1, speaker: 'riya', fullSentence: 'I submitted my attested identity documents.', missingWord: 'attested', marathi: 'मी साक्षांकित कागदपत्रे जमा केली.', hindi: 'मैंने अपने सत्यापित दस्तावेज जमा किए।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'What security precautions will you take while using mobile banking apps?',
        teacherMarathi: 'मोबाईल बँकिंग वापरताना कोणती खबरदारी घ्याल?', teacherHindi: 'मोबाइल बैंकिंग का उपयोग करते समय क्या सावधानी बरतेंगे?',
        suggestedRiyaReplies: ['I will never share my OTP or UPI PIN with anyone over call or text.'],
        keyWordsNeeded: ['share', 'PIN', 'OTP', 'security'],
        encouragement: 'Essential real-world financial literacy.',
      },
    ],
  },
  {
    id: 35,
    level: 7,
    group: 'D',
    title: 'Railway station ticket inquiry',
    subtitle: 'Resolving Tatkal booking confirmation and platform change',
    setting: 'Railway Inquiry Counter • Asking ticket clerk about train delay',
    dialogs: [
      { id: 1, who: 'riya', text: 'Excuse me sir, could you check the PNR status for Train 12128 to Mumbai?', marathi: 'क्षमस्व सर, ट्रेन १२१२८ च्या तिकीटाची स्थिती सांगाल का?', hindi: 'माफ़ कीजिएगा सर, क्या आप ट्रेन 12128 की पीएनआर स्थिति बता सकते हैं?' },
      { id: 2, who: 'teacher', text: 'Your Tatkal waitlist ticket has been confirmed in Coach B3, Berth 42.', marathi: 'तुमचे तात्काळ तिकीट कन्फर्म झाले असून बोगी बी३, बर्थ ४२ मिळाला आहे.', hindi: 'आपका तत्काल टिकट कन्फर्म हो गया है, कोच बी3, बर्थ 42।' },
      { id: 3, who: 'riya', text: 'Has the arrival platform changed due to track maintenance work?', marathi: 'रेल्वे रुळांच्या कामामुळे प्लॅटफॉर्म क्रमांक बदलला आहे का?', hindi: 'क्या ट्रैक मेंटेनेंस के कारण प्लेटफॉर्म बदला गया है?' },
      { id: 4, who: 'teacher', text: 'Yes, please proceed to Platform 4 using the foot overbridge.', marathi: 'होय, कृपया पादचारी पुलाचा वापर करून प्लॅटफॉर्म ४ वर जा.', hindi: 'हाँ, कृपया फुट ओवरब्रिज से होकर प्लेटफॉर्म 4 पर जाइए।' },
      { id: 5, who: 'riya', text: 'Thank you for the prompt update. Have a pleasant day.', marathi: 'वेळेवर माहिती दिल्याबद्दल धन्यवाद.', hindi: 'समय पर जानकारी देने के लिए धन्यवाद। आपका दिन शुभ हो।' },
    ],
    vocabulary: [
      { word: 'confirmed', partOfSpeech: 'adjective', meaning: 'Made definite or verified', marathi: 'निश्चित झालेले', hindi: 'पुष्ट / पक्का', example: 'Her train reservation was confirmed.' },
      { word: 'maintenance', partOfSpeech: 'noun', meaning: 'The process of preserving equipment or tracks in good condition', marathi: 'दुरुस्ती व देखभाल', hindi: 'रखरखाव', example: 'Regular track maintenance prevents accidents.' },
    ],
    questions: [
      { id: 1, speaker: 'teacher', fullSentence: 'Your seat reservation is confirmed in coach B3.', missingWord: 'confirmed', marathi: 'तुमची जागा निश्चित झाली आहे.', hindi: 'आपकी सीट कन्फर्म हो गई है।' },
    ],
    roleplaySteps: [
      {
        step: 1,
        teacherPrompt: 'Excuse me traveler, do you know where the cloak room is situated?',
        teacherMarathi: 'सामान ठेवण्याची खोली कुठे आहे?', teacherHindi: 'क्लॉक रूम कहाँ स्थित है?',
        suggestedRiyaReplies: ['Yes, it is next to the chief station master office on Platform 1.'],
        keyWordsNeeded: ['Platform', 'next', 'office', 'situated'],
        encouragement: 'Courteous public transit dialogue.',
      },
    ],
  },
];
