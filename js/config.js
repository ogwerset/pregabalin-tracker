/* ===== CONFIG ===== */
const CONFIG = {
    // Storage keys
    STORAGE_KEY: 'symptom-tracker-data',
    THEME_KEY: 'symptom-tracker-theme',
    MEDS_KEY: 'symptom-tracker-medications',
    SETTINGS_KEY: 'symptom-tracker-settings',
    
    // App info (generic for privacy)
    APP_NAME: 'Symptom Tracker',
    APP_VERSION: '4.3.0',
    
    // Default disease context (can be overridden by user settings)
    DEFAULT_CONTEXT: {
        primaryCondition: 'GAD',
        secondaryCondition: 'ADHD',
        displayName: 'Analiza Objawów'
    },
    
    // Chart titles (generic, privacy-safe)
    CHART_TITLES: {
        gadTrajectory: 'Trajektoria Głównych Objawów',
        intradayProfile: 'Profil Dobowy Nasilenia',
        adhdStability: 'Stabilność Funkcjonowania Poznawczego',
        stackedArea: 'Objawy w Ciągu Dnia',
        positiveVsNegative: 'Korelacja Pozytywne vs Negatywne',
        metricsByTime: 'Metryki per Pora Dnia',
        sleep: 'Analiza Snu',
        correlation: 'Macierz Korelacji',
        sleepVsAnxiety: 'Sen vs Objawy Następnego Dnia',
        rollingAverage: 'Trend z Wygładzeniem',
        weeklyComparison: 'Porównanie Tygodniowe',
        pharmacokinetics: 'Profil Stężenia Leków'
    },
    
    // Section headers (generic)
    SECTION_HEADERS: {
        primary: 'Objawy Główne',
        cognitive: 'Funkcjonowanie Poznawcze',
        trends: 'Trendy i Porównania',
        sleep: 'Sen i Regeneracja',
        correlations: 'Korelacje i Zależności'
    },
    
    // Pharmacokinetics profiles (generic - can be customized)
    // Users can configure their own medications in settings
    PK_PROFILES: {
        // Pregabalina profile
        pregabalina: {
            name: 'Pregabalina',
            tmax: 1.0,      // hours to peak
            thalf: 6.3,     // elimination half-life
            duration: 12,   // effective duration
            color: '#8B5CF6',
            doses: []
        },
        // Elvanse (lisdexamfetamine) profile
        elvanse: {
            name: 'Elvanse',
            tmax: 3.5,
            thalf: 11,
            duration: 14,
            color: '#F59E0B',
            doses: []
        },
        // Generic profile 1 - can be customized via settings
        medication1: {
            name: 'Lek 1',
            tmax: 1.0,      // hours to peak
            thalf: 6.3,     // elimination half-life
            duration: 12,   // effective duration
            color: '#8B5CF6',
            doses: []
        },
        // Generic profile 2 - can be customized via settings
        medication2: {
            name: 'Lek 2',
            tmax: 3.5,
            thalf: 11,
            duration: 14,
            color: '#F59E0B',
            doses: []
        }
    },
    
    // Helper: Get user settings or defaults
    getSettings: function() {
        try {
            const saved = localStorage.getItem(this.SETTINGS_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    },
    
    // Helper: Save user settings
    saveSettings: function(settings) {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch (e) {
            return false;
        }
    }
};

