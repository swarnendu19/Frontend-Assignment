/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://user-details-pdf-app.vercel.app',
    generateRobotsTxt: true,
    generateIndexSitemap: false,
    exclude: ['/api/*'],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
            },
        ],
    },
};