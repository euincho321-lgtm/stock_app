const form = document.querySelector("#patient-form");
const output = document.querySelector("#prompt-output");
const copyButton = document.querySelector("#copy-prompt");
const fillSampleButton = document.querySelector("#fill-sample");
const printButton = document.querySelector("#print-result");

const symptomLibrary = {
  cough: {
    keywords: ["기침", "가래", "마른기침"],
    title: "기침",
    questions: [
      "기침이 시작된 시점과 지속 기간은 얼마나 되는가?",
      "마른기침인지, 가래가 동반되는지, 가래 색은 어떤가?",
      "발열, 인후통, 콧물, 근육통 등 상기도 감염 증상이 있는가?",
      "호흡곤란, 흉통, 천명, 객혈이 동반되는가?",
      "야간 악화, 운동 시 악화, 찬 공기 노출과의 관련이 있는가?",
      "흡연력, ACE inhibitor 복용, 천식/알레르기 병력이 있는가?"
    ],
    diagnoses: [
      "급성 상기도감염: 기침과 인후통, 콧물, 미열이 동반될 때 흔함",
      "급성 기관지염: 며칠 이상 지속되는 기침과 가래, 청진상 국소 폐렴 소견이 뚜렷하지 않을 때 고려",
      "기침형 천식: 야간 악화, 반복성 기침, 천명 또는 알레르기 병력이 있으면 의심",
      "폐렴: 발열, 호흡곤란, 국소 수포음, 흉부 X-ray 이상이 있으면 우선 고려",
      "위식도역류 또는 후비루 증후군: 누우면 심해지거나 만성 기침일 때 감별"
    ],
    tests: [
      "활력징후와 산소포화도: 중증도 평가",
      "흉부 X-ray: 폐렴, 폐부종, 기타 폐질환 감별",
      "COVID-19/인플루엔자 검사: 유행기 호흡기 감염 감별",
      "CBC, CRP: 염증 정도 평가가 필요할 때",
      "폐기능검사 또는 기관지확장제 반응 평가: 천식 의심 시"
    ],
    leading: {
      diagnosis: "급성 상기도감염 또는 급성 기관지염",
      rationale: "외래에서 가장 흔하며, 기침 중심 증상에 전신 중증 소견이 없을 때 우선 고려됩니다.",
      medication: [
        "대증치료 중심으로 진해거담제, 해열진통제, 필요 시 항히스타민제 등을 고려",
        "세균성 폐렴, 세균성 부비동염 등 근거가 뚜렷하지 않다면 항생제는 신중히 판단",
        "천식 의심 소견이 있으면 흡입 기관지확장제 또는 흡입 스테로이드 필요 여부 평가"
      ],
      lifestyle: [
        "수분 섭취, 충분한 휴식, 금연",
        "실내 공기 자극물 회피",
        "야간 기침이 심하면 수면 자세 조정"
      ],
      cautions: [
        "호흡곤란, 산소포화도 저하, 흉통, 객혈, 고열 지속 시 즉시 재평가",
        "고령, 면역저하, 기저 폐질환이 있으면 폐렴 가능성을 더 적극적으로 확인"
      ]
    }
  },
  soreThroat: {
    keywords: ["인후통", "목아픔", "목통증", "편도"],
    title: "인후통",
    questions: [
      "증상 시작 시점과 진행 양상은 어떤가?",
      "발열, 기침, 콧물, 쉰목소리, 삼킴 곤란이 동반되는가?",
      "편도 삼출물, 구취, 경부 림프절 통증이 있는가?",
      "입을 벌리기 어렵거나 침을 삼키기 힘든가?",
      "노출력, 최근 감염자 접촉, 반복 편도염 병력이 있는가?"
    ],
    diagnoses: [
      "바이러스성 인두염: 기침, 콧물, 쉰목소리 동반 시 흔함",
      "연쇄상구균 인두염: 고열, 편도 삼출물, 압통성 경부 림프절, 기침 부재 시 의심",
      "편도주위농양: 심한 일측 통증, 개구장애, 침흘림, muffled voice 있으면 고려",
      "감염성 단핵구증: 심한 인후통과 림프절 종대, 피로감 동반 시 감별"
    ],
    tests: [
      "구인두 진찰: 편도 비대, 삼출물, 편위 확인",
      "Strep 신속항원검사 또는 throat culture: 세균성 인두염 확인",
      "CBC: 비정형 림프구 증가 등 감염 양상 확인",
      "농양 의심 시 ENT 평가 또는 영상검사"
    ],
    leading: {
      diagnosis: "바이러스성 인두염",
      rationale: "외래 인후통의 가장 흔한 원인이며 기침, 콧물 등 동반 시 가능성이 높습니다.",
      medication: [
        "아세트아미노펜 또는 NSAID 계열 해열진통제 고려",
        "국소 진통제 또는 가글 보조 사용 가능",
        "세균성 근거가 부족하면 항생제는 바로 시작하지 않음"
      ],
      lifestyle: [
        "충분한 수분 섭취와 휴식",
        "자극적인 음식, 흡연, 음주 회피",
        "가습 또는 따뜻한 물 섭취"
      ],
      cautions: [
        "호흡곤란, 침도 못 삼키는 경우, 개구장애, 편측 심한 통증은 농양 감별 필요",
        "고열 지속 시 세균 감염 여부 재평가"
      ]
    }
  },
  abdominalPain: {
    keywords: ["복통", "배아픔", "상복부통증", "하복부통증"],
    title: "복통",
    questions: [
      "통증 위치는 어디이며 이동하는가?",
      "갑작스러운 통증인지, 점진적인지, 지속성인지 산통성인지?",
      "식사와의 관련, 구역/구토, 설사, 변비, 혈변, 흑변이 있는가?",
      "배뇨통, 혈뇨, 생리/임신 가능성 등 비뇨기/부인과 증상이 있는가?",
      "발열, 반발통, 식은땀, 실신 느낌이 있는가?"
    ],
    diagnoses: [
      "급성 위장염: 복통과 설사/구토 동반 시 흔함",
      "위염 또는 소화성 궤양질환: 상복부 통증, 식후 악화/공복통에서 고려",
      "충수염: 우하복부 압통, 식욕저하, 발열 시 의심",
      "담낭염 또는 담석증: 우상복부 통증과 식후 악화, 오심 시 감별",
      "요로결석 또는 요로감염: 측복통, 배뇨 증상 동반 시 감별"
    ],
    tests: [
      "복부 진찰과 활력징후: 응급도 평가",
      "CBC, CRP, 전해질: 염증과 탈수 평가",
      "간기능, amylase/lipase: 간담췌 원인 감별",
      "요검사: UTI/결석 감별",
      "복부 초음파 또는 CT: 국소 복막 자극 소견이나 담낭/충수염 의심 시",
      "가임기 여성에서는 임신반응검사"
    ],
    leading: {
      diagnosis: "급성 위장염 또는 비특이적 복통",
      rationale: "외래에서 흔하며 설사나 구역 등 위장관 증상이 동반되면 우선 고려됩니다. 다만 국소 압통이 뚜렷하면 다른 원인 감별이 우선입니다.",
      medication: [
        "수분 보충과 함께 필요 시 해열진통제, 진경제, 항구토제 고려",
        "감염성 설사가 의심될 때 항생제는 원인과 중증도에 따라 선택",
        "상복부 통증 우세 시 PPI 또는 제산제 고려 가능"
      ],
      lifestyle: [
        "탈수 방지를 위한 수분과 전해질 보충",
        "증상 초기에는 자극적인 음식, 기름진 음식 피하기",
        "소량씩 자주 섭취"
      ],
      cautions: [
        "반발통, 지속적 심한 통증, 혈변, 흑변, 고열, 저혈압은 즉시 추가 평가",
        "고령자와 임산부는 경미해 보여도 더 보수적으로 평가"
      ]
    }
  },
  headache: {
    keywords: ["두통", "머리아픔", "편두통"],
    title: "두통",
    questions: [
      "처음 겪는 두통인지, 기존 두통과 양상이 다른가?",
      "갑작스럽게 시작한 thunderclap headache인가?",
      "발열, 경부강직, 신경학적 증상, 시야장애가 있는가?",
      "오심, 광과민, 편측 박동성 통증이 있는가?",
      "외상, 항응고제 복용, 고혈압 위기 가능성이 있는가?"
    ],
    diagnoses: [
      "긴장형 두통: 압박감, 양측성, 경도-중등도 통증이 흔함",
      "편두통: 박동성, 편측성, 오심/광과민 동반 시 의심",
      "부비동염 관련 두통: 비증상과 안면 통증이 동반될 때 감별",
      "고혈압성 두통 또는 이차성 두통: 활력징후 이상이나 신경학적 이상 시 고려",
      "뇌출혈/수막염 등 응급 원인: 갑작스러운 최악의 두통, 신경학적 증상, 발열 시 감별"
    ],
    tests: [
      "신경학적 진찰과 활력징후",
      "필요 시 뇌 CT/MRI: red flag 두통에서 우선",
      "감염 의심 시 CBC, CRP, 필요 시 뇌척수액 평가",
      "안저검사 또는 안과 평가: 시야 변화나 안압 상승 의심 시"
    ],
    leading: {
      diagnosis: "긴장형 두통 또는 편두통",
      rationale: "외래에서 가장 흔한 원인입니다. 다만 red flag가 있으면 이차성 두통을 먼저 배제해야 합니다.",
      medication: [
        "긴장형 두통은 아세트아미노펜 또는 NSAID 고려",
        "편두통은 필요 시 triptan 계열 적응증 평가",
        "과사용 두통을 피하기 위해 진통제 빈도 점검"
      ],
      lifestyle: [
        "수면, 수분, 식사 리듬 유지",
        "스트레스 관리와 카페인 과다 섭취 조절",
        "두통 유발 요인 기록"
      ],
      cautions: [
        "갑작스러운 최악의 두통, 편측 마비, 의식 변화, 발열/경부강직은 응급 평가",
        "새로운 50세 이상 발병 두통은 이차성 원인 감별 필요"
      ]
    }
  },
  dizziness: {
    keywords: ["어지럼", "현훈", "빙빙"],
    title: "어지럼증",
    questions: [
      "빙글빙글 도는 현훈인지, 실신 전 느낌인지, 균형 불안인지?",
      "자세 변화와 관련되는가?",
      "청력 저하, 이명, 귀 먹먹함이 있는가?",
      "복시, 마비, 구음장애, 보행장애 등 신경학적 증상이 있는가?",
      "탈수, 빈혈, 혈당 이상, 부정맥 가능성이 있는가?"
    ],
    diagnoses: [
      "양성 돌발성 체위성 현훈(BPPV): 자세 변화 시 짧은 현훈",
      "전정신경염: 지속적 현훈과 구역, 바이러스 감염 후 발생 가능",
      "메니에르병: 현훈과 청력저하, 이명 동반",
      "기립성 저혈압: 자세 변화 시 아찔함",
      "중추성 어지럼증: 신경학적 증상 동반 시 우선 감별"
    ],
    tests: [
      "활력징후와 기립성 혈압 측정",
      "신경학적 진찰 및 안진 평가",
      "Dix-Hallpike test: BPPV 의심 시",
      "CBC, 전해질, 혈당: 전신 원인 감별",
      "중추 원인 의심 시 뇌 영상검사"
    ],
    leading: {
      diagnosis: "양성 돌발성 체위성 현훈",
      rationale: "짧고 반복적인 자세 연관 현훈이라면 외래에서 가장 흔한 원인입니다.",
      medication: [
        "필요 시 단기간 진토제/전정억제제 고려",
        "원인 교정이 우선이며 장기적인 전정억제제 사용은 신중"
      ],
      lifestyle: [
        "급성기에는 낙상 주의",
        "체위 변화 천천히 하기",
        "BPPV면 reposition maneuver 교육"
      ],
      cautions: [
        "지속적 신경학적 이상, 새 보행장애, 심한 두통 동반 시 중추성 원인 배제 필요"
      ]
    }
  },
  chestPain: {
    keywords: ["흉통", "가슴통증", "가슴아픔"],
    title: "흉통",
    questions: [
      "통증 위치, 압박감/찌르는 느낌, 방사통 유무는?",
      "운동 시 악화되는지, 호흡이나 체위에 따라 달라지는지?",
      "호흡곤란, 식은땀, 오심, 실신이 동반되는가?",
      "심혈관 위험인자와 과거 심장질환 병력이 있는가?",
      "외상, 위식도역류, 대상포진 전구 증상은 없는가?"
    ],
    diagnoses: [
      "급성관상동맥증후군: 흉부 압박감과 방사통, 위험인자 동반 시 우선 감별",
      "근골격성 흉통: 압통 재현 가능, 움직임과 관련",
      "위식도역류질환: 식후 악화, 작열감 동반",
      "늑막염/폐렴/폐색전증: 호흡성 흉통과 호흡기 증상 동반 시 감별"
    ],
    tests: [
      "심전도: 즉시",
      "활력징후, 산소포화도",
      "심근효소 검사: ACS 의심 시",
      "흉부 X-ray",
      "필요 시 D-dimer, CT angiography 등"
    ],
    leading: {
      diagnosis: "원인 미분류 흉통에서는 심혈관 원인 우선 배제",
      rationale: "흉통은 중증 질환 가능성을 먼저 배제해야 하므로 흔한 양성 원인보다 심장/폐 응급 원인을 먼저 고려해야 합니다.",
      medication: [
        "구체적 약물은 원인 확정 후 결정",
        "허혈성 흉통 의심 시 응급 프로토콜 우선"
      ],
      lifestyle: [
        "자가운전보다 보호자 동행 또는 응급실 의뢰 권장",
        "안정 유지"
      ],
      cautions: [
        "지속 흉통, 호흡곤란, 식은땀, 실신, 방사통은 즉시 응급 평가"
      ]
    }
  }
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
  suspectedDiagnosis: "의심되는 진단",
  physicalExam: "진찰 소견",
  testsDone: "시행한 검사와 결과",
  additionalNotes: "추가 메모"
};

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
  suspectedDiagnosis: "급성 기관지염",
  physicalExam: "인후 발적, 청진상 수포음 및 wheezing 없음",
  testsDone: "코로나 자가검사 음성",
  additionalNotes: "흡연력 없음"
};

function getValue(formData, fieldName) {
  const value = formData.get(fieldName);
  if (typeof value !== "string") {
    return "(미입력)";
  }

  const trimmed = value.trim();
  return trimmed === "" ? "(미입력)" : trimmed;
}

function detectSymptom(chiefComplaint) {
  const normalized = chiefComplaint.replace(/\s+/g, "").toLowerCase();

  for (const item of Object.values(symptomLibrary)) {
    if (item.keywords.some((keyword) => normalized.includes(keyword.replace(/\s+/g, "").toLowerCase()))) {
      return item;
    }
  }

  return null;
}

function toHtmlList(items) {
  return `<ul class="result-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function buildFallback(data) {
  return `
    <section class="result-block">
      <h3>주증상 자동 분류 안내</h3>
      <p>입력된 주증상: <strong>${escapeHtml(data.chiefComplaint)}</strong></p>
      <p style="margin-top:10px;">현재는 흔한 외래 증상 중심으로 구조화된 출력이 제공됩니다. 아래 일반 감별 프레임을 참고해 주세요.</p>
    </section>
    <section class="result-block">
      <h3>1. 추가 질문</h3>
      ${toHtmlList([
        "증상 시작 시점과 진행 속도는 어떤가?",
        "통증 또는 불편감의 위치와 양상은 무엇인가?",
        "동반 증상(발열, 호흡곤란, 구토, 설사, 배뇨증상, 신경학적 증상 등)이 있는가?",
        "악화 및 완화 요인은 무엇인가?",
        "과거 유사 증상, 기저질환, 복용약, 알레르기, 최근 노출력이 있는가?"
      ])}
    </section>
    <section class="result-block">
      <h3>2. 의심되는 진단</h3>
      ${toHtmlList([
        "비특이적 또는 기능성 원인",
        "감염성 원인",
        "염증성 원인",
        "약물 또는 기저질환 관련 원인",
        "응급 감별이 필요한 중증 질환"
      ])}
    </section>
    <section class="result-block">
      <h3>3. 추가 검사</h3>
      ${toHtmlList([
        "활력징후 재확인",
        "신체진찰",
        "기본 혈액검사(CBC, CRP, 전해질 등)",
        "증상 장기에 맞는 영상검사 또는 특이 검사"
      ])}
    </section>
    <section class="result-block">
      <h3>4. 가장 의심되는 진단에 대한 정리</h3>
      <div class="diagnosis-stack">
        <div class="diagnosis-pane">
          <h4>진단명</h4>
          <p>현재 정보만으로는 특정 진단을 1순위로 확정하기 어렵습니다.</p>
        </div>
        <div class="diagnosis-pane">
          <h4>약물처방</h4>
          <p>추가 문진과 진찰 후 대증치료 필요 여부를 판단합니다.</p>
        </div>
        <div class="diagnosis-pane">
          <h4>대증치료 및 생활요법</h4>
          <p>수분, 휴식, 자극 회피 등 일반 원칙을 우선 적용합니다.</p>
        </div>
        <div class="diagnosis-pane">
          <h4>주의사항</h4>
          <p>Red flag가 있으면 즉시 상급 평가가 필요합니다.</p>
        </div>
      </div>
    </section>
  `;
}

function buildOutput(data) {
  const matched = detectSymptom(data.chiefComplaint);
  if (!matched) {
    return buildFallback(data);
  }

  return `
    <section class="result-block">
      <span class="section-label">주증상 분류</span>
      <h3>${matched.title}</h3>
      ${toHtmlList([
        `${fieldLabels.ageSex}: ${escapeHtml(data.ageSex)}`,
        `${fieldLabels.chiefComplaint}: ${escapeHtml(data.chiefComplaint)}`,
        `${fieldLabels.onsetDuration}: ${escapeHtml(data.onsetDuration)}`,
        `${fieldLabels.character}: ${escapeHtml(data.character)}`,
        `${fieldLabels.associatedSymptoms}: ${escapeHtml(data.associatedSymptoms)}`,
        `${fieldLabels.aggravatingRelieving}: ${escapeHtml(data.aggravatingRelieving)}`,
        `${fieldLabels.pastHistory}: ${escapeHtml(data.pastHistory)}`,
        `${fieldLabels.medications}: ${escapeHtml(data.medications)}`,
        `${fieldLabels.allergies}: ${escapeHtml(data.allergies)}`,
        `${fieldLabels.vitals}: ${escapeHtml(data.vitals)}`,
        `${fieldLabels.suspectedDiagnosis}: ${escapeHtml(data.suspectedDiagnosis)}`,
        `${fieldLabels.physicalExam}: ${escapeHtml(data.physicalExam)}`,
        `${fieldLabels.testsDone}: ${escapeHtml(data.testsDone)}`,
        `${fieldLabels.additionalNotes}: ${escapeHtml(data.additionalNotes)}`
      ])}
    </section>
    <section class="result-block">
      <h3>1. 감별진단을 위해 추가적으로 물어봐야 할 질문</h3>
      ${toHtmlList(matched.questions)}
    </section>
    <section class="result-block">
      <h3>2. 의심되는 진단</h3>
      ${toHtmlList(matched.diagnoses)}
    </section>
    <section class="result-block">
      <h3>3. 정확한 진단을 위해 추가적으로 필요한 검사</h3>
      ${toHtmlList(matched.tests)}
    </section>
    <section class="result-block">
      <h3>4. 가장 의심되는 진단에 대한 정리</h3>
      <div class="diagnosis-stack">
        <div class="diagnosis-pane">
          <h4>진단명</h4>
          <p>${data.suspectedDiagnosis !== "(미입력)" ? escapeHtml(data.suspectedDiagnosis) : matched.leading.diagnosis}</p>
          <p style="margin-top:8px;">${matched.leading.rationale}</p>
        </div>
        <div class="diagnosis-pane">
          <h4>약물처방</h4>
          ${toHtmlList(matched.leading.medication)}
        </div>
        <div class="diagnosis-pane">
          <h4>대증치료 및 생활요법</h4>
          ${toHtmlList(matched.leading.lifestyle)}
        </div>
        <div class="diagnosis-pane">
          <h4>주의사항</h4>
          ${toHtmlList(matched.leading.cautions)}
        </div>
      </div>
    </section>
    <section class="patient-sheet">
      <div class="patient-card">
        <span class="section-label">환자용 안내문</span>
        <div class="patient-item" data-patient-item="intro">
          <div class="patient-select-row">
            <input class="patient-check" type="checkbox" checked data-target="intro">
            <h4>진료 안내</h4>
          </div>
          <p>현재 가장 우선적으로 고려하는 상태는 <strong>${data.suspectedDiagnosis !== "(미입력)" ? escapeHtml(data.suspectedDiagnosis) : matched.leading.diagnosis}</strong>입니다.</p>
        </div>
        <hr class="patient-divider">
        <div class="patient-item" data-patient-item="medication">
          <div class="patient-select-row">
            <input class="patient-check" type="checkbox" checked data-target="medication">
            <h4>복약 및 치료</h4>
          </div>
          ${toHtmlList(matched.leading.medication)}
        </div>
        <div class="patient-item" data-patient-item="lifestyle">
          <div class="patient-select-row">
            <input class="patient-check" type="checkbox" checked data-target="lifestyle">
            <h4>생활요법</h4>
          </div>
          ${toHtmlList(matched.leading.lifestyle)}
        </div>
        <div class="patient-item" data-patient-item="cautions">
          <div class="patient-select-row">
            <input class="patient-check" type="checkbox" checked data-target="cautions">
            <h4>주의사항</h4>
          </div>
          ${toHtmlList(matched.leading.cautions)}
        </div>
        <hr class="patient-divider">
        <div class="patient-item" data-patient-item="footer">
          <p>이 안내문은 진료실 설명을 돕기 위한 요약본이며, 실제 처방과 의사 지시를 우선해 주세요.</p>
        </div>
      </div>
    </section>
  `;
}

function syncOutput() {
  const formData = new FormData(form);
  const data = {};

  Object.keys(fieldLabels).forEach((key) => {
    data[key] = getValue(formData, key);
  });

  output.classList.remove("empty-state");
  output.innerHTML = buildOutput(data);
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
    output.classList.add("empty-state");
    output.textContent = "아직 생성된 내용이 없습니다. 왼쪽에 환자 정보를 입력해 주세요.";
  }, 0);
});

copyButton.addEventListener("click", async () => {
  const text = output.innerText;
  if (!text || text.startsWith("아직 생성된 내용이 없습니다")) {
    window.alert("먼저 환자 정보를 입력하고 결과를 생성해 주세요.");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    copyButton.textContent = "복사 완료";
    window.setTimeout(() => {
      copyButton.textContent = "결과 복사";
    }, 1600);
  } catch (error) {
    window.alert("복사에 실패했습니다. 직접 선택해서 복사해 주세요.");
  }
});

fillSampleButton.addEventListener("click", () => {
  fillForm(sampleData);
});

output.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || !target.classList.contains("patient-check")) {
    return;
  }

  const key = target.dataset.target;
  const section = output.querySelector(`[data-patient-item="${key}"]`);
  if (!section) {
    return;
  }

  section.classList.toggle("is-hidden", !target.checked);
});

printButton.addEventListener("click", () => {
  if (output.classList.contains("empty-state")) {
    window.alert("먼저 환자 정보를 입력하고 결과를 생성해 주세요.");
    return;
  }
  window.print();
});

const saved = localStorage.getItem("josungwon-prescription-form");
if (saved) {
  try {
    fillForm(JSON.parse(saved));
  } catch (error) {
    localStorage.removeItem("josungwon-prescription-form");
  }
}
