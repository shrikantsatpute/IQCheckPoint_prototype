/**
 * Client Detail Page Controller
 */

const ClientDetailPage = {
    clientId: null,
    clientData: null,
    locationsData: [],
    loopsData: [],
    scanMasterData: [],
    container: null,
    activeTab: 'clients',
    activeSidebarItem: 'clients',
    currentFilter: 'active',
    // Location Detail View State
    selectedLocation: null,
    locationSidebarItem: 'resources',
    resourceSubTab: 'files',
    // Area State
    areasData: [],
    areaLoopsData: [],
    selectedArea: null,
    areaSidebarItem: 'general',
    areaFilter: 'active',
    // Loop Configuration State
    loopConfigState: {
        isEdit: false,
        editingLoopId: null,
        mode: 'normal',
        loopRule: 'time_based',
        normalAreas: [],
        advancedAreas: []
    },
    DAYS: [
        { key: 'mon', label: 'Mon' },
        { key: 'tue', label: 'Tue' },
        { key: 'wed', label: 'Wed' },
        { key: 'thu', label: 'Thu' },
        { key: 'fri', label: 'Fri' },
        { key: 'sat', label: 'Sat' },
        { key: 'sun', label: 'Sun' }
    ],

    init() {
        this.container = document.getElementById('pageContent');
        if (!this.container) return;

        // Get client ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.clientId = parseInt(urlParams.get('id'));

        this.loadClientData();
        this.loadLocationsData();
        this.loadLoopsData();
        this.loadScanMasterData();
        this.loadAreasData();

        if (this.clientData) {
            this.render();
            this.bindEvents();
        } else {
            this.container.innerHTML = '<div class="error-message">Client not found</div>';
        }
    },

    loadClientData() {
        const saved = localStorage.getItem('myBusinessData');
        let allData;
        if (saved) {
            allData = JSON.parse(saved);
        } else {
            allData = AppData.myBusiness;
        }
        this.clientData = allData.table.data.find(item => item.id === this.clientId);
    },

    loadLocationsData() {
        // Load locations for this client
        const savedLocations = localStorage.getItem(`clientLocations_${this.clientId}`);
        if (savedLocations) {
            this.locationsData = JSON.parse(savedLocations);
        } else if (AppData.clientLocations && AppData.clientLocations[this.clientId]) {
            this.locationsData = JSON.parse(JSON.stringify(AppData.clientLocations[this.clientId]));
        } else {
            this.locationsData = [];
        }
    },

    loadLoopsData(locationId) {
        if (!locationId) return;
        const savedLoops = localStorage.getItem(`locationLoops_${locationId}`);
        if (savedLoops) {
            this.loopsData = JSON.parse(savedLoops);
        } else if (AppData.locationLoops && AppData.locationLoops[locationId]) {
            this.loopsData = JSON.parse(JSON.stringify(AppData.locationLoops[locationId]));
        } else {
            this.loopsData = [];
        }
    },

    saveLoopsData(locationId) {
        localStorage.setItem(`locationLoops_${locationId}`, JSON.stringify(this.loopsData));
    },

    loadScanMasterData() {
        // Load scan master data from localStorage or AppData
        const saved = localStorage.getItem('scanMasterData');
        if (saved) {
            const data = JSON.parse(saved);
            this.scanMasterData = data.table?.data || [];
        } else if (AppData.scanMaster?.table?.data) {
            this.scanMasterData = AppData.scanMaster.table.data.filter(s => s.status === 'active');
        } else {
            this.scanMasterData = [];
        }
    },

    getAvailableScans() {
        // Get scans that are not already assigned to this location
        const assignedIds = this.loopsData.map(l => l.scanMasterId);
        return this.scanMasterData.filter(s => s.status === 'active' && !assignedIds.includes(s.id));
    },

    getAvailableScansForArea() {
        // Get scans that are not already assigned to this area
        const assignedIds = this.areaLoopsData.map(l => l.scanMasterId);
        return this.scanMasterData.filter(s => s.status === 'active' && !assignedIds.includes(s.id));
    },

    loadAreasData() {
        const savedAreas = localStorage.getItem(`clientAreas_${this.clientId}`);
        if (savedAreas) {
            this.areasData = JSON.parse(savedAreas);
        } else if (AppData.clientAreas && AppData.clientAreas[this.clientId]) {
            this.areasData = JSON.parse(JSON.stringify(AppData.clientAreas[this.clientId]));
        } else {
            this.areasData = [];
        }
    },

    saveAreasData() {
        localStorage.setItem(`clientAreas_${this.clientId}`, JSON.stringify(this.areasData));
    },

    loadAreaLoopsData(areaId) {
        if (!areaId) return;
        const savedLoops = localStorage.getItem(`areaLoops_${areaId}`);
        if (savedLoops) {
            this.areaLoopsData = JSON.parse(savedLoops);
        } else if (AppData.areaLoops && AppData.areaLoops[areaId]) {
            this.areaLoopsData = JSON.parse(JSON.stringify(AppData.areaLoops[areaId]));
        } else {
            this.areaLoopsData = [];
        }
    },

    saveAreaLoopsData(areaId) {
        localStorage.setItem(`areaLoops_${areaId}`, JSON.stringify(this.areaLoopsData));
    },

    getFilteredAreas() {
        if (this.areaFilter === 'all') {
            return this.areasData;
        }
        return this.areasData.filter(item => item.status === 'active');
    },

    saveClientData() {
        const saved = localStorage.getItem('myBusinessData');
        let allData;
        if (saved) {
            allData = JSON.parse(saved);
        } else {
            allData = JSON.parse(JSON.stringify(AppData.myBusiness));
        }
        const index = allData.table.data.findIndex(item => item.id === this.clientId);
        if (index !== -1) {
            allData.table.data[index] = this.clientData;
            localStorage.setItem('myBusinessData', JSON.stringify(allData));
        }
    },

    saveLocationsData() {
        localStorage.setItem(`clientLocations_${this.clientId}`, JSON.stringify(this.locationsData));
    },

    getFilteredLocations() {
        if (this.currentFilter === 'all') {
            return this.locationsData;
        }
        return this.locationsData.filter(item => item.status === 'active');
    },

    render() {
        const client = this.clientData;

        // If a location is selected, show location detail view
        if (this.selectedLocation) {
            this.container.innerHTML = this.renderLocationDetailView();
            return;
        }

        // If an area is selected, show area detail view
        if (this.selectedArea) {
            this.container.innerHTML = this.renderAreaDetailView();
            return;
        }

        this.container.innerHTML = `
            <!-- Client Header -->
            <div class="client-header">
                <div class="client-header-left">
                    <span class="client-header-title">Clients</span>
                    <span class="client-header-separator">|</span>
                    <span class="client-header-name">${client.business}</span>
                </div>
                <div class="client-header-right">
                    <a href="my-business.html" class="btn btn-outline">Back To All Clients</a>
                </div>
            </div>

            <!-- Client Tabs -->
            <div class="client-tabs">
                <div class="client-tab ${this.activeTab === 'clients' ? 'active' : ''}" data-tab="clients">
                    <span class="tab-icon">👤</span> Clients
                </div>
                <div class="client-tab ${this.activeTab === 'location' ? 'active' : ''}" data-tab="location">
                    <span class="tab-icon">📍</span> Location
                </div>
                <div class="client-tab ${this.activeTab === 'area' ? 'active' : ''}" data-tab="area">
                    <span class="tab-icon">🏢</span> Area
                </div>
            </div>

            <!-- Tab Content -->
            <div class="tab-content">
                ${this.activeTab === 'clients' ? this.renderClientsTab() : ''}
                ${this.activeTab === 'location' ? this.renderLocationTab() : ''}
                ${this.activeTab === 'area' ? this.renderAreaTab() : ''}
            </div>
        `;
    },

    renderClientsTab() {
        const client = this.clientData;
        const nameParts = (client.contactName || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        return `
            <div class="client-content">
                <!-- Sidebar -->
                <div class="client-sidebar">
                    <div class="sidebar-item ${this.activeSidebarItem === 'clients' ? 'active' : ''}" data-item="clients">
                        <span class="sidebar-icon">👤</span> Clients
                    </div>
                    <div class="sidebar-item ${this.activeSidebarItem === 'contact' ? 'active' : ''}" data-item="contact">
                        <span class="sidebar-icon">📞</span> Contact
                    </div>
                    <div class="sidebar-item ${this.activeSidebarItem === 'address' ? 'active' : ''}" data-item="address">
                        <span class="sidebar-icon">📍</span> Address
                    </div>
                    <div class="sidebar-item ${this.activeSidebarItem === 'reward' ? 'active' : ''}" data-item="reward">
                        <span class="sidebar-icon">🏆</span> Reward
                    </div>
                    <div class="sidebar-item ${this.activeSidebarItem === 'location-reorder' ? 'active' : ''}" data-item="location-reorder">
                        <span class="sidebar-icon">🔄</span> Location Reorder
                    </div>
                    <div class="sidebar-item ${this.activeSidebarItem === 'clients-user' ? 'active' : ''}" data-item="clients-user">
                        <span class="sidebar-icon">👥</span> Clients User/External
                    </div>
                    <div class="sidebar-item ${this.activeSidebarItem === 'setting' ? 'active' : ''}" data-item="setting">
                        <span class="sidebar-icon">⚙️</span> Setting
                    </div>
                    <div class="sidebar-item ${this.activeSidebarItem === 'people-group' ? 'active' : ''}" data-item="people-group">
                        <span class="sidebar-icon">👨‍👩‍👧‍👦</span> People Group
                    </div>
                </div>

                <!-- Main Form -->
                <div class="client-main">
                    <h2 class="section-title">Clients</h2>

                    <!-- Profile Image -->
                    <div class="form-group">
                        <label class="form-label">Profile Image</label>
                        <div class="profile-image-container">
                            <div class="profile-image">
                                <span class="profile-initials">${client.initials || client.business.substring(0, 2).toUpperCase()}</span>
                            </div>
                            <div class="profile-image-actions">
                                <button class="btn-icon-sm" title="Edit">✏️</button>
                                <button class="btn-icon-sm" title="Delete">🗑️</button>
                            </div>
                        </div>
                    </div>

                    <!-- Form Fields -->
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Clients Name <span class="required">*</span></label>
                            <input type="text" class="form-input" id="clientName" value="${client.business}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Contact Person Email Address <span class="required">*</span></label>
                            <input type="email" class="form-input" id="contactEmail" value="${client.contactEmail}">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Contact Person First Name <span class="required">*</span></label>
                            <input type="text" class="form-input" id="firstName" value="${firstName}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Contact Person Last Name <span class="required">*</span></label>
                            <input type="text" class="form-input" id="lastName" value="${lastName}">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Country Code</label>
                            <select class="form-select" id="countryCode">
                                <option value="+61">+61 - Australia</option>
                                <option value="+1">+1 - USA</option>
                                <option value="+44">+44 - UK</option>
                                <option value="+91">+91 - India</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Contact Person Mobile Number</label>
                            <input type="tel" class="form-input" id="mobileNumber" value="${client.mobileNumber || ''}">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Note</label>
                        <textarea class="form-input form-textarea" id="note" rows="4">${client.note || ''}</textarea>
                    </div>

                    <div class="form-group" style="max-width: 50%;">
                        <label class="form-label">Export Code</label>
                        <input type="text" class="form-input" id="exportCode" value="${client.exportCode || ''}">
                    </div>

                    <!-- Save Button -->
                    <div class="form-actions">
                        <button class="btn btn-primary" id="saveBtn">Save</button>
                    </div>
                </div>
            </div>
        `;
    },

    renderLocationTab() {
        const locations = this.getFilteredLocations();
        const totalCount = locations.length;

        return `
            <div class="location-content">
                <!-- Location Header -->
                <div class="page-header-row" style="padding: 20px 25px;">
                    <div class="page-header-left">
                        <h1 class="page-title">Location</h1>
                        <span class="count-badge">${totalCount} Total</span>
                    </div>
                    <div class="page-header-right">
                        <button class="btn btn-outline" id="locationBackBtn">Back</button>
                        <button class="btn btn-primary" id="addLocationBtn">Add Location</button>
                    </div>
                </div>

                <!-- Filters -->
                <div class="filters-row" style="padding: 0 25px 15px;">
                    <div class="filters-left">
                        <div class="search-input-wrapper">
                            <span class="search-icon">🔍</span>
                            <input type="text" class="form-input search-input" id="locationSearchInput" placeholder="Search">
                        </div>
                        <select class="form-select status-filter" id="locationStatusFilter">
                            <option value="active" ${this.currentFilter === 'active' ? 'selected' : ''}>Active</option>
                            <option value="all" ${this.currentFilter === 'all' ? 'selected' : ''}>All</option>
                        </select>
                        <button class="btn btn-icon">⫧</button>
                    </div>
                    <div class="filters-right">
                        <button class="btn btn-icon" title="Refresh">↻</button>
                        <button class="btn btn-outline btn-sm">Export ▼</button>
                        <button class="btn btn-outline btn-sm">Toggle Columns ▼</button>
                        <button class="btn btn-outline btn-sm">Reset</button>
                    </div>
                </div>

                <!-- Table -->
                <div class="table-container" style="padding: 0 25px;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Location Name <span class="sort-icon">↕</span></th>
                                <th>Address <span class="sort-icon">↕</span></th>
                                <th>Weeks Start With <span class="sort-icon">↕</span></th>
                                <th>Location Open Time <span class="sort-icon">↕</span></th>
                                <th>Assign Employee Count <span class="sort-icon">↕</span></th>
                                <th>Area Count <span class="sort-icon">↕</span></th>
                                <th>Budget Type <span class="sort-icon">↕</span></th>
                                <th>Assign Employee</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${locations.length > 0 ? locations.map(loc => `
                                <tr data-id="${loc.id}">
                                    <td><a href="#" class="link-primary location-name-link" data-location-id="${loc.id}">${loc.name}</a></td>
                                    <td>${loc.address}</td>
                                    <td>${loc.weeksStartWith}</td>
                                    <td>${loc.openTime}</td>
                                    <td>${loc.employeeCount}</td>
                                    <td>${loc.areaCount}</td>
                                    <td>${loc.budgetType}</td>
                                    <td><button class="btn btn-primary btn-sm">Assign Employee</button></td>
                                    <td class="actions-cell">
                                        <button class="btn-icon-action" data-action="edit-location" data-id="${loc.id}" title="Edit">✏️</button>
                                        <button class="btn-icon-action" data-action="archive-location" data-id="${loc.id}" title="Archive">📥</button>
                                    </td>
                                </tr>
                            `).join('') : `
                                <tr><td colspan="9" class="no-data">No locations available</td></tr>
                            `}
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="pagination-row" style="padding: 15px 25px;">
                    <div class="pagination-controls-left">
                        <button class="btn btn-pagination">❮❮</button>
                        <button class="btn btn-pagination">❮</button>
                        <span class="page-number active">1</span>
                        <span class="page-number">2</span>
                        <button class="btn btn-pagination">❯</button>
                        <button class="btn btn-pagination">❯❯</button>
                    </div>
                    <div class="pagination-right">
                        <select class="form-select page-size-select">
                            <option value="20" selected>20</option>
                            <option value="50">50</option>
                        </select>
                        <span class="pagination-info">Showing 1 - ${Math.min(20, totalCount)} of ${totalCount}</span>
                    </div>
                </div>
            </div>
        `;
    },

    renderAreaTab() {
        const areas = this.getFilteredAreas();
        const totalCount = areas.length;

        return `
            <div class="area-content">
                <!-- Area Header -->
                <div class="page-header-row" style="padding: 20px 25px;">
                    <div class="page-header-left">
                        <h1 class="page-title">My Business Area</h1>
                        <span class="count-badge">${totalCount} Total</span>
                    </div>
                    <div class="page-header-right">
                        <button class="btn btn-outline" id="areaBackBtn">Back</button>
                        <button class="btn btn-primary" id="addAreaBtn">Add Area</button>
                    </div>
                </div>

                <!-- Filters -->
                <div class="filters-row" style="padding: 0 25px 15px;">
                    <div class="filters-left">
                        <div class="search-input-wrapper">
                            <span class="search-icon">🔍</span>
                            <input type="text" class="form-input search-input" id="areaSearchInput" placeholder="Search">
                        </div>
                        <select class="form-select status-filter" id="areaStatusFilter">
                            <option value="active" ${this.areaFilter === 'active' ? 'selected' : ''}>Active</option>
                            <option value="all" ${this.areaFilter === 'all' ? 'selected' : ''}>All</option>
                        </select>
                        <button class="btn btn-icon">⫧</button>
                    </div>
                    <div class="filters-right">
                        <button class="btn btn-icon" title="Refresh">↻</button>
                        <button class="btn btn-outline btn-sm">Export ▼</button>
                        <button class="btn btn-outline btn-sm">Toggle Columns ▼</button>
                        <button class="btn btn-outline btn-sm">Reset</button>
                    </div>
                </div>

                <!-- Table -->
                <div class="table-container" style="padding: 0 25px;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>My Business Location <span class="sort-icon">↕</span></th>
                                <th>Area Name <span class="sort-icon">↕</span></th>
                                <th>Area Address <span class="sort-icon">↕</span></th>
                                <th>Area Send GPS <span class="sort-icon">↕</span></th>
                                <th>Allowed In Schedule <span class="sort-icon">↕</span></th>
                                <th>Area Remark <span class="sort-icon">↕</span></th>
                                <th>Point Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${areas.length > 0 ? areas.map(area => `
                                <tr data-id="${area.id}">
                                    <td>${area.locationName}</td>
                                    <td><a href="#" class="link-primary area-name-link" data-area-id="${area.id}">${area.name}</a></td>
                                    <td>${area.address}</td>
                                    <td>${area.sendGPS}</td>
                                    <td>${area.allowedInSchedule}</td>
                                    <td>${area.remark || '-'}</td>
                                    <td>
                                        <div class="point-type-badges">
                                            ${(area.pointTypes || []).map(pt => `<span class="point-badge point-${pt.toLowerCase()}">${pt}</span>`).join('')}
                                        </div>
                                    </td>
                                    <td class="actions-cell">
                                        <button class="btn-icon-action" data-action="edit-area" data-id="${area.id}" title="Edit">✏️</button>
                                        <button class="btn-icon-action" data-action="archive-area" data-id="${area.id}" title="Archive">📥</button>
                                    </td>
                                </tr>
                            `).join('') : `
                                <tr><td colspan="8" class="no-data">No areas available</td></tr>
                            `}
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="pagination-row" style="padding: 15px 25px;">
                    <div class="pagination-controls-left">
                        <button class="btn btn-pagination">❮❮</button>
                        <button class="btn btn-pagination">❮</button>
                        <span class="page-number active">1</span>
                        <button class="btn btn-pagination">❯</button>
                        <button class="btn btn-pagination">❯❯</button>
                    </div>
                    <div class="pagination-right">
                        <select class="form-select page-size-select">
                            <option value="20" selected>20</option>
                            <option value="50">50</option>
                        </select>
                        <span class="pagination-info">Showing 1 - ${Math.min(20, totalCount)} of ${totalCount}</span>
                    </div>
                </div>
            </div>
        `;
    },

    renderLocationDetailView() {
        const client = this.clientData;
        const location = this.selectedLocation;
        const sidebarItems = AppData.locationDetailSidebar || [];

        return `
            <!-- Location Detail Header -->
            <div class="client-header">
                <div class="client-header-left">
                    <span class="client-header-title">Clients</span>
                    <span class="client-header-separator">|</span>
                    <span class="client-header-name">${client.business}</span>
                    <span class="client-header-separator">|</span>
                    <span class="client-header-location">Location: ${location.name}</span>
                </div>
                <div class="client-header-right">
                    <button class="btn btn-outline" id="backToAllLocations">Back To All Location</button>
                    <button class="btn btn-primary" id="addAssignEmployee">Add & Assign Employee</button>
                </div>
            </div>

            <!-- Location Detail Tabs -->
            <div class="client-tabs">
                <div class="client-tab" data-tab="clients">
                    <span class="tab-icon">👤</span> Clients
                </div>
                <div class="client-tab active" data-tab="location">
                    <span class="tab-icon">📍</span> Location
                </div>
                <div class="client-tab" data-tab="area">
                    <span class="tab-icon">🏢</span> Area
                </div>
            </div>

            <!-- Location Detail Content -->
            <div class="tab-content">
                <div class="client-content">
                    <!-- Location Detail Sidebar -->
                    <div class="client-sidebar">
                        ${sidebarItems.map(item => `
                            <div class="sidebar-item ${this.locationSidebarItem === item.id ? 'active' : ''}" data-item="${item.id}">
                                <span class="sidebar-icon">${item.icon}</span>
                                ${item.label}
                                ${item.isNew ? '<span class="new-badge">New</span>' : ''}
                            </div>
                        `).join('')}
                    </div>

                    <!-- Location Detail Main Content -->
                    <div class="client-main location-detail-main">
                        ${this.renderLocationDetailContent()}
                    </div>
                </div>
            </div>
        `;
    },

    renderLocationDetailContent() {
        switch (this.locationSidebarItem) {
            case 'resources':
                return this.renderResourcesContent();
            case 'loop':
                return this.renderLoopContent();
            default:
                return `
                    <h2 class="section-title">${this.getLocationSidebarLabel()}</h2>
                    <p class="text-muted">This section is coming soon...</p>
                `;
        }
    },

    getLocationSidebarLabel() {
        const item = (AppData.locationDetailSidebar || []).find(i => i.id === this.locationSidebarItem);
        return item ? item.label : '';
    },

    renderResourcesContent() {
        return `
            <!-- Resources Sub-tabs -->
            <div class="resource-tabs">
                <div class="resource-tab ${this.resourceSubTab === 'files' ? 'active' : ''}" data-resource-tab="files">Files</div>
                <div class="resource-tab ${this.resourceSubTab === 'notes' ? 'active' : ''}" data-resource-tab="notes">Notes</div>
            </div>

            ${this.resourceSubTab === 'files' ? this.renderFilesContent() : this.renderNotesContent()}
        `;
    },

    renderFilesContent() {
        return `
            <div class="files-section">
                <div class="files-header">
                    <h2 class="section-title">Files</h2>
                    <button class="btn btn-primary" id="addFilesBtn">Add Files</button>
                </div>

                <div class="files-toolbar">
                    <div class="search-input-wrapper">
                        <span class="search-icon">🔍</span>
                        <input type="text" class="form-input search-input" id="filesSearchInput" placeholder="Search">
                    </div>
                    <button class="btn btn-icon" title="Refresh">↻</button>
                </div>

                <div class="files-table">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>File Name <span class="sort-icon">↕</span></th>
                                <th>Date Upload</th>
                                <th>Created By</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="4" class="no-data">
                                    <div class="empty-state">
                                        <div class="empty-state-icon">📄</div>
                                        <p>Files not found</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderNotesContent() {
        return `
            <div class="notes-section">
                <div class="files-header">
                    <h2 class="section-title">Notes</h2>
                    <button class="btn btn-primary" id="addNoteBtn">Add Note</button>
                </div>

                <div class="empty-state" style="margin-top: 100px;">
                    <div class="empty-state-icon">📝</div>
                    <p>No notes available</p>
                </div>
            </div>
        `;
    },

    renderLoopContent() {
        const loops = this.loopsData || [];

        return `
            <div class="loop-section">
                <div class="loop-header">
                    <h2 class="section-title">Loop</h2>
                    <button class="btn btn-primary" id="addLoopBtn">Add New</button>
                </div>

                <div class="loop-list">
                    ${loops.length > 0 ? loops.map(loop => `
                        <div class="loop-item" data-loop-id="${loop.id}">
                            <div class="loop-info">
                                <span class="loop-name">${loop.name}</span>
                                <span class="loop-mode-badge ${loop.mode === 'advanced' ? 'advanced' : 'normal'}">${loop.mode === 'advanced' ? 'Schedule Based' : 'Interval Based'}</span>
                                ${loop.mode === 'advanced' ? `<span class="loop-rule-badge">${loop.loopRule === 'gap_between' ? 'Gap Based' : 'Time Slot'}</span>` : ''}
                            </div>
                            <div class="loop-actions">
                                <button class="btn-icon-action" data-action="copy-loop" data-id="${loop.id}" title="Copy">📋</button>
                                <button class="btn-icon-action" data-action="edit-loop" data-id="${loop.id}" title="Edit">✏️</button>
                                <button class="btn-icon-action" data-action="delete-loop" data-id="${loop.id}" title="Delete">🗑️</button>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="empty-state" style="margin-top: 100px;">
                            <div class="empty-state-icon">🔄</div>
                            <p>No loops available</p>
                        </div>
                    `}
                </div>
            </div>

            <!-- Loop Configuration Modal -->
            ${this.renderLoopConfigModal()}
        `;
    },

    renderLoopConfigModal(editLoop = null) {
        const isEdit = editLoop !== null;
        const modalTitle = isEdit ? 'Edit Loop Configuration' : 'Loop Configuration';

        return `
            <div class="modal-overlay" id="loopConfigModal">
                <div class="modal modal-xl">
                    <div class="modal-header">
                        <h3>${modalTitle}</h3>
                        <span class="modal-close" data-modal="loopConfigModal">&times;</span>
                    </div>
                    <div class="modal-body loop-config-body">
                        <!-- Basic Info -->
                        <div class="loop-config-row">
                            <div class="form-group">
                                <label class="form-label">Loop Name <span class="required">*</span></label>
                                <input type="text" class="form-input" id="loopName" value="${isEdit ? editLoop.name : ''}" placeholder="Enter loop name">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Loop Mode <span class="required">*</span></label>
                                <div class="loop-mode-toggle">
                                    <input type="radio" id="modeNormal" name="loopMode" value="normal" ${!isEdit || editLoop.mode === 'normal' ? 'checked' : ''}>
                                    <label for="modeNormal">Interval Based</label>
                                    <input type="radio" id="modeAdvanced" name="loopMode" value="advanced" ${isEdit && editLoop.mode === 'advanced' ? 'checked' : ''}>
                                    <label for="modeAdvanced">Schedule Based</label>
                                </div>
                                <p class="field-hint" id="modeHint">Scans are expected at cumulative intervals after loop starts</p>
                                <div id="loopRuleWrap" class="loop-rule-wrap ${!isEdit || editLoop.mode !== 'advanced' ? 'hidden' : ''}">
                                    <label class="form-label">Schedule Type <span class="required">*</span></label>
                                    <select class="form-select" id="loopRule">
                                        <option value="time_based" ${!isEdit || editLoop.loopRule !== 'gap_between' ? 'selected' : ''}>Time Slot (Specific time windows)</option>
                                        <option value="gap_between" ${isEdit && editLoop.loopRule === 'gap_between' ? 'selected' : ''}>Gap Based (Minimum gap between scans)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Normal Mode Fields -->
                        <div id="normalFields" class="loop-config-section ${isEdit && editLoop.mode === 'advanced' ? 'hidden' : ''}">
                            <div class="section-divider">
                                <span>Interval Based Settings</span>
                            </div>
                            <div class="loop-config-row three-cols">
                                <div class="form-group">
                                    <label class="form-label">Loop Multiple <span class="required">*</span></label>
                                    <input type="number" class="form-input" id="loopMultiple" min="0" value="${isEdit ? (editLoop.loopMultiple || 1) : 1}">
                                    <p class="field-hint">How many times this loop can repeat in a shift. 0 = runs once, 1+ = can restart after completion.</p>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Reward Point</label>
                                    <input type="number" class="form-input" id="rewardPoint" min="0" value="${isEdit ? (editLoop.rewardPoint || 10) : 10}">
                                    <p class="field-hint">Points awarded to employee for each valid scan completed within the allowed time window.</p>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Loop Buffer (minutes)</label>
                                    <input type="number" class="form-input" id="loopBuffer" min="0" value="${isEdit ? (editLoop.loopBuffer || 5) : 5}">
                                    <p class="field-hint">Tolerance window around expected scan time. e.g., 5 min buffer = scan valid 5 min early or late.</p>
                                </div>
                            </div>

                            <div class="section-divider">
                                <span>Scan Sequence</span>
                                <button class="btn btn-sm btn-outline" type="button" id="addAreaNormalBtn">+ Add New</button>
                            </div>
                            <p class="field-hint section-hint">Define the order of scans and when each should occur after the loop starts.</p>

                            <div class="areas-table-container">
                                <table class="table areas-table" id="normalAreasTable">
                                    <thead>
                                        <tr>
                                            <th style="width:45%;">Area (Scan Point) <span class="required">*</span></th>
                                            <th style="width:40%;">
                                                <div class="th-with-info">
                                                    <span>Loop Interval (minutes)</span>
                                                    <button type="button" class="info-icon" id="intervalInfoBtn" title="Click for example">i</button>
                                                    <div class="info-tooltip" id="intervalInfoTooltip">
                                                        <div class="info-tooltip-header">
                                                            <strong>How Loop Interval Works</strong>
                                                            <button type="button" class="info-tooltip-close" id="intervalInfoClose">×</button>
                                                        </div>
                                                        <div class="info-tooltip-body">
                                                            <p>Each interval is <strong>cumulative</strong> from when the loop starts.</p>
                                                            <div class="info-example">
                                                                <strong>Example:</strong> Loop starts at 9:00 AM<br>
                                                                <table class="info-example-table">
                                                                    <tr><td>Area A</td><td>5 min</td><td>→ 9:05 AM</td></tr>
                                                                    <tr><td>Area B</td><td>12 min</td><td>→ 9:17 AM (5+12)</td></tr>
                                                                    <tr><td>Area C</td><td>19 min</td><td>→ 9:36 AM (5+12+19)</td></tr>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span class="th-hint">Cumulative minutes from loop start when scan is expected</span>
                                            </th>
                                            <th style="width:15%;"></th>
                                        </tr>
                                    </thead>
                                    <tbody id="normalAreaRows">
                                        <!-- Dynamic rows will be inserted here -->
                                    </tbody>
                                </table>
                                <div id="noAreasNormal" class="no-areas-message ${isEdit && editLoop.normalAreas?.length > 0 ? 'hidden' : ''}">
                                    Click "+ Add New" to add scan points to this loop
                                </div>
                            </div>
                        </div>

                        <!-- Advanced Mode Fields -->
                        <div id="advancedFields" class="loop-config-section ${!isEdit || editLoop.mode !== 'advanced' ? 'hidden' : ''}">
                            <div class="section-divider">
                                <span>Schedule Based Settings</span>
                                <button class="btn btn-sm btn-outline" type="button" id="addAreaAdvancedBtn">+ Add New</button>
                            </div>
                            <p class="loop-hint" id="ruleHelp">
                                <strong>Time Slot:</strong> Define specific time windows for each day when scans should occur.
                            </p>
                            <div id="advancedAreaList">
                                <!-- Dynamic area cards will be inserted here -->
                            </div>
                            <div id="noAreasAdvanced" class="no-areas-message">
                                Click "+ Add New" to configure scan schedule by day
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="cancelLoopConfigBtn">Cancel</button>
                        <button class="btn btn-primary" id="saveLoopConfigBtn">Save Loop</button>
                    </div>
                </div>
            </div>
        `;
    },

    getAvailableAreasForLocation() {
        // Get all active areas for this client
        // Areas can be from any location within the same client/business
        return this.areasData.filter(area => area.status === 'active');
    },

    // ========== LOOP CONFIGURATION HELPERS ==========
    uid() {
        return Math.random().toString(16).slice(2) + Date.now().toString(16);
    },

    resetLoopConfigState() {
        this.loopConfigState = {
            isEdit: false,
            editingLoopId: null,
            mode: 'normal',
            loopRule: 'time_based',
            normalAreas: [],
            advancedAreas: []
        };
    },

    initLoopConfigForEdit(loop) {
        this.loopConfigState.isEdit = true;
        this.loopConfigState.editingLoopId = loop.id;
        this.loopConfigState.mode = loop.mode || 'normal';
        this.loopConfigState.loopRule = loop.loopRule || 'time_based';
        this.loopConfigState.normalAreas = loop.normalAreas ? JSON.parse(JSON.stringify(loop.normalAreas)) : [];
        this.loopConfigState.advancedAreas = loop.advancedAreas ? JSON.parse(JSON.stringify(loop.advancedAreas)) : [];
    },

    createAdvancedAreaConfig(areaId, areaName) {
        const id = this.uid();
        const dayConfig = {};
        this.DAYS.forEach(d => {
            dayConfig[d.key] = {
                enabled: false,
                slots: [],
                gapValue: 10,
                gapUnit: 'minutes' // Options: 'hours' or 'minutes'
            };
        });
        return { id, areaId, areaName, dayConfig };
    },

    renderNormalAreasTable() {
        const tbody = document.getElementById('normalAreaRows');
        const noAreasMsg = document.getElementById('noAreasNormal');
        if (!tbody) return;

        const areas = this.loopConfigState.normalAreas;
        const availableAreas = this.getAvailableAreasForLocation();

        if (areas.length === 0) {
            tbody.innerHTML = '';
            noAreasMsg?.classList.remove('hidden');
            return;
        }

        noAreasMsg?.classList.add('hidden');
        tbody.innerHTML = areas.map(row => `
            <tr data-row-id="${row.id}">
                <td>
                    <select class="form-select area-select-normal" data-row-id="${row.id}">
                        ${availableAreas.map(a => `<option value="${a.id}" ${a.id === row.areaId ? 'selected' : ''}>${a.name}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <input type="number" class="form-input interval-input-normal" data-row-id="${row.id}" min="0" value="${row.interval || 1}">
                </td>
                <td class="text-right">
                    <button class="btn btn-sm btn-danger remove-normal-area" data-row-id="${row.id}" type="button">Remove</button>
                </td>
            </tr>
        `).join('');

        // Bind events for normal area rows
        tbody.querySelectorAll('.area-select-normal').forEach(select => {
            select.addEventListener('change', (e) => {
                const rowId = e.target.getAttribute('data-row-id');
                const area = this.loopConfigState.normalAreas.find(a => a.id === rowId);
                if (area) {
                    area.areaId = parseInt(e.target.value);
                    area.areaName = e.target.options[e.target.selectedIndex].text;
                }
            });
        });

        tbody.querySelectorAll('.interval-input-normal').forEach(input => {
            input.addEventListener('input', (e) => {
                const rowId = e.target.getAttribute('data-row-id');
                const area = this.loopConfigState.normalAreas.find(a => a.id === rowId);
                if (area) area.interval = parseInt(e.target.value) || 0;
            });
        });

        tbody.querySelectorAll('.remove-normal-area').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rowId = e.target.getAttribute('data-row-id');
                this.loopConfigState.normalAreas = this.loopConfigState.normalAreas.filter(a => a.id !== rowId);
                this.renderNormalAreasTable();
            });
        });
    },

    renderAdvancedAreasList() {
        const container = document.getElementById('advancedAreaList');
        const noAreasMsg = document.getElementById('noAreasAdvanced');
        if (!container) return;

        const areas = this.loopConfigState.advancedAreas;
        const rule = this.loopConfigState.loopRule;
        const availableAreas = this.getAvailableAreasForLocation();

        // Update rule help text
        const ruleHelp = document.getElementById('ruleHelp');
        if (ruleHelp) {
            ruleHelp.innerHTML = rule === 'gap_between'
                ? '<strong>Gap Based:</strong> Set minimum time gap between consecutive scans for each day.'
                : '<strong>Time Slot:</strong> Define specific time windows (start & end) when scans should occur for each day.';
        }

        if (areas.length === 0) {
            container.innerHTML = '';
            noAreasMsg?.classList.remove('hidden');
            return;
        }

        noAreasMsg?.classList.add('hidden');
        const ruleText = rule === 'gap_between' ? 'Gap Between Scan' : 'Time Based';

        container.innerHTML = areas.map(area => `
            <div class="advanced-area-card" data-area-id="${area.id}">
                <div class="advanced-area-header">
                    <div class="advanced-area-left">
                        <span>Area:</span>
                        <select class="form-select area-select-advanced" data-area-id="${area.id}">
                            ${availableAreas.map(a => `<option value="${a.id}" ${a.id === area.areaId ? 'selected' : ''}>${a.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="advanced-area-right">
                        <span class="loop-rule-badge">${ruleText}</span>
                        <button class="btn btn-sm btn-danger remove-advanced-area" data-area-id="${area.id}" type="button">Remove</button>
                    </div>
                </div>
                <div class="days-scroll">
                    <div class="days-grid">
                        ${this.DAYS.map(d => this.renderDayCard(area, d.key, d.label, rule)).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        this.bindAdvancedAreaEvents();
    },

    renderDayCard(area, dayKey, dayLabel, rule) {
        const cfg = area.dayConfig[dayKey];

        const timeBasedHTML = `
            <div class="slot-box">
                <div class="slot-header">
                    <span>Time Slots</span>
                    <span class="slot-count">${(cfg.slots?.length || 0)} slot(s)</span>
                </div>
                <div class="slots-list" data-area-id="${area.id}" data-day="${dayKey}">
                    ${(cfg.slots || []).map((slot, idx) => `
                        <div class="slot-row" data-slot-idx="${idx}">
                            <div class="slot-row-inputs">
                                <input type="time" class="slot-start" value="${slot.start || '09:00'}" title="Start Time">
                                <span class="slot-separator">to</span>
                                <input type="time" class="slot-end" value="${slot.end || '09:15'}" title="End Time">
                                <button class="delete-slot" type="button" title="Delete Slot">🗑️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-xs btn-outline add-slot-btn" data-area-id="${area.id}" data-day="${dayKey}" type="button">+ Add Slot</button>
            </div>
        `;

        const gapHTML = `
            <div class="gap-box">
                <div class="slot-header">
                    <span>Minimum Gap</span>
                </div>
                <div class="gap-config">
                    <div class="form-group-sm">
                        <label>Gap Value</label>
                        <input type="number" class="gap-value" data-area-id="${area.id}" data-day="${dayKey}" min="0" value="${cfg.gapValue || 10}">
                    </div>
                    <div class="form-group-sm">
                        <label>Unit</label>
                        <select class="gap-unit" data-area-id="${area.id}" data-day="${dayKey}">
                            <option value="hours" ${cfg.gapUnit === 'hours' ? 'selected' : ''}>Hours</option>
                            <option value="minutes" ${cfg.gapUnit !== 'hours' ? 'selected' : ''}>Minutes</option>
                        </select>
                    </div>
                </div>
                <p class="gap-hint">Example: 10 minutes blocks immediate second scan.</p>
            </div>
        `;

        return `
            <div class="day-card ${!cfg.enabled ? 'day-disabled' : ''}" data-area-id="${area.id}" data-day="${dayKey}">
                <div class="day-header">
                    <span class="day-title">${dayLabel}</span>
                    <input type="checkbox" class="day-enable-checkbox" ${cfg.enabled ? 'checked' : ''}>
                </div>
                ${rule === 'gap_between' ? gapHTML : timeBasedHTML}
            </div>
        `;
    },

    bindAdvancedAreaEvents() {
        const container = document.getElementById('advancedAreaList');
        if (!container) return;

        // Area select change
        container.querySelectorAll('.area-select-advanced').forEach(select => {
            select.addEventListener('change', (e) => {
                const areaId = e.target.getAttribute('data-area-id');
                const area = this.loopConfigState.advancedAreas.find(a => a.id === areaId);
                if (area) {
                    area.areaId = parseInt(e.target.value);
                    area.areaName = e.target.options[e.target.selectedIndex].text;
                }
            });
        });

        // Remove area
        container.querySelectorAll('.remove-advanced-area').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const areaId = e.target.getAttribute('data-area-id');
                this.loopConfigState.advancedAreas = this.loopConfigState.advancedAreas.filter(a => a.id !== areaId);
                this.renderAdvancedAreasList();
            });
        });

        // Day enable checkbox
        container.querySelectorAll('.day-enable-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const dayCard = e.target.closest('.day-card');
                const areaId = dayCard.getAttribute('data-area-id');
                const dayKey = dayCard.getAttribute('data-day');
                const area = this.loopConfigState.advancedAreas.find(a => a.id === areaId);
                if (area) {
                    area.dayConfig[dayKey].enabled = e.target.checked;
                    dayCard.classList.toggle('day-disabled', !e.target.checked);
                    // Enable/disable inputs in the day card
                    dayCard.querySelectorAll('input:not(.day-enable-checkbox), select, button:not(.day-enable-checkbox)').forEach(el => {
                        el.disabled = !e.target.checked;
                    });
                }
            });
        });

        // Add slot button
        container.querySelectorAll('.add-slot-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const areaId = e.target.getAttribute('data-area-id');
                const dayKey = e.target.getAttribute('data-day');
                const area = this.loopConfigState.advancedAreas.find(a => a.id === areaId);
                if (area) {
                    if (!area.dayConfig[dayKey].slots) area.dayConfig[dayKey].slots = [];
                    area.dayConfig[dayKey].slots.push({ start: '09:00', end: '09:15' });
                    this.renderAdvancedAreasList();
                }
            });
        });

        // Delete slot buttons
        container.querySelectorAll('.delete-slot').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const slotRow = e.target.closest('.slot-row');
                const slotsList = slotRow.closest('.slots-list');
                const areaId = slotsList.getAttribute('data-area-id');
                const dayKey = slotsList.getAttribute('data-day');
                const slotIdx = parseInt(slotRow.getAttribute('data-slot-idx'));
                const area = this.loopConfigState.advancedAreas.find(a => a.id === areaId);
                if (area && area.dayConfig[dayKey].slots) {
                    area.dayConfig[dayKey].slots.splice(slotIdx, 1);
                    this.renderAdvancedAreasList();
                }
            });
        });

        // Slot inputs (start, end)
        container.querySelectorAll('.slot-start').forEach(input => {
            input.addEventListener('change', (e) => this.updateSlotValue(e.target, 'start'));
        });
        container.querySelectorAll('.slot-end').forEach(input => {
            input.addEventListener('change', (e) => this.updateSlotValue(e.target, 'end'));
        });

        // Gap inputs
        container.querySelectorAll('.gap-value').forEach(input => {
            input.addEventListener('input', (e) => {
                const areaId = e.target.getAttribute('data-area-id');
                const dayKey = e.target.getAttribute('data-day');
                const area = this.loopConfigState.advancedAreas.find(a => a.id === areaId);
                if (area) area.dayConfig[dayKey].gapValue = parseInt(e.target.value) || 0;
            });
        });
        container.querySelectorAll('.gap-unit').forEach(select => {
            select.addEventListener('change', (e) => {
                const areaId = e.target.getAttribute('data-area-id');
                const dayKey = e.target.getAttribute('data-day');
                const area = this.loopConfigState.advancedAreas.find(a => a.id === areaId);
                if (area) area.dayConfig[dayKey].gapUnit = e.target.value;
            });
        });

        // Apply disabled state to inputs in disabled day cards
        container.querySelectorAll('.day-card.day-disabled').forEach(dayCard => {
            dayCard.querySelectorAll('input:not(.day-enable-checkbox), select, button:not(.day-enable-checkbox)').forEach(el => {
                el.disabled = true;
            });
        });
    },

    updateSlotValue(input, field) {
        const slotRow = input.closest('.slot-row');
        const slotsList = slotRow.closest('.slots-list');
        if (!slotsList) return;
        const areaId = slotsList.getAttribute('data-area-id');
        const dayKey = slotsList.getAttribute('data-day');
        const slotIdx = parseInt(slotRow.getAttribute('data-slot-idx'));
        const area = this.loopConfigState.advancedAreas.find(a => a.id === areaId);
        if (area && area.dayConfig[dayKey].slots && area.dayConfig[dayKey].slots[slotIdx]) {
            area.dayConfig[dayKey].slots[slotIdx][field] = input.value;
        }
    },

    // ========== AREA DETAIL VIEW ==========
    renderAreaDetailView() {
        const client = this.clientData;
        const area = this.selectedArea;
        const location = this.locationsData.find(l => l.id === area.locationId);
        const sidebarItems = AppData.areaDetailSidebar || [];

        return `
            <!-- Area Detail Header -->
            <div class="client-header">
                <div class="client-header-left">
                    <span class="client-header-title">My Business</span>
                    <span class="client-header-separator">|</span>
                    <span class="client-header-name">${client.business}</span>
                    <span class="client-header-separator">|</span>
                    <span class="client-header-location">My Business Location: ${location ? location.name : area.locationName}</span>
                    <span class="client-header-separator">|</span>
                    <span class="client-header-area">Area: ${area.name}</span>
                </div>
                <div class="client-header-right">
                    <button class="btn btn-outline" id="backToAllAreas">Back To All Area</button>
                </div>
            </div>

            <!-- Area Detail Tabs -->
            <div class="client-tabs">
                <div class="client-tab" data-tab="clients">
                    <span class="tab-icon">👤</span> My Business
                </div>
                <div class="client-tab" data-tab="location">
                    <span class="tab-icon">📍</span> My Business Location
                </div>
                <div class="client-tab active" data-tab="area">
                    <span class="tab-icon">🏢</span> Area
                </div>
            </div>

            <!-- Area Detail Content -->
            <div class="tab-content">
                <div class="client-content">
                    <!-- Area Detail Sidebar -->
                    <div class="client-sidebar">
                        ${sidebarItems.map(item => `
                            <div class="sidebar-item ${this.areaSidebarItem === item.id ? 'active' : ''}" data-item="${item.id}" data-sidebar-type="area">
                                <span class="sidebar-icon">${item.icon}</span>
                                ${item.label}
                                ${item.isNew ? '<span class="new-badge">New</span>' : ''}
                            </div>
                        `).join('')}
                    </div>

                    <!-- Area Detail Main Content -->
                    <div class="client-main location-detail-main">
                        ${this.renderAreaDetailContent()}
                    </div>
                </div>
            </div>
        `;
    },

    renderAreaDetailContent() {
        switch (this.areaSidebarItem) {
            case 'general':
                return this.renderAreaGeneralContent();
            case 'assign-form':
                return this.renderAreaAssignFormContent();
            case 'loop':
                return this.renderAreaLoopContent();
            default:
                return `
                    <h2 class="section-title">Area</h2>
                    <p class="text-muted">This section is coming soon...</p>
                `;
        }
    },

    renderAreaGeneralContent() {
        const area = this.selectedArea;
        const location = this.locationsData.find(l => l.id === area.locationId);

        return `
            <div class="general-section" style="padding: 20px 25px;">
                <h2 class="section-title">General</h2>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">My Business Location Name <span class="required">*</span></label>
                        <select class="form-select" id="areaLocationSelect">
                            ${this.locationsData.map(loc => `
                                <option value="${loc.id}" ${loc.id === area.locationId ? 'selected' : ''}>${loc.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Area Name <span class="required">*</span></label>
                        <input type="text" class="form-input" id="areaName" value="${area.name}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Address <span class="required">*</span></label>
                        <div class="input-with-icon">
                            <input type="text" class="form-input" id="areaAddress" value="${area.address}">
                            <span class="input-icon">📍</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Country <span class="required">*</span></label>
                        <select class="form-select" id="areaCountry">
                            <option value="Australia" ${area.country === 'Australia' ? 'selected' : ''}>Australia</option>
                            <option value="India" ${area.country === 'India' ? 'selected' : ''}>India</option>
                            <option value="USA" ${area.country === 'USA' ? 'selected' : ''}>USA</option>
                            <option value="UK" ${area.country === 'UK' ? 'selected' : ''}>UK</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">State <span class="required">*</span></label>
                        <select class="form-select" id="areaState">
                            <option value="${area.state}" selected>${area.state}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">City <span class="required">*</span></label>
                        <input type="text" class="form-input" id="areaCity" value="${area.city}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Postcode</label>
                        <input type="text" class="form-input" id="areaPostcode" value="${area.postcode || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Export Code</label>
                        <input type="text" class="form-input" id="areaExportCode" value="${area.exportCode || ''}">
                    </div>
                </div>

                <!-- Fraud Setting -->
                <fieldset class="form-fieldset">
                    <legend>Fraud Setting</legend>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Fraud Distance Type <span class="required">*</span></label>
                            <select class="form-select" id="fraudDistanceType">
                                <option value="KILOMETER" ${area.fraudDistanceType === 'KILOMETER' ? 'selected' : ''}>KILOMETER</option>
                                <option value="MILE" ${area.fraudDistanceType === 'MILE' ? 'selected' : ''}>MILE</option>
                                <option value="METER" ${area.fraudDistanceType === 'METER' ? 'selected' : ''}>METER</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Fraud Distance <span class="required">*</span></label>
                            <input type="number" class="form-input" id="fraudDistance" value="${area.fraudDistance || '10'}">
                        </div>
                    </div>
                </fieldset>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Area Level Task Group</label>
                        <select class="form-select" id="areaTaskGroup">
                            <option value="">Select...</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Training/License</label>
                        <select class="form-select" id="areaTrainingLicense">
                            <option value="">Select...</option>
                        </select>
                    </div>
                </div>

                <!-- Point Type -->
                <div class="form-group">
                    <label class="form-label">Point Type</label>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="ptQRCode" ${(area.pointTypes || []).includes('Q') ? 'checked' : ''}>
                            <span>QR Code</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="ptNFC" ${(area.pointTypes || []).includes('N') ? 'checked' : ''}>
                            <span>NFC</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="ptVirtual" ${(area.pointTypes || []).includes('V') ? 'checked' : ''}>
                            <span>Virtual</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="ptBeacon" ${(area.pointTypes || []).includes('B') ? 'checked' : ''}>
                            <span>Beacon</span>
                        </label>
                    </div>
                </div>

                <!-- Allow Area in Schedule -->
                <div class="form-group">
                    <label class="form-label">Allow Area in schedule</label>
                    <p class="form-note">Note: If this option is deactivated it will remove the selected Area from the schedule view - Area will be used as a Checkpoint.</p>
                    <label class="toggle-switch">
                        <input type="checkbox" id="allowAreaInSchedule" ${area.allowedInSchedule === 'Yes' ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <!-- Remark -->
                <div class="form-group">
                    <label class="form-label">Remark</label>
                    <textarea class="form-input form-textarea" id="areaRemark" rows="4">${area.remark || ''}</textarea>
                </div>

                <!-- Save Button -->
                <div class="form-actions">
                    <button class="btn btn-primary" id="saveAreaBtn">Save</button>
                </div>
            </div>
        `;
    },

    renderAreaAssignFormContent() {
        return `
            <div class="assign-form-section" style="padding: 20px 25px;">
                <h2 class="section-title">Assign Form</h2>
                <div class="empty-state" style="margin-top: 100px;">
                    <div class="empty-state-icon">📝</div>
                    <p>No forms assigned</p>
                </div>
            </div>
        `;
    },

    renderAreaLoopContent() {
        return `
            <div class="loop-section">
                <div class="loop-header">
                    <h2 class="section-title">Loop</h2>
                </div>
                <div class="info-message">
                    <p>Loop configuration is managed at the <strong>Location level</strong>.</p>
                    <p>Please go to the Location detail view to configure loops for this area.</p>
                </div>
            </div>
        `;
    },

    bindEvents() {
        // Tab clicks
        document.querySelectorAll('.client-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                // If in location detail view and clicking a tab, go back to main view
                if (this.selectedLocation && tabName !== 'location') {
                    this.selectedLocation = null;
                }
                // If in area detail view and clicking a tab, go back to main view
                if (this.selectedArea && tabName !== 'area') {
                    this.selectedArea = null;
                }
                this.activeTab = tabName;
                this.render();
                this.bindEvents();
            });
        });

        // Sidebar clicks (for clients tab, location detail, or area detail view)
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                const itemId = item.getAttribute('data-item');
                const sidebarType = item.getAttribute('data-sidebar-type');

                if (sidebarType === 'area' || this.selectedArea) {
                    // Area detail sidebar
                    this.areaSidebarItem = itemId;
                    if (itemId === 'loop') {
                        this.loadAreaLoopsData(this.selectedArea.id);
                    }
                } else if (this.selectedLocation) {
                    // Location detail sidebar
                    this.locationSidebarItem = itemId;
                    if (itemId === 'loop') {
                        this.loadLoopsData(this.selectedLocation.id);
                    }
                } else {
                    // Client sidebar
                    this.activeSidebarItem = itemId;
                }
                this.render();
                this.bindEvents();
            });
        });

        // Save button (clients tab)
        document.getElementById('saveBtn')?.addEventListener('click', () => {
            this.handleSave();
        });

        // Location tab events
        document.getElementById('locationBackBtn')?.addEventListener('click', () => {
            this.activeTab = 'clients';
            this.render();
            this.bindEvents();
        });

        document.getElementById('addLocationBtn')?.addEventListener('click', () => {
            alert('Add Location modal - Coming soon');
        });

        document.getElementById('locationStatusFilter')?.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.render();
            this.bindEvents();
        });

        document.getElementById('locationSearchInput')?.addEventListener('input', (e) => {
            this.handleLocationSearch(e.target.value);
        });

        // Location name click - open location detail
        document.querySelectorAll('.location-name-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const locationId = parseInt(link.getAttribute('data-location-id'));
                const location = this.locationsData.find(l => l.id === locationId);
                if (location) {
                    this.selectedLocation = location;
                    this.locationSidebarItem = 'resources';
                    this.resourceSubTab = 'files';
                    this.loadLoopsData(locationId);
                    this.render();
                    this.bindEvents();
                }
            });
        });

        // Location table actions
        document.querySelectorAll('[data-action="edit-location"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                alert(`Edit location ID: ${id}`);
            });
        });

        document.querySelectorAll('[data-action="archive-location"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to archive this location?')) {
                    const loc = this.locationsData.find(l => l.id == id);
                    if (loc) {
                        loc.status = 'inactive';
                        this.saveLocationsData();
                        this.render();
                        this.bindEvents();
                        App.showToast('Location archived successfully!', 'success');
                    }
                }
            });
        });

        // Location Detail View Events
        // Back to all locations
        document.getElementById('backToAllLocations')?.addEventListener('click', () => {
            this.selectedLocation = null;
            this.render();
            this.bindEvents();
        });

        // Resource sub-tabs
        document.querySelectorAll('.resource-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.resourceSubTab = tab.getAttribute('data-resource-tab');
                this.render();
                this.bindEvents();
            });
        });

        // Add Loop button - Open Loop Configuration Modal
        document.getElementById('addLoopBtn')?.addEventListener('click', () => {
            this.resetLoopConfigState();
            App.showModal('loopConfigModal');
            this.renderNormalAreasTable();
            this.renderAdvancedAreasList();
            this.bindLoopConfigEvents();
        });

        // Cancel Loop Config button
        document.getElementById('cancelLoopConfigBtn')?.addEventListener('click', () => {
            App.hideModal('loopConfigModal');
            this.resetLoopConfigState();
        });

        // Save Loop Config button
        document.getElementById('saveLoopConfigBtn')?.addEventListener('click', () => {
            this.handleSaveLoopConfig();
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-modal');
                App.hideModal(modalId);
                if (modalId === 'loopConfigModal') {
                    this.resetLoopConfigState();
                }
            });
        });

        // Loop actions - Copy
        document.querySelectorAll('[data-action="copy-loop"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const loop = this.loopsData.find(l => l.id == id);
                if (loop) {
                    const newLoop = JSON.parse(JSON.stringify(loop));
                    newLoop.id = Date.now();
                    newLoop.name = `${loop.name} (Copy)`;
                    newLoop.createdAt = new Date().toISOString();
                    this.loopsData.push(newLoop);
                    this.saveLoopsData(this.selectedLocation.id);
                    this.render();
                    this.bindEvents();
                    App.showToast('Loop copied successfully!', 'success');
                }
            });
        });

        // Loop actions - Edit
        document.querySelectorAll('[data-action="edit-loop"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const loop = this.loopsData.find(l => l.id == id);
                if (loop) {
                    this.resetLoopConfigState();
                    this.initLoopConfigForEdit(loop);
                    App.showModal('loopConfigModal');

                    // Populate form fields
                    document.getElementById('loopName').value = loop.name || '';
                    document.getElementById('loopMultiple').value = loop.loopMultiple || 1;
                    document.getElementById('rewardPoint').value = loop.rewardPoint || 10;
                    document.getElementById('loopBuffer').value = loop.loopBuffer || 5;

                    if (loop.mode === 'advanced') {
                        document.getElementById('modeAdvanced').checked = true;
                        document.getElementById('loopRuleWrap').classList.remove('hidden');
                        document.getElementById('normalFields').classList.add('hidden');
                        document.getElementById('advancedFields').classList.remove('hidden');
                        document.getElementById('loopRule').value = loop.loopRule || 'time_based';
                    } else {
                        document.getElementById('modeNormal').checked = true;
                    }

                    this.renderNormalAreasTable();
                    this.renderAdvancedAreasList();
                    this.bindLoopConfigEvents();
                }
            });
        });

        // Loop actions - Delete
        document.querySelectorAll('[data-action="delete-loop"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this loop?')) {
                    this.loopsData = this.loopsData.filter(l => l.id != id);
                    this.saveLoopsData(this.selectedLocation.id);
                    this.render();
                    this.bindEvents();
                    App.showToast('Loop deleted successfully!', 'success');
                }
            });
        });

        // ========== AREA TAB EVENTS ==========
        // Area Back button
        document.getElementById('areaBackBtn')?.addEventListener('click', () => {
            this.activeTab = 'clients';
            this.render();
            this.bindEvents();
        });

        // Add Area button
        document.getElementById('addAreaBtn')?.addEventListener('click', () => {
            alert('Add Area modal - Coming soon');
        });

        // Area status filter
        document.getElementById('areaStatusFilter')?.addEventListener('change', (e) => {
            this.areaFilter = e.target.value;
            this.render();
            this.bindEvents();
        });

        // Area search
        document.getElementById('areaSearchInput')?.addEventListener('input', (e) => {
            this.handleAreaSearch(e.target.value);
        });

        // Area name click - open area detail
        document.querySelectorAll('.area-name-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const areaId = parseInt(link.getAttribute('data-area-id'));
                const area = this.areasData.find(a => a.id === areaId);
                if (area) {
                    this.selectedArea = area;
                    this.areaSidebarItem = 'general';
                    this.loadAreaLoopsData(areaId);
                    this.render();
                    this.bindEvents();
                }
            });
        });

        // Area table actions
        document.querySelectorAll('[data-action="edit-area"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const area = this.areasData.find(a => a.id == id);
                if (area) {
                    this.selectedArea = area;
                    this.areaSidebarItem = 'general';
                    this.loadAreaLoopsData(area.id);
                    this.render();
                    this.bindEvents();
                }
            });
        });

        document.querySelectorAll('[data-action="archive-area"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to archive this area?')) {
                    const area = this.areasData.find(a => a.id == id);
                    if (area) {
                        area.status = 'inactive';
                        this.saveAreasData();
                        this.render();
                        this.bindEvents();
                        App.showToast('Area archived successfully!', 'success');
                    }
                }
            });
        });

        // ========== AREA DETAIL VIEW EVENTS ==========
        // Back to all areas
        document.getElementById('backToAllAreas')?.addEventListener('click', () => {
            this.selectedArea = null;
            this.render();
            this.bindEvents();
        });

        // Save Area button (General form)
        document.getElementById('saveAreaBtn')?.addEventListener('click', () => {
            this.handleSaveArea();
        });

    },

    bindLoopConfigEvents() {
        // Mode toggle (Interval Based / Schedule Based)
        document.getElementById('modeNormal')?.addEventListener('change', () => {
            this.loopConfigState.mode = 'normal';
            document.getElementById('loopRuleWrap').classList.add('hidden');
            document.getElementById('normalFields').classList.remove('hidden');
            document.getElementById('advancedFields').classList.add('hidden');
            document.getElementById('modeHint').textContent = 'Scans are expected at cumulative intervals after loop starts';
        });

        document.getElementById('modeAdvanced')?.addEventListener('change', () => {
            this.loopConfigState.mode = 'advanced';
            document.getElementById('loopRuleWrap').classList.remove('hidden');
            document.getElementById('normalFields').classList.add('hidden');
            document.getElementById('advancedFields').classList.remove('hidden');
            document.getElementById('modeHint').textContent = 'Define specific time slots or minimum gaps for each day of the week';
            this.renderAdvancedAreasList();
        });

        // Loop Rule change
        document.getElementById('loopRule')?.addEventListener('change', (e) => {
            this.loopConfigState.loopRule = e.target.value;
            this.renderAdvancedAreasList();
        });

        // Info icon tooltip toggle
        const infoBtn = document.getElementById('intervalInfoBtn');
        const infoTooltip = document.getElementById('intervalInfoTooltip');
        const infoClose = document.getElementById('intervalInfoClose');

        infoBtn?.addEventListener('click', (e) => {
            e.stopPropagation();

            if (infoTooltip?.classList.contains('show')) {
                infoTooltip.classList.remove('show');
            } else {
                // Position tooltip above the button
                const btnRect = infoBtn.getBoundingClientRect();
                const tooltipHeight = 200; // approximate height

                infoTooltip.style.left = btnRect.left + 'px';
                infoTooltip.style.top = (btnRect.top - tooltipHeight - 10) + 'px';

                // If tooltip goes above viewport, show it below instead
                if (btnRect.top - tooltipHeight - 10 < 10) {
                    infoTooltip.style.top = (btnRect.bottom + 10) + 'px';
                }

                infoTooltip?.classList.add('show');
            }
        });

        infoClose?.addEventListener('click', (e) => {
            e.stopPropagation();
            infoTooltip?.classList.remove('show');
        });

        // Close tooltip when clicking outside
        document.addEventListener('click', (e) => {
            if (infoTooltip?.classList.contains('show') && !infoTooltip.contains(e.target) && e.target !== infoBtn) {
                infoTooltip.classList.remove('show');
            }
        });

        // Add Area for Normal mode - directly add first area
        document.getElementById('addAreaNormalBtn')?.addEventListener('click', () => {
            const availableAreas = this.getAvailableAreasForLocation();
            if (availableAreas.length === 0) {
                App.showToast('No areas available for this location', 'warning');
                return;
            }
            // Get the first area from the list
            const firstArea = availableAreas[0];
            this.loopConfigState.normalAreas.push({
                id: this.uid(),
                areaId: firstArea.id,
                areaName: firstArea.name,
                interval: 1
            });
            this.renderNormalAreasTable();
        });

        // Add Area for Advanced mode - directly add first area
        document.getElementById('addAreaAdvancedBtn')?.addEventListener('click', () => {
            const availableAreas = this.getAvailableAreasForLocation();
            if (availableAreas.length === 0) {
                App.showToast('No areas available for this location', 'warning');
                return;
            }
            // Get the first area from the list
            const firstArea = availableAreas[0];
            this.loopConfigState.advancedAreas.push(
                this.createAdvancedAreaConfig(firstArea.id, firstArea.name)
            );
            this.renderAdvancedAreasList();
        });
    },

    handleSaveLoopConfig() {
        const loopName = document.getElementById('loopName')?.value.trim();

        if (!loopName) {
            App.showToast('Please enter a loop name', 'error');
            return;
        }

        const mode = this.loopConfigState.mode;

        if (mode === 'normal' && this.loopConfigState.normalAreas.length === 0) {
            App.showToast('Please add at least one area', 'error');
            return;
        }

        if (mode === 'advanced' && this.loopConfigState.advancedAreas.length === 0) {
            App.showToast('Please add at least one area', 'error');
            return;
        }

        const loopData = {
            id: this.loopConfigState.isEdit ? this.loopConfigState.editingLoopId : Date.now(),
            name: loopName,
            mode: mode,
            loopMultiple: parseInt(document.getElementById('loopMultiple')?.value) || 1,
            rewardPoint: parseInt(document.getElementById('rewardPoint')?.value) || 10,
            loopBuffer: parseInt(document.getElementById('loopBuffer')?.value) || 5,
            status: 'active',
            createdAt: this.loopConfigState.isEdit ?
                (this.loopsData.find(l => l.id === this.loopConfigState.editingLoopId)?.createdAt || new Date().toISOString()) :
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (mode === 'normal') {
            loopData.normalAreas = this.loopConfigState.normalAreas;
        } else {
            loopData.loopRule = this.loopConfigState.loopRule;
            loopData.advancedAreas = this.loopConfigState.advancedAreas;
        }

        if (this.loopConfigState.isEdit) {
            // Update existing loop
            const index = this.loopsData.findIndex(l => l.id === this.loopConfigState.editingLoopId);
            if (index !== -1) {
                this.loopsData[index] = loopData;
            }
        } else {
            // Add new loop
            this.loopsData.push(loopData);
        }

        this.saveLoopsData(this.selectedLocation.id);
        App.hideModal('loopConfigModal');
        this.resetLoopConfigState();
        this.render();
        this.bindEvents();
        App.showToast(this.loopConfigState.isEdit ? 'Loop updated successfully!' : 'Loop created successfully!', 'success');
    },

    handleLocationSearch(query) {
        const rows = document.querySelectorAll('.table tbody tr');
        const lowerQuery = query.toLowerCase();
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(lowerQuery) ? '' : 'none';
        });
    },

    handleSave() {
        const clientName = document.getElementById('clientName').value.trim();
        const contactEmail = document.getElementById('contactEmail').value.trim();
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const mobileNumber = document.getElementById('mobileNumber').value.trim();
        const note = document.getElementById('note').value.trim();
        const exportCode = document.getElementById('exportCode').value.trim();

        if (!clientName) {
            alert('Please enter client name');
            return;
        }

        this.clientData.business = clientName;
        this.clientData.contactEmail = contactEmail;
        this.clientData.contactName = `${firstName} ${lastName}`.trim();
        this.clientData.mobileNumber = mobileNumber;
        this.clientData.note = note;
        this.clientData.exportCode = exportCode;

        this.saveClientData();
        App.showToast('Client saved successfully!', 'success');
    },

    handleAreaSearch(query) {
        const rows = document.querySelectorAll('.table tbody tr');
        const lowerQuery = query.toLowerCase();
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(lowerQuery) ? '' : 'none';
        });
    },

    handleSaveArea() {
        const areaName = document.getElementById('areaName').value.trim();
        const areaAddress = document.getElementById('areaAddress').value.trim();

        if (!areaName) {
            alert('Please enter area name');
            return;
        }

        // Update area data
        this.selectedArea.name = areaName;
        this.selectedArea.address = areaAddress;
        this.selectedArea.locationId = parseInt(document.getElementById('areaLocationSelect').value);
        this.selectedArea.country = document.getElementById('areaCountry').value;
        this.selectedArea.state = document.getElementById('areaState').value;
        this.selectedArea.city = document.getElementById('areaCity').value;
        this.selectedArea.postcode = document.getElementById('areaPostcode').value;
        this.selectedArea.exportCode = document.getElementById('areaExportCode')?.value || '';
        this.selectedArea.fraudDistanceType = document.getElementById('fraudDistanceType').value;
        this.selectedArea.fraudDistance = document.getElementById('fraudDistance').value;
        this.selectedArea.remark = document.getElementById('areaRemark').value;
        this.selectedArea.allowedInSchedule = document.getElementById('allowAreaInSchedule').checked ? 'Yes' : 'No';

        // Update point types
        const pointTypes = [];
        if (document.getElementById('ptQRCode').checked) pointTypes.push('Q');
        if (document.getElementById('ptNFC').checked) pointTypes.push('N');
        if (document.getElementById('ptVirtual').checked) pointTypes.push('V');
        if (document.getElementById('ptBeacon').checked) pointTypes.push('B');
        this.selectedArea.pointTypes = pointTypes;

        // Update location name
        const selectedLocation = this.locationsData.find(l => l.id === this.selectedArea.locationId);
        if (selectedLocation) {
            this.selectedArea.locationName = selectedLocation.name;
        }

        // Save to areasData array
        const index = this.areasData.findIndex(a => a.id === this.selectedArea.id);
        if (index !== -1) {
            this.areasData[index] = this.selectedArea;
        }

        this.saveAreasData();
        App.showToast('Area saved successfully!', 'success');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => ClientDetailPage.init(), 50);
});
