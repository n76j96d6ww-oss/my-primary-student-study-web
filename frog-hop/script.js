const UNIT_GROUPS = {
  length: {
    title: "長度單位",
    hint: "相鄰兩片荷葉的進率是 10；往小單位跳就乘，往大單位跳就除。",
    units: [
      { key: "mm", label: "mm", name: "毫米", factor: 1 },
      { key: "cm", label: "cm", name: "厘米", factor: 10 },
      { key: "dm", label: "dm", name: "分米", factor: 100 },
      { key: "m", label: "m", name: "米", factor: 1000 },
      { key: "dam", label: "dam", name: "十米", factor: 10000 },
      { key: "hm", label: "hm", name: "百米", factor: 100000 },
      { key: "km", label: "km", name: "公里", factor: 1000000 }
    ]
  },
  area: {
    title: "面積單位",
    hint: "面積每跳一格通常是 100 倍，因為長和寬都一起變。",
    units: [
      { key: "mm2", label: "mm²", name: "平方毫米", factor: 1 },
      { key: "cm2", label: "cm²", name: "平方厘米", factor: 100 },
      { key: "dm2", label: "dm²", name: "平方分米", factor: 10000 },
      { key: "m2", label: "m²", name: "平方米", factor: 1000000 },
      { key: "dam2", label: "dam²", name: "公畝", factor: 100000000 },
      { key: "hm2", label: "hm²", name: "公頃", factor: 10000000000 },
      { key: "km2", label: "km²", name: "平方公里", factor: 1000000000000 }
    ]
  },
  capacity: {
    title: "容量單位",
    hint: "容量的 mL、cL、dL、L、kL 依序每格相差 10 倍。",
    units: [
      { key: "ml", label: "mL", name: "毫升", factor: 1 },
      { key: "cl", label: "cL", name: "厘升", factor: 10 },
      { key: "dl", label: "dL", name: "分升", factor: 100 },
      { key: "l", label: "L", name: "升", factor: 1000 },
      { key: "dal", label: "daL", name: "十升", factor: 10000 },
      { key: "hl", label: "hL", name: "百升", factor: 100000 },
      { key: "kl", label: "kL", name: "千升", factor: 1000000 }
    ]
  },
  mass: {
    title: "質量單位",
    hint: "mg 到 kg 每格 10 倍；kg 跳到 t 是 1000 倍。",
    units: [
      { key: "mg", label: "mg", name: "毫克", factor: 1 },
      { key: "cg", label: "cg", name: "厘克", factor: 10 },
      { key: "dg", label: "dg", name: "分克", factor: 100 },
      { key: "g", label: "g", name: "克", factor: 1000 },
      { key: "dag", label: "dag", name: "十克", factor: 10000 },
      { key: "hg", label: "hg", name: "百克", factor: 100000 },
      { key: "kg", label: "kg", name: "千克", factor: 1000000 },
      { key: "t", label: "t", name: "噸", factor: 1000000000 }
    ]
  },
  volume: {
    title: "體積單位",
    hint: "體積每跳一格通常是 1000 倍，因為長、寬、高都一起變。",
    units: [
      { key: "mm3", label: "mm³", name: "立方毫米", factor: 1 },
      { key: "cm3", label: "cm³", name: "立方厘米", factor: 1000 },
      { key: "dm3", label: "dm³", name: "立方分米", factor: 1000000 },
      { key: "m3", label: "m³", name: "立方米", factor: 1000000000 }
    ]
  }
};

const categorySelect = document.querySelector("#categorySelect");
const valueInput = document.querySelector("#valueInput");
const fromUnit = document.querySelector("#fromUnit");
const toUnit = document.querySelector("#toUnit");
const swapButton = document.querySelector("#swapButton");
const convertButton = document.querySelector("#convertButton");
const categoryTitle = document.querySelector("#categoryTitle");
const categoryHint = document.querySelector("#categoryHint");
const directionPill = document.querySelector("#directionPill");
const pond = document.querySelector("#pond");
const resultText = document.querySelector("#resultText");
const explainButton = document.querySelector("#explainButton");
const stepsList = document.querySelector("#stepsList");
const newQuestionButton = document.querySelector("#newQuestionButton");
const questionText = document.querySelector("#questionText");
const answerInput = document.querySelector("#answerInput");
const answerUnit = document.querySelector("#answerUnit");
const checkButton = document.querySelector("#checkButton");
const feedbackText = document.querySelector("#feedbackText");
const scoreText = document.querySelector("#scoreText");

let currentQuestion = null;
const score = { correct: 0, total: 0 };

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "數字太大";
  }

  if (Math.abs(value) >= 1000000000 || (Math.abs(value) > 0 && Math.abs(value) < 0.000001)) {
    return value.toExponential(6).replace(/\.?0+e/, "e");
  }

  return Number(value.toFixed(8)).toLocaleString("en-US", {
    maximumFractionDigits: 8
  });
}

function getGroup() {
  return UNIT_GROUPS[categorySelect.value];
}

function findUnit(units, key) {
  return units.find((unit) => unit.key === key);
}

function unitIndex(units, key) {
  return units.findIndex((unit) => unit.key === key);
}

function convert(value, from, to) {
  return value * (from.factor / to.factor);
}

function fillCategoryOptions() {
  categorySelect.innerHTML = Object.entries(UNIT_GROUPS)
    .map(([key, group]) => `<option value="${key}">${group.title}</option>`)
    .join("");
}

function fillUnitOptions() {
  const group = getGroup();
  const unitOptions = group.units
    .map((unit) => `<option value="${unit.key}">${unit.label} - ${unit.name}</option>`)
    .join("");

  fromUnit.innerHTML = unitOptions;
  toUnit.innerHTML = unitOptions;

  const startIndex = Math.min(3, group.units.length - 1);
  const endIndex = Math.max(0, startIndex - 2);
  fromUnit.value = group.units[startIndex].key;
  toUnit.value = group.units[endIndex].key;
}

function describeDirection(fromIndex, toIndex) {
  if (fromIndex === toIndex) {
    return "原地不動，單位沒有改變。";
  }

  return fromIndex > toIndex
    ? "往左跳到更小的單位：每一步都要乘以進率。"
    : "往右跳到更大的單位：每一步都要除以進率。";
}

function getPathIndexes(fromIndex, toIndex) {
  const step = fromIndex <= toIndex ? 1 : -1;
  const path = [];

  for (let index = fromIndex; step > 0 ? index <= toIndex : index >= toIndex; index += step) {
    path.push(index);
  }

  return path;
}

function renderPond() {
  const group = getGroup();
  const fromIndex = unitIndex(group.units, fromUnit.value);
  const toIndex = unitIndex(group.units, toUnit.value);
  const path = new Set(getPathIndexes(fromIndex, toIndex));

  pond.style.setProperty("--unit-count", group.units.length);
  pond.innerHTML = group.units
    .map((unit, index) => {
      const classes = ["pad"];
      if (index === fromIndex) classes.push("start");
      if (index === toIndex) classes.push("end");
      if (path.has(index)) classes.push("path");

      return `
        <div class="${classes.join(" ")}" aria-label="${unit.name}">
          ${index === fromIndex ? '<span class="frog" aria-hidden="true">🐸</span>' : ""}
          <span class="unit-name">${unit.label}</span>
          <small>${unit.name}</small>
        </div>
      `;
    })
    .join("");
}

function buildSteps(value, fromIndex, toIndex) {
  const group = getGroup();
  const units = group.units;
  const steps = [];
  let runningValue = value;

  if (fromIndex === toIndex) {
    return [`${formatNumber(value)} ${units[fromIndex].label} 已經是目標單位，不需要跳。`];
  }

  const direction = fromIndex > toIndex ? -1 : 1;
  for (let index = fromIndex; index !== toIndex; index += direction) {
    const nextIndex = index + direction;
    const current = units[index];
    const next = units[nextIndex];
    const rate = direction < 0
      ? current.factor / next.factor
      : next.factor / current.factor;
    const operation = direction < 0 ? "×" : "÷";

    runningValue = direction < 0 ? runningValue * rate : runningValue / rate;
    steps.push(
      `${current.label} → ${next.label}：${operation} ${formatNumber(rate)}，得到 ${formatNumber(runningValue)} ${next.label}`
    );
  }

  return steps;
}

function updateConversion() {
  const group = getGroup();
  const units = group.units;
  const value = Number(valueInput.value);
  const from = findUnit(units, fromUnit.value);
  const to = findUnit(units, toUnit.value);
  const fromIndex = unitIndex(units, from.key);
  const toIndex = unitIndex(units, to.key);

  categoryTitle.textContent = group.title;
  categoryHint.textContent = group.hint;
  directionPill.textContent = describeDirection(fromIndex, toIndex);
  renderPond();

  if (!Number.isFinite(value)) {
    resultText.textContent = "請先輸入一個數字";
    stepsList.innerHTML = "";
    return;
  }

  const answer = convert(value, from, to);
  resultText.textContent = `${formatNumber(value)} ${from.label} = ${formatNumber(answer)} ${to.label}`;
  stepsList.innerHTML = buildSteps(value, fromIndex, toIndex)
    .map((step) => `<li>${step}</li>`)
    .join("");
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function makeQuestion() {
  const groupKey = pickRandom(Object.keys(UNIT_GROUPS));
  const group = UNIT_GROUPS[groupKey];
  const fromIndex = Math.floor(Math.random() * group.units.length);
  let toIndex = Math.floor(Math.random() * group.units.length);

  while (toIndex === fromIndex) {
    toIndex = Math.floor(Math.random() * group.units.length);
  }

  const values = [0.25, 0.5, 1.2, 2, 3.5, 4, 6, 7.5, 8, 12, 15, 20, 25, 40, 60, 75, 100];
  const value = pickRandom(values);
  const from = group.units[fromIndex];
  const to = group.units[toIndex];
  const answer = convert(value, from, to);

  currentQuestion = { groupKey, value, from, to, answer };
  questionText.textContent = `${formatNumber(value)} ${from.label} = ? ${to.label}`;
  answerUnit.textContent = to.label;
  answerInput.value = "";
  feedbackText.textContent = "";
  feedbackText.className = "feedback";

  categorySelect.value = groupKey;
  fillUnitOptions();
  valueInput.value = value;
  fromUnit.value = from.key;
  toUnit.value = to.key;
  updateConversion();
  answerInput.focus();
}

function updateScore() {
  scoreText.textContent = `${score.correct} / ${score.total}`;
}

function checkAnswer() {
  if (!currentQuestion) {
    makeQuestion();
    return;
  }

  const userAnswer = Number(answerInput.value);
  if (!Number.isFinite(userAnswer)) {
    feedbackText.textContent = "先輸入答案，再請青蛙幫你檢查喔。";
    feedbackText.className = "feedback error";
    return;
  }

  score.total += 1;
  const tolerance = Math.max(0.0001, Math.abs(currentQuestion.answer) * 0.0001);
  const isCorrect = Math.abs(userAnswer - currentQuestion.answer) <= tolerance;

  if (isCorrect) {
    score.correct += 1;
    feedbackText.textContent = `答對了！青蛙跳到 ${formatNumber(currentQuestion.answer)} ${currentQuestion.to.label}。`;
    feedbackText.className = "feedback ok";
  } else {
    feedbackText.textContent = `再試一次：正確答案是 ${formatNumber(currentQuestion.answer)} ${currentQuestion.to.label}。`;
    feedbackText.className = "feedback error";
  }

  updateScore();
}

categorySelect.addEventListener("change", () => {
  fillUnitOptions();
  updateConversion();
});

[valueInput, fromUnit, toUnit].forEach((element) => {
  element.addEventListener("input", updateConversion);
  element.addEventListener("change", updateConversion);
});

swapButton.addEventListener("click", () => {
  const oldFrom = fromUnit.value;
  fromUnit.value = toUnit.value;
  toUnit.value = oldFrom;
  updateConversion();
});

convertButton.addEventListener("click", updateConversion);

explainButton.addEventListener("click", () => {
  stepsList.classList.toggle("show");
  explainButton.textContent = stepsList.classList.contains("show") ? "收起步驟" : "看步驟";
});

newQuestionButton.addEventListener("click", makeQuestion);
checkButton.addEventListener("click", checkAnswer);

answerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    checkAnswer();
  }
});

fillCategoryOptions();
fillUnitOptions();
updateConversion();
updateScore();
