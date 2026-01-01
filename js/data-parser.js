/* ===== DATA PARSER MODULE ===== */
const DataParser = {
    // Parsuj RAW tekst z notatnika
    parseRAW: function(rawText) {
        if (!rawText || !rawText.trim()) {
            return { data: [], errors: ['Brak danych do przetworzenia'], skipped: 0 };
        }
        
        const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        const data = [];
        const errors = [];
        let skipped = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Pomiń nagłówek CSV
            if (line.toUpperCase().includes('DATA,CZAS') || line.toUpperCase().includes('DATA, CZAS')) {
                skipped++;
                continue;
            }
            
            // Pomiń puste linie
            if (!line || line === ',') {
                skipped++;
                continue;
            }
            
            const result = this.validateLine(line, i + 1);
            if (result.valid) {
                const normalized = this.normalize(result.data);
                data.push(normalized);
            } else {
                errors.push(result.error);
                skipped++;
            }
        }
        
        return { data, errors, skipped };
    },
    
    // Parsuj plik CSV
    parseCSV: function(csvContent) {
        return this.parseRAW(csvContent);
    },
    
    // Waliduj pojedynczą linię
    validateLine: function(line, lineNumber) {
        // Usuń trailing whitespace
        line = line.replace(/\s+$/, '');
        
        // Inteligentny split - zachowaj przecinki w notatkach
        // Format: Data,Czas,JakośćSnu,GodzinySnu,Lęk,Napięcie,BrainFog,Energia,Fokus,PoraDnia,Notatki,Elvanse,ElvanseGodzina,Pregabalina,PregabalinaGodzina
        // Indeksy 0-9: stałe pola, 10: notatki (może zawierać przecinki), 11-14: ostatnie 4 pola
        
        const allParts = line.split(',').map(p => p.trim());
        
        // Jeśli jest więcej niż 15 części, to notatki zawierają przecinki
        // Scal środkowe części jako notatki
        let parts;
        if (allParts.length > 15) {
            const extraParts = allParts.length - 15;
            const first10 = allParts.slice(0, 10);
            const notatkiParts = allParts.slice(10, 11 + extraParts);
            const last4 = allParts.slice(11 + extraParts);
            parts = [...first10, notatkiParts.join(', '), ...last4];
        } else if (allParts.length < 15) {
            return {
                valid: false,
                data: null,
                error: `Linia ${lineNumber}: Za mało kolumn (oczekiwano min 15, otrzymano ${allParts.length})`
            };
        } else {
            parts = allParts;
        }
        
        // Parsuj datę (DD/MM/YYYY) - trim już zrobiony
        const dateMatch = parts[0].match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!dateMatch) {
            return {
                valid: false,
                data: null,
                error: `Linia ${lineNumber}: Nieprawidłowy format daty (oczekiwano DD/MM/YYYY, otrzymano: ${parts[0]})`
            };
        }
        
        // Parsuj czas (HH:MM) - obsłuż spacę przed czasem
        const timeValue = parts[1].replace(/^\s+/, '');
        const timeMatch = timeValue.match(/^(\d{1,2}):(\d{2})$/);
        if (!timeMatch) {
            return {
                valid: false,
                data: null,
                error: `Linia ${lineNumber}: Nieprawidłowy format czasu (oczekiwano HH:MM, otrzymano: ${parts[1]})`
            };
        }
        parts[1] = timeValue; // Zapisz poprawiony czas
        
        // Waliduj metryki (Lęk, Napięcie, BrainFog, Energia, Fokus) - muszą być 1-10
        const metrics = ['Lęk', 'Napięcie', 'BrainFog', 'Energia', 'Fokus'];
        const metricIndices = [4, 5, 6, 7, 8];
        
        for (let i = 0; i < metricIndices.length; i++) {
            const idx = metricIndices[i];
            const value = parts[idx];
            if (value && value !== 'N/A' && value !== '-') {
                const num = parseFloat(value);
                if (isNaN(num) || num < 1 || num > 10) {
                    return {
                        valid: false,
                        data: null,
                        error: `Linia ${lineNumber}: Wartość ${metrics[i]} musi być liczbą od 1 do 10 (otrzymano: ${value})`
                    };
                }
            }
        }
        
        // Waliduj PoraDnia
        const validTimes = ['RANO', 'POŁUDNIE', 'POPOŁUDNIE', 'WIECZÓR'];
        if (!validTimes.includes(parts[9])) {
            return {
                valid: false,
                data: null,
                error: `Linia ${lineNumber}: Nieznana pora dnia (dozwolone: ${validTimes.join(', ')}, otrzymano: ${parts[9]})`
            };
        }
        
        // Jeśli wszystko OK, zwróć surowe dane
        return {
            valid: true,
            data: {
                Data: parts[0],
                Czas: parts[1],
                JakośćSnu: parts[2],
                GodzinySnu: parts[3],
                Lęk: parts[4],
                Napięcie: parts[5],
                BrainFog: parts[6],
                Energia: parts[7],
                Fokus: parts[8],
                PoraDnia: parts[9],
                Notatki: parts[10],
                Elvanse: parts[11],
                ElvanseGodzina: parts[12],
                Pregabalina: parts[13],
                PregabalinaGodzina: parts[14]
            },
            error: null
        };
    },
    
    // Normalizuj wartości
    normalize: function(record) {
        const normalized = { ...record };
        
        // Normalizuj wartości numeryczne
        const numericFields = ['JakośćSnu', 'GodzinySnu', 'Lęk', 'Napięcie', 'BrainFog', 'Energia', 'Fokus'];
        numericFields.forEach(field => {
            const value = normalized[field];
            if (value === 'N/A' || value === '-' || value === 'BRAK' || !value) {
                normalized[field] = null;
            } else {
                const num = parseFloat(value);
                normalized[field] = isNaN(num) ? null : num;
            }
        });
        
        // Normalizuj notatki
        if (normalized.Notatki === '-' || normalized.Notatki === 'BRAK' || !normalized.Notatki) {
            normalized.Notatki = null;
        }
        
        // Ekstrakcja dawek
        normalized.Elvanse_Dawka = this.extractDose(normalized.Elvanse);
        normalized.Pregabalina_Dawka = this.extractDose(normalized.Pregabalina);
        
        // Normalizuj godziny przyjmowania
        if (normalized.ElvanseGodzina === '-' || normalized.ElvanseGodzina === 'N/A' || !normalized.ElvanseGodzina) {
            normalized.ElvanseGodzina = null;
        }
        if (normalized.PregabalinaGodzina === '-' || normalized.PregabalinaGodzina === 'N/A' || !normalized.PregabalinaGodzina) {
            normalized.PregabalinaGodzina = null;
        }
        
        // Utwórz DateTime
        try {
            const [day, month, year] = normalized.Data.split('/');
            const dateStr = `${year}-${month}-${day}`;
            const [hours, minutes] = normalized.Czas.split(':');
            normalized.DateTime = new Date(`${dateStr}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`);
        } catch (e) {
            normalized.DateTime = null;
        }
        
        return normalized;
    },
    
    // Ekstrakcja dawki z tekstu
    extractDose: function(text) {
        if (!text || text === '-' || text === 'N/A' || text === 'NIE' || text === 'nie' || text === 'BRAK') {
            return null;
        }
        
        const match = text.match(/(\d+)MG/i);
        if (match) {
            return parseInt(match[1], 10);
        }
        
        return null;
    }
};

