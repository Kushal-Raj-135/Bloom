let web3;
        let contract;
        const contractAddress = "0x1fbce5764d704aefabfacd1602c8b5116abc1fcb";
        const abi = [
            {"inputs":[{"internalType":"address","name":"_address","type":"address"},{"internalType":"string","name":"_companyname","type":"string"}],"name":"setCompany","outputs":[],"stateMutability":"nonpayable","type":"function"},
            {"inputs":[{"internalType":"string","name":"_drugcode","type":"string"},{"internalType":"string","name":"_drugname","type":"string"},{"internalType":"string","name":"_dosage","type":"string"},{"internalType":"string","name":"_sideeffect","type":"string"},{"internalType":"string","name":"_proddate","type":"string"},{"internalType":"string","name":"_expirydate","type":"string"}],"name":"addDrug","outputs":[],"stateMutability":"nonpayable","type":"function"},
            {"inputs":[],"name":"getAllDrugCodes","outputs":[{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},
            {"inputs":[],"name":"getCompanies","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},
            {"inputs":[{"internalType":"address","name":"_address","type":"address"}],"name":"getCompany","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
            {"inputs":[{"internalType":"string","name":"_code","type":"string"}],"name":"getDrug","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
            {"inputs":[],"name":"mdrugCodesLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
        ];

        async function initWeb3() {
            try {
                if (window.ethereum) {
                    web3 = new Web3(window.ethereum);
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    contract = new web3.eth.Contract(abi, contractAddress);
                    return true;
                }
                showAlert("<i class='fas fa-exclamation-circle'></i> Please install MetaMask to access the registry", "danger");
                return false;
            } catch (error) {
                showAlert(`<i class='fas fa-exclamation-circle'></i> Wallet connection failed: ${error.message}`, "danger");
                return false;
            }
        }

        async function loadDrugs() {
            try {
                showLoading(true);
                const drugCodes = await contract.methods.getAllDrugCodes().call();
                const tbody = document.getElementById("drugList");
                tbody.innerHTML = "";

                if (drugCodes.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="8" class="text-center py-4">
                                <i class="fas fa-box-open text-muted" style="font-size: 2rem;"></i>
                                <p class="mt-2">No drugs registered yet</p>
                                <a href="Register2.html" class="btn btn-primary mt-2">
                                    <i class="fas fa-plus"></i> Register First Drug
                                </a>
                            </td>
                        </tr>
                    `;
                    return;
                }

                const drugEntries = await Promise.all(drugCodes.map(async code => {
                    const drugData = await contract.methods.getDrug(code).call();
                    return {
                        code: code,
                        name: drugData[0],
                        dosage: drugData[1],
                        sideEffect: drugData[2],
                        prodDate: drugData[3],
                        expiryDate: drugData[4],
                        company: drugData[5],
                        timestamp: new Date(drugData[6] * 1000)
                    };
                }));

                drugEntries.sort((a, b) => b.timestamp - a.timestamp);

                drugEntries.forEach(drug => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>
                            <i class="fas fa-qrcode qr-icon" 
                               onclick="showQRCode('${drug.code}')"
                               data-bs-toggle="modal" 
                               data-bs-target="#qrModal"></i>
                        </td>
                        <td class="eth-address" title="${drug.company}">
                            ${drug.company.substring(0,6)}...${drug.company.slice(-4)}
                        </td>
                        <td>${drug.code}</td>
                        <td>${drug.name}</td>
                        <td>${drug.dosage}</td>
                        <td>${new Date(drug.prodDate).toLocaleDateString()}</td>
                        <td>${new Date(drug.expiryDate).toLocaleDateString()}</td>
                        <td class="timestamp">${drug.timestamp.toLocaleString()}</td>
                    `;
                    tbody.appendChild(row);
                });

            } catch (error) {
                showAlert(`<i class='fas fa-times-circle'></i> Failed to load drug records: ${error.message}`, "danger");
                console.error(error);
            } finally {
                showLoading(false);
            }
        }

        function showQRCode(drugCode) {
            const qrContainer = document.getElementById('qrcode');
            qrContainer.innerHTML = '';
            
            const verificationUrl = `${window.location.origin}/../DrugAuthentication2/Index.html?code=${encodeURIComponent(drugCode)}`;
            
            new QRCode(qrContainer, {
                text: verificationUrl,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }

        function showLoading(show) {
            document.getElementById("loading").style.display = show ? "flex" : "none";
        }

        function showAlert(message, type = "info") {
            const alertDiv = document.getElementById("alert");
            alertDiv.innerHTML = message;
            alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
            alertDiv.style.display = "block";
            
            setTimeout(() => {
                alertDiv.style.animation = "slideIn 0.3s reverse forwards";
                setTimeout(() => {
                    alertDiv.style.display = "none";
                    alertDiv.style.animation = "";
                }, 300);
            }, 5000);
        }

        window.addEventListener('load', async () => {
            if (await initWeb3()) {
                await loadDrugs();
            }
        });