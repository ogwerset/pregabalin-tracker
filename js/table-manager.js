/* ===== TABLE MANAGER MODULE ===== */
const TableManager = {
    currentData: [],
    sortColumn: 'Data',
    sortDirection: 'desc',
    filters: { dateFrom: null, dateTo: null, timeOfDay: null },
    
    // Render tabeli
    render: function(containerId, data) {
        if (!data || data.length === 0) {
            const tbody = document.querySelector(`#${containerId} tbody`);
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="9" class="text-center" style="padding: 40px; color: var(--text-secondary);">Brak danych. Zaimportuj dane w zakładce "Import Danych".</td></tr>';
            }
            return;
        }
        
        this.currentData = data;
        this.applyFiltersAndSort();
    },
    
    // Zastosuj filtry i sortowanie
    applyFiltersAndSort: function() {
        let filtered = [...this.currentData];
        
        // Filtry
        if (this.filters.dateFrom) {
            filtered = filtered.filter(item => {
                const [day, month, year] = item.Data.split('/');
                const itemDate = new Date(`${year}-${month}-${day}`);
                const filterDate = new Date(this.filters.dateFrom);
                return itemDate >= filterDate;
            });
        }
        
        if (this.filters.dateTo) {
            filtered = filtered.filter(item => {
                const [day, month, year] = item.Data.split('/');
                const itemDate = new Date(`${year}-${month}-${day}`);
                const filterDate = new Date(this.filters.dateTo);
                return itemDate <= filterDate;
            });
        }
        
        if (this.filters.timeOfDay) {
            filtered = filtered.filter(item => item.PoraDnia === this.filters.timeOfDay);
        }
        
        // Sortowanie
        filtered.sort((a, b) => {
            let aVal = a[this.sortColumn];
            let bVal = b[this.sortColumn];
            
            if (this.sortColumn === 'Data') {
                const [aDay, aMonth, aYear] = aVal.split('/');
                const [bDay, bMonth, bYear] = bVal.split('/');
                aVal = new Date(`${aYear}-${aMonth}-${aDay}`);
                bVal = new Date(`${bYear}-${bMonth}-${bDay}`);
            } else if (this.sortColumn === 'Czas') {
                // Porównaj jako string HH:MM
            } else {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            }
            
            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        
        // Render
        this.renderTable(filtered);
    },
    
    // Render tabeli HTML
    renderTable: function(data) {
        const tbody = document.querySelector('#data-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = data.map(item => {
            const lek = this.formatCell(item.Lęk, 'Lęk');
            const napiecie = this.formatCell(item.Napięcie, 'Napięcie');
            const fokus = this.formatCell(item.Fokus, 'Fokus');
            const energia = this.formatCell(item.Energia, 'Energia');
            const brainFog = this.formatCell(item.BrainFog, 'BrainFog');
            const pregabalin = item.Pregabalina_Dawka ? `${item.Pregabalina_Dawka}mg` : '-';
            
            return `
                <tr>
                    <td>${item.Data}</td>
                    <td>${item.Czas}</td>
                    <td>${lek}</td>
                    <td>${napiecie}</td>
                    <td>${fokus}</td>
                    <td>${energia}</td>
                    <td>${brainFog}</td>
                    <td>${item.PoraDnia}</td>
                    <td>${pregabalin}</td>
                </tr>
            `;
        }).join('');
    },
    
    // Formatowanie komórki
    formatCell: function(value, column) {
        if (value === null || value === undefined) return '-';
        
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        
        // Kolorowanie dla metryk
        if (['Lęk', 'Napięcie', 'BrainFog'].includes(column)) {
            if (num <= 2) return `<span style="color: var(--accent-green);">${num}</span>`;
            if (num >= 7) return `<span style="color: var(--accent-red);">${num}</span>`;
        } else if (['Fokus', 'Energia'].includes(column)) {
            if (num >= 7) return `<span style="color: var(--accent-green);">${num}</span>`;
            if (num <= 3) return `<span style="color: var(--accent-red);">${num}</span>`;
        }
        
        return num;
    },
    
    // Sortowanie
    sort: function(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        this.applyFiltersAndSort();
    },
    
    // Filtrowanie
    filter: function(filters) {
        this.filters = { ...this.filters, ...filters };
        this.applyFiltersAndSort();
    }
};
