const escapeHTML = (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
};

const parseEmojis = (text) => {
    if (!text) return '';
    return text.replace(/:([a-zA-Z0-9_]+):/g, (match, iconName) => {
        return `<img src="emojis/${iconName}.png" alt="${iconName}" />`;
    });
};

// База 1: Навыки и Заклинания
window.flatLibrary = {};
if (typeof window.dndLibrary !== 'undefined') {
    const processLibrary = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                window.flatLibrary[key.trim().toLowerCase()] = obj[key];
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                processLibrary(obj[key]);
            }
        }
    };
    processLibrary(window.dndLibrary);
}

// База 2: Предметы и Экипировка
window.flatItemLibrary = {};
if (typeof window.dndItemLibrary !== 'undefined') {
    const processItemLibrary = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                window.flatItemLibrary[key.trim().toLowerCase()] = obj[key];
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                processItemLibrary(obj[key]);
            }
        }
    };
    processItemLibrary(window.dndItemLibrary);
}

// База 3: Оружие
window.flatWeaponsLibrary = {};
if (typeof window.weaponsLibrary !== 'undefined') {
    const processWeaponsLibrary = (obj) => {
        for (const category in obj) {
            for (const weaponName in obj[category]) {
                window.flatWeaponsLibrary[weaponName.trim().toLowerCase()] = obj[category][weaponName];
            }
        }
    };
    processWeaponsLibrary(window.weaponsLibrary);
}

const createDefaultCharacter = () => ({
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    name: 'Неизвестный Герой',
    level: 1,
    exp: 0,
    strength: '0', 
    dexterity: '0',
    mind: '0',
    hpCurrent: 20,
    hpMax: 20,
    enCurrent: 10,
    enMax: 10,
    strsCurrent: 0,
    strsMax: 10,
    personality: '',
    notes: '',
    
    skills: Array.from({length: 4}, () => ({name: '', val: '', status: 0})),
    inventory: Array.from({length: 3}, () => ({name: '', val: ''})),
    actions: Array.from({length: 4}, () => ({name: '', sl: '', cost: '', type: '', status: 0})),
    equipment: ['', '', '', ''],
    traits: ['', '', ''],
    buffs: [],
    savingThrows: []
});

const loadLocalCharacters = () => {
    try {
        const saved = localStorage.getItem('dndCharactersSave');
        if (saved) return JSON.parse(saved);
    } catch (e) { console.error('Ошибка загрузки', e); }
    return [createDefaultCharacter()];
};

const state = {
    characters: loadLocalCharacters(),
    currentCharacterId: null,
    isModalOpen: false,
    errorMsg: null,
    showBuffs: false
};

state.currentCharacterId = state.characters[0].id;

const numberInputClass = "bg-[#161616] border border-[#333] hover:border-[#555] focus:border-[#777] rounded text-center outline-none text-[#e0e0e0] font-bold w-full transition-colors no-spinners";
const statBoxClass = "w-28 h-24 bg-[#232323] border border-[#333] rounded-lg shadow-sm flex flex-col items-center justify-center p-3 gap-2";
const sectionTitleClass = "flex items-center gap-2 mb-3 pb-2 border-b border-[#333] text-[#e0e0e0]";
const listInputClass = "w-full bg-[#1a1a1a] border border-[#333] rounded px-2 sm:px-3 py-2 outline-none focus:border-[#666] text-[#e0e0e0] text-sm transition-colors";

const calculateLevel = (exp) => {
    const e = Number(exp) || 0;
    if (e >= 8000) return 12;
    if (e >= 6000) return 11;
    if (e >= 4800) return 10;
    if (e >= 4000) return 9;
    if (e >= 3500) return 8;
    if (e >= 3000) return 7;
    if (e >= 2600) return 6;
    if (e >= 2000) return 5;
    if (e >= 1200) return 4;
    if (e >= 800) return 3;
    if (e >= 300) return 2;
    return 1;
};

const getBuffForStat = (char, field) => {
    const map = { strength: 'сил', dexterity: 'лов', mind: 'рзм', hpMax: 'хп', enMax: 'ен' };
    const statName = map[field];
    if (!statName) return 0;
    return (char.buffs || []).reduce((acc, curr) => {
        if (curr.stat === statName && curr.val) return acc + parseInt(curr.val);
        return acc;
    }, 0);
};

const updateDamageDisplays = () => {
    const char = state.characters.find(c => c.id === state.currentCharacterId);
    if (!char) return;

    const strBuff = getBuffForStat(char, 'strength');
    const dexBuff = getBuffForStat(char, 'dexterity');
    const strTotal = (parseInt(char.strength) || 0) + strBuff;
    const dexTotal = (parseInt(char.dexterity) || 0) + dexBuff;

    for (let i = 0; i < 2; i++) {
        const input = document.querySelector(`input[data-field="equipment"][data-index="${i}"]`);
        const damageBox = document.getElementById(`damage-display-${i}`);
        
        if (input && damageBox) {
            const searchKey = input.value.trim().toLowerCase();
            let boxContent = '-';
            let boxTitle = '';
            let boxClass = 'w-[70px] sm:w-[85px] bg-[#1a1a1a] border border-[#333] rounded px-1 py-2 text-[#666] text-sm text-center flex-shrink-0 cursor-default flex items-center justify-center';
            
            if (window.flatWeaponsLibrary && window.flatWeaponsLibrary[searchKey]) {
                const weaponData = window.flatWeaponsLibrary[searchKey];
                
                if (weaponData.type === 'ближнее' || weaponData.type === 'дальнее') {
                    let modTotal = weaponData.damage_mod || 0;
                    if (weaponData.type === 'ближнее') modTotal += strTotal;
                    else if (weaponData.type === 'дальнее') modTotal += dexTotal;
                    
                    let modString = modTotal > 0 ? `+${modTotal}` : (modTotal < 0 ? `${modTotal}` : '');
                    boxContent = `${weaponData.damage}${modString}`;
                    boxTitle = `Урон: ${boxContent}`;
                    boxClass = 'w-[70px] sm:w-[85px] bg-[#232323] border border-[#444] rounded px-1 py-2 text-[#e0e0e0] text-sm text-center flex-shrink-0 cursor-default flex items-center justify-center font-mono';
                } else {
                    boxClass = 'w-[70px] sm:w-[85px] bg-[#232323] border border-[#444] rounded px-1 py-2 text-[#666] text-sm text-center flex-shrink-0 cursor-default flex items-center justify-center';
                }
            }
            
            damageBox.className = boxClass;
            damageBox.innerHTML = boxContent;
            damageBox.title = boxTitle;
        }
    }
};

const showError = (msg) => {
    state.errorMsg = msg;
    render();
    setTimeout(() => {
        state.errorMsg = null;
        render();
    }, 3000);
};

const handleExport = async () => {
    try {
        const dataStr = JSON.stringify(state.characters, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        
        const suggestedName = 'characterSaveList.json';

        if (window.showSaveFilePicker) {
            try {
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: suggestedName,
                    types: [{
                        description: 'JSON файл персонажей',
                        accept: { 'application/json': ['.json'] },
                    }],
                });
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
                return;
            } catch (err) {
                if (err.name === 'AbortError') return;
            }
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = suggestedName;
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (err) {
        showError("Ошибка при экспорте файла.");
    }
};

const migrateArray = (arr, defaultLen, type) => {
    let res = Array.isArray(arr) ? arr : Array(defaultLen).fill(null);
    return res.map(item => {
        if (type === 'complex') {
            if (typeof item === 'string') return { name: item, val: '', status: 0 };
            return { name: item?.name || '', val: item?.val || '', status: item?.status || 0 };
        }
        if (type === 'action') {
            if (typeof item === 'string') return { name: item, sl: '', cost: '', type: '', status: 0 };
            return {
                name: item?.name || '',
                sl: item?.sl || '',
                cost: item?.cost || '',
                type: item?.type || '',
                status: item?.status || 0
            };
        }
        if (type === 'buff') {
            if (typeof item === 'string') return { name: item, val: '', stat: '' };
            return {
                name: item?.name || '',
                val: item?.val || '',
                stat: item?.stat || ''
            };
        }
        return typeof item === 'string' ? item : (item?.name || '');
    });
};

const handleImport = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target.result);
            if (Array.isArray(importedData)) {
                const sanitizedData = importedData.map(char => ({
                    ...char,
                    level: char.level ?? 1,
                    exp: char.exp ?? 0,
                    hpCurrent: char.hpCurrent ?? 20,
                    hpMax: char.hpMax ?? 20,
                    enCurrent: char.enCurrent ?? 10,
                    enMax: char.enMax ?? 10,
                    strsCurrent: char.strsCurrent ?? 0,
                    strsMax: char.strsMax ?? 10,
                    personality: char.personality || '',
                    notes: char.notes || '',
                    skills: migrateArray(char.skills, 4, 'complex'),
                    inventory: migrateArray(char.inventory, 3, 'complex'),
                    actions: migrateArray(char.actions, 4, 'action'),
                    equipment: migrateArray(char.equipment, 4, 'simple'),
                    traits: migrateArray(char.traits, 3, 'simple'),
                    buffs: migrateArray(char.buffs, 0, 'buff'),
                    savingThrows: char.savingThrows || []
                }));
                
                state.characters = sanitizedData;
                state.currentCharacterId = sanitizedData.length > 0 ? sanitizedData[0].id : null;
                render();
            } else {
                showError("Неверный формат файла. Ожидался список.");
            }
        } catch (err) {
            showError("Ошибка при чтении файла. Убедитесь, что это корректный JSON.");
        }
    };
    reader.readAsText(file);
};

const handleCreateNew = () => {
    const newChar = {
        ...createDefaultCharacter(),
        name: 'Новый Персонаж'
    };
    state.characters.push(newChar);
    state.currentCharacterId = newChar.id;
    state.isModalOpen = false;
    render();
};

const handleDelete = (id) => {
    state.characters = state.characters.filter(c => c.id !== id);
    if (state.currentCharacterId === id) {
        state.currentCharacterId = state.characters.length > 0 ? state.characters[0].id : null;
    }
    if (state.characters.length === 0) {
        state.isModalOpen = false;
    }
    render();
};

const renderError = () => {
    if (!state.errorMsg) return '';
    return `
        <div class="fixed top-5 left-1/2 -translate-x-1/2 bg-red-900/90 text-red-100 px-6 py-3 rounded-lg shadow-xl border border-red-700 z-50 animate-bounce">
            ${escapeHTML(state.errorMsg)}
        </div>
    `;
};

const renderTopBar = () => {
    return `
        <div class="flex flex-wrap gap-4 mb-8 w-full max-w-6xl justify-start border-b border-[#333] pb-6">
            <button data-action="export" class="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] border border-[#444] rounded-md transition-all active:scale-95 text-sm font-medium">
                <span>📥</span> Скачать
            </button>
            
            <label class="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] border border-[#444] rounded-md transition-all active:scale-95 cursor-pointer text-sm font-medium">
                <span>📤</span> Вставить
                <input type="file" accept=".json" class="hidden" id="import-file" />
            </label>
            
            <button data-action="open-modal" class="flex items-center gap-2 px-4 py-2 bg-[#333] hover:bg-[#444] border border-[#555] rounded-md transition-all active:scale-95 text-sm font-medium ml-auto">
                <span>👥</span> Выбрать персонажа
            </button>
        </div>
    `;
};

const renderArraySection = (char, field, icon, title, min, max) => {
    const arr = char[field] || [];
    const isComplexObj = field === 'skills' || field === 'inventory' || field === 'actions' || field === 'buffs';
    const strBuff = getBuffForStat(char, 'strength');
    const dexBuff = getBuffForStat(char, 'dexterity');
    const strTotal = (parseInt(char.strength) || 0) + strBuff;
    const dexTotal = (parseInt(char.dexterity) || 0) + dexBuff;
    
    const htmlItems = arr.map((item, index) => {
        const textVal = isComplexObj ? (item.name || '') : item;
        let extraInputs = '';
        let statusToggle = '';
        if (field === 'skills' || field === 'actions') {
            const status = item.status || 0;
            let statusContent = '';
            
            if (status === 0) statusContent = '<div class="w-3 h-3 border-2 border-[#555] rounded-sm"></div>'; // Пустой квадрат
            else if (status === 1) statusContent = '✅'; // Зеленая галочка
            else if (status === 2) statusContent = '🔒'; // Замок
            else if (status === 3) statusContent = '🦠'; // Вирус

            statusToggle = `
                <button data-action="toggle-status" data-field="${field}" data-index="${index}" class="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 flex items-center justify-center bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#333] rounded transition-colors text-xs sm:text-sm focus:outline-none" title="Сменить статус">
                    ${statusContent}
                </button>
            `;
        }

        let tooltipContent = '';
        let matchedClass = '';
        const searchKey = textVal.trim().toLowerCase();
        
        const targetLibrary = (field === 'inventory' || field === 'equipment') 
            ? window.flatItemLibrary 
            : window.flatLibrary;
        
        if (targetLibrary && targetLibrary[searchKey]) {
            tooltipContent = parseEmojis(escapeHTML(targetLibrary[searchKey]));
            matchedClass = 'lib-matched'; 
        }

        let damageDisplay = '';
        if (field === 'equipment') {
            if (index < 2) {
                let boxContent = '-';
                let boxTitle = '';
                let boxClass = 'w-[70px] sm:w-[85px] bg-[#1a1a1a] border border-[#333] rounded px-1 py-2 text-[#666] text-sm text-center flex-shrink-0 cursor-default flex items-center justify-center';

                if (window.flatWeaponsLibrary && window.flatWeaponsLibrary[searchKey]) {
                    const weaponData = window.flatWeaponsLibrary[searchKey];
                    matchedClass = 'lib-matched';
                    
                    // Формируем дополнительную информацию о типе и весе оружия для тултипа
                    let extraTooltipInfo = '';
                    if (weaponData.type || weaponData.weight) {
                        const typeStr = weaponData.type ? `Тип: ${weaponData.type}` : '';
                        const weightStr = weaponData.weight ? `Вес: ${weaponData.weight}` : '';
                        const combined = [typeStr, weightStr].filter(Boolean).join(' | ');
                        extraTooltipInfo = `<br><span style="color:#999; font-size:0.75rem; display:block; margin-top:4px;">${escapeHTML(combined)}</span>`;
                    }
                    
                    tooltipContent = parseEmojis(escapeHTML(weaponData.description)) + extraTooltipInfo;
                    
                    if (weaponData.type === 'ближнее' || weaponData.type === 'дальнее') {
                        let modTotal = weaponData.damage_mod || 0;
                        if (weaponData.type === 'ближнее') modTotal += strTotal;
                        else if (weaponData.type === 'дальнее') modTotal += dexTotal;
                        
                        let modString = modTotal > 0 ? `+${modTotal}` : (modTotal < 0 ? `${modTotal}` : '');
                        boxContent = `${weaponData.damage}${modString}`;
                        boxTitle = `Урон: ${boxContent}`;
                        boxClass = 'w-[70px] sm:w-[85px] bg-[#232323] border border-[#444] rounded px-1 py-2 text-[#e0e0e0] text-sm text-center flex-shrink-0 cursor-default flex items-center justify-center font-mono';
                    } else {
                        boxClass = 'w-[70px] sm:w-[85px] bg-[#232323] border border-[#444] rounded px-1 py-2 text-[#666] text-sm text-center flex-shrink-0 cursor-default flex items-center justify-center';
                    }
                }
                
                damageDisplay = `
                    <div id="damage-display-${index}" class="${boxClass}" title="${boxTitle}">
                        ${boxContent}
                    </div>
                `;
            }
        }
        
        if (field === 'skills' || field === 'inventory') {
            const extraVal = item.val || '';
            const placeholderVal = field === 'skills' ? 'Мод.' : 'Кол.';
            extraInputs = `
                <input type="text" data-field="${field}" data-index="${index}" data-subfield="val" value="${escapeHTML(extraVal)}" placeholder="${placeholderVal}" class="w-16 bg-[#1a1a1a] border border-[#333] rounded px-1 sm:px-2 py-2 outline-none focus:border-[#666] text-[#e0e0e0] text-sm text-center transition-colors flex-shrink-0" />
            `;
        } 
        else if (field === 'actions') {
            const slVal = item.sl || '';
            const costVal = item.cost || '';
            const typeVal = item.type || '';

            extraInputs = `
                <div class="flex items-center gap-1 flex-shrink-0">
                    <span class="text-[#888] text-xs font-bold pl-1">СЛ:</span>
                    <input type="text" maxlength="2" data-field="${field}" data-index="${index}" data-subfield="sl" value="${escapeHTML(slVal)}" placeholder="-" class="w-7 sm:w-8 bg-[#1a1a1a] border border-[#333] rounded px-1 py-2 outline-none focus:border-[#666] text-[#e0e0e0] text-sm text-center transition-colors" />
                </div>
                
                <input type="text" data-field="${field}" data-index="${index}" data-subfield="cost" value="${escapeHTML(costVal)}" placeholder="Затр" class="w-12 sm:w-14 bg-[#1a1a1a] border border-[#333] rounded px-1 py-2 outline-none focus:border-[#666] text-[#e0e0e0] text-sm text-center transition-colors flex-shrink-0" />
                
                <select data-field="${field}" data-index="${index}" data-subfield="type" class="w-[75px] sm:w-[90px] bg-[#1a1a1a] border border-[#333] rounded px-1 py-2 outline-none focus:border-[#666] text-[#e0e0e0] text-sm transition-colors flex-shrink-0 text-center cursor-pointer">
                    <option value="" ${typeVal === '-' || typeVal === '' ? 'selected' : ''} disabled hidden>-</option>
                    <option value="закл" ${typeVal === 'закл' ? 'selected' : ''}>закл</option>
                    <option value="прием" ${typeVal === 'прием' ? 'selected' : ''}>прием</option>
                    <option value="помощь" ${typeVal === 'помощь' ? 'selected' : ''}>помощь</option>
                    <option value="стойка" ${typeVal === 'стойка' ? 'selected' : ''}>стойка</option>
                    <option value="крафт" ${typeVal === 'крафт' ? 'selected' : ''}>крафт</option>
                    <option value="починка" ${typeVal === 'починка' ? 'selected' : ''}>починка</option>
                </select>
            `;
        }
        else if (field === 'buffs') {
            const valVal = item.val || '';
            const statVal = item.stat || '';

            extraInputs = `
                <select data-field="${field}" data-index="${index}" data-subfield="val" class="w-[50px] sm:w-[55px] bg-[#1a1a1a] border border-[#333] rounded px-1 py-2 outline-none focus:border-[#666] text-[#e0e0e0] text-sm text-center transition-colors flex-shrink-0 cursor-pointer" title="Значение">
                    <option value="" ${valVal === '' ? 'selected' : ''} disabled hidden>-</option>
                    <option value="2" ${valVal === '2' ? 'selected' : ''}>+2</option>
                    <option value="1" ${valVal === '1' ? 'selected' : ''}>+1</option>
                    <option value="-1" ${valVal === '-1' ? 'selected' : ''}>-1</option>
                    <option value="-2" ${valVal === '-2' ? 'selected' : ''}>-2</option>
                </select>
                
                <select data-field="${field}" data-index="${index}" data-subfield="stat" class="w-[55px] sm:w-[65px] bg-[#1a1a1a] border border-[#333] rounded px-1 py-2 outline-none focus:border-[#666] text-[#e0e0e0] text-sm text-center transition-colors flex-shrink-0 cursor-pointer" title="Характеристика">
                    <option value="" ${statVal === '' ? 'selected' : ''} disabled hidden>-</option>
                    <option value="сил" ${statVal === 'сил' ? 'selected' : ''}>сил</option>
                    <option value="лов" ${statVal === 'лов' ? 'selected' : ''}>лов</option>
                    <option value="рзм" ${statVal === 'рзм' ? 'selected' : ''}>рзм</option>
                    <option value="хп" ${statVal === 'хп' ? 'selected' : ''}>хп</option>
                    <option value="ен" ${statVal === 'ен' ? 'selected' : ''}>ен</option>
                </select>
            `;
        }

       return `
            <div class="flex items-center gap-1 sm:gap-2 w-full">
                <span class="text-[#555] font-mono text-xs w-3 sm:w-4 flex-shrink-0">${index + 1}.</span>
                ${statusToggle}
                <div class="tooltip-container">
                    <input type="text" data-field="${field}" data-index="${index}" ${isComplexObj ? 'data-subfield="name"' : ''} value="${escapeHTML(textVal)}" placeholder="${title}..." class="${listInputClass} ${matchedClass}" />
                    <div class="tooltip-box" data-tooltip-id="${field}-${index}">${tooltipContent}</div>
                </div>
                ${damageDisplay}
                ${extraInputs}
            </div>
        `;
    }).join('');

    const hasLimits = min !== undefined && max !== undefined;
    const buttons = hasLimits ? `
        <div class="flex gap-2 mt-3">
            <button data-action="adjust-array" data-field="${field}" data-add="true" data-min="${min}" data-max="${max}" ${arr.length >= max ? 'disabled' : ''} class="flex-1 flex items-center justify-center py-1.5 bg-[#2a2a2a] hover:bg-[#333] disabled:opacity-30 rounded border border-[#333] transition-colors">➕</button>
            <button data-action="adjust-array" data-field="${field}" data-add="false" data-min="${min}" data-max="${max}" ${arr.length <= min ? 'disabled' : ''} class="flex-1 flex items-center justify-center py-1.5 bg-[#2a2a2a] hover:bg-[#333] disabled:opacity-30 rounded border border-[#333] transition-colors">➖</button>
        </div>
    ` : '';

    const countDisplay = hasLimits ? `<span class="ml-auto text-xs text-[#555]">${arr.length} / ${max}</span>` : '';

    return `
        <div class="flex flex-col">
            <div class="${sectionTitleClass}">
                <span>${icon}</span>
                <h3 class="text-lg font-semibold tracking-wide uppercase">${title}</h3>
                ${countDisplay}
            </div>
            <div class="flex flex-col gap-2">
                ${htmlItems}
            </div>
            ${buttons}
        </div>
    `;
};

const renderCharacter = () => {
    const char = state.characters.find(c => c.id === state.currentCharacterId);
    if (!char) return `<div class="flex flex-col items-center justify-center h-64 text-[#666] mt-20 w-full"><h2 class="text-xl font-medium mb-6">Список персонажей пуст</h2></div>`;

    const hpMaxBuff = getBuffForStat(char, 'hpMax');
    const enMaxBuff = getBuffForStat(char, 'enMax');
    const strBuff = getBuffForStat(char, 'strength');
    const dexBuff = getBuffForStat(char, 'dexterity');
    const mindBuff = getBuffForStat(char, 'mind');

    const hpMaxDisplay = char.hpMax === '' ? '' : char.hpMax + hpMaxBuff;
    const enMaxDisplay = char.enMax === '' ? '' : char.enMax + enMaxBuff;

    const formatStatDisplay = (baseVal, buffVal) => {
        if (baseVal === '') return '';
        let total = (parseInt(baseVal) || 0) + buffVal;
        return total > 0 ? '+' + total : total.toString();
    };

    const strDisplay = formatStatDisplay(char.strength, strBuff);
    const dexDisplay = formatStatDisplay(char.dexterity, dexBuff);
    const mindDisplay = formatStatDisplay(char.mind, mindBuff);

    const getStatColorClass = (buffAmount) => {
        if (buffAmount > 0) return 'text-green-400 border-green-700/50 shadow-[0_0_8px_rgba(74,222,128,0.15)]';
        if (buffAmount < 0) return 'text-red-400 border-red-700/50 shadow-[0_0_8px_rgba(248,113,113,0.15)]';
        return '';
    };

    return `
        <div class="w-full max-w-7xl flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out]">
            
            <div class="w-full max-w-2xl relative flex items-center group">
                <span class="absolute left-0 text-[#666] hidden sm:block text-2xl">👤</span>
                <input type="text" data-field="name" value="${escapeHTML(char.name)}" placeholder="Имя персонажа" class="w-full bg-transparent border-b border-[#444] focus:border-[#888] text-3xl md:text-4xl font-bold outline-none py-2 pl-0 sm:pl-10 transition-colors placeholder:text-[#555] text-white" />
            </div>

            <!-- 👇 УРОВЕНЬ И ОПЫТ 👇 -->
            <div class="flex gap-4 items-center w-full max-w-md">
                <div class="flex-1 bg-[#232323] border border-[#333] rounded-lg p-2.5 flex items-center justify-between shadow-sm">
                    <span class="text-xs uppercase tracking-wider text-[#888] font-semibold">Уровень</span>
                    <input type="text" id="level-display-${char.id}" value="${calculateLevel(char.exp)}" readonly class="w-16 bg-[#161616] border border-[#333] rounded text-center outline-none text-[#888] font-bold py-1 no-spinners cursor-not-allowed select-none transition-all duration-500" title="Уровень рассчитывается автоматически от опыта" />
                </div>
                
                <div class="flex-1 bg-[#232323] border border-[#333] rounded-lg p-2.5 flex items-center justify-between shadow-sm">
                    <span class="text-xs uppercase tracking-wider text-[#888] font-semibold">Опыт</span>
                    <input type="number" data-field="exp" value="${char.exp ?? 0}" class="w-20 bg-[#161616] border border-[#333] rounded text-center outline-none text-[#e0e0e0] font-bold py-1 no-spinners" />
                </div>
            </div> <!-- 👈 ДОБАВЬТЕ ЭТОТ ТЕГ СЮДА -->

            <div class="flex flex-wrap gap-4 items-center">
                <div class="${statBoxClass}">
                    <span class="text-[10px] uppercase tracking-widest text-red-900/80 font-semibold text-red-400">ХП</span>
                    <div class="flex items-center gap-1 w-full h-10">
                        <input type="number" data-field="hpCurrent" value="${char.hpCurrent}" class="${numberInputClass} text-lg h-full" />
                        <span class="text-[#555]">/</span>
                        <input type="number" data-field="hpMax" value="${hpMaxDisplay}" class="${numberInputClass} ${getStatColorClass(hpMaxBuff)} transition-all text-lg h-full opacity-70" title="${hpMaxBuff ? (hpMaxBuff > 0 ? '+'+hpMaxBuff : hpMaxBuff) + ' от баффов' : ''}" />
                    </div>
                </div>

                <div class="${statBoxClass}">
                    <span class="text-[10px] uppercase tracking-widest text-blue-400 font-semibold">ЕН</span>
                    <div class="flex items-center gap-1 w-full h-10">
                        <input type="number" data-field="enCurrent" value="${char.enCurrent}" class="${numberInputClass} text-lg h-full" />
                        <span class="text-[#555]">/</span>
                        <input type="number" data-field="enMax" value="${enMaxDisplay}" class="${numberInputClass} ${getStatColorClass(enMaxBuff)} transition-all text-lg h-full opacity-70" title="${enMaxBuff ? (enMaxBuff > 0 ? '+'+enMaxBuff : enMaxBuff) + ' от баффов' : ''}" />
                    </div>
                </div>
                
                <div class="${statBoxClass}">
                    <span class="text-[10px] uppercase tracking-widest text-purple-400 font-semibold">СТРС</span>
                    <div class="flex items-center gap-1 w-full h-10">
                        <input type="number" data-field="strsCurrent" value="${char.strsCurrent}" class="${numberInputClass} text-lg h-full" />
                        <span class="text-[#555]">/</span>
                        <input type="number" data-field="strsMax" value="${char.strsMax}" class="${numberInputClass} text-lg h-full opacity-70" />
                    </div>
                </div>

                <div class="${statBoxClass}">
                    <span class="text-[10px] uppercase tracking-widest text-[#888] font-semibold">СИЛ</span>
                    <input type="text" data-field="strength" value="${strDisplay}" class="${numberInputClass} ${getStatColorClass(strBuff)} transition-all text-2xl h-10" title="${strBuff ? (strBuff > 0 ? '+'+strBuff : strBuff) + ' от баффов' : ''}" />
                </div>
                <div class="${statBoxClass}">
                    <span class="text-[10px] uppercase tracking-widest text-[#888] font-semibold">ЛОВ</span>
                    <input type="text" data-field="dexterity" value="${dexDisplay}" class="${numberInputClass} ${getStatColorClass(dexBuff)} transition-all text-2xl h-10" title="${dexBuff ? (dexBuff > 0 ? '+'+dexBuff : dexBuff) + ' от баффов' : ''}" />
                </div>
                <div class="${statBoxClass}">
                    <span class="text-[10px] uppercase tracking-widest text-[#888] font-semibold">РЗМ</span>
                    <input type="text" data-field="mind" value="${mindDisplay}" class="${numberInputClass} ${getStatColorClass(mindBuff)} transition-all text-2xl h-10" title="${mindBuff ? (mindBuff > 0 ? '+'+mindBuff : mindBuff) + ' от баффов' : ''}" />
                </div>
            </div>

            <!-- Основной блок -->
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-10 w-full mt-4">
                <div class="flex flex-col gap-8">
                    ${renderArraySection(char, 'actions', '⚡', 'Действия', 4, 10)}
                    ${renderArraySection(char, 'inventory', '🎒', 'Инвентарь', 3, 8)}
                </div>
                <div class="flex flex-col gap-8">
                    ${renderArraySection(char, 'equipment', '⚔️', 'Экипировка', 4, 10)}
                    ${renderArraySection(char, 'skills', '📖', 'Навыки', 4, 10)}
                </div>
            </div>

            <!-- Скрываемый блок: Усиления (слева) и Черты (справа) -->
            <div class="w-full mt-2">
                <div data-action="toggle-buffs" class="flex items-center gap-4 cursor-pointer text-[#666] hover:text-[#aaa] transition-colors mb-2 select-none group">
                    <div class="flex-1 h-px bg-[#333] group-hover:bg-[#555] transition-colors"></div>
                    <span class="text-xs font-bold uppercase tracking-widest">${state.showBuffs ? 'Свернуть' : 'Больше'}</span>
                    <div class="flex-1 h-px bg-[#333] group-hover:bg-[#555] transition-colors"></div>
                </div>
                
               ${state.showBuffs ? `
                    <div class="grid grid-cols-1 xl:grid-cols-2 gap-10 w-full animate-[fadeIn_0.3s_ease-out] mt-4">
                        <div class="flex flex-col relative">
                            <span class="absolute right-0 -top-6 text-[10px] text-[#555] font-mono">Shift+X - Сбросить всё</span>
                            ${renderArraySection(char, 'buffs', '⏳', 'Временные усиления', 0, 4)}
                        </div>
                        <div class="flex flex-col">
                            ${renderArraySection(char, 'traits', '✨', 'Черты', 3, 5)}
                        </div>
                    </div>
                    
                    <!-- НАЧАЛО НОВОГО БЛОКА СПАСБРОСКОВ -->
                   <div class="w-full flex items-center gap-3 mt-8 animate-[fadeIn_0.3s_ease-out] bg-[#232323] p-3 rounded-lg border border-[#333]">
                        <span class="text-sm font-semibold tracking-wide uppercase text-[#888] flex items-center gap-2">🛡️ Спасброски</span>
                        <div class="flex flex-wrap items-center gap-2 flex-1">
                            ${(() => {
                                const throws = char.savingThrows || [];
                                const allOptions = ['сил', 'рзм', 'тел', 'лов', 'хар'];
                                const available = allOptions.filter(opt => !throws.find(t => t.name === opt));
                                
                                let tagsHtml = throws.map((st, index) => {
                                    const isActive = st.active || throws.length === 1; 
                                    const bgClass = isActive ? 'bg-blue-900/40 border-blue-500 text-blue-400' : 'bg-[#1a1a1a] border-[#444] text-[#888] hover:border-[#666]';
                                    
                                    // Обратите внимание на использование одинарных кавычек внутри, чтобы избежать проблем со вложенными бэктиками
                                    return '<div class="flex items-stretch border rounded overflow-hidden transition-colors ' + bgClass + '">' +
                                        '<button data-action="toggle-st" data-index="' + index + '" class="px-2.5 py-1 text-xs uppercase font-bold focus:outline-none">' + st.name + '</button>' +
                                        '<button data-action="remove-st" data-index="' + index + '" class="px-2 py-1 bg-black/20 hover:bg-red-500/80 hover:text-white transition-colors focus:outline-none border-l border-inherit" title="Удалить">×</button>' +
                                    '</div>';
                                }).join('');

                                let addBtnHtml = '';
                                if (available.length > 0) {
                                    const optionsHtml = available.map(opt => '<option value="' + opt + '">' + opt.toUpperCase() + '</option>').join('');
                                    addBtnHtml = '<select data-action="add-st" class="bg-[#1a1a1a] border border-[#444] rounded px-2 py-1 text-sm font-bold text-[#e0e0e0] cursor-pointer outline-none hover:border-[#666] transition-colors text-center h-[26px]">' +
                                        '<option value="" disabled selected>+</option>' +
                                        optionsHtml +
                                    '</select>';
                                }

                                return tagsHtml + addBtnHtml;
                            })()}
                        </div>
                    </div>
                    <!-- КОНЕЦ БЛОКА СПАСБРОСКОВ -->

                    <div class="w-full flex flex-col mt-6 animate-[fadeIn_0.3s_ease-out]">
                        <div class="\${sectionTitleClass}">
                            <span>📝</span>
                            <h3 class="text-lg font-semibold tracking-wide uppercase">Заметки</h3>
                        </div>
                        <textarea data-field="notes" class="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 outline-none focus:border-[#666] text-[#e0e0e0] text-sm transition-colors resize-y min-h-[120px]" placeholder="Ваши записи, квесты, контакты и важная информация...">${escapeHTML(char.notes || '')}</textarea>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
};

const renderModal = () => {
    if (!state.isModalOpen) return '';
    
    const listHtml = state.characters.length === 0 
        ? `<p class="text-center text-[#666] py-8 text-sm">Список пуст</p>`
        : state.characters.map(char => `
            <div class="flex justify-between items-center p-3 rounded-lg border transition-all ${state.currentCharacterId === char.id ? 'bg-[#2a2a2a] border-[#555]' : 'bg-[#1a1a1a] border-[#222] hover:border-[#444]'}">
                <button data-action="select-char" data-id="${char.id}" class="flex-1 text-left flex flex-col focus:outline-none">
                    <span class="font-semibold text-base mb-1 text-[#eee]">${escapeHTML(char.name) || 'Без имени'}</span>
                    <span class="text-xs text-[#888] flex gap-3 font-mono">
                        <span>СИЛ:${escapeHTML(char.strength)}</span>
                        <span>ЛОВ:${escapeHTML(char.dexterity)}</span>
                        <span>ХП:${char.hpCurrent}/${char.hpMax}</span>
                    </span>
                </button>
                <button data-action="delete-char" data-id="${char.id}" class="p-2 text-[#666] hover:text-red-400 hover:bg-[#333] rounded transition-colors" title="Удалить">
                    🗑️
                </button>
            </div>
        `).join('');

    return `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div class="bg-[#1e1e1e] w-full max-w-md rounded-xl shadow-2xl border border-[#333] overflow-hidden flex flex-col max-h-[85vh]">
                <div class="p-4 border-b border-[#333] flex justify-between items-center bg-[#232323]">
                    <h2 class="text-lg font-semibold text-[#e0e0e0]">Ваши персонажи</h2>
                    <button data-action="close-modal" class="p-1.5 hover:bg-[#333] rounded-md transition-colors text-[#888] hover:text-[#eee]">❌</button>
                </div>
                <div class="overflow-y-auto p-3 flex-1 flex flex-col gap-2">
                    ${listHtml}
                </div>
                <div class="p-3 border-t border-[#333] bg-[#232323]">
                    <button data-action="create-new" class="w-full flex justify-center items-center gap-2 py-2.5 bg-[#333] hover:bg-[#444] text-[#eee] rounded-md transition-colors font-medium text-sm border border-[#444]">
                        ➕ Новый персонаж
                    </button>
                </div>
            </div>
        </div>
    `;
};

const render = () => {
    localStorage.setItem('dndCharactersSave', JSON.stringify(state.characters));
    
    const app = document.getElementById('app');
    app.innerHTML = `
        ${renderError()}
        ${renderTopBar()}
        ${renderCharacter()}
        ${renderModal()}
    `;
};

window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    e.returnValue = ''; 
});

document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.code === 'KeyX') {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
        
        const char = state.characters.find(c => c.id === state.currentCharacterId);
        if (char && char.buffs && char.buffs.length > 0) {
            e.preventDefault();
            char.buffs = []; 
            render();
        }
    }
});

document.getElementById('app').addEventListener('input', (e) => {
    const field = e.target.getAttribute('data-field');
    if (!field) return;

    const char = state.characters.find(c => c.id === state.currentCharacterId);
    if (!char) return;

    const index = e.target.getAttribute('data-index');
    const subfield = e.target.getAttribute('data-subfield');
    let value = e.target.value;

    const checkLibrary = (val) => {
        const searchKey = val.trim().toLowerCase();
        const tooltipBox = e.target.nextElementSibling;
        let isMatched = false;
        
        const targetLibrary = (field === 'inventory' || field === 'equipment') ? window.flatItemLibrary : window.flatLibrary;
        if (targetLibrary && targetLibrary[searchKey]) {
            e.target.classList.add('lib-matched');
            if(tooltipBox && tooltipBox.classList.contains('tooltip-box')){
                tooltipBox.innerHTML = parseEmojis(escapeHTML(targetLibrary[searchKey]));
            }
            isMatched = true;
        } 
        
        if (field === 'equipment' && window.flatWeaponsLibrary && window.flatWeaponsLibrary[searchKey]) {
            e.target.classList.add('lib-matched');
            if(tooltipBox && tooltipBox.classList.contains('tooltip-box')){
                const weaponData = window.flatWeaponsLibrary[searchKey];
                
                // Добавляем тип и вес при динамическом вводе
                let extraTooltipInfo = '';
                if (weaponData.type || weaponData.weight) {
                    const typeStr = weaponData.type ? `Тип: ${weaponData.type}` : '';
                    const weightStr = weaponData.weight ? `Вес: ${weaponData.weight}` : '';
                    const combined = [typeStr, weightStr].filter(Boolean).join(' | ');
                    extraTooltipInfo = `<br><span style="color:#999; font-size:0.75rem; display:block; margin-top:4px;">${escapeHTML(combined)}</span>`;
                }
                
                tooltipBox.innerHTML = parseEmojis(escapeHTML(weaponData.description)) + extraTooltipInfo;
            }
            isMatched = true;
        }

        if (!isMatched) {
            e.target.classList.remove('lib-matched');
            if(tooltipBox && tooltipBox.classList.contains('tooltip-box')){
                tooltipBox.innerHTML = '';
            }
        }
        
        if (field === 'equipment') {
            updateDamageDisplays();
        }
    };

    if (index !== null) {
        if (subfield) {
            char[field][parseInt(index)][subfield] = value;
            if (subfield === 'name') checkLibrary(value);
        } else {
            char[field][parseInt(index)] = value;
            checkLibrary(value); 
        }
    } else {
        let buffAmount = getBuffForStat(char, field);

        if (field === 'hpMax' || field === 'enMax') {
            if (value === '') char[field] = '';
            else char[field] = Number(value) - buffAmount;
        } 
        else if (['strength', 'dexterity', 'mind'].includes(field)) {
            if (value === '') char[field] = '';
            else {
                let num = (parseInt(value) || 0) - buffAmount;
                char[field] = num > 0 ? '+' + num : num.toString();
            }
            updateDamageDisplays();
        } 
        else if (e.target.type === 'number') {
            char[field] = value === '' ? '' : Number(value);
            
            // Если изменился опыт — проверяем изменение уровня
            if (field === 'exp') {
                const oldLevel = char.level || 1;
                const newLevel = calculateLevel(char.exp);
                
                // Если уровень действительно поменялся (игрок перешел порог опыта)
                if (oldLevel !== newLevel) {
                    char.level = newLevel;
                    const levelDisplay = document.getElementById(`level-display-${char.id}`);
                    
                    if (levelDisplay) {
                        levelDisplay.value = char.level;
                        
                        // Если новый уровень больше 1 — запускаем анимацию
                        if (newLevel > 1) {
                            // Убираем серые цвета и добавляем желтое свечение
                            levelDisplay.classList.remove('bg-[#161616]', 'border-[#333]', 'text-[#888]');
                            levelDisplay.classList.add('bg-yellow-900/50', 'border-yellow-500', 'text-yellow-400', 'shadow-[0_0_15px_rgba(234,179,8,0.2)]');
                            
                            // Возвращаем как было через 2 секунды (2000 миллисекунд)
                            setTimeout(() => {
                                // Проверяем, существует ли еще элемент (вдруг игрок быстро переключил персонажа)
                                if (document.body.contains(levelDisplay)) {
                                    levelDisplay.classList.remove('bg-yellow-900/50', 'border-yellow-500', 'text-yellow-400', 'shadow-[0_0_15px_rgba(234,179,8,0.2)]');
                                    levelDisplay.classList.add('bg-[#161616]', 'border-[#333]', 'text-[#888]');
                                }
                            }, 2000);
                        }
                    }
                }
            }
        }
        else {
            char[field] = value;
        }
    }
});

document.getElementById('app').addEventListener('wheel', (e) => {
    const field = e.target.getAttribute('data-field');
    if (field && ['hpCurrent', 'hpMax', 'enCurrent', 'enMax', 'strsCurrent', 'strsMax'].includes(field)) {
        e.preventDefault(); 
        
        const char = state.characters.find(c => c.id === state.currentCharacterId);
        if (!char) return;

        let value = Number(e.target.value) || 0;
        
        if (e.deltaY < 0) value += 1;
        else if (e.deltaY > 0) value -= 1;

        e.target.value = value;
        
        let buffAmount = getBuffForStat(char, field);
        char[field] = value - buffAmount;
    }
}, { passive: false });

document.getElementById('app').addEventListener('change', (e) => {
    if (e.target.id === 'import-file') {
        handleImport(e.target.files[0]);
        e.target.value = '';
    } else if (e.target.getAttribute('data-action') === 'add-st') {
        const char = state.characters.find(c => c.id === state.currentCharacterId);
        if (char) {
            if (!char.savingThrows) char.savingThrows = [];
            char.savingThrows.push({ name: e.target.value, active: char.savingThrows.length === 0 });
            render();
        }
    } else if (['INPUT', 'SELECT'].includes(e.target.tagName)) {
        render();
    }
});

document.getElementById('app').addEventListener('click', (e) => {
    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;

    const action = actionBtn.getAttribute('data-action');

    if (action === 'export') {
        handleExport();
    } else if (action === 'open-modal') {
        state.isModalOpen = true;
        render();
    } else if (action === 'close-modal') {
        state.isModalOpen = false;
        render();
    } else if (action === 'create-new') {
        handleCreateNew();
    } else if (action === 'delete-char') {
        const id = actionBtn.getAttribute('data-id');
        handleDelete(id);
    } else if (action === 'select-char') {
        state.currentCharacterId = actionBtn.getAttribute('data-id');
        state.isModalOpen = false;
        render();
    } else if (action === 'toggle-buffs') {
        state.showBuffs = !state.showBuffs;
        render();
    } else if (action === 'toggle-status') {
        const field = actionBtn.getAttribute('data-field');
        const index = parseInt(actionBtn.getAttribute('data-index'));
        const char = state.characters.find(c => c.id === state.currentCharacterId);
        
        if (char && char[field] && char[field][index] !== undefined) {
            const currentStatus = char[field][index].status || 0;
            // Увеличиваем статус на 1. Оператор % 4 зациклит его: 0 -> 1 -> 2 -> 3 -> 0
            char[field][index].status = (currentStatus + 1) % 4;
            render();
        }
   } else if (action === 'adjust-array') {
        // ... старый код логики массивов ...
        const field = actionBtn.getAttribute('data-field');
        // ...
        if (char && char[field]) {
            // ...
            render();
        }
    } else if (action === 'toggle-st') {
        const index = parseInt(actionBtn.getAttribute('data-index'));
        const char = state.characters.find(c => c.id === state.currentCharacterId);
        if (char && char.savingThrows) {
            char.savingThrows[index].active = !char.savingThrows[index].active;
            render();
        }
    } else if (action === 'remove-st') {
        const index = parseInt(actionBtn.getAttribute('data-index'));
        const char = state.characters.find(c => c.id === state.currentCharacterId);
        if (char && char.savingThrows) {
            char.savingThrows.splice(index, 1);
            // Если после удаления остался всего 1, принудительно делаем его активным
            if (char.savingThrows.length === 1) {
                char.savingThrows[0].active = true;
            }
            render();
        }
    }
});

tailwind.config = {
    theme: {
        extend: {
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        }
    }
}

render();