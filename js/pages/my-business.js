/**
 * My Business Page Controller
 */

const MyBusinessPage = {
    data: null,
    container: null,
    currentFilter: 'active',
    currentPage: 1,
    pageSize: 20,

    init() {
        this.container = document.getElementById('pageContent');
        if (!this.container) return;

        this.loadData();
        this.render();
        this.bindEvents();
    },

    loadData() {
        const saved = localStorage.getItem('myBusinessData');
        if (saved) {
            this.data = JSON.parse(saved);
        } else {
            this.data = JSON.parse(JSON.stringify(AppData.myBusiness));
        }
    },

    saveData() {
        localStorage.setItem('myBusinessData', JSON.stringify(this.data));
    },

    getFilteredData() {
        if (this.currentFilter === 'all') {
            return this.data.table.data;
        }
        return this.data.table.data.filter(item => item.status === 'active');
    },

    getTotalCount() {
        return this.getFilteredData().length;
    },

    render() {
        const { page, filters, table } = this.data;
        const filteredData = this.getFilteredData();
        const totalCount = this.getTotalCount();

        this.container.innerHTML = `
            <!-- Page Header -->
            <div class="page-header-row">
                <div class="page-header-left">
                    <h1 class="page-title">${page.title}</h1>
                    <span class="count-badge">${totalCount} Total</span>
                </div>
                <div class="page-header-right">
                    <button class="btn btn-outline" id="backBtn">Back</button>
                    <button class="btn btn-outline" id="reorderBtn">My Business Reorder</button>
                    <button class="btn btn-primary" id="addBtn">Add My Business</button>
                    <button class="btn btn-primary" id="quickAddBtn">Quick Add My Business</button>
                </div>
            </div>

            <!-- Filters Row -->
            <div class="filters-row">
                <div class="filters-left">
                    <div class="search-input-wrapper">
                        <span class="search-icon">🔍</span>
                        <input type="text" class="form-input search-input" id="searchInput" placeholder="${filters.search.placeholder}">
                    </div>
                    <select class="form-select status-filter" id="statusFilter">
                        ${filters.status.map(s => `<option value="${s.id}" ${s.id === this.currentFilter ? 'selected' : ''}>${s.label}</option>`).join('')}
                    </select>
                    <button class="btn btn-icon" id="filterBtn">
                        <span>⫧</span>
                    </button>
                </div>
                <div class="filters-right">
                    <button class="btn btn-icon" title="Refresh">↻</button>
                    <button class="btn btn-outline btn-sm">Export ▼</button>
                    <button class="btn btn-outline btn-sm">Toggle Columns ▼</button>
                    <button class="btn btn-outline btn-sm">Reset</button>
                </div>
            </div>

            <!-- Table -->
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            ${table.columns.map(col => `
                                <th>${col.label} ${col.sortable ? '<span class="sort-icon">↕</span>' : ''}</th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredData.length > 0 ? filteredData.map(row => `
                            <tr data-id="${row.id}">
                                <td>
                                    <div class="business-cell">
                                        <span class="avatar-sm">${row.initials || row.business.substring(0, 2).toUpperCase()}</span>
                                        <a href="client-detail.html?id=${row.id}" class="business-link">${row.business}</a>
                                    </div>
                                </td>
                                <td>${row.contactName}</td>
                                <td><a href="mailto:${row.contactEmail}" class="link-primary">${row.contactEmail}</a></td>
                                <td>${row.state}</td>
                                <td>${row.city}</td>
                                <td><span class="link-primary">${row.locationCount}</span></td>
                                <td><span class="link-primary">${row.areaCount}</span></td>
                                <td><span class="link-primary">${row.employeeCount}</span></td>
                                <td class="actions-cell">
                                    <button class="btn-icon-action" data-action="edit" data-id="${row.id}" title="Edit">✏️</button>
                                    <button class="btn-icon-action" data-action="archive" data-id="${row.id}" title="Archive">📥</button>
                                </td>
                            </tr>
                        `).join('') : `
                            <tr><td colspan="${table.columns.length}" class="no-data">No data available</td></tr>
                        `}
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="pagination-row">
                <div class="pagination-controls-left">
                    <button class="btn btn-pagination">❮❮</button>
                    <button class="btn btn-pagination">❮</button>
                    <span class="page-number active">1</span>
                    <button class="btn btn-pagination">❯</button>
                    <button class="btn btn-pagination">❯❯</button>
                </div>
                <div class="pagination-right">
                    <select class="form-select page-size-select" id="pageSizeSelect">
                        <option value="10">10</option>
                        <option value="20" selected>20</option>
                        <option value="50">50</option>
                    </select>
                    <span class="pagination-info">Showing 1 - ${filteredData.length} of ${totalCount}</span>
                </div>
            </div>

            <!-- Add Modal -->
            ${this.renderAddModal()}
        `;
    },

    renderAddModal() {
        return `
            <div class="modal-overlay" id="addBusinessModal">
                <div class="modal modal-lg">
                    <div class="modal-header">
                        <h3>Add My Business</h3>
                        <span class="modal-close" data-modal="addBusinessModal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Business Name</label>
                                <input type="text" class="form-input" id="businessName" placeholder="Enter business name">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Initials</label>
                                <input type="text" class="form-input" id="businessInitials" placeholder="e.g. LA" maxlength="2">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Contact Person Name</label>
                                <input type="text" class="form-input" id="contactName" placeholder="Enter contact name">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Contact Person Email</label>
                                <input type="email" class="form-input" id="contactEmail" placeholder="Enter email">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">State</label>
                                <input type="text" class="form-input" id="businessState" placeholder="Enter state">
                            </div>
                            <div class="form-group">
                                <label class="form-label">City</label>
                                <input type="text" class="form-input" id="businessCity" placeholder="Enter city">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="cancelAdd">Cancel</button>
                        <button class="btn btn-primary" id="saveAdd">Save</button>
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents() {
        // Back button
        document.getElementById('backBtn')?.addEventListener('click', () => {
            window.history.back();
        });

        // Add button
        document.getElementById('addBtn')?.addEventListener('click', () => {
            this.openAddModal();
        });

        // Quick Add button
        document.getElementById('quickAddBtn')?.addEventListener('click', () => {
            this.openAddModal();
        });

        // Status filter
        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.render();
            this.bindEvents();
        });

        // Search
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Modal close
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-modal');
                App.hideModal(modalId);
            });
        });

        // Cancel button
        document.getElementById('cancelAdd')?.addEventListener('click', () => {
            App.hideModal('addBusinessModal');
        });

        // Save button
        document.getElementById('saveAdd')?.addEventListener('click', () => {
            this.handleSave();
        });

        // Table actions
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                const id = e.currentTarget.getAttribute('data-id');
                this.handleTableAction(action, id);
            });
        });
    },

    openAddModal() {
        // Reset form
        document.getElementById('businessName').value = '';
        document.getElementById('businessInitials').value = '';
        document.getElementById('contactName').value = '';
        document.getElementById('contactEmail').value = '';
        document.getElementById('businessState').value = '';
        document.getElementById('businessCity').value = '';

        App.showModal('addBusinessModal');
    },

    handleSearch(query) {
        const rows = document.querySelectorAll('.table tbody tr');
        const lowerQuery = query.toLowerCase();

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(lowerQuery) ? '' : 'none';
        });
    },

    handleSave() {
        const businessName = document.getElementById('businessName').value.trim();
        const initials = document.getElementById('businessInitials').value.trim().toUpperCase();
        const contactName = document.getElementById('contactName').value.trim();
        const contactEmail = document.getElementById('contactEmail').value.trim();
        const state = document.getElementById('businessState').value.trim();
        const city = document.getElementById('businessCity').value.trim();

        if (!businessName) {
            alert('Please enter business name');
            return;
        }

        const newBusiness = {
            id: Date.now(),
            business: businessName,
            initials: initials || businessName.substring(0, 2).toUpperCase(),
            contactName: contactName,
            contactEmail: contactEmail,
            state: state,
            city: city,
            locationCount: 0,
            areaCount: 0,
            employeeCount: 0,
            status: 'active',
            createdAt: new Date().toISOString()
        };

        this.data.table.data.unshift(newBusiness);
        this.saveData();

        App.hideModal('addBusinessModal');
        this.render();
        this.bindEvents();

        App.showToast('Business added successfully!', 'success');
    },

    handleTableAction(action, id) {
        switch (action) {
            case 'edit':
                const item = this.data.table.data.find(i => i.id == id);
                if (item) {
                    alert(`Edit business: ${item.business}\n\nData: ${JSON.stringify(item, null, 2)}`);
                }
                break;
            case 'archive':
                if (confirm('Are you sure you want to archive this business?')) {
                    const item = this.data.table.data.find(i => i.id == id);
                    if (item) {
                        item.status = 'inactive';
                        this.saveData();
                        this.render();
                        this.bindEvents();
                        App.showToast('Business archived successfully!', 'success');
                    }
                }
                break;
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => MyBusinessPage.init(), 50);
});
