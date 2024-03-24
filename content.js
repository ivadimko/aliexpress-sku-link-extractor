const data = {};

document.addEventListener('WindowRunParamsData', function(e) {
    data.priceComponent = e.detail.data.priceComponent;
});

function injectScript(file_path, tag) {
    const node = document.getElementsByTagName(tag)[0];
    const script = document.createElement('script');
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
                const skuJson = JSON.parse(data.priceComponent.skuJson);
                const productUrlMatch = window.location.href.match(/.*(aliexpress.*\.html)/);

                if (productUrlMatch) {
                    const productUrl = `https://${productUrlMatch[1]}`;
                    // get all selected elements
                    const allSelectedElements = Array.from(document.querySelectorAll('[data-sku-col][class*="sku-item--selected"]'));

                    const attrValuesArray = allSelectedElements.map(sel => sel.getAttribute('data-sku-col').replace('-', ':'));

                    // find element that stands for all selected parameters
                    const selectedSku = skuJson.find((jsonItem) => {
                        return attrValuesArray.every((attrValue) => jsonItem.skuAttr.includes(attrValue));
                    });

                    if (selectedSku) {
                        const linkToCopy = `${productUrl}?skuAttr=${encodeURIComponent(selectedSku.skuAttr)}&skuId=${encodeURIComponent(selectedSku.skuIdStr)}`;
                        navigator.clipboard.writeText(linkToCopy)
                            .then(() => {
                                copyBtn.textContent = 'Copied!';
                                setTimeout(() => copyBtn.textContent = 'Copy', 1000);
                            })
                            .catch(err => console.error('Error copying link to clipboard:', err));
                    } else {
                        console.error('item mot found in skuJson')
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
