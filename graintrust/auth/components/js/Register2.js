let web3;
let contract;
const contractAddress = "0x1fbce5764d704aefabfacd1602c8b5116abc1fcb";
const abi = [
    {
        "inputs": [
            {"internalType":"string","name":"_drugcode","type":"string"},
            {"internalType":"string","name":"_drugname","type":"string"},
            {"internalType":"string","name":"_dosage","type":"string"},
            {"internalType":"string","name":"_sideeffect","type":"string"},
            {"internalType":"string","name":"_proddate","type":"string"},
            {"internalType":"string","name":"_expirydate","type":"string"}
        ],
        "name":"addDrug",
        "outputs":[],
        "stateMutability":"nonpayable",
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

async function initWeb3() {
    try {
        if (window.ethereum) {
            web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
            contract = new web3.eth.Contract(abi, contractAddress);
            return true;
        }
        showMessage("<i class='fas fa-exclamation-circle'></i> Please install MetaMask to continue!", "danger");
        return false;
    } catch (error) {
        showMessage(`<i class='fas fa-exclamation-circle'></i> Error connecting to wallet: ${error.message}`, "danger");
        return false;
    }
}

async function registerDrug() {
    try {
        document.getElementById("loading").style.display = "block";
        
        // Validate inputs
        const inputs = {
            drugcode: document.getElementById("xdrugcode").value.trim(),
            drugname: document.getElementById("xdrugname").value.trim(),
            dosage: document.getElementById("xdosage").value.trim(),
            sideeffect: document.getElementById("xsideeffect").value.trim(),
            proddate: document.getElementById("xproddate").value.trim(),
            expirydate: document.getElementById("xexpirydate").value.trim()
        };

        // Check for empty fields
        for (const [key, value] of Object.entries(inputs)) {
            if (!value) throw new Error(`Please fill in ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        }

        // Date validation
        const prodDate = new Date(inputs.proddate);
        const expiryDate = new Date(inputs.expirydate);
        if (expiryDate <= prodDate) {
            throw new Error("Expiry date must be after production date");
        }

        // Get current account
        const accounts = await web3.eth.getAccounts();
        const currentAccount = accounts[0];

        // Check company authorization
        const companyName = await contract.methods.getCompany(currentAccount).call();
        if (!companyName) throw new Error("Your account is not authorized to register drugs");

        // Estimate gas with correct 6 parameters
        const gasEstimate = await contract.methods.addDrug(
            inputs.drugcode,
            inputs.drugname,
            inputs.dosage,
            inputs.sideeffect,
            inputs.proddate,
            inputs.expirydate
        ).estimateGas({ from: currentAccount });

        // Send transaction with 6 parameters
        const receipt = await contract.methods.addDrug(
            inputs.drugcode,
            inputs.drugname,
            inputs.dosage,
            inputs.sideeffect,
            inputs.proddate,
            inputs.expirydate
        ).send({
            from: currentAccount,
            gas: Math.floor(gasEstimate * 1.2)
        });

        showMessage(`<i class='fas fa-check-circle'></i> Drug registered successfully! TX Hash: ${receipt.transactionHash.substring(0, 12)}...`, "success");
        document.getElementById("drugForm").reset();

    } catch (error) {
        showMessage(`<i class='fas fa-times-circle'></i> Registration failed: ${error.message}`, "danger");
        console.error(error);
    } finally {
        document.getElementById("loading").style.display = "none";
    }
}

function showMessage(message, type = "info") {
    const alertDiv = document.getElementById("metamask");
    alertDiv.innerHTML = message;
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.display = "block";
    
    setTimeout(() => {
        alertDiv.style.animation = "slideIn 0.3s reverse forwards";
        setTimeout(() => {
            alertDiv.style.display = "none";
            alertDiv.style.animation = "";
        }, 300);
    }, 5000);
}

// Initialize on load
window.addEventListener('load', async () => {
    if (await initWeb3()) {
        // Check authorization status
        const accounts = await web3.eth.getAccounts();
        try {
            const companyName = await contract.methods.getCompany(accounts[0]).call();
            if (!companyName) {
                showMessage("<i class='fas fa-exclamation-triangle'></i> Unauthorized access. Only registered companies can add drugs.", "warning");
                document.querySelector("button").disabled = true;
            }
        } catch (error) {
            showMessage("<i class='fas fa-exclamation-circle'></i> Error checking authorization status", "danger");
        }
    }
});

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

    input.value = cleaned.slice(0, 13);
}