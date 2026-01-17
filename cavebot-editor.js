// Complexidade: O(1) - Variáveis globais para Cavebot Editor
let cavebotFileData = null;

// Complexidade: O(1) - Inicialização do Cavebot Editor
function initializeCavebotEditor() {
    setupCavebotUpload();
    setupCavebotActions();
    setupCavebotModals();
}

// Complexidade: O(1) - Configurar upload de arquivo
function setupCavebotUpload() {
    const fileInput = document.getElementById('cavebotFileInput');
    const uploadArea = document.getElementById('cavebotUploadArea');
    const uploadBox = document.getElementById('cavebotUploadBox');
    const fileInfo = document.getElementById('cavebotFileInfo');
    const fileName = document.getElementById('cavebotFileName');
    const removeBtn = document.getElementById('removeCavebotFile');
    const editorContainer = document.getElementById('cavebotEditorContainer');

    if (!fileInput || !uploadArea) return;

    // Click para abrir seletor de arquivo
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleCavebotFileUpload(files[0]);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleCavebotFileUpload(e.target.files[0]);
        }
    });

    // Remover arquivo
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            cavebotFileData = null;
            fileInput.value = '';
            uploadArea.style.display = 'flex';
            fileInfo.style.display = 'none';
            editorContainer.style.display = 'none';
        });
    }
}

// Complexidade: O(n) - Processar upload de arquivo
function handleCavebotFileUpload(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const content = e.target.result;
            cavebotFileData = JSON.parse(content);
            
            // Validar estrutura básica
            if (!cavebotFileData || !Array.isArray(cavebotFileData.waypoints)) {
                throw new Error('Arquivo inválido: estrutura de waypoints não encontrada');
            }
            
            // Atualizar UI
            document.getElementById('cavebotFileName').textContent = file.name;
            document.getElementById('cavebotUploadArea').style.display = 'none';
            document.getElementById('cavebotFileInfo').style.display = 'flex';
            document.getElementById('cavebotEditorContainer').style.display = 'block';
            
            // Atualizar contador
            updateWaypointCount();
            
            console.log('Arquivo carregado com sucesso:', cavebotFileData);
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            alert('Erro ao processar arquivo: ' + error.message);
        }
    };
    
    reader.onerror = () => {
        alert('Erro ao ler arquivo');
    };
    
    reader.readAsText(file);
}

// Complexidade: O(1) - Atualizar contador de waypoints
function updateWaypointCount() {
    if (cavebotFileData && cavebotFileData.waypoints) {
        document.getElementById('waypointCount').textContent = cavebotFileData.waypoints.length;
    }
}

// Complexidade: O(1) - Configurar ações do editor
function setupCavebotActions() {
    const btnInvert = document.getElementById('btnInvertOrder');
    const btnAddPause = document.getElementById('btnAddPause');
    const btnAddScript = document.getElementById('btnAddScript');
    const btnDownload = document.getElementById('btnDownloadCavebot');
    const btnReset = document.getElementById('btnResetCavebot');

    if (btnInvert) {
        btnInvert.addEventListener('click', invertWaypointOrder);
    }

    if (btnAddPause) {
        btnAddPause.addEventListener('click', () => {
            document.getElementById('cavebotPauseModal').classList.add('active');
        });
    }

    if (btnAddScript) {
        btnAddScript.addEventListener('click', () => {
            document.getElementById('cavebotScriptModal').classList.add('active');
        });
    }

    if (btnDownload) {
        btnDownload.addEventListener('click', downloadCavebotFile);
    }

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (confirm('Deseja resetar todas as alterações?')) {
                location.reload();
            }
        });
    }
}

// Complexidade: O(1) - Configurar modais
function setupCavebotModals() {
    // Modal de pausas
    const pauseModal = document.getElementById('cavebotPauseModal');
    const pauseModalClose = document.getElementById('cavebotPauseModalClose');
    const btnConfirmPause = document.getElementById('btnConfirmPause');
    const btnCancelPause = document.getElementById('btnCancelPause');

    if (pauseModalClose) {
        pauseModalClose.addEventListener('click', () => {
            pauseModal.classList.remove('active');
        });
    }

    if (btnCancelPause) {
        btnCancelPause.addEventListener('click', () => {
            pauseModal.classList.remove('active');
        });
    }

    if (btnConfirmPause) {
        btnConfirmPause.addEventListener('click', () => {
            const interval = parseInt(document.getElementById('pauseInterval').value) || 10;
            const delay = parseInt(document.getElementById('pauseDelay').value) || 1000;
            addPauses(interval, delay);
            pauseModal.classList.remove('active');
        });
    }

    // Modal de scripts
    const scriptModal = document.getElementById('cavebotScriptModal');
    const scriptModalClose = document.getElementById('cavebotScriptModalClose');
    const btnConfirmScript = document.getElementById('btnConfirmScript');
    const btnCancelScript = document.getElementById('btnCancelScript');

    if (scriptModalClose) {
        scriptModalClose.addEventListener('click', () => {
            scriptModal.classList.remove('active');
        });
    }

    if (btnCancelScript) {
        btnCancelScript.addEventListener('click', () => {
            scriptModal.classList.remove('active');
        });
    }

    if (btnConfirmScript) {
        btnConfirmScript.addEventListener('click', () => {
            const script = document.getElementById('scriptContent').value.trim();
            const interval = parseInt(document.getElementById('scriptInterval').value) || 10;
            if (script) {
                addScripts(script, interval);
            } else {
                alert('Por favor, insira um script válido');
            }
            scriptModal.classList.remove('active');
        });
    }

    // Fechar modais ao clicar fora
    window.addEventListener('click', (event) => {
        if (event.target === pauseModal) {
            pauseModal.classList.remove('active');
        }
        if (event.target === scriptModal) {
            scriptModal.classList.remove('active');
        }
    });
}

// Complexidade: O(n) - Inverter ordem dos waypoints
function invertWaypointOrder() {
    if (!cavebotFileData || !cavebotFileData.waypoints) {
        alert('Nenhum arquivo carregado');
        return;
    }

    if (confirm('Deseja inverter a ordem de todos os waypoints?')) {
        cavebotFileData.waypoints.reverse();
        updateWaypointCount();
        alert('Ordem dos waypoints invertida com sucesso!');
    }
}

// Complexidade: O(n) - Adicionar pausas
function addPauses(interval, delay) {
    if (!cavebotFileData || !cavebotFileData.waypoints) {
        alert('Nenhum arquivo carregado');
        return;
    }

    const waypoints = cavebotFileData.waypoints;
    const newWaypoints = [];
    let addedCount = 0;

    for (let i = 0; i < waypoints.length; i++) {
        newWaypoints.push(waypoints[i]);

        // Adicionar pausa após cada intervalo (exceto no último)
        if ((i + 1) % interval === 0 && i < waypoints.length - 1) {
            const previousWaypoint = waypoints[i];
            const pauseWaypoint = {
                "data": `wait(${delay})`,
                "waypointType": 11,
                "x": previousWaypoint.x,
                "y": previousWaypoint.y,
                "z": previousWaypoint.z
            };
            newWaypoints.push(pauseWaypoint);
            addedCount++;
        }
    }

    cavebotFileData.waypoints = newWaypoints;
    updateWaypointCount();
    alert(`Pausas adicionadas: ${addedCount} pausa(s) inserida(s) com sucesso!`);
}

// Complexidade: O(n) - Adicionar scripts
function addScripts(script, interval) {
    if (!cavebotFileData || !cavebotFileData.waypoints) {
        alert('Nenhum arquivo carregado');
        return;
    }

    const waypoints = cavebotFileData.waypoints;
    const newWaypoints = [];
    let addedCount = 0;

    for (let i = 0; i < waypoints.length; i++) {
        newWaypoints.push(waypoints[i]);

        // Adicionar script após cada intervalo (exceto no último)
        if ((i + 1) % interval === 0 && i < waypoints.length - 1) {
            const previousWaypoint = waypoints[i];
            const scriptWaypoint = {
                "data": script,
                "waypointType": 11, // Usando waypointType 11 para scripts também
                "x": previousWaypoint.x,
                "y": previousWaypoint.y,
                "z": previousWaypoint.z
            };
            newWaypoints.push(scriptWaypoint);
            addedCount++;
        }
    }

    cavebotFileData.waypoints = newWaypoints;
    updateWaypointCount();
    alert(`Scripts adicionados: ${addedCount} script(s) inserido(s) com sucesso!`);
}

// Complexidade: O(1) - Download do arquivo editado
function downloadCavebotFile() {
    if (!cavebotFileData) {
        alert('Nenhum arquivo carregado');
        return;
    }

    const jsonString = JSON.stringify(cavebotFileData, null, 4);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cavebot_edited.cb';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCavebotEditor);
} else {
    initializeCavebotEditor();
}
