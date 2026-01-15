/**
 * Main Application Controller
 */

const App = {
    config: null,
    navData: null,
    menuData: null,
    basePath: '',

    init(basePath = '') {
        this.basePath = basePath;

        // Load data from AppData
        this.config = AppData.app;
        this.navData = AppData.nav;
        this.menuData = AppData.menu;

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

        if (navContainer && this.navData && this.menuData) {
            navContainer.innerHTML = Components.navbar(this.navData, this.menuData);
        }

        if (footerContainer && this.config) {
            footerContainer.innerHTML = Components.footer(this.config);
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
