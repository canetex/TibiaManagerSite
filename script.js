/*
 * Top 5 Funções Mais Complexas (por ordem de complexidade):
 * 1. handleFileUpload - O(n) onde n = tamanho do arquivo JSON
 * 2. renderDualFileEditor - O(n) onde n = número total de perfis em ambos os arquivos
 * 3. renderDualFileProfiles - O(n) onde n = número de perfis no arquivo
 * 4. renderHotkeySets - O(n) onde n = número de perfis em hotkeySets
 * 5. copyProfile - O(n) onde n = tamanho do perfil a ser copiado
 */

// Complexidade: O(1) - Acesso direto
const CHANNELS = {
    2: 'Tutor Channel',
    3: 'World Chat',
    4: 'English Chat',
    5: 'Advertising Channel',
    6: 'Advertising-Rookgaard Channel',
    7: 'Help Channel'
};

// Estado da aplicação
let filesData = [null, null];
let currentFileIndex = 0;

// Estado da aplicação para Char Configurator
let charFileData = null;
let defaultItemPrices = null;

// Estado da aplicação para ZeroBot Manager
let zerobotFilesData = [null, null];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeUpload();
    initializeEditor();
    initializeModal();
    initializeCharConfigurator();
    loadDefaultItemPrices();
    initializeZerobotManager();
    initializeCavebotEditor();
});

// Complexidade: O(1) - Event listeners simples
function initializeUpload() {
    const uploadAreas = [document.getElementById('uploadArea1'), document.getElementById('uploadArea2')];
    const fileInputs = [document.getElementById('fileInput1'), document.getElementById('fileInput2')];
    const removeButtons = [document.getElementById('removeFile1'), document.getElementById('removeFile2')];

    uploadAreas.forEach((area, index) => {
        const fileInput = fileInputs[index];
        const uploadBox = document.getElementById(`uploadBox${index + 1}`);

        // Click para upload
        area.addEventListener('click', () => fileInput.click());

        // Drag and drop
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.add('dragover');
        });

        area.addEventListener('dragleave', () => {
            area.classList.remove('dragover');
        });

        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'application/json') {
                handleFileUpload(file, index);
            }
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                handleFileUpload(e.target.files[0], index);
            }
        });
    });

    // Remove buttons
    removeButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            removeFile(index);
        });
    });
}

// Complexidade: O(n) - n = tamanho do arquivo JSON
async function handleFileUpload(file, index) {
    try {
        const text = await file.text();
        const json = JSON.parse(text);
        
        filesData[index] = {
            data: json,
            fileName: file.name
        };

        updateFileUI(index, file.name);
        updateEditor();
        
        // Resetar o input file para permitir selecionar o mesmo arquivo novamente
        const fileInput = document.getElementById(`fileInput${index + 1}`);
        if (fileInput) {
            fileInput.value = '';
        }
    } catch (error) {
        alert('Erro ao processar arquivo JSON: ' + error.message);
        // Resetar o input mesmo em caso de erro
        const fileInput = document.getElementById(`fileInput${index + 1}`);
        if (fileInput) {
            fileInput.value = '';
        }
    }
}

// Complexidade: O(1) - Atualização de UI simples
function updateFileUI(index, fileName) {
    const uploadArea = document.getElementById(`uploadArea${index + 1}`);
    const fileInfo = document.getElementById(`fileInfo${index + 1}`);
    const fileNameSpan = document.getElementById(`fileName${index + 1}`);

    uploadArea.style.display = 'none';
    fileInfo.style.display = 'flex';
    fileNameSpan.textContent = fileName;
}

// Complexidade: O(1) - Atualização de UI simples
function removeFile(index) {
    filesData[index] = null;
    const uploadArea = document.getElementById(`uploadArea${index + 1}`);
    const fileInfo = document.getElementById(`fileInfo${index + 1}`);
    const fileInput = document.getElementById(`fileInput${index + 1}`);

    uploadArea.style.display = 'block';
    fileInfo.style.display = 'none';
    
    // Resetar o input file
    if (fileInput) {
        fileInput.value = '';
    }

    updateEditor();
}

// Complexidade: O(1) - Verificação simples
function updateEditor() {
    const editorContainer = document.getElementById('editorContainer');
    const singleFileEditor = document.getElementById('singleFileEditor');
    const dualFileEditor = document.getElementById('dualFileEditor');

    const fileCount = filesData.filter(f => f !== null).length;

    if (fileCount === 0) {
        editorContainer.style.display = 'none';
        return;
    }

    editorContainer.style.display = 'block';

    if (fileCount === 1) {
        singleFileEditor.style.display = 'block';
        dualFileEditor.style.display = 'none';
        currentFileIndex = filesData[0] !== null ? 0 : 1;
        renderSingleFileEditor();
    } else {
        singleFileEditor.style.display = 'none';
        dualFileEditor.style.display = 'block';
        renderDualFileEditor();
    }
}

// Complexidade: O(n) - n = número de perfis em hotkeySets
function renderSingleFileEditor() {
    const fileData = filesData[currentFileIndex];
    if (!fileData) return;

    const json = fileData.data;

    // Render hotkey sets
    renderHotkeySets(json);

    // Render chat settings
    renderChatSettings(json);

    // Render action bar settings
    renderActionBarSettings(json);

    // Render general settings
    renderGeneralSettings(json);

    // Render channels
    renderChannels(json);
}

// Complexidade: O(n) - n = número de perfis
function renderHotkeySets(json) {
    const profileList = document.getElementById('profileList');
    profileList.innerHTML = '';

    const hotkeySets = json?.hotkeyOptions?.hotkeySets || {};

    Object.keys(hotkeySets).forEach(profileName => {
        const profileItem = document.createElement('div');
        profileItem.className = 'profile-item';
        profileItem.innerHTML = `
            <span class="profile-name">${profileName}</span>
            <button class="btn-delete-profile" data-profile="${profileName}">🗑️</button>
        `;

        const deleteBtn = profileItem.querySelector('.btn-delete-profile');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteProfile(profileName);
        });

        profileList.appendChild(profileItem);
    });
}

// Complexidade: O(1) - Operação de delete simples
function deleteProfile(profileName) {
    if (confirm(`Tem certeza que deseja excluir o perfil "${profileName}"?`)) {
        const fileData = filesData[currentFileIndex];
        if (fileData && fileData.data.hotkeyOptions?.hotkeySets) {
            delete fileData.data.hotkeyOptions.hotkeySets[profileName];
            
            // Se era o perfil atual, limpar referência
            if (fileData.data.hotkeyOptions.currentHotkeySetName === profileName) {
                const firstProfile = Object.keys(fileData.data.hotkeyOptions.hotkeySets)[0];
                if (firstProfile) {
                    fileData.data.hotkeyOptions.currentHotkeySetName = firstProfile;
                }
            }

            renderHotkeySets(fileData.data);
        }
    }
}

// Complexidade: O(1) - Atualização simples
function renderChatSettings(json) {
    const chatEnabled = document.getElementById('chatEnabled');
    const npcMessagesEnabled = document.getElementById('npcMessagesEnabled');

    chatEnabled.checked = json?.options?.ChatEnabled || false;
    npcMessagesEnabled.checked = json?.options?.NpcMessageseEnabled || false;

    chatEnabled.addEventListener('change', (e) => {
        if (filesData[currentFileIndex]) {
            if (!filesData[currentFileIndex].data.options) {
                filesData[currentFileIndex].data.options = {};
            }
            filesData[currentFileIndex].data.options.ChatEnabled = e.target.checked;
        }
    });

    npcMessagesEnabled.addEventListener('change', (e) => {
        if (filesData[currentFileIndex]) {
            if (!filesData[currentFileIndex].data.options) {
                filesData[currentFileIndex].data.options = {};
            }
            filesData[currentFileIndex].data.options.NpcMessageseEnabled = e.target.checked;
        }
    });
}

// Complexidade: O(1) - Atualização simples
function renderActionBarSettings(json) {
    const options = json?.options || {};
    
    // Lock Action Bars (usa actionBarBottomLocked como referência principal)
    const lockActionBars = document.getElementById('lockActionBars');
    lockActionBars.checked = options.actionBarBottomLocked || false;
    lockActionBars.onchange = (e) => {
        if (filesData[currentFileIndex]) {
            if (!filesData[currentFileIndex].data.options) {
                filesData[currentFileIndex].data.options = {};
            }
            const locked = e.target.checked;
            filesData[currentFileIndex].data.options.actionBarBottomLocked = locked;
            filesData[currentFileIndex].data.options.actionBarLeftLocked = locked;
            filesData[currentFileIndex].data.options.actionBarRightLocked = locked;
        }
    };

    // Show Action Bar 1 (usa actionBarShowBottom1)
    const showActionBar1 = document.getElementById('showActionBar1');
    showActionBar1.checked = options.actionBarShowBottom1 !== false;
    showActionBar1.onchange = (e) => {
        if (filesData[currentFileIndex]) {
            if (!filesData[currentFileIndex].data.options) {
                filesData[currentFileIndex].data.options = {};
            }
            filesData[currentFileIndex].data.options.actionBarShowBottom1 = e.target.checked;
        }
    };

    // Show Action Bar 2 (usa actionBarShowBottom2)
    const showActionBar2 = document.getElementById('showActionBar2');
    showActionBar2.checked = options.actionBarShowBottom2 !== false;
    showActionBar2.onchange = (e) => {
        if (filesData[currentFileIndex]) {
            if (!filesData[currentFileIndex].data.options) {
                filesData[currentFileIndex].data.options = {};
            }
            filesData[currentFileIndex].data.options.actionBarShowBottom2 = e.target.checked;
        }
    };

    // Show Amount
    const showAmount = document.getElementById('showAmount');
    showAmount.checked = options.actionButtonShowAmount !== false;
    showAmount.onchange = (e) => {
        if (filesData[currentFileIndex]) {
            if (!filesData[currentFileIndex].data.options) {
                filesData[currentFileIndex].data.options = {};
            }
            filesData[currentFileIndex].data.options.actionButtonShowAmount = e.target.checked;
        }
    };

    // Show Cooldown
    const showCooldown = document.getElementById('showCooldown');
    showCooldown.checked = options.actionButtonShowGraphicalCooldown !== false;
    showCooldown.onchange = (e) => {
        if (filesData[currentFileIndex]) {
            if (!filesData[currentFileIndex].data.options) {
                filesData[currentFileIndex].data.options = {};
            }
            filesData[currentFileIndex].data.options.actionButtonShowGraphicalCooldown = e.target.checked;
        }
    };

    // Show Cooldown Number
    const showCooldownNumber = document.getElementById('showCooldownNumber');
    showCooldownNumber.checked = options.actionButtonShowCooldownNumbers !== false;
    showCooldownNumber.onchange = (e) => {
        if (filesData[currentFileIndex]) {
            if (!filesData[currentFileIndex].data.options) {
                filesData[currentFileIndex].data.options = {};
            }
            filesData[currentFileIndex].data.options.actionButtonShowCooldownNumbers = e.target.checked;
        }
    };

    // Show Hotkey
    const showHotkey = document.getElementById('showHotkey');
    showHotkey.checked = options.actionButtonShowHotkey !== false;
    showHotkey.onchange = (e) => {
        if (filesData[currentFileIndex]) {
            if (!filesData[currentFileIndex].data.options) {
                filesData[currentFileIndex].data.options = {};
            }
            filesData[currentFileIndex].data.options.actionButtonShowHotkey = e.target.checked;
        }
    };

    // Show Spell Parameters
    const showSpellParameters = document.getElementById('showSpellParameters');
    showSpellParameters.checked = options.actionButtonShowSpellParameters !== false;
    showSpellParameters.onchange = (e) => {
        if (filesData[currentFileIndex]) {
            if (!filesData[currentFileIndex].data.options) {
                filesData[currentFileIndex].data.options = {};
            }
            filesData[currentFileIndex].data.options.actionButtonShowSpellParameters = e.target.checked;
        }
    };
}

// Complexidade: O(1) - Atualização simples
function renderGeneralSettings(json) {
    const options = json?.options || {};

    // Animated Mouse Cursor
    const animatedMouseCursor = document.getElementById('animatedMouseCursor');
    animatedMouseCursor.checked = options.mouseAnimatedCursor || false;
    animatedMouseCursor.onchange = (e) => {
        if (filesData[currentFileIndex]) {
            if (!filesData[currentFileIndex].data.options) {
                filesData[currentFileIndex].data.options = {};
            }
            filesData[currentFileIndex].data.options.mouseAnimatedCursor = e.target.checked;
        }
    };

    // Ask Before Buying Store Products
    const askBeforeBuyingStoreProducts = document.getElementById('askBeforeBuyingStoreProducts');
    askBeforeBuyingStoreProducts.checked = options.storeAskBeforeBuyingProducts || false;
    askBeforeBuyingStoreProducts.onchange = (e) => {
        if (filesData[currentFileIndex]) {
            if (!filesData[currentFileIndex].data.options) {
                filesData[currentFileIndex].data.options = {};
            }
            filesData[currentFileIndex].data.options.storeAskBeforeBuyingProducts = e.target.checked;
        }
    };

    // Highlight Mouse Target
    const highlightMouseTarget = document.getElementById('highlightMouseTarget');
    highlightMouseTarget.checked = options.gameWindowShowTargetHighlight !== false;
    highlightMouseTarget.onchange = (e) => {
        if (filesData[currentFileIndex]) {
            if (!filesData[currentFileIndex].data.options) {
                filesData[currentFileIndex].data.options = {};
            }
            filesData[currentFileIndex].data.options.gameWindowShowTargetHighlight = e.target.checked;
        }
    };

    // Show Cooldown Bar
    const showCooldownBar = document.getElementById('showCooldownBar');
    showCooldownBar.checked = options.cooldownBarEnabled || false;
    showCooldownBar.onchange = (e) => {
        if (filesData[currentFileIndex]) {
            if (!filesData[currentFileIndex].data.options) {
                filesData[currentFileIndex].data.options = {};
            }
            filesData[currentFileIndex].data.options.cooldownBarEnabled = e.target.checked;
        }
    };

    // Control Scheme
    const controlScheme = document.getElementById('controlScheme');
    controlScheme.value = options.controlSchemeIndex !== undefined ? options.controlSchemeIndex.toString() : '0';
    controlScheme.onchange = (e) => {
        if (filesData[currentFileIndex]) {
            if (!filesData[currentFileIndex].data.options) {
                filesData[currentFileIndex].data.options = {};
            }
            filesData[currentFileIndex].data.options.controlSchemeIndex = parseInt(e.target.value);
        }
    };
}

// Complexidade: O(n) - n = número de canais (7)
function renderChannels(json) {
    const channelsContainer = document.getElementById('channelsContainer');
    channelsContainer.innerHTML = '';

    const openChannels = json?.chatOptions?.openChannels || [];

    Object.entries(CHANNELS).forEach(([id, name]) => {
        const channelItem = document.createElement('div');
        channelItem.className = 'channel-item';
        const isActive = openChannels.includes(parseInt(id));
        if (isActive) {
            channelItem.classList.add('active');
        }

        channelItem.innerHTML = `
            <div class="channel-info">
                <div class="channel-name">${name}</div>
                <div class="channel-id">ID: ${id}</div>
            </div>
            <div class="channel-toggle ${isActive ? 'active' : ''}" data-channel-id="${id}"></div>
        `;

        const toggle = channelItem.querySelector('.channel-toggle');
        toggle.addEventListener('click', () => {
            toggleChannel(parseInt(id));
        });

        channelsContainer.appendChild(channelItem);
    });
}

// Complexidade: O(n) - n = número de canais abertos (máximo 7)
function toggleChannel(channelId) {
    const fileData = filesData[currentFileIndex];
    if (!fileData) return;

    if (!fileData.data.chatOptions) {
        fileData.data.chatOptions = {};
    }
    if (!fileData.data.chatOptions.openChannels) {
        fileData.data.chatOptions.openChannels = [];
    }

    const openChannels = fileData.data.chatOptions.openChannels;
    const index = openChannels.indexOf(channelId);

    if (index > -1) {
        openChannels.splice(index, 1);
    } else {
        openChannels.push(channelId);
    }

    renderChannels(fileData.data);
}

// Complexidade: O(1) - Event listeners simples
function initializeEditor() {
    // Copy profile button
    document.getElementById('btnCopyProfile').addEventListener('click', () => {
        openProfileModal(true);
    });

    // Download button
    document.getElementById('btnDownload').addEventListener('click', () => {
        downloadJSON(currentFileIndex);
    });

    // Reset button
    document.getElementById('btnReset').addEventListener('click', () => {
        if (confirm('Tem certeza que deseja resetar todas as alterações?')) {
            const file = filesData[currentFileIndex];
            if (file) {
                // Recarregar arquivo original seria necessário salvar uma cópia
                // Por simplicidade, apenas recarregamos a UI
                renderSingleFileEditor();
            }
        }
    });

    // Dual file download buttons
    document.getElementById('btnDownload1').addEventListener('click', () => {
        downloadJSON(0);
    });

    document.getElementById('btnDownload2').addEventListener('click', () => {
        downloadJSON(1);
    });
}

// Complexidade: O(1) - Abertura de modal simples
function openProfileModal(isCopy) {
    const modal = document.getElementById('profileModal');
    const modalTitle = document.getElementById('modalTitle');
    const copySelect = document.getElementById('copyProfileSelect');
    const copyFromSelect = document.getElementById('copyFromSelect');

    modalTitle.textContent = 'Copiar Perfil';
    copySelect.style.display = 'block';

    copyFromSelect.innerHTML = '';
    const fileData = filesData[currentFileIndex];
    if (fileData && fileData.data.hotkeyOptions?.hotkeySets) {
        Object.keys(fileData.data.hotkeyOptions.hotkeySets).forEach(profileName => {
            const option = document.createElement('option');
            option.value = profileName;
            option.textContent = profileName;
            copyFromSelect.appendChild(option);
        });
    }

    document.getElementById('profileNameInput').value = '';
    modal.classList.add('active');
}

// Complexidade: O(1) - Event listeners simples
function initializeModal() {
    const modal = document.getElementById('profileModal');
    const modalClose = document.getElementById('modalClose');
    const btnCancel = document.getElementById('btnCancelProfile');
    const btnConfirm = document.getElementById('btnConfirmProfile');

    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    btnCancel.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    btnConfirm.addEventListener('click', () => {
        const profileName = document.getElementById('profileNameInput').value.trim();
        const copyFrom = document.getElementById('copyFromSelect').value;

        if (!profileName) {
            alert('Por favor, digite um nome para o perfil.');
            return;
        }

        if (!copyFrom) {
            alert('Por favor, selecione um perfil para copiar.');
            return;
        }

        createProfile(profileName, copyFrom);
        modal.classList.remove('active');
    });

    // Fechar modal ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Complexidade: O(n) - n = tamanho do perfil a ser copiado (se houver)
function createProfile(profileName, copyFrom) {
    const fileData = filesData[currentFileIndex];
    if (!fileData) return;

    if (!fileData.data.hotkeyOptions) {
        fileData.data.hotkeyOptions = {};
    }
    if (!fileData.data.hotkeyOptions.hotkeySets) {
        fileData.data.hotkeyOptions.hotkeySets = {};
    }

    if (fileData.data.hotkeyOptions.hotkeySets[profileName]) {
        alert('Já existe um perfil com este nome.');
        return;
    }

    if (copyFrom && fileData.data.hotkeyOptions.hotkeySets[copyFrom]) {
        // Deep copy do perfil
        fileData.data.hotkeyOptions.hotkeySets[profileName] = JSON.parse(
            JSON.stringify(fileData.data.hotkeyOptions.hotkeySets[copyFrom])
        );
    } else {
        // Criar perfil vazio
        fileData.data.hotkeyOptions.hotkeySets[profileName] = {
            actionBarOptions: {
                mappings: []
            }
        };
    }

    renderHotkeySets(fileData.data);
}

// Complexidade: O(1) - Download simples
function downloadJSON(index) {
    const fileData = filesData[index];
    if (!fileData) return;

    const jsonString = JSON.stringify(fileData.data, null, 4);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileData.fileName || 'clientoptions.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Complexidade: O(n) - n = número total de perfis em ambos os arquivos
function renderDualFileEditor() {
    // Renderizar perfis de ambos os arquivos
    renderDualFileProfiles(0, 'profileList1');
    renderDualFileProfiles(1, 'profileList2');
    
    // Inicializar drag and drop quando dois arquivos estão carregados
    // Usar setTimeout para garantir que o DOM está atualizado
    setTimeout(() => {
        initializeDragAndDrop();
    }, 100);
}

// Complexidade: O(n) - n = número de perfis no arquivo
function renderDualFileProfiles(fileIndex, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const fileData = filesData[fileIndex];
    if (!fileData || !fileData.data.hotkeyOptions?.hotkeySets) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-profiles';
        emptyMsg.textContent = 'Nenhum perfil encontrado';
        container.appendChild(emptyMsg);
        return;
    }

    const hotkeySets = fileData.data.hotkeyOptions.hotkeySets;
    const targetIndex = fileIndex === 0 ? 1 : 0;

    Object.keys(hotkeySets).forEach(profileName => {
        const profileItem = document.createElement('div');
        profileItem.className = 'profile-item-dual';
        profileItem.setAttribute('draggable', 'true');
        profileItem.dataset.profileName = profileName;
        profileItem.dataset.sourceIndex = fileIndex;
        profileItem.dataset.targetIndex = targetIndex;
        
        profileItem.innerHTML = `
            <span class="profile-name">${profileName}</span>
            <span class="drag-hint">⬇️ Arraste</span>
        `;

        // Drag events
        profileItem.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('text/plain', JSON.stringify({
                profileName: profileName,
                sourceIndex: fileIndex,
                targetIndex: targetIndex
            }));
            profileItem.style.opacity = '0.5';
        });

        profileItem.addEventListener('dragend', () => {
            profileItem.style.opacity = '1';
        });

        container.appendChild(profileItem);
    });
}

// Complexidade: O(1) - Event listeners simples
function initializeDragAndDrop() {
    // Configurar drop zones para perfis
    const profileLists = [document.getElementById('profileList1'), document.getElementById('profileList2')];
    
    profileLists.forEach((list, index) => {
        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            list.classList.add('dragover');
        });

        list.addEventListener('dragleave', () => {
            list.classList.remove('dragover');
        });

        list.addEventListener('drop', (e) => {
            e.preventDefault();
            list.classList.remove('dragover');
            
            try {
                const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
                const profileName = dragData.profileName;
                const sourceIndex = parseInt(dragData.sourceIndex);
                const targetIndex = parseInt(dragData.targetIndex);

                if (filesData[sourceIndex] && filesData[targetIndex] && sourceIndex !== targetIndex) {
                    copyProfile(sourceIndex, targetIndex, profileName);
                }
            } catch (error) {
                console.error('Erro ao processar drag and drop:', error);
            }
        });
    });

    // Configurar drop zones para canais
    const channelZones = document.querySelectorAll('.drag-drop-zone[data-type="channels"]');
    
    channelZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            zone.classList.add('dragover');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('dragover');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            
            const sourceIndex = parseInt(zone.dataset.source);
            const targetIndex = parseInt(zone.dataset.target);

            if (filesData[sourceIndex] && filesData[targetIndex] && sourceIndex !== targetIndex) {
                copyChannels(sourceIndex, targetIndex);
            }
        });
    });
}

// Complexidade: O(n) - n = tamanho do perfil a ser copiado
function copyProfile(sourceIndex, targetIndex, profileName) {
    const sourceData = filesData[sourceIndex].data;
    const targetData = filesData[targetIndex].data;

    if (!sourceData.hotkeyOptions?.hotkeySets?.[profileName]) {
        showNotification('Perfil não encontrado no arquivo de origem', 'error');
        return;
    }

    if (!targetData.hotkeyOptions) {
        targetData.hotkeyOptions = {};
    }
    if (!targetData.hotkeyOptions.hotkeySets) {
        targetData.hotkeyOptions.hotkeySets = {};
    }

    // Verificar se o perfil já existe no destino
    let finalProfileName = profileName;
    if (targetData.hotkeyOptions.hotkeySets[profileName]) {
        // Se já existe, adicionar sufixo
        let counter = 1;
        while (targetData.hotkeyOptions.hotkeySets[`${profileName} (${counter})`]) {
            counter++;
        }
        finalProfileName = `${profileName} (${counter})`;
    }

    // Deep copy do perfil
    targetData.hotkeyOptions.hotkeySets[finalProfileName] = JSON.parse(
        JSON.stringify(sourceData.hotkeyOptions.hotkeySets[profileName])
    );

    // Atualizar a lista de perfis
    renderDualFileProfiles(targetIndex, targetIndex === 0 ? 'profileList1' : 'profileList2');
    
    showNotification(`Perfil "${profileName}" copiado como "${finalProfileName}"!`, 'success');
}

// Complexidade: O(n) - n = número de canais (máximo 7)
function copyChannels(sourceIndex, targetIndex) {
    const sourceData = filesData[sourceIndex].data;
    const targetData = filesData[targetIndex].data;

    if (!sourceData.chatOptions?.openChannels) {
        showNotification('Arquivo de origem não possui OpenChannels', 'error');
        return;
    }

    if (!targetData.chatOptions) {
        targetData.chatOptions = {};
    }
    
    // Deep copy dos openChannels
    targetData.chatOptions.openChannels = JSON.parse(
        JSON.stringify(sourceData.chatOptions.openChannels)
    );

    const channelCount = targetData.chatOptions.openChannels.length;
    showNotification(`OpenChannels copiados com sucesso! (${channelCount} canais)`, 'success');
}

// Complexidade: O(1) - Criação de notificação simples
function showNotification(message, type = 'success') {
    // Remove notificação anterior se existir
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animação de entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Remover após 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ==================== TAB NAVIGATION ====================

// Complexidade: O(1) - Event listeners simples
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length === 0 || tabContents.length === 0) {
        console.error('Tabs não encontradas');
        return;
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const targetTab = button.dataset.tab;
            
            if (!targetTab) {
                console.error('Tab sem data-tab attribute');
                return;
            }

            // Remove active class de todos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Adiciona active class ao selecionado
            button.classList.add('active');
            
            const targetElement = document.getElementById(targetTab);
            if (targetElement) {
                targetElement.classList.add('active');
            } else {
                console.error(`Elemento com ID "${targetTab}" não encontrado`);
            }
        });
    });
}

// ==================== PRICE FIXER ====================

// Complexidade: O(1) - Carregamento de arquivo estático
async function loadDefaultItemPrices() {
    try {
        // Tenta carregar de diferentes caminhos possíveis
        let response = await fetch('itemPrices/itemprices.json');
        if (!response.ok) {
            response = await fetch('./itemPrices/itemprices.json');
        }
        if (!response.ok) {
            response = await fetch('itemprices.json');
        }
        
        if (response.ok) {
            defaultItemPrices = await response.json();
        } else {
            console.warn('Arquivo de preços padrão não encontrado');
        }
    } catch (error) {
        console.error('Erro ao carregar preços padrão:', error);
    }
}

// Complexidade: O(1) - Event listeners simples
function initializeCharConfigurator() {
    const charUploadArea = document.getElementById('charUploadArea');
    const charFileInput = document.getElementById('charFileInput');
    const removeCharFileBtn = document.getElementById('removeCharFile');
    const btnDownloadChar = document.getElementById('btnDownloadChar');

    // Click para upload
    charUploadArea.addEventListener('click', () => charFileInput.click());

    // Drag and drop
    charUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        charUploadArea.classList.add('dragover');
    });

    charUploadArea.addEventListener('dragleave', () => {
        charUploadArea.classList.remove('dragover');
    });

    charUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        charUploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/json') {
            handleCharFileUpload(file);
        }
    });

    // File input change
    charFileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleCharFileUpload(e.target.files[0]);
            e.target.value = ''; // Reset para permitir selecionar o mesmo arquivo
        }
    });

    // Remove button
    removeCharFileBtn.addEventListener('click', () => {
        removeCharFile();
    });

    // Download button
    if (btnDownloadChar) {
        btnDownloadChar.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            downloadCharFile();
        });
    }
}

// Complexidade: O(n) - n = tamanho do arquivo JSON + número de itens a mesclar
async function handleCharFileUpload(file) {
    try {
        const text = await file.text();
        const json = JSON.parse(text);

        // Mesclar com os preços padrão
        const mergedData = mergeItemPrices(json);

        charFileData = {
            data: mergedData,
            fileName: file.name
        };

        updateCharFileUI(file.name);
        showNotification('Arquivo processado com sucesso!', 'success');
    } catch (error) {
        alert('Erro ao processar arquivo JSON: ' + error.message);
    }
}

// Complexidade: O(n) - n = número de itens em defaultItemPrices
function mergeItemPrices(userFile) {
    if (!defaultItemPrices) {
        showNotification('Preços padrão não carregados. Usando apenas o arquivo enviado.', 'error');
        return userFile;
    }

    const merged = {
        customSalePrices: { ...userFile.customSalePrices || {} },
        primaryLootValueSources: { ...userFile.primaryLootValueSources || {} }
    };

    // Mesclar customSalePrices (substituir/incluir valores do padrão)
    if (defaultItemPrices.customSalePrices) {
        Object.assign(merged.customSalePrices, defaultItemPrices.customSalePrices);
    }

    // Mesclar primaryLootValueSources (substituir/incluir valores do padrão)
    if (defaultItemPrices.primaryLootValueSources) {
        Object.assign(merged.primaryLootValueSources, defaultItemPrices.primaryLootValueSources);
    }

    return merged;
}

// Complexidade: O(1) - Atualização de UI simples
function updateCharFileUI(fileName) {
    const charUploadArea = document.getElementById('charUploadArea');
    const charFileInfo = document.getElementById('charFileInfo');
    const charFileName = document.getElementById('charFileName');
    const charDownloadSection = document.getElementById('charDownloadSection');

    charUploadArea.style.display = 'none';
    charFileInfo.style.display = 'flex';
    charFileName.textContent = fileName;
    charDownloadSection.style.display = 'block';
}

// Complexidade: O(1) - Atualização de UI simples
function removeCharFile() {
    charFileData = null;
    const charUploadArea = document.getElementById('charUploadArea');
    const charFileInfo = document.getElementById('charFileInfo');
    const charDownloadSection = document.getElementById('charDownloadSection');
    const charFileInput = document.getElementById('charFileInput');

    charUploadArea.style.display = 'block';
    charFileInfo.style.display = 'none';
    charDownloadSection.style.display = 'none';
    charFileInput.value = '';
}

// Complexidade: O(1) - Download simples
function downloadCharFile() {
    if (!charFileData) {
        showNotification('Nenhum arquivo processado para download', 'error');
        return;
    }

    try {
        const jsonString = JSON.stringify(charFileData.data, null, 4);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'itemprices.json';
        a.style.display = 'none';
        document.body.appendChild(a);
        
        // Forçar o download
        setTimeout(() => {
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        }, 10);
        
        showNotification('Download iniciado!', 'success');
    } catch (error) {
        console.error('Erro ao fazer download:', error);
        showNotification('Erro ao fazer download: ' + error.message, 'error');
    }
}
