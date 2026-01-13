// ==================== ZEROBOT MANAGER ====================

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
        
        profileItem.innerHTML = `
            <div class="profile-header">
                <span class="profile-name">${profileName}</span>
                <span class="profile-count">${itemCount} itens</span>
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
                <span class="profile-name">${profileName}</span>
                <span class="profile-count">${itemCount} itens</span>
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
        
        profileItem.innerHTML = `
            <div class="profile-header">
                <span class="profile-name">${profileName}</span>
                <span class="profile-count">${itemCount} itens</span>
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
    const btnSortTargetting = document.getElementById('btnSortTargetting');

    if (btnSortScripts) {
        btnSortScripts.addEventListener('click', () => sortEnabledScripts());
    }
    if (btnSortTargetting) {
        btnSortTargetting.addEventListener('click', () => sortTargettingList());
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

// Complexidade: O(n*m log m) - Ordenação de targetting list
function sortTargettingList() {
    const fileIndex = zerobotFilesData.findIndex(f => f !== null);
    if (fileIndex === -1) return;

    const data = zerobotFilesData[fileIndex];
    if (!data.targeting || !data.targeting.list) return;

    // Ordenar cada profile dentro de targetting.list pelo campo "name"
    data.targeting.list.forEach(profile => {
        if (Array.isArray(profile)) {
            profile.sort((a, b) => {
                const nameA = (a.name || '').toLowerCase();
                const nameB = (b.name || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });
        }
    });

    renderTargettingProfiles(data.targeting, fileIndex);
    showNotification('Targetting list ordenado alfabeticamente!', 'success');
}

// Complexidade: O(1) - Setup de drag and drop
function setupZerobotDragAndDrop() {
    // Será implementado para copiar profiles entre arquivos
    // Mantendo sincronização entre list, profileKeys, profileModifiers, profileNames
}
