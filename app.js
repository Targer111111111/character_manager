const updateActionDisplays = () => {
    const char = state.characters.find(c => c.id === state.currentCharacterId);
    if (!char || !char.actions) return;

    char.actions.forEach((act, idx) => {
        const searchKey = (act.name || '').trim().toLowerCase();
        const libItem = window.flatLibraryFull && window.flatLibraryFull[searchKey];
        if (libItem && libItem.difficulty !== undefined && libItem.difficultyType) {
            const { sl } = computeActionFieldsFromLib(char, libItem);
            act.sl = sl;
            const slInput = document.querySelector(`input[data-field="actions"][data-index="${idx}"][data-subfield="sl"]`);
            if (slInput) slInput.value = sl;
        }
    });
};

const updateDamageDisplays = () => {
    const char = state.characters.find(c => c.id === state.currentCharacterId);
    if (!char) return;

    const strTotal = (parseInt(char.strength) || 0) + getBuffForStat(char, 'strength');
    const dexTotal = (parseInt(char.dexterity) || 0) + getBuffForStat(char, 'dexterity');

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
                    let modTotal = (weaponData.damage_mod || 0) + (weaponData.type === 'ближнее' ? strTotal : dexTotal);
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
            if (tooltipBox && tooltipBox.classList.contains('tooltip-box')) {
                tooltipBox.innerHTML = parseEmojis(escapeHTML(targetLibrary[searchKey]));
            }
            isMatched = true;

            if (field === 'actions' && window.flatLibraryFull && window.flatLibraryFull[searchKey]) {
                const idx = parseInt(index);
                const libItem = window.flatLibraryFull[searchKey];
                const { sl, cost, type } = computeActionFieldsFromLib(char, libItem);

                char.actions[idx].sl = sl;
                char.actions[idx].cost = cost;
                char.actions[idx].type = type;

                const slInput = document.querySelector(`input[data-field="actions"][data-index="${idx}"][data-subfield="sl"]`);
                const costInput = document.querySelector(`input[data-field="actions"][data-index="${idx}"][data-subfield="cost"]`);
                const typeInput = document.querySelector(`input[data-field="actions"][data-index="${idx}"][data-subfield="type"]`);

                if (slInput) {
                    slInput.value = sl;
                    slInput.readOnly = true;
                    slInput.classList.add('cursor-not-allowed', 'opacity-70');
                }
                if (costInput) costInput.value = cost;
                if (typeInput) {
                    typeInput.value = type;
                    typeInput.readOnly = !!libItem.actionType;
                    typeInput.classList.toggle('cursor-not-allowed', !!libItem.actionType);
                    typeInput.classList.toggle('opacity-70', !!libItem.actionType);
                }
                e.target.setAttribute('data-was-matched', 'true');
            }
        } 
        
        if (field === 'equipment' && window.flatWeaponsLibrary && window.flatWeaponsLibrary[searchKey]) {
            e.target.classList.add('lib-matched');
            if (tooltipBox && tooltipBox.classList.contains('tooltip-box')) {
                const weaponData = window.flatWeaponsLibrary[searchKey];
                let extraTooltipInfo = '';
                if (weaponData.type || weaponData.weight) {
                    const combined = [
                        weaponData.type ? `Тип: ${weaponData.type}` : '',
                        weaponData.weight ? `Вес: ${weaponData.weight}` : ''
                    ].filter(Boolean).join(' | ');
                    extraTooltipInfo = `<br><span style="color:#999; font-size:0.75rem; display:block; margin-top:4px;">${escapeHTML(combined)}</span>`;
                }
                tooltipBox.innerHTML = parseEmojis(escapeHTML(weaponData.description)) + extraTooltipInfo;
            }
            isMatched = true;
        }

        if (!isMatched) {
            e.target.classList.remove('lib-matched');
            if (tooltipBox && tooltipBox.classList.contains('tooltip-box')) tooltipBox.innerHTML = '';

            if (field === 'actions') {
                const idx = parseInt(index);
                const wasMatched = e.target.getAttribute('data-was-matched') === 'true';
                const isEmpty = val.trim() === '';

                const slInput = document.querySelector(`input[data-field="actions"][data-index="${idx}"][data-subfield="sl"]`);
                const costInput = document.querySelector(`input[data-field="actions"][data-index="${idx}"][data-subfield="cost"]`);
                const typeInput = document.querySelector(`input[data-field="actions"][data-index="${idx}"][data-subfield="type"]`);

                if (isEmpty || wasMatched) {
                    char.actions[idx].sl = '';
                    char.actions[idx].cost = '';
                    char.actions[idx].type = '';
                    if (slInput) slInput.value = '';
                    if (costInput) costInput.value = '';
                    if (typeInput) typeInput.value = '';
                    e.target.removeAttribute('data-was-matched');
                }

                if (slInput) {
                    slInput.readOnly = false;
                    slInput.classList.remove('cursor-not-allowed', 'opacity-70');
                }
                if (typeInput) {
                    typeInput.readOnly = false;
                    typeInput.classList.remove('cursor-not-allowed', 'opacity-70');
                }
            }
        }
        
        if (field === 'equipment') updateDamageDisplays();
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
            char[field] = value === '' ? '' : Number(value) - buffAmount;
        } 
        else if (['strength', 'dexterity', 'mind'].includes(field)) {
            if (value === '') char[field] = '';
            else {
                let num = (parseInt(value) || 0) - buffAmount;
                char[field] = num > 0 ? '+' + num : num.toString();
            }
            updateDamageDisplays();
            updateActionDisplays();
        }
        else if (e.target.type === 'number') {
            char[field] = value === '' ? '' : Number(value);
            
            if (field === 'exp') {
                const oldLevel = char.level || 1;
                const newLevel = calculateLevel(char.exp);
                
                if (oldLevel !== newLevel) {
                    char.level = newLevel;
                    const levelDisplay = document.getElementById(`level-display-${char.id}`);
                    
                    if (levelDisplay) {
                        levelDisplay.value = char.level;
                        if (newLevel > 1) {
                            levelDisplay.classList.remove('bg-[#161616]', 'border-[#333]', 'text-[#888]');
                            levelDisplay.classList.add('bg-yellow-900/50', 'border-yellow-500', 'text-yellow-400', 'shadow-[0_0_15px_rgba(234,179,8,0.2)]');
                            setTimeout(() => {
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
    if (field && ['hpCurrent', 'enCurrent', 'strsCurrent'].includes(field)) {
        e.preventDefault(); 
        const char = state.characters.find(c => c.id === state.currentCharacterId);
        if (!char) return;

        let value = (Number(e.target.value) || 0) + (e.deltaY < 0 ? 1 : (e.deltaY > 0 ? -1 : 0));
        e.target.value = value;
        char[field] = value - getBuffForStat(char, field);
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
    const char = state.characters.find(c => c.id === state.currentCharacterId);

    if (action === 'export') handleExport();
    else if (action === 'open-modal') { state.isModalOpen = true; render(); }
    else if (action === 'close-modal') { state.isModalOpen = false; render(); }
    else if (action === 'create-new') handleCreateNew();
    else if (action === 'delete-char') handleDelete(actionBtn.getAttribute('data-id'));
    else if (action === 'select-char') {
        state.currentCharacterId = actionBtn.getAttribute('data-id');
        state.isModalOpen = false;
        render();
    }
    else if (action === 'toggle-buffs') { state.showBuffs = !state.showBuffs; render(); }
    else if (action === 'toggle-status' && char) {
        const field = actionBtn.getAttribute('data-field');
        const index = parseInt(actionBtn.getAttribute('data-index'));
        if (char[field] && char[field][index] !== undefined) {
            let nextStatus = ((char[field][index].status || 0) + 1) % 4;
            if (nextStatus === 1) {
                const checkCount = char[field].reduce((c, item) => item.status === 1 ? c + 1 : c, 0);
                if (checkCount >= 5) nextStatus = 2;
            }
            char[field][index].status = nextStatus;
            render();
        }
    }
    else if (action === 'adjust-array' && char) {
        const field = actionBtn.getAttribute('data-field');
        const isAdd = actionBtn.getAttribute('data-add') === 'true';
        const min = parseInt(actionBtn.getAttribute('data-min'));
        const max = parseInt(actionBtn.getAttribute('data-max'));
        
        if (char[field]) {
            if (isAdd && char[field].length < max) {
                const templates = {
                    skills: { name: '', val: '', status: 0 },
                    inventory: { name: '', val: '' },
                    actions: { name: '', sl: '', cost: '', type: '', status: 0 },
                    buffs: { name: '', val: '', stat: '' }
                };
                char[field].push(templates[field] || '');
            } else if (!isAdd && char[field].length > min) {
                char[field].pop();
            }
            render();
        }
    }
    else if (action === 'toggle-st' && char?.savingThrows) {
        const index = parseInt(actionBtn.getAttribute('data-index'));
        char.savingThrows.forEach(st => st.active = false);
        char.savingThrows[index].active = true;
        render();
    }
    else if (action === 'remove-st' && char?.savingThrows) {
        const index = parseInt(actionBtn.getAttribute('data-index'));
        char.savingThrows.splice(index, 1);
        if (char.savingThrows.length === 1) char.savingThrows[0].active = true;
        render();
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
};

render();