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
    if (libItem.difficulty !== undefined && libItem.difficulty !== null) {
        let diff = Number(libItem.difficulty);
        if (libItem.difficultyType) {
            const statMod = getStatTotalByShortName(char, libItem.difficultyType);
            diff = diff + (-1 * statMod);
        }
        sl = String(diff);
    }

    let cost = '';
    if (libItem.cost !== undefined && libItem.cost !== null) {
        cost = `${libItem.cost}${libItem.costType || ''}`;
    }

    let type = libItem.actionType ? String(libItem.actionType).toLowerCase() : '';
    return { sl, cost, type };
};