// ==================== ZEROBOT MANAGER ====================

// Variável global para armazenar profile copiado
let copiedZerobotProfile = null;

// Complexidade: O(1) - Inicialização simples
function initializeZerobotManager() {
    setupZerobotUpload();
    setupZerobotDownload();
    setupZerobotSorting();
    setupZerobotDragAndDrop();
}

// Complexidade: O(1) - Setup de event listeners
function setupZerobotUpload() {
    const fileInput1 = document.getElementById('zerobotFileInput1');
    const fileInput2 = document.getElementById('zerobotFileInput2');
    const removeBtn1 = document.getElementById('removeZerobotFile1');
    const removeBtn2 = document.getElementById('removeZerobotFile2');

    if (fileInput1) {
        fileInput1.addEventListener('change', (e) => handleZerobotFileUpload(e, 0));
    }
    if (fileInput2) {
        fileInput2.addEventListener('change', (e) => handleZerobotFileUpload(e, 1));
    }
    if (removeBtn1) {
        removeBtn1.addEventListener('click', () => removeZerobotFile(0));
    }
    if (removeBtn2) {
        removeBtn2.addEventListener('click', () => removeZerobotFile(1));
    }
}

// Complexidade: O(n) - Parsing do JSON
async function handleZerobotFileUpload(event, fileIndex) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        
        zerobotFilesData[fileIndex] = jsonData;
        
        // Atualizar UI
        updateZerobotFileInfo(fileIndex, file.name);
        updateZerobotEditor();
        
        // Resetar input para permitir upload do mesmo arquivo
        event.target.value = '';
    } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        showNotification('Erro ao processar arquivo: ' + error.message, 'error');
        event.target.value = '';
    }
}

// Complexidade: O(1) - Atualização simples da UI
function updateZerobotFileInfo(fileIndex, fileName) {
    const fileInfo = document.getElementById(`zerobotFileInfo${fileIndex + 1}`);
    const fileNameSpan = document.getElementById(`zerobotFileName${fileIndex + 1}`);
    const uploadArea = document.getElementById(`zerobotUploadArea${fileIndex + 1}`);
    
    if (fileInfo && fileNameSpan && uploadArea) {
        fileNameSpan.textContent = fileName;
        fileInfo.style.display = 'flex';
        uploadArea.style.display = 'none';
    }
}

// Complexidade: O(1) - Remoção simples
function removeZerobotFile(fileIndex) {
    zerobotFilesData[fileIndex] = null;
    
    const fileInput = document.getElementById(`zerobotFileInput${fileIndex + 1}`);
    const fileInfo = document.getElementById(`zerobotFileInfo${fileIndex + 1}`);
    const uploadArea = document.getElementById(`zerobotUploadArea${fileIndex + 1}`);
    
    if (fileInput) fileInput.value = '';
    if (fileInfo) fileInfo.style.display = 'none';
    if (uploadArea) uploadArea.style.display = 'block';
    
    updateZerobotEditor();
}

// Complexidade: O(n) - Renderização baseada no número de arquivos
function updateZerobotEditor() {
    const editorContainer = document.getElementById('zerobotEditorContainer');
    if (!editorContainer) return;

    const fileCount = zerobotFilesData.filter(f => f !== null).length;
    
    if (fileCount === 0) {
        editorContainer.style.display = 'none';
        return;
    }
    
    editorContainer.style.display = 'block';
    
    if (fileCount === 1) {
        document.getElementById('zerobotSingleEditor').style.display = 'block';
        document.getElementById('zerobotDualEditor').style.display = 'none';
        renderZerobotSingleFile(0);
    } else {
        document.getElementById('zerobotSingleEditor').style.display = 'none';
        document.getElementById('zerobotDualEditor').style.display = 'block';
        renderZerobotDualFiles();
    }
}

// Complexidade: O(n) - Renderização de arquivo único
function renderZerobotSingleFile(fileIndex) {
    const data = zerobotFilesData[fileIndex];
    if (!data) return;

    renderEnabledScripts(data.scripting?.enabledScripts || [], fileIndex);
    renderTargettingProfiles(data.targeting, fileIndex);
    renderMagicShooterProfiles(data.magicShooter, fileIndex);
    renderEquipmentProfiles(data.equipment, fileIndex);
    renderHealingProfiles(data.healing, fileIndex);
}

// Complexidade: O(n) - Renderização de dois arquivos
function renderZerobotDualFiles() {
    renderZerobotDualSection('enabledScripts', 'Scripts', 'dragZone1Scripts', 'dragZone2Scripts');
    renderZerobotDualProfiles('targeting', 'Targetting', 'zerobotTargettingList1', 'zerobotTargettingList2');
    renderZerobotDualProfiles('magicShooter', 'Magic Shooter', 'zerobotMagicShooterList1', 'zerobotMagicShooterList2');
    renderZerobotDualProfiles('equipment', 'Equipment', 'zerobotEquipmentList1', 'zerobotEquipmentList2');
    renderZerobotDualProfiles('healing', 'Healing', 'zerobotHealingList1', 'zerobotHealingList2');
}

// Complexidade: O(n) - Renderização de scripts habilitados
function renderEnabledScripts(scripts, fileIndex) {
    const container = document.getElementById('enabledScriptsList');
    if (!container) return;

    container.innerHTML = '';
    
    scripts.forEach((script, index) => {
        const scriptItem = document.createElement('div');
        scriptItem.className = 'script-item';
        scriptItem.textContent = script;
        scriptItem.dataset.index = index;
        container.appendChild(scriptItem);
    });
}

// Complexidade: O(n*m) - Renderização de profiles de targetting
function renderTargettingProfiles(targeting, fileIndex) {
    const container = document.getElementById('targettingProfilesList');
    if (!container || !targeting) return;

    container.innerHTML = '';
    
    const list = targeting.list || [];
    const profileKeys = targeting.profileKeys || [];
    const profileModifiers = targeting.profileModifiers || [];
    const profileNames = targeting.profileNames || [];
    
    const profileCount = Math.min(list.length, profileKeys.length, profileModifiers.length, profileNames.length);
    
    for (let i = 0; i < profileCount; i++) {
        const profileItem = document.createElement('div');
        profileItem.className = 'profile-item';
        profileItem.draggable = true;
        profileItem.dataset.profileIndex = i;
        profileItem.dataset.section = 'targeting';
        profileItem.dataset.fileIndex = fileIndex;
        
        const profileName = profileNames[i] || `Profile ${i + 1}`;
        const itemCount = Array.isArray(list[i]) ? list[i].length : 0;
        
        // Obter lista de nomes de monstros
        const monsterNames = Array.isArray(list[i]) ? list[i].map(item => item.name || 'Unknown').filter(Boolean).join(', ') : '';
        
        profileItem.innerHTML = `
            <div class="profile-header">
                <div class="profile-info">
                    <span class="profile-name" data-editable="true" data-profile-index="${i}" data-section="targeting" data-file-index="${fileIndex}">${profileName}</span>
                    <span class="profile-count">${itemCount} itens</span>
                </div>
                <div class="profile-buttons">
                    <div class="profile-buttons-row profile-buttons-row-large">
                        <button class="btn-icon btn-icon-large" title="Ordenar Alfabeticamente" onclick="sortTargettingProfileList(${i}, ${fileIndex})">🔤</button>
                    </div>
                    <div class="profile-buttons-row profile-buttons-row-medium">
                        <button class="btn-icon btn-icon-medium" title="Renomear" onclick="renameZerobotProfile(${i}, 'targeting', ${fileIndex})">✏️</button>
                        <button class="btn-icon btn-icon-medium btn-danger" title="Excluir Profile" onclick="deleteZerobotProfile(${i}, 'targeting', ${fileIndex})">🗑️</button>
                    </div>
                    <div class="profile-buttons-row">
                        <button class="btn-icon" title="Ver Monstros" onclick="showTargettingMonsters(${i}, ${fileIndex})">👁️</button>
                        <button class="btn-icon" title="Copiar Profile" onclick="copyZerobotProfileContent(${i}, 'targeting', ${fileIndex})">📋</button>
                        <button class="btn-icon" title="Colar Profile" onclick="pasteZerobotProfileContent(${i}, 'targeting', ${fileIndex})">📄</button>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(profileItem);
    }
}

// Complexidade: O(n) - Renderização de profiles genéricos
function renderMagicShooterProfiles(magicShooter, fileIndex) {
    renderGenericProfiles(magicShooter, 'magicShooter', 'magicShooterProfilesList', fileIndex, 'list');
}

function renderEquipmentProfiles(equipment, fileIndex) {
    renderGenericProfiles(equipment, 'equipment', 'equipmentProfilesList', fileIndex, 'equipmentList');
}

function renderHealingProfiles(healing, fileIndex) {
    renderGenericProfiles(healing, 'healing', 'healingProfilesList', fileIndex, 'healingList');
}

// Complexidade: O(n) - Renderização genérica de profiles
function renderGenericProfiles(section, sectionName, containerId, fileIndex, listKey) {
    const container = document.getElementById(containerId);
    if (!container || !section) return;

    container.innerHTML = '';
    
    const list = section[listKey] || [];
    const profileKeys = section.profileKeys || [];
    const profileModifiers = section.profileModifiers || [];
    const profileNames = section.profileNames || [];
    
    const profileCount = Math.min(list.length, profileKeys.length, profileModifiers.length, profileNames.length);
    
    for (let i = 0; i < profileCount; i++) {
        const profileItem = document.createElement('div');
        profileItem.className = 'profile-item';
        profileItem.draggable = true;
        profileItem.dataset.profileIndex = i;
        profileItem.dataset.section = sectionName;
        profileItem.dataset.fileIndex = fileIndex;
        
        const profileName = profileNames[i] || `Profile ${i + 1}`;
        const itemCount = Array.isArray(list[i]) ? list[i].length : 0;
        
        profileItem.innerHTML = `
            <div class="profile-header">
                <div class="profile-info">
                    <span class="profile-name" data-editable="true" data-profile-index="${i}" data-section="${sectionName}" data-file-index="${fileIndex}">${profileName}</span>
                    <span class="profile-count">${itemCount} itens</span>
                </div>
                <div class="profile-buttons">
                    <div class="profile-buttons-row profile-buttons-row-medium">
                        <button class="btn-icon btn-icon-medium" title="Renomear" onclick="renameZerobotProfile(${i}, '${sectionName}', ${fileIndex})">✏️</button>
                        <button class="btn-icon btn-icon-medium btn-danger" title="Excluir Profile" onclick="deleteZerobotProfile(${i}, '${sectionName}', ${fileIndex})">🗑️</button>
                    </div>
                    <div class="profile-buttons-row">
                        <button class="btn-icon" title="Copiar Profile" onclick="copyZerobotProfileContent(${i}, '${sectionName}', ${fileIndex})">📋</button>
                        <button class="btn-icon" title="Colar Profile" onclick="pasteZerobotProfileContent(${i}, '${sectionName}', ${fileIndex})">📄</button>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(profileItem);
    }
}

// Complexidade: O(n) - Renderização de profiles duplos
function renderZerobotDualProfiles(sectionName, displayName, containerId1, containerId2) {
    const container1 = document.getElementById(containerId1);
    const container2 = document.getElementById(containerId2);
    
    if (!container1 || !container2) return;
    
    container1.innerHTML = '';
    container2.innerHTML = '';
    
    const data1 = zerobotFilesData[0];
    const data2 = zerobotFilesData[1];
    
    if (data1 && data1[sectionName]) {
        renderDualProfileList(data1[sectionName], sectionName, container1, 0, sectionName === 'targeting' ? 'list' : (sectionName === 'equipment' ? 'equipmentList' : (sectionName === 'healing' ? 'healingList' : 'list')));
    }
    
    if (data2 && data2[sectionName]) {
        renderDualProfileList(data2[sectionName], sectionName, container2, 1, sectionName === 'targeting' ? 'list' : (sectionName === 'equipment' ? 'equipmentList' : (sectionName === 'healing' ? 'healingList' : 'list')));
    }
}

// Complexidade: O(n) - Renderização de lista de profiles duplos
function renderDualProfileList(section, sectionName, container, fileIndex, listKey) {
    const list = section[listKey] || [];
    const profileKeys = section.profileKeys || [];
    const profileModifiers = section.profileModifiers || [];
    const profileNames = section.profileNames || [];
    
    const profileCount = Math.min(list.length, profileKeys.length, profileModifiers.length, profileNames.length);
    
    for (let i = 0; i < profileCount; i++) {
        const profileItem = document.createElement('div');
        profileItem.className = 'profile-item';
        profileItem.draggable = true;
        profileItem.dataset.profileIndex = i;
        profileItem.dataset.section = sectionName;
        profileItem.dataset.fileIndex = fileIndex;
        
        const profileName = profileNames[i] || `Profile ${i + 1}`;
        const itemCount = Array.isArray(list[i]) ? list[i].length : 0;
        
        // Obter lista de nomes de monstros para targetting
        const monsterNames = (sectionName === 'targeting' && Array.isArray(list[i])) ? 
            list[i].map(item => item.name || 'Unknown').filter(Boolean).join(', ') : '';
        
        profileItem.innerHTML = `
            <div class="profile-header">
                <div class="profile-info">
                    <span class="profile-name" data-editable="true" data-profile-index="${i}" data-section="${sectionName}" data-file-index="${fileIndex}">${profileName}</span>
                    <span class="profile-count">${itemCount} itens</span>
                </div>
                <div class="profile-buttons">
                    ${sectionName === 'targeting' ? `<div class="profile-buttons-row profile-buttons-row-large"><button class="btn-icon btn-icon-large" title="Ordenar Alfabeticamente" onclick="sortTargettingProfileList(${i}, ${fileIndex})">🔤</button></div>` : ''}
                    <div class="profile-buttons-row profile-buttons-row-medium">
                        <button class="btn-icon btn-icon-medium" title="Renomear" onclick="renameZerobotProfile(${i}, '${sectionName}', ${fileIndex})">✏️</button>
                        <button class="btn-icon btn-icon-medium btn-danger" title="Excluir Profile" onclick="deleteZerobotProfile(${i}, '${sectionName}', ${fileIndex})">🗑️</button>
                    </div>
                    <div class="profile-buttons-row">
                        ${sectionName === 'targeting' ? `<button class="btn-icon" title="Ver Monstros" onclick="showTargettingMonsters(${i}, ${fileIndex})">👁️</button>` : ''}
                        <button class="btn-icon" title="Copiar Profile" onclick="copyZerobotProfileContent(${i}, '${sectionName}', ${fileIndex})">📋</button>
                        <button class="btn-icon" title="Colar Profile" onclick="pasteZerobotProfileContent(${i}, '${sectionName}', ${fileIndex})">📄</button>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(profileItem);
    }
}

// Complexidade: O(1) - Setup de download
function setupZerobotDownload() {
    const btnDownload = document.getElementById('btnDownloadZerobot');
    const btnDownload1 = document.getElementById('btnDownloadZerobot1');
    const btnDownload2 = document.getElementById('btnDownloadZerobot2');
    const btnReset = document.getElementById('btnResetZerobot');

    if (btnDownload) {
        btnDownload.addEventListener('click', () => downloadZerobotFile(0));
    }
    if (btnDownload1) {
        btnDownload1.addEventListener('click', () => downloadZerobotFile(0));
    }
    if (btnDownload2) {
        btnDownload2.addEventListener('click', () => downloadZerobotFile(1));
    }
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            zerobotFilesData = [null, null];
            updateZerobotEditor();
            removeZerobotFile(0);
            removeZerobotFile(1);
        });
    }
}

// Complexidade: O(1) - Download de arquivo
function downloadZerobotFile(fileIndex) {
    const data = zerobotFilesData[fileIndex];
    if (!data) {
        showNotification('Nenhum arquivo carregado', 'error');
        return;
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `char_${fileIndex + 1}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Download iniciado!', 'success');
}

// Complexidade: O(1) - Setup de ordenação
function setupZerobotSorting() {
    const btnSortScripts = document.getElementById('btnSortScripts');
    // Removido btnSortTargetting - agora cada profile tem seu próprio botão
    if (btnSortScripts) {
        btnSortScripts.addEventListener('click', () => sortEnabledScripts());
    }
}

// Complexidade: O(n log n) - Ordenação de scripts
function sortEnabledScripts() {
    const fileIndex = zerobotFilesData.findIndex(f => f !== null);
    if (fileIndex === -1) return;

    const data = zerobotFilesData[fileIndex];
    if (!data.scripting || !data.scripting.enabledScripts) return;

    data.scripting.enabledScripts.sort((a, b) => a.localeCompare(b));
    renderEnabledScripts(data.scripting.enabledScripts, fileIndex);
    showNotification('Scripts ordenados alfabeticamente!', 'success');
}

// Complexidade: O(m log m) - Ordenação de targetting list de um profile específico
function sortTargettingProfileList(profileIndex, fileIndex) {
    const data = zerobotFilesData[fileIndex];
    if (!data || !data.targeting || !data.targeting.list) return;

    const profile = data.targeting.list[profileIndex];
    if (!Array.isArray(profile)) return;

    // Ordenar o profile pelo campo "name"
    profile.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
    });

    // Atualizar UI
    const fileCount = zerobotFilesData.filter(f => f !== null).length;
    if (fileCount === 1) {
        renderTargettingProfiles(data.targeting, fileIndex);
    } else {
        renderZerobotDualFiles();
    }
    
    showNotification('Lista ordenada alfabeticamente!', 'success');
}

// Complexidade: O(1) - Setup de drag and drop
function setupZerobotDragAndDrop() {
    // Event listeners para drag and drop de profiles
    document.addEventListener('dragstart', handleZerobotDragStart);
    document.addEventListener('dragover', handleZerobotDragOver);
    document.addEventListener('drop', handleZerobotDrop);
    document.addEventListener('dragend', handleZerobotDragEnd);
    
    // Event listeners para botões de copiar/subscrever
    document.addEventListener('click', (e) => {
        if (e.target.dataset.action === 'copy' || e.target.dataset.action === 'replace') {
            const action = e.target.dataset.action;
            const section = e.target.dataset.section;
            const source = parseInt(e.target.dataset.source);
            const target = parseInt(e.target.dataset.target);
            copyOrReplaceSection(action, section, source, target);
        }
    });
}

// Complexidade: O(1) - Início do drag
function handleZerobotDragStart(e) {
    if (!e.target.classList.contains('profile-item')) return;
    
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({
        profileIndex: parseInt(e.target.dataset.profileIndex),
        section: e.target.dataset.section,
        fileIndex: parseInt(e.target.dataset.fileIndex)
    }));
}

// Complexidade: O(1) - Drag over
function handleZerobotDragOver(e) {
    const profileItem = e.target.closest('.profile-item');
    const profileList = e.target.closest('.profile-list-dual') || e.target.closest('.profile-list');
    
    if (!profileItem && !profileList) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (profileList) {
        profileList.classList.add('drag-over');
    }
    if (profileItem && profileItem !== e.target.closest('.dragging')) {
        profileItem.classList.add('drag-over');
    }
}

// Complexidade: O(n) - Drop
function handleZerobotDrop(e) {
    e.preventDefault();
    
    const dragDataStr = e.dataTransfer.getData('text/plain');
    if (!dragDataStr) return;
    
    const dragData = JSON.parse(dragDataStr);
    if (!dragData) return;
    
    const targetProfileItem = e.target.closest('.profile-item');
    const targetList = e.target.closest('.profile-list-dual') || e.target.closest('.profile-list');
    
    if (!targetList) return;
    
    // Determinar fileIndex do target
    let targetFileIndex;
    if (targetList.dataset.fileIndex !== undefined) {
        targetFileIndex = parseInt(targetList.dataset.fileIndex);
    } else {
        const filePanel = targetList.closest('.file-panel');
        targetFileIndex = filePanel && filePanel.id === 'zerobotFilePanel2' ? 1 : 0;
    }
    
    const targetSection = targetList.dataset.section || dragData.section;
    
    // Se soltou em outro profile do mesmo arquivo e seção, reordenar
    if (targetProfileItem && parseInt(targetProfileItem.dataset.fileIndex) === dragData.fileIndex && 
        targetProfileItem.dataset.section === dragData.section && dragData.fileIndex === targetFileIndex) {
        const targetIndex = parseInt(targetProfileItem.dataset.profileIndex);
        reorderZerobotProfile(dragData.fileIndex, dragData.section, dragData.profileIndex, targetIndex);
    } 
    // Se soltou em lista de arquivo diferente ou seção diferente, copiar profile
    else if (targetFileIndex !== dragData.fileIndex || targetSection !== dragData.section) {
        copyZerobotProfile(dragData.fileIndex, targetFileIndex, dragData.section, dragData.profileIndex);
    }
    // Se soltou na mesma lista mas em posição diferente, reordenar
    else if (targetProfileItem && parseInt(targetProfileItem.dataset.profileIndex) !== dragData.profileIndex) {
        const targetIndex = parseInt(targetProfileItem.dataset.profileIndex);
        reorderZerobotProfile(dragData.fileIndex, dragData.section, dragData.profileIndex, targetIndex);
    }
    
    // Limpar classes
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
}

// Complexidade: O(1) - Fim do drag
function handleZerobotDragEnd(e) {
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
}

// Complexidade: O(n) - Copiar profile mantendo sincronização
function copyZerobotProfile(sourceFileIndex, targetFileIndex, sectionName, profileIndex) {
    const sourceData = zerobotFilesData[sourceFileIndex];
    const targetData = zerobotFilesData[targetFileIndex];
    
    if (!sourceData || !targetData) return;
    
    const sourceSection = sourceData[sectionName];
    if (!sourceSection) return;
    
    const listKey = sectionName === 'targeting' ? 'list' : 
                   (sectionName === 'equipment' ? 'equipmentList' : 
                   (sectionName === 'healing' ? 'healingList' : 'list'));
    
    const sourceList = sourceSection[listKey] || [];
    const sourceProfileKeys = sourceSection.profileKeys || [];
    const sourceProfileModifiers = sourceSection.profileModifiers || [];
    const sourceProfileNames = sourceSection.profileNames || [];
    
    // Verificar se o profile existe
    if (profileIndex >= sourceList.length || 
        profileIndex >= sourceProfileKeys.length ||
        profileIndex >= sourceProfileModifiers.length ||
        profileIndex >= sourceProfileNames.length) {
        showNotification('Profile não encontrado', 'error');
        return;
    }
    
    // Verificar limite de profiles (máximo 10)
    const targetSection = targetData[sectionName] || {};
    const targetList = targetSection[listKey] || [];
    if (targetList.length >= 10) {
        showNotification('Limite de 10 profiles atingido', 'error');
        return;
    }
    
    // Inicializar seções no target se não existirem
    if (!targetData[sectionName]) {
        targetData[sectionName] = {};
    }
    if (!targetData[sectionName][listKey]) {
        targetData[sectionName][listKey] = [];
    }
    if (!targetData[sectionName].profileKeys) {
        targetData[sectionName].profileKeys = [];
    }
    if (!targetData[sectionName].profileModifiers) {
        targetData[sectionName].profileModifiers = [];
    }
    if (!targetData[sectionName].profileNames) {
        targetData[sectionName].profileNames = [];
    }
    
    // Copiar profile mantendo sincronização
    const newProfileName = sourceProfileNames[profileIndex] || `Profile ${targetList.length + 1}`;
    let finalName = newProfileName;
    let counter = 1;
    
    // Verificar se o nome já existe e adicionar sufixo se necessário
    while (targetData[sectionName].profileNames.includes(finalName)) {
        finalName = `${newProfileName} (${counter})`;
        counter++;
    }
    
    // Adicionar ao target mantendo sincronização
    targetData[sectionName][listKey].push(JSON.parse(JSON.stringify(sourceList[profileIndex])));
    targetData[sectionName].profileKeys.push(sourceProfileKeys[profileIndex]);
    targetData[sectionName].profileModifiers.push(sourceProfileModifiers[profileIndex]);
    targetData[sectionName].profileNames.push(finalName);
    
    // Atualizar UI
    renderZerobotDualFiles();
    showNotification(`Profile "${finalName}" copiado com sucesso!`, 'success');
}

// Complexidade: O(n) - Reordenar profile dentro do mesmo grupo
function reorderZerobotProfile(fileIndex, sectionName, fromIndex, toIndex) {
    const data = zerobotFilesData[fileIndex];
    if (!data || !data[sectionName]) return;
    
    const listKey = sectionName === 'targeting' ? 'list' : 
                   (sectionName === 'equipment' ? 'equipmentList' : 
                   (sectionName === 'healing' ? 'healingList' : 'list'));
    
    const section = data[sectionName];
    const list = section[listKey] || [];
    const profileKeys = section.profileKeys || [];
    const profileModifiers = section.profileModifiers || [];
    const profileNames = section.profileNames || [];
    
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || 
        fromIndex >= list.length || toIndex >= list.length) return;
    
    // Mover todos os elementos sincronizados
    const moveArray = (arr, from, to) => {
        const item = arr.splice(from, 1)[0];
        arr.splice(to, 0, item);
    };
    
    moveArray(list, fromIndex, toIndex);
    moveArray(profileKeys, fromIndex, toIndex);
    moveArray(profileModifiers, fromIndex, toIndex);
    moveArray(profileNames, fromIndex, toIndex);
    
    // Atualizar UI
    const fileCount = zerobotFilesData.filter(f => f !== null).length;
    if (fileCount === 1) {
        renderZerobotSingleFile(fileIndex);
    } else {
        renderZerobotDualFiles();
    }
    
    showNotification('Profile reordenado com sucesso!', 'success');
}

// Complexidade: O(n) - Copiar ou subscrever seção inteira
function copyOrReplaceSection(action, sectionName, sourceFileIndex, targetFileIndex) {
    const sourceData = zerobotFilesData[sourceFileIndex];
    const targetData = zerobotFilesData[targetFileIndex];
    
    if (!sourceData || !targetData || !sourceData[sectionName]) {
        showNotification('Dados não encontrados', 'error');
        return;
    }
    
    const listKey = sectionName === 'targeting' ? 'list' : 
                   (sectionName === 'equipment' ? 'equipmentList' : 
                   (sectionName === 'healing' ? 'healingList' : 'list'));
    
    const sourceSection = sourceData[sectionName];
    
    if (action === 'replace') {
        // Subscrever: substituir tudo
        targetData[sectionName] = JSON.parse(JSON.stringify(sourceSection));
        showNotification(`Seção ${sectionName} subscrevida com sucesso!`, 'success');
    } else {
        // Copiar: adicionar todos os profiles
        if (!targetData[sectionName]) {
            targetData[sectionName] = {};
        }
        
        const targetList = targetData[sectionName][listKey] || [];
        const sourceList = sourceSection[listKey] || [];
        
        // Verificar limite
        if (targetList.length + sourceList.length > 10) {
            showNotification('Limite de 10 profiles atingido', 'error');
            return;
        }
        
        // Copiar cada profile
        sourceList.forEach((profile, index) => {
            const profileName = sourceSection.profileNames[index] || `Profile ${targetList.length + 1}`;
            let finalName = profileName;
            let counter = 1;
            
            while (targetData[sectionName].profileNames?.includes(finalName)) {
                finalName = `${profileName} (${counter})`;
                counter++;
            }
            
            if (!targetData[sectionName][listKey]) targetData[sectionName][listKey] = [];
            if (!targetData[sectionName].profileKeys) targetData[sectionName].profileKeys = [];
            if (!targetData[sectionName].profileModifiers) targetData[sectionName].profileModifiers = [];
            if (!targetData[sectionName].profileNames) targetData[sectionName].profileNames = [];
            
            targetData[sectionName][listKey].push(JSON.parse(JSON.stringify(profile)));
            targetData[sectionName].profileKeys.push(sourceSection.profileKeys[index]);
            targetData[sectionName].profileModifiers.push(sourceSection.profileModifiers[index]);
            targetData[sectionName].profileNames.push(finalName);
        });
        
        showNotification(`Seção ${sectionName} copiada com sucesso!`, 'success');
    }
    
    renderZerobotDualFiles();
}

// Complexidade: O(1) - Renomear profile
function renameZerobotProfile(profileIndex, sectionName, fileIndex) {
    const data = zerobotFilesData[fileIndex];
    if (!data || !data[sectionName] || !data[sectionName].profileNames) return;
    
    const currentName = data[sectionName].profileNames[profileIndex] || `Profile ${profileIndex + 1}`;
    const newName = prompt(`Renomear profile:`, currentName);
    
    if (!newName || newName.trim() === '') return;
    
    const trimmedName = newName.trim();
    
    // Verificar se o nome já existe
    if (data[sectionName].profileNames.includes(trimmedName) && 
        data[sectionName].profileNames.indexOf(trimmedName) !== profileIndex) {
        showNotification('Nome já existe! Escolha outro nome.', 'error');
        return;
    }
    
    data[sectionName].profileNames[profileIndex] = trimmedName;
    
    // Atualizar UI
    const fileCount = zerobotFilesData.filter(f => f !== null).length;
    if (fileCount === 1) {
        renderZerobotSingleFile(fileIndex);
    } else {
        renderZerobotDualFiles();
    }
    
    showNotification('Profile renomeado com sucesso!', 'success');
}

// Complexidade: O(n) - Mostrar monstros do targetting profile
function showTargettingMonsters(profileIndex, fileIndex) {
    const data = zerobotFilesData[fileIndex];
    if (!data || !data.targeting || !data.targeting.list) return;
    
    const profile = data.targeting.list[profileIndex];
    if (!Array.isArray(profile)) return;
    
    const modal = document.getElementById('zerobotMonstersModal');
    const modalTitle = document.getElementById('zerobotMonstersModalTitle');
    const monstersList = document.getElementById('zerobotMonstersList');
    const modalClose = document.getElementById('zerobotMonstersModalClose');
    
    if (!modal || !monstersList || !modalTitle) return;
    
    // Obter nome do profile
    const profileName = data.targeting.profileNames?.[profileIndex] || `Profile ${profileIndex + 1}`;
    modalTitle.textContent = `Lista de Monstros - ${profileName}`;
    
    // Popular lista de monstros
    monstersList.innerHTML = '';
    const monsterNames = profile.map(item => item.name || 'Unknown').filter(Boolean);
    
    if (monsterNames.length === 0) {
        monstersList.innerHTML = '<li class="monster-item">Nenhum monstro</li>';
    } else {
        monsterNames.forEach(name => {
            const li = document.createElement('li');
            li.className = 'monster-item';
            li.textContent = name;
            monstersList.appendChild(li);
        });
    }
    
    // Mostrar modal
    modal.classList.add('active');
    
    // Event listener para fechar
    const closeModal = () => {
        modal.classList.remove('active');
    };
    
    if (modalClose) {
        modalClose.onclick = closeModal;
    }
    
    // Fechar ao clicar fora do modal
    const handleClickOutside = (event) => {
        if (event.target === modal) {
            closeModal();
            modal.removeEventListener('click', handleClickOutside);
        }
    };
    modal.addEventListener('click', handleClickOutside);
}

// Complexidade: O(1) - Copiar conteúdo de um profile
function copyZerobotProfileContent(profileIndex, sectionName, fileIndex) {
    const data = zerobotFilesData[fileIndex];
    if (!data || !data[sectionName]) return;
    
    const listKey = sectionName === 'targeting' ? 'list' : 
                   (sectionName === 'equipment' ? 'equipmentList' : 
                   (sectionName === 'healing' ? 'healingList' : 'list'));
    
    const section = data[sectionName];
    const list = section[listKey] || [];
    
    if (profileIndex >= list.length) return;
    
    // Copiar conteúdo do profile (apenas a lista, não as chaves/modificadores/nomes)
    copiedZerobotProfile = {
        content: JSON.parse(JSON.stringify(list[profileIndex])),
        section: sectionName,
        fileIndex: fileIndex,
        profileIndex: profileIndex
    };
    
    showNotification('Profile copiado! Use o botão Colar em outro profile para subscrever.', 'success');
}

// Complexidade: O(1) - Colar conteúdo de um profile em outro
function pasteZerobotProfileContent(profileIndex, sectionName, fileIndex) {
    if (!copiedZerobotProfile) {
        showNotification('Nenhum profile copiado!', 'error');
        return;
    }
    
    if (copiedZerobotProfile.section !== sectionName) {
        showNotification('Apenas profiles da mesma seção podem ser colados!', 'error');
        return;
    }
    
    const data = zerobotFilesData[fileIndex];
    if (!data || !data[sectionName]) return;
    
    const listKey = sectionName === 'targeting' ? 'list' : 
                   (sectionName === 'equipment' ? 'equipmentList' : 
                   (sectionName === 'healing' ? 'healingList' : 'list'));
    
    const section = data[sectionName];
    const list = section[listKey] || [];
    
    if (profileIndex >= list.length) return;
    
    // Confirmar subscrever
    const profileName = section.profileNames?.[profileIndex] || `Profile ${profileIndex + 1}`;
    if (!confirm(`Deseja subscrever o conteúdo do "${profileName}"?`)) {
        return;
    }
    
    // Subscrever conteúdo
    list[profileIndex] = JSON.parse(JSON.stringify(copiedZerobotProfile.content));
    
    // Atualizar UI
    const fileCount = zerobotFilesData.filter(f => f !== null).length;
    if (fileCount === 1) {
        if (sectionName === 'targeting') {
            renderTargettingProfiles(data.targeting, fileIndex);
        } else if (sectionName === 'magicShooter') {
            renderMagicShooterProfiles(data.magicShooter, fileIndex);
        } else if (sectionName === 'equipment') {
            renderEquipmentProfiles(data.equipment, fileIndex);
        } else if (sectionName === 'healing') {
            renderHealingProfiles(data.healing, fileIndex);
        }
    } else {
        renderZerobotDualFiles();
    }
    
    showNotification(`Profile "${profileName}" subscrevido com sucesso!`, 'success');
}

// Complexidade: O(n) - Excluir profile
function deleteZerobotProfile(profileIndex, sectionName, fileIndex) {
    const data = zerobotFilesData[fileIndex];
    if (!data || !data[sectionName]) return;
    
    const listKey = sectionName === 'targeting' ? 'list' : 
                   (sectionName === 'equipment' ? 'equipmentList' : 
                   (sectionName === 'healing' ? 'healingList' : 'list'));
    
    const section = data[sectionName];
    const list = section[listKey] || [];
    const profileKeys = section.profileKeys || [];
    const profileModifiers = section.profileModifiers || [];
    const profileNames = section.profileNames || [];
    
    if (profileIndex < 0 || profileIndex >= list.length) return;
    
    const profileName = profileNames[profileIndex] || `Profile ${profileIndex + 1}`;
    
    // Confirmar exclusão
    if (!confirm(`Deseja realmente excluir o profile "${profileName}"?\n\nEsta ação não pode ser desfeita.`)) {
        return;
    }
    
    // Verificar se é o último profile (mínimo 1 profile)
    if (list.length <= 1) {
        showNotification('Não é possível excluir o último profile!', 'error');
        return;
    }
    
    // Remover profile mantendo sincronização
    list.splice(profileIndex, 1);
    profileKeys.splice(profileIndex, 1);
    profileModifiers.splice(profileIndex, 1);
    profileNames.splice(profileIndex, 1);
    
    // Atualizar UI
    const fileCount = zerobotFilesData.filter(f => f !== null).length;
    if (fileCount === 1) {
        if (sectionName === 'targeting') {
            renderTargettingProfiles(data.targeting, fileIndex);
        } else if (sectionName === 'magicShooter') {
            renderMagicShooterProfiles(data.magicShooter, fileIndex);
        } else if (sectionName === 'equipment') {
            renderEquipmentProfiles(data.equipment, fileIndex);
        } else if (sectionName === 'healing') {
            renderHealingProfiles(data.healing, fileIndex);
        }
    } else {
        renderZerobotDualFiles();
    }
    
    showNotification(`Profile "${profileName}" excluído com sucesso!`, 'success');
}
