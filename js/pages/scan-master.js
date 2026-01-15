/**
 * Scan Master Page Controller
 */

const ScanMasterPage = {
    data: null,
    container: null,
    currentFilter: 'active',
    currentPage: 1,
    scanMode: 'day',
    selectedScanType: null,
    dayConfigurations: {}, // Store time slots for each day
    currentConfigDay: null, // Currently configuring day
    currentViewScan: null, // Currently viewing scan
    editingScanId: null, // Currently editing scan ID

    init() {
        this.container = document.getElementById('pageContent');
        if (!this.container) return;

        // Load data from localStorage or use default
        this.loadData();
        this.render();
        this.bindEvents();
    },

    loadData() {
        const saved = localStorage.getItem('scanMasterData');
        if (saved) {
            this.data = JSON.parse(saved);
        } else {
            this.data = JSON.parse(JSON.stringify(AppData.scanMaster));
        }
    },

    saveData() {
        localStorage.setItem('scanMasterData', JSON.stringify(this.data));
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
                    <button class="btn btn-primary" id="addScanBtn">Add New Scan</button>
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
                                <td>${row.name}</td>
                                <td>${row.frequency}</td>
                                <td class="actions-cell">
                                    <button class="btn-icon-action" data-action="view" data-id="${row.id}" title="View">👁️</button>
                                    <button class="btn-icon-action" data-action="edit" data-id="${row.id}" title="Edit">✏️</button>
                                    <button class="btn-icon-action" data-action="archive" data-id="${row.id}" title="Archive">📥</button>
                                </td>
                            </tr>
                        `).join('') : `
                            <tr><td colspan="3" class="no-data">No data available</td></tr>
                        `}
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="pagination-row">
                <div class="pagination-info">
                    Showing ${filteredData.length > 0 ? 1 : 0} - ${filteredData.length} of ${totalCount}
                </div>
                <div class="pagination-controls">
                    <button class="btn btn-pagination" id="prevPage" disabled>❮</button>
                    <span class="page-number active">1</span>
                    <button class="btn btn-pagination" id="nextPage" disabled>❯</button>
                </div>
            </div>

            <!-- Add Modal -->
            ${this.renderAddModal()}

            <!-- View Modal -->
            ${this.renderViewModal()}
        `;
    },

    renderAddModal() {
        return `
            <div class="modal-overlay" id="addScanModal">
                <div class="modal modal-lg">
                    <div class="modal-header">
                        <h3>Add New Scan</h3>
                        <span class="modal-close" data-modal="addScanModal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <!-- Scan Name -->
                        <div class="form-group">
                            <label class="form-label">Scan Name</label>
                            <input type="text" class="form-input" id="scanName" placeholder="Enter scan name">
                        </div>

                        <!-- Day/Week Radio Buttons -->
                        <div class="form-group">
                            <label class="form-label">Frequency Type</label>
                            <div class="radio-group">
                                <label class="radio-label">
                                    <input type="radio" name="scanMode" value="day" id="modeDayRadio" checked>
                                    <span class="radio-custom"></span>
                                    Day
                                </label>
                                <label class="radio-label">
                                    <input type="radio" name="scanMode" value="week" id="modeWeekRadio">
                                    <span class="radio-custom"></span>
                                    Week
                                </label>
                            </div>
                        </div>

                        <!-- Day Mode Content -->
                        <div id="dayModeContent" class="mode-content">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Select Date</label>
                                    <input type="date" class="form-input" id="scanDate">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Iteration <span class="form-hint">(Max 5)</span></label>
                                    <input type="number" class="form-input" id="iterationCount" placeholder="Enter number (1-5)" min="1" max="5">
                                </div>
                            </div>

                            <!-- Dynamic Time Slots Container -->
                            <div id="timeSlotsContainer" class="time-slots-container"></div>
                        </div>

                        <!-- Week Mode Content -->
                        <div id="weekModeContent" class="mode-content" style="display: none;">
                            <!-- Repeat Switch -->
                            <div class="form-group">
                                <div class="switch-row">
                                    <span class="switch-label">Repeat</span>
                                    <label class="switch">
                                        <input type="checkbox" id="repeatSwitch">
                                        <span class="switch-slider"></span>
                                    </label>
                                </div>
                            </div>

                            <!-- Days Selection -->
                            <div class="form-group">
                                <label class="form-label">Select Days <span class="form-hint">(Click on a day to configure time slots)</span></label>
                                <div class="days-grid-new">
                                    <div class="day-card" data-day="monday">
                                        <div class="day-card-name">Monday</div>
                                        <div class="day-card-count" id="mondayCount"></div>
                                    </div>
                                    <div class="day-card" data-day="tuesday">
                                        <div class="day-card-name">Tuesday</div>
                                        <div class="day-card-count" id="tuesdayCount"></div>
                                    </div>
                                    <div class="day-card" data-day="wednesday">
                                        <div class="day-card-name">Wednesday</div>
                                        <div class="day-card-count" id="wednesdayCount"></div>
                                    </div>
                                    <div class="day-card" data-day="thursday">
                                        <div class="day-card-name">Thursday</div>
                                        <div class="day-card-count" id="thursdayCount"></div>
                                    </div>
                                    <div class="day-card" data-day="friday">
                                        <div class="day-card-name">Friday</div>
                                        <div class="day-card-count" id="fridayCount"></div>
                                    </div>
                                    <div class="day-card" data-day="saturday">
                                        <div class="day-card-name">Saturday</div>
                                        <div class="day-card-count" id="saturdayCount"></div>
                                    </div>
                                    <div class="day-card" data-day="sunday">
                                        <div class="day-card-name">Sunday</div>
                                        <div class="day-card-count" id="sundayCount"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="cancelAdd">Cancel</button>
                        <button class="btn btn-primary" id="saveAdd">Save</button>
                    </div>

                    <!-- Day Configuration Modal (nested) -->
                    <div class="day-config-modal" id="dayConfigModal">
                        <div class="day-config-content">
                            <div class="day-config-header">
                                <h4>Configure <span id="dayConfigTitle">Monday</span></h4>
                                <span class="day-config-close" id="closeDayConfig">&times;</span>
                            </div>
                            <div class="day-config-body">
                                <div class="form-group">
                                    <label class="form-label">Iteration <span class="form-hint">(Max 5)</span></label>
                                    <input type="number" class="form-input" id="dayIterationCount" placeholder="Enter number (1-5)" min="1" max="5">
                                </div>
                                <div id="dayTimeSlotsContainer" class="time-slots-container"></div>
                            </div>
                            <div class="day-config-footer">
                                <button class="btn btn-outline" id="cancelDayConfig">Cancel</button>
                                <button class="btn btn-primary" id="saveDayConfig">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderViewModal() {
        return `
            <div class="modal-overlay" id="viewScanModal">
                <div class="modal modal-lg">
                    <div class="modal-header">
                        <h3>View Scan Configuration</h3>
                        <span class="modal-close" data-modal="viewScanModal">&times;</span>
                    </div>
                    <div class="modal-body" id="viewScanContent">
                        <!-- Content will be dynamically populated -->
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" id="closeViewModal">Close</button>
                        <button class="btn btn-primary" id="editFromView">Edit</button>
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
        document.getElementById('addScanBtn')?.addEventListener('click', () => {
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
            App.hideModal('addScanModal');
        });

        // Save button
        document.getElementById('saveAdd')?.addEventListener('click', () => {
            this.handleSave();
        });

        // View modal - Close button
        document.getElementById('closeViewModal')?.addEventListener('click', () => {
            App.hideModal('viewScanModal');
        });

        // View modal - Edit button
        document.getElementById('editFromView')?.addEventListener('click', () => {
            App.hideModal('viewScanModal');
            if (this.currentViewScan) {
                this.openEditModal(this.currentViewScan.id);
            }
        });

        // Table actions
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                const id = e.currentTarget.getAttribute('data-id');
                this.handleTableAction(action, id);
            });
        });

        // Bind modal events
        this.bindModalEvents();
    },

    openAddModal() {
        // Reset state
        this.scanMode = 'day';
        this.selectedScanType = null;
        this.editingScanId = null; // Reset editing state

        // Reset form
        document.getElementById('scanName').value = '';
        document.getElementById('scanDate').value = '';
        document.getElementById('iterationCount').value = '';
        document.getElementById('timeSlotsContainer').innerHTML = '';
        document.getElementById('modeDayRadio').checked = true;
        document.getElementById('repeatSwitch').checked = false;

        // Reset modal title to Add mode
        document.querySelector('#addScanModal .modal-header h3').textContent = 'Add New Scan';

        // Reset day configurations
        this.dayConfigurations = {};
        this.currentConfigDay = null;

        // Reset day cards
        document.querySelectorAll('.day-card').forEach(card => {
            card.classList.remove('configured');
            const day = card.getAttribute('data-day');
            const countEl = document.getElementById(`${day}Count`);
            if (countEl) countEl.textContent = '';
        });

        // Hide day config modal
        document.getElementById('dayConfigModal').style.display = 'none';

        // Show day content, hide week content
        document.getElementById('dayModeContent').style.display = 'block';
        document.getElementById('weekModeContent').style.display = 'none';

        App.showModal('addScanModal');
    },

    bindModalEvents() {
        // Radio buttons for Day/Week
        const dayRadio = document.getElementById('modeDayRadio');
        const weekRadio = document.getElementById('modeWeekRadio');

        dayRadio?.addEventListener('change', () => {
            this.scanMode = 'day';
            document.getElementById('dayModeContent').style.display = 'block';
            document.getElementById('weekModeContent').style.display = 'none';
        });

        weekRadio?.addEventListener('change', () => {
            this.scanMode = 'week';
            document.getElementById('dayModeContent').style.display = 'none';
            document.getElementById('weekModeContent').style.display = 'block';
        });

        // Iteration count input - generate time slots dynamically
        const iterationInput = document.getElementById('iterationCount');
        iterationInput?.addEventListener('input', (e) => {
            this.handleIterationChange(e.target.value);
        });

        // Day cards click - open day config modal
        document.querySelectorAll('.day-card').forEach(card => {
            card.addEventListener('click', () => {
                const day = card.getAttribute('data-day');
                this.openDayConfigModal(day);
            });
        });

        // Day iteration input - generate time slots for day config
        const dayIterationInput = document.getElementById('dayIterationCount');
        dayIterationInput?.addEventListener('input', (e) => {
            this.handleDayIterationChange(e.target.value);
        });

        // Day config modal - close button
        document.getElementById('closeDayConfig')?.addEventListener('click', () => {
            this.closeDayConfigModal();
        });

        // Day config modal - cancel button
        document.getElementById('cancelDayConfig')?.addEventListener('click', () => {
            this.closeDayConfigModal();
        });

        // Day config modal - save button
        document.getElementById('saveDayConfig')?.addEventListener('click', () => {
            this.saveDayConfig();
        });
    },

    openDayConfigModal(day) {
        this.currentConfigDay = day;

        // Set title
        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        document.getElementById('dayConfigTitle').textContent = dayName;

        // Check if day already has configuration
        const existingConfig = this.dayConfigurations[day];
        if (existingConfig) {
            // Restore existing configuration
            document.getElementById('dayIterationCount').value = existingConfig.iterations;
            this.handleDayIterationChange(existingConfig.iterations);

            // Fill in saved times after a small delay (to ensure DOM is ready)
            setTimeout(() => {
                existingConfig.timeSlots.forEach((slot, index) => {
                    const fromInput = document.getElementById(`dayTimeFrom${index + 1}`);
                    const toInput = document.getElementById(`dayTimeTo${index + 1}`);
                    if (fromInput) fromInput.value = slot.fromTime;
                    if (toInput) toInput.value = slot.toTime;
                });
            }, 10);
        } else {
            // Reset form
            document.getElementById('dayIterationCount').value = '';
            document.getElementById('dayTimeSlotsContainer').innerHTML = '';
        }

        // Show modal
        document.getElementById('dayConfigModal').style.display = 'flex';
    },

    closeDayConfigModal() {
        document.getElementById('dayConfigModal').style.display = 'none';
        this.currentConfigDay = null;
    },

    handleDayIterationChange(value) {
        const container = document.getElementById('dayTimeSlotsContainer');
        let count = parseInt(value) || 0;

        // Limit to max 5
        if (count > 5) {
            count = 5;
            document.getElementById('dayIterationCount').value = 5;
        }

        // Clear existing slots
        container.innerHTML = '';

        // Generate time slots
        if (count > 0) {
            let slotsHTML = '<div class="time-slots-grid">';
            for (let i = 1; i <= count; i++) {
                slotsHTML += `
                    <div class="time-slot-item">
                        <div class="time-slot-header">
                            <span class="time-slot-number">${i}</span>
                            <span class="time-slot-title">Time Slot ${i}</span>
                        </div>
                        <div class="time-slot-fields">
                            <div class="form-group">
                                <label class="form-label">From Time</label>
                                <input type="time" class="form-input time-from" id="dayTimeFrom${i}" data-slot="${i}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">To Time</label>
                                <input type="time" class="form-input time-to" id="dayTimeTo${i}" data-slot="${i}">
                            </div>
                        </div>
                    </div>
                `;
            }
            slotsHTML += '</div>';
            container.innerHTML = slotsHTML;
        }
    },

    saveDayConfig() {
        const day = this.currentConfigDay;
        if (!day) return;

        const iterationCount = parseInt(document.getElementById('dayIterationCount').value) || 0;

        if (iterationCount === 0) {
            // Remove configuration for this day
            delete this.dayConfigurations[day];
            this.updateDayCardUI(day);
            this.closeDayConfigModal();
            return;
        }

        // Collect time slots
        const timeSlots = [];
        for (let i = 1; i <= iterationCount; i++) {
            const fromTime = document.getElementById(`dayTimeFrom${i}`)?.value || '';
            const toTime = document.getElementById(`dayTimeTo${i}`)?.value || '';

            if (!fromTime || !toTime) {
                alert(`Please fill in both From Time and To Time for Time Slot ${i}`);
                return;
            }

            timeSlots.push({
                slot: i,
                fromTime: fromTime,
                toTime: toTime
            });
        }

        // Save configuration
        this.dayConfigurations[day] = {
            iterations: iterationCount,
            timeSlots: timeSlots
        };

        // Update UI
        this.updateDayCardUI(day);
        this.closeDayConfigModal();
    },

    updateDayCardUI(day) {
        const card = document.querySelector(`.day-card[data-day="${day}"]`);
        const countEl = document.getElementById(`${day}Count`);

        if (this.dayConfigurations[day]) {
            card?.classList.add('configured');
            if (countEl) {
                countEl.textContent = this.dayConfigurations[day].iterations;
            }
        } else {
            card?.classList.remove('configured');
            if (countEl) {
                countEl.textContent = '';
            }
        }
    },

    handleIterationChange(value) {
        const container = document.getElementById('timeSlotsContainer');
        let count = parseInt(value) || 0;

        // Limit to max 5
        if (count > 5) {
            count = 5;
            document.getElementById('iterationCount').value = 5;
        }

        // Clear existing slots
        container.innerHTML = '';

        // Generate time slots
        if (count > 0) {
            let slotsHTML = '<div class="time-slots-grid">';
            for (let i = 1; i <= count; i++) {
                slotsHTML += `
                    <div class="time-slot-item">
                        <div class="time-slot-header">
                            <span class="time-slot-number">${i}</span>
                            <span class="time-slot-title">Time Slot ${i}</span>
                        </div>
                        <div class="time-slot-fields">
                            <div class="form-group">
                                <label class="form-label">From Time</label>
                                <input type="time" class="form-input time-from" id="timeFrom${i}" data-slot="${i}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">To Time</label>
                                <input type="time" class="form-input time-to" id="timeTo${i}" data-slot="${i}">
                            </div>
                        </div>
                    </div>
                `;
            }
            slotsHTML += '</div>';
            container.innerHTML = slotsHTML;
        }
    },

    handleScanTypeSelect(clickedBtn) {
        const allButtons = document.querySelectorAll('.btn-scan-type');

        // If clicking the same button, deselect it
        if (clickedBtn.classList.contains('active')) {
            clickedBtn.classList.remove('active');
            this.selectedScanType = null;
            allButtons.forEach(btn => btn.disabled = false);
            return;
        }

        // Select the clicked button and disable others
        allButtons.forEach(btn => {
            if (btn === clickedBtn) {
                btn.classList.add('active');
                btn.disabled = false;
            } else {
                btn.classList.remove('active');
                btn.disabled = true;
            }
        });

        this.selectedScanType = clickedBtn.getAttribute('data-type');
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
        const name = document.getElementById('scanName').value.trim();

        if (!name) {
            alert('Please enter scan name');
            return;
        }

        // Check which mode is selected by checking the radio button
        const isDayMode = document.getElementById('modeDayRadio').checked;

        // Check if we're editing or adding new
        const isEditing = this.editingScanId !== null;
        let scanData;

        if (isEditing) {
            // Find existing scan
            scanData = this.data.table.data.find(i => i.id == this.editingScanId);
            if (!scanData) {
                alert('Error: Scan not found');
                return;
            }
            // Update name
            scanData.name = name;
        } else {
            // Create new scan
            scanData = {
                id: Date.now(),
                name: name,
                status: 'active',
                createdAt: new Date().toISOString()
            };
        }

        if (isDayMode) {
            // Day mode validation
            const selectedDate = document.getElementById('scanDate').value;
            if (!selectedDate) {
                alert('Please select a date');
                return;
            }

            // Get iteration count and time slots
            const iterationCount = parseInt(document.getElementById('iterationCount').value) || 0;
            const timeSlots = [];

            if (iterationCount > 0) {
                for (let i = 1; i <= iterationCount; i++) {
                    const fromTime = document.getElementById(`timeFrom${i}`)?.value || '';
                    const toTime = document.getElementById(`timeTo${i}`)?.value || '';

                    if (!fromTime || !toTime) {
                        alert(`Please fill in both From Time and To Time for Time Slot ${i}`);
                        return;
                    }

                    timeSlots.push({
                        slot: i,
                        fromTime: fromTime,
                        toTime: toTime
                    });
                }
            }

            scanData.frequency = 'Daily';
            scanData.mode = 'day';
            scanData.date = selectedDate;
            scanData.iterations = iterationCount;
            scanData.timeSlots = timeSlots;
            // Clear week mode properties if switching from week to day
            delete scanData.repeat;
            delete scanData.days;
            delete scanData.dayConfigurations;
        } else {
            // Week mode validation
            const repeat = document.getElementById('repeatSwitch').checked;
            const configuredDays = Object.keys(this.dayConfigurations);

            if (configuredDays.length === 0) {
                alert('Please configure at least one day by clicking on it');
                return;
            }

            scanData.frequency = 'Weekly';
            scanData.mode = 'week';
            scanData.repeat = repeat;
            scanData.days = configuredDays;
            scanData.dayConfigurations = JSON.parse(JSON.stringify(this.dayConfigurations));
            // Clear day mode properties if switching from day to week
            delete scanData.date;
            delete scanData.iterations;
            delete scanData.timeSlots;
        }

        // Add to data if new (not editing)
        if (!isEditing) {
            this.data.table.data.unshift(scanData);
        }

        // Save to localStorage
        this.saveData();

        // Reset editing state
        this.editingScanId = null;

        // Close modal and refresh
        App.hideModal('addScanModal');
        this.render();
        this.bindEvents();

        // Show success toast
        App.showToast(isEditing ? 'Scan updated successfully!' : 'Scan added successfully!', 'success');

        console.log('Scan saved:', scanData);
        console.log('All data:', this.data.table.data);
    },

    handleTableAction(action, id) {
        switch (action) {
            case 'view':
                this.openViewModal(id);
                break;
            case 'edit':
                this.openEditModal(id);
                break;
            case 'archive':
                if (confirm('Are you sure you want to archive this scan?')) {
                    const item = this.data.table.data.find(i => i.id == id);
                    if (item) {
                        item.status = 'inactive';
                        this.saveData();
                        this.render();
                        this.bindEvents();
                        App.showToast('Scan archived successfully!', 'success');
                    }
                }
                break;
        }
    },

    openViewModal(id) {
        const scan = this.data.table.data.find(i => i.id == id);
        if (!scan) return;

        this.currentViewScan = scan;

        // Generate view content
        const content = this.generateViewContent(scan);
        document.getElementById('viewScanContent').innerHTML = content;

        App.showModal('viewScanModal');
    },

    generateViewContent(scan) {
        let html = `
            <div class="view-scan-details">
                <!-- Scan Name -->
                <div class="form-group">
                    <label class="form-label">Scan Name</label>
                    <input type="text" class="form-input" value="${scan.name}" readonly>
                </div>

                <!-- Frequency Type -->
                <div class="form-group">
                    <label class="form-label">Frequency Type</label>
                    <div class="radio-group">
                        <label class="radio-label">
                            <input type="radio" name="viewScanMode" value="day" ${scan.mode === 'day' ? 'checked' : ''} disabled>
                            <span class="radio-custom"></span>
                            Day
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="viewScanMode" value="week" ${scan.mode === 'week' ? 'checked' : ''} disabled>
                            <span class="radio-custom"></span>
                            Week
                        </label>
                    </div>
                </div>
        `;

        if (scan.mode === 'day') {
            html += `
                <!-- Day Mode Content -->
                <div class="mode-content">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Select Date</label>
                            <input type="date" class="form-input" value="${scan.date || ''}" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Iteration</label>
                            <input type="number" class="form-input" value="${scan.iterations || 0}" readonly>
                        </div>
                    </div>
            `;

            if (scan.iterations && scan.iterations > 0 && scan.timeSlots) {
                html += `<div class="time-slots-container"><div class="time-slots-grid">`;
                scan.timeSlots.forEach((slot, index) => {
                    html += `
                        <div class="time-slot-item">
                            <div class="time-slot-header">
                                <span class="time-slot-number">${index + 1}</span>
                                <span class="time-slot-title">Time Slot ${index + 1}</span>
                            </div>
                            <div class="time-slot-fields">
                                <div class="form-group">
                                    <label class="form-label">From Time</label>
                                    <input type="time" class="form-input" value="${slot.fromTime}" readonly>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">To Time</label>
                                    <input type="time" class="form-input" value="${slot.toTime}" readonly>
                                </div>
                            </div>
                        </div>
                    `;
                });
                html += `</div></div>`;
            }

            html += `</div>`;
        } else if (scan.mode === 'week') {
            html += `
                <!-- Week Mode Content -->
                <div class="mode-content">
                    <!-- Repeat Switch -->
                    <div class="form-group">
                        <div class="switch-row">
                            <span class="switch-label">Repeat</span>
                            <label class="switch">
                                <input type="checkbox" ${scan.repeat ? 'checked' : ''} disabled>
                                <span class="switch-slider"></span>
                            </label>
                        </div>
                    </div>

                    <!-- Days Selection -->
                    <div class="form-group">
                        <label class="form-label">Configured Days</label>
                        <div class="days-grid-new">
            `;

            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            days.forEach(day => {
                const config = scan.dayConfigurations ? scan.dayConfigurations[day] : null;
                const dayName = day.charAt(0).toUpperCase() + day.slice(1);
                const isConfigured = config !== null && config !== undefined;

                html += `
                    <div class="day-card ${isConfigured ? 'configured' : ''}" style="cursor: default;">
                        <div class="day-card-name">${dayName}</div>
                        <div class="day-card-count">${isConfigured ? config.iterations : ''}</div>
                    </div>
                `;
            });

            html += `
                        </div>
                    </div>
            `;

            // Show time slots for each configured day
            if (scan.dayConfigurations) {
                days.forEach(day => {
                    const config = scan.dayConfigurations[day];
                    if (config && config.timeSlots && config.timeSlots.length > 0) {
                        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
                        html += `
                            <div class="view-day-config-section">
                                <label class="form-label">${dayName} - Time Slots</label>
                                <div class="time-slots-container"><div class="time-slots-grid">
                        `;
                        config.timeSlots.forEach((slot, index) => {
                            html += `
                                <div class="time-slot-item">
                                    <div class="time-slot-header">
                                        <span class="time-slot-number">${index + 1}</span>
                                        <span class="time-slot-title">Time Slot ${index + 1}</span>
                                    </div>
                                    <div class="time-slot-fields">
                                        <div class="form-group">
                                            <label class="form-label">From Time</label>
                                            <input type="time" class="form-input" value="${slot.fromTime}" readonly>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">To Time</label>
                                            <input type="time" class="form-input" value="${slot.toTime}" readonly>
                                        </div>
                                    </div>
                                </div>
                            `;
                        });
                        html += `</div></div></div>`;
                    }
                });
            }

            html += `</div>`;
        }

        html += `
                <div class="view-footer-info">
                    <span class="view-status">Status: <span class="status-badge ${scan.status}">${scan.status}</span></span>
                    ${scan.createdAt ? `<span class="view-created">Created: ${new Date(scan.createdAt).toLocaleString()}</span>` : ''}
                </div>
            </div>
        `;

        return html;
    },

    openEditModal(id) {
        const scan = this.data.table.data.find(i => i.id == id);
        if (!scan) return;

        this.editingScanId = id;

        // Reset and open modal
        this.openAddModal();

        // Change modal title
        document.querySelector('#addScanModal .modal-header h3').textContent = 'Edit Scan';

        // Fill in scan name
        document.getElementById('scanName').value = scan.name;

        if (scan.mode === 'day') {
            // Select Day mode
            document.getElementById('modeDayRadio').checked = true;
            document.getElementById('dayModeContent').style.display = 'block';
            document.getElementById('weekModeContent').style.display = 'none';
            this.scanMode = 'day';

            // Fill in date
            if (scan.date) {
                document.getElementById('scanDate').value = scan.date;
            }

            // Fill in iterations and time slots
            if (scan.iterations && scan.iterations > 0) {
                document.getElementById('iterationCount').value = scan.iterations;
                this.handleIterationChange(scan.iterations);

                // Fill in time values after DOM update
                setTimeout(() => {
                    (scan.timeSlots || []).forEach((slot, index) => {
                        const fromInput = document.getElementById(`timeFrom${index + 1}`);
                        const toInput = document.getElementById(`timeTo${index + 1}`);
                        if (fromInput) fromInput.value = slot.fromTime;
                        if (toInput) toInput.value = slot.toTime;
                    });
                }, 10);
            }
        } else if (scan.mode === 'week') {
            // Select Week mode
            document.getElementById('modeWeekRadio').checked = true;
            document.getElementById('dayModeContent').style.display = 'none';
            document.getElementById('weekModeContent').style.display = 'block';
            this.scanMode = 'week';

            // Fill in repeat
            document.getElementById('repeatSwitch').checked = scan.repeat || false;

            // Fill in day configurations
            if (scan.dayConfigurations) {
                this.dayConfigurations = JSON.parse(JSON.stringify(scan.dayConfigurations));

                // Update UI for each configured day
                Object.keys(this.dayConfigurations).forEach(day => {
                    this.updateDayCardUI(day);
                });
            }
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => ScanMasterPage.init(), 50);
});
