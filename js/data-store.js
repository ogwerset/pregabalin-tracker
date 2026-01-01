/* ===== DATA STORE MODULE ===== */
const DataStore = {
    STORAGE_KEY: CONFIG.STORAGE_KEY,
    
    // Zapisz dane (nadpisz)
    save: function(data) {
        try {
            const json = JSON.stringify(data);
            localStorage.setItem(this.STORAGE_KEY, json);
            return true;
        } catch (e) {
            console.error('Błąd zapisu do localStorage:', e);
            return false;
        }
    },
    
    // Wczytaj dane
    load: function() {
        try {
            const json = localStorage.getItem(this.STORAGE_KEY);
            if (!json) return [];
            return JSON.parse(json);
        } catch (e) {
            console.error('Błąd odczytu z localStorage:', e);
            return [];
        }
    },
    
    // Dodaj nowe dane (append, deduplikacja)
    append: function(newData) {
        const existing = this.load();
        const existingKeys = new Set(existing.map(item => `${item.Data}_${item.Czas}`));
        
        let added = 0;
        let duplicates = 0;
        
        newData.forEach(item => {
            const key = `${item.Data}_${item.Czas}`;
            if (!existingKeys.has(key)) {
                existing.push(item);
                existingKeys.add(key);
                added++;
            } else {
                duplicates++;
            }
        });
        
        // Sortuj po dacie i czasie
        existing.sort((a, b) => {
            if (a.DateTime && b.DateTime) {
                return a.DateTime - b.DateTime;
            }
            if (a.Data !== b.Data) {
                return a.Data.localeCompare(b.Data);
            }
            return a.Czas.localeCompare(b.Czas);
        });
        
        this.save(existing);
        return { added, duplicates };
    },
    
    // Wyczyść dane
    clear: function() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (e) {
            console.error('Błąd czyszczenia localStorage:', e);
            return false;
        }
    },
    
    // Eksportuj do CSV
    exportCSV: function() {
        const data = this.load();
        if (data.length === 0) {
            return 'Brak danych do eksportu';
        }
        
        // Nagłówek
        const headers = ['Data', 'Czas', 'JakośćSnu', 'GodzinySnu', 'Lęk', 'Napięcie', 'BrainFog', 'Energia', 'Fokus', 'PoraDnia', 'Notatki', 'Elvanse', 'ElvanseGodzina', 'Pregabalina', 'PregabalinaGodzina'];
        const rows = [headers.join(',')];
        
        // Dane
        data.forEach(item => {
            const row = headers.map(header => {
                const value = item[header] !== null && item[header] !== undefined ? item[header] : '';
                // Escape commas in values
                if (typeof value === 'string' && value.includes(',')) {
                    return `"${value}"`;
                }
                return value;
            });
            rows.push(row.join(','));
        });
        
        return rows.join('\n');
    },
    
    // Statystyki danych
    getStats: function() {
        const data = this.load();
        if (data.length === 0) {
            return { count: 0, dateRange: null, daysCount: 0, avgPerDay: 0 };
        }
        
        const dates = [...new Set(data.map(d => d.Data))].sort();
        const dateRange = dates.length > 0 ? { start: dates[0], end: dates[dates.length - 1] } : null;
        
        return {
            count: data.length,
            dateRange: dateRange,
            daysCount: dates.length,
            avgPerDay: dates.length > 0 ? (data.length / dates.length).toFixed(1) : 0
        };
    }
};

