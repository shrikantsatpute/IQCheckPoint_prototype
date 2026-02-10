/**
 * Main Application Controller
 */

const App = {
    config: null,
    navData: null,
    menuData: null,
    startShiftPanelData: null,
    myBusinessData: null,
    clientLocationsData: null,
    clientAreasData: null,
    qrCodeData: null,
    shiftTimerInterval: null,
    basePath: '',

    init(basePath = '') {
        this.basePath = basePath;

        // Load data from AppData
        this.config = AppData.app;
        this.navData = AppData.nav;
        this.menuData = AppData.menu;
        this.startShiftPanelData = AppData.startShiftPanel;
        this.myBusinessData = AppData.myBusiness.table.data;
        this.clientLocationsData = AppData.clientLocations;
        this.clientAreasData = AppData.clientAreas;
        this.qrCodeData = AppData.qrCodeScans;


        // Adjust links for subpages
        if (basePath === '../') {
            this.adjustLinksForSubpage();
        }

        // Render layout
        this.renderLayout();

        // Initialize menu
        MenuController.init();

        console.log('App initialized');
    },

    adjustLinksForSubpage() {
        // Adjust nav links
        this.navData.logo.link = '../index.html';
        this.navData.items = this.navData.items.map(item => {
            const adjusted = {
                ...item,
                link: item.link === 'index.html' ? '../index.html' : item.link
            };
            // Adjust submenu links
            if (item.submenu) {
                adjusted.submenu = item.submenu.map(sub => ({
                    ...sub,
                    link: sub.link.startsWith('pages/') ? '../' + sub.link : sub.link
                }));
            }
            return adjusted;
        });

        // Adjust menu links
        this.menuData.items = this.menuData.items.map(item => {
            if (item.submenu) {
                return {
                    ...item,
                    submenu: item.submenu.map(sub => ({
                        ...sub,
                        link: sub.link.startsWith('pages/') ? '../' + sub.link : sub.link
                    }))
                };
            }
            return item;
        });
    },

    renderLayout() {
        const navContainer = document.getElementById('navContainer');
        const footerContainer = document.getElementById('footerContainer');
        const body = document.body;

        if (navContainer && this.navData && this.menuData) {
            navContainer.innerHTML = Components.navbar(this.navData, this.menuData);
        }

        if (footerContainer && this.config) {
            footerContainer.innerHTML = Components.footer(this.config);
        }

        if (body && this.startShiftPanelData) {
            const panel = document.createElement('div');
            panel.innerHTML = Components.startShiftPanel(this.startShiftPanelData);
            body.appendChild(panel);

            // Bind events for the shift panel
            const startShiftBtn = document.getElementById('startShift');
            const shiftPanel = document.getElementById('startShiftPanel');
            const closeShiftPanelBtn = document.getElementById('closeShiftPanel');

            if (startShiftBtn && shiftPanel && closeShiftPanelBtn) {
                startShiftBtn.addEventListener('click', () => {
                    shiftPanel.classList.add('show');
                });

                closeShiftPanelBtn.addEventListener('click', () => {
                    shiftPanel.classList.remove('show');
                });

                shiftPanel.addEventListener('click', (e) => {
                    if (e.target === shiftPanel) {
                        shiftPanel.classList.remove('show');
                    }
                });
            }
        }

        // Render Start Shift Modal
        if (body && this.myBusinessData) {
            const modal = document.createElement('div');
            modal.innerHTML = Components.startShiftModal(this.myBusinessData);
            body.appendChild(modal);
            this.bindStartShiftModalEvents();
        }

        // Render QR Scanner Modal
        if (body) {
            const qrModal = document.createElement('div');
            qrModal.innerHTML = Components.qrScannerModal();
            body.appendChild(qrModal);
        }
    },

    bindStartShiftModalEvents() {
        const startShiftModal = document.getElementById('startShiftModal');
        const openModalBtn = document.getElementById('startShiftBtn'); // Button in the side panel
        const closeModalBtns = document.querySelectorAll('[data-modal="startShiftModal"]');
        
        // Open modal
        openModalBtn?.addEventListener('click', () => {
            this.showModal('startShiftModal');
        });

        // Close modal
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideModal('startShiftModal');
            });
        });

        startShiftModal?.addEventListener('click', (e) => {
            if (e.target === startShiftModal) {
                this.hideModal('startShiftModal');
            }
        });

        // Dropdown event listeners
        const businessSelect = document.getElementById('shiftBusiness');
        const locationSelect = document.getElementById('shiftLocation');
        const areaSelect = document.getElementById('shiftArea');

        businessSelect?.addEventListener('change', () => {
            const businessId = businessSelect.value;
            this.populateLocations(businessId);
            areaSelect.innerHTML = '<option value="">Select Area</option>';
            areaSelect.disabled = true;
        });

        locationSelect?.addEventListener('change', () => {
            const locationId = locationSelect.value;
            const businessId = businessSelect.value;
            this.populateAreas(businessId, locationId);
        });

        // Button event listeners
        document.getElementById('shiftSaveBtn')?.addEventListener('click', () => this.handleShiftSave());
        document.getElementById('shiftSubmitBtn')?.addEventListener('click', () => this.handleShiftSubmit());
        document.getElementById('shiftDoneBtn')?.addEventListener('click', () => this.handleShiftDone());
    },

    handleShiftSave() {
        const businessSelect = document.getElementById('shiftBusiness');
        const locationSelect = document.getElementById('shiftLocation');
        const areaSelect = document.getElementById('shiftArea');

        if (!businessSelect.value || !locationSelect.value || !areaSelect.value) {
            this.showToast('Please select all fields.', 'error');
            return;
        }

        // Populate verification screen
        document.getElementById('verifyBusiness').value = businessSelect.options[businessSelect.selectedIndex].text;
        document.getElementById('verifyLocation').value = locationSelect.options[locationSelect.selectedIndex].text;
        document.getElementById('verifyArea').value = areaSelect.options[areaSelect.selectedIndex].text;

        // Switch to step 2
        document.getElementById('shift-step-1').style.display = 'none';
        document.getElementById('shift-step-2').style.display = 'block';
    },

    handleShiftSubmit() {
        // Switch to step 3
        document.getElementById('shift-step-2').style.display = 'none';
        document.getElementById('shift-step-3').style.display = 'block';

        // Set start time
        const startTime = new Date();
        document.getElementById('shiftStartTime').textContent = startTime.toLocaleTimeString();

        // Update side panel and start timer
        this.startShift(startTime);
    },

    handleShiftDone() {
        this.hideModal('startShiftModal');

        // Reset modal to step 1 for next time
        setTimeout(() => {
            document.getElementById('shift-step-3').style.display = 'none';
            document.getElementById('shift-step-1').style.display = 'block';
        }, 500);
    },

    startShift(startTime) {
        // Update side panel UI
        const panel = document.querySelector('.shift-panel');
        if (panel) {
            panel.querySelector('.shift-user-name').innerHTML = 'auto man <span class="text-success">(Started)</span>';
            panel.querySelector('.shift-user-role').innerHTML = '<b>Role:</b> Employee';
            
            const details = panel.querySelector('.shift-user-details');
            let worksAt = document.createElement('div');
            worksAt.className = 'shift-user-works-at';
            worksAt.innerHTML = `
                <div>Works at Area</div>
                <div>
                    <span>📍 ${document.getElementById('verifyLocation').value}</span>
                    <span>👤 ${document.getElementById('verifyBusiness').value}</span>
                </div>
                <div>Duration: <span id="shiftDuration">00 Hrs: 0 Mins</span></div>
            `;
            details.appendChild(worksAt);

            panel.querySelector('.shift-buttons').innerHTML = `
                <button class="btn btn-primary">Shift Details</button>
                <button class="btn btn-warning">Start Break</button>
                <button class="btn btn-warning" id="makeScanBtn">Make Scan</button>
                <button class="btn btn-danger">End Shift</button>
            `;

            document.getElementById('makeScanBtn')?.addEventListener('click', () => {
                this.showModal('qrScannerModal');
                this.startQrScanner();
            });
        }

        // Hide main "Start Shift" button and show timer
        const startShiftNavBtn = document.getElementById('startShift');
        startShiftNavBtn.style.display = 'none';
    },

    startQrScanner() {
        const qrCodeSuccessCallback = (decodedText, decodedResult) => {
            const resultContainer = document.getElementById('qr-scan-result');
            const foundQr = this.qrCodeData.codes.find(c => c.qrId === decodedText);

            if (foundQr) {
                const scanDetails = AppData.scanMaster.data.find(s => s.id === foundQr.scanMasterId);
                if (scanDetails) {
                    resultContainer.innerHTML = `
                        <h4>Scan Successful!</h4>
                        <p><b>Scan Name:</b> ${scanDetails.name}</p>
                        <p><b>Frequency:</b> ${scanDetails.frequency}</p>
                        <p><b>QR ID:</b> ${decodedText}</p>
                    `;
                    resultContainer.style.display = 'block';
                    this.showToast('QR Code Verified!', 'success');
                } else {
                    resultContainer.innerHTML = `<p class="text-danger">QR Code found, but no matching scan details.</p>`;
                    resultContainer.style.display = 'block';
                }
            } else {
                resultContainer.innerHTML = `<p class="text-danger">Invalid QR Code: ${decodedText}</p>`;
                resultContainer.style.display = 'block';
                this.showToast('Invalid QR Code.', 'error');
            }

            // Stop the scanner
            html5QrcodeScanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner.", error);
            });
        };

        const qrCodeErrorCallback = (errorMessage) => {
            // handle scan failure, usually better to ignore and keep scanning.
            // console.error(`QR Code no longer in front of camera.`);
        };

        const html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader", 
            { fps: 10, qrbox: {width: 250, height: 250} }, 
            /* verbose= */ false);

        html5QrcodeScanner.render(qrCodeSuccessCallback, qrCodeErrorCallback);
    },


    populateLocations(businessId) {
        const locationSelect = document.getElementById('shiftLocation');
        const locations = this.clientLocationsData[businessId] || [];
        
        locationSelect.innerHTML = '<option value="">Select Location</option>';
        if (locations.length > 0) {
            locations.forEach(loc => {
                locationSelect.innerHTML += `<option value="${loc.id}">${loc.name}</option>`;
            });
            locationSelect.disabled = false;
        } else {
            locationSelect.disabled = true;
        }
    },

    populateAreas(businessId, locationId) {
        const areaSelect = document.getElementById('shiftArea');
        const areas = (this.clientAreasData[businessId] || []).filter(area => area.locationId == locationId);

        areaSelect.innerHTML = '<option value="">Select Area</option>';
        if (areas.length > 0) {
            areas.forEach(area => {
                areaSelect.innerHTML += `<option value="${area.id}">${area.name}</option>`;
            });
            areaSelect.disabled = false;
        } else {
            areaSelect.disabled = true;
        }
    },


    // Utility: Show modal
    showModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('show');
        }
    },

    // Utility: Hide modal
    hideModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('show');
        }
    },

    // Utility: Show toast notification
    showToast(message, type = 'success') {
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast-container');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast container
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';

        // Icon based on type
        let icon = '✓';
        if (type === 'error') icon = '✕';
        if (type === 'warning') icon = '⚠';

        toastContainer.innerHTML = `
            <div class="toast ${type}">
                <span class="toast-icon">${icon}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close">&times;</button>
            </div>
        `;

        document.body.appendChild(toastContainer);

        // Show toast with animation
        setTimeout(() => {
            toastContainer.querySelector('.toast').classList.add('show');
        }, 10);

        // Close button
        toastContainer.querySelector('.toast-close').addEventListener('click', () => {
            toastContainer.querySelector('.toast').classList.remove('show');
            setTimeout(() => toastContainer.remove(), 300);
        });

        // Auto hide after 3 seconds
        setTimeout(() => {
            const toast = toastContainer.querySelector('.toast');
            if (toast) {
                toast.classList.remove('show');
                setTimeout(() => toastContainer.remove(), 300);
            }
        }, 3000);
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const basePath = path.includes('/pages/') ? '../' : '';
    App.init(basePath);
});
