const form = document.querySelector("#patient-form");
const output = document.querySelector("#prompt-output");
const copyButton = document.querySelector("#copy-prompt");
const fillSampleButton = document.querySelector("#fill-sample");

const sampleData = {
  ageSex: "45세 남성",
  chiefComplaint: "3일 전부터 지속되는 기침",
  onsetDuration: "3일 전 시작, 최근 밤에 더 심해짐",
  character: "마른기침 위주, 야간 악화",
  associatedSymptoms: "미열, 인후통",
  aggravatingRelieving: "밤에 악화, 수분 섭취 시 약간 완화",
  pastHistory: "고혈압",
  medications: "암로디핀 복용 중",
  allergies: "특이 약물 알레르기 없음",
  vitals: "BP 128/78, HR 84, BT 37.6",
  physicalExam: "인후 발적, 청진상 수포음 및 wheezing 없음",
  testsDone: "코로나 자가검사 음성",
  additionalNotes: "흡연력 없음"
};

const fieldLabels = {
  ageSex: "나이/성별",
  chiefComplaint: "주증상",
  onsetDuration: "증상 시작 시점 및 기간",
  character: "증상의 양상",
  associatedSymptoms: "동반 증상",
  aggravatingRelieving: "악화/완화 요인",
  pastHistory: "과거력",
  medications: "복용약",
  allergies: "알레르기",
  vitals: "활력징후",
  physicalExam: "진찰 소견",
  testsDone: "시행한 검사와 결과",
  additionalNotes: "추가 메모"
};

function getValue(formData, fieldName) {
  const value = formData.get(fieldName);
  if (typeof value !== "string") {
    return "(미입력)";
  }

  const trimmed = value.trim();
  return trimmed === "" ? "(미입력)" : trimmed;
}

function buildPrompt(data) {
  return `당신은 외래 초진/재진 환자를 평가하는 임상 보조 AI입니다.
아래 환자 정보를 바탕으로 한국어로 간결하지만 실무적으로 정리해 주세요.

[중요 원칙]
- 확정 진단처럼 단정하지 말고, 감별진단의 우선순위를 제시해 주세요.
- 위험 신호(red flags)가 있으면 가장 먼저 따로 강조해 주세요.
- 처방 제안 시에는 일반적인 선택지와 고려사항 중심으로 작성하고, 용량/기간은 환자의 나이, 체중, 신기능, 간기능, 임신 여부, 알레르기, 병용약물, 기저질환에 따라 달라질 수 있음을 밝혀 주세요.
- 증상만으로 판단이 어려우면 반드시 추가 문진 또는 검사를 먼저 제안해 주세요.
- 한국 외래 진료에서 바로 참고할 수 있게 항목별로 정리해 주세요.

[환자 정보]
- ${fieldLabels.ageSex}: ${data.ageSex}
- ${fieldLabels.chiefComplaint}: ${data.chiefComplaint}
- ${fieldLabels.onsetDuration}: ${data.onsetDuration}
- ${fieldLabels.character}: ${data.character}
- ${fieldLabels.associatedSymptoms}: ${data.associatedSymptoms}
- ${fieldLabels.aggravatingRelieving}: ${data.aggravatingRelieving}
- ${fieldLabels.pastHistory}: ${data.pastHistory}
- ${fieldLabels.medications}: ${data.medications}
- ${fieldLabels.allergies}: ${data.allergies}
- ${fieldLabels.vitals}: ${data.vitals}
- ${fieldLabels.physicalExam}: ${data.physicalExam}
- ${fieldLabels.testsDone}: ${data.testsDone}
- ${fieldLabels.additionalNotes}: ${data.additionalNotes}

[출력 형식]
1. 추가 문진 질문
- 주증상을 더 명확히 하기 위해 꼭 물어봐야 할 질문들을 우선순위대로 나열

2. 의심되는 진단
- 가능성이 높은 순서대로 3~5개
- 각 진단마다 왜 의심되는지 한 줄 근거

3. 추가로 필요한 검사
- 필요한 검사를 우선순위대로 나열
- 각 검사 목적을 짧게 설명

4. 가장 의심되는 진단에 대한 정리
- 진단명:
- 왜 가장 의심되는지:
- 약물 처방:
- 생활요법:
- 주의사항:
- 경과 관찰 포인트:

5. Red flags
- 즉시 응급실 의뢰, 추가 평가, 또는 당일 재평가가 필요한 소견

6. 불확실한 점
- 현재 정보로 판단이 어려운 부분과 추가 확인이 필요한 정보`;
}

function syncOutput() {
  const formData = new FormData(form);
  const data = {};

  Object.keys(fieldLabels).forEach((key) => {
    data[key] = getValue(formData, key);
  });

  const prompt = buildPrompt(data);
  output.textContent = prompt;
  localStorage.setItem("josungwon-prescription-form", JSON.stringify(data));
}

function fillForm(values) {
  Object.entries(values).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (field) {
      field.value = value;
    }
  });

  syncOutput();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  syncOutput();
});

form.addEventListener("reset", () => {
  window.setTimeout(() => {
    localStorage.removeItem("josungwon-prescription-form");
    output.textContent = "아직 생성된 내용이 없습니다. 왼쪽에 환자 정보를 입력해 주세요.";
  }, 0);
});

copyButton.addEventListener("click", async () => {
  const text = output.textContent;
  if (!text || text.startsWith("아직 생성된 내용이 없습니다")) {
    window.alert("먼저 환자 정보를 입력하고 결과를 생성해 주세요.");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    copyButton.textContent = "복사 완료";
    window.setTimeout(() => {
      copyButton.textContent = "프롬프트 복사";
    }, 1600);
  } catch (error) {
    window.alert("복사에 실패했습니다. 직접 선택해서 복사해 주세요.");
  }
});

fillSampleButton.addEventListener("click", () => {
  fillForm(sampleData);
});

const saved = localStorage.getItem("josungwon-prescription-form");
if (saved) {
  try {
    fillForm(JSON.parse(saved));
  } catch (error) {
    localStorage.removeItem("josungwon-prescription-form");
  }
}
