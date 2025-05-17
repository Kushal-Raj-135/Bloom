// GROQ API configuration
const GROQ_API_KEY = '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'; // Replace with your actual API key
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// DOM elements
const searchInput = document.getElementById('medicineSearch');
const searchButton = document.getElementById('searchButton');
const suggestionsDiv = document.getElementById('suggestions');
const resultsContainer = document.getElementById('resultsContainer');
const resultsList = document.getElementById('resultsList');
const loadingDiv = document.getElementById('loading');

// Configuration
const API_MAX_RETRIES = 2;
const DEBOUNCE_DELAY = 500;
const MIN_QUERY_LENGTH = 3;

// Debounce function with cleanup
let debounceTimer;
function debounce(func, delay) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(func, delay);
}

// Enhanced fetch suggestions with improved validation
async function fetchSuggestions(query) {
    if (!query || query.trim().length < MIN_QUERY_LENGTH) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    let retries = API_MAX_RETRIES;
    const cleanQuery = query.trim();

    while (retries > 0) {
        try {
            const response = await fetch(GROQ_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    response_format: { type: "json_object" },
                    messages: [
                        {
                            role: 'system',
                            content: `Respond with JSON array of medicine suggestions under 'suggestions' key.
                            Example: { "suggestions": [{ "name": "Brand", "generic": "Generic" }] }
                            Rules:
                            1. Max 5 items
                            2. Include similar spelling variations
                            3. Return empty array if unsure
                            4. Only valid JSON
                            5. No extra text
                            6. Max 5 items
                            7. Ensure proper closing brackets`
                        },
                        {
                            role: 'user',
                            content: `Suggest medicines similar to: ${cleanQuery}`
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 200
                })
            });

            const responseData = await handleApiResponse(response);
            const parsedData = processApiResponse(responseData);
            
            if (!parsedData.suggestions) {
                throw new Error('Invalid suggestions response format');
            }
            
            const suggestions = validateSuggestions(parsedData.suggestions);
            displaySuggestions(suggestions);
            return;
        } catch (error) {
            console.error('Suggestions error:', error);
            retries--;
            if (retries === 0) {
                showTemporaryMessage('Could not load suggestions. Please try different keywords.');
                suggestionsDiv.style.display = 'none';
            }
        }
    }
}

// Response sanitization utilities
function sanitizeJsonResponse(rawContent) {
    try {
        // Remove JSON code blocks and trim whitespace
        return rawContent
            .replace(/```(json)?/gi, '')
            .replace(/^[^{[]*/, '') // Remove non-JSON prefixes
            .replace(/[^}\]]*$/, '') // Remove non-JSON suffixes
            .trim();
    } catch (e) {
        throw new Error('Failed to sanitize JSON response');
    }
}

// Updated validation
function validateSuggestions(suggestions) {
    if (!Array.isArray(suggestions)) {
        throw new Error('Invalid suggestions format: Expected array');
    }
    
    return suggestions.filter(item => {
        // Require at least name property
        if (!item.name || typeof item.name !== 'string') return false;
        // Validate generic if present
        if (item.generic && typeof item.generic !== 'string') return false;
        return true;
    }).slice(0, 5);
}

// Display suggestions safely
function displaySuggestions(suggestions) {
    suggestionsDiv.innerHTML = '';
    
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    const fragment = document.createDocumentFragment();
    
    suggestions.forEach(medicine => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `
            <strong>${escapeHtml(medicine.name)}</strong>
            ${medicine.generic ? `<small>(${escapeHtml(medicine.generic)})</small>` : ''}
        `;

        item.addEventListener('click', () => {
            searchInput.value = medicine.name;
            suggestionsDiv.style.display = 'none';
            searchMedicine(medicine.name);
        });

        fragment.appendChild(item);
    });

    suggestionsDiv.appendChild(fragment);
    suggestionsDiv.style.display = 'block';
}

async function searchMedicine(query) {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;
    loadingDiv.style.display = 'block';
    resultsContainer.style.display = 'none';
    resultsList.innerHTML = '';

        try {
            const response = await fetch(GROQ_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    response_format: { type: "json_object" },
                    messages: [
                        {
                            role: 'system',
                            content: `
                            Analyze the input as a potential medicine name. Follow these steps:  

                            1. Validation: 
                                Check against WHO/FDA/EMA databases. Confirm it is a regulated pharmaceutical product.  
                                Reject if: misspelled, dietary supplement, unapproved compound, or ambiguous term.  

                            2. Data Rules:  
                                Provide medicine info in JSON format
                                Convert lists to arrays

                            3. Response Logic:   
                                {  
                                    "status": "not_found"  
                                }  
                                if uncertain. Otherwise:
                                {
                                    "name": "string",
                                    "genericName": "string",
                                    "dosageForms": ["string"],
                                    "strengths": ["string"],
                                    "sideEffects": ["string"],
                                    "manufacturer": "string?",
                                    "therapeuticClass": "string?",
                                    "description": "string?"
                                }

                                Edge Case Protocol:

                                Misspelled (e.g., "Paracetamoll"): → { "status": "not_found" } 

                                Generic exists but brand unclear (e.g., "Cephalexin"): Return generic data

                                Ambiguous (e.g., "Vitamin B12"): → { "status": "not_found" }  (unless specified as prescription-grade)
                            `
                        },
                        {
                            role: 'user',
                            content: `Provide information about: ${cleanQuery}`
                        }
                    ],
                    temperature: 0.2,
                    max_tokens: 500
                })
            });

            const responseData = await handleApiResponse(response);
            const medicineData = processApiResponse(responseData);
            console.log(medicineData,cleanQuery)
            // Handle not_found status
            if (medicineData.status === 'not_found') {
                throw new Error('MEDICINE_NOT_FOUND');
            }

            const validatedData = validateMedicineData(medicineData);
            displayResults(validatedData);
            return;
        } catch (error) {
            console.error('Search error:', error);
            if (error.message === 'MEDICINE_NOT_FOUND') {
                const suggestion = await suggestMedicineClosestTo(cleanQuery);
                console.log(suggestion)
                if ( suggestion != null ) {
                        searchMedicine(suggestion);
                }
                else {
                    displayError({
                        message: `No results found for "${cleanQuery}"`,
                        query: cleanQuery,
                    });
                }
            }
        } finally {
            loadingDiv.style.display = 'none';
            resultsContainer.style.display = 'block';
        }
    
}

// Error recovery and fallback
async function suggestMedicineClosestTo(query) {
    console.log('Attempting error recovery for:', query);
    
    try {
        // Try partial match fallback
        const response = await fetch(GROQ_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{
                    role: 'system',
                    content: `Find closest matching medicine name for "${query}". Respond with JSON: { "suggestion": "string" }. If uncertain, return: 
                            { "status": "not_found" }`
                }]
            })
        });

        const suggestionData = processApiResponse(await handleApiResponse(response));
        if ( suggestionData.status === "not_found"){
            return null;
        }
        if (suggestionData.suggestion) {
            return suggestionData.suggestion;
        }
    } catch (fallbackError) {
        console.error('Fallback search failed:', fallbackError);
    }
    return null;
}

// Modified processApiResponse
function processApiResponse(responseData) {
    try {
        const rawContent = responseData.choices[0].message.content;
        const cleanContent = sanitizeJsonResponse(rawContent);
        const data = JSON.parse(cleanContent);
        
        // Return raw data without validation
        return data;
    } catch (error) {
        console.error('Response processing failed:', error);
        throw new Error('Invalid API response format');
    }
}

// Enhanced validation with type conversion
function validateMedicineData(medicine) {
    const requiredFields = ['name', 'genericName'];
    const missingFields = requiredFields.filter(field => !medicine[field]);
    
    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Convert string values to arrays
    const arrayFields = ['dosageForms', 'strengths', 'sideEffects'];
    arrayFields.forEach(field => {
        if (medicine[field]) {
            if (typeof medicine[field] === 'string') {
                medicine[field] = medicine[field].split(/,\s*/);
            }
            if (!Array.isArray(medicine[field])) {
                medicine[field] = [medicine[field]];
            }
        }
    });

    // Validate field types
    const fieldTypes = {
        dosageForms: 'array',
        strengths: 'array',
        sideEffects: 'array',
        manufacturer: 'string',
        therapeuticClass: 'string',
        description: 'string'
    };

    Object.entries(fieldTypes).forEach(([field, type]) => {
        if (medicine[field] && typeof medicine[field] !== type) {
            if (!(type === 'array' && Array.isArray(medicine[field]))) {
                console.warn(`Type mismatch for ${field}:`, medicine[field]);
                delete medicine[field];
            }
        }
    });

    return medicine;
}



// Display results with optional fields
function displayResults(medicine) {
    const fieldMap = [
        { label: 'Dosage Forms', value: medicine.dosageForms, type: 'array' },
        { label: 'Strengths', value: medicine.strengths, type: 'array' },
        { label: 'Manufacturer', value: medicine.manufacturer },
        { label: 'Therapeutic Class', value: medicine.therapeuticClass },
        { label: 'Common Side Effects', value: medicine.sideEffects, type: 'array' },
        { label: 'Description', value: medicine.description, type: 'paragraph' }
    ];

    resultsList.innerHTML = `
        <div class="medicine-result">
            <div class="medicine-name">${escapeHtml(medicine.name)}</div>
            ${medicine.genericName ? `
                <div class="medicine-generic">
                    <strong>Generic:</strong> ${escapeHtml(medicine.genericName)}
                </div>` : ''}
            <div class="medicine-details">
                ${fieldMap.map(field => {
                    if (!field.value || (Array.isArray(field.value) && field.value.length === 0)) return '';
                    return field.type === 'array' 
                        ? formatArrayField(field.label, field.value)
                        : formatField(field.label, field.value, field.type === 'paragraph');
                }).join('')}
            </div>
        </div>
    `;
}

// Enhanced error handling
async function handleApiResponse(response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error?.message || await response.text();
        throw new Error(`API Error ${response.status}: ${message.slice(0, 150)}`);
    }
    
    const data = await response.json();
    
    if (!data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid API response structure');
    }
    
    return data;
}

// Update the displayError function:
function displayError(error) {
    resultsList.innerHTML = `
        <div class="medicine-result error">
            <div class="medicine-name">⚠️ ${escapeHtml(error.query)}</div>
            <div class="medicine-details">
                <div class="detail-item">
                    <span class="detail-label">Error:</span>
                    <span>${escapeHtml(error.message)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Suggestions:</span>
                    <ul>
                        <li>Check spelling</li>
                        <li>Use generic names</li>
                        <li>Consult pharmacist</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// Safe HTML rendering
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    const text = unsafe.toString();
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Display helpers
function formatField(label, value, isParagraph = false) {
    if (!value) return '';
    const content = isParagraph ? `<p>${escapeHtml(value)}</p>` : escapeHtml(value);
    return `
        <div class="detail-item">
            <span class="detail-label">${label}:</span>
            ${content}
        </div>
    `;
}

function formatArrayField(label, values) {
    if (!values || !Array.isArray(values) || values.length === 0) return '';
    return `
        <div class="detail-item">
            <span class="detail-label">${label}:</span>
            <span>${values.map(v => escapeHtml(v)).join(', ')}</span>
        </div>
    `;
}

// Event listeners with enhanced validation
searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    if (query.length >= MIN_QUERY_LENGTH) {
        debounce(() => fetchSuggestions(query), DEBOUNCE_DELAY);
    } else {
        suggestionsDiv.style.display = 'none';
    }
});

searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) searchMedicine(query);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
        searchMedicine(searchInput.value.trim());
    }
});

document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target)) {
        suggestionsDiv.style.display = 'none';
    }
});

// Utility function for temporary messages
function showTemporaryMessage(message, duration = 3000) {
    const msgElement = document.createElement('div');
    msgElement.className = 'temp-message';
    msgElement.textContent = message;
    document.body.appendChild(msgElement);
    
    setTimeout(() => {
        msgElement.remove();
    }, duration);
}