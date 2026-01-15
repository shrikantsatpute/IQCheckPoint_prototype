/**
 * Menu Controller - Handles dropdown menu interactions
 */

const MenuController = {
    menuIcon: null,
    dropdown: null,
    dropdownItems: null,
    submenus: null,
    isInitialized: false,

    init() {
        this.menuIcon = document.getElementById('menuIcon');
        this.dropdown = document.getElementById('dropdown');

        if (!this.menuIcon || !this.dropdown) {
            console.warn('Menu elements not found');
            return;
        }

        this.dropdownItems = document.querySelectorAll('.dropdown-item');
        this.submenus = document.querySelectorAll('.submenu');

        this.bindEvents();
        this.bindNavDropdowns();
        this.isInitialized = true;
    },

    bindNavDropdowns() {
        // Handle nav item dropdowns (like My Business)
        const navDropdownTriggers = document.querySelectorAll('.nav-item-dropdown');

        navDropdownTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdownId = trigger.getAttribute('data-dropdown');
                const dropdown = document.getElementById(`navDropdown-${dropdownId}`);

                // Close other nav dropdowns
                document.querySelectorAll('.nav-dropdown').forEach(d => {
                    if (d !== dropdown) {
                        d.classList.remove('show');
                    }
                });
                document.querySelectorAll('.nav-item-dropdown').forEach(t => {
                    if (t !== trigger) {
                        t.classList.remove('active');
                    }
                });

                // Toggle current dropdown
                if (dropdown) {
                    dropdown.classList.toggle('show');
                    trigger.classList.toggle('active');
                }

                // Close the ••• menu if open
                this.closeDropdown();
            });
        });
    },

    bindEvents() {
        // Toggle dropdown on menu icon click
        this.menuIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
            // Close nav dropdowns
            this.closeNavDropdowns();
        });

        // Handle hover on dropdown items
        this.dropdownItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.handleItemHover(item);
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.dropdown.contains(e.target) && e.target !== this.menuIcon) {
                this.closeDropdown();
            }
            // Close nav dropdowns when clicking outside
            if (!e.target.closest('.nav-item-wrapper')) {
                this.closeNavDropdowns();
            }
        });

        // Keep submenu open when hovering
        this.submenus.forEach(submenu => {
            submenu.addEventListener('mouseenter', () => {
                submenu.classList.add('show');
            });
        });
    },

    closeNavDropdowns() {
        document.querySelectorAll('.nav-dropdown').forEach(d => {
            d.classList.remove('show');
        });
        document.querySelectorAll('.nav-item-dropdown').forEach(t => {
            t.classList.remove('active');
        });
    },

    toggleDropdown() {
        this.dropdown.classList.toggle('show');
        this.hideAllSubmenus();
        this.clearActiveItems();
    },

    closeDropdown() {
        this.dropdown.classList.remove('show');
        this.hideAllSubmenus();
        this.clearActiveItems();
    },

    handleItemHover(item) {
        this.clearActiveItems();
        this.hideAllSubmenus();

        const submenuId = item.getAttribute('data-submenu');
        if (submenuId) {
            item.classList.add('active');
            const submenu = document.getElementById(submenuId);
            if (submenu) {
                submenu.classList.add('show');
            }
        }
    },

    hideAllSubmenus() {
        this.submenus.forEach(submenu => {
            submenu.classList.remove('show');
        });
    },

    clearActiveItems() {
        this.dropdownItems.forEach(item => {
            item.classList.remove('active');
        });
    }
};
