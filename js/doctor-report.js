/* ===== DOCTOR REPORT MODULE ===== */
const DoctorReport = {
    // Generuj pełny raport HTML
    generate: function(data, stats) {
        if (!data || data.length === 0 || !stats) {
            return '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">Brak danych. Zaimportuj dane w zakładce "Import Danych", aby wygenerować raport.</p>';
        }
        
        let html = '';
        
        try {
            html += this.renderPatientInfo(stats);
        } catch (e) {
            console.error('Error rendering patient info:', e);
        }
        
        try {
            html += this.render3DayPeriodsTable(stats);
        } catch (e) {
            console.error('Error rendering 3-day periods:', e);
        }
        
        try {
            html += this.renderGADEffectiveness(stats);
        } catch (e) {
            console.error('Error rendering GAD effectiveness:', e);
        }
        
        try {
            html += this.renderADHDStability(stats);
        } catch (e) {
            console.error('Error rendering ADHD stability:', e);
        }
        
        try {
            html += this.renderIntradayPatterns(stats);
        } catch (e) {
            console.error('Error rendering intraday patterns:', e);
        }
        
        try {
            html += this.renderCorrelationMatrix(stats);
        } catch (e) {
            console.error('Error rendering correlation matrix:', e);
        }
        
        try {
            html += this.renderConclusions(stats);
        } catch (e) {
            console.error('Error rendering conclusions:', e);
        }
        
        return html;
    },
    
    // Sekcja: Informacje o pacjencie
    renderPatientInfo: function(stats) {
        const period = stats.period || {};
        // Load medications from localStorage (generic, privacy-safe)
        const medications = localStorage.getItem(CONFIG.MEDS_KEY) || 'Informacje o lekach nie zostały skonfigurowane';
        const settings = CONFIG.getSettings();
        const contextName = settings.primaryCondition || CONFIG.DEFAULT_CONTEXT.displayName;
        
        return `
            <div class="report-section">
                <h3>Informacje o Obserwacji</h3>
                <p><strong>Okres obserwacji:</strong> <strong>${period.start || '-'}</strong> - <strong>${period.end || '-'}</strong></p>
                <p><strong>Liczba dni:</strong> <strong>${period.days || 0}</strong></p>
                <p><strong>Liczba pomiarów:</strong> <strong>${period.measurements || 0}</strong></p>
                <p><strong>Średnia pomiarów/dzień:</strong> <strong>${period.measurements && period.days ? (period.measurements / period.days).toFixed(1) : '-'}</strong></p>
                <p><strong>Kontekst:</strong> ${contextName}</p>
                <p><strong>Leki:</strong> ${medications}</p>
            </div>
        `;
    },
    
    // Sekcja: Tabela okresów 3-dniowych
    render3DayPeriodsTable: function(stats) {
        const periods = stats.threeDayPeriods || [];
        if (periods.length === 0) return '';
        
        const metricLabels = {
            'lek': 'Lęk',
            'napiecie': 'Napięcie',
            'fokus': 'Fokus',
            'energia': 'Energia',
            'brainfog': 'Klarowność',
            'jakoscSnu': 'Jakość Snu'
        };
        
        const formatValue = (val) => val !== null && val !== undefined ? val.toFixed(2) : '-';
        const formatTrend = (trend, isPositiveMetric = false) => {
            if (trend === null || trend === undefined || isNaN(trend)) return '-';
            const sign = trend > 0 ? '+' : '';
            // Dla pozytywnych metryk (Fokus, Energia, Jakość Snu): trend + = zielony, trend - = czerwony
            // Dla negatywnych metryk (Lęk, Napięcie): trend - = zielony, trend + = czerwony
            let color;
            if (isPositiveMetric) {
                color = trend > 0.1 ? 'var(--accent-green)' : trend < -0.1 ? 'var(--accent-red)' : 'var(--text-secondary)';
            } else {
                color = trend < -0.1 ? 'var(--accent-green)' : trend > 0.1 ? 'var(--accent-red)' : 'var(--text-secondary)';
            }
            return `<span style="color: ${color};">${sign}${trend.toFixed(3)}</span>`;
        };
        
        // Dla brainfog pokaż jako Klarowność (odwrócone)
        const getDisplayValue = (period, metric) => {
            if (metric === 'brainfog') {
                const val = period.averages[metric];
                return val !== null ? (11 - val).toFixed(2) : '-';
            }
            return formatValue(period.averages[metric]);
        };
        
        const getDisplayTrend = (period, metric) => {
            if (metric === 'brainfog') {
                // Dla Klarowności odwracamy trend (spadek brainfog = wzrost klarowności)
                const trend = period.trends[metric];
                return formatTrend(trend !== null ? -trend : null, true); // Klarowność to pozytywna metryka
            }
            // Pozytywne metryki: fokus, energia, jakoscSnu
            const positiveMetrics = ['fokus', 'energia', 'jakoscSnu'];
            const isPositive = positiveMetrics.includes(metric);
            return formatTrend(period.trends[metric], isPositive);
        };
        
        const rows = periods.map(period => {
            const cells = [
                `<td><strong>Okres ${period.periodNumber}</strong><br><small style="color: var(--text-secondary);">${period.startDate} - ${period.endDate}</small></td>`,
                `<td>${getDisplayValue(period, 'lek')}<br><small>${getDisplayTrend(period, 'lek')}</small></td>`,
                `<td>${getDisplayValue(period, 'napiecie')}<br><small>${getDisplayTrend(period, 'napiecie')}</small></td>`,
                `<td>${getDisplayValue(period, 'fokus')}<br><small>${getDisplayTrend(period, 'fokus')}</small></td>`,
                `<td>${getDisplayValue(period, 'energia')}<br><small>${getDisplayTrend(period, 'energia')}</small></td>`,
                `<td>${getDisplayValue(period, 'brainfog')}<br><small>${getDisplayTrend(period, 'brainfog')}</small></td>`,
                `<td>${formatValue(period.averages.jakoscSnu)}<br><small>${formatTrend(period.trends.jakoscSnu)}</small></td>`
            ].join('');
            return `<tr>${cells}</tr>`;
        }).join('');
        
        return `
            <div class="report-section">
                <h3>Analiza Okresów 3-Dniowych</h3>
                <p style="color: var(--text-secondary); margin-bottom: 15px;">
                    Średnie wartości objawów i trendy (slope) dla każdego 3-dniowego okresu obserwacji.
                    <br><small>Trend: dla Lęku/Napięcia - wartości ujemne (zielone) = poprawa, wartości dodatnie (czerwone) = pogorszenie. Dla Fokusu/Energii/Klarowności/Jakości Snu - wartości dodatnie (zielone) = poprawa, wartości ujemne (czerwone) = pogorszenie.</small>
                </p>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                        <thead>
                            <tr style="background: var(--bg-hover); border-bottom: 2px solid var(--border);">
                                <th style="padding: 12px; text-align: left; font-weight: 600;">Okres</th>
                                <th style="padding: 12px; text-align: center; font-weight: 600;">Lęk<br><small style="font-weight: 400;">(średnia / trend)</small></th>
                                <th style="padding: 12px; text-align: center; font-weight: 600;">Napięcie<br><small style="font-weight: 400;">(średnia / trend)</small></th>
                                <th style="padding: 12px; text-align: center; font-weight: 600;">Fokus<br><small style="font-weight: 400;">(średnia / trend)</small></th>
                                <th style="padding: 12px; text-align: center; font-weight: 600;">Energia<br><small style="font-weight: 400;">(średnia / trend)</small></th>
                                <th style="padding: 12px; text-align: center; font-weight: 600;">Klarowność<br><small style="font-weight: 400;">(średnia / trend)</small></th>
                                <th style="padding: 12px; text-align: center; font-weight: 600;">Jakość Snu<br><small style="font-weight: 400;">(średnia / trend)</small></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },
    
    // Analiza scenariuszy rozwoju objawów
    analyzeSymptomTrajectory: function(trend, metricName) {
        if (!trend || trend.slope === null || trend.slope === undefined) {
            return { scenario: 'Brak danych', description: 'Niewystarczające dane do analizy trendu' };
        }
        
        const slope = trend.slope;
        const isSignificant = trend.pValue !== null && trend.pValue < 0.05;
        const isPositiveMetric = ['fokus', 'energia', 'jakoscSnu'].includes(metricName);
        
        // Dla pozytywnych metryk: slope > 0 = poprawa, slope < 0 = pogorszenie
        // Dla negatywnych metryk: slope < 0 = poprawa, slope > 0 = pogorszenie
        const isImproving = isPositiveMetric ? slope > 0 : slope < 0;
        const magnitude = Math.abs(slope);
        
        let scenario, description, severity;
        
        if (isImproving) {
            if (magnitude > 0.15) {
                scenario = 'Szybka poprawa';
                severity = 'high';
                description = `Obserwuje się szybką poprawę (${slope.toFixed(3)} pkt/dzień). Trend jest ${isSignificant ? 'istotny statystycznie' : 'nieistotny statystycznie'}.`;
            } else if (magnitude > 0.05) {
                scenario = 'Stopniowa poprawa';
                severity = 'medium';
                description = `Obserwuje się stopniową poprawę (${slope.toFixed(3)} pkt/dzień). Trend jest ${isSignificant ? 'istotny statystycznie' : 'nieistotny statystycznie'}.`;
            } else {
                scenario = 'Lekka poprawa';
                severity = 'low';
                description = `Obserwuje się lekką poprawę (${slope.toFixed(3)} pkt/dzień). Trend jest ${isSignificant ? 'istotny statystycznie' : 'nieistotny statystycznie'}.`;
            }
        } else {
            if (magnitude > 0.15) {
                scenario = 'Szybkie pogorszenie';
                severity = 'high';
                description = `Obserwuje się szybkie pogorszenie (${slope.toFixed(3)} pkt/dzień). Trend jest ${isSignificant ? 'istotny statystycznie' : 'nieistotny statystycznie'}. Wymaga uwagi klinicznej.`;
            } else if (magnitude > 0.05) {
                scenario = 'Stopniowe pogorszenie';
                severity = 'medium';
                description = `Obserwuje się stopniowe pogorszenie (${slope.toFixed(3)} pkt/dzień). Trend jest ${isSignificant ? 'istotny statystycznie' : 'nieistotny statystycznie'}.`;
            } else {
                scenario = 'Lekkie pogorszenie';
                severity = 'low';
                description = `Obserwuje się lekkie pogorszenie (${slope.toFixed(3)} pkt/dzień). Trend jest ${isSignificant ? 'istotny statystycznie' : 'nieistotny statystycznie'}.`;
            }
        }
        
        if (magnitude < 0.02) {
            scenario = 'Stabilizacja';
            severity = 'neutral';
            description = `Parametr pozostaje stabilny (${slope.toFixed(3)} pkt/dzień). Brak istotnych zmian w czasie.`;
        }
        
        return { scenario, description, severity, slope, isSignificant };
    },
    
    // Sekcja: Skuteczność GAD - suchy format
    renderGADEffectiveness: function(stats) {
        const gadTrend = stats.gadTrend || {};
        const comparison = stats.comparison || {};
        const lekTrend = gadTrend.lek || {};
        const napiecieTrend = gadTrend.napiecie || {};
        
        const lekAnalysis = this.analyzeSymptomTrajectory(lekTrend, 'lek');
        const napiecieAnalysis = this.analyzeSymptomTrajectory(napiecieTrend, 'napiecie');
        
        const getSeverityColor = (severity, scenario) => {
            const isImprovement = scenario && (scenario.includes('poprawa') || scenario.includes('Stabilizacja'));
            const isWorsening = scenario && scenario.includes('pogorszenie');
            
            if (severity === 'high') {
                return isImprovement ? 'var(--accent-green)' : isWorsening ? 'var(--accent-red)' : 'var(--accent-green)';
            }
            if (severity === 'medium') return 'var(--accent-amber)';
            if (severity === 'low') return 'var(--text-secondary)';
            if (severity === 'neutral') return 'var(--text-secondary)';
            return 'var(--accent-red)';
        };
        
        return `
            <div class="report-section">
                <h3>Analiza Trendów Głównych Objawów</h3>
                
                <div style="overflow-x: auto; margin: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                        <thead>
                            <tr style="background: var(--bg-hover); border-bottom: 2px solid var(--border);">
                                <th style="padding: 10px; text-align: left; font-weight: 600;">Parametr</th>
                                <th style="padding: 10px; text-align: center; font-weight: 600;">Slope (pkt/dzień)</th>
                                <th style="padding: 10px; text-align: center; font-weight: 600;">Korelacja (r)</th>
                                <th style="padding: 10px; text-align: center; font-weight: 600;">p-value</th>
                                <th style="padding: 10px; text-align: center; font-weight: 600;">Scenariusz</th>
                                <th style="padding: 10px; text-align: center; font-weight: 600;">Porównanie okresów</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px; font-weight: 500;">Lęk</td>
                                <td style="padding: 10px; text-align: center;">${lekTrend.slope !== null ? lekTrend.slope.toFixed(4) : '-'}</td>
                                <td style="padding: 10px; text-align: center;">${lekTrend.r !== null ? lekTrend.r.toFixed(3) : '-'}</td>
                                <td style="padding: 10px; text-align: center;">${this.formatPValue(lekTrend.pValue)}</td>
                                <td style="padding: 10px; text-align: center; color: ${getSeverityColor(lekAnalysis.severity, lekAnalysis.scenario)}; font-weight: 600;">${lekAnalysis.scenario}</td>
                                <td style="padding: 10px; text-align: center;">
                                    ${comparison.firstHalf && comparison.secondHalf && comparison.firstHalf.lek && comparison.secondHalf.lek ? 
                                        `${comparison.firstHalf.lek.toFixed(2)} → ${comparison.secondHalf.lek.toFixed(2)} (${comparison.change.lek ? comparison.change.lek.toFixed(1) : '-'}%)` : '-'}
                                </td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px; font-weight: 500;">Napięcie</td>
                                <td style="padding: 10px; text-align: center;">${napiecieTrend.slope !== null ? napiecieTrend.slope.toFixed(4) : '-'}</td>
                                <td style="padding: 10px; text-align: center;">${napiecieTrend.r !== null ? napiecieTrend.r.toFixed(3) : '-'}</td>
                                <td style="padding: 10px; text-align: center;">${this.formatPValue(napiecieTrend.pValue)}</td>
                                <td style="padding: 10px; text-align: center; color: ${getSeverityColor(napiecieAnalysis.severity, napiecieAnalysis.scenario)}; font-weight: 600;">${napiecieAnalysis.scenario}</td>
                                <td style="padding: 10px; text-align: center;">
                                    ${comparison.firstHalf && comparison.secondHalf && comparison.firstHalf.napiecie && comparison.secondHalf.napiecie ? 
                                        `${comparison.firstHalf.napiecie.toFixed(2)} → ${comparison.secondHalf.napiecie.toFixed(2)} (${comparison.change.napiecie ? comparison.change.napiecie.toFixed(1) : '-'}%)` : '-'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div style="margin-top: 15px; padding: 15px; background: var(--bg-hover); border-radius: var(--radius-md);">
                    <h4 style="margin-top: 0; font-size: 0.95rem;">Interpretacja scenariuszy:</h4>
                    <ul style="margin: 0; padding-left: 20px; font-size: 0.85rem; color: var(--text-secondary);">
                        <li><strong>Lęk:</strong> ${lekAnalysis.description}</li>
                        <li><strong>Napięcie:</strong> ${napiecieAnalysis.description}</li>
                    </ul>
                </div>
            </div>
        `;
    },
    
    // Sekcja: Stabilność ADHD - suchy format
    renderADHDStability: function(stats) {
        const adhd = stats.adhdStability || {};
        const fokus = adhd.fokus || {};
        const energia = adhd.energia || {};
        const fokusTrend = stats.gadTrend?.fokus || {};
        const energiaTrend = stats.gadTrend?.energia || {};
        
        const fokusAnalysis = this.analyzeSymptomTrajectory(fokusTrend, 'fokus');
        const energiaAnalysis = this.analyzeSymptomTrajectory(energiaTrend, 'energia');
        
        const getSeverityColor = (severity, scenario) => {
            const isImprovement = scenario && (scenario.includes('poprawa') || scenario.includes('Stabilizacja'));
            const isWorsening = scenario && scenario.includes('pogorszenie');
            
            if (severity === 'high') {
                return isImprovement ? 'var(--accent-green)' : isWorsening ? 'var(--accent-red)' : 'var(--accent-green)';
            }
            if (severity === 'medium') return 'var(--accent-amber)';
            if (severity === 'low') return 'var(--text-secondary)';
            if (severity === 'neutral') return 'var(--text-secondary)';
            return 'var(--accent-red)';
        };
        
        return `
            <div class="report-section">
                <h3>Funkcjonowanie Poznawcze</h3>
                
                <div style="overflow-x: auto; margin: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                        <thead>
                            <tr style="background: var(--bg-hover); border-bottom: 2px solid var(--border);">
                                <th style="padding: 10px; text-align: left; font-weight: 600;">Parametr</th>
                                <th style="padding: 10px; text-align: center; font-weight: 600;">Slope (pkt/dzień)</th>
                                <th style="padding: 10px; text-align: center; font-weight: 600;">Korelacja (r)</th>
                                <th style="padding: 10px; text-align: center; font-weight: 600;">p-value</th>
                                <th style="padding: 10px; text-align: center; font-weight: 600;">Scenariusz</th>
                                <th style="padding: 10px; text-align: center; font-weight: 600;">Porównanie okresów</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px; font-weight: 500;">Fokus</td>
                                <td style="padding: 10px; text-align: center;">${fokusTrend.slope !== null ? fokusTrend.slope.toFixed(4) : '-'}</td>
                                <td style="padding: 10px; text-align: center;">${fokusTrend.r !== null ? fokusTrend.r.toFixed(3) : '-'}</td>
                                <td style="padding: 10px; text-align: center;">${this.formatPValue(fokusTrend.pValue)}</td>
                                <td style="padding: 10px; text-align: center; color: ${getSeverityColor(fokusAnalysis.severity, fokusAnalysis.scenario)}; font-weight: 600;">${fokusAnalysis.scenario}</td>
                                <td style="padding: 10px; text-align: center;">
                                    ${fokus.firstHalf && fokus.secondHalf ? 
                                        `${fokus.firstHalf.toFixed(2)} → ${fokus.secondHalf.toFixed(2)}` : '-'}
                                </td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px; font-weight: 500;">Energia</td>
                                <td style="padding: 10px; text-align: center;">${energiaTrend.slope !== null ? energiaTrend.slope.toFixed(4) : '-'}</td>
                                <td style="padding: 10px; text-align: center;">${energiaTrend.r !== null ? energiaTrend.r.toFixed(3) : '-'}</td>
                                <td style="padding: 10px; text-align: center;">${this.formatPValue(energiaTrend.pValue)}</td>
                                <td style="padding: 10px; text-align: center; color: ${getSeverityColor(energiaAnalysis.severity, energiaAnalysis.scenario)}; font-weight: 600;">${energiaAnalysis.scenario}</td>
                                <td style="padding: 10px; text-align: center;">
                                    ${energia.firstHalf && energia.secondHalf ? 
                                        `${energia.firstHalf.toFixed(2)} → ${energia.secondHalf.toFixed(2)}` : '-'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },
    
    // Sekcja: Wzorce dobowe
    renderIntradayPatterns: function(stats) {
        const patterns = stats.intradayPatterns || {};
        const avgByTime = patterns.avgByTime || {};
        
        return `
            <div class="report-section">
                <h3>Wzorce Dobowe</h3>
                <h4>📊 Rozkład Lęku w ciągu doby:</h4>
                <ul>
                    <li>Najgorsza pora dnia: <strong>${patterns.worstTimeOfDay || '-'}</strong></li>
                    <li>Najlepsza pora dnia: <strong>${patterns.bestTimeOfDay || '-'}</strong></li>
                </ul>
                <h4>Średnie wartości lęku:</h4>
                <ul>
                    ${Object.keys(avgByTime).map(time => 
                        `<li>${time}: <strong>${avgByTime[time].toFixed(2)}</strong></li>`
                    ).join('')}
                </ul>
            </div>
        `;
    },
    
    // Sekcja: Macierz Korelacji
    renderCorrelationMatrix: function(stats) {
        // Pobierz dane z localStorage lub wygeneruj na nowo
        const rawData = DataStore.load();
        if (!rawData || rawData.length === 0) return '';
        
        const variables = ['lek', 'napiecie', 'jakoscSnu', 'brainfog', 'energia', 'fokus'];
        const corrData = StatsEngine.correlationMatrix(rawData, variables);
        const labels = ['Lęk', 'Napięcie', 'Sen (Jakość)', 'Klarowność', 'Energia', 'Fokus'];
        
        if (!corrData || !corrData.matrix || corrData.matrix.length === 0) return '';
        
        const { matrix } = corrData;
        
        let html = `
            <div class="report-section">
                <h3>Wykres 5: Macierz Korelacji</h3>
                <p style="color: var(--text-secondary); margin-bottom: 15px;">
                    Wartości korelacji Pearsona między zmiennymi. Wartości bliskie 1 lub -1 oznaczają silną korelację.
                </p>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: center;">
                        <thead>
                            <tr style="background: var(--bg-hover); border-bottom: 2px solid var(--border);">
                                <th style="padding: 10px 8px; text-align: left; font-weight: 600; background-color: var(--bg-card) !important; position: sticky; left: 0; z-index: 10; border-right: 2px solid var(--border);">Zmienna</th>
                                ${labels.map(l => `<th style="padding: 10px 8px; font-weight: 600;">${l}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        matrix.forEach((row, i) => {
            html += `<tr><td style="padding: 10px 8px; background-color: var(--bg-card) !important; font-weight: 600; text-align: left; border-right: 2px solid var(--border); position: sticky; left: 0; z-index: 5;">${labels[i]}</td>`;
            row.forEach((val, j) => {
                let bgColor = 'transparent';
                let textColor = 'inherit';
                
                if (i === j) {
                    bgColor = 'var(--bg-hover)';
                    html += `<td style="padding: 10px 8px; border: 1px solid var(--border); background: ${bgColor}; font-weight: 600;">1.00</td>`;
                } else if (i > j) {
                    // Lower triangle - check for null/undefined
                    if (val !== null && val !== undefined && !isNaN(val)) {
                        const absVal = Math.abs(val);
                        if (absVal > 0.5) {
                            bgColor = val > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
                        } else if (absVal > 0.3) {
                            bgColor = val > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
                        }
                        html += `<td style="padding: 10px 8px; border: 1px solid var(--border); background: ${bgColor}; color: ${textColor};">${val.toFixed(2)}</td>`;
                    } else {
                        html += `<td style="padding: 10px 8px; border: 1px solid var(--border);">-</td>`;
                    }
                } else {
                    // Upper triangle - empty
                    html += `<td style="padding: 10px 8px; border: 1px solid var(--border);"></td>`;
                }
            });
            html += '</tr>';
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        return html;
    },
    
    // Sekcja: Wnioski - suchy format
    renderConclusions: function(stats) {
        const gadTrend = stats.gadTrend || {};
        const lekTrend = gadTrend.lek || {};
        const napiecieTrend = gadTrend.napiecie || {};
        const fokusTrend = gadTrend.fokus || {};
        const energiaTrend = gadTrend.energia || {};
        const comparison = stats.comparison || {};
        
        const lekAnalysis = this.analyzeSymptomTrajectory(lekTrend, 'lek');
        const napiecieAnalysis = this.analyzeSymptomTrajectory(napiecieTrend, 'napiecie');
        const fokusAnalysis = this.analyzeSymptomTrajectory(fokusTrend, 'fokus');
        const energiaAnalysis = this.analyzeSymptomTrajectory(energiaTrend, 'energia');
        
        // Określ ogólny scenariusz
        let overallScenario = 'Stabilizacja';
        if (lekAnalysis.severity === 'high' && lekAnalysis.scenario.includes('poprawa')) {
            overallScenario = 'Szybka poprawa głównych objawów';
        } else if (lekAnalysis.scenario.includes('poprawa') || napiecieAnalysis.scenario.includes('poprawa')) {
            overallScenario = 'Stopniowa poprawa';
        } else if (lekAnalysis.scenario.includes('pogorszenie') || napiecieAnalysis.scenario.includes('pogorszenie')) {
            overallScenario = 'Pogorszenie objawów';
        }
        
        return `
            <div class="report-section">
                <h3>Podsumowanie</h3>
                
                <div style="margin: 20px 0; padding: 15px; background: var(--bg-hover); border-left: 4px solid var(--accent); border-radius: var(--radius-md);">
                    <h4 style="margin-top: 0; font-size: 1rem;">Scenariusz ogólny: <strong>${overallScenario}</strong></h4>
                </div>
                
                <div style="overflow-x: auto; margin: 20px 0;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                        <thead>
                            <tr style="background: var(--bg-hover); border-bottom: 2px solid var(--border);">
                                <th style="padding: 10px; text-align: left; font-weight: 600;">Parametr</th>
                                <th style="padding: 10px; text-align: center; font-weight: 600;">Scenariusz</th>
                                <th style="padding: 10px; text-align: left; font-weight: 600;">Interpretacja</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px; font-weight: 500;">Lęk</td>
                                <td style="padding: 10px; text-align: center; font-weight: 600;">${lekAnalysis.scenario}</td>
                                <td style="padding: 10px; font-size: 0.85rem; color: var(--text-secondary);">${lekAnalysis.description}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px; font-weight: 500;">Napięcie</td>
                                <td style="padding: 10px; text-align: center; font-weight: 600;">${napiecieAnalysis.scenario}</td>
                                <td style="padding: 10px; font-size: 0.85rem; color: var(--text-secondary);">${napiecieAnalysis.description}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px; font-weight: 500;">Fokus</td>
                                <td style="padding: 10px; text-align: center; font-weight: 600;">${fokusAnalysis.scenario}</td>
                                <td style="padding: 10px; font-size: 0.85rem; color: var(--text-secondary);">${fokusAnalysis.description}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px; font-weight: 500;">Energia</td>
                                <td style="padding: 10px; text-align: center; font-weight: 600;">${energiaAnalysis.scenario}</td>
                                <td style="padding: 10px; font-size: 0.85rem; color: var(--text-secondary);">${energiaAnalysis.description}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                ${comparison.firstHalf && comparison.secondHalf && comparison.firstHalf.lek && comparison.secondHalf.lek ? 
                    `<p style="margin-top: 15px; font-size: 0.9rem; color: var(--text-secondary);">
                        <strong>Zmiana średnich wartości:</strong> Lęk ${comparison.firstHalf.lek.toFixed(1)} → ${comparison.secondHalf.lek.toFixed(1)} pkt 
                        (${comparison.change.lek ? comparison.change.lek.toFixed(1) : '-'}%), 
                        Napięcie ${comparison.firstHalf.napiecie ? comparison.firstHalf.napiecie.toFixed(1) : '-'} → 
                        ${comparison.secondHalf.napiecie ? comparison.secondHalf.napiecie.toFixed(1) : '-'} pkt 
                        (${comparison.change.napiecie ? comparison.change.napiecie.toFixed(1) : '-'}%).
                    </p>` : ''}
            </div>
        `;
    },
    
    // Interpretacja odpowiedzi na leczenie
    interpretResponse: function(stats) {
        const gadTrend = stats.gadTrend || {};
        const lekTrend = gadTrend.lek || {};
        const napiecieTrend = gadTrend.napiecie || {};
        
        if (lekTrend.slope < -0.05 && napiecieTrend.slope < -0.05) {
            return '✅ POZYTYWNA';
        } else if (lekTrend.slope < 0 || napiecieTrend.slope < 0) {
            return '⚠️ CZĘŚCIOWO POZYTYWNA';
        } else {
            return '❌ NIEJEDNOZNACZNA/NEGATYWNA';
        }
    },
    
    // Formatowanie p-value
    formatPValue: function(p) {
        if (p === null || p === undefined || isNaN(p)) return 'N/A';
        if (p < 0.01) return `${p.toFixed(4)} (istotne)`;
        if (p < 0.05) return `${p.toFixed(4)} (istotne)`;
        return `${p.toFixed(4)} (nieistotne)`;
    },
    
    // Eksport do PDF
    exportToPDF: function(data, stats) {
        if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
            console.error('jsPDF nie jest załadowany');
            UIController.showToast('error', 'Biblioteka PDF nie jest załadowana');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        let yPos = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - 2 * margin;
        
        // Helper: Add new page if needed
        const checkPageBreak = (requiredHeight) => {
            if (yPos + requiredHeight > pageHeight - margin) {
                doc.addPage();
                yPos = margin;
                return true;
            }
            return false;
        };
        
        // Header
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Raport Analizy Objawów', margin, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const period = stats.period || {};
        doc.text(`Okres obserwacji: ${period.start || '-'} - ${period.end || '-'}`, margin, yPos);
        yPos += 5;
        doc.text(`Data wygenerowania: ${new Date().toLocaleDateString('pl-PL')}`, margin, yPos);
        yPos += 15;
        
        // Section 1: Patient Info
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Informacje o Obserwacji', margin, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const medications = localStorage.getItem(CONFIG.MEDS_KEY) || 'Nie skonfigurowano';
        const settings = CONFIG.getSettings();
        const contextName = settings.primaryCondition || CONFIG.DEFAULT_CONTEXT.displayName;
        
        doc.text(`Liczba dni: ${period.days || 0}`, margin, yPos);
        yPos += 5;
        doc.text(`Liczba pomiarów: ${period.measurements || 0}`, margin, yPos);
        yPos += 5;
        doc.text(`Średnia pomiarów/dzień: ${period.measurements && period.days ? (period.measurements / period.days).toFixed(1) : '-'}`, margin, yPos);
        yPos += 5;
        doc.text(`Kontekst: ${contextName}`, margin, yPos);
        yPos += 5;
        const medLines = doc.splitTextToSize(`Leki: ${medications}`, contentWidth);
        doc.text(medLines, margin, yPos);
        yPos += medLines.length * 5 + 10;
        
        // Section 2: Trend Analysis with Scenarios
        checkPageBreak(50);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Analiza Trendów Głównych Objawów', margin, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        const gadTrend = stats.gadTrend || {};
        const comparison = stats.comparison || {};
        const lekTrend = gadTrend.lek || {};
        const napiecieTrend = gadTrend.napiecie || {};
        const fokusTrend = gadTrend.fokus || {};
        const energiaTrend = gadTrend.energia || {};
        
        const lekAnalysis = this.analyzeSymptomTrajectory(lekTrend, 'lek');
        const napiecieAnalysis = this.analyzeSymptomTrajectory(napiecieTrend, 'napiecie');
        const fokusAnalysis = this.analyzeSymptomTrajectory(fokusTrend, 'fokus');
        const energiaAnalysis = this.analyzeSymptomTrajectory(energiaTrend, 'energia');
        
        // Table with trends
        const trendTableData = [
            ['Lęk', 
             lekTrend.slope !== null ? lekTrend.slope.toFixed(4) : '-',
             lekTrend.r !== null ? lekTrend.r.toFixed(3) : '-',
             this.formatPValue(lekTrend.pValue),
             lekAnalysis.scenario,
             comparison.firstHalf && comparison.secondHalf && comparison.firstHalf.lek && comparison.secondHalf.lek ?
                 `${comparison.firstHalf.lek.toFixed(2)} → ${comparison.secondHalf.lek.toFixed(2)} (${comparison.change.lek ? comparison.change.lek.toFixed(1) : '-'}%)` : '-'
            ],
            ['Napięcie',
             napiecieTrend.slope !== null ? napiecieTrend.slope.toFixed(4) : '-',
             napiecieTrend.r !== null ? napiecieTrend.r.toFixed(3) : '-',
             this.formatPValue(napiecieTrend.pValue),
             napiecieAnalysis.scenario,
             comparison.firstHalf && comparison.secondHalf && comparison.firstHalf.napiecie && comparison.secondHalf.napiecie ?
                 `${comparison.firstHalf.napiecie.toFixed(2)} → ${comparison.secondHalf.napiecie.toFixed(2)} (${comparison.change.napiecie ? comparison.change.napiecie.toFixed(1) : '-'}%)` : '-'
            ],
            ['Fokus',
             fokusTrend.slope !== null ? fokusTrend.slope.toFixed(4) : '-',
             fokusTrend.r !== null ? fokusTrend.r.toFixed(3) : '-',
             this.formatPValue(fokusTrend.pValue),
             fokusAnalysis.scenario,
             '-'
            ],
            ['Energia',
             energiaTrend.slope !== null ? energiaTrend.slope.toFixed(4) : '-',
             energiaTrend.r !== null ? energiaTrend.r.toFixed(3) : '-',
             this.formatPValue(energiaTrend.pValue),
             energiaAnalysis.scenario,
             '-'
            ]
        ];
        
        doc.autoTable({
            startY: yPos,
            head: [['Parametr', 'Slope', 'r', 'p-value', 'Scenariusz', 'Porównanie']],
            body: trendTableData,
            theme: 'striped',
            headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 25, halign: 'center' },
                2: { cellWidth: 20, halign: 'center' },
                3: { cellWidth: 30, halign: 'center' },
                4: { cellWidth: 40 },
                5: { cellWidth: 35, halign: 'center' }
            },
            margin: { left: margin, right: margin }
        });
        
        yPos = doc.lastAutoTable.finalY + 10;
        
        // Interpretations
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        const lekDesc = doc.splitTextToSize(`Lęk: ${lekAnalysis.description}`, contentWidth);
        doc.text(lekDesc, margin, yPos);
        yPos += lekDesc.length * 4 + 3;
        
        const napiecieDesc = doc.splitTextToSize(`Napięcie: ${napiecieAnalysis.description}`, contentWidth);
        doc.text(napiecieDesc, margin, yPos);
        yPos += napiecieDesc.length * 4 + 10;
        
        // Section 3: 3-Day Periods Table
        const periods = stats.threeDayPeriods || [];
        if (periods.length > 0) {
            checkPageBreak(40);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Analiza Okresów 3-Dniowych', margin, yPos);
            yPos += 8;
            
            const tableData = periods.map(period => [
                `Okres ${period.periodNumber}`,
                period.averages.lek !== null ? period.averages.lek.toFixed(2) : '-',
                period.averages.napiecie !== null ? period.averages.napiecie.toFixed(2) : '-',
                period.averages.fokus !== null ? period.averages.fokus.toFixed(2) : '-',
                period.averages.energia !== null ? period.averages.energia.toFixed(2) : '-'
            ]);
            
            doc.autoTable({
                startY: yPos,
                head: [['Okres', 'Lęk', 'Napięcie', 'Fokus', 'Energia']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: 'bold' },
                margin: { left: margin, right: margin },
                styles: { fontSize: 8 }
            });
            
            yPos = doc.lastAutoTable.finalY + 10;
        }
        
        // Section 4: Summary with Scenarios
        checkPageBreak(40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Podsumowanie', margin, yPos);
        yPos += 8;
        
        // Overall scenario
        let overallScenario = 'Stabilizacja';
        if (lekAnalysis.severity === 'high' && lekAnalysis.scenario.includes('poprawa')) {
            overallScenario = 'Szybka poprawa głównych objawów';
        } else if (lekAnalysis.scenario.includes('poprawa') || napiecieAnalysis.scenario.includes('poprawa')) {
            overallScenario = 'Stopniowa poprawa';
        } else if (lekAnalysis.scenario.includes('pogorszenie') || napiecieAnalysis.scenario.includes('pogorszenie')) {
            overallScenario = 'Pogorszenie objawów';
        }
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`Scenariusz ogólny: ${overallScenario}`, margin, yPos);
        yPos += 8;
        
        // Summary table
        const summaryTableData = [
            ['Lęk', lekAnalysis.scenario, lekAnalysis.description],
            ['Napięcie', napiecieAnalysis.scenario, napiecieAnalysis.description],
            ['Fokus', fokusAnalysis.scenario, fokusAnalysis.description],
            ['Energia', energiaAnalysis.scenario, energiaAnalysis.description]
        ];
        
        doc.autoTable({
            startY: yPos,
            head: [['Parametr', 'Scenariusz', 'Interpretacja']],
            body: summaryTableData,
            theme: 'striped',
            headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 30, fontStyle: 'bold' },
                1: { cellWidth: 40 },
                2: { cellWidth: 120 }
            },
            margin: { left: margin, right: margin }
        });
        
        yPos = doc.lastAutoTable.finalY + 10;
        
        // Footer on each page
        const addFooter = () => {
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(`Strona ${i} z ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                doc.text(`Symptom Tracker v${CONFIG.APP_VERSION}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
            }
        };
        
        addFooter();
        
        // Save PDF
        const filename = `raport-objawow-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        UIController.showToast('success', 'Raport PDF został wygenerowany');
    }
};
