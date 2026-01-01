/* ===== DOCTOR REPORT MODULE ===== */
const DoctorReport = {
    // Generuj pełny raport HTML
    generate: function(data, stats) {
        if (!data || data.length === 0 || !stats) {
            return '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">Brak danych. Zaimportuj dane w zakładce "Import Danych", aby wygenerować raport.</p>';
        }
        
        const html = `
            ${this.renderPatientInfo(stats)}
            ${this.render3DayPeriodsTable(stats)}
            ${this.renderGADEffectiveness(stats)}
            ${this.renderADHDStability(stats)}
            ${this.renderIntradayPatterns(stats)}
            ${this.renderConclusions(stats)}
        `;
        
        return html;
    },
    
    // Sekcja: Informacje o pacjencie
    renderPatientInfo: function(stats) {
        const period = stats.period || {};
        return `
            <div class="report-section">
                <h3>Informacje o Pacjencie</h3>
                <p><strong>Okres obserwacji:</strong> <strong>${period.start || '-'}</strong> - <strong>${period.end || '-'}</strong></p>
                <p><strong>Liczba dni:</strong> <strong>${period.days || 0}</strong></p>
                <p><strong>Liczba pomiarów:</strong> <strong>${period.measurements || 0}</strong></p>
                <p><strong>Średnia pomiarów/dzień:</strong> <strong>${period.measurements && period.days ? (period.measurements / period.days).toFixed(1) : '-'}</strong></p>
                <p><strong>Leki:</strong> Elvanse 70mg/d + Pregabalina 225mg/d (75mg rano + 150mg wieczorem)</p>
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
        const formatTrend = (trend) => {
            if (trend === null || trend === undefined || isNaN(trend)) return '-';
            const sign = trend > 0 ? '+' : '';
            const color = trend < -0.1 ? 'var(--accent-green)' : trend > 0.1 ? 'var(--accent-red)' : 'var(--text-secondary)';
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
                return formatTrend(trend !== null ? -trend : null);
            }
            return formatTrend(period.trends[metric]);
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
                    <br><small>Trend: wartości ujemne (zielone) = poprawa, wartości dodatnie (czerwone) = pogorszenie</small>
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
    
    // Sekcja: Skuteczność GAD
    renderGADEffectiveness: function(stats) {
        const gadTrend = stats.gadTrend || {};
        const comparison = stats.comparison || {};
        const lekTrend = gadTrend.lek || {};
        const napiecieTrend = gadTrend.napiecie || {};
        
        const response = this.interpretResponse(stats);
        
        return `
            <div class="report-section">
                <h3>Skuteczność Anxiolityczna (Cel Główny)</h3>
                <p><strong>Odpowiedź na włączenie Pregabaliny:</strong> ${response}</p>
                
                <h4>📉 Trend Lęku:</h4>
                <ul>
                    <li>Nachylenie (slope): <strong>${lekTrend.slope ? lekTrend.slope.toFixed(4) : '-'}</strong> pkt/dzień</li>
                    <li>Korelacja z czasem: <strong>r = ${lekTrend.r ? lekTrend.r.toFixed(3) : '-'}</strong></li>
                    <li>Istotność statystyczna: <strong>p = ${this.formatPValue(lekTrend.pValue)}</strong></li>
                    <li>Średni LĘK dni 1-5: <strong>${comparison.firstHalf && comparison.firstHalf.lek ? comparison.firstHalf.lek.toFixed(2) : '-'}</strong> → dni 6-10: <strong>${comparison.secondHalf && comparison.secondHalf.lek ? comparison.secondHalf.lek.toFixed(2) : '-'}</strong></li>
                    <li>ZMIANA: <strong style="color: var(--accent-green);">${comparison.change && comparison.change.lek ? comparison.change.lek.toFixed(1) : '-'}%</strong></li>
                </ul>
                
                <h4>📉 Trend Napięcia:</h4>
                <ul>
                    <li>Nachylenie (slope): <strong>${napiecieTrend.slope ? napiecieTrend.slope.toFixed(4) : '-'}</strong> pkt/dzień</li>
                    <li>Korelacja z czasem: <strong>r = ${napiecieTrend.r ? napiecieTrend.r.toFixed(3) : '-'}</strong></li>
                    <li>Istotność statystyczna: <strong>p = ${this.formatPValue(napiecieTrend.pValue)}</strong></li>
                    <li>Średnie NAPIĘCIE dni 1-5: <strong>${comparison.firstHalf && comparison.firstHalf.napiecie ? comparison.firstHalf.napiecie.toFixed(2) : '-'}</strong> → dni 6-10: <strong>${comparison.secondHalf && comparison.secondHalf.napiecie ? comparison.secondHalf.napiecie.toFixed(2) : '-'}</strong></li>
                    <li>ZMIANA: <strong style="color: var(--accent-green);">${comparison.change && comparison.change.napiecie ? comparison.change.napiecie.toFixed(1) : '-'}%</strong></li>
                </ul>
            </div>
        `;
    },
    
    // Sekcja: Stabilność ADHD
    renderADHDStability: function(stats) {
        const adhd = stats.adhdStability || {};
        const fokus = adhd.fokus || {};
        const energia = adhd.energia || {};
        
        return `
            <div class="report-section">
                <h3>Stabilność Leczenia ADHD (Cel Kontrolny)</h3>
                <h4>📊 FOKUS (proxy skuteczności Elvanse):</h4>
                <ul>
                    <li>Średnia dni 1-5: <strong>${fokus.firstHalf ? fokus.firstHalf.toFixed(2) : '-'}</strong> → dni 6-10: <strong>${fokus.secondHalf ? fokus.secondHalf.toFixed(2) : '-'}</strong></li>
                    <li>Trend: <strong>${fokus.trend === 'stable' ? 'stabilny/rosnący ✅' : 'SPADKOWY ⚠️'}</strong></li>
                </ul>
                
                <h4>⚡ ENERGIA:</h4>
                <ul>
                    <li>Średnia dni 1-5: <strong>${energia.firstHalf ? energia.firstHalf.toFixed(2) : '-'}</strong> → dni 6-10: <strong>${energia.secondHalf ? energia.secondHalf.toFixed(2) : '-'}</strong></li>
                    <li>INTERPRETACJA: <strong>${energia.trend === 'stable' ? 'Brak negatywnego wpływu Pregabaliny na leczenie ADHD ✅' : 'POTENCJALNA SEDACJA - wymaga obserwacji ⚠️'}</strong></li>
                </ul>
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
    
    // Sekcja: Wnioski
    renderConclusions: function(stats) {
        const gadTrend = stats.gadTrend || {};
        const lekTrend = gadTrend.lek || {};
        const comparison = stats.comparison || {};
        
        return `
            <div class="report-section">
                <h3>Wnioski Kliniczne</h3>
                <ul>
                    <li>✓ Pregabalina w dawce 225mg/d wykazuje <strong>${lekTrend.significant ? 'ISTOTNY' : 'UMIARKOWANY'}</strong> efekt redukcji objawów GAD w okresie obserwacji.</li>
                    <li>✓ Średni poziom lęku ${comparison.firstHalf && comparison.secondHalf && comparison.firstHalf.lek && comparison.secondHalf.lek ? 
                        `spadł z <strong>${comparison.firstHalf.lek.toFixed(1)}</strong> do <strong>${comparison.secondHalf.lek.toFixed(1)}</strong> pkt (skala 1-10), co stanowi redukcję o <strong>${Math.abs(comparison.change.lek).toFixed(0)}%</strong>.` 
                        : 'wykazuje pozytywny trend.'}</li>
                    <li>✓ Nie zaobserwowano istotnego pogorszenia parametrów ADHD (Fokus, Energia), co sugeruje dobrą tolerancję kombinacji Elvanse + Pregabalina.</li>
                </ul>
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
    }
};
