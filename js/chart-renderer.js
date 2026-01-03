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
                text: CONFIG.CHART_TITLES.gadTrajectory || 'Trajektoria Głównych Objawów',
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
                text: CONFIG.CHART_TITLES.intradayProfile || 'Profil Dobowy Nasilenia',
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
                text: CONFIG.CHART_TITLES.adhdStability || 'Stabilność Funkcjonowania Poznawczego',
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
        this.setupResizeObserver(containerId);
    },
    
    // Wykres 4: Overlaid Area Chart - Objawy w ciągu dnia (FIXED: overlay instead of stacking)
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
        const calculateStd = (arr, mean) => {
            if (arr.length < 2) return 0;
            const variance = arr.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / arr.length;
            return Math.sqrt(variance);
        };
        
        const lek = timeOrder.map(t => calculateMean(aggregated[t].lek));
        const napiecie = timeOrder.map(t => calculateMean(aggregated[t].napiecie));
        const fokus = timeOrder.map(t => calculateMean(aggregated[t].fokus));
        const energia = timeOrder.map(t => calculateMean(aggregated[t].energia));
        const klarownosc = timeOrder.map(t => {
            const vals = aggregated[t].brainfog;
            return vals.length > 0 ? calculateMean(vals.map(v => 11 - v)) : 0;
        });
        
        // FIX: Overlaid traces with alpha blending (no stackgroup = independent layers)
        const trace1 = {
            x: timeOrder,
            y: lek,
            name: 'Lęk',
            type: 'scatter',
            mode: 'lines+markers',
            fill: 'tozeroy',
            fillcolor: 'rgba(239, 68, 68, 0.25)',
            line: { color: '#EF4444', width: 3 },
            marker: { size: 8, color: '#EF4444' },
            hovertemplate: '<b>%{x}</b><br>Lęk: %{y:.2f}<extra></extra>'
        };
        
        const trace2 = {
            x: timeOrder,
            y: napiecie,
            name: 'Napięcie',
            type: 'scatter',
            mode: 'lines+markers',
            fill: 'tozeroy',
            fillcolor: 'rgba(59, 130, 246, 0.25)',
            line: { color: '#3B82F6', width: 3 },
            marker: { size: 8, color: '#3B82F6', symbol: 'square' },
            hovertemplate: '<b>%{x}</b><br>Napięcie: %{y:.2f}<extra></extra>'
        };
        
        const trace3 = {
            x: timeOrder,
            y: fokus,
            name: 'Fokus',
            type: 'scatter',
            mode: 'lines+markers',
            fill: 'tozeroy',
            fillcolor: 'rgba(16, 185, 129, 0.2)',
            line: { color: '#10B981', width: 3 },
            marker: { size: 8, color: '#10B981', symbol: 'diamond' },
            hovertemplate: '<b>%{x}</b><br>Fokus: %{y:.2f}<extra></extra>'
        };
        
        const trace4 = {
            x: timeOrder,
            y: energia,
            name: 'Energia',
            type: 'scatter',
            mode: 'lines+markers',
            fill: 'tozeroy',
            fillcolor: 'rgba(245, 158, 11, 0.2)',
            line: { color: '#F59E0B', width: 3 },
            marker: { size: 8, color: '#F59E0B', symbol: 'triangle-up' },
            hovertemplate: '<b>%{x}</b><br>Energia: %{y:.2f}<extra></extra>'
        };
        
        const trace5 = {
            x: timeOrder,
            y: klarownosc,
            name: 'Klarowność',
            type: 'scatter',
            mode: 'lines+markers',
            fill: 'tozeroy',
            fillcolor: 'rgba(20, 184, 166, 0.2)',
            line: { color: '#14B8A6', width: 3, dash: 'dot' },
            marker: { size: 8, color: '#14B8A6', symbol: 'star' },
            hovertemplate: '<b>%{x}</b><br>Klarowność: %{y:.2f}<extra></extra>'
        };
        
        const template = this.getTemplate();
        const layout = {
            ...template,
            title: {
                text: CONFIG.CHART_TITLES.stackedArea || 'Profil Objawów w Ciągu Dnia',
                font: { size: 16 }
            },
            xaxis: {
                ...template.xaxis,
                title: 'Pora Dnia',
                type: 'category'
            },
            yaxis: {
                ...template.yaxis,
                title: 'Średnia Wartość (1-10)',
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
            })(),
            hovermode: 'x unified'
        };
        
        Plotly.newPlot(containerId, [trace1, trace2, trace3, trace4, trace5], layout, {
            responsive: true,
            displayModeBar: false
        });
        this.setupResizeObserver(containerId);
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
                text: CONFIG.CHART_TITLES.positiveVsNegative || 'Korelacja Pozytywne vs Negatywne',
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
                text: CONFIG.CHART_TITLES.metricsByTime || 'Metryki per Pora Dnia',
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
        this.setupResizeObserver(containerId);
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
            title: { text: CONFIG.CHART_TITLES.sleep || 'Analiza Snu', font: { size: 16 } },
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
        this.setupResizeObserver(containerId);
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
                text: CONFIG.CHART_TITLES.sleepVsAnxiety || 'Sen vs Objawy Następnego Dnia',
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
                text: CONFIG.CHART_TITLES.rollingAverage || 'Trend z Wygładzeniem',
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
        this.setupResizeObserver(containerId);
    },
    
    // Wykres 9: Porównanie Tygodni
    renderWeeklyComparison: function(containerId, dailyData) {
        if (!dailyData || dailyData.length === 0) return;
        
        // Helper: Get ISO week number (handles year boundaries correctly)
        const getISOWeek = (date) => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
            const week1 = new Date(d.getFullYear(), 0, 4);
            return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
        };
        
        // Grupuj dane po tygodniach z rokiem
        const weeks = {};
        dailyData.forEach(d => {
            const [day, month, year] = d.date.split('/').map(Number);
            const date = new Date(year, month - 1, day);
            const weekNum = getISOWeek(date);
            const weekYear = date.getFullYear();
            // Use sortable key: YYYY-WW format
            const weekKey = `${weekYear}-W${String(weekNum).padStart(2, '0')}`;
            const weekLabel = `${weekYear} Tydzień ${weekNum}`;
            
            if (!weeks[weekKey]) {
                weeks[weekKey] = { 
                    label: weekLabel,
                    year: weekYear,
                    week: weekNum,
                    lek: [], 
                    napiecie: [], 
                    fokus: [], 
                    energia: [] 
                };
            }
            
            if (d.lek !== null) weeks[weekKey].lek.push(d.lek);
            if (d.napiecie !== null) weeks[weekKey].napiecie.push(d.napiecie);
            if (d.fokus !== null) weeks[weekKey].fokus.push(d.fokus);
            if (d.energia !== null) weeks[weekKey].energia.push(d.energia);
        });
        
        // Sort chronologically by year-week key
        const weekKeys = Object.keys(weeks).sort();
        const weekLabels = weekKeys.map(key => weeks[key].label);
        const lekMeans = weekKeys.map(key => {
            const vals = weeks[key].lek;
            return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        });
        const napiecieMeans = weekKeys.map(key => {
            const vals = weeks[key].napiecie;
            return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        });
        const fokusMeans = weekKeys.map(key => {
            const vals = weeks[key].fokus;
            return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        });
        const energiaMeans = weekKeys.map(key => {
            const vals = weeks[key].energia;
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
                text: CONFIG.CHART_TITLES.weeklyComparison || 'Porównanie Tygodniowe',
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
        this.setupResizeObserver(containerId);
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
    
    // Wykres: Farmakokinetyka - Profil Stężenia Leków
    renderPharmacokineticsCurves: function(containerId, data) {
        try {
            if (!data || data.length === 0) return;
            
            // Extract medication times from data
            const medicationTimes = {
                pregabalina: [],
                elvanse: []
            };
            
            data.forEach(d => {
                // Extract Pregabalina times
                if (d.Pregabalina && d.Pregabalina !== '-' && d.Pregabalina !== null) {
                    const dose = this.extractDoseFromText(d.Pregabalina);
                    if (dose && d.PregabalinaGodzina && d.PregabalinaGodzina !== '-') {
                        const time = this.parseTime(d.PregabalinaGodzina);
                        if (time !== null) {
                            medicationTimes.pregabalina.push({ time, dose });
                        }
                    }
                }
                
                // Extract Elvanse times
                if (d.Elvanse && d.Elvanse !== '-' && d.Elvanse !== null) {
                    const dose = this.extractDoseFromText(d.Elvanse);
                    if (dose && d.ElvanseGodzina && d.ElvanseGodzina !== '-') {
                        const time = this.parseTime(d.ElvanseGodzina);
                        if (time !== null) {
                            medicationTimes.elvanse.push({ time, dose });
                        }
                    }
                }
            });
            
            // Generate 24-hour time points
            const hours = Array.from({ length: 25 }, (_, i) => i); // 0-24
            
            // Calculate PK curves for each medication
            const traces = [];
            const shapes = [];
            const annotations = [];
            
            // Pregabalina curve
            if (medicationTimes.pregabalina.length > 0) {
                if (!CONFIG.PK_PROFILES || !CONFIG.PK_PROFILES.pregabalina) {
                    console.error('CONFIG.PK_PROFILES.pregabalina is not defined');
                    return;
                }
                const pk = CONFIG.PK_PROFILES.pregabalina;
                const pregabCurve = hours.map(hour => {
                    let maxConc = 0;
                    medicationTimes.pregabalina.forEach(({ time, dose }) => {
                        const hoursSinceDose = (hour - time + 24) % 24;
                        if (hoursSinceDose >= 0 && hoursSinceDose <= pk.duration) {
                            // Simplified PK model: absorption + elimination
                            const t = hoursSinceDose;
                            const ka = 2.0; // absorption rate
                            const ke = Math.log(2) / pk.thalf; // elimination rate
                            const tmax = pk.tmax;
                            
                            let conc = 0;
                            if (t <= tmax) {
                                // Absorption phase
                                conc = (dose / 75) * 100 * (1 - Math.exp(-ka * t));
                            } else {
                                // Elimination phase
                                const cmax = (dose / 75) * 100 * (1 - Math.exp(-ka * tmax));
                                conc = cmax * Math.exp(-ke * (t - tmax));
                            }
                            maxConc = Math.max(maxConc, conc);
                        }
                    });
                    return maxConc;
                });
                
                traces.push({
                    x: hours,
                    y: pregabCurve,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Pregabalina',
                    fill: 'tozeroy',
                    fillcolor: `rgba(139, 92, 246, 0.2)`,
                    line: { color: pk.color, width: 3 },
                    hovertemplate: 'Godzina: %{x}:00<br>Stężenie: %{y:.1f}%<extra></extra>'
                });
                
                // Add vertical lines for dose times
                medicationTimes.pregabalina.forEach(({ time }) => {
                    shapes.push({
                        type: 'line',
                        x0: time,
                        x1: time,
                        y0: 0,
                        y1: 100,
                        line: { color: pk.color, width: 1, dash: 'dot' }
                    });
                });
            }
        
            // Elvanse curve
            if (medicationTimes.elvanse.length > 0) {
                if (!CONFIG.PK_PROFILES || !CONFIG.PK_PROFILES.elvanse) {
                    console.error('CONFIG.PK_PROFILES.elvanse is not defined');
                    return;
                }
                const pk = CONFIG.PK_PROFILES.elvanse;
                const elvanseCurve = hours.map(hour => {
                    let maxConc = 0;
                    medicationTimes.elvanse.forEach(({ time, dose }) => {
                        const hoursSinceDose = (hour - time + 24) % 24;
                        if (hoursSinceDose >= 0 && hoursSinceDose <= pk.duration) {
                            const t = hoursSinceDose;
                            const ka = 0.5; // slower absorption
                            const ke = Math.log(2) / pk.thalf;
                            const tmax = pk.tmax;
                            
                            let conc = 0;
                            if (t <= tmax) {
                                conc = (dose / 70) * 100 * (1 - Math.exp(-ka * t));
                            } else {
                                const cmax = (dose / 70) * 100 * (1 - Math.exp(-ka * tmax));
                                conc = cmax * Math.exp(-ke * (t - tmax));
                            }
                            maxConc = Math.max(maxConc, conc);
                        }
                    });
                    return maxConc;
                });
                
                traces.push({
                    x: hours,
                    y: elvanseCurve,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Elvanse',
                    fill: 'tozeroy',
                    fillcolor: `rgba(245, 158, 11, 0.2)`,
                    line: { color: pk.color, width: 3 },
                    hovertemplate: 'Godzina: %{x}:00<br>Stężenie: %{y:.1f}%<extra></extra>'
                });
                
                medicationTimes.elvanse.forEach(({ time }) => {
                    shapes.push({
                        type: 'line',
                        x0: time,
                        x1: time,
                        y0: 0,
                        y1: 100,
                        line: { color: pk.color, width: 1, dash: 'dot' }
                    });
                });
            }
            
            if (traces.length === 0) return;
            
            // Therapeutic window (50% of max)
            shapes.push({
                type: 'rect',
                xref: 'paper',
                yref: 'y',
                x0: 0,
                y0: 50,
                x1: 1,
                y1: 100,
                fillcolor: 'rgba(16, 185, 129, 0.1)',
                line: { width: 0 }
            });
            
            const template = this.getTemplate();
            const layout = {
                ...template,
                title: {
                    text: CONFIG.CHART_TITLES.pharmacokinetics || 'Profil Stężenia Leków w Czasie',
                    font: { size: 16 }
                },
                xaxis: {
                    ...template.xaxis,
                    title: 'Godzina dnia',
                    range: [0, 24],
                    tickmode: 'linear',
                    tick0: 0,
                    dtick: 3
                },
                yaxis: {
                    ...template.yaxis,
                    title: 'Względne stężenie (%)',
                    range: [0, 110]
                },
                shapes: shapes,
                legend: {
                    orientation: 'h',
                    x: 0.5,
                    xanchor: 'center',
                    y: -0.2,
                    font: { color: '#78716C', family: 'Inter, sans-serif', size: 12 }
                },
                margin: (() => {
                    const m = ChartRenderer.getMobileMargin();
                    return { t: m.t, r: m.r, b: m.b + 80, l: m.l };
                })()
            };
            
            Plotly.newPlot(containerId, traces, layout, {
                responsive: true,
                displayModeBar: false
            });
            this.setupResizeObserver(containerId);
        } catch (error) {
            console.error('Error rendering pharmacokinetics chart:', error);
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '<p style="color: var(--text-secondary); padding: 20px; text-align: center;">Błąd renderowania wykresu farmakokinetyki. Sprawdź konsolę przeglądarki.</p>';
            }
        }
    },
    
    // Helper: Extract dose from text like "TAK(75MG)"
    extractDoseFromText: function(text) {
        if (!text || text === '-' || text === null) return null;
        const match = text.match(/(\d+)\s*MG/i);
        return match ? parseInt(match[1]) : null;
    },
    
    // Helper: Parse time string to hour (0-23)
    parseTime: function(timeStr) {
        if (!timeStr || timeStr === '-') return null;
        const match = timeStr.match(/(\d{1,2}):(\d{2})/);
        if (match) {
            return parseInt(match[1]);
        }
        return null;
    },
    
    // Wykres: Zależność Objawów od Elvanse
    renderElvanseSymptoms: function(containerId, data) {
        try {
            if (!data || data.length === 0) return;
            
            // Group data by Elvanse dose and time since dose
            const groups = {
                noDose: { energia: [], fokus: [], brainfog: [] },
                withDose: { energia: [], fokus: [], brainfog: [] }
            };
            
            data.forEach(d => {
                const hasElvanse = d.Elvanse && d.Elvanse !== '-' && d.Elvanse !== null;
                const energia = d.Energia !== null && d.Energia !== undefined && !isNaN(d.Energia) ? parseFloat(d.Energia) : null;
                const fokus = d.Fokus !== null && d.Fokus !== undefined && !isNaN(d.Fokus) ? parseFloat(d.Fokus) : null;
                const brainfog = d.BrainFog !== null && d.BrainFog !== undefined && !isNaN(d.BrainFog) ? parseFloat(d.BrainFog) : null;
                
                if (hasElvanse) {
                    if (energia !== null) groups.withDose.energia.push(energia);
                    if (fokus !== null) groups.withDose.fokus.push(fokus);
                    if (brainfog !== null) groups.withDose.brainfog.push(brainfog);
                } else {
                    if (energia !== null) groups.noDose.energia.push(energia);
                    if (fokus !== null) groups.noDose.fokus.push(fokus);
                    if (brainfog !== null) groups.noDose.brainfog.push(brainfog);
                }
            });
            
            const calcAvg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
            const calcKlarownosc = (arr) => arr.length > 0 ? arr.map(v => 11 - v).reduce((a, b) => a + b, 0) / arr.length : null;
            
            const traces = [];
            
            // Energia
            const energiaWith = calcAvg(groups.withDose.energia);
            const energiaWithout = calcAvg(groups.noDose.energia);
            if (energiaWith !== null && energiaWithout !== null) {
                traces.push({
                    x: ['Bez Elvanse', 'Z Elvanse'],
                    y: [energiaWithout, energiaWith],
                    type: 'bar',
                    name: 'Energia',
                    marker: { color: '#3B82F6' },
                    hovertemplate: '%{x}<br>Energia: %{y:.2f}<extra></extra>'
                });
            }
            
            // Fokus
            const fokusWith = calcAvg(groups.withDose.fokus);
            const fokusWithout = calcAvg(groups.noDose.fokus);
            if (fokusWith !== null && fokusWithout !== null) {
                traces.push({
                    x: ['Bez Elvanse', 'Z Elvanse'],
                    y: [fokusWithout, fokusWith],
                    type: 'bar',
                    name: 'Fokus',
                    marker: { color: '#10B981' },
                    hovertemplate: '%{x}<br>Fokus: %{y:.2f}<extra></extra>'
                });
            }
            
            // Klarowność (odwrócony BrainFog)
            const klarownoscWith = calcKlarownosc(groups.withDose.brainfog);
            const klarownoscWithout = calcKlarownosc(groups.noDose.brainfog);
            if (klarownoscWith !== null && klarownoscWithout !== null) {
                traces.push({
                    x: ['Bez Elvanse', 'Z Elvanse'],
                    y: [klarownoscWithout, klarownoscWith],
                    type: 'bar',
                    name: 'Klarowność',
                    marker: { color: '#8B5CF6' },
                    hovertemplate: '%{x}<br>Klarowność: %{y:.2f}<extra></extra>'
                });
            }
            
            if (traces.length === 0) return;
            
            const template = this.getTemplate();
            const layout = {
                ...template,
                title: {
                    text: 'Zależność Objawów od Elvanse',
                    font: { size: 16 }
                },
                xaxis: {
                    ...template.xaxis,
                    title: 'Stan',
                    type: 'category'
                },
                yaxis: {
                    ...template.yaxis,
                    title: 'Średnia wartość objawu',
                    range: [0, 10]
                },
                barmode: 'group',
                legend: {
                    orientation: 'h',
                    x: 0.5,
                    xanchor: 'center',
                    y: -0.15,
                    font: { color: '#78716C', family: 'Inter, sans-serif', size: 12 }
                },
                margin: (() => {
                    const m = ChartRenderer.getMobileMargin();
                    return { t: m.t, r: m.r, b: m.b + 60, l: m.l };
                })()
            };
            
            Plotly.newPlot(containerId, traces, layout, {
                responsive: true,
                displayModeBar: false
            });
            this.setupResizeObserver(containerId);
        } catch (error) {
            console.error('Error rendering Elvanse symptoms chart:', error);
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '<p style="color: var(--text-secondary); padding: 20px; text-align: center;">Błąd renderowania wykresu. Sprawdź konsolę przeglądarki.</p>';
            }
        }
    },
    
    // Wykres: Zależność Objawów od Pregabaliny
    renderPregabalinaSymptoms: function(containerId, data) {
        try {
            if (!data || data.length === 0) return;
            
            // Group data by Pregabalina dose
            const groups = {
                noDose: { lek: [], napiecie: [] },
                withDose: { lek: [], napiecie: [] }
            };
            
            data.forEach(d => {
                const hasPregab = d.Pregabalina && d.Pregabalina !== '-' && d.Pregabalina !== null;
                const lek = d['Lęk'] !== null && d['Lęk'] !== undefined && !isNaN(d['Lęk']) ? parseFloat(d['Lęk']) : null;
                const napiecie = d['Napięcie'] !== null && d['Napięcie'] !== undefined && !isNaN(d['Napięcie']) ? parseFloat(d['Napięcie']) : null;
                
                if (hasPregab) {
                    if (lek !== null) groups.withDose.lek.push(lek);
                    if (napiecie !== null) groups.withDose.napiecie.push(napiecie);
                } else {
                    if (lek !== null) groups.noDose.lek.push(lek);
                    if (napiecie !== null) groups.noDose.napiecie.push(napiecie);
                }
            });
            
            const calcAvg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
            
            const traces = [];
            
            // Lęk
            const lekWith = calcAvg(groups.withDose.lek);
            const lekWithout = calcAvg(groups.noDose.lek);
            if (lekWith !== null && lekWithout !== null) {
                traces.push({
                    x: ['Bez Pregabaliny', 'Z Pregabaliną'],
                    y: [lekWithout, lekWith],
                    type: 'bar',
                    name: 'Lęk',
                    marker: { color: '#EF4444' },
                    hovertemplate: '%{x}<br>Lęk: %{y:.2f}<extra></extra>'
                });
            }
            
            // Napięcie
            const napiecieWith = calcAvg(groups.withDose.napiecie);
            const napiecieWithout = calcAvg(groups.noDose.napiecie);
            if (napiecieWith !== null && napiecieWithout !== null) {
                traces.push({
                    x: ['Bez Pregabaliny', 'Z Pregabaliną'],
                    y: [napiecieWithout, napiecieWith],
                    type: 'bar',
                    name: 'Napięcie',
                    marker: { color: '#F59E0B' },
                    hovertemplate: '%{x}<br>Napięcie: %{y:.2f}<extra></extra>'
                });
            }
            
            if (traces.length === 0) return;
            
            const template = this.getTemplate();
            const layout = {
                ...template,
                title: {
                    text: 'Zależność Objawów od Pregabaliny',
                    font: { size: 16 }
                },
                xaxis: {
                    ...template.xaxis,
                    title: 'Stan',
                    type: 'category'
                },
                yaxis: {
                    ...template.yaxis,
                    title: 'Średnia wartość objawu',
                    range: [0, 10]
                },
                barmode: 'group',
                legend: {
                    orientation: 'h',
                    x: 0.5,
                    xanchor: 'center',
                    y: -0.15,
                    font: { color: '#78716C', family: 'Inter, sans-serif', size: 12 }
                },
                margin: (() => {
                    const m = ChartRenderer.getMobileMargin();
                    return { t: m.t, r: m.r, b: m.b + 60, l: m.l };
                })()
            };
            
            Plotly.newPlot(containerId, traces, layout, {
                responsive: true,
                displayModeBar: false
            });
            this.setupResizeObserver(containerId);
        } catch (error) {
            console.error('Error rendering Pregabalina symptoms chart:', error);
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '<p style="color: var(--text-secondary); padding: 20px; text-align: center;">Błąd renderowania wykresu. Sprawdź konsolę przeglądarki.</p>';
            }
        }
    },
    
    // Wykres: Korelacja Marihuany z Objawami
    renderWeedCorrelation: function(containerId, data) {
        try {
            if (!data || data.length === 0) return;
            
            // Grupuj dane po użyciu marihuany
            const groups = {
                noWeed: { lek: [], napiecie: [], fokus: [], energia: [], brainfog: [], jakoscSnu: [] },
                withWeed: { lek: [], napiecie: [], fokus: [], energia: [], brainfog: [], jakoscSnu: [] }
            };
            
            data.forEach(d => {
                const hasWeed = d.Weed_Tak === true;
                const lek = d['Lęk'] !== null && d['Lęk'] !== undefined && !isNaN(d['Lęk']) ? parseFloat(d['Lęk']) : null;
                const napiecie = d['Napięcie'] !== null && d['Napięcie'] !== undefined && !isNaN(d['Napięcie']) ? parseFloat(d['Napięcie']) : null;
                const fokus = d['Fokus'] !== null && d['Fokus'] !== undefined && !isNaN(d['Fokus']) ? parseFloat(d['Fokus']) : null;
                const energia = d['Energia'] !== null && d['Energia'] !== undefined && !isNaN(d['Energia']) ? parseFloat(d['Energia']) : null;
                const brainfog = d['BrainFog'] !== null && d['BrainFog'] !== undefined && !isNaN(d['BrainFog']) ? parseFloat(d['BrainFog']) : null;
                const jakoscSnu = d['JakośćSnu'] !== null && d['JakośćSnu'] !== undefined && !isNaN(d['JakośćSnu']) ? parseFloat(d['JakośćSnu']) : null;
                
                const group = hasWeed ? groups.withWeed : groups.noWeed;
                if (lek !== null) group.lek.push(lek);
                if (napiecie !== null) group.napiecie.push(napiecie);
                if (fokus !== null) group.fokus.push(fokus);
                if (energia !== null) group.energia.push(energia);
                if (brainfog !== null) group.brainfog.push(brainfog);
                if (jakoscSnu !== null) group.jakoscSnu.push(jakoscSnu);
            });
            
            const calcAvg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
            const calcKlarownosc = (arr) => arr.length > 0 ? arr.map(v => 11 - v).reduce((a, b) => a + b, 0) / arr.length : null;
            
            // Sprawdź czy są dane dla obu grup
            const hasWeedData = groups.withWeed.lek.length > 0;
            const hasNoWeedData = groups.noWeed.lek.length > 0;
            
            if (!hasWeedData && !hasNoWeedData) {
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = '<p style="color: var(--text-secondary); padding: 40px; text-align: center;">Brak danych o marihuanie. Dodaj pole Weed do importu CSV.</p>';
                }
                return;
            }
            
            const categories = ['Lęk', 'Napięcie', 'Fokus', 'Energia', 'Klarowność', 'Jakość Snu'];
            const withWeedValues = [
                calcAvg(groups.withWeed.lek),
                calcAvg(groups.withWeed.napiecie),
                calcAvg(groups.withWeed.fokus),
                calcAvg(groups.withWeed.energia),
                calcKlarownosc(groups.withWeed.brainfog),
                calcAvg(groups.withWeed.jakoscSnu)
            ];
            const noWeedValues = [
                calcAvg(groups.noWeed.lek),
                calcAvg(groups.noWeed.napiecie),
                calcAvg(groups.noWeed.fokus),
                calcAvg(groups.noWeed.energia),
                calcKlarownosc(groups.noWeed.brainfog),
                calcAvg(groups.noWeed.jakoscSnu)
            ];
            
            const traces = [];
            
            // Bez marihuany
            if (hasNoWeedData) {
                traces.push({
                    x: categories,
                    y: noWeedValues,
                    type: 'bar',
                    name: `Bez marihuany (n=${groups.noWeed.lek.length})`,
                    marker: { color: '#10B981' },
                    text: noWeedValues.map(v => v !== null ? v.toFixed(1) : '-'),
                    textposition: 'auto',
                    hovertemplate: '%{x}<br>Wartość: %{y:.2f}<extra>Bez marihuany</extra>'
                });
            }
            
            // Z marihuaną
            if (hasWeedData) {
                traces.push({
                    x: categories,
                    y: withWeedValues,
                    type: 'bar',
                    name: `Z marihuaną (n=${groups.withWeed.lek.length})`,
                    marker: { color: '#22C55E', pattern: { shape: '/' } },
                    text: withWeedValues.map(v => v !== null ? v.toFixed(1) : '-'),
                    textposition: 'auto',
                    hovertemplate: '%{x}<br>Wartość: %{y:.2f}<extra>Z marihuaną</extra>'
                });
            }
            
            if (traces.length === 0) return;
            
            const template = this.getTemplate();
            const layout = {
                ...template,
                title: {
                    text: '🌿 Wpływ Marihuany na Objawy',
                    font: { size: 16 }
                },
                xaxis: {
                    ...template.xaxis,
                    title: '',
                    type: 'category'
                },
                yaxis: {
                    ...template.yaxis,
                    title: 'Średnia wartość',
                    range: [0, 10]
                },
                barmode: 'group',
                legend: {
                    orientation: 'h',
                    x: 0.5,
                    xanchor: 'center',
                    y: -0.2,
                    font: { color: '#78716C', family: 'Inter, sans-serif', size: 11 }
                },
                annotations: hasWeedData && hasNoWeedData ? [{
                    x: 0.5,
                    y: 1.12,
                    xref: 'paper',
                    yref: 'paper',
                    text: '💡 Porównanie średnich wartości objawów w dniach z/bez użycia marihuany',
                    showarrow: false,
                    font: { size: 11, color: '#78716C' }
                }] : [],
                margin: (() => {
                    const m = ChartRenderer.getMobileMargin();
                    return { t: m.t + 30, r: m.r, b: m.b + 60, l: m.l };
                })()
            };
            
            Plotly.newPlot(containerId, traces, layout, {
                responsive: true,
                displayModeBar: false
            });
            this.setupResizeObserver(containerId);
        } catch (error) {
            console.error('Error rendering weed correlation chart:', error);
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '<p style="color: var(--text-secondary); padding: 20px; text-align: center;">Błąd renderowania wykresu marihuany.</p>';
            }
        }
    },
    
    // Render wszystkich wykresów
    renderAllCharts: function(data, stats, timeRange = 'all') {
        try {
            if (!data || data.length === 0) return;
            
            // Filtruj dane dla wykresów reagujących na zakres czasowy
            const filteredData = StatsEngine.filterByTimeRange(data, timeRange);
            
            // Zawsze obliczaj pełne stats dla pełnych danych
            const fullStats = stats || StatsEngine.computeAll(data);
            
            // Oblicz stats dla przefiltrowanych danych (zawsze, nawet dla 'all' aby mieć spójność)
            const filteredStats = StatsEngine.computeAll(filteredData);
            const filteredDailyData = filteredStats.dailyData || StatsEngine.aggregateDaily(filteredData);
            const filteredIntradayData = filteredStats.intradayData || StatsEngine.aggregateByTimeOfDay(filteredData);
            
            // Dane pełne (dla wykresów, które zawsze pokazują cały okres)
            const fullDailyData = fullStats.dailyData || StatsEngine.aggregateDaily(data);
            const fullIntradayData = fullStats.intradayData || StatsEngine.aggregateByTimeOfDay(data);
            
            // 1. Trajektoria (z filtrowaniem czasowym)
            try {
                this.renderGADTrajectory('plot-gad', filteredDailyData, filteredStats);
            } catch (e) {
                console.error('Error rendering GAD trajectory:', e);
            }
            
            // 2. Profil Dobowy (zawsze pełne dane - agregacja dobowa)
            try {
                this.renderIntradayProfile('plot-intraday', fullIntradayData);
            } catch (e) {
                console.error('Error rendering intraday profile:', e);
            }
            
            // 3. ADHD (zawsze pełne dane - agregacja)
            try {
                this.renderADHDStability('plot-adhd', fullDailyData);
            } catch (e) {
                console.error('Error rendering ADHD stability:', e);
            }
            
            // 4. Stacked Area (z filtrowaniem czasowym)
            try {
                this.renderStackedAreaByTimeOfDay('plot-stacked-area', filteredData);
            } catch (e) {
                console.error('Error rendering stacked area:', e);
            }
            
            // 5. Pharmacokinetics (zawsze pełne dane - teoretyczny profil)
            try {
                this.renderPharmacokineticsCurves('plot-pharmacokinetics', data);
            } catch (e) {
                console.error('Error rendering pharmacokinetics:', e);
            }
            
            // 5a. Elvanse Symptoms (zawsze pełne dane - wymaga pełnej próbki)
            try {
                this.renderElvanseSymptoms('plot-elvanse-symptoms', data);
            } catch (e) {
                console.error('Error rendering Elvanse symptoms:', e);
            }
            
            // 5b. Pregabalina Symptoms (zawsze pełne dane - wymaga pełnej próbki)
            try {
                this.renderPregabalinaSymptoms('plot-pregabalina-symptoms', data);
            } catch (e) {
                console.error('Error rendering Pregabalina symptoms:', e);
            }
            
            // 6. Sleep Analysis (z filtrowaniem czasowym)
            try {
                this.renderSleepChart('plot-sleep', filteredDailyData);
            } catch (e) {
                console.error('Error rendering sleep chart:', e);
            }

            // 7. Korelacje (Tabela) - z marihuaną (zawsze pełne dane - wymaga dużej próbki)
            try {
                const variables = ['lek', 'napiecie', 'jakoscSnu', 'brainfog', 'energia', 'fokus', 'pregabalina', 'weed'];
                const corrData = StatsEngine.correlationMatrix(data, variables);
                const labels = ['Lęk', 'Napięcie', 'Sen (Jakość)', 'Klarowność', 'Energia', 'Fokus', 'Pregabalina', 'Marihuana'];
                this.renderCorrelationTable('correlation-table-container', { matrix: corrData.matrix, labels: labels });
            } catch (e) {
                console.error('Error rendering correlation table:', e);
            }
            
            // 7a. Wykres korelacji marihuany (zawsze pełne dane - wymaga pełnej próbki)
            try {
                this.renderWeedCorrelation('plot-weed-correlation', data);
            } catch (e) {
                console.error('Error rendering weed correlation:', e);
            }

            // 8. Sen vs Lęk Następnego Dnia (z filtrowaniem czasowym)
            try {
                this.renderSleepVsAnxiety('plot-sleep-anxiety', filteredDailyData);
            } catch (e) {
                console.error('Error rendering sleep vs anxiety:', e);
            }

            // 9. Rolling Average (z filtrowaniem czasowym)
            try {
                this.renderRollingAverage('plot-rolling-avg', filteredDailyData);
            } catch (e) {
                console.error('Error rendering rolling average:', e);
            }

            // 10. Porównanie Tygodniowe (zawsze pełne dane - z definicji tygodniowy)
            try {
                this.renderWeeklyComparison('plot-weekly', fullDailyData);
            } catch (e) {
                console.error('Error rendering weekly comparison:', e);
            }

            // 11. Pozytywne vs Negatywne (z filtrowaniem czasowym)
            try {
                this.renderPositiveVsNegative('plot-positive-vs-negative', filteredDailyData);
            } catch (e) {
                console.error('Error rendering positive vs negative:', e);
            }

            // 12. Metryki per Pora Dnia (zawsze pełne dane - agregacja)
            try {
                this.renderMetricsByTimeOfDay('plot-metrics-by-time', data);
            } catch (e) {
                console.error('Error rendering metrics by time:', e);
            }
        } catch (error) {
            console.error('Critical error in renderAllCharts:', error);
        }
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
