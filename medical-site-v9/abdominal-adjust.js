if (typeof symptomLibrary !== 'undefined' && symptomLibrary.abdominalPain && symptomLibrary.abdominalPain.leading) {
  const lifestyle = symptomLibrary.abdominalPain.leading.lifestyle;
  const extraNote = '커피 및 유제품(우유 포함) 섭취 피하기';

  if (Array.isArray(lifestyle) && !lifestyle.includes(extraNote)) {
    lifestyle.splice(2, 0, extraNote);
  }
}

if (typeof syncOutput === 'function' && !output.classList.contains('empty-state')) {
  syncOutput();
}
