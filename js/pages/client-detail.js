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
        const availableScans = this.getAvailableScans();

        return `
            <div class="loop-section">
                <div class="loop-header">
                    <h2 class="section-title">Loop</h2>
                    <button class="btn btn-primary" id="addLoopBtn">Add New</button>
                </div>

                <div class="loop-list">
                    ${loops.length > 0 ? loops.map(loop => `
                        <div class="loop-item" data-loop-id="${loop.id}">
                            <span class="loop-name">${loop.name}</span>
                            <div class="loop-actions">
                                <button class="btn-icon-action" data-action="copy-loop" data-id="${loop.id}" title="Copy">📋</button>
                                <button class="btn-icon-action" data-action="view-loop" data-id="${loop.id}" title="View">👁️</button>
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

            <!-- Add Loop Modal -->
            <div class="modal-overlay" id="addLoopModal">
                <div class="modal modal-lg">
                    <div class="modal-header">
                        <h3>Assign Master Scan Loop</h3>
                        <span class="modal-close" data-modal="addLoopModal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Select Master Scan Loop(s) <span class="required">*</span></label>
                            <p class="form-note">Select one or more Master Scans to assign to this location</p>
                            ${availableScans.length > 0 ? `
                                <div class="scan-checkbox-list">
                                    ${availableScans.map(scan => `
                                        <label class="scan-checkbox-item">
                                            <input type="checkbox" class="scan-checkbox" value="${scan.id}" data-name="${scan.name}" data-frequency="${scan.frequency}">
                                            <span class="scan-checkbox-info">
                                                <span class="scan-checkbox-name">${scan.name}</span>
                                                <span class="scan-checkbox-freq">${scan.frequency}</span>
                                            </span>
                                        </label>
                                    `).join('')}
                                </div>
                            ` : `
                                <div class="alert-info">
                                    <p>No available Master Scans to assign. All scans are already assigned to this location or no active scans exist.</p>
                                    <p style="margin-top: 10px;"><a href="scan-master.html" class="link-primary">Go to Scan Master</a> to create new scans.</p>
                                </div>
                            `}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="cancelLoopBtn">Cancel</button>
                        <button class="btn btn-primary" id="saveLoopBtn" ${availableScans.length === 0 ? 'disabled' : ''}>Assign Selected</button>
                    </div>
                </div>
            </div>
        `;
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
        const loops = this.areaLoopsData || [];
        const availableScans = this.getAvailableScansForArea();

        return `
            <div class="loop-section">
                <div class="loop-header">
                    <h2 class="section-title">Loop</h2>
                    <button class="btn btn-primary" id="addAreaLoopBtn">Add New</button>
                </div>

                <div class="loop-list">
                    ${loops.length > 0 ? loops.map(loop => `
                        <div class="loop-item" data-loop-id="${loop.id}">
                            <span class="loop-name">${loop.name}</span>
                            <div class="loop-actions">
                                <button class="btn-icon-action" data-action="copy-area-loop" data-id="${loop.id}" title="Copy">📋</button>
                                <button class="btn-icon-action" data-action="view-area-loop" data-id="${loop.id}" title="View">👁️</button>
                                <button class="btn-icon-action" data-action="delete-area-loop" data-id="${loop.id}" title="Delete">🗑️</button>
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

            <!-- Add Area Loop Modal -->
            <div class="modal-overlay" id="addAreaLoopModal">
                <div class="modal modal-lg">
                    <div class="modal-header">
                        <h3>Assign Master Scan Loop</h3>
                        <span class="modal-close" data-modal="addAreaLoopModal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Select Master Scan Loop(s) <span class="required">*</span></label>
                            <p class="form-note">Select one or more Master Scans to assign to this area</p>
                            ${availableScans.length > 0 ? `
                                <div class="scan-checkbox-list">
                                    ${availableScans.map(scan => `
                                        <label class="scan-checkbox-item">
                                            <input type="checkbox" class="area-scan-checkbox" value="${scan.id}" data-name="${scan.name}" data-frequency="${scan.frequency}">
                                            <span class="scan-checkbox-info">
                                                <span class="scan-checkbox-name">${scan.name}</span>
                                                <span class="scan-checkbox-freq">${scan.frequency}</span>
                                            </span>
                                        </label>
                                    `).join('')}
                                </div>
                            ` : `
                                <div class="alert-info">
                                    <p>No available Master Scans to assign. All scans are already assigned to this area or no active scans exist.</p>
                                    <p style="margin-top: 10px;"><a href="scan-master.html" class="link-primary">Go to Scan Master</a> to create new scans.</p>
                                </div>
                            `}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="cancelAreaLoopBtn">Cancel</button>
                        <button class="btn btn-primary" id="saveAreaLoopBtn" ${availableScans.length === 0 ? 'disabled' : ''}>Assign Selected</button>
                    </div>
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

        // Add Loop button
        document.getElementById('addLoopBtn')?.addEventListener('click', () => {
            App.showModal('addLoopModal');
        });

        // Cancel Loop button
        document.getElementById('cancelLoopBtn')?.addEventListener('click', () => {
            App.hideModal('addLoopModal');
        });

        // Save Loop button
        document.getElementById('saveLoopBtn')?.addEventListener('click', () => {
            this.handleSaveLoop();
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-modal');
                App.hideModal(modalId);
            });
        });

        // Loop actions
        document.querySelectorAll('[data-action="copy-loop"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const loop = this.loopsData.find(l => l.id == id);
                if (loop) {
                    const newLoop = {
                        id: Date.now(),
                        scanMasterId: loop.scanMasterId,
                        name: `${loop.name} (Copy)`,
                        frequency: loop.frequency,
                        status: 'active',
                        assignedAt: new Date().toISOString()
                    };
                    this.loopsData.push(newLoop);
                    this.saveLoopsData(this.selectedLocation.id);
                    this.render();
                    this.bindEvents();
                    App.showToast('Loop copied successfully!', 'success');
                }
            });
        });

        document.querySelectorAll('[data-action="view-loop"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const loop = this.loopsData.find(l => l.id == id);
                if (loop) {
                    alert(`Viewing loop: ${loop.name}`);
                }
            });
        });

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

        // Add Area Loop button
        document.getElementById('addAreaLoopBtn')?.addEventListener('click', () => {
            App.showModal('addAreaLoopModal');
        });

        // Cancel Area Loop button
        document.getElementById('cancelAreaLoopBtn')?.addEventListener('click', () => {
            App.hideModal('addAreaLoopModal');
        });

        // Save Area Loop button
        document.getElementById('saveAreaLoopBtn')?.addEventListener('click', () => {
            this.handleSaveAreaLoop();
        });

        // Area Loop actions
        document.querySelectorAll('[data-action="copy-area-loop"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const loop = this.areaLoopsData.find(l => l.id == id);
                if (loop) {
                    const newLoop = {
                        id: Date.now(),
                        scanMasterId: loop.scanMasterId,
                        name: `${loop.name} (Copy)`,
                        frequency: loop.frequency,
                        status: 'active',
                        assignedAt: new Date().toISOString()
                    };
                    this.areaLoopsData.push(newLoop);
                    this.saveAreaLoopsData(this.selectedArea.id);
                    this.render();
                    this.bindEvents();
                    App.showToast('Loop copied successfully!', 'success');
                }
            });
        });

        document.querySelectorAll('[data-action="view-area-loop"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const loop = this.areaLoopsData.find(l => l.id == id);
                if (loop) {
                    alert(`Viewing loop: ${loop.name}`);
                }
            });
        });

        document.querySelectorAll('[data-action="delete-area-loop"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this loop?')) {
                    this.areaLoopsData = this.areaLoopsData.filter(l => l.id != id);
                    this.saveAreaLoopsData(this.selectedArea.id);
                    this.render();
                    this.bindEvents();
                    App.showToast('Loop deleted successfully!', 'success');
                }
            });
        });
    },

    handleSaveLoop() {
        const checkboxes = document.querySelectorAll('.scan-checkbox:checked');

        if (checkboxes.length === 0) {
            alert('Please select at least one Master Scan');
            return;
        }

        // Add each selected scan as a loop
        let addedCount = 0;
        checkboxes.forEach(checkbox => {
            const scanId = parseInt(checkbox.value);
            const scanName = checkbox.getAttribute('data-name');
            const scanFrequency = checkbox.getAttribute('data-frequency');

            const newLoop = {
                id: Date.now() + addedCount, // Ensure unique IDs
                scanMasterId: scanId,
                name: scanName,
                frequency: scanFrequency,
                status: 'active',
                assignedAt: new Date().toISOString()
            };

            this.loopsData.push(newLoop);
            addedCount++;
        });

        this.saveLoopsData(this.selectedLocation.id);

        App.hideModal('addLoopModal');

        this.render();
        this.bindEvents();
        App.showToast(`${addedCount} Master Scan(s) assigned successfully!`, 'success');
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
    },

    handleSaveAreaLoop() {
        const checkboxes = document.querySelectorAll('.area-scan-checkbox:checked');

        if (checkboxes.length === 0) {
            alert('Please select at least one Master Scan');
            return;
        }

        // Add each selected scan as a loop
        let addedCount = 0;
        checkboxes.forEach(checkbox => {
            const scanId = parseInt(checkbox.value);
            const scanName = checkbox.getAttribute('data-name');
            const scanFrequency = checkbox.getAttribute('data-frequency');

            const newLoop = {
                id: Date.now() + addedCount, // Ensure unique IDs
                scanMasterId: scanId,
                name: scanName,
                frequency: scanFrequency,
                status: 'active',
                assignedAt: new Date().toISOString()
            };

            this.areaLoopsData.push(newLoop);
            addedCount++;
        });

        this.saveAreaLoopsData(this.selectedArea.id);

        App.hideModal('addAreaLoopModal');

        this.render();
        this.bindEvents();
        App.showToast(`${addedCount} Master Scan(s) assigned successfully!`, 'success');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => ClientDetailPage.init(), 50);
});
