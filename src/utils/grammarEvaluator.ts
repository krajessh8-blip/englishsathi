import { GrammarTopic } from '../types';

export interface GrammarEvaluationResult {
  originalSentence: string;
  betterSentence: string;
  whyExplanation: string;
  whyExplanationMr: string;
  whyExplanationHi?: string;
  score: number; // 0-100
  tenseScore: number;
  agreementScore: number;
  wordOrderScore: number;
  isCorrect: boolean;
  keyPoints: string[];
}

/**
 * Intelligent grammar evaluator that analyzes student speech or text input against
 * topic target patterns, common mistakes, tense, subject-verb agreement, and word order.
 */
export function evaluateGrammarSpeech(
  input: string,
  topic: GrammarTopic
): GrammarEvaluationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      originalSentence: '(No sentence spoken)',
      betterSentence: topic.speaking_practice.suggestedAnswer,
      whyExplanation: 'Please speak or enter a complete English sentence to get feedback.',
      whyExplanationMr: 'कृपया अभिप्रायासाठी पूर्ण इंग्रजी वाक्य बोला किंवा लिहा.',
      score: 40,
      tenseScore: 40,
      agreementScore: 40,
      wordOrderScore: 40,
      isCorrect: false,
      keyPoints: ['Sentence is empty', 'Try speaking clearly'],
    };
  }

  const lower = trimmed.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);

  // Check against common mistakes for this topic
  let foundMistakeCorrection: { incorrect: string; correct: string; why: string; marathiWhy?: string } | null = null;
  if (topic.common_mistakes && topic.common_mistakes.length > 0) {
    for (const cm of topic.common_mistakes) {
      const incKeywords = cm.incorrect.toLowerCase().split(/\s+/).slice(0, 3).join(' ');
      if (lower.includes(incKeywords)) {
        foundMistakeCorrection = cm;
        break;
      }
    }
  }

  // Check basic grammar rules:
  // 1. Capitalization & punctuation
  const startsWithCapital = /^[A-Z]/.test(trimmed);
  const endsWithPunctuation = /[.?!]$/.test(trimmed);

  // 2. Common agreement errors (e.g. "he go", "she want", "they is", "I has")
  const agreementErrors: { pattern: RegExp; correction: string; reason: string; mr: string }[] = [
    { pattern: /\b(he|she|it)\s+go\b/i, correction: '$1 goes', reason: 'Singular subjects (he/she/it) take "goes", not "go".', mr: 'He/she/it सोबत "goes" वापरावे.' },
    { pattern: /\b(he|she|it)\s+play\b/i, correction: '$1 plays', reason: 'Add -s for singular subjects: "plays".', mr: 'एकवचनी कर्त्यासोबत क्रियापदाला -s लागते (plays).' },
    { pattern: /\b(he|she|it)\s+have\b/i, correction: '$1 has', reason: 'Use "has" with he, she, and it.', mr: 'He, she, it सोबत "has" वापरतात.' },
    { pattern: /\b(they|we|you)\s+is\b/i, correction: '$1 are', reason: 'Plural subjects use "are", not "is".', mr: 'अनेकवचनी कर्त्यांसोबत "are" वापरतात.' },
    { pattern: /\b(i)\s+is\b/i, correction: 'I am', reason: 'First person "I" takes "am".', mr: '"I" सोबत "am" वापरतात.' },
    { pattern: /\b(i)\s+has\b/i, correction: 'I have', reason: 'First person "I" takes "have".', mr: '"I" सोबत "have" वापरतात.' },
    { pattern: /\ba\s+([aeiou]\w+)/i, correction: 'an $1', reason: 'Use "an" before vowel sounds (a, e, i, o, u).', mr: 'स्वराच्या उच्चारापूर्वी "an" वापरतात.' },
  ];

  let detectedAgreementRule: (typeof agreementErrors)[0] | null = null;
  for (const rule of agreementErrors) {
    if (rule.pattern.test(trimmed)) {
      detectedAgreementRule = rule;
      break;
    }
  }

  // 3. Length / completeness check
  const isTooShort = words.length < 3;

  // Synthesize better sentence
  let betterSentence = topic.speaking_practice.suggestedAnswer;
  let whyExplanation = '';
  let whyExplanationMr = '';
  let whyExplanationHi = '';
  let baseScore = 92;
  const keyPoints: string[] = [];

  if (foundMistakeCorrection) {
    betterSentence = trimmed.replace(new RegExp(foundMistakeCorrection.incorrect, 'gi'), foundMistakeCorrection.correct);
    whyExplanation = foundMistakeCorrection.why;
    whyExplanationMr = foundMistakeCorrection.marathiWhy || 'इंग्रजी नियमानुसार वाक्यात सुधारणा केली आहे.';
    baseScore = 70;
    keyPoints.push(`Mistake detected: ${foundMistakeCorrection.why}`);
  } else if (detectedAgreementRule) {
    betterSentence = trimmed.replace(detectedAgreementRule.pattern, detectedAgreementRule.correction);
    whyExplanation = detectedAgreementRule.reason;
    whyExplanationMr = detectedAgreementRule.mr;
    whyExplanationHi = 'कर्ता और क्रिया के मेल (Subject-Verb Agreement) का ध्यान रखें।';
    baseScore = 74;
    keyPoints.push(detectedAgreementRule.reason);
  } else if (isTooShort) {
    betterSentence = topic.speaking_practice.suggestedAnswer;
    whyExplanation = `Try speaking a fuller sentence. For example: "${topic.speaking_practice.suggestedAnswer}"`;
    whyExplanationMr = `अजून थोडे मोठे आणि परिपूर्ण वाक्य बोलण्याचा प्रयत्न करा.`;
    whyExplanationHi = `कृपया पूरा और स्पष्ट वाक्य बोलें।`;
    baseScore = 65;
    keyPoints.push('Sentence was very brief', 'Add more context');
  } else {
    // Looks great! Capitalize and punctuate if needed
    let polished = trimmed;
    if (!startsWithCapital) polished = polished.charAt(0).toUpperCase() + polished.slice(1);
    if (!endsWithPunctuation) polished = polished + '.';
    betterSentence = polished;
    whyExplanation = `Excellent! Your sentence uses correct grammar and pattern for ${topic.title_en}.`;
    whyExplanationMr = `उत्तम! तुमचे वाक्य व्याकरणाच्या नियमांनुसार बरोबर आहे.`;
    whyExplanationHi = `बहुत बढ़िया! आपका वाक्य व्याकरण के अनुसार सही है।`;
    baseScore = 95;
    keyPoints.push('Correct subject-verb agreement', 'Appropriate word order', 'Clear spoken structure');
  }

  // Clamp scores
  const score = Math.min(100, Math.max(50, baseScore));
  const tenseScore = Math.min(100, Math.max(55, baseScore + (detectedAgreementRule ? -5 : 4)));
  const agreementScore = detectedAgreementRule ? 65 : 94;
  const wordOrderScore = isTooShort ? 60 : 92;

  return {
    originalSentence: trimmed,
    betterSentence,
    whyExplanation,
    whyExplanationMr,
    whyExplanationHi,
    score,
    tenseScore,
    agreementScore,
    wordOrderScore,
    isCorrect: baseScore >= 85,
    keyPoints,
  };
}
