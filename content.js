const data = {};

document.addEventListener('WindowRunParamsData', function(e) {
    data.priceComponent = e.detail.data.priceComponent;
});

function injectScript(file_path, tag) {
    var node = document.getElementsByTagName(tag)[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file_path);
    node.appendChild(script);
}

injectScript(chrome.runtime.getURL('web_accessible_script.js'), 'body');

function injectCopyButtons() {
    document.querySelectorAll('[data-sku-col][class*="sku-item--selected"]').forEach(skuColElement => {
        let copyBtn = skuColElement.querySelector('.copy-link-btn'); // Check if the button already exists

        if (!copyBtn) {
            copyBtn = document.createElement('button');
            copyBtn.textContent = 'Copy';
            copyBtn.classList.add('copy-link-btn'); // Add a class for styling and identification

            // Add click event listener for copying the product link
            copyBtn.addEventListener('click', () => {
                const productUrlMatch = window.location.href.match(/.*(aliexpress.*\.html)/);
                if (productUrlMatch) {
                    const productUrl = `https://${productUrlMatch[1]}`;
                    const selectedSkuCol = skuColElement.getAttribute('data-sku-col').replace("-", ":");
                    const skuJson = JSON.parse(data.priceComponent.skuJson);
                    const selectedSku = skuJson.find(i => i.skuAttr.includes(selectedSkuCol));

                    if (selectedSku) {
                        const linkToCopy = `${productUrl}?skuId=${selectedSku.skuIdStr}`;
                        navigator.clipboard.writeText(linkToCopy)
                            .then(() => alert('Link copied to clipboard!'))
                            .catch(err => console.error('Error copying link to clipboard:', err));
                    }
                }
            });

            skuColElement.appendChild(copyBtn);
        }
    });
}

// MutationObserver to handle dynamic changes
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
            injectCopyButtons(); // Re-inject copy buttons to account for class changes
        }
    });
});

observer.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ['class']
});

injectCopyButtons();
