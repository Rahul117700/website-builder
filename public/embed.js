(function () {
    function initEmbeds() {
        // 1. Find all links that match the pattern /f/[funnelId]
        const links = document.querySelectorAll('a[href*="/f/"]');

        links.forEach(link => {
            // Check if it's a funnel link (basic check)
            if (link.href.includes('/f/') && !link.dataset.processed) {
                link.dataset.processed = 'true';
                createCard(link);
            }
        });

        // 2. Look for explicit embed containers
        const embeds = document.querySelectorAll('[data-funnel-id]');
        embeds.forEach(container => {
            if (!container.dataset.processed) {
                container.dataset.processed = 'true';
                const funnelId = container.dataset.funnelId;
                const origin = container.dataset.origin || 'https://sell-earn-direct.vercel.app'; // Fallback or dynamic
                // Render iframe
                renderIframe(container, `${origin}/f/${funnelId}?embed=true`);
            }
        });
    }

    function createCard(linkElement) {
        const url = linkElement.href;
        // Create a container div
        const container = document.createElement('div');
        linkElement.parentNode.insertBefore(container, linkElement);
        linkElement.style.display = 'none'; // Hide original link

        // Render iframe in container
        renderIframe(container, `${url}?embed=true`);
    }

    function renderIframe(container, src) {
        const iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.style.width = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '12px';
        iframe.style.overflow = 'hidden';
        iframe.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        iframe.style.minHeight = '200px'; // Default height, ideally dynamic sizing
        iframe.height = '450'; // Fixed height for card view

        container.appendChild(iframe);
    }

    // Run on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEmbeds);
    } else {
        initEmbeds();
    }
})();
