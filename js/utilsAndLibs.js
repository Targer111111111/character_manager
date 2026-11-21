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
    return text.replace(/:([a-zA-Z0-9_\-а-яА-ЯёЁ]+):/g, (match, iconName) => {
        return `<img src="emojis/${iconName}.png" alt="${iconName}" />`;
    });
};

// База 1: Навыки и Заклинания
window.flatLibrary = {};
window.flatLibraryFull = {};

const rawSkillLibrary = typeof window.parsedDndLibrary !== 'undefined' 
    ? window.parsedDndLibrary 
    : (typeof window.dndLibrary !== 'undefined' ? window.dndLibrary : undefined);

if (rawSkillLibrary) {
    const processLibrary = (obj) => {
        for (const key in obj) {
            const item = obj[key];
            if (typeof item === 'string') {
                const k = key.trim().toLowerCase();
                window.flatLibrary[k] = item;
            } else if (item && typeof item === 'object' && item.description !== undefined) {
                const k = key.trim().toLowerCase();
                window.flatLibrary[k] = item.description;
                window.flatLibraryFull[k] = item;
            } else if (typeof item === 'object' && item !== null) {
                processLibrary(item);
            }
        }
    };
    processLibrary(rawSkillLibrary);
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

// База 3: Оружие (главные массивы: сил, лов, рзм)
window.flatWeaponsLibrary = {};
if (typeof window.weaponsLibrary !== 'undefined') {
    const processWeaponsLibrary = (obj) => {
        for (const statCategory in obj) {
            const normalizedStat = statCategory.trim().toLowerCase();
            for (const weaponName in obj[statCategory]) {
                const weaponObj = obj[statCategory][weaponName];
                window.flatWeaponsLibrary[weaponName.trim().toLowerCase()] = {
                    ...weaponObj,
                    stat: weaponObj.stat || normalizedStat
                };
            }
        }
    };
    processWeaponsLibrary(window.weaponsLibrary);
}

// Математика характеристик и уровней
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

const getStatTotalByShortName = (char, statShort) => {
    if (!statShort) return 0;
    const s = statShort.trim().toLowerCase();
    if (s === 'сил') return (parseInt(char.strength) || 0) + getBuffForStat(char, 'strength');
    if (s === 'лов') return (parseInt(char.dexterity) || 0) + getBuffForStat(char, 'dexterity');
    if (s === 'рзм') return (parseInt(char.mind) || 0) + getBuffForStat(char, 'mind');
    return 0;
};

const computeActionFieldsFromLib = (char, libItem) => {
    let sl = '';
    if (libItem.difficulty !== undefined && libItem.difficulty !== null && libItem.difficulty !== '') {
        let diff = Number(libItem.difficulty);
        if (!Number.isNaN(diff)) {
            if (libItem.difficultyType && char) {
                const statMod = getStatTotalByShortName(char, libItem.difficultyType);
                diff = diff + (-1 * statMod);
            }
            sl = String(diff);
        } else {
            sl = String(libItem.difficulty);
        }
    }

    let cost = '';
    if (libItem.cost !== undefined && libItem.cost !== null && libItem.cost !== '') {
        cost = `${libItem.cost}${libItem.costType || ''}`;
    }

    let type = (libItem.actionType && libItem.actionType !== '-') ? String(libItem.actionType).toLowerCase() : '';
    return { sl, cost, type };
};

// Форматирование тултипов
const formatActionTooltip = (char, libItem) => {
    if (!libItem) return '';
    if (typeof libItem === 'string') return parseEmojis(escapeHTML(libItem));

    const { sl, cost, type } = computeActionFieldsFromLib(char, libItem);
    const metaParts = [];

    if (type) metaParts.push(`Тип: ${type}`);
    if (cost) metaParts.push(`Затраты: ${cost}`);
    if (sl !== '') {
        const statSuffix = libItem.difficultyType ? ` (${String(libItem.difficultyType).toUpperCase()})` : '';
        metaParts.push(`СЛ: ${sl}${statSuffix}`);
    }

    const descHtml = libItem.description ? parseEmojis(escapeHTML(libItem.description)) : '';
    let metaHtml = '';

    if (metaParts.length > 0) {
        const borderStyle = descHtml ? 'margin-top:6px; padding-top:4px; border-top:1px solid #3d3d3d;' : '';
        metaHtml = `<span style="color:#999; font-size:0.75rem; display:block; ${borderStyle}">${parseEmojis(escapeHTML(metaParts.join(' | ')))}</span>`;
    }

    return descHtml + metaHtml;
};

const formatWeaponTooltip = (weaponData) => {
    if (!weaponData) return '';
    const distanceType = weaponData.type || weaponData.range || '';
    const metaParts = [
        weaponData.stat ? `Хар-ка: ${weaponData.stat.toUpperCase()}` : '',
        distanceType ? `Тип: ${distanceType}` : '',
        weaponData.weight ? `Вес: ${weaponData.weight}` : ''
    ].filter(Boolean);

    const descHtml = weaponData.description ? parseEmojis(escapeHTML(weaponData.description)) : '';
    let metaHtml = '';

    if (metaParts.length > 0) {
        const borderStyle = descHtml ? 'margin-top:6px; padding-top:4px; border-top:1px solid #3d3d3d;' : '';
        metaHtml = `<span style="color:#999; font-size:0.75rem; display:block; ${borderStyle}">${escapeHTML(metaParts.join(' | '))}</span>`;
    }

    return descHtml + metaHtml;
};