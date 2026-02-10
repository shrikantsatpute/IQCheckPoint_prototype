/**
 * Application Data - All data stored here for easy modification
 */

const AppData = {
    // App Configuration
    app: {
        name: "IQCheckPoint",
        version: "1.0.68",
        year: 2026,
        theme: {
            primaryColor: "#6c5ce7",
            successColor: "#4caf50",
            dangerColor: "#e74c3c",
            warningColor: "#f39c12"
        },
        messages: {
            loading: "Loading...",
            error: "Something went wrong",
            noData: "No data available"
        }
    },

    // Navigation
    nav: {
        logo: {
            text: "IQCheckPoint",
            link: "index.html"
        },
        items: [
            { id: "dashboard", label: "Dashboard", link: "index.html" },
            { id: "me", label: "Me", link: "#" },
            { id: "newsfeed", label: "News Feed", link: "#" },
            {
                id: "mybusiness",
                label: "My Business",
                link: "#",
                hasSubmenu: true,
                submenu: [
                    { id: "mybusiness-main", label: "My Business", link: "pages/my-business.html" },
                    { id: "mybusiness-comm", label: "My Business Communication", link: "#" }
                ]
            },
            { id: "people", label: "People", link: "#" },
            { id: "schedule", label: "Schedule", link: "#" },
            { id: "timesheets", label: "Timesheets", link: "#" },
            { id: "reports", label: "Reports", link: "#" },
            { id: "calendar", label: "Calendar", link: "#" },
            { id: "request", label: "Request", link: "#" }
        ],
        user: {
            initials: "LA",
            name: "Logged User"
        },
        buttons: [
            { id: "startShift", label: "Start Shift", class: "btn btn-primary" }
        ]
    },

    // Dropdown Menu
    menu: {
        items: [
            {
                id: "forms",
                label: "Forms",
                link: "#",
                hasSubmenu: false
            },
            {
                id: "tasks",
                label: "Tasks",
                link: "#",
                hasSubmenu: true,
                submenu: []
            },
            {
                id: "payroll",
                label: "Payroll Library",
                link: "#",
                hasSubmenu: true,
                submenu: []
            },
            {
                id: "business",
                label: "Business",
                link: "#",
                hasSubmenu: true,
                submenu: [
                    { id: "setting", label: "Setting", link: "#" },
                    { id: "public-holidays", label: "Public Holidays", link: "#" },
                    { id: "leave-master", label: "Leave Master", link: "#" },
                    { id: "training-license", label: "Training/License", link: "#" },
                    { id: "scan-master", label: "Scan Master", link: "pages/scan-master.html", isNew: true },
                    { id: "stress-profile", label: "Stress Profile", link: "#" },
                    { id: "business-roles", label: "Business Roles", link: "#" },
                    { id: "business-config", label: "Business Configuration", link: "#" },
                    { id: "onboarding", label: "Onboarding Setting", link: "#" },
                    { id: "custom-field", label: "Custom Field Setting", link: "#" },
                    { id: "notification", label: "Notification Configuration", link: "#" },
                    { id: "integrations", label: "Integrations", link: "#" },
                    { id: "kiosk", label: "Kiosk Management", link: "#" },
                    { id: "switch-business", label: "Switch Business", link: "#" }
                ]
            }
        ]
    },

    // Scan Master Page Data
    scanMaster: {
        page: {
            title: "Scan Master"
        },
        filters: {
            search: { placeholder: "Search" },
            status: [
                { id: "active", label: "Active" },
                { id: "all", label: "All" }
            ]
        },
        table: {
            columns: [
                { key: "name", label: "Scan Name", sortable: true },
                { key: "frequency", label: "Frequency", sortable: true },
                { key: "actions", label: "Actions", sortable: false }
            ],
            data: [
                { id: 1, name: "Daily Attendance", frequency: "Daily", status: "active", qrId: "QR-ATTENDANCE-DAILY-001" },
                { id: 2, name: "Weekly Report Scan", frequency: "Weekly", status: "active", qrId: "QR-WEEKLY-REPORT-002" },
                { id: 3, name: "Monthly Audit", frequency: "Monthly", status: "active", qrId: "QR-MONTHLY-AUDIT-003" },
                { id: 4, name: "Equipment Check", frequency: "Daily", status: "inactive", qrId: "QR-EQUIPMENT-CHECK-004" },
                { id: 5, name: "Visitor Log", frequency: "Daily", status: "active", qrId: "QR-VISITOR-LOG-005" }
            ]
        },
        pagination: {
            pageSize: 10,
            pageSizes: [10, 20, 50]
        },
        frequencies: [
            { id: "daily", label: "Daily" },
            { id: "weekly", label: "Weekly" },
            { id: "monthly", label: "Monthly" },
            { id: "yearly", label: "Yearly" }
        ]
    },

    // My Business Page Data
    myBusiness: {
        page: {
            title: "My Business"
        },
        filters: {
            search: { placeholder: "Search" },
            status: [
                { id: "active", label: "Active" },
                { id: "all", label: "All" }
            ]
        },
        table: {
            columns: [
                { key: "business", label: "My Business", sortable: true },
                { key: "contactName", label: "Contact Person Name", sortable: true },
                { key: "contactEmail", label: "Contact Person Email", sortable: true },
                { key: "state", label: "State", sortable: true },
                { key: "city", label: "City", sortable: true },
                { key: "locationCount", label: "My Business Location Count", sortable: true },
                { key: "areaCount", label: "Area Count", sortable: true },
                { key: "employeeCount", label: "Employee Count", sortable: true },
                { key: "actions", label: "Actions", sortable: false }
            ],
            data: [
                {
                    id: 1,
                    business: "Sparx",
                    initials: "LA",
                    contactName: "Livemy",
                    contactEmail: "livemyadmin@yopmail.com",
                    state: "Gujarat",
                    city: "a",
                    locationCount: 1,
                    areaCount: 1,
                    employeeCount: 1,
                    status: "active"
                },
                {
                    id: 2,
                    business: "Macarthur Anglican School",
                    initials: "MA",
                    contactName: "Place Holder",
                    contactEmail: "placeholder@gmail.com",
                    state: "-",
                    city: "-",
                    locationCount: 1,
                    areaCount: 1,
                    employeeCount: 6,
                    status: "active"
                },
                {
                    id: 3,
                    business: "CSIRO Tidbinbilla",
                    initials: "CT",
                    contactName: "Mark",
                    contactEmail: "MCarpenter@cdscc.nasa.gov",
                    state: "-",
                    city: "-",
                    locationCount: 1,
                    areaCount: 1,
                    employeeCount: 2,
                    status: "active"
                },
                {
                    id: 4,
                    business: "Park Royal Parramatta",
                    initials: "PR",
                    contactName: "Dhruv",
                    contactEmail: "dhruv.patel@parkroyalhotels.com",
                    state: "-",
                    city: "-",
                    locationCount: 2,
                    areaCount: 6,
                    employeeCount: 39,
                    status: "active"
                },
                {
                    id: 5,
                    business: "Glen Eagles",
                    initials: "GE",
                    contactName: "Place",
                    contactEmail: "Placeholder@GlenEagles.com.au",
                    state: "-",
                    city: "-",
                    locationCount: 1,
                    areaCount: 1,
                    employeeCount: 3,
                    status: "active"
                },
                {
                    id: 6,
                    business: "BAI Communications",
                    initials: "BC",
                    contactName: "Place",
                    contactEmail: "placeholder@bai.com",
                    state: "-",
                    city: "-",
                    locationCount: 4,
                    areaCount: 85,
                    employeeCount: 4,
                    status: "active"
                },
                {
                    id: 7,
                    business: "Catholic Schools Paramatta Diocese",
                    initials: "CS",
                    contactName: "Place",
                    contactEmail: "place.holder@gmail.com",
                    state: "-",
                    city: "-",
                    locationCount: 16,
                    areaCount: 16,
                    employeeCount: 4,
                    status: "active"
                },
                {
                    id: 8,
                    business: "EVENT CINEMAS",
                    initials: "EC",
                    contactName: "Prakash",
                    contactEmail: "placeholder@evt.com",
                    state: "-",
                    city: "-",
                    locationCount: 4,
                    areaCount: 4,
                    employeeCount: 11,
                    status: "active"
                },
                {
                    id: 9,
                    business: "TOMRA TASMANIA",
                    initials: "TT",
                    contactName: "Place",
                    contactEmail: "Place.Holder@gmail.com",
                    state: "-",
                    city: "-",
                    locationCount: 27,
                    areaCount: 27,
                    employeeCount: 48,
                    status: "active"
                },
                {
                    id: 10,
                    business: "Aveva/Astell",
                    initials: "AA",
                    contactName: "Place Holder",
                    contactEmail: "Biogeavevar@gmail.com",
                    state: "-",
                    city: "-",
                    locationCount: 1,
                    areaCount: 1,
                    employeeCount: 7,
                    status: "active"
                },
                {
                    id: 11,
                    business: "Health Care Australia",
                    initials: "HC",
                    contactName: "Place",
                    contactEmail: "Placeholder@carlislehealth.com.au",
                    state: "-",
                    city: "-",
                    locationCount: 21,
                    areaCount: 21,
                    employeeCount: 17,
                    status: "active"
                },
                {
                    id: 12,
                    business: "Smiths Detection",
                    initials: "SD",
                    contactName: "Andrew",
                    contactEmail: "spaceholder@smithdetection.com",
                    state: "-",
                    city: "-",
                    locationCount: 5,
                    areaCount: 5,
                    employeeCount: 21,
                    status: "active"
                },
                {
                    id: 13,
                    business: "Carlise Health (Dr Glenn and Partners)",
                    initials: "CH",
                    contactName: "Dr",
                    contactEmail: "Placeholder@carlislehealth.com.au",
                    state: "-",
                    city: "-",
                    locationCount: 3,
                    areaCount: 3,
                    employeeCount: 4,
                    status: "active"
                },
                {
                    id: 14,
                    business: "Unilever",
                    initials: "UL",
                    contactName: "Place",
                    contactEmail: "Place.Holder@unilever.com",
                    state: "-",
                    city: "-",
                    locationCount: 5,
                    areaCount: 49,
                    employeeCount: 54,
                    status: "active"
                },
                {
                    id: 15,
                    business: "Streets Ice Cream",
                    initials: "SI",
                    contactName: "Place",
                    contactEmail: "Place.Holder@unilever.com",
                    state: "-",
                    city: "-",
                    locationCount: 3,
                    areaCount: 25,
                    employeeCount: 29,
                    status: "active"
                }
            ]
        },
        pagination: {
            pageSize: 20,
            pageSizes: [10, 20, 50]
        }
    },

    // Client Locations Data (for TOMRA TASMANIA - id: 9)
    clientLocations: {
        9: [
            { id: 1, name: "Hobart Caretaker Team", address: "Hobart TAS, Australia", weeksStartWith: "Monday", openTime: "09:00", employeeCount: 11, areaCount: 1, budgetType: "No", status: "active" },
            { id: 2, name: "G8429 New Town Queens Walk", address: "Queens Walk & Risdon Road, Ne...", weeksStartWith: "Monday", openTime: "09:00", employeeCount: 16, areaCount: 1, budgetType: "No", status: "active" },
            { id: 3, name: "G8430 Glenorchy", address: "2 Cooper St, Glenorchy TAS 701...", weeksStartWith: "Monday", openTime: "09:00", employeeCount: 17, areaCount: 1, budgetType: "No", status: "active" },
            { id: 4, name: "Launceston Caretaker Team", address: "Launceston TAS, Australia", weeksStartWith: "Monday", openTime: "09:00", employeeCount: 7, areaCount: 1, budgetType: "No", status: "active" },
            { id: 5, name: "G8414 Ulverstone", address: "13-15 Alexandra Rd, Ulverstone...", weeksStartWith: "Monday", openTime: "09:00", employeeCount: 30, areaCount: 1, budgetType: "No", status: "active" },
            { id: 6, name: "G8402 Scottsdale", address: "Rose St, Scottsdale TAS 7260, A...", weeksStartWith: "Monday", openTime: "09:00", employeeCount: 22, areaCount: 1, budgetType: "No", status: "active" },
            { id: 7, name: "G8413 Riverside", address: "1 Windsor Dr, Riverside TAS 725...", weeksStartWith: "Monday", openTime: "09:00", employeeCount: 25, areaCount: 1, budgetType: "No", status: "active" },
            { id: 8, name: "G8416 Mowbray", address: "272 Invermay Rd, Mowbray TAS...", weeksStartWith: "Monday", openTime: "09:00", employeeCount: 25, areaCount: 1, budgetType: "No", status: "active" },
            { id: 9, name: "G8425 Wivenhoe", address: "Smith St, Wivenhoe TAS 7320, A...", weeksStartWith: "Monday", openTime: "09:00", employeeCount: 27, areaCount: 1, budgetType: "No", status: "active" },
            { id: 10, name: "G8423 South Hobart", address: "30 Mcrobies Rd, South Hobart T...", weeksStartWith: "Monday", openTime: "09:00", employeeCount: 25, areaCount: 1, budgetType: "No", status: "active" },
            { id: 11, name: "G8412 Launceston", address: "14 Dowling St, Launceston TAS...", weeksStartWith: "Monday", openTime: "09:00", employeeCount: 25, areaCount: 1, budgetType: "No", status: "active" },
            { id: 12, name: "G8403 Smithton", address: "21 Smith St, Smithton TAS 7330...", weeksStartWith: "Monday", openTime: "09:00", employeeCount: 23, areaCount: 1, budgetType: "No", status: "active" },
            { id: 13, name: "G8400 Deloraine", address: "4 Racecourse Dr, Deloraine TAS...", weeksStartWith: "Monday", openTime: "09:00", employeeCount: 24, areaCount: 1, budgetType: "No", status: "active" },
            { id: 14, name: "G8401 Dodges Ferry", address: "519 Old Forcett Rd, Dodges Ferr...", weeksStartWith: "Monday", openTime: "09:00", employeeCount: 24, areaCount: 1, budgetType: "No", status: "active" }
        ]
    },

    // Location Detail Sidebar Menu
    locationDetailSidebar: [
        { id: "resources", label: "Resources", icon: "📁" },
        { id: "general", label: "General", icon: "ℹ️" },
        { id: "scheduling", label: "Scheduling", icon: "📅" },
        { id: "timesheet", label: "Timesheet", icon: "⏱️" },
        { id: "assign-tasks", label: "Assign Tasks", icon: "📋" },
        { id: "assign-form", label: "Assign Form", icon: "📝" },
        { id: "loop", label: "Loop", icon: "🔄", isNew: true },
        { id: "assign-employees", label: "Assign Employees", icon: "👥" },
        { id: "location-budget", label: "Location Budget", icon: "💰" },
        { id: "notification", label: "Notification", icon: "🔔" },
        { id: "kiosk", label: "Kiosk", icon: "🖥️" },
        { id: "area-reorder", label: "Area Reorder", icon: "🔀" }
    ],

    // Location Loop Data (sample data for locations)
    // These are assigned Master Scans from scanMaster.table.data
    locationLoops: {
        1: [
            { id: 1, scanMasterId: 1, name: "Daily Attendance", frequency: "Daily", status: "active", assignedAt: "2024-01-15T10:00:00Z" },
            { id: 2, scanMasterId: 5, name: "Visitor Log", frequency: "Daily", status: "active", assignedAt: "2024-01-16T14:30:00Z" }
        ]
    },

    // Client Areas Data (for TOMRA TASMANIA - clientId: 9)
    clientAreas: {
        9: [
            { id: 1, locationId: 1, locationName: "Hobart Caretaker Team", name: "area 3", address: "307, Sardar Patel Ring Rd, Odhav Industrial...", sendGPS: "Yes", allowedInSchedule: "Yes", remark: "", pointTypes: ["Q", "B", "N", "V"], country: "Australia", state: "Tasmania", city: "Hobart", postcode: "7000", fraudDistanceType: "KILOMETER", fraudDistance: "10", status: "active" },
            { id: 2, locationId: 1, locationName: "Hobart Caretaker Team", name: "area 2", address: "307, Sardar Patel Ring Rd, Odhav Industrial...", sendGPS: "Yes", allowedInSchedule: "Yes", remark: "", pointTypes: ["Q", "B", "N", "V"], country: "Australia", state: "Tasmania", city: "Hobart", postcode: "7000", fraudDistanceType: "KILOMETER", fraudDistance: "10", status: "active" },
            { id: 3, locationId: 2, locationName: "G8429 New Town Queens Walk", name: "Area", address: "Mezzanine Level/12 O'Connell St, Sydney N...", sendGPS: "Yes", allowedInSchedule: "Yes", remark: "", pointTypes: ["Q"], country: "Australia", state: "NSW", city: "Sydney", postcode: "2000", fraudDistanceType: "KILOMETER", fraudDistance: "5", status: "active" },
            { id: 4, locationId: 1, locationName: "Hobart Caretaker Team", name: "area 1", address: "307, Sardar Patel Ring Rd, Odhav Industrial...", sendGPS: "Yes", allowedInSchedule: "Yes", remark: "", pointTypes: ["Q", "B", "N", "V"], country: "Australia", state: "Tasmania", city: "Hobart", postcode: "7000", fraudDistanceType: "KILOMETER", fraudDistance: "10", status: "active" }
        ]
    },

    // Area Detail Sidebar Menu
    areaDetailSidebar: [
        { id: "general", label: "General", icon: "ℹ️" },
        { id: "assign-form", label: "Assign Form", icon: "📝" }
    ],

    // Area Loop Data (assigned Master Scans for areas)
    areaLoops: {
        1: [
            { id: 1, scanMasterId: 2, name: "Weekly Report Scan", frequency: "Weekly", status: "active", assignedAt: "2024-01-20T09:00:00Z" }
        ]
    }
};
