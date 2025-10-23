const fromSel = document.getElementById('fromSel');
const toSel = document.getElementById('toSel');
const amt = document.getElementById('amt');
const savePairBtn = document.getElementById('savePair');
const convertNowBtn = document.getElementById('convertNow');
const savedList = document.getElementById('savedList');
const convertResult = document.getElementById('convertResult');
const clearAllBtn = document.getElementById('clearAll');

const apiBase = 'https://api.exchangerate-api.com/v4/latest/';
const STORAGE_KEY = 'savedPairs';

async function init() {
    try {
        const res = await fetch(apiBase + 'USD');
        const data = await res.json();
        const currencies = Object.keys(data.rates);
        currencies.forEach(c => {
            fromSel.innerHTML += `<option value="${c}">${c}</option>`;
            toSel.innerHTML += `<option value="${c}">${c}</option>`;
        });
        fromSel.value = 'USD';
        toSel.value = 'EUR';
    } catch (e) {
        // Fallback minimal list if API fails
        const fallback = ['USD','EUR','GBP','JPY','AUD','IDR'];
        fallback.forEach(c => {
            fromSel.innerHTML += `<option value="${c}">${c}</option>`;
            toSel.innerHTML += `<option value="${c}">${c}</option>`;
        });
    }
    renderSaved();
}

function readSaved() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
}

function writeSaved(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function renderSaved() {
    const list = readSaved();
    if (list.length === 0) {
        savedList.innerHTML = '<li class="text-gray-500">No saved pairs yet.</li>';
        return;
    }
    savedList.innerHTML = '';
    list.forEach((p, idx) => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between bg-gray-100 p-2 rounded';
        li.innerHTML = `
            <div class="flex items-center gap-3">
                <button class="convertBtn text-left" data-idx="${idx}"><strong>${p.from}/${p.to}</strong></button>
                <span class="text-gray-600">(${p.label || 'saved'})</span>
            </div>
            <div class="flex gap-2">
                <button class="btnDel text-sm text-red-600" data-idx="${idx}">Delete</button>
            </div>
        `;
        savedList.appendChild(li);
    });
    // attach handlers
    document.querySelectorAll('.convertBtn').forEach(btn => btn.addEventListener('click', onSavedConvert));
    document.querySelectorAll('.btnDel').forEach(btn => btn.addEventListener('click', onDelete));
}

function onSavedConvert(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    const list = readSaved();
    const p = list[idx];
    const amount = Number(amt.value) || 1;
    doConvert(p.from, p.to, amount);
}

function onDelete(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    const list = readSaved();
    list.splice(idx,1);
    writeSaved(list);
    renderSaved();
}

function saveCurrentPair() {
    const from = fromSel.value;
    const to = toSel.value;
    if (!from || !to) return;
    let list = readSaved();
    // avoid duplicates
    if (list.some(p => p.from === from && p.to === to)) return alert('Pair already saved');
    list.push({ from, to, label: '' });
    writeSaved(list);
    renderSaved();
}

async function doConvert(from, to, amountVal) {
    convertResult.innerText = 'Converting...';
    try {
        const res = await fetch(apiBase + from);
        const data = await res.json();
        const rate = data.rates[to];
        if (!rate) throw new Error('Rate not available');
        const converted = (amountVal * rate).toFixed(2);
        convertResult.innerText = `${amountVal} ${from} = ${converted} ${to} (1 ${from} = ${rate} ${to})`;
    } catch (e) {
        convertResult.innerText = 'Conversion failed. Try again later.';
    }
}

convertNowBtn.addEventListener('click', () => {
    const from = fromSel.value; const to = toSel.value; const amount = Number(amt.value) || 1;
    doConvert(from, to, amount);
});

savePairBtn.addEventListener('click', saveCurrentPair);
clearAllBtn.addEventListener('click', () => { localStorage.removeItem(STORAGE_KEY); renderSaved(); });

init();
