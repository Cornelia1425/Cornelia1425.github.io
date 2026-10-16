// Preserve links to the original portfolio after the 3D view becomes home.
(() => {
  const routes = new Set([
    '/', '/axie-gallery', '/architecture', '/digital-fabrication',
    '/developer', '/contact', '/about', '/graphic-design',
  ]);
  function redirectLegacyRoute() {
    if (!location.hash.startsWith('#/')) return;
    const pathname = location.hash.slice(1).split('?')[0].replace(/\/$/, '') || '/';
    if (routes.has(pathname)) {
      location.replace('/2d/' + location.search + location.hash);
    }
  }
  redirectLegacyRoute();
  window.addEventListener('hashchange', redirectLegacyRoute);
})();
