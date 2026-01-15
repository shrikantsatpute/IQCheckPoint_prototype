/**
 * UI Components - Reusable component generators
 */

const Components = {

    // Generate Navigation Bar
    navbar(navData, menuData) {
        const navItems = navData.items.map(item => {
            if (item.hasSubmenu && item.submenu) {
                const submenuItems = item.submenu.map(sub =>
                    `<a href="${sub.link}" class="nav-dropdown-item">${sub.label}</a>`
                ).join('');
                return `
                    <div class="nav-item-wrapper">
                        <span class="nav-item nav-item-dropdown" data-dropdown="${item.id}">${item.label} <span class="nav-arrow">▼</span></span>
                        <div class="nav-dropdown" id="navDropdown-${item.id}">
                            ${submenuItems}
                        </div>
                    </div>
                `;
            }
            return `<a href="${item.link}" class="nav-item">${item.label}</a>`;
        }).join('');

        const menuItems = this.menuDropdown(menuData);

        return `
            <header class="top-nav">
                <div class="nav-left">
                    <a href="${navData.logo.link}" class="logo">${navData.logo.text}</a>
                    <nav class="nav-items">
                        ${navItems}
                        <div class="menu-wrapper">
                            <span class="menu-icon" id="menuIcon">•••</span>
                            <div class="dropdown-container" id="dropdown">
                                ${menuItems}
                            </div>
                        </div>
                    </nav>
                </div>
                <div class="nav-right">
                    ${navData.buttons.map(btn =>
                        `<button class="${btn.class}" id="${btn.id}">${btn.label}</button>`
                    ).join('')}
                    <div class="user-avatar">${navData.user.initials}</div>
                </div>
            </header>
        `;
    },

    // Generate Menu Dropdown
    menuDropdown(menuData) {
        const mainItems = menuData.items.map(item => `
            <div class="dropdown-item" data-submenu="${item.hasSubmenu ? item.id + 'Submenu' : ''}">
                ${item.label}
                ${item.hasSubmenu ? '<span class="arrow">›</span>' : ''}
            </div>
        `).join('');

        const submenus = menuData.items
            .filter(item => item.hasSubmenu && item.submenu.length > 0)
            .map(item => `
                <div class="submenu" id="${item.id}Submenu">
                    ${item.submenu.map(sub => `
                        <a href="${sub.link}" class="submenu-item ${sub.isNew ? 'new-feature' : ''}" data-page="${sub.id}">
                            ${sub.label}
                        </a>
                    `).join('')}
                </div>
            `).join('');

        return `
            <div class="dropdown-main">${mainItems}</div>
            ${submenus}
        `;
    },

    // Generate Page Header
    pageHeader(title, actions = []) {
        const actionButtons = actions.map(action =>
            `<button class="btn btn-primary" id="${action.id}">${action.label}</button>`
        ).join('');

        return `
            <div class="page-header">
                <h1 class="page-title">${title}</h1>
                <div class="page-actions">${actionButtons}</div>
            </div>
        `;
    },

    // Generate Data Table
    table(columns, data, actions = true) {
        const headers = columns.map(col =>
            `<th>${col.label}</th>`
        ).join('');

        const rows = data.map(row => `
            <tr data-id="${row.id}">
                ${columns.map(col => {
                    if (col.key === 'actions') {
                        return `
                            <td>
                                <button class="btn btn-secondary btn-sm" data-action="edit" data-id="${row.id}">Edit</button>
                                <button class="btn btn-secondary btn-sm" data-action="delete" data-id="${row.id}">Delete</button>
                            </td>
                        `;
                    }
                    if (col.key === 'status') {
                        const statusClass = row[col.key] === 'active' ? 'text-success' : 'text-muted';
                        return `<td><span class="${statusClass}">${row[col.key]}</span></td>`;
                    }
                    return `<td>${row[col.key] || ''}</td>`;
                }).join('')}
            </tr>
        `).join('');

        return `
            <div class="table-container">
                <table class="table">
                    <thead><tr>${headers}</tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },

    // Generate Stats Cards
    statsCards(stats) {
        return `
            <div class="stats-grid">
                ${stats.map(stat => `
                    <div class="stat-card">
                        <div class="stat-value color-${stat.color}">${stat.value.toLocaleString()}</div>
                        <div class="stat-label">${stat.label}</div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Generate Card
    card(title, content, headerActions = '') {
        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">${title}</span>
                    <div class="card-actions">${headerActions}</div>
                </div>
                <div class="card-body">${content}</div>
            </div>
        `;
    },

    // Generate Search Box
    searchBox(placeholder = 'Search...') {
        return `
            <div class="search-box">
                <input type="text" class="form-input" id="searchInput" placeholder="${placeholder}">
                <button class="btn btn-secondary" id="filterBtn">Filter</button>
            </div>
        `;
    },

    // Generate Footer
    footer(appData) {
        return `
            <footer class="footer">
                <span>© ${appData.year} ${appData.name} ${appData.version}</span>
            </footer>
        `;
    },

    // Generate Modal
    modal(id, title, content, actions = []) {
        const actionButtons = actions.map(action =>
            `<button class="btn ${action.class}" id="${action.id}">${action.label}</button>`
        ).join('');

        return `
            <div class="modal-overlay" id="${id}">
                <div class="modal">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <span class="modal-close" data-modal="${id}">&times;</span>
                    </div>
                    <div class="modal-body">${content}</div>
                    <div class="modal-footer">${actionButtons}</div>
                </div>
            </div>
        `;
    },

    // Generate Form Field
    formField(field) {
        let input = '';

        switch (field.type) {
            case 'select':
                const options = field.options.map(opt =>
                    `<option value="${opt.id}">${opt.label}</option>`
                ).join('');
                input = `<select class="form-select" id="${field.id}" name="${field.id}">${options}</select>`;
                break;
            case 'textarea':
                input = `<textarea class="form-input" id="${field.id}" name="${field.id}" placeholder="${field.placeholder || ''}"></textarea>`;
                break;
            default:
                input = `<input type="${field.type || 'text'}" class="form-input" id="${field.id}" name="${field.id}" placeholder="${field.placeholder || ''}">`;
        }

        return `
            <div class="form-group">
                <label class="form-label" for="${field.id}">${field.label}</label>
                ${input}
            </div>
        `;
    }
};
