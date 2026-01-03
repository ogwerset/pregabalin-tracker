/* ===== DATA PARSER MODULE ===== */
const DataParser = {
    // Supported CSV formats
    // v1 (15 columns): Data,Czas,JakośćSnu,GodzinySnu,Lęk,Napięcie,BrainFog,Energia,Fokus,PoraDnia,Notatki,Elvanse,ElvanseGodzina,Pregabalina,PregabalinaGodzina
    // v2 (17 columns): + Weed,WeedGodzina
    MIN_COLUMNS: 15,
    MAX_COLUMNS: 17,
    
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
            
            // Pomiń nagłówek CSV (rozpoznaj różne formaty)
            if (line.toUpperCase().includes('DATA,CZAS') || line.toUpperCase().includes('DATA, CZAS') || 
                line.toUpperCase().includes('WEED') && line.toUpperCase().includes('DATA')) {
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
        // Format v1 (15 cols): Data,Czas,JakośćSnu,GodzinySnu,Lęk,Napięcie,BrainFog,Energia,Fokus,PoraDnia,Notatki,Elvanse,ElvanseGodzina,Pregabalina,PregabalinaGodzina
        // Format v2 (17 cols): + Weed,WeedGodzina
        // Indeksy 0-9: stałe pola, 10: notatki (może zawierać przecinki), 11+: ostatnie pola leków
        
        const allParts = line.split(',').map(p => p.trim());
        
        // Określ format na podstawie liczby kolumn
        // 15+ kolumn = v1, 17+ kolumn = v2
        // Notatki mogą zawierać przecinki, więc musimy to obsłużyć
        let parts;
        let expectedCols = this.MIN_COLUMNS; // domyślnie 15
        
        // Sprawdź czy ostatnie 2 kolumny wyglądają jak Weed data (TAK/NIE lub -)
        if (allParts.length >= 17) {
            const potentialWeed = allParts[allParts.length - 2];
            if (potentialWeed && (potentialWeed === '-' || potentialWeed.toUpperCase().includes('TAK') || potentialWeed.toUpperCase() === 'NIE')) {
                expectedCols = 17;
            }
        }
        
        if (allParts.length > expectedCols) {
            // Notatki zawierają przecinki - scal środkowe części
            const extraParts = allParts.length - expectedCols;
            const first10 = allParts.slice(0, 10);
            const notatkiParts = allParts.slice(10, 11 + extraParts);
            const lastN = allParts.slice(11 + extraParts);
            parts = [...first10, notatkiParts.join(', '), ...lastN];
        } else if (allParts.length < this.MIN_COLUMNS) {
            return {
                valid: false,
                data: null,
                error: `Linia ${lineNumber}: Za mało kolumn (oczekiwano min ${this.MIN_COLUMNS}, otrzymano ${allParts.length})`
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
        // Obsłuż zarówno format v1 (15 cols) jak i v2 (17 cols z Weed)
        const data = {
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
            PregabalinaGodzina: parts[14],
            // v2 fields - opcjonalne
            Weed: parts[15] || '-',
            WeedGodzina: parts[16] || '-'
        };
        
        return {
            valid: true,
            data: data,
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
        
        // Normalizuj Weed (marihuana)
        normalized.Weed_Tak = this.extractWeed(normalized.Weed);
        if (normalized.WeedGodzina === '-' || normalized.WeedGodzina === 'N/A' || !normalized.WeedGodzina) {
            normalized.WeedGodzina = null;
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
    },
    
    // Ekstrakcja informacji o marihuanie
    extractWeed: function(text) {
        if (!text || text === '-' || text === 'N/A' || text === 'NIE' || text === 'nie' || text === 'BRAK') {
            return false;
        }
        
        const upperText = text.toUpperCase().trim();
        if (upperText === 'TAK' || upperText.startsWith('TAK')) {
            return true;
        }
        
        return false;
    }
};

