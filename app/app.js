(function () {
    'use strict';

    // Cambia esta contraseña cuando la aplicación pase a producción.
    const DELETE_PASSWORD = 'Danfoss2026-';
    const scannerForm = document.getElementById('scanner-form');
    const scannerInput = document.getElementById('scanner-input');
    const scannerStatus = document.getElementById('scanner-status');
    const scannerBadge = document.getElementById('scanner-badge');
    const baseStep = document.getElementById('base-step');
    const baseState = document.getElementById('base-state');
    const resultCard = document.getElementById('result-card');
    const resultEmpty = document.getElementById('result-empty');
    const resultPreview = document.getElementById('result-label-preview');
    const resultCodePreview = document.getElementById('result-code-preview');
    const resultCode = document.getElementById('result-code');
    const resultDetail = document.getElementById('result-detail');
    const printCode = document.getElementById('print-code');
    const saveLabelButton = document.getElementById('save-label');
    const printLabelButton = document.getElementById('print-label');
    const historyList = document.getElementById('history-list');
    
    // Pagination & Filter Elements
    const filterDate = document.getElementById('filter-date');
    const exportExcelButton = document.getElementById('export-excel');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const paginationControls = document.getElementById('pagination-controls');

    let currentBaseScan = '';
    let currentResult = '';
    let scanTimer = null;
    let currentPage = 1;
    let totalPages = 1;

    function setStatus(message, type) {
        scannerStatus.textContent = message;
        scannerStatus.className = 'scanner-status' + (type ? ' status-' + type : '');
    }

    function setBadge(text, active) {
        scannerBadge.innerHTML = '<span class="status-dot"></span> ' + text;
        scannerBadge.classList.toggle('status-active', Boolean(active));
    }

    function normalizeScan(value) {
        return String(value || '').replace(/[\r\n]+/g, '').trim();
    }

    function extractTenDigits(value) {
        return String(value).replace(/[^A-Za-z0-9]/g, '').slice(0, 10);
    }

    function formatLabelCode(value) {
        const normalized = extractTenDigits(value);
        if (normalized.length < 10) return normalized;
        return normalized.slice(0, 3) + '-' + normalized.slice(3, 7) + '-' + normalized.slice(7, 10);
    }

    const LOCAL_DB_KEY = 'paking_sqlite_emulator';
    const ITEMS_PER_PAGE = 5;

    // Emulate SQLite Database locally
    function getLocalDB() {
        try {
            return JSON.parse(localStorage.getItem(LOCAL_DB_KEY) || '[]');
        } catch {
            return [];
        }
    }

    function saveLocalDB(data) {
        localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(data));
    }

    function loadHistory(page = 1) {
        try {
            const dateVal = filterDate.value;
            let data = getLocalDB();
            
            // Filter by date
            if (dateVal) {
                data = data.filter(item => item.created_at.startsWith(dateVal));
            }
            
            // Sort DESC
            data.sort((a, b) => b.id - a.id);
            
            const total = data.length;
            const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;
            currentPage = page > totalPages ? totalPages : (page < 1 ? 1 : page);
            
            const offset = (currentPage - 1) * ITEMS_PER_PAGE;
            const paginatedData = data.slice(offset, offset + ITEMS_PER_PAGE);
            
            renderHistory(paginatedData);
            
            if (totalPages > 1) {
                paginationControls.style.display = 'flex';
                pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
                prevPageBtn.disabled = currentPage <= 1;
                nextPageBtn.disabled = currentPage >= totalPages;
            } else {
                paginationControls.style.display = 'none';
            }
        } catch (error) {
            console.error(error);
            historyList.innerHTML = '<p class="empty-state">Error cargando lecturas.</p>';
        }
    }

    function addHistory(fullCode, formattedCode) {
        try {
            const db = getLocalDB();
            const newId = db.length > 0 ? Math.max(...db.map(i => i.id)) + 1 : 1;
            
            // Generate local timestamp like SQLite datetime('now', 'localtime')
            const now = new Date();
            const localDateTime = now.getFullYear() + '-' + 
                                  String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                                  String(now.getDate()).padStart(2, '0') + ' ' + 
                                  String(now.getHours()).padStart(2, '0') + ':' + 
                                  String(now.getMinutes()).padStart(2, '0') + ':' + 
                                  String(now.getSeconds()).padStart(2, '0');

            db.push({
                id: newId,
                full_code: fullCode,
                formatted_code: formattedCode,
                created_at: localDateTime
            });
            saveLocalDB(db);
            
            currentPage = 1;
            loadHistory(currentPage);
        } catch (error) {
            console.error(error);
            window.alert('Error guardando la etiqueta.');
        }
    }

    function formatDate(value) {
        return new Intl.DateTimeFormat('es-MX', {
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(new Date(value.replace(' ', 'T')));
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character];
        });
    }

    function renderHistory(historyArray) {
        if (!historyArray || !historyArray.length) {
            historyList.innerHTML = '<p class="empty-state">Todavía no hay lecturas registradas para esta vista.</p>';
            return;
        }
        historyList.innerHTML = historyArray.map(function (item) {
            const barcodeId = 'history-barcode-' + item.id;
            window.setTimeout(function () {
                renderBarcode(barcodeId, item.formatted_code);
            }, 0);
            return '<article class="history-item">' +
                '<div class="history-label">' +
                '<div style="margin-bottom: 5px; font-size: 0.85rem; color: #666;">Completa: ' + escapeHtml(item.full_code) + '</div>' +
                '<strong>' + escapeHtml(item.formatted_code) + '</strong>' +
                '<svg id="' + barcodeId + '" aria-label="Código de barras ' + escapeHtml(item.formatted_code) + '"></svg>' +
                '</div>' +
                '<div class="history-actions">' +
                '<span class="history-time">' + escapeHtml(formatDate(item.created_at)) + '</span>' +
                '<button class="button button-small print-history" type="button" data-code="' +
                escapeHtml(item.formatted_code) + '">Imprimir</button>' +
                '<button class="button button-small delete-history" type="button" data-id="' +
                item.id + '">Eliminar</button>' +
                '</div>' +
                '</article>';
        }).join('');

        historyList.querySelectorAll('.print-history').forEach(function (button) {
            button.addEventListener('click', function () {
                printSingleLabel(button.dataset.code);
            });
        });
        historyList.querySelectorAll('.delete-history').forEach(function (button) {
            button.addEventListener('click', function () {
                deleteHistoryItem(Number(button.dataset.id));
            });
        });
    }

    function deleteHistoryItem(id) {
        const password = window.prompt('Ingresa la contraseña para eliminar esta etiqueta:');
        if (password === null) return;
        if (password !== DELETE_PASSWORD) {
            window.alert('Contraseña incorrecta. La etiqueta no se eliminó.');
            return;
        }
        try {
            let db = getLocalDB();
            db = db.filter(item => item.id !== id);
            saveLocalDB(db);
            loadHistory(currentPage);
        } catch (error) {
            window.alert('Error eliminando la etiqueta.');
        }
    }

    function renderBarcode(elementId, value) {
        if (typeof JsBarcode === 'undefined') {
            setStatus('No se pudo cargar el generador de código de barras.', 'error');
            return;
        }
        JsBarcode('#' + elementId, value, {
            format: 'CODE128',
            displayValue: false,
            height: 54,
            width: 2,
            margin: 0,
            background: '#ffffff',
            lineColor: '#111111'
        });
    }

    function showResult() {
        const result = formatLabelCode(currentBaseScan);
        if (result.length < 10) {
            setStatus('La lectura base no contiene al menos 10 caracteres utilizables.', 'error');
            return false;
        }
        resultEmpty.classList.add('is-hidden');
        resultPreview.classList.remove('is-hidden');
        resultCodePreview.textContent = result;
        resultCode.textContent = result;
        printCode.textContent = result;
        resultDetail.textContent = 'Generado únicamente con los primeros 10 dígitos de la primera etiqueta de base.png.';
        resultCard.classList.remove('is-hidden');
        renderBarcode('result-barcode-preview', result);
        renderBarcode('print-barcode', result);
        currentResult = result;
        saveLabelButton.disabled = false;
        setBadge('RESULTADO LISTO', true);
        setStatus('Resultado listo. Presiona Guardar etiqueta o Imprimir etiqueta.', 'success');
        return true;
    }

    function resetFlow() {
        currentBaseScan = '';
        baseState.textContent = 'PENDIENTE';
        baseStep.classList.add('step-active');
        baseStep.classList.remove('step-done');
        scannerInput.value = '';
        resultCard.classList.add('is-hidden');
        resultPreview.classList.add('is-hidden');
        resultEmpty.classList.remove('is-hidden');
        currentResult = '';
        saveLabelButton.disabled = true;
        setBadge('LISTO', false);
        setStatus('Listo para escanear.');
        scannerInput.focus();
    }

    function printSingleLabel(code) {
        printCode.textContent = code;
        renderBarcode('print-barcode', code);
        window.print();
    }

    function processScan(value) {
        const scan = normalizeScan(value);
        if (!scan) return;
        if (!currentBaseScan) {
            currentBaseScan = scan;
            baseState.textContent = 'LEÍDA';
            baseStep.classList.remove('step-active');
            baseStep.classList.add('step-done');
            if (showResult()) {
                // Etiqueta procesada
                const result = formatLabelCode(currentBaseScan);
                //currentBaseScan = '';
                baseState.textContent = 'LISTA';
                baseStep.classList.remove('step-done');
                baseStep.classList.add('step-active');
                setBadge('LISTO', true);
                setStatus('Etiqueta creada. Lista para escanear otra.', 'success');
            }
        }
        scannerInput.value = '';
        scannerInput.focus();
    }

    scannerForm.addEventListener('submit', function (event) {
        event.preventDefault();
        processScan(scannerInput.value);
    });

    scannerInput.addEventListener('input', function () {
        window.clearTimeout(scanTimer);
        scanTimer = window.setTimeout(function () {
            if (scannerInput.value.trim()) processScan(scannerInput.value);
        }, 120);
    });

    document.getElementById('reset-flow').addEventListener('click', resetFlow);
    
    saveLabelButton.addEventListener('click', function () {
        if (!currentResult || !currentBaseScan) return;
        addHistory(currentBaseScan, currentResult);
        saveLabelButton.disabled = true;
        // resetear currentBaseScan despues de guardar
        currentBaseScan = '';
        setStatus('Etiqueta guardada en el listado.', 'success');
    });
    
    printLabelButton.addEventListener('click', function () {
        window.print();
    });
    
    document.getElementById('clear-history').addEventListener('click', function () {
        const password = window.prompt('Ingresa la contraseña para limpiar el listado:');
        if (password === null) return;
        if (password !== DELETE_PASSWORD) {
            window.alert('Contraseña incorrecta. El listado no se limpió.');
            return;
        }
        try {
            saveLocalDB([]);
            currentPage = 1;
            loadHistory(currentPage);
            setStatus('Listado limpiado correctamente.', 'success');
        } catch (error) {
            window.alert('Error limpiando el listado.');
        }
    });

    filterDate.addEventListener('change', function () {
        historyList.innerHTML = '<p class="empty-state">Buscando etiquetas, por favor espera...</p>';
        window.setTimeout(function () {
            currentPage = 1;
            loadHistory(currentPage);
        }, 400);
    });

    prevPageBtn.addEventListener('click', function () {
        if (currentPage > 1) {
            loadHistory(currentPage - 1);
        }
    });

    nextPageBtn.addEventListener('click', function () {
        if (currentPage < totalPages) {
            loadHistory(currentPage + 1);
        }
    });

    exportExcelButton.addEventListener('click', async function () {
        const password = window.prompt('Ingresa la contraseña para exportar las etiquetas:');
        if (password === null) return;
        if (password !== DELETE_PASSWORD) {
            window.alert('Contraseña incorrecta. No se puede exportar.');
            return;
        }
        
        try {
            let data = getLocalDB();
            
            // Filter by date
            const dateVal = filterDate.value;
            if (dateVal) {
                data = data.filter(item => item.created_at.startsWith(dateVal));
            }
            
            if (!data || !data.length) {
                window.alert('No hay etiquetas en la fecha seleccionada para exportar.');
                return;
            }
            
            if (typeof ExcelJS === 'undefined') {
                window.alert('La libreria de ExcelJS no se pudo cargar. Revisa la conexion a Internet.');
                return;
            }
            
            // Generar Excel con imagenes usando ExcelJS
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Etiquetas');
            
            worksheet.columns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'Código Completo', key: 'full_code', width: 25 },
                { header: 'Código Formateado', key: 'formatted_code', width: 25 },
                { header: 'Fecha de Creación', key: 'created_at', width: 25 },
                { header: 'Código de Barras', key: 'barcode', width: 40 }
            ];
            
            data.forEach((item, index) => {
                const rowIndex = index + 2; // header is at row 1
                worksheet.addRow({
                    id: item.id,
                    full_code: item.full_code,
                    formatted_code: item.formatted_code,
                    created_at: item.created_at
                });
                
                // Hacer la fila más alta para que quepa la imagen
                worksheet.getRow(rowIndex).height = 60;
                
                // Generar codigo de barras en un canvas oculto
                const canvas = document.createElement('canvas');
                JsBarcode(canvas, item.formatted_code, {
                    format: 'CODE128',
                    displayValue: false,
                    height: 50,
                    width: 2,
                    margin: 0,
                    background: '#ffffff',
                    lineColor: '#111111'
                });
                
                // Agregar imagen al libro
                const base64Image = canvas.toDataURL('image/png');
                const imageId = workbook.addImage({
                    base64: base64Image,
                    extension: 'png',
                });
                
                // Insertar imagen en la celda
                worksheet.addImage(imageId, {
                    tl: { col: 4, row: rowIndex - 1 }, // Columna 4 (0-index, entonces es la 5ta), Fila actual - 1 (0-index)
                    ext: { width: 150, height: 50 }
                });
            });
            
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Etiquetas_Paking.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error(error);
            window.alert('Error exportando las etiquetas a Excel.');
        }
    });

    // Init date filter
    const now = new Date();
    filterDate.value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

    loadHistory(1);
    resetFlow();
}());
