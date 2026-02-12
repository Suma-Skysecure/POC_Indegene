
export const requestsData = [
    {
        id: '#REQ-8902',
        tool: 'Figma Enterprise',
        toolCategory: 'Design & Creative',
        requester: 'Sanya Iyer',
        role: 'Senior Product Designer',
        department: 'Design Ops',
        date: 'Oct 12, 2023',
        status: 'Pending',
        type: 'New',
        risk: 'Low',
        justification: "We need enterprise features for the growing design team, including advanced prototyping and variable modes. Figma is our primary design tool for all product interfaces.",
        useCase: "Streamlining the UI/UX design workflow across all product tracks. The team requires enterprise-grade prototyping capabilities and shared design libraries to maintain brand consistency for our upcoming global release.",
        requestOverview: {
            type: 'New Tool Request',
            tool: 'Figma Enterprise',
            vendor: 'Figma Inc.',
            department: 'Design Ops',
            licenses: '20 Licenses',
            timeline: 'Q4 2023 (3 months)'
        },
        licenseStatus: 'Not Available',
        riskPosture: 'Medium',
        equivalentTools: [
            { name: 'Adobe XD', status: 'Internal Standard', icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Adobe_XD_CC_icon.svg' },
            { name: 'Sketch', status: 'Current Vendor', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Sketch_Logo.svg' }
        ]
    },
    {
        id: '#REQ-8895',
        tool: 'Salesforce Pro',
        toolCategory: 'CRM & Sales',
        requester: 'Manoj Chopra',
        role: 'Sales Director',
        department: 'Sales',
        date: 'Oct 11, 2023',
        status: 'Approved',
        type: 'Expansion',
        risk: 'Low',
        justification: "Expanding the regional sales team for the upcoming fiscal quarter. Need 5 additional professional licenses to handle new lead distribution and CRM logging.",
        useCase: "Scaling out the regional sales teams to handle increased lead volume from recent marketing campaigns and ensuring full pipeline visibility for the new regional directors.",
        requestOverview: {
            type: 'Expansion Request',
            tool: 'Salesforce Pro',
            vendor: 'Salesforce.com',
            department: 'Sales',
            licenses: '5 Licenses',
            timeline: 'Immediate'
        },
        licenseStatus: 'Available',
        riskPosture: 'Low',
        equivalentTools: []
    },
    {
        id: '#REQ-8890',
        tool: 'Miro Business',
        toolCategory: 'Productivity',
        requester: 'Esha Desai',
        role: 'Product Manager',
        department: 'Product',
        date: 'Oct 10, 2023',
        status: 'In Analysis',
        type: 'New',
        risk: 'Medium',
        justification: "Collaboration whiteboard for remote brainstorming sessions and sprint planning with cross-functional product and engineering teams.",
        useCase: "Enabling real-time visual collaboration for distributed squads during complex ideation sessions, system architecture mapping, and virtual workshop ceremonies.",
        requestOverview: {
            type: 'New Tool Request',
            tool: 'Miro Business',
            vendor: 'Miro',
            department: 'Product',
            licenses: '15 Licenses',
            timeline: 'Q1 2024'
        },
        licenseStatus: 'Not Available',
        riskPosture: 'Medium',
        equivalentTools: [
            { name: 'Mural', status: 'Blocked', icon: '' }
        ]
    },
    {
        id: '#REQ-8885',
        tool: 'GitHub Copilot',
        toolCategory: 'Development',
        requester: 'Dhruv Kapoor',
        role: 'Senior Engineer',
        department: 'Engineering',
        date: 'Oct 09, 2023',
        status: 'Risk',
        type: 'New',
        risk: 'High',
        justification: "AI coding assistant to improve developer velocity and reduce boilerplate implementation time. Security review required for code privacy adherence.",
        useCase: "Accelerating the development of the new Core API platform. Copilot will be used to expedite unit test generation and provide intelligent code completion in our IDEs.",
        requestOverview: {
            type: 'New Tool Request',
            tool: 'GitHub Copilot',
            vendor: 'GitHub / Microsoft',
            department: 'Engineering',
            licenses: '50 Seats',
            timeline: 'Evaluation Phase'
        },
        licenseStatus: 'Internal Standard',
        riskPosture: 'High',
        equivalentTools: []
    },
    {
        id: '#REQ-8880',
        tool: 'Notion Team',
        toolCategory: 'Knowledge Management',
        requester: 'Lakshmi Nair',
        role: 'Content Strategist',
        department: 'Marketing',
        date: 'Oct 08, 2023',
        status: 'Pending',
        type: 'Reuse',
        risk: 'Low',
        justification: "Consolidating marketing documentation, asset links, and project wikis into a single, searchable team workspace to reduce knowledge silos.",
        useCase: "Centralizing marketing tribal knowledge and creating a unified workspace for campaign planning and branding asset management.",
        requestOverview: {
            type: 'Reuse Request',
            tool: 'Notion Team',
            vendor: 'Notion Labs',
            department: 'Marketing',
            licenses: '8 Users',
            timeline: 'Immediate'
        },
        licenseStatus: 'Available',
        riskPosture: 'Low',
        equivalentTools: [
            { name: 'Confluence', status: 'Internal Standard', icon: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Atlassian_Confluence_Logo.svg' }
        ]
    }
];

// Dashboard uses the same data now to ensure consistency "flow as same"
export const dashboardRequestsData = requestsData;

export const licenseData = [
    {
        id: 1,
        tool: 'Office 365 E5',
        vendor: 'Microsoft',
        total: 500,
        used: 482,
        available: 18,
        status: 'Healthy',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Microsoft_365_%282022%29.svg'
    },
    {
        id: 2,
        tool: 'Creative Cloud',
        vendor: 'Adobe',
        total: 120,
        used: 118,
        available: 2,
        status: 'Near Limit',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Creative_Cloud.svg'
    },
    {
        id: 3,
        tool: 'Salesforce CRM',
        vendor: 'Salesforce',
        total: 250,
        used: 210,
        available: 40,
        status: 'Healthy',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg'
    },
    {
        id: 4,
        tool: 'Slack Enterprise',
        vendor: 'Slack/Salesforce',
        total: 800,
        used: 820,
        available: -20,
        status: 'Over-utilized',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg'
    },
    {
        id: 5,
        tool: 'Jira Software',
        vendor: 'Atlassian',
        total: 350,
        used: 280,
        available: 70,
        status: 'Healthy',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Jira_Logo.svg'
    },
    {
        id: 6,
        tool: 'AWS Workspaces',
        vendor: 'Amazon Web Services',
        total: 100,
        used: 45,
        available: 55,
        status: 'Underutilized',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg'
    },
    {
        id: 7,
        tool: 'Figma Enterprise',
        vendor: 'Figma Inc.',
        total: 45,
        used: 42,
        available: 3,
        status: 'Near Limit',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg'
    },
    {
        id: 8,
        tool: 'Zoom Pro',
        vendor: 'Zoom Video',
        total: 150,
        used: 145,
        available: 5,
        status: 'Healthy',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Zoom_Communications_Logo.svg'
    },
    {
        id: 9,
        tool: 'GitHub Enterprise',
        vendor: 'GitHub',
        total: 300,
        used: 295,
        available: 5,
        status: 'Near Limit',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg'
    }
];

export const shadowItData = [
    {
        id: 1,
        app: 'Dropbox',
        category: 'Cloud Storage',
        riskLevel: 'High',
        users: 54,
        dataAccessed: 'Sensitive Files',
        lastActivity: '2 hrs ago',
        status: 'Active',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Dropbox_logo_2017.svg'
    },
    {
        id: 2,
        app: 'WeTransfer',
        category: 'File Sharing',
        riskLevel: 'High',
        users: 21,
        dataAccessed: 'Confidential Docs',
        lastActivity: '5 hrs ago',
        status: 'Active',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/4/46/WeTransfer_logo.svg'
    },
    {
        id: 3,
        app: 'Slack (Personal)',
        category: 'Communication',
        riskLevel: 'Medium',
        users: 33,
        dataAccessed: 'Messages',
        lastActivity: '1 day ago',
        status: 'Active',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg'
    },
    {
        id: 4,
        app: 'Canva',
        category: 'Design Tool',
        riskLevel: 'Low',
        users: 12,
        dataAccessed: 'Images',
        lastActivity: '3 days ago',
        status: 'Active',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg'
    },
    {
        id: 5,
        app: 'Telegram',
        category: 'Messaging',
        riskLevel: 'High',
        users: 17,
        dataAccessed: 'Unknown',
        lastActivity: '6 hrs ago',
        status: 'Active',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg'
    }
];

export const catalogData = [
    {
        id: 1,
        name: 'Figma',
        vendor: 'Figma Inc.',
        category: 'Design',
        department: 'Product Design',
        purchase: 'Jan 15, 2024',
        renewal: 'Feb 15, 2025',
        cost: '₹1,440/year',
        licenses: 18,
        totalLicenses: 20,
        status: 'Expiring Soon',
        bgColor: 'bg-orange-50',
        progressColor: 'bg-orange-500',
        statusColor: 'text-orange-600',
        renewalColor: 'text-orange-600',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg'
    },
    {
        id: 2,
        name: 'Slack Business+',
        vendor: 'Slack Technologies',
        category: 'Communication',
        department: 'Company-wide',
        purchase: 'Mar 1, 2024',
        renewal: 'Mar 1, 2025',
        cost: '₹960/month',
        licenses: 245,
        totalLicenses: 250,
        status: 'Active',
        bgColor: 'bg-white',
        progressColor: 'bg-green-500',
        statusColor: 'text-green-600',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg'
    },
    {
        id: 3,
        name: 'Jira Software',
        vendor: 'Atlassian',
        category: 'Development',
        department: 'Engineering',
        purchase: 'Oct 10, 2023',
        renewal: 'Oct 10, 2024',
        cost: '₹840/month',
        licenses: 35,
        totalLicenses: 50,
        status: 'Active',
        bgColor: 'bg-white',
        progressColor: 'bg-green-500',
        statusColor: 'text-green-600',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Jira_Logo.svg'
    },
    {
        id: 4,
        name: 'Adobe Creative Cloud',
        vendor: 'Adobe Inc.',
        category: 'Design',
        department: 'Marketing',
        purchase: 'Aug 20, 2023',
        renewal: 'Aug 20, 2024',
        cost: '₹2,400/year',
        licenses: 12,
        totalLicenses: 15,
        status: 'Active',
        bgColor: 'bg-white',
        progressColor: 'bg-green-500',
        statusColor: 'text-green-600',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Creative_Cloud.svg'
    },
    {
        id: 5,
        name: 'Notion Team',
        vendor: 'Notion Labs',
        category: 'Productivity',
        department: 'Product',
        purchase: 'Nov 5, 2024',
        renewal: 'Feb 5, 2025',
        cost: '₹240/month',
        licenses: 8,
        totalLicenses: 10,
        status: 'Trial',
        bgColor: 'bg-blue-50',
        progressColor: 'bg-blue-500',
        statusColor: 'text-blue-600',
        renewalColor: 'text-blue-600',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png'
    },
    {
        id: 6,
        name: 'Zoom Pro',
        vendor: 'Zoom Video',
        category: 'Communication',
        department: 'Sales',
        purchase: 'Jun 1, 2023',
        renewal: 'Jan 1, 2025',
        cost: '₹180/month',
        licenses: 0,
        totalLicenses: 25,
        status: 'Expired',
        bgColor: 'bg-red-50',
        progressColor: 'bg-red-500',
        statusColor: 'text-red-600',
        renewalColor: 'text-red-600',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Zoom_Communications_Logo.svg'
    },
    {
        id: 7,
        name: 'GitHub Enterprise',
        vendor: 'GitHub Inc.',
        category: 'Development',
        department: 'Engineering',
        purchase: 'Sep 12, 2023',
        renewal: 'Sep 12, 2025',
        cost: '₹2,100/year',
        licenses: 42,
        totalLicenses: 50,
        status: 'Active',
        bgColor: 'bg-white',
        progressColor: 'bg-green-500',
        statusColor: 'text-green-600',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg'
    },
    {
        id: 8,
        name: 'Salesforce CRM',
        vendor: 'Salesforce.com',
        category: 'Sales',
        department: 'Sales',
        purchase: 'Apr 5, 2024',
        renewal: 'Apr 5, 2025',
        cost: '₹3,600/year',
        licenses: 28,
        totalLicenses: 30,
        status: 'Active',
        bgColor: 'bg-white',
        progressColor: 'bg-green-500',
        statusColor: 'text-green-600',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg'
    }
];