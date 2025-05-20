const CONFIG = {
    CONTRACT_ADDRESS: "0x1fbce5764d704aefabfacd1602c8b5116abc1fcb",
    NETWORK_ID: 11155111,
    DRUG_CODE_FORMAT: /^\d{4,5}-\d{3,4}-\d{2}$/,
};

const abi = [
    {
        "inputs": [{"internalType":"address","name":"_address","type":"address"},{"internalType":"string","name":"_companyname","type":"string"}],
        "name":"setCompany",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
    },
    {
        "inputs": [{"internalType":"string","name":"_drugcode","type":"string"},{"internalType":"string","name":"_drugname","type":"string"},{"internalType":"string","name":"_dosage","type":"string"},{"internalType":"string","name":"_sideeffect","type":"string"},{"internalType":"string","name":"_proddate","type":"string"},{"internalType":"string","name":"_expirydate","type":"string"}],
        "name":"addDrug",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
    },
    {
        "inputs":[{"internalType":"string","name":"code","type":"string"}],
        "name":"getDrug",
        "outputs":[
            {"internalType":"string","name":"","type":"string"},
            {"internalType":"string","name":"","type":"string"},
            {"internalType":"string","name":"","type":"string"},
            {"internalType":"string","name":"","type":"string"},
            {"internalType":"string","name":"","type":"string"},
            {"internalType":"address","name":"","type":"address"},
            {"internalType":"uint256","name":"","type":"uint256"}
        ],
        "stateMutability":"view",
        "type":"function"
    },
    {
        "inputs":[{"internalType":"address","name":"_address","type":"address"}],
        "name":"getCompany",
        "outputs":[{"internalType":"string","name":"","type":"string"}],
        "stateMutability":"view",
        "type":"function"
    }
];

let web3, contract;

async function initWeb3() {
    showLoading(true);
    try {
        if (!window.ethereum) throw new Error('Please install MetaMask!');
        
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const chainId = await web3.eth.getChainId();
        if (chainId !== CONFIG.NETWORK_ID) {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }]
            });
        }

        contract = new web3.eth.Contract(abi, CONFIG.CONTRACT_ADDRESS);
        updateNetworkStatus(chainId);
    } catch (error) {
        showAlert(`Initialization Error: ${error.message}`, 'danger');
    } finally {
        showLoading(false);
    }
}

async function verifyDrug() {
    showLoading(true);
    try {
        const drugCode = sanitizeInput(document.getElementById('drugCodeInput').value);
        
        // Validate drug code format
        if (!validateDrugCode(drugCode)) {
            throw new Error('Invalid drug code format');
        }
        clearPreviousResults()
        // Get drug data from blockchain
        const drugData = await contract.methods.getDrug(drugCode).call();
        
        if (!drugData || drugData[0] === "") {
            throw new Error('Drug not found in registry');
        }
        
        displayDrugDetails(drugCode, drugData);
        await displayManufacturerInfo(drugData[5]);
    } catch (error) {
        showAlert(`Verification Failed: ${error.message}`, 'danger');
        hideSections();
    } finally {
        showLoading(false);
    }
}

function displayDrugDetails(drugCode, drugData) {
    const expiryDate = new Date(drugData[4]);
    const isExpired = expiryDate < new Date();
    
    document.getElementById('drugInfoTable').innerHTML = `
        <tr><th>Drug Code</th><td>${drugCode}</td></tr>
        <tr><th>Name</th><td>${drugData[0]}</td></tr>
        <tr><th>Dosage</th><td>${drugData[1]}</td></tr>
        <tr><th>Side Effects</th><td>${drugData[2]}</td></tr>
        <tr><th>Production Date</th><td>${formatDate(drugData[3])}</td></tr>
        <tr class="${isExpired ? 'text-danger' : ''}">
            <th>Expiry Date</th><td>${formatDate(drugData[4])}</td>
        </tr>
    `;
    
    document.getElementById('drugDetails').style.display = 'block';
}

async function displayManufacturerInfo(manufacturerAddress) {
    try {
        const manufacturerName = await contract.methods.getCompany(manufacturerAddress).call();
        
        document.getElementById('manufacturerDetails').innerHTML = `
            <tr>
                <th>Company Name</th>
                <td>${manufacturerName}</td>
            </tr>
            <tr>
                <th>Blockchain Address</th>
                <td class="eth-address" title="${manufacturerAddress}">
                    ${truncateAddress(manufacturerAddress)}
                    <i class="bi bi-clipboard copy-icon" onclick="copyToClipboard('${manufacturerAddress}')"></i>
                </td>
            </tr>
            <tr>
                <th>Verification Status</th>
                <td><span class="badge bg-success">Approved Manufacturer</span></td>
            </tr>
        `;
        
        document.getElementById('manufacturerInfoCard').style.display = 'block';
    } catch (error) {
        showAlert('Error loading manufacturer details', 'warning');
    }
}

// Helper Functions
// function formatDrugCode(input) {
//     let value = input.value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
//     if (value.length > 3 && value[3] !== '-') {
//         value = value.slice(0, 3) + '-' + value.slice(3);
//     }
//     input.value = value.slice(0, 8);
// }

function countChar(input,char){
    let count = 0;
    for ( let x in input ){
        if ( input.charAt(x) === char ){
            ++count;
        }
    }
    return count;
}

function formatDrugCode(input) {
    // 1. Remove all non-digit characters
    let cleaned = input.value.replace(/[^\d-]/g, '');
    
    if ( countChar(cleaned,'-') == 0 && cleaned.length == 5 ){
        cleaned += '-';
    }
    if ( countChar(cleaned,'-') == 1 && ( cleaned.length - cleaned.indexOf('-') == 5) ){
        cleaned += '-';
    }
    if ( countChar(cleaned,'-') == 2 ){
        let firstIndexOfChar = cleaned.indexOf('-');
        cleaned = cleaned.slice(0,cleaned.indexOf('-',firstIndexOfChar + 1) + 3);
    }
    console.log(`${cleaned}`+" "+`${countChar(cleaned,'-')}`);
    // 4. Limit to max length of 13 (e.g., "12345-6789-12")
    input.value = cleaned.slice(0, 13);
}
function validateDrugCode(code) {
    return CONFIG.DRUG_CODE_FORMAT.test(code) && code.length === 13;
}

function truncateAddress(address) {
    return `${address.slice(0,6)}...${address.slice(-4)}`;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-GB');
}

function sanitizeInput(input) {
    return DOMPurify.sanitize(input).replace(/\s/g, '').toUpperCase();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showAlert('Address copied to clipboard', 'success');
}

function updateNetworkStatus(chainId) {
    const statusElement = document.getElementById('networkStatus');
    statusElement.textContent = `Connected to Sepolia Testnet (Chain ID: ${chainId})`;
    statusElement.parentElement.className = `chain-status alert ${chainId === CONFIG.NETWORK_ID ? 'alert-success' : 'alert-danger'}`;
}



function hideSections() {
    document.getElementById('drugDetails').style.display = 'none';
    document.getElementById('manufacturerInfoCard').style.display = 'none';
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}


function getDrugCodeFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('code');
}

// Auto-verify if code exists in URL
window.addEventListener('load', async () => {
    const drugCode = getDrugCodeFromURL();
    if (drugCode) {
        const cleanCode = DOMPurify.sanitize(drugCode);
        document.getElementById('drugCodeInput').value = cleanCode;
        await initWeb3();
        await verifyDrug();
    }else {
        initWeb3();
    }
});

 function clearPreviousResults() {
    // Remove all existing alerts
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => alert.remove());
    
    // Clear previous data
    document.getElementById('drugInfoTable').innerHTML = '';
    document.getElementById('manufacturerDetails').innerHTML = '';
    
    // Hide sections
    hideSections();
}

// Modified hideSections function
function hideSections() {
    document.getElementById('drugDetails').style.display = 'none';
    document.getElementById('manufacturerInfoCard').style.display = 'none';
}

// Modified showAlert function
function showAlert(message, type = 'info') {
    clearPreviousResults(); // Clear previous alerts
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show mt-3`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.getElementById('drugDetails').prepend(alert);
    document.getElementById('grokContent').innerHTML = '';
    hideGrokResults();
}

