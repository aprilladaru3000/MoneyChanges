const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const amount = document.getElementById("amount");
const result = document.getElementById("result");
const rateInfo = document.getElementById("rateInfo");
const fromFlag = document.getElementById("fromFlag");
const toFlag = document.getElementById("toFlag");
const swapBtn = document.getElementById("swap");
const topRatesList = document.getElementById("topRates");
const currencyInfo = document.getElementById("currencyInfo");
const ctx = document.getElementById("rateChart");

const apiBase = "https://api.exchangerate-api.com/v4/latest/";
let chartInstance;

const countryData = {
    "USD": { flag: "https://flagcdn.com/us.svg", name: "United States Dollar", symbol: "$", fact: "The most traded currency in the world." },
    "EUR": { flag: "https://flagcdn.com/eu.svg", name: "Euro", symbol: "€", fact: "Used by 20 European countries." },
    "GBP": { flag: "https://flagcdn.com/gb.svg", name: "British Pound", symbol: "£", fact: "The oldest currency still in use." },
    "JPY": { flag: "https://flagcdn.com/jp.svg", name: "Japanese Yen", symbol: "¥", fact: "Japan's yen is the third most traded currency." },
    "AUD": { flag: "https://flagcdn.com/au.svg", name: "Australian Dollar", symbol: "$", fact: "Introduced in 1966, replacing the Australian pound." },
    "IDR": { flag: "https://flagcdn.com/id.svg", name: "Indonesian Rupiah", symbol: "Rp", fact: "High denominations due to historical inflation." }
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
    fromFlag.src = countryData[fromCurrency.value]?.flag || "https://flagcdn.com/un.svg";
    toFlag.src = countryData[toCurrency.value]?.flag || "https://flagcdn.com/un.svg";
    updateCurrencyInfo();
}

function updateCurrencyInfo() {
    const info = countryData[fromCurrency.value];
    if (info) {
        currencyInfo.innerHTML = `
            <strong>${info.name}</strong> (${fromCurrency.value})<br>
            Symbol: ${info.symbol}<br>
            💡 ${info.fact}
        `;
    } else {
        currencyInfo.innerHTML = `No additional info available for ${fromCurrency.value}.`;
    }
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
    updateTopRates(data.rates);
    await updateChart(fromCurrency.value, toCurrency.value);
}

function updateTopRates(rates) {
    const sortedRates = Object.entries(rates)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    topRatesList.innerHTML = sortedRates
        .map(([cur, rate]) => `<li>${cur}: ${rate.toFixed(2)}</li>`)
        .join("");
}

async function updateChart(base, target) {
    // Dummy historical data simulation (API for historical is different)
    const labels = Array.from({ length: 30 }, (_, i) => `Day ${i+1}`);
    const values = Array.from({ length: 30 }, () => (Math.random() * (1.5 - 0.8) + 0.8).toFixed(3));

    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: `${base} to ${target}`,
                data: values,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } }
        }
    });
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
