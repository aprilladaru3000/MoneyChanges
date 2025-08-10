const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const amount = document.getElementById("amount");
const result = document.getElementById("result");
const rateInfo = document.getElementById("rateInfo");
const fromFlag = document.getElementById("fromFlag");
const toFlag = document.getElementById("toFlag");
const swapBtn = document.getElementById("swap");

const apiBase = "https://api.exchangerate-api.com/v4/latest/";

const countryFlags = {
    "USD": "https://flagcdn.com/us.svg",
    "EUR": "https://flagcdn.com/eu.svg",
    "GBP": "https://flagcdn.com/gb.svg",
    "JPY": "https://flagcdn.com/jp.svg",
    "AUD": "https://flagcdn.com/au.svg",
    "CAD": "https://flagcdn.com/ca.svg",
    "CNY": "https://flagcdn.com/cn.svg",
    "IDR": "https://flagcdn.com/id.svg",
    "SGD": "https://flagcdn.com/sg.svg",
    "INR": "https://flagcdn.com/in.svg"
};

async function loadCurrencies() {
    const res = await fetch(apiBase + "USD");
    const data = await res.json();
    const currencies = Object.keys(data.rates);
    currencies.forEach(currency => {
        fromCurrency.innerHTML += `<option value="${currency}">${currency}</option>`;
        toCurrency.innerHTML += `<option value="${currency}">${currency}</option>`;
    });
    fromCurrency.value = "USD";
    toCurrency.value = "EUR";
    updateFlags();
    convert();
}

function updateFlags() {
    fromFlag.src = countryFlags[fromCurrency.value] || "https://flagcdn.com/un.svg";
    toFlag.src = countryFlags[toCurrency.value] || "https://flagcdn.com/un.svg";
}

async function convert() {
    if (amount.value <= 0) {
        result.innerText = "Enter valid amount";
        return;
    }
    const res = await fetch(apiBase + fromCurrency.value);
    const data = await res.json();
    const rate = data.rates[toCurrency.value];
    const converted = (amount.value * rate).toFixed(2);
    result.innerText = `${amount.value} ${fromCurrency.value} = ${converted} ${toCurrency.value}`;
    rateInfo.innerText = `1 ${fromCurrency.value} = ${rate} ${toCurrency.value} (Updated: ${data.date})`;
}

swapBtn.addEventListener("click", () => {
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
    updateFlags();
    convert();
});

fromCurrency.addEventListener("change", () => { updateFlags(); convert(); });
toCurrency.addEventListener("change", () => { updateFlags(); convert(); });
amount.addEventListener("input", convert);

loadCurrencies();
