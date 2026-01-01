/* ===== CHART RENDERER MODULE ===== */
const ChartRenderer = {
    currentTheme: 'dark',
    
    // Plotly templates
    getTemplate: function() {
        const isDark = true; // Always dark mode
        const isMobile = window.innerWidth < 768;
        const isSmallMobile = window.innerWidth < 480;
        
        const fontSize = isSmallMobile ? 10 : (isMobile ? 11 : 12);
        const titleSize = isSmallMobile ? 13 : (isMobile ? 14 : 16);
        const tickFontSize = isSmallMobile ? 9 : (isMobile ? 10 : 11);
        
        return {
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { 
                color: '#D6D3CE',
                family: 'Inter, sans-serif',
                size: fontSize
            },
            title: {
                font: { size: titleSize, family: 'Merriweather, serif', weight: 700, color: '#D6D3CE' }
            },
            xaxis: {
                gridcolor: isDark ? 'var(--border)' : 'var(--border)',
                linecolor: isDark ? 'var(--border)' : 'var(--border)',
                color: '#57534E',
                title: { font: { color: '#57534E' } },
                tickfont: { family: 'Inter, sans-serif', size: tickFontSize, color: '#57534E' }
            },
            yaxis: {
                gridcolor: isDark ? 'var(--border)' : 'var(--border)',
                linecolor: isDark ? 'var(--border)' : 'var(--border)',
                color: '#57534E',
                title: { font: { color: '#57534E' } },
                tickfont: { family: 'Inter, sans-serif', size: tickFontSize, color: '#57534E' }
            },
            // Disable drag on mobile for better touch experience
            dragmode: isMobile ? false : 'zoom'
        };
    },
    
    // Helper: Get mobile-aware margin
    getMobileMargin: function() {
        const isMobile = window.innerWidth < 768;
        return isMobile 
            ? { t: 35, r: 10, b: 35, l: 35 }
            : { t: 60, r: 20, b: 60, l: 60 };
    },
    
    // ResizeObserver for responsive charts
    chartObservers: {},
    
    setupResizeObserver: function(containerId) {
        const container = document.getElementById(containerId);
        if (!container || this.chartObservers[containerId]) return;
        
        const observer = new ResizeObserver(() => {
            if (container && container.data) {
                Plotly.Plots.resize(containerId);
            }
        });
        observer.observe(container);
        this.chartObservers[containerId] = observer;
    },
    
    // Ustaw theme
    setTheme: function(theme) {
        this.currentTheme = theme;
        this.updateAllCharts();
    },
    
    // Aktualizuj wszystkie wykresy
    updateAllCharts: function() {
        const template = this.getTemplate();
        const chartIds = ['plot-gad', 'plot-intraday', 'plot-adhd', 'plot-stacked-area', 'plot-correlation', 'plot-sleep', 'plot-sleep-anxiety', 'plot-rolling-avg', 'plot-weekly', 'plot-positive-vs-negative', 'plot-metrics-by-time'];
        chartIds.forEach(id => {
            const element = document.getElementById(id);
            if (element && element.data) {
                Plotly.relayout(id, template);
            }
        });
    },
    
    // Wykres 1: GAD Trajectory
    renderGADTrajectory: function(containerId, dailyData, stats) {
        if (!dailyData || dailyData.length === 0) return;
        
        const dates = dailyData.map(d => {
            const [day, month, year] = d.date.split('/');
            return `${year}-${month}-${day}`;
        });
        
        const lekValues = dailyData.map(d => d.lek).filter(v => v !== null);
        const napiecieValues = dailyData.map(d => d.napiecie).filter(v => v !== null);
        
        // Trace 1: Lęk
        const trace1 = {
            x: dates,
            y: lekValues,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Lęk (średnia dzienna)',
                    line: { color: '#EF4444', width: 3 }, // Keep red for anxiety
                    marker: { size: 12, color: '#EF4444' },
            hovertemplate: '<b>%{x|%d/%m/%Y}</b><br>Lęk: %{y:.2f}<extra></extra>'
        };
        
        // Trace 2: Napięcie
        const trace2 = {
            x: dates,
            y: napiecieValues,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Napięcie (średnia dzienna)',
                    line: { color: '#3B82F6', width: 3 }, // Medical blue
                    marker: { size: 12, color: '#3B82F6', symbol: 'square' },
            hovertemplate: '<b>%{x|%d/%m/%Y}</b><br>Napięcie: %{y:.2f}<extra></extra>'
        };
        
        // Trend lines
        const dayNumbers = dailyData.map((_, i) => i + 1);
        let trace3 = null, trace4 = null;
        
        if (stats && stats.gadTrend) {
            const lekTrend = stats.gadTrend.lek;
            const napiecieTrend = stats.gadTrend.napiecie;
            
            if (lekTrend.slope !== undefined) {
                const trendLek = dayNumbers.map(x => lekTrend.slope * x + lekTrend.intercept);
                trace3 = {
                    x: dates,
                    y: trendLek,
                    type: 'scatter',
                    mode: 'lines',
                    name: `Trend Lęku (slope=${lekTrend.slope.toFixed(3)}, p=${lekTrend.pValue.toFixed(3)})`,
                    line: { color: '#DC2626', width: 2, dash: 'dash' },
                    hovertemplate: 'Trend Lęku: %{y:.2f}<extra></extra>'
                };
            }
            
            if (napiecieTrend.slope !== undefined) {
                const trendNap = dayNumbers.map(x => napiecieTrend.slope * x + napiecieTrend.intercept);
                trace4 = {
                    x: dates,
                    y: trendNap,
                    type: 'scatter',
                    mode: 'lines',
                    name: `Trend Napięcia (slope=${napiecieTrend.slope.toFixed(3)}, p=${napiecieTrend.pValue.toFixed(3)})`,
                    line: { color: '#2563EB', width: 2, dash: 'dash' },
                    hovertemplate: 'Trend Napięcia: %{y:.2f}<extra></extra>'
                };
            }
        }
        
        const traces = [trace1, trace2];
        if (trace3) traces.push(trace3);
        if (trace4) traces.push(trace4);
        
        // Shapes i annotations
        const shapes = [{
            type: 'rect',
            xref: 'paper',
            yref: 'y',
            x0: 0,
            y0: 0,
            x1: 1,
            y1: 2,
            fillcolor: 'rgba(16, 185, 129, 0.15)',
            line: { width: 0 }
        }];
        
        const annotations = [{
            x: dates[Math.floor(dates.length / 2)],
            y: 0.5,
            text: 'STREFA NISKIEGO LĘKU',
            showarrow: false,
            font: { color: '#10B981', size: 10 },
            bgcolor: 'rgba(16, 185, 129, 0.2)',
            bordercolor: '#10B981',
            borderwidth: 1
        }];
        
        const template = this.getTemplate();
        const layout = {
            ...template,
            title: {
                text: 'Trajektoria Leczenia GAD - Pregabalina',
                font: { size: 16 }
            },
            xaxis: {
                ...template.xaxis,
                title: 'Data',
                tickformat: '%d/%m',
                tickangle: -45
            },
            yaxis: {
                ...template.yaxis,
                title: 'Poziom (skala 1-10)',
                range: [0, 7]
            },
            shapes: shapes,
            annotations: annotations,
            legend: { 
                orientation: 'h',
                x: 0.5,
                xanchor: 'center',
                y: -0.4,
                font: { color: '#78716C', family: 'Inter, sans-serif', size: 12 },
                bgcolor: 'rgba(31, 41, 55, 0.95)',
                bordercolor: template.xaxis.gridcolor,
                borderwidth: 1
            },
            hovermode: 'x unified',
            margin: (() => {
                const m = ChartRenderer.getMobileMargin();
                return { t: m.t, r: m.r, b: m.b + 100, l: m.l };
            })()
        };
        
        const isMobile = window.innerWidth < 768;
        Plotly.newPlot(containerId, traces, layout, {
            responsive: true,
            displayModeBar: false
        });
        this.setupResizeObserver(containerId);
    },
    
    // Wykres 2: Intraday Profile (Simplified Bar Chart)
    renderIntradayProfile: function(containerId, intradayData) {
        if (!intradayData) return;
        
        const timeOrder = ['RANO', 'POŁUDNIE', 'POPOŁUDNIE', 'WIECZÓR'];
        const lekMeans = timeOrder.map(time => 
            (intradayData[time] && intradayData[time].lek) ? intradayData[time].lek.mean : 0
        );
        const napiecieMeans = timeOrder.map(time => 
            (intradayData[time] && intradayData[time].napiecie) ? intradayData[time].napiecie.mean : 0
        );
        
        const trace1 = {
            x: timeOrder,
            y: lekMeans,
            type: 'bar',
            name: 'Średni Lęk',
            marker: { color: '#EF4444' },
            text: lekMeans.map(v => v > 0 ? v.toFixed(1) : ''),
            textposition: 'auto',
        };
        
        const trace2 = {
            x: timeOrder,
            y: napiecieMeans,
            type: 'bar',
            name: 'Średnie Napięcie',
            marker: { color: '#3B82F6' },
            text: napiecieMeans.map(v => v > 0 ? v.toFixed(1) : ''),
            textposition: 'auto',
        };
        
        const template = this.getTemplate();
        const layout = {
            ...template,
            title: {
                text: 'Nasilenie Objawów vs Pora Dnia (Średnie)',
                font: { size: 16 }
            },
            xaxis: {
                ...template.xaxis,
                title: 'Pora dnia'
            },
            yaxis: {
                ...template.yaxis,
                title: 'Średni Poziom (1-10)',
                range: [0, 11]
            },
            barmode: 'group',
            legend: { 
                orientation: 'h',
                x: 0.5,
                xanchor: 'center',
                y: -0.4,
                font: { color: '#78716C', family: 'Inter, sans-serif', size: 12 },
                bgcolor: 'rgba(31, 41, 55, 0.95)',
                bordercolor: 'var(--border)',
                borderwidth: 1
            },
            margin: (() => {
                const m = ChartRenderer.getMobileMargin();
                return { t: m.t, r: m.r, b: m.b + 100, l: m.l };
            })()
        };
        
        const isMobile = window.innerWidth < 768;
        Plotly.react(containerId, [trace1, trace2], layout, {
            responsive: true,
            displayModeBar: false
        });
        this.setupResizeObserver(containerId);
    },
    
    // Wykres 3: ADHD Stability
    renderADHDStability: function(containerId, dailyData) {
        if (!dailyData || dailyData.length === 0) return;
        
        const dates = dailyData.map(d => {
            const [day, month, year] = d.date.split('/');
            return `${year}-${month}-${day}`;
        });
        
        // Nie używamy filter bo to zmienia długość tablicy
        const fokusValues = dailyData.map(d => d.fokus);
        const energiaValues = dailyData.map(d => d.energia);
        // Brain Fog to negatywny objaw - odwracamy: Klarowność = 11 - BrainFog (tak by 10->1, 1->10)
        const klarownoscValues = dailyData.map(d => (d.brainfog !== null && d.brainfog !== undefined) ? 11 - d.brainfog : null);
        
        const trace1 = {
            x: dates,
            y: fokusValues,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Fokus',
            connectgaps: true,
            line: { color: '#10B981', width: 3 },
            marker: { size: 10, color: '#10B981' }
        };
        
        const trace2 = {
            x: dates,
            y: energiaValues,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Energia',
            connectgaps: true,
            line: { color: '#F59E0B', width: 3 },
            marker: { size: 10, color: '#F59E0B', symbol: 'square' }
        };
        
        const trace3 = {
            x: dates,
            y: klarownoscValues,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'KLAROWNOŚĆ',
            connectgaps: true,
                    line: { color: '#14B8A6', width: 3, dash: 'dot' }, // Medical teal
                    marker: { size: 8, color: '#14B8A6', symbol: 'triangle-up' },
            opacity: 0.8
        };
        
        const template = this.getTemplate();
        const layout = {
            ...template,
            title: {
                text: 'Kontrola Stabilności Leczenia ADHD (Elvanse 70mg)',
                font: { size: 16, family: 'Merriweather, serif', weight: 700 }
            },
            xaxis: {
                ...template.xaxis,
                title: 'Data',
                tickformat: '%d/%m',
                tickangle: -45
            },
            yaxis: {
                ...template.yaxis,
                title: 'Poziom (skala 1-10)',
                range: [0, 10]
            },
            shapes: [{
                type: 'rect',
                xref: 'paper',
                yref: 'y',
                x0: 0,
                y0: 4,
                x1: 1,
                y1: 8,
                fillcolor: 'rgba(16, 185, 129, 0.1)',
                line: { width: 0 }
            }],
            annotations: [{
                x: dates[Math.floor(dates.length / 2)],
                y: 7.5,
                text: 'STREFA OPTYMALNEGO FUNKCJONOWANIA',
                showarrow: false,
                font: { color: '#10B981', size: 10, family: 'Inter, sans-serif' },
                bgcolor: 'rgba(16, 185, 129, 0.2)',
                bordercolor: '#10B981',
                borderwidth: 1
            }],
            legend: { 
                orientation: 'h',
                x: 0.5,
                xanchor: 'center',
                y: -0.4,
                font: { color: '#78716C', family: 'Inter, sans-serif', size: 12 },
                bgcolor: 'rgba(31, 41, 55, 0.95)',
                bordercolor: template.xaxis.gridcolor,
                borderwidth: 1
            },
            hovermode: 'x unified',
            margin: (() => {
                const m = ChartRenderer.getMobileMargin();
                return { t: m.t, r: m.r, b: m.b + 100, l: m.l };
            })()
        };
        
        Plotly.newPlot(containerId, [trace1, trace2, trace3], layout, {
            responsive: true,
            displayModeBar: false
        });
    },
    
    // Wykres 4: Stacked Area Chart - Objawy w ciągu dnia
    renderStackedAreaByTimeOfDay: function(containerId, data) {
        if (!data || data.length === 0) return;
        
        const timeOrder = ['RANO', 'POŁUDNIE', 'POPOŁUDNIE', 'WIECZÓR'];
        
        // Agreguj średnie dla każdej pory dnia
        const aggregated = {};
        timeOrder.forEach(time => {
            aggregated[time] = {
                lek: [],
                napiecie: [],
                fokus: [],
                energia: [],
                brainfog: []
            };
        });
        
        data.forEach(d => {
            const time = d.PoraDnia;
            if (aggregated[time]) {
                if (d.Lęk !== null) aggregated[time].lek.push(d.Lęk);
                if (d.Napięcie !== null) aggregated[time].napiecie.push(d.Napięcie);
                if (d.Fokus !== null) aggregated[time].fokus.push(d.Fokus);
                if (d.Energia !== null) aggregated[time].energia.push(d.Energia);
                if (d.BrainFog !== null) aggregated[time].brainfog.push(d.BrainFog);
            }
        });
        
        const calculateMean = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        
        const lek = timeOrder.map(t => calculateMean(aggregated[t].lek));
        const napiecie = timeOrder.map(t => calculateMean(aggregated[t].napiecie));
        const fokus = timeOrder.map(t => calculateMean(aggregated[t].fokus));
        const energia = timeOrder.map(t => calculateMean(aggregated[t].energia));
        const klarownosc = timeOrder.map(t => {
            const vals = aggregated[t].brainfog;
            return vals.length > 0 ? calculateMean(vals.map(v => 11 - v)) : 0;
        });
        
        const trace1 = {
            x: timeOrder,
            y: lek,
            name: 'Lęk',
            type: 'scatter',
            mode: 'lines',
            fill: 'tonexty',
            fillcolor: 'rgba(239, 68, 68, 0.3)',
            line: { color: '#EF4444', width: 2 },
            stackgroup: 'one'
        };
        
        const trace2 = {
            x: timeOrder,
            y: napiecie,
            name: 'Napięcie',
            type: 'scatter',
            mode: 'lines',
            fill: 'tonexty',
            fillcolor: 'rgba(59, 130, 246, 0.3)',
            line: { color: '#3B82F6', width: 2 },
            stackgroup: 'one'
        };
        
        const trace3 = {
            x: timeOrder,
            y: fokus,
            name: 'Fokus',
            type: 'scatter',
            mode: 'lines',
            fill: 'tonexty',
            fillcolor: 'rgba(16, 185, 129, 0.3)',
            line: { color: '#10B981', width: 2 },
            stackgroup: 'two'
        };
        
        const trace4 = {
            x: timeOrder,
            y: energia,
            name: 'Energia',
            type: 'scatter',
            mode: 'lines',
            fill: 'tonexty',
            fillcolor: 'rgba(245, 158, 11, 0.3)',
            line: { color: '#F59E0B', width: 2 },
            stackgroup: 'two'
        };
        
        const trace5 = {
            x: timeOrder,
            y: klarownosc,
            name: 'Klarowność',
            type: 'scatter',
            mode: 'lines',
            fill: 'tonexty',
            fillcolor: 'rgba(139, 92, 246, 0.3)',
                    line: { color: '#14B8A6', width: 2 }, // Medical teal
            stackgroup: 'two'
        };
        
        const template = this.getTemplate();
        const layout = {
            ...template,
            title: {
                text: 'Objawy w Ciągu Dnia - Stacked Area',
                font: { size: 16 }
            },
            xaxis: {
                ...template.xaxis,
                title: 'Pora Dnia',
                type: 'category'
            },
            yaxis: {
                ...template.yaxis,
                title: 'Suma Wartości',
                range: [0, null]
            },
            legend: { 
                orientation: 'h',
                x: 0.5,
                xanchor: 'center',
                y: -0.4,
                font: { color: '#78716C', family: 'Inter, sans-serif', size: 12 },
                bgcolor: 'rgba(31, 41, 55, 0.95)',
                bordercolor: 'var(--border)',
                borderwidth: 1
            },
            margin: (() => {
                const m = ChartRenderer.getMobileMargin();
                return { t: m.t, r: m.r, b: m.b + 100, l: m.l };
            })()
        };
        
        Plotly.newPlot(containerId, [trace1, trace2, trace3, trace4, trace5], layout, {
            responsive: true,
            displayModeBar: false
        });
    },
    
    // Wykres 11: Pozytywne vs Negatywne Objawy
    renderPositiveVsNegative: function(containerId, dailyData) {
        if (!dailyData || dailyData.length === 0) return;
        
        // Oblicz średnie pozytywne i negatywne dla każdego dnia
        const positiveScores = [];
        const negativeScores = [];
        const doses = [];
        const dates = [];
        
        dailyData.forEach(d => {
            const positive = [];
            const negative = [];
            
            if (d.fokus !== null) positive.push(d.fokus);
            if (d.energia !== null) positive.push(d.energia);
            if (d.brainfog !== null) positive.push(11 - d.brainfog); // Klarowność
            
            if (d.lek !== null) negative.push(d.lek);
            if (d.napiecie !== null) negative.push(d.napiecie);
            
            if (positive.length > 0 && negative.length > 0) {
                positiveScores.push(positive.reduce((a, b) => a + b, 0) / positive.length);
                negativeScores.push(negative.reduce((a, b) => a + b, 0) / negative.length);
                doses.push(d.pregabalinaMg || 0);
                dates.push(d.date);
            }
        });
        
        if (positiveScores.length === 0) return;
        
        // Kolor punktów na podstawie dawki
        const maxDose = Math.max(...doses);
        const colors = doses.map(d => {
            const ratio = maxDose > 0 ? d / maxDose : 0;
            return `rgba(139, 92, 246, ${0.3 + ratio * 0.7})`;
        });
        
        const trace1 = {
            x: positiveScores,
            y: negativeScores,
            type: 'scatter',
            mode: 'markers',
            name: 'Dni',
            marker: {
                size: 10,
                color: colors,
                line: { color: '#14B8A6', width: 1 } // Medical teal
            },
            text: dates,
            hovertemplate: 'Pozytywne: %{x:.2f}<br>Negatywne: %{y:.2f}<br>Data: %{text}<extra></extra>'
        };
        
        // Linia regresji
        let trace2 = null;
        if (positiveScores.length > 1) {
            const regression = StatsEngine.linearRegression(positiveScores, negativeScores);
            if (regression && !isNaN(regression.slope)) {
                const xMin = Math.min(...positiveScores);
                const xMax = Math.max(...positiveScores);
                const yMin = regression.slope * xMin + regression.intercept;
                const yMax = regression.slope * xMax + regression.intercept;
                
                trace2 = {
                    x: [xMin, xMax],
                    y: [yMin, yMax],
                    type: 'scatter',
                    mode: 'lines',
                    name: `Regresja (r=${regression.r.toFixed(2)})`,
                    line: { color: '#DC2626', width: 2, dash: 'dash' },
                    hovertemplate: 'Regresja: y = %{y:.2f}<extra></extra>'
                };
            }
        }
        
        const traces = [trace1];
        if (trace2) traces.push(trace2);
        
        const template = this.getTemplate();
        const layout = {
            ...template,
            title: {
                text: 'Korelacja: Objawy Pozytywne vs Negatywne',
                font: { size: 16 }
            },
            xaxis: {
                ...template.xaxis,
                title: 'Średnia Objawów Pozytywnych (Fokus + Energia + Klarowność)',
                range: [0, 10]
            },
            yaxis: {
                ...template.yaxis,
                title: 'Średnia Objawów Negatywnych (Lęk + Napięcie)',
                range: [0, 10]
            },
            legend: { 
                orientation: 'h',
                x: 0.5,
                xanchor: 'center',
                y: -0.4,
                font: { color: '#78716C', family: 'Inter, sans-serif', size: 12 },
                bgcolor: 'rgba(31, 41, 55, 0.95)',
                bordercolor: 'var(--border)',
                borderwidth: 1
            },
            margin: (() => {
                const m = ChartRenderer.getMobileMargin();
                return { t: m.t, r: m.r, b: m.b + 100, l: m.l };
            })()
        };
        
        const isMobile = window.innerWidth < 768;
        Plotly.newPlot(containerId, traces, layout, {
            responsive: true,
            displayModeBar: false
        });
        this.setupResizeObserver(containerId);
    },
    
    // Wykres 12: Wszystkie Metryki per Pora Dnia
    renderMetricsByTimeOfDay: function(containerId, data) {
        if (!data || data.length === 0) return;
        
        const timeOrder = ['RANO', 'POŁUDNIE', 'POPOŁUDNIE', 'WIECZÓR'];
        
        // Agreguj średnie dla każdej pory dnia
        const aggregated = {};
        timeOrder.forEach(time => {
            aggregated[time] = {
                lek: [],
                napiecie: [],
                fokus: [],
                energia: [],
                brainfog: []
            };
        });
        
        data.forEach(d => {
            const time = d.PoraDnia;
            if (aggregated[time]) {
                if (d.Lęk !== null) aggregated[time].lek.push(d.Lęk);
                if (d.Napięcie !== null) aggregated[time].napiecie.push(d.Napięcie);
                if (d.Fokus !== null) aggregated[time].fokus.push(d.Fokus);
                if (d.Energia !== null) aggregated[time].energia.push(d.Energia);
                if (d.BrainFog !== null) aggregated[time].brainfog.push(d.BrainFog);
            }
        });
        
        const calculateMean = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        
        const lek = timeOrder.map(t => calculateMean(aggregated[t].lek));
        const napiecie = timeOrder.map(t => calculateMean(aggregated[t].napiecie));
        const fokus = timeOrder.map(t => calculateMean(aggregated[t].fokus));
        const energia = timeOrder.map(t => calculateMean(aggregated[t].energia));
        const klarownosc = timeOrder.map(t => {
            const vals = aggregated[t].brainfog;
            return vals.length > 0 ? calculateMean(vals.map(v => 11 - v)) : 0;
        });
        
        const trace1 = {
            x: timeOrder,
            y: lek,
            type: 'bar',
            name: 'Lęk',
            marker: { color: '#EF4444' },
            text: lek.map(v => v > 0 ? v.toFixed(1) : ''),
            textposition: 'auto'
        };
        
        const trace2 = {
            x: timeOrder,
            y: napiecie,
            type: 'bar',
            name: 'Napięcie',
            marker: { color: '#3B82F6' },
            text: napiecie.map(v => v > 0 ? v.toFixed(1) : ''),
            textposition: 'auto'
        };
        
        const trace3 = {
            x: timeOrder,
            y: fokus,
            type: 'bar',
            name: 'Fokus',
            marker: { color: '#10B981' },
            text: fokus.map(v => v > 0 ? v.toFixed(1) : ''),
            textposition: 'auto'
        };
        
        const trace4 = {
            x: timeOrder,
            y: energia,
            type: 'bar',
            name: 'Energia',
            marker: { color: '#F59E0B' },
            text: energia.map(v => v > 0 ? v.toFixed(1) : ''),
            textposition: 'auto'
        };
        
        const trace5 = {
            x: timeOrder,
            y: klarownosc,
            type: 'bar',
            name: 'Klarowność',
                    marker: { color: '#14B8A6' }, // Medical teal
            text: klarownosc.map(v => v > 0 ? v.toFixed(1) : ''),
            textposition: 'auto'
        };
        
        const template = this.getTemplate();
        const layout = {
            ...template,
            title: {
                text: 'Wszystkie Metryki per Pora Dnia',
                font: { size: 16 }
            },
            xaxis: {
                ...template.xaxis,
                title: 'Pora Dnia',
                type: 'category'
            },
            yaxis: {
                ...template.yaxis,
                title: 'Średni Poziom (1-10)',
                range: [0, 10]
            },
            barmode: 'group',
            legend: { 
                orientation: 'h',
                x: 0.5,
                xanchor: 'center',
                y: -0.4,
                font: { color: '#78716C', family: 'Inter, sans-serif', size: 12 },
                bgcolor: 'rgba(31, 41, 55, 0.95)',
                bordercolor: 'var(--border)',
                borderwidth: 1
            },
            margin: (() => {
                const m = ChartRenderer.getMobileMargin();
                return { t: m.t, r: m.r, b: m.b + 100, l: m.l };
            })()
        };
        
        Plotly.newPlot(containerId, [trace1, trace2, trace3, trace4, trace5], layout, {
            responsive: true,
            displayModeBar: false
        });
    },
    
    // Wykres 5: Correlation Table (Readable grid)
    renderCorrelationTable: function(containerId, correlationData) {
        const container = document.getElementById('correlation-table-container');
        if (!container || !correlationData || !correlationData.matrix) return;
        
        const { matrix, labels } = correlationData;
        
        let html = `
            <table class="correlation-grid" style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: center; color: var(--text-primary);">
                <thead>
                    <tr>
                        <th style="padding: 12px 8px; border: 1px solid var(--border); background: var(--bg-hover);">Zmienna</th>
                        ${labels.map(l => `<th style="padding: 12px 8px; border: 1px solid var(--border); background: var(--bg-hover);">${l}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
        `;
        
        matrix.forEach((row, i) => {
            html += `<tr><td style="padding: 12px 8px; border: 1px solid var(--border); background: var(--bg-hover); font-weight: 600; text-align: left;">${labels[i]}</td>`;
            row.forEach((val, j) => {
                let bgColor = 'transparent';
                let textColor = 'inherit';
                let opacity = Math.abs(val);
                
                if (val !== null && i >= j) { // Show lower triangle only
                    if (val > 0.3) bgColor = `rgba(16, 185, 129, ${opacity * 0.6})`;
                    else if (val < -0.3) bgColor = `rgba(239, 68, 68, ${opacity * 0.6})`;
                    
                    if (opacity > 0.6) textColor = '#fff';
                } else if (i < j) {
                    val = null;
                }
                
                html += `
                    <td style="padding: 12px 8px; border: 1px solid var(--border); background: ${bgColor}; color: ${textColor};">
                        ${val !== null ? val.toFixed(2) : ''}
                    </td>
                `;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
        
        this.updateCorrelationSummary(correlationData);
    },
    
    // Wykres 6: Sleep Analysis (Time vs Quality)
    renderSleepChart: function(containerId, dailyData) {
        if (!dailyData || dailyData.length === 0) return;
        
        const dates = dailyData.map(d => {
            const [day, month, year] = d.date.split('/');
            return `${year}-${month}-${day}`;
        });
        
        const trace1 = {
            x: dates,
            y: dailyData.map(d => d.godzinySnu),
            type: 'bar',
            name: 'Godziny Snu',
            marker: { color: 'rgba(59, 130, 246, 0.5)' },
            hovertemplate: '%{y}h<extra></extra>'
        };
        
        const trace2 = {
            x: dates,
            y: dailyData.map(d => d.jakoscSnu),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Jakość Snu (1-10)',
            yaxis: 'y2',
                    line: { color: '#14B8A6', width: 3 }, // Medical teal
                    marker: { size: 10, color: '#14B8A6' },
            hovertemplate: 'Jakość: %{y}<extra></extra>'
        };
        
        const template = this.getTemplate();
        const layout = {
            ...template,
            title: { text: 'Analiza Snu: Czas i Jakość', font: { size: 16 } },
            xaxis: { ...template.xaxis, title: 'Data', tickformat: '%d/%m' },
            yaxis: { ...template.yaxis, title: 'Godziny', range: [0, 12] },
            yaxis2: {
                title: 'Jakość (1-10)',
                overlaying: 'y',
                side: 'right',
                range: [0, 11],
                showgrid: false,
                color: '#14B8A6' // Medical teal
            },
            legend: { 
                orientation: 'h',
                x: 0.5,
                xanchor: 'center',
                y: -0.4,
                font: { color: '#78716C', family: 'Inter, sans-serif', size: 12 },
                bgcolor: 'rgba(31, 41, 55, 0.95)',
                bordercolor: 'var(--border)',
                borderwidth: 1
            },
            margin: (() => {
                const m = ChartRenderer.getMobileMargin();
                return { t: m.t, r: m.r + 40, b: m.b + 100, l: m.l };
            })()
        };
        
        Plotly.newPlot(containerId, [trace1, trace2], layout, {
            responsive: true,
            displayModeBar: false
        });
    },
    
    // Wykres 7: Sen vs Lęk Następnego Dnia (Scatter z regresją)
    renderSleepVsAnxiety: function(containerId, dailyData) {
        if (!dailyData || dailyData.length < 2) return;
        
        // Przygotuj dane: jakość snu dnia N vs lęk dnia N+1
        const sleepQuality = [];
        const nextDayAnxiety = [];
        const nextDayTension = [];
        
        for (let i = 0; i < dailyData.length - 1; i++) {
            const today = dailyData[i];
            const tomorrow = dailyData[i + 1];
            
            if (today.jakoscSnu !== null && tomorrow.lek !== null) {
                sleepQuality.push(today.jakoscSnu);
                nextDayAnxiety.push(tomorrow.lek);
            }
            if (today.jakoscSnu !== null && tomorrow.napiecie !== null) {
                nextDayTension.push(tomorrow.napiecie);
            }
        }
        
        const trace1 = {
            x: sleepQuality,
            y: nextDayAnxiety,
            type: 'scatter',
            mode: 'markers',
            name: 'Lęk (dzień N+1)',
            marker: { color: '#EF4444', size: 10, opacity: 0.7 },
            hovertemplate: 'Sen: %{x}<br>Lęk: %{y}<extra></extra>'
        };
        
        const trace2 = {
            x: sleepQuality,
            y: nextDayTension,
            type: 'scatter',
            mode: 'markers',
            name: 'Napięcie (dzień N+1)',
            marker: { color: '#3B82F6', size: 10, opacity: 0.7, symbol: 'square' },
            hovertemplate: 'Sen: %{x}<br>Napięcie: %{y}<extra></extra>'
        };
        
        // Linia regresji dla Lęku
        let trace3 = null;
        if (sleepQuality.length > 0 && nextDayAnxiety.length > 0) {
            const regression = StatsEngine.linearRegression(sleepQuality, nextDayAnxiety);
            if (regression && !isNaN(regression.slope)) {
                const xMin = Math.min(...sleepQuality);
                const xMax = Math.max(...sleepQuality);
                const yMin = regression.slope * xMin + regression.intercept;
                const yMax = regression.slope * xMax + regression.intercept;
                
                trace3 = {
                    x: [xMin, xMax],
                    y: [yMin, yMax],
                    type: 'scatter',
                    mode: 'lines',
                    name: `Regresja Lęku (r=${regression.r.toFixed(2)})`,
                    line: { color: '#DC2626', width: 2, dash: 'dash' },
                    hovertemplate: 'Regresja: y = %{y:.2f}<extra></extra>'
                };
            }
        }
        
        const traces = [trace1, trace2];
        if (trace3) traces.push(trace3);
        
        const template = this.getTemplate();
        const layout = {
            ...template,
            title: {
                text: 'Wpływ Jakości Snu na Objawy Następnego Dnia',
                font: { size: 16 }
            },
            xaxis: {
                ...template.xaxis,
                title: 'Jakość Snu (dzień N)',
                range: [0, 11]
            },
            yaxis: {
                ...template.yaxis,
                title: 'Poziom Objawów (dzień N+1)',
                range: [0, 10]
            },
            legend: { 
                orientation: 'h',
                x: 0.5,
                xanchor: 'center',
                y: -0.4,
                font: { color: '#78716C', family: 'Inter, sans-serif', size: 12 },
                bgcolor: 'rgba(31, 41, 55, 0.95)',
                bordercolor: 'var(--border)',
                borderwidth: 1
            },
            margin: (() => {
                const m = ChartRenderer.getMobileMargin();
                return { t: m.t, r: m.r, b: m.b + 100, l: m.l };
            })()
        };
        
        const isMobile = window.innerWidth < 768;
        Plotly.newPlot(containerId, traces, layout, {
            responsive: true,
            displayModeBar: false
        });
        this.setupResizeObserver(containerId);
    },
    
    // Wykres 8: Rolling Average (3-day MA)
    renderRollingAverage: function(containerId, dailyData) {
        if (!dailyData || dailyData.length < 3) return;
        
        const dates = dailyData.map(d => {
            const [day, month, year] = d.date.split('/');
            return `${year}-${month}-${day}`;
        });
        
        // Oblicz 3-day moving average
        const calculateMA = (values, window = 3) => {
            const ma = [];
            for (let i = 0; i < values.length; i++) {
                const start = Math.max(0, i - window + 1);
                const windowValues = values.slice(start, i + 1).filter(v => v !== null);
                ma.push(windowValues.length > 0 ? windowValues.reduce((a, b) => a + b, 0) / windowValues.length : null);
            }
            return ma;
        };
        
        const lekRaw = dailyData.map(d => d.lek);
        const lekMA = calculateMA(lekRaw);
        const napiecieRaw = dailyData.map(d => d.napiecie);
        const napiecieMA = calculateMA(napiecieRaw);
        
        const trace1 = {
            x: dates,
            y: lekRaw,
            type: 'scatter',
            mode: 'markers',
            name: 'Lęk (surowe)',
            marker: { color: '#EF4444', size: 6, opacity: 0.4 },
            hovertemplate: 'Lęk: %{y:.2f}<extra></extra>'
        };
        
        const trace2 = {
            x: dates,
            y: lekMA,
            type: 'scatter',
            mode: 'lines',
            name: 'Lęk (3-dniowa średnia)',
            line: { color: '#EF4444', width: 3 },
            hovertemplate: 'Średnia: %{y:.2f}<extra></extra>'
        };
        
        const trace3 = {
            x: dates,
            y: napiecieRaw,
            type: 'scatter',
            mode: 'markers',
            name: 'Napięcie (surowe)',
            marker: { color: '#3B82F6', size: 6, opacity: 0.4, symbol: 'square' },
            hovertemplate: 'Napięcie: %{y:.2f}<extra></extra>'
        };
        
        const trace4 = {
            x: dates,
            y: napiecieMA,
            type: 'scatter',
            mode: 'lines',
            name: 'Napięcie (3-dniowa średnia)',
            line: { color: '#3B82F6', width: 3 },
            hovertemplate: 'Średnia: %{y:.2f}<extra></extra>'
        };
        
        const template = this.getTemplate();
        const layout = {
            ...template,
            title: {
                text: 'Trend z Wygładzeniem (3-dniowa Średnia Krocząca)',
                font: { size: 16 }
            },
            xaxis: {
                ...template.xaxis,
                title: 'Data',
                tickformat: '%d/%m'
            },
            yaxis: {
                ...template.yaxis,
                title: 'Poziom (skala 1-10)',
                range: [0, 10]
            },
            legend: { 
                orientation: 'h',
                x: 0.5,
                xanchor: 'center',
                y: -0.4,
                font: { color: '#78716C', family: 'Inter, sans-serif', size: 12 },
                bgcolor: 'rgba(31, 41, 55, 0.95)',
                bordercolor: 'var(--border)',
                borderwidth: 1
            },
            margin: (() => {
                const m = ChartRenderer.getMobileMargin();
                return { t: m.t, r: m.r, b: m.b + 100, l: m.l };
            })()
        };
        
        Plotly.newPlot(containerId, [trace1, trace2, trace3, trace4], layout, {
            responsive: true,
            displayModeBar: false
        });
    },
    
    // Wykres 9: Porównanie Tygodni
    renderWeeklyComparison: function(containerId, dailyData) {
        if (!dailyData || dailyData.length === 0) return;
        
        // Grupuj dane po tygodniach
        const weeks = {};
        dailyData.forEach(d => {
            const [day, month, year] = d.date.split('/').map(Number);
            const date = new Date(year, month - 1, day);
            const weekNum = Math.ceil((date - new Date(year, 0, 1)) / (7 * 24 * 60 * 60 * 1000));
            const weekKey = `Tydzień ${weekNum}`;
            
            if (!weeks[weekKey]) {
                weeks[weekKey] = { lek: [], napiecie: [], fokus: [], energia: [] };
            }
            
            if (d.lek !== null) weeks[weekKey].lek.push(d.lek);
            if (d.napiecie !== null) weeks[weekKey].napiecie.push(d.napiecie);
            if (d.fokus !== null) weeks[weekKey].fokus.push(d.fokus);
            if (d.energia !== null) weeks[weekKey].energia.push(d.energia);
        });
        
        const weekLabels = Object.keys(weeks).sort();
        const lekMeans = weekLabels.map(w => {
            const vals = weeks[w].lek;
            return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        });
        const napiecieMeans = weekLabels.map(w => {
            const vals = weeks[w].napiecie;
            return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        });
        const fokusMeans = weekLabels.map(w => {
            const vals = weeks[w].fokus;
            return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        });
        const energiaMeans = weekLabels.map(w => {
            const vals = weeks[w].energia;
            return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        });
        
        const trace1 = {
            x: weekLabels,
            y: lekMeans,
            type: 'bar',
            name: 'Lęk',
            marker: { color: '#EF4444' },
            text: lekMeans.map(v => v > 0 ? v.toFixed(1) : ''),
            textposition: 'auto'
        };
        
        const trace2 = {
            x: weekLabels,
            y: napiecieMeans,
            type: 'bar',
            name: 'Napięcie',
            marker: { color: '#3B82F6' },
            text: napiecieMeans.map(v => v > 0 ? v.toFixed(1) : ''),
            textposition: 'auto'
        };
        
        const trace3 = {
            x: weekLabels,
            y: fokusMeans,
            type: 'bar',
            name: 'Fokus',
            marker: { color: '#10B981' },
            text: fokusMeans.map(v => v > 0 ? v.toFixed(1) : ''),
            textposition: 'auto'
        };
        
        const trace4 = {
            x: weekLabels,
            y: energiaMeans,
            type: 'bar',
            name: 'Energia',
            marker: { color: '#F59E0B' },
            text: energiaMeans.map(v => v > 0 ? v.toFixed(1) : ''),
            textposition: 'auto'
        };
        
        const template = this.getTemplate();
        const layout = {
            ...template,
            title: {
                text: 'Porównanie Tygodniowe - Średnie Wartości',
                font: { size: 16 }
            },
            xaxis: {
                ...template.xaxis,
                title: 'Tydzień'
            },
            yaxis: {
                ...template.yaxis,
                title: 'Średni Poziom (1-10)',
                range: [0, 10]
            },
            barmode: 'group',
            legend: { 
                orientation: 'h',
                x: 0.5,
                xanchor: 'center',
                y: -0.4,
                font: { color: '#78716C', family: 'Inter, sans-serif', size: 12 },
                bgcolor: 'rgba(31, 41, 55, 0.95)',
                bordercolor: 'var(--border)',
                borderwidth: 1
            },
            margin: (() => {
                const m = ChartRenderer.getMobileMargin();
                return { t: m.t, r: m.r, b: m.b + 100, l: m.l };
            })()
        };
        
        Plotly.newPlot(containerId, [trace1, trace2, trace3, trace4], layout, {
            responsive: true,
            displayModeBar: false
        });
    },
    updateCorrelationSummary: function(correlationData) {
        const summaryDiv = document.getElementById('correlation-text-summary');
        if (!summaryDiv) return;
        
        const { matrix, labels } = correlationData;
        const correlations = [];
        
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < i; j++) {
                const val = matrix[i][j];
                if (Math.abs(val) >= 0.3) {
                    correlations.push({
                        labels: [labels[i], labels[j]],
                        value: val
                    });
                }
            }
        }
        
        if (correlations.length === 0) {
            summaryDiv.innerHTML = '<p>Brak istotnych statystycznie korelacji (|r| >= 0.3).</p>';
            return;
        }
        
        // Sortuj od najsilniejszych
        correlations.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
        
        let html = '<ul style="list-style: none; padding: 0;">';
        correlations.slice(0, 6).forEach(c => {
            const direction = c.value > 0 ? 'dodatnia' : 'ujemna';
            const strengthValue = Math.abs(c.value);
            const strength = strengthValue > 0.7 ? 'silna' : (strengthValue > 0.5 ? 'umiarkowana' : 'słaba');
            const color = c.value > 0 ? 'var(--accent-green)' : 'var(--accent-red)';
            
            // Interpretacja kliniczna
            let interpretation = '';
            if (c.labels.includes('Sen (Jakość)') && (c.labels.includes('Lęk') || c.labels.includes('Napięcie'))) {
                interpretation = c.value < 0 ? ' (Lepszy sen wiąże się z niższym lękiem/napięciem)' : '';
            } else if (c.labels.includes('Pregabalina') && (c.labels.includes('Lęk') || c.labels.includes('Napięcie'))) {
                interpretation = c.value < 0 ? ' (Wyższa dawka koreluje z redukcją objawów)' : '';
            }
            
            html += `<li style="margin-bottom: 8px; line-height: 1.4;">
                • Między <strong>${c.labels[0]}</strong> a <strong>${c.labels[1]}</strong> występuje ${strength} korelacja ${direction} 
                (<strong style="color: ${color}">r = ${c.value.toFixed(2)}</strong>).${interpretation}
            </li>`;
        });
        html += '</ul>';
        
        summaryDiv.innerHTML = html;
    },
    
    // Render wszystkich wykresów
    renderAllCharts: function(data, stats) {
        if (!data || data.length === 0) return;
        
        const dailyData = stats.dailyData || StatsEngine.aggregateDaily(data);
        const intradayData = stats.intradayData || StatsEngine.aggregateByTimeOfDay(data);
        
        // 1. Trajektoria
        this.renderGADTrajectory('plot-gad', dailyData, stats);
        
        // 2. Profil Dobowy
        this.renderIntradayProfile('plot-intraday', intradayData);
        
        // 3. ADHD
        this.renderADHDStability('plot-adhd', dailyData);
        
        // 4. Stacked Area (zamiast heatmapy)
        this.renderStackedAreaByTimeOfDay('plot-stacked-area', data);
        
        // 5. Sleep Analysis
        this.renderSleepChart('plot-sleep', dailyData);

        // 6. Korelacje (Tabela)
        const variables = ['lek', 'napiecie', 'jakoscSnu', 'brainfog', 'energia', 'fokus', 'pregabalina'];
        const corrData = StatsEngine.correlationMatrix(data, variables);
        const labels = ['Lęk', 'Napięcie', 'Sen (Jakość)', 'Klarowność', 'Energia', 'Fokus', 'Pregabalina'];
        this.renderCorrelationTable('correlation-table-container', { matrix: corrData.matrix, labels: labels });

        // 7. Sen vs Lęk Następnego Dnia
        this.renderSleepVsAnxiety('plot-sleep-anxiety', dailyData);

        // 8. Rolling Average
        this.renderRollingAverage('plot-rolling-avg', dailyData);

        // 9. Porównanie Tygodniowe
        this.renderWeeklyComparison('plot-weekly', dailyData);

        // 10. Pozytywne vs Negatywne
        this.renderPositiveVsNegative('plot-positive-vs-negative', dailyData);

        // 12. Metryki per Pora Dnia
        this.renderMetricsByTimeOfDay('plot-metrics-by-time', data);
    },
    
    // Eksport do PNG
    exportChart: function(containerId, filename) {
        if (typeof Plotly === 'undefined') {
            console.error('Plotly nie jest załadowany');
            return;
        }
        
        Plotly.downloadImage(containerId, {
            format: 'png',
            width: 1200,
            height: 600,
            filename: filename || 'chart'
        });
    }
};
