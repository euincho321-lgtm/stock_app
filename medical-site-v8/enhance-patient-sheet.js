(function () {
  const output = document.querySelector('#prompt-output');
  const copyButton = document.querySelector('#copy-prompt');

  if (!output) {
    return;
  }

  function createPatientLineElement(key, text) {
    const line = document.createElement('div');
    line.className = 'patient-line';
    line.dataset.patientLine = key;

    const checkbox = document.createElement('input');
    checkbox.className = 'patient-check-inline';
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.dataset.lineTarget = key;
    checkbox.setAttribute('aria-label', key);

    const textarea = document.createElement('textarea');
    textarea.rows = 2;
    textarea.value = text;

    line.append(checkbox, textarea);
    return line;
  }

  function upgradePatientSheet() {
    const patientCard = output.querySelector('.patient-card');
    if (!patientCard || patientCard.dataset.enhanced === 'true') {
      return;
    }

    const introSection = output.querySelector('[data-patient-item="intro"]');
    if (introSection) {
      const paragraph = introSection.querySelector('p');
      if (paragraph) {
        const lines = document.createElement('div');
        lines.className = 'patient-lines';
        lines.append(createPatientLineElement('intro-0', paragraph.textContent.trim()));
        paragraph.replaceWith(lines);
      }
    }

    ['medication', 'lifestyle', 'cautions'].forEach((group) => {
      const section = output.querySelector(`[data-patient-item="${group}"]`);
      if (!section) {
        return;
      }

      const list = section.querySelector('ul');
      if (!list) {
        return;
      }

      const lines = document.createElement('div');
      lines.className = 'patient-lines';

      [...list.querySelectorAll('li')].forEach((item, index) => {
        lines.append(createPatientLineElement(`${group}-${index}`, item.textContent.trim()));
      });

      list.replaceWith(lines);
    });

    if (!output.querySelector('[data-patient-item="doctor-note"]')) {
      const footer = output.querySelector('[data-patient-item="footer"]');
      const noteSection = document.createElement('div');
      noteSection.className = 'patient-item';
      noteSection.dataset.patientItem = 'doctor-note';
      noteSection.innerHTML = `
        <div class="patient-select-row">
          <input class="patient-check" type="checkbox" checked data-target="doctor-note">
          <h4>추가 의견</h4>
        </div>
        <textarea class="editable-note" rows="4" placeholder="환자에게 별도로 전달할 안내나 추적 관찰 계획을 자유롭게 수정해서 적으세요."></textarea>
      `;

      if (footer) {
        patientCard.insertBefore(noteSection, footer);
      } else {
        patientCard.append(noteSection);
      }
    }

    patientCard.dataset.enhanced = 'true';
  }

  function getCopyableOutputText() {
    const clone = output.cloneNode(true);
    clone.querySelectorAll('textarea').forEach((textarea) => {
      textarea.replaceWith(document.createTextNode(textarea.value));
    });
    return clone.innerText;
  }

  output.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.classList.contains('patient-check-inline')) {
      return;
    }

    const key = target.dataset.lineTarget;
    const line = output.querySelector(`[data-patient-line="${key}"]`);
    if (!line) {
      return;
    }

    line.classList.toggle('is-hidden', !target.checked);
  });

  if (copyButton) {
    copyButton.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const text = getCopyableOutputText();
      if (!text || text.startsWith('아직 생성된 내용이 없습니다')) {
        window.alert('먼저 환자 정보를 입력하고 결과를 생성해 주세요.');
        return;
      }

      try {
        await navigator.clipboard.writeText(text);
        copyButton.textContent = '복사 완료';
        window.setTimeout(() => {
          copyButton.textContent = '결과 복사';
        }, 1600);
      } catch (error) {
        window.alert('복사에 실패했습니다. 직접 선택해서 복사해 주세요.');
      }
    }, true);
  }

  const observer = new MutationObserver(() => {
    upgradePatientSheet();
  });

  observer.observe(output, { childList: true, subtree: true });
  upgradePatientSheet();
})();
