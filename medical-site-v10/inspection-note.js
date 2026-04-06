(function () {
  const output = document.querySelector('#prompt-output');

  if (!output) {
    return;
  }

  function buildExamSection() {
    const section = document.createElement('div');
    section.className = 'patient-item';
    section.dataset.patientItem = 'exam-info';

    section.innerHTML = `
      <div class="patient-select-row">
        <input class="patient-check" type="checkbox" checked data-target="exam-info">
        <h4>오늘 검사 내용</h4>
      </div>
      <div class="patient-lines">
        <div class="patient-line" data-patient-line="exam-info-0">
          <input class="patient-check-inline" type="checkbox" checked data-line-target="exam-info-0" aria-label="exam-info-0">
          <textarea rows="2">혈액검사</textarea>
        </div>
        <div class="patient-line" data-patient-line="exam-info-1">
          <input class="patient-check-inline" type="checkbox" checked data-line-target="exam-info-1" aria-label="exam-info-1">
          <textarea rows="2">소변검사</textarea>
        </div>
        <div class="patient-line" data-patient-line="exam-info-2">
          <input class="patient-check-inline" type="checkbox" checked data-line-target="exam-info-2" aria-label="exam-info-2">
          <textarea rows="2">X-ray</textarea>
        </div>
        <div class="patient-line" data-patient-line="exam-info-3">
          <input class="patient-check-inline" type="checkbox" checked data-line-target="exam-info-3" aria-label="exam-info-3">
          <textarea rows="2">심전도</textarea>
        </div>
        <div class="patient-line" data-patient-line="exam-info-4">
          <input class="patient-check-inline" type="checkbox" checked data-line-target="exam-info-4" aria-label="exam-info-4">
          <textarea rows="2">위내시경 / 대장 내시경</textarea>
        </div>
        <div class="patient-line" data-patient-line="exam-info-5">
          <input class="patient-check-inline" type="checkbox" checked data-line-target="exam-info-5" aria-label="exam-info-5">
          <textarea rows="2">초음파 (복부, 갑상선, 경동맥)</textarea>
        </div>
        <div class="patient-line" data-patient-line="exam-info-6">
          <input class="patient-check-inline" type="checkbox" checked data-line-target="exam-info-6" aria-label="exam-info-6">
          <textarea rows="3">검사결과 확인은 2026년 (   )월 (   )일 (오전, 오후) 이후 가능합니다.</textarea>
        </div>
        <div class="patient-line" data-patient-line="exam-info-7">
          <input class="patient-check-inline" type="checkbox" checked data-line-target="exam-info-7" aria-label="exam-info-7">
          <textarea rows="2">방문 또는 전화 문의 바랍니다.</textarea>
        </div>
      </div>
    `;

    return section;
  }

  function insertExamSection() {
    const patientCard = output.querySelector('.patient-card');
    const introSection = output.querySelector('[data-patient-item="intro"]');
    if (!patientCard || !introSection || output.querySelector('[data-patient-item="exam-info"]')) {
      return;
    }

    const divider = document.createElement('hr');
    divider.className = 'patient-divider';
    divider.dataset.examDivider = 'true';

    introSection.insertAdjacentElement('afterend', divider);
    divider.insertAdjacentElement('afterend', buildExamSection());
  }

  const observer = new MutationObserver(() => {
    insertExamSection();
  });

  observer.observe(output, { childList: true, subtree: true });
  insertExamSection();
})();
