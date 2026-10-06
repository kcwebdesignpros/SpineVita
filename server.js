const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const services = require('./views/data/services');
const blogPosts = require('./views/data/blog');
const { icon } = require('./views/data/icons');

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_URL = process.env.SITE_URL || 'https://spinevitakc.com';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Make the SVG icon helper available to every template
app.locals.icon = icon;

const businessInfo = {
  name: 'SpineVita Chiropractic',
  legalName: 'SpineVita Chiropractic, LLC',
  phone: '+1-816-555-0142',
  phoneDisplay: '(816) 555-0142',
  email: 'hello@spinevitakc.com',
  address: {
    street: '1200 Country Club Blvd',
    city: 'Kansas City',
    state: 'MO',
    zip: '64113',
    country: 'US'
  },
  hours: {
    mon: '08:00-18:00',
    tue: '08:00-18:00',
    wed: '08:00-18:00',
    thu: '08:00-18:00',
    fri: '08:00-18:00',
    sat: '09:00-14:00',
    sun: 'Closed'
  },
  social: {
    facebook: 'https://facebook.com/spinevitakc',
    instagram: 'https://instagram.com/spinevitakc',
    x: 'https://x.com/spinevitakc',
    youtube: 'https://youtube.com/spinevitakc'
  }
};

const fullAddress = `${businessInfo.address.street}, ${businessInfo.address.city}, ${businessInfo.address.state} ${businessInfo.address.zip}`;

function pageData(req, overrides = {}) {
  return {
    siteUrl: SITE_URL,
    business: businessInfo,
    fullAddress,
    path: req.path,
    year: new Date().getFullYear(),
    ...overrides
  };
}

// Home
app.get('/', (req, res) => {
  res.render('pages/index', pageData(req, {
    title: 'SpineVita Chiropractic | Kansas City Chiropractor & Wellness Care',
    description: 'SpineVita is Kansas City\'s trusted chiropractic clinic. We provide auto accident injury care, sciatica relief, headache treatment, sports rehab, prenatal care and spinal decompression. Book your first visit today.',
    ogImage: `${SITE_URL}/images/hero.webp`,
    canonical: `${SITE_URL}/`,
    services,
    posts: blogPosts,
    faqs: [
      { q: 'Is chiropractic treatment safe?', a: 'Yes. Chiropractic care is widely recognized as one of the safest non-invasive, drug-free therapies for neuromusculoskeletal complaints. Every adjustment is preceded by a thorough exam to ensure it is the right approach for your specific condition.' },
      { q: 'How many visits will I need?', a: 'It depends on your condition, how long you have had it, and your overall health. Many patients feel meaningful relief within 4 to 8 visits. After your initial assessment, we will give you a clear, written treatment plan with an estimated timeline.' },
      { q: 'Do you accept my insurance?', a: 'We accept most major insurance plans including BlueCross BlueShield, UnitedHealthcare, Aetna, Cigna, Humana, and Medicare. We also handle auto-accident injury claims on a lien basis with no upfront cost for qualifying cases.' },
      { q: 'What should I expect at my first appointment?', a: 'Your first visit takes about 45 to 60 minutes. We start with a consultation, then perform a physical exam including posture analysis and range-of-motion testing. In most cases you will receive your first gentle adjustment on the same day.' },
      { q: 'Is a chiropractic adjustment painful?', a: 'Most patients feel immediate relief after an adjustment, not pain. Some patients experience mild soreness for a day afterward, similar to post-workout soreness. We also offer low-force and instrument-assisted techniques that are extremely gentle.' },
      { q: 'Can you help with auto-accident injuries?', a: 'Absolutely. Auto-accident injuries such as whiplash, neck pain and back pain are one of our specialties. We work on a lien basis, meaning we defer payment until your case settles, so there is no upfront cost to you.' }
    ]
  }));
});

// About
app.get('/about', (req, res) => {
  res.render('pages/about', pageData(req, {
    title: 'About SpineVita | Kansas City Chiropractic Team',
    description: 'Meet the SpineVita chiropractic team in Kansas City. Learn about our patient-centered philosophy, advanced techniques, and commitment to helping you move better and live pain-free.',
    ogImage: `${SITE_URL}/images/about.webp`,
    canonical: `${SITE_URL}/about`
  }));
});

// Services overview
app.get('/services', (req, res) => {
  res.render('pages/services', pageData(req, {
    title: 'Our Chiropractic Services | SpineVita Kansas City',
    description: 'Explore SpineVita\'s chiropractic services in Kansas City: auto accident care, sciatica, headaches, sports rehab, prenatal care, and spinal decompression.',
    ogImage: `${SITE_URL}/images/service-decompression.webp`,
    canonical: `${SITE_URL}/services`,
    services
  }));
});

// Service detail pages
services.forEach(service => {
  app.get(`/services/${service.id}`, (req, res) => {
    const related = services.filter(s => s.id !== service.id).slice(0, 3);
    res.render('pages/service-detail', pageData(req, {
      title: `${service.title} | SpineVita Kansas City`,
      description: `${service.summary} Schedule an appointment with SpineVita in Kansas City.`,
      ogImage: `${SITE_URL}${service.image}`,
      canonical: `${SITE_URL}/services/${service.id}`,
      service,
      related
    }));
  });
});

// How it works / process
app.get('/how-it-works', (req, res) => {
  res.render('pages/process', pageData(req, {
    title: 'How Chiropractic Care Works | SpineVita Kansas City',
    description: 'Discover the SpineVita care process: consultation, personalized treatment plan, and ongoing wellness support for lasting relief in Kansas City.',
    ogImage: `${SITE_URL}/images/about.webp`,
    canonical: `${SITE_URL}/how-it-works`
  }));
});

// Blog overview
app.get('/blog', (req, res) => {
  res.render('pages/blog', pageData(req, {
    title: 'SpineVita Blog | Chiropractic, Wellness & Recovery Tips',
    description: 'Read the SpineVita blog for expert chiropractic tips, posture advice, recovery guides, and wellness insights from our Kansas City care team.',
    ogImage: `${SITE_URL}/images/blog-habits.webp`,
    canonical: `${SITE_URL}/blog`,
    posts: blogPosts
  }));
});

// Blog detail pages
blogPosts.forEach(post => {
  app.get(`/blog/:slug(${post.id})`, (req, res) => {
    const related = blogPosts.filter(p => p.id !== post.id).slice(0, 3);
    res.render('pages/blog-post', pageData(req, {
      title: `${post.title} | SpineVita Blog`,
      description: post.excerpt,
      ogImage: `${SITE_URL}${post.image}`,
      canonical: `${SITE_URL}/blog/${post.id}`,
      post,
      related
    }));
  });
});

// Contact
app.get('/contact', (req, res) => {
  res.render('pages/contact', pageData(req, {
    title: 'Contact SpineVita | Book an Appointment in Kansas City',
    description: 'Contact SpineVita Chiropractic in Kansas City. Call (816) 555-0142, email hello@spinevitakc.com, or book your appointment online today.',
    ogImage: `${SITE_URL}/images/about.webp`,
    canonical: `${SITE_URL}/contact`
  }));
});

app.post('/contact', (req, res) => {
  res.render('pages/contact', pageData(req, {
    title: 'Thank You | SpineVita Kansas City',
    description: 'Thank you for contacting SpineVita Chiropractic in Kansas City. We will respond to your message within one business day.',
    canonical: `${SITE_URL}/contact`,
    submitted: true
  }));
});

// Privacy Policy
app.get('/privacy-policy', (req, res) => {
  res.render('pages/privacy', pageData(req, {
    title: 'Privacy Policy | SpineVita Kansas City',
    description: 'Read the SpineVita Chiropractic privacy policy to learn how we protect your personal and health information.',
    canonical: `${SITE_URL}/privacy-policy`
  }));
});

// Terms of Service
app.get('/terms-of-service', (req, res) => {
  res.render('pages/terms', pageData(req, {
    title: 'Terms of Service | SpineVita Kansas City',
    description: 'Read the SpineVita Chiropractic terms of service, including website use, disclaimers, and appointment policies.',
    canonical: `${SITE_URL}/terms-of-service`
  }));
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /private

Sitemap: ${SITE_URL}/sitemap.xml`);
});

// Sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const now = new Date().toISOString();
  const staticRoutes = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/about', priority: '0.9', changefreq: 'monthly' },
    { url: '/services', priority: '0.9', changefreq: 'weekly' },
    { url: '/how-it-works', priority: '0.8', changefreq: 'monthly' },
    { url: '/blog', priority: '0.8', changefreq: 'weekly' },
    { url: '/contact', priority: '0.9', changefreq: 'monthly' },
    { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
    { url: '/terms-of-service', priority: '0.3', changefreq: 'yearly' }
  ];

  let urls = staticRoutes.map(route => `  <url>\n    <loc>${SITE_URL}${route.url}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`);

  services.forEach(service => {
    urls.push(`  <url>\n    <loc>${SITE_URL}/services/${service.id}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`);
  });

  blogPosts.forEach(post => {
    urls.push(`  <url>\n    <loc>${SITE_URL}/blog/${post.id}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>yearly</changefreq>\n    <priority>0.6</priority>\n  </url>`);
  });

  res.header('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`);
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('pages/404', pageData(req, {
    title: 'Page Not Found | SpineVita Kansas City',
    description: 'The page you are looking for could not be found. Return to SpineVita Chiropractic in Kansas City.',
    canonical: `${SITE_URL}/404`
  }));
});

// Only start the HTTP server when this file is run directly.
// build.js imports the app to prerender every route to static HTML.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SpineVita server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
