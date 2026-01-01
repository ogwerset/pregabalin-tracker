/* ===== UI CONTROLLER MODULE ===== */
const UIController = {
    selectedSegments: {
        'chart-gad': true,
        'chart-intraday': true,
        'chart-adhd': true,
        'chart-stacked-area': true,
        'chart-sleep': true,
        'chart-correlation': true,
        'chart-sleep-anxiety': true,
        'chart-rolling-avg': true,
        'chart-weekly': true,
        'chart-positive-vs-negative': true,
        'chart-metrics-by-time': true,
        'report': true
    },
    
    init: function() {
        this.initTheme();
        this.bindEvents();
        this.loadData();
    },
    
    initTheme: function() {
        const saved = localStorage.getItem(CONFIG.THEME_KEY) || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
        this.updateThemeIcon(saved);
    },
    
    updateThemeIcon: function(theme) {
        const icon = document.querySelector('#theme-toggle .theme-icon') || document.getElementById('theme-toggle');
        if (icon) {
            icon.textContent = theme === 'dark' ? '🌙' : '☀️';
        }
        // Update mobile menu icon too
        const navIcon = document.querySelector('#nav-theme-toggle .theme-icon-nav');
        if (navIcon) {
            navIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
        }
    },
    
    toggleTheme: function() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(CONFIG.THEME_KEY, next);
        this.updateThemeIcon(next);
        
        // Update charts theme if ChartRenderer is ready
        if (ChartRenderer.setTheme) {
            ChartRenderer.setTheme(next);
        }
    },
    
    
    switchTab: function(tabId) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab
        const targetTab = document.getElementById(tabId);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        // Update nav
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            }
        });
        
        // Lazy load charts when dashboard tab is shown
        if (tabId === 'tab-dashboard') {
            const plotGad = document.getElementById('plot-gad');
            if (plotGad && (!plotGad.data || plotGad.data.length === 0)) {
                const data = DataStore.load();
                if (data && data.length > 0) {
                    const stats = StatsEngine.computeAll ? StatsEngine.computeAll(data) : null;
                    if (stats && ChartRenderer.renderAllCharts) {
                        ChartRenderer.renderAllCharts(data, stats);
                    }
                }
            }
        }
    },
    
    bindEvents: function() {
        // Helper: Proper touch/click handling to prevent double-firing
        const addTapEvent = (element, handler) => {
            if (!element) return;
            let touchMoved = false;
            let touchStarted = false;
            
            element.addEventListener('touchstart', () => {
                touchMoved = false;
                touchStarted = true;
            }, { passive: true });
            
            element.addEventListener('touchmove', () => {
                touchMoved = true;
            }, { passive: true });
            
            element.addEventListener('touchend', (e) => {
                if (!touchMoved && touchStarted) {
                    e.preventDefault();
                    handler(e);
                }
                touchStarted = false;
            });
            
            // Click only for non-touch devices or as fallback
            element.addEventListener('click', (e) => {
                // Only fire if not a touch device or no touch occurred
                if (!('ontouchstart' in window) || !touchStarted) {
                    handler(e);
                }
            });
        };
        
        // Hamburger menu toggle
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const navTabs = document.getElementById('nav-tabs');
        if (hamburgerBtn && navTabs) {
            addTapEvent(hamburgerBtn, () => {
                navTabs.classList.toggle('open');
            });
            // Close menu when clicking on a tab
            document.querySelectorAll('.nav-tab').forEach(tab => {
                addTapEvent(tab, () => {
                    navTabs.classList.remove('open');
                });
            });
        }
        
        // Theme toggle (header)
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            addTapEvent(themeToggle, () => this.toggleTheme());
        }
        
        // Theme toggle (mobile menu)
        const navThemeToggle = document.getElementById('nav-theme-toggle');
        if (navThemeToggle) {
            addTapEvent(navThemeToggle, () => {
                this.toggleTheme();
                // Close menu after toggle
                const navTabs = document.getElementById('nav-tabs');
                if (navTabs) {
                    navTabs.classList.remove('open');
                }
            });
        }
        
        // Tab navigation (skip theme toggle which has no data-tab)
        document.querySelectorAll('.nav-tab').forEach(btn => {
            if (btn.dataset.tab) { // Only bind if it has a data-tab attribute
                addTapEvent(btn, () => {
                    this.switchTab(btn.dataset.tab);
                });
            }
        });
        
        // Import buttons
        const btnImport = document.getElementById('btn-import');
        const btnAppend = document.getElementById('btn-append');
        if (btnImport) {
            addTapEvent(btnImport, () => this.handleImport('replace'));
        }
        if (btnAppend) {
            addTapEvent(btnAppend, () => this.handleImport('append'));
        }
        
        // CSV upload
        const csvUpload = document.getElementById('csv-upload');
        if (csvUpload) {
            csvUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        document.getElementById('raw-input').value = event.target.result;
                    };
                    reader.readAsText(file);
                }
            });
        }
        
        // Clear data
        const btnClear = document.getElementById('btn-clear');
        if (btnClear) {
            addTapEvent(btnClear, () => {
                if (confirm('Czy na pewno chcesz usunąć wszystkie dane? Ta operacja jest nieodwracalna.')) {
                    if (DataStore.clear) {
                        DataStore.clear();
                        this.showToast('success', 'Dane zostały usunięte');
                        this.refreshDashboard();
                    }
                }
            });
        }
        
        // Export CSV
        const btnExportCSV = document.getElementById('btn-export-csv');
        if (btnExportCSV) {
            addTapEvent(btnExportCSV, () => {
                if (DataStore.exportCSV) {
                    const csv = DataStore.exportCSV();
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'pregabalin-data.csv';
                    a.click();
                    URL.revokeObjectURL(url);
                }
            });
        }
        
        // Print/Export
        const btnPrint = document.getElementById('btn-print');
        const btnExportPNG = document.getElementById('btn-export-png');
        if (btnPrint) {
            addTapEvent(btnPrint, () => this.exportSelected());
        }
        if (btnExportPNG) {
            addTapEvent(btnExportPNG, () => this.exportAllChartsPNG());
        }
        
        // Segment checkboxes - synchronizacja między panel export a checkboxy przy wykresach
        const segmentMapping = {
            'check-chart-gad': 'chart-gad',
            'check-chart-intraday': 'chart-intraday',
            'check-chart-adhd': 'chart-adhd',
            'check-chart-stacked-area': 'chart-stacked-area',
            'check-chart-correlation': 'chart-correlation',
            'check-chart-positive-vs-negative': 'chart-positive-vs-negative',
            'check-chart-metrics-by-time': 'chart-metrics-by-time',
            'check-chart-sleep': 'chart-sleep',
            'check-chart-sleep-anxiety': 'chart-sleep-anxiety',
            'check-chart-rolling-avg': 'chart-rolling-avg',
            'check-chart-weekly': 'chart-weekly',
            'check-report': 'report'
        };
        
        document.querySelectorAll('.export-checkboxes input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const segmentId = segmentMapping[e.target.id] || e.target.id.replace('check-', '');
                this.toggleSegment(segmentId);
                
                // Synchronizuj checkbox przy wykresie jeśli istnieje
                const chartCheckbox = document.getElementById(segmentId.replace('chart-', 'check-'));
                if (chartCheckbox) {
                    chartCheckbox.checked = e.target.checked;
                }
            });
        });
        
        // Checkboxy przy wykresach
        document.querySelectorAll('.chart-controls input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const chartId = e.target.closest('.chart-card')?.id;
                if (chartId) {
                    this.toggleSegment(chartId);
                    
                    // Synchronizuj główny checkbox
                    const mainCheckbox = document.getElementById(`check-${chartId}`);
                    if (mainCheckbox) {
                        mainCheckbox.checked = e.target.checked;
                    }
                }
            });
        });
        
        // Table sorting
        document.querySelectorAll('#data-table th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                if (TableManager.sort) {
                    TableManager.sort(th.dataset.sort);
                }
            });
        });
        
        // Table filters
        const filterDateFrom = document.getElementById('filter-date-from');
        const filterDateTo = document.getElementById('filter-date-to');
        const filterTimeOfDay = document.getElementById('filter-time-of-day');
        
        if (filterDateFrom) {
            filterDateFrom.addEventListener('change', () => {
                if (TableManager.filter) {
                    TableManager.filter({ dateFrom: filterDateFrom.value || null });
                }
            });
        }
        
        if (filterDateTo) {
            filterDateTo.addEventListener('change', () => {
                if (TableManager.filter) {
                    TableManager.filter({ dateTo: filterDateTo.value || null });
                }
            });
        }
        
        if (filterTimeOfDay) {
            filterTimeOfDay.addEventListener('change', () => {
                if (TableManager.filter) {
                    TableManager.filter({ timeOfDay: filterTimeOfDay.value || null });
                }
            });
        }
        
        // Load and save medications
        const medicationsInput = document.getElementById('medications-input');
        const btnSaveMeds = document.getElementById('btn-save-meds');
        const medsFeedback = document.getElementById('meds-feedback');
        
        // Load saved medications
        if (medicationsInput) {
            const savedMeds = localStorage.getItem(CONFIG.MEDS_KEY);
            if (savedMeds) {
                medicationsInput.value = savedMeds;
            }
        }
        
        // Save medications
        if (btnSaveMeds) {
            addTapEvent(btnSaveMeds, () => {
                if (medicationsInput && medicationsInput.value.trim()) {
                    localStorage.setItem(CONFIG.MEDS_KEY, medicationsInput.value.trim());
                    if (medsFeedback) {
                        medsFeedback.style.display = 'block';
                        medsFeedback.style.background = 'rgba(16, 185, 129, 0.1)';
                        medsFeedback.style.border = '1px solid var(--accent-green)';
                        medsFeedback.style.color = 'var(--accent-green)';
                        medsFeedback.textContent = '✓ Ustawienia zapisane';
                        setTimeout(() => {
                            medsFeedback.style.display = 'none';
                        }, 3000);
                    }
                    // Refresh report if it's visible
                    this.refreshDashboard();
                }
            });
        }
    },
    
    handleImport: function(mode) {
        const rawInput = document.getElementById('raw-input');
        const feedback = document.getElementById('import-feedback');
        
        if (!rawInput || !rawInput.value.trim()) {
            this.showToast('error', 'Wprowadź dane do zaimportowania');
            if (feedback) {
                feedback.style.display = 'block';
                feedback.style.background = 'rgba(239, 68, 68, 0.1)';
                feedback.style.border = '1px solid var(--accent-red)';
                feedback.style.color = 'var(--accent-red)';
                feedback.textContent = 'Błąd: Brak danych do zaimportowania';
            }
            return;
        }
        
        // Parsuj dane
        const result = DataParser.parseRAW(rawInput.value);
        
        if (result.errors.length > 0 && result.data.length === 0) {
            // Tylko błędy, brak poprawnych danych
            this.showToast('error', `Nie udało się zaimportować danych. ${result.errors.length} błędów.`);
            if (feedback) {
                feedback.style.display = 'block';
                feedback.style.background = 'rgba(239, 68, 68, 0.1)';
                feedback.style.border = '1px solid var(--accent-red)';
                feedback.style.color = 'var(--accent-red)';
                feedback.innerHTML = `<strong>Błędy walidacji (${result.errors.length}):</strong><br>` + 
                    result.errors.slice(0, 10).join('<br>') + 
                    (result.errors.length > 10 ? `<br>... i ${result.errors.length - 10} więcej` : '');
            }
            return;
        }
        
        // Zapisz dane
        if (mode === 'replace') {
            DataStore.save(result.data);
            this.showToast('success', `Zaimportowano ${result.data.length} wpisów${result.errors.length > 0 ? ` (pominięto ${result.errors.length} błędnych linii)` : ''}`);
        } else {
            const appendResult = DataStore.append(result.data);
            this.showToast('success', `Dodano ${appendResult.added} nowych wpisów${appendResult.duplicates > 0 ? ` (${appendResult.duplicates} duplikatów pominięto)` : ''}${result.errors.length > 0 ? `, pominięto ${result.errors.length} błędnych linii` : ''}`);
        }
        
        // Pokaż feedback z błędami jeśli są
        if (feedback) {
            if (result.errors.length > 0) {
                feedback.style.display = 'block';
                feedback.style.background = 'rgba(245, 158, 11, 0.1)';
                feedback.style.border = '1px solid var(--accent-amber)';
                feedback.style.color = 'var(--accent-amber)';
                feedback.innerHTML = `<strong>Ostrzeżenia (${result.errors.length}):</strong><br>` + 
                    result.errors.slice(0, 5).join('<br>') + 
                    (result.errors.length > 5 ? `<br>... i ${result.errors.length - 5} więcej` : '');
            } else {
                feedback.style.display = 'none';
            }
        }
        
        // Wyczyść input
        rawInput.value = '';
        
        // Odśwież dashboard
        this.refreshDashboard();
    },
    
    showToast: function(type, message) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s reverse';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    },
    
    refreshDashboard: function() {
        const data = DataStore.load ? DataStore.load() : [];
        this.updateDataSummary(data);
        
        // Aktualizuj tabelę
        if (TableManager.render) {
            TableManager.render('data-table', data);
        }
        
        // Aktualizuj raport
        if (data.length > 0 && StatsEngine.computeAll && DoctorReport.generate) {
            const stats = StatsEngine.computeAll(data);
            const reportHTML = DoctorReport.generate(data, stats);
            const reportContainer = document.getElementById('doctor-report');
            if (reportContainer) {
                reportContainer.innerHTML = reportHTML;
            }
        } else {
            const reportContainer = document.getElementById('doctor-report');
            if (reportContainer) {
                reportContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">Brak danych. Zaimportuj dane w zakładce "Import Danych", aby wygenerować raport.</p>';
            }
        }
        
        // Wykresy będą renderowane lazy przy pierwszym pokazaniu tabu Dashboard
    },
    
    updateDataSummary: function(data) {
        const summary = document.getElementById('data-summary');
        if (!summary) return;
        
        if (!data || data.length === 0) {
            summary.innerHTML = '<p style="color: var(--text-secondary);">Brak danych</p>';
            return;
        }
        
        const dates = [...new Set(data.map(d => d.Data))].sort();
        const dateRange = dates.length > 0 
            ? `${dates[0]} - ${dates[dates.length - 1]}`
            : 'Brak';
        
        summary.innerHTML = `
            <p><strong>Liczba pomiarów:</strong> ${data.length}</p>
            <p><strong>Liczba dni:</strong> ${dates.length}</p>
            <p><strong>Okres:</strong> ${dateRange}</p>
            <p><strong>Średnia pomiarów/dzień:</strong> ${(data.length / dates.length).toFixed(1)}</p>
        `;
    },
    
    loadData: function() {
        this.refreshDashboard();
    },
    
    toggleSegment: function(segmentId) {
        if (!this.selectedSegments.hasOwnProperty(segmentId)) return;
        
        this.selectedSegments[segmentId] = !this.selectedSegments[segmentId];
        const el = document.getElementById(segmentId);
        if (el) {
            el.classList.toggle('segment-hidden', !this.selectedSegments[segmentId]);
        }
        
        // Synchronizuj checkboxy
        const mainCheckbox = document.getElementById(`check-${segmentId}`);
        if (mainCheckbox) {
            mainCheckbox.checked = this.selectedSegments[segmentId];
        }
        
        const chartCheckbox = document.querySelector(`#${segmentId} .chart-controls input[type="checkbox"]`);
        if (chartCheckbox) {
            chartCheckbox.checked = this.selectedSegments[segmentId];
        }
    },
    
    exportSelected: function() {
        // Hide unselected segments for print
        Object.entries(this.selectedSegments).forEach(([id, selected]) => {
            const el = document.getElementById(id);
            if (el) {
                if (!selected) {
                    el.setAttribute('data-print-hidden', 'true');
                } else {
                    el.removeAttribute('data-print-hidden');
                }
            }
        });
        
        // Trigger print after a short delay to ensure DOM is updated
        setTimeout(() => {
            window.print();
            
            // Restore after print (browser may not trigger this, but it's safe)
            setTimeout(() => {
                document.querySelectorAll('[data-print-hidden]').forEach(el => {
                    el.removeAttribute('data-print-hidden');
                });
            }, 100);
        }, 100);
    },
    
    exportAllChartsPNG: async function() {
        const chartMapping = {
            'chart-gad': 'plot-gad',
            'chart-intraday': 'plot-intraday',
            'chart-adhd': 'plot-adhd',
            'chart-stacked-area': 'plot-stacked-area',
            'chart-sleep': 'plot-sleep',
            'chart-correlation': 'plot-correlation',
            'chart-sleep-anxiety': 'plot-sleep-anxiety',
            'chart-rolling-avg': 'plot-rolling-avg',
            'chart-weekly': 'plot-weekly',
            'chart-positive-vs-negative': 'plot-positive-vs-negative',
            'chart-metrics-by-time': 'plot-metrics-by-time'
        };
        
        const selectedCharts = Object.entries(this.selectedSegments)
            .filter(([id, selected]) => selected && id.startsWith('chart-') && chartMapping[id])
            .map(([id]) => ({ containerId: chartMapping[id], filename: id.replace('chart-', '') }));
        
        if (selectedCharts.length === 0) {
            this.showToast('warning', 'Wybierz przynajmniej jeden wykres do eksportu');
            return;
        }
        
        for (let i = 0; i < selectedCharts.length; i++) {
            const chart = selectedCharts[i];
            if (ChartRenderer.exportChart) {
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 500)); // Delay between exports
                }
                ChartRenderer.exportChart(chart.containerId, chart.filename);
            }
        }
        
        this.showToast('success', `Eksportowano ${selectedCharts.length} wykresów`);
    },
    
    // Fullscreen chart functionality
    openChartFullscreen: function(chartId, title) {
        const chartElement = document.getElementById(chartId);
        if (!chartElement || !chartElement.data) {
            this.showToast('warning', 'Wykres nie jest jeszcze załadowany');
            return;
        }
        
        // Create fullscreen overlay
        const overlay = document.createElement('div');
        overlay.className = 'chart-fullscreen';
        overlay.id = 'chart-fullscreen-overlay';
        
        const isMobile = window.innerWidth < 768;
        const isLandscape = window.innerWidth > window.innerHeight;
        
        overlay.innerHTML = `
            <div class="chart-fullscreen-header">
                <h2 class="chart-fullscreen-title">${title}</h2>
                <button class="chart-fullscreen-close" id="chart-fullscreen-close-btn" aria-label="Zamknij">
                    Zamknij
                </button>
            </div>
            <div class="chart-fullscreen-container">
                <div id="chart-fullscreen-${chartId}" style="width: 100%; height: 100%; min-height: 400px;"></div>
            </div>
            ${isMobile && !isLandscape ? '<div class="chart-fullscreen-hint">💡 Obróć urządzenie poziomo dla lepszego widoku</div>' : ''}
        `;
        
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        
        // Bind close button
        const closeBtn = document.getElementById('chart-fullscreen-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeChartFullscreen());
            closeBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.closeChartFullscreen();
            }, { passive: false });
        }
        
        // Clone chart data and render in fullscreen
        const fullscreenContainer = document.getElementById(`chart-fullscreen-${chartId}`);
        const originalData = JSON.parse(JSON.stringify(chartElement.data));
        const originalLayout = JSON.parse(JSON.stringify(chartElement.layout));
        
        // Calculate proper dimensions
        const containerHeight = Math.max(600, window.innerHeight - 200);
        const containerWidth = fullscreenContainer.offsetWidth || window.innerWidth - 40;
        
        // Update layout for fullscreen
        const fullscreenLayout = {
            ...originalLayout,
            width: containerWidth,
            height: containerHeight,
            margin: { t: 60, r: 40, b: 60, l: 60 }
        };
        
        Plotly.newPlot(fullscreenContainer.id, originalData, fullscreenLayout, {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'select2d']
        });
        
        // Handle resize
        const resizeHandler = () => {
            if (fullscreenContainer && fullscreenContainer.data) {
                const newHeight = Math.max(600, window.innerHeight - 200);
                const newWidth = fullscreenContainer.offsetWidth || window.innerWidth - 40;
                Plotly.relayout(fullscreenContainer.id, {
                    width: newWidth,
                    height: newHeight
                });
            }
        };
        
        window.addEventListener('resize', resizeHandler);
        overlay.dataset.resizeHandler = 'true';
        
        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeChartFullscreen();
            }
        };
        document.addEventListener('keydown', escapeHandler);
        overlay.dataset.escapeHandler = 'true';
    },
    
    closeChartFullscreen: function() {
        const overlay = document.getElementById('chart-fullscreen-overlay');
        if (overlay) {
            // Clean up event listeners
            window.removeEventListener('resize', () => {});
            document.removeEventListener('keydown', () => {});
            
            overlay.remove();
            document.body.style.overflow = '';
        }
    }
};
