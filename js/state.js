const createDefaultCharacter = () => ({
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    name: 'Неизвестный Герой',
    race: '', 
    path: '',
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
    traits: ['', ''],
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
                    suggestedName,
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
            return { name: item?.name || '', val: item?.val || '', stat: item?.stat || '' };
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
                    race: char.race || '',
                    path: char.path || '', 
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
                    traits: migrateArray(char.traits, 2, 'simple'),
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
    const newChar = { ...createDefaultCharacter(), name: 'Новый Персонаж' };
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