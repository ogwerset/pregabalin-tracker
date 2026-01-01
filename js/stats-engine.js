/* ===== STATS ENGINE MODULE ===== */
const StatsEngine = {
    // Agregacja danych dziennych
    aggregateDaily: function(data) {
        if (!data || data.length === 0) return [];
        
        // Grupuj po dacie
        const dailyGroups = {};
        data.forEach(item => {
            const date = item.Data;
            if (!dailyGroups[date]) {
                dailyGroups[date] = [];
            }
            dailyGroups[date].push(item);
        });
        
        // Mapowanie nazw pól z polskimi znakami na klucze bez polskich znaków
        const fieldMap = {
            'Lęk': 'lek',
            'Napięcie': 'napiecie',
            'Fokus': 'fokus',
            'Energia': 'energia',
            'BrainFog': 'brainfog',
            'JakośćSnu': 'jakoscSnu',
            'GodzinySnu': 'godzinySnu'
        };
        
        // Oblicz średnie dla każdego dnia
        const dailyData = [];
        Object.keys(dailyGroups).sort((a, b) => {
            const [ad, am, ay] = a.split('/').map(Number);
            const [bd, bm, by] = b.split('/').map(Number);
            return new Date(ay, am-1, ad) - new Date(by, bm-1, bd);
        }).forEach(date => {
            const items = dailyGroups[date];
            const daily = { date: date };
            
            // Metryki (średnia z dnia)
            const metrics = {
                'Lęk': 'lek',
                'Napięcie': 'napiecie',
                'Fokus': 'fokus',
                'Energia': 'energia',
                'BrainFog': 'brainfog',
                'JakośćSnu': 'jakoscSnu',
                'GodzinySnu': 'godzinySnu'
            };
            
            Object.keys(metrics).forEach(mKey => {
                const values = items.map(i => i[mKey]).filter(v => v !== null && v !== undefined && !isNaN(v));
                const targetKey = metrics[mKey];
                daily[targetKey] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
            });
            
            // Suma dawki pregabaliny na dzień
            const pregDoses = items.map(i => i.Pregabalina_Dawka).filter(v => v !== null);
            daily.pregabalinaMg = pregDoses.length > 0 ? pregDoses.reduce((a, b) => a + b, 0) : null;
            
            dailyData.push(daily);
        });
        
        return dailyData;
    },
    
    // Agregacja po porze dnia
    aggregateByTimeOfDay: function(data) {
        const timeGroups = {
            'RANO': [],
            'POŁUDNIE': [],
            'POPOŁUDNIE': [],
            'WIECZÓR': []
        };
        
        data.forEach(item => {
            const time = item.PoraDnia;
            if (timeGroups[time]) {
                timeGroups[time].push(item);
            }
        });
        
        // Mapowanie nazw pól
        const fieldMap = {
            'Lęk': 'lek',
            'Napięcie': 'napiecie',
            'Fokus': 'fokus',
            'Energia': 'energia',
            'BrainFog': 'brainfog'
        };
        
        const result = {};
        Object.keys(timeGroups).forEach(time => {
            const items = timeGroups[time];
            const metrics = Object.keys(fieldMap);
            const stats = {};
            
            metrics.forEach(metric => {
                const values = items.map(i => i[metric]).filter(v => v !== null && v !== undefined && !isNaN(v));
                if (values.length > 0) {
                    const mean = values.reduce((a, b) => a + b, 0) / values.length;
                    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
                    const std = Math.sqrt(variance);
                    
                    const key = fieldMap[metric];
                    stats[key] = {
                        mean: mean,
                        std: std,
                        count: values.length,
                        values: values
                    };
                }
            });
            
            result[time] = stats;
        });
        
        return result;
    },
    
    // Regresja liniowa
    linearRegression: function(x, y) {
        if (!x || !y || x.length !== y.length || x.length < 2) {
            return { slope: 0, intercept: 0, r: 0, rSquared: 0, pValue: 1, standardError: 0 };
        }
        
        // Filtruj pary gdzie y nie jest null
        const validPairs = [];
        for (let i = 0; i < x.length; i++) {
            if (y[i] !== null && y[i] !== undefined && !isNaN(y[i])) {
                validPairs.push({ x: x[i], y: y[i] });
            }
        }
        
        if (validPairs.length < 2) {
            return { slope: 0, intercept: 0, r: 0, rSquared: 0, pValue: 1, standardError: 0 };
        }
        
        const n = validPairs.length;
        const xVals = validPairs.map(p => p.x);
        const yVals = validPairs.map(p => p.y);
        
        // Średnie
        const xMean = xVals.reduce((a, b) => a + b, 0) / n;
        const yMean = yVals.reduce((a, b) => a + b, 0) / n;
        
        // Oblicz slope i intercept
        let numerator = 0;
        let denominator = 0;
        for (let i = 0; i < n; i++) {
            numerator += (xVals[i] - xMean) * (yVals[i] - yMean);
            denominator += Math.pow(xVals[i] - xMean, 2);
        }
        
        const slope = denominator !== 0 ? numerator / denominator : 0;
        const intercept = yMean - slope * xMean;
        
        // Korelacja Pearsona
        let r = 0;
        let xVar = 0;
        let yVar = 0;
        for (let i = 0; i < n; i++) {
            const xDiff = xVals[i] - xMean;
            const yDiff = yVals[i] - yMean;
            r += xDiff * yDiff;
            xVar += xDiff * xDiff;
            yVar += yDiff * yDiff;
        }
        r = (xVar > 0 && yVar > 0) ? r / Math.sqrt(xVar * yVar) : 0;
        
        const rSquared = r * r;
        
        // Standard error
        let sumSquaredErrors = 0;
        for (let i = 0; i < n; i++) {
            const predicted = slope * xVals[i] + intercept;
            sumSquaredErrors += Math.pow(yVals[i] - predicted, 2);
        }
        const standardError = n > 2 ? Math.sqrt(sumSquaredErrors / (n - 2)) : 0;
        
        // P-value (t-test)
        let pValue = 1;
        if (standardError > 0 && n > 2) {
            const tStat = Math.abs(slope) / (standardError / Math.sqrt(xVar));
            if (typeof jStat !== 'undefined' && jStat.studentt) {
                pValue = 2 * (1 - jStat.studentt.cdf(tStat, n - 2));
            } else {
                // Fallback: aproksymacja
                pValue = tStat > 2 ? 0.05 : 1;
            }
        }
        
        return { slope, intercept, r, rSquared, pValue, standardError };
    },
    
    // Korelacja Pearsona
    pearsonCorrelation: function(x, y) {
        if (!x || !y || x.length !== y.length || x.length < 2) return 0;
        
        const validPairs = [];
        for (let i = 0; i < x.length; i++) {
            if (x[i] !== null && y[i] !== null && !isNaN(x[i]) && !isNaN(y[i])) {
                validPairs.push({ x: x[i], y: y[i] });
            }
        }
        
        if (validPairs.length < 2) return 0;
        
        if (typeof jStat !== 'undefined' && jStat.corrcoeff) {
            const xVals = validPairs.map(p => p.x);
            const yVals = validPairs.map(p => p.y);
            return jStat.corrcoeff(xVals, yVals);
        }
        
        // Fallback: ręczna implementacja
        const n = validPairs.length;
        const xMean = validPairs.reduce((sum, p) => sum + p.x, 0) / n;
        const yMean = validPairs.reduce((sum, p) => sum + p.y, 0) / n;
        
        let numerator = 0;
        let xVar = 0;
        let yVar = 0;
        
        validPairs.forEach(p => {
            const xDiff = p.x - xMean;
            const yDiff = p.y - yMean;
            numerator += xDiff * yDiff;
            xVar += xDiff * xDiff;
            yVar += yDiff * yDiff;
        });
        
        return (xVar > 0 && yVar > 0) ? numerator / Math.sqrt(xVar * yVar) : 0;
    },
    
    // Macierz korelacji
    correlationMatrix: function(data, variables) {
        if (!data || data.length === 0 || !variables || variables.length === 0) {
            return { matrix: [], labels: variables || [] };
        }
        
        // Przygotuj dane - agregacja dzienna
        const dailyData = this.aggregateDaily(data);
        if (dailyData.length === 0) {
            return { matrix: [], labels: variables };
        }
        
        // Mapuj nazwy zmiennych na pola w danych
        const fieldMap = {
            'lek': 'lek',
            'napiecie': 'napiecie',
            'jakoscsnu': 'jakoscSnu',
            'brainfog': 'brainfog',
            'energia': 'energia',
            'fokus': 'fokus',
            'pregabalina': 'pregabalinaMg'
        };
        
        // Pobierz wartości dla każdej zmiennej
        const varData = {};
        variables.forEach(v => {
            const field = fieldMap[v.toLowerCase()] || v.toLowerCase();
            varData[v] = dailyData.map(d => d[field]).filter(v => v !== null && v !== undefined);
        });
        
        // Oblicz macierz korelacji
        const matrix = [];
        variables.forEach((v1, i) => {
            const row = [];
            variables.forEach((v2, j) => {
                if (i === j) {
                    row.push(1.0);
                } else {
                    const corr = this.pearsonCorrelation(varData[v1], varData[v2]);
                    row.push(isNaN(corr) ? 0 : corr);
                }
            });
            matrix.push(row);
        });
        
        return { matrix, labels: variables };
    },
    
    // Porównanie połów
    compareHalves: function(dailyData) {
        if (!dailyData || dailyData.length === 0) {
            return { firstHalf: {}, secondHalf: {}, change: {} };
        }
        
        const mid = Math.ceil(dailyData.length / 2);
        const firstHalf = dailyData.slice(0, mid);
        const secondHalf = dailyData.slice(mid);
        
        const metrics = ['lek', 'napiecie', 'fokus', 'energia', 'brainfog', 'jakoscSnu'];
        const result = { firstHalf: {}, secondHalf: {}, change: {} };
        
        metrics.forEach(metric => {
            const firstValues = firstHalf.map(d => d[metric]).filter(v => v !== null && v !== undefined);
            const secondValues = secondHalf.map(d => d[metric]).filter(v => v !== null && v !== undefined);
            
            if (firstValues.length > 0 && secondValues.length > 0) {
                const firstMean = firstValues.reduce((a, b) => a + b, 0) / firstValues.length;
                const secondMean = secondValues.reduce((a, b) => a + b, 0) / secondValues.length;
                
                result.firstHalf[metric] = firstMean;
                result.secondHalf[metric] = secondMean;
                result.change[metric] = firstMean !== 0 ? ((secondMean - firstMean) / firstMean) * 100 : 0;
            }
        });
        
        return result;
    },
    
    // Przygotuj dane do heatmapy Dni × Pora Dnia
    prepareDayTimeMatrix: function(data, metric) {
        if (!data || data.length === 0) return { dates: [], timeOfDay: [], matrix: [] };
        
        // Pobierz unikalne daty i pory dnia
        const dates = [...new Set(data.map(d => d.Data))].sort((a, b) => {
            const [d1, m1, y1] = a.split('/').map(Number);
            const [d2, m2, y2] = b.split('/').map(Number);
            return new Date(y1, m1-1, d1) - new Date(y2, m2-1, d2);
        });
        const timeOfDay = ['RANO', 'POŁUDNIE', 'POPOŁUDNIE', 'WIECZÓR'];
        
        // Mapuj nazwę metryki na pola w znormalizowanych danych
        const metricMap = {
            'lek': 'Lęk',
            'napiecie': 'Napięcie',
            'fokus': 'Fokus',
            'energia': 'Energia',
            'brainfog': 'BrainFog'
        };
        
        const metricField = metricMap[metric.toLowerCase()] || metric;
        const isInvertMetric = metric.toLowerCase() === 'brainfog';
        
        // Utwórz macierz (pustą)
        const matrix = timeOfDay.map(() => dates.map(() => null));
        
        // Wypełnij macierz średnimi wartościami
        dates.forEach((date, dateIdx) => {
            timeOfDay.forEach((time, timeIdx) => {
                const items = data.filter(d => d.Data === date && d.PoraDnia === time);
                if (items.length > 0) {
                    const values = items.map(i => {
                        const v = i[metricField];
                        if (v === null || v === undefined || isNaN(v)) return null;
                        return isInvertMetric ? 11 - v : v;
                    }).filter(v => v !== null);
                    
                    if (values.length > 0) {
                        matrix[timeIdx][dateIdx] = values.reduce((a, b) => a + b, 0) / values.length;
                    }
                }
            });
        });
        
        return { dates, timeOfDay, matrix };
    },
    
    // Oblicz średnie i trendy dla okresów 3-dniowych
    compute3DayPeriods: function(dailyData) {
        if (!dailyData || dailyData.length === 0) return [];
        
        const periods = [];
        const metrics = ['lek', 'napiecie', 'fokus', 'energia', 'brainfog', 'jakoscSnu'];
        
        // Podziel dane na okresy 3-dniowe
        for (let i = 0; i < dailyData.length; i += 3) {
            const periodData = dailyData.slice(i, i + 3);
            if (periodData.length === 0) continue;
            
            const period = {
                periodNumber: Math.floor(i / 3) + 1,
                startDate: periodData[0].date,
                endDate: periodData[periodData.length - 1].date,
                days: periodData.length,
                averages: {},
                trends: {}
            };
            
            // Oblicz średnie dla każdej metryki
            metrics.forEach(metric => {
                const values = periodData.map(d => d[metric]).filter(v => v !== null && v !== undefined);
                if (values.length > 0) {
                    period.averages[metric] = values.reduce((a, b) => a + b, 0) / values.length;
                } else {
                    period.averages[metric] = null;
                }
            });
            
            // Oblicz trend (slope) dla każdej metryki w tym okresie
            metrics.forEach(metric => {
                const values = periodData.map(d => d[metric]).filter(v => v !== null && v !== undefined);
                if (values.length >= 2) {
                    const dayNumbers = values.map((_, idx) => idx + 1);
                    const trend = this.linearRegression(dayNumbers, values);
                    period.trends[metric] = trend ? trend.slope : 0;
                } else {
                    period.trends[metric] = 0;
                }
            });
            
            periods.push(period);
        }
        
        return periods;
    },
    
    // Główna funkcja obliczająca wszystkie statystyki
    computeAll: function(data) {
        if (!data || data.length === 0) {
            return {
                period: { start: null, end: null, days: 0, measurements: 0 },
                gadTrend: { lek: {}, napiecie: {} },
                comparison: {},
                adhdStability: {},
                intradayPatterns: {},
                threeDayPeriods: []
            };
        }
        
        const dailyData = this.aggregateDaily(data);
        const dates = [...new Set(data.map(d => d.Data))].sort();
        
        // Okres obserwacji
        const period = {
            start: dates[0] || null,
            end: dates[dates.length - 1] || null,
            days: dates.length,
            measurements: data.length
        };
        
        // Trendy GAD (regresja liniowa)
        const dayNumbers = dailyData.map((_, i) => i + 1);
        const lekValues = dailyData.map(d => d.lek).filter(v => v !== null);
        const napiecieValues = dailyData.map(d => d.napiecie).filter(v => v !== null);
        
        const lekTrend = this.linearRegression(dayNumbers.slice(0, lekValues.length), lekValues);
        const napiecieTrend = this.linearRegression(dayNumbers.slice(0, napiecieValues.length), napiecieValues);
        
        // Porównanie połów
        const comparison = this.compareHalves(dailyData);
        
        // Stabilność ADHD
        const fokusFirst = comparison.firstHalf.fokus || 0;
        const fokusSecond = comparison.secondHalf.fokus || 0;
        const energiaFirst = comparison.firstHalf.energia || 0;
        const energiaSecond = comparison.secondHalf.energia || 0;
        
        const adhdStability = {
            fokus: {
                trend: fokusSecond >= fokusFirst - 0.5 ? 'stable' : 'declining',
                firstHalf: fokusFirst,
                secondHalf: fokusSecond
            },
            energia: {
                trend: energiaSecond >= energiaFirst - 0.5 ? 'stable' : 'declining',
                firstHalf: energiaFirst,
                secondHalf: energiaSecond
            }
        };
        
        // Wzorce dobowe
        const intradayData = this.aggregateByTimeOfDay(data);
        const avgByTime = {};
        Object.keys(intradayData).forEach(time => {
            if (intradayData[time].lek) {
                avgByTime[time] = intradayData[time].lek.mean;
            }
        });
        
        const worstTime = Object.keys(avgByTime).reduce((a, b) => 
            avgByTime[a] > avgByTime[b] ? a : b, Object.keys(avgByTime)[0]);
        const bestTime = Object.keys(avgByTime).reduce((a, b) => 
            avgByTime[a] < avgByTime[b] ? a : b, Object.keys(avgByTime)[0]);
        
        // Okresy 3-dniowe
        const threeDayPeriods = this.compute3DayPeriods(dailyData);
        
        return {
            period,
            gadTrend: {
                lek: { ...lekTrend, significant: lekTrend.pValue < 0.05 },
                napiecie: { ...napiecieTrend, significant: napiecieTrend.pValue < 0.05 }
            },
            comparison,
            adhdStability,
            intradayPatterns: {
                worstTimeOfDay: worstTime,
                bestTimeOfDay: bestTime,
                avgByTime: avgByTime
            },
            threeDayPeriods,
            dailyData,
            intradayData
        };
    }
};
