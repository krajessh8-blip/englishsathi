const fs = require('fs');
const path = require('path');

function applyTranslations() {
  const translationsPath = path.join(__dirname, 'marathi_translations.json');
  if (!fs.existsSync(translationsPath)) {
    console.error('marathi_translations.json does not exist yet.');
    return;
  }

  const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));
  const situationsPath = path.join(__dirname, '..', 'src', 'data', 'situations.ts');
  let content = fs.readFileSync(situationsPath, 'utf8');

  let hindiCount = 0;
  let teacherHindiCount = 0;

  // Replace teacherHindi: '...' with teacherMarathi: '...', teacherHindi: '...'
  content = content.replace(/teacherHindi:\s*'([^']*)'/g, (match, hindiText) => {
    const marathi = translations[hindiText] || translations[hindiText.trim()];
    if (marathi) {
      teacherHindiCount++;
      const safeMarathi = marathi.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      return `teacherMarathi: '${safeMarathi}', teacherHindi: '${hindiText.replace(/'/g, "\\'")}'`;
    }
    console.warn('Missing teacherHindi translation for:', hindiText);
    return match;
  });

  // Replace hindi: '...' with marathi: '...', hindi: '...'
  content = content.replace(/(?<!teacher)hindi:\s*'([^']*)'/g, (match, hindiText) => {
    const marathi = translations[hindiText] || translations[hindiText.trim()];
    if (marathi) {
      hindiCount++;
      const safeMarathi = marathi.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      return `marathi: '${safeMarathi}', hindi: '${hindiText.replace(/'/g, "\\'")}'`;
    }
    console.warn('Missing hindi translation for:', hindiText);
    return match;
  });

  fs.writeFileSync(situationsPath, content, 'utf8');
  console.log(`Successfully updated situations.ts!`);
  console.log(`Added Marathi to ${hindiCount} hindi fields and ${teacherHindiCount} teacherHindi fields.`);
}

applyTranslations();
