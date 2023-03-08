/** @type {import('next').NextConfig} */
const redirectCfg =[
  {
    source: '/',
    destination: '/index.html',
    permanent: true,
  },
  {
    source: '/about',
    destination: '/index.html',
    permanent: true,
  },
  {
    source: '/pkgParse/:path*',
    destination: 'https://cdn.jsdelivr.net/:path*/',
    permanent: false,
  },
  {
    source: '/repoParse/:path*',
    destination: 'https://github.com/:path*',
    permanent: false,
  }
]
const nextConfig = {
  reactStrictMode: true,
  async redirects(){
    return redirectCfg;
  }
}

module.exports = nextConfig;
