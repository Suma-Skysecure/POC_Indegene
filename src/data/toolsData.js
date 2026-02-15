export const toolsData = [
    {
        id: '983261',
        name: 'PlayStation Network',
        category: 'Consumer / Gaming',
        icon: 'https://cdn.worldvectorlogo.com/logos/playstation-logomark.svg',
        status: 'Approved',
        totalLicenses: 4820,
        available: 2410,
        users: 4820,
        price: 4500.00,
        vendor: 'Sony Interactive Entertainment'
    },
    {
        id: '983262',
        name: 'Steam',
        category: 'Gaming Platform',
        icon: 'https://cdn.worldvectorlogo.com/logos/steam-2.svg',
        status: 'Approved',
        totalLicenses: 6140,
        available: 6080,
        users: 6140,
        price: 0.00,
        vendor: 'Valve Corporation',
        warning: 'Almost full! Only a few licenses available'
    },
    {
        id: '983263',
        name: 'NVIDIA GeForce NOW',
        category: 'Cloud Gaming',
        icon: 'https://cdn.worldvectorlogo.com/logos/nvidia-2.svg',
        status: 'Approved',
        totalLicenses: 3950,
        available: 3670,
        users: 3950,
        price: 1500.00,
        vendor: 'NVIDIA'
    }
];

export const EQUIVALENTS = {
    'xbox': {
        name: 'PlayStation Network',
        alternative: 'alternative found',
        description: 'PlayStation Network is an approved equivalent tool available in our catalogue. Using approved tools speeds up the access process and ensures compliance.'
    },
    'trello': {
        name: 'Jira Software',
        alternative: 'alternative found',
        description: 'Jira Software is our enterprise standard for project management and issue tracking.'
    }
};
