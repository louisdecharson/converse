// Provider & Model selection
const providerSelect = document.getElementById('provider-select');
const modelSelect = document.getElementById('model-select');

// get list of models
let models;
const getModels = async () => {
    models = await window.electronAPI.getModels();

    // Populate providers
    for (const provider in models) {
        const option = document.createElement('option');
        option.value = provider;
        option.textContent = provider;
        providerSelect.appendChild(option);
        if (option.value == providerSelect.getAttribute('data-default')) {
            option.selected = true;
        }
    }
    updateModels();
};

// Function to populate models based on selected provider
const updateModels = () => {
    const selectedProvider = providerSelect.value;
    modelSelect.innerHTML = '';
    if (selectedProvider && models[selectedProvider]) {
        const providerModels = models[selectedProvider];
        providerModels.forEach((model) => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            if (option.value == modelSelect.getAttribute('data-default')) {
                option.selected = true;
            }

            modelSelect.appendChild(option);
        });
    }
};

// Populate the providers when the document loads
getModels();

// Add event listener to update models when a provider is selected
providerSelect.addEventListener('change', updateModels);
