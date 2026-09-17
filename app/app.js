(function () {
    'use strict';

    const HISTORY_KEY = 'paking-label-history';
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
    let currentBaseScan = '';
    let currentResult = '';
    let scanTimer = null;

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
        // Tomamos estricamente los primeros 10 caracteres alfanuméricos de la lectura
        return String(value).replace(/[^A-Za-z0-9]/g, '').slice(0, 10);
    }

    function formatLabelCode(value) {
        const normalized = extractTenDigits(value);
        if (normalized.length < 10) return normalized;
        return normalized.slice(0, 3) + '-' + normalized.slice(3, 7) + '-' + normalized.slice(7, 10);
    }

    function getHistory() {
        try {
            const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
            return Array.isArray(history) ? history : [];
        } catch (error) {
            return [];
        }
    }

    function addHistory(result) {
        const history = getHistory();
        history.unshift({
            result: result,
            scannedAt: new Date().toISOString()
        });
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
        renderHistory();
    }

    function formatDate(value) {
        return new Intl.DateTimeFormat('es-MX', {
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(new Date(value));
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character];
        });
    }

    function renderHistory() {
        const history = getHistory();
        if (!history.length) {
            historyList.innerHTML = '<p class="empty-state">Todavía no hay lecturas registradas.</p>';
            return;
        }
        historyList.innerHTML = history.map(function (item, index) {
            const barcodeId = 'history-barcode-' + index;
            window.setTimeout(function () {
                renderBarcode(barcodeId, item.result);
            }, 0);
            return '<article class="history-item">' +
                '<div class="history-label">' +
                '<strong>' + escapeHtml(item.result) + '</strong>' +
                '<svg id="' + barcodeId + '" aria-label="Código de barras ' + escapeHtml(item.result) + '"></svg>' +
                '</div>' +
                '<div class="history-actions">' +
                '<span class="history-time">' + escapeHtml(formatDate(item.scannedAt)) + '</span>' +
                '<button class="button button-small print-history" type="button" data-code="' +
                escapeHtml(item.result) + '">Imprimir</button>' +
                '<button class="button button-small delete-history" type="button" data-index="' +
                index + '">Eliminar</button>' +
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
                deleteHistoryItem(Number(button.dataset.index));
            });
        });
    }

    function deleteHistoryItem(index) {
        const password = window.prompt('Ingresa la contraseña para eliminar esta etiqueta:');
        if (password === null) return;
        if (password !== DELETE_PASSWORD) {
            window.alert('Contraseña incorrecta. La etiqueta no se eliminó.');
            return;
        }
        const history = getHistory();
        if (!history[index]) return;
        history.splice(index, 1);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        renderHistory();
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
                currentBaseScan = '';
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
        if (!currentResult) return;
        addHistory(currentResult);
        saveLabelButton.disabled = true;
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
        localStorage.removeItem(HISTORY_KEY);
        renderHistory();
        setStatus('Listado limpiado correctamente.', 'success');
    });

    renderHistory();
    resetFlow();
}());
