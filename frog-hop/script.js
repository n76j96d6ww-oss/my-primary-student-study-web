const routes = [
  {
    id: "length-imperial-cm",
    type: "Length 長度",
    title: "英制與厘米長度",
    description: "碼 yard → 呎 foot → 吋 inch → 厘米 centimeter",
    hint: "英制長度一路跳到厘米：往右乘，往左除。",
    defaultFrom: "ft",
    defaultTo: "cm",
    defaultAmount: 3,
    units: [
      { key: "yd", zh: "碼", en: "yard", abbr: "yd" },
      { key: "ft", zh: "呎", en: "foot", abbr: "ft" },
      { key: "in", zh: "吋", en: "inch", abbr: "in" },
      { key: "cm", zh: "厘米", en: "centimeter", abbr: "cm" }
    ],
    factors: [
      { value: 3, label: "×3" },
      { value: 12, label: "×12" },
      { value: 2.54, label: "×2.54" }
    ]
  },
  {
    id: "length-chinese-cm",
    type: "Length 長度",
    title: "尺、寸與厘米",
    description: "尺 Chinese foot → 寸 Chinese inch → 厘米 centimeter",
    hint: "傳統尺、寸和厘米互換，適合建立尺寸概念。",
    defaultFrom: "chi",
    defaultTo: "cm",
    defaultAmount: 2,
    units: [
      { key: "chi", zh: "尺", en: "Chinese foot", abbr: "chi" },
      { key: "cun", zh: "寸", en: "Chinese inch", abbr: "cun" },
      { key: "cm", zh: "厘米", en: "centimeter", abbr: "cm" }
    ],
    factors: [
      { value: 10, label: "×10" },
      { value: 10 / 3, label: "×3.333..." }
    ]
  },
  {
    id: "weight-imperial",
    type: "Weight 重量",
    title: "磅與安士",
    description: "磅 pound → 安士 ounce",
    hint: "1 磅 pound 裡有 16 安士 ounce。",
    defaultFrom: "lb",
    defaultTo: "oz",
    defaultAmount: 2,
    units: [
      { key: "lb", zh: "磅", en: "pound", abbr: "lb" },
      { key: "oz", zh: "安士", en: "ounce", abbr: "oz" }
    ],
    factors: [
      { value: 16, label: "×16" }
    ]
  },
  {
    id: "weight-chinese",
    type: "Weight 重量",
    title: "斤與兩",
    description: "斤 catty → 兩 tael",
    hint: "本頁採用常見教材設定：1 斤 catty = 16 兩 tael。",
    defaultFrom: "jin",
    defaultTo: "tael",
    defaultAmount: 3,
    units: [
      { key: "jin", zh: "斤", en: "catty", abbr: "jin" },
      { key: "tael", zh: "兩", en: "tael", abbr: "leung" }
    ],
    factors: [
      { value: 16, label: "×16" }
    ]
  }
];

const routeButtons = document.querySelector("#routeButtons");
const activeRouteType = document.querySelector("#activeRouteType");
const activeRouteTitle = document.querySelector("#activeRouteTitle");
const routeHint = document.querySelector("#routeHint");
const leafTrack = document.querySelector("#leafTrack");
const converterForm = document.querySelector("#converterForm");
const amountInput = document.querySelector("#amountInput");
const fromUnit = document.querySelector("#fromUnit");
const toUnit = document.querySelector("#toUnit");
const answerTitle = document.querySelector("#answerTitle");
const directionText = document.querySelector("#directionText");
const stepsList = document.querySelector("#stepsList");
const frog = document.querySelector("#frog");
const practiceForm = document.querySelector("#practiceForm");
const practiceAnswer = document.querySelector("#practiceAnswer");
const challengeQuestion = document.querySelector("#challengeQuestion");
const practiceFeedback = document.querySelector("#practiceFeedback");
const newChallenge = document.querySelector("#newChallenge");

let activeRoute = routes[0];
let currentChallenge = null;

function unitLabel(unit) {
  return `${unit.zh} ${unit.en} (${unit.abbr})`;
}

function optionLabel(unit) {
  return `${unit.zh} / ${unit.en} / ${unit.abbr}`;
}

function findUnit(route, key) {
  return route.units.find((unit) => unit.key === key);
}

function unitIndex(route, key) {
  return route.units.findIndex((unit) => unit.key === key);
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "";
  }

  if (Math.abs(value - Math.round(value)) < 0.000001) {
    return String(Math.round(value));
  }

  return Number(value.toFixed(4)).toString();
}

function getOperationLabel(factor, isForward) {
  if (isForward) {
    return factor.label;
  }

  return factor.label.replace("×", "÷");
}

function calculateConversion(route, amount, fromKey, toKey) {
  const fromIndex = unitIndex(route, fromKey);
  const toIndex = unitIndex(route, toKey);
  const steps = [];
  let value = amount;

  if (fromIndex === toIndex) {
    return {
      value,
      steps: [`不用跳，單位相同，所以答案仍是 ${formatNumber(value)}。`],
      direction: "same"
    };
  }

  if (fromIndex < toIndex) {
    for (let i = fromIndex; i < toIndex; i += 1) {
      const current = route.units[i];
      const next = route.units[i + 1];
      const factor = route.factors[i];
      const before = value;
      value *= factor.value;
      steps.push(
        `${formatNumber(before)} ${unitLabel(current)} ${factor.label} = ${formatNumber(value)} ${unitLabel(next)}`
      );
    }

    return { value, steps, direction: "right" };
  }

  for (let i = fromIndex - 1; i >= toIndex; i -= 1) {
    const current = route.units[i + 1];
    const next = route.units[i];
    const factor = route.factors[i];
    const before = value;
    value /= factor.value;
    steps.push(
      `${formatNumber(before)} ${unitLabel(current)} ${getOperationLabel(factor, false)} = ${formatNumber(value)} ${unitLabel(next)}`
    );
  }

  return { value, steps, direction: "left" };
}

function renderRouteButtons() {
  routeButtons.innerHTML = routes.map((route) => `
    <button
      class="route-button ${route.id === activeRoute.id ? "is-active" : ""}"
      type="button"
      data-route="${route.id}"
      aria-pressed="${route.id === activeRoute.id}"
    >
      <strong>${route.title}</strong>
      <span>${route.description}</span>
    </button>
  `).join("");
}

function renderUnitOptions() {
  const options = activeRoute.units.map((unit) => (
    `<option value="${unit.key}">${optionLabel(unit)}</option>`
  )).join("");

  fromUnit.innerHTML = options;
  toUnit.innerHTML = options;
  fromUnit.value = activeRoute.defaultFrom;
  toUnit.value = activeRoute.defaultTo;
  amountInput.value = activeRoute.defaultAmount;
}

function renderLeafTrack() {
  const fromIndex = unitIndex(activeRoute, fromUnit.value);
  const toIndex = unitIndex(activeRoute, toUnit.value);

  const pieces = activeRoute.units.flatMap((unit, index) => {
    const isEndpoint = index === fromIndex || index === toIndex;
    const leaf = `
      <div class="leaf ${isEndpoint ? "is-active" : ""}">
        <span class="leaf__zh">${unit.zh}</span>
        <span class="leaf__en">${unit.en} / ${unit.abbr}</span>
      </div>
    `;

    if (index === activeRoute.units.length - 1) {
      return [leaf];
    }

    return [
      leaf,
      `<div class="bridge" aria-hidden="true">→<span>${activeRoute.factors[index].label}</span></div>`
    ];
  });

  leafTrack.innerHTML = pieces.join("");
}

function renderActiveRoute() {
  activeRouteType.textContent = activeRoute.type;
  activeRouteTitle.textContent = activeRoute.title;
  routeHint.textContent = activeRoute.hint;
  renderRouteButtons();
  renderUnitOptions();
  renderLeafTrack();
  updateResult();
}

function setDirectionText(direction) {
  if (direction === "right") {
    directionText.textContent = "青蛙往右跳到較小單位，數字會變大，所以每一步都用乘法。";
    return;
  }

  if (direction === "left") {
    directionText.textContent = "青蛙往左跳到較大單位，數字會變小，所以每一步都用除法。";
    return;
  }

  directionText.textContent = "青蛙停在同一片荷葉上，不需要乘也不需要除。";
}

function updateResult() {
  const amount = Number(amountInput.value);
  const from = findUnit(activeRoute, fromUnit.value);
  const to = findUnit(activeRoute, toUnit.value);

  if (!Number.isFinite(amount) || amount < 0 || !from || !to) {
    answerTitle.textContent = "請輸入有效的數值，再讓青蛙起跳。";
    directionText.textContent = "";
    stepsList.innerHTML = "";
    return;
  }

  const result = calculateConversion(activeRoute, amount, from.key, to.key);
  answerTitle.textContent = `${formatNumber(amount)} ${unitLabel(from)} = ${formatNumber(result.value)} ${unitLabel(to)}`;
  setDirectionText(result.direction);
  stepsList.innerHTML = result.steps.map((step) => `<li>${step}</li>`).join("");
  renderLeafTrack();

  frog.classList.remove("is-jumping");
  window.requestAnimationFrame(() => {
    frog.classList.add("is-jumping");
  });
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createChallenge() {
  const route = routes[randomInteger(0, routes.length - 1)];
  let fromIndex = randomInteger(0, route.units.length - 1);
  let toIndex = randomInteger(0, route.units.length - 1);

  while (toIndex === fromIndex) {
    toIndex = randomInteger(0, route.units.length - 1);
  }

  const amount = randomInteger(1, 12);
  const from = route.units[fromIndex];
  const to = route.units[toIndex];
  const result = calculateConversion(route, amount, from.key, to.key);

  currentChallenge = {
    route,
    amount,
    from,
    to,
    answer: result.value,
    direction: result.direction,
    steps: result.steps
  };

  challengeQuestion.textContent = `${amount} ${unitLabel(from)} = ? ${unitLabel(to)}`;
  practiceAnswer.value = "";
  practiceFeedback.textContent = "提示：先判斷青蛙往左跳還是往右跳。";
}

function checkChallenge(event) {
  event.preventDefault();

  if (!currentChallenge) {
    return;
  }

  const userAnswer = Number(practiceAnswer.value);
  if (!Number.isFinite(userAnswer)) {
    practiceFeedback.textContent = "請先輸入一個數字答案。";
    return;
  }

  const correct = currentChallenge.answer;
  const tolerance = Math.max(0.01, Math.abs(correct) * 0.001);
  const isCorrect = Math.abs(userAnswer - correct) <= tolerance;
  const direction = currentChallenge.direction === "right" ? "往右跳，用乘法" : "往左跳，用除法";

  if (isCorrect) {
    practiceFeedback.textContent = `答對了！青蛙${direction}，答案是 ${formatNumber(correct)}。`;
    return;
  }

  practiceFeedback.textContent = `再想一想：青蛙${direction}。正確答案是 ${formatNumber(correct)}。`;
}

routeButtons.addEventListener("click", (event) => {
  const button = event.target.closest("[data-route]");
  if (!button) {
    return;
  }

  activeRoute = routes.find((route) => route.id === button.dataset.route) || routes[0];
  renderActiveRoute();
});

converterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  updateResult();
});

[amountInput, fromUnit, toUnit].forEach((control) => {
  control.addEventListener("input", updateResult);
  control.addEventListener("change", updateResult);
});

practiceForm.addEventListener("submit", checkChallenge);
newChallenge.addEventListener("click", createChallenge);

renderActiveRoute();
createChallenge();
