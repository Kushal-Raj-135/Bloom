let web3;
        let contract;
        const contractAddress = "0x1fbce5764d704aefabfacd1602c8b5116abc1fcb";
        const abi = [
            {
                "inputs": [],
                "name": "getCompanies",
                "outputs": [{"internalType": "address[]","name": "","type": "address[]"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "address","name": "_address","type": "address"}],
                "name": "getCompany",
                "outputs": [{"internalType": "string","name": "","type": "string"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];

        async function initWeb3() {
            try {
                if (window.ethereum) {
                    web3 = new Web3(window.ethereum);
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    contract = new web3.eth.Contract(abi, contractAddress);
                    return true;
                }
                showAlert("<i class='fas fa-exclamation-circle'></i> Please install MetaMask to continue!", "danger");
                return false;
            } catch (error) {
                showAlert(`<i class='fas fa-exclamation-circle'></i> Error connecting to wallet: ${error.message}`, "danger");
                return false;
            }
        }

        async function loadCompanies() {
            try {
                showLoading(true);
                const tbody = document.getElementById("companiesList");
                tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4">Loading...</td></tr>`;

                const companies = await contract.methods.getCompanies().call();
                
                if (!companies || companies.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4">No approved companies found</td></tr>`;
                    return;
                }

                const companyData = await Promise.all(companies.map(async address => {
                    try {
                        const name = await contract.methods.getCompany(address).call();
                        return { address, name };
                    } catch (error) {
                        console.error(`Error fetching company ${address}:`, error);
                        return { address, name: "Unknown Company" };
                    }
                }));

                tbody.innerHTML = "";
                companyData.forEach(company => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td class="align-middle">${company.name}</td>
                        <td class="eth-address align-middle" title="${company.address}">
                            ${company.address}
                        </td>
                        <td class="align-middle">
                            <span class="badge bg-success">Verified</span>
                        </td>
                    `;
                    tbody.appendChild(row);
                });

            } catch (error) {
                showAlert(`<i class='fas fa-times-circle'></i> Failed to load companies: ${error.message}`, "danger");
                console.error("Error details:", error);
            } finally {
                showLoading(false);
            }
        }

        function showLoading(show) {
            document.getElementById("loading").style.display = show ? "flex" : "none";
        }

        function showAlert(message, type = "info") {
            const alertDiv = document.getElementById("alert");
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

        // Initialize application
        window.addEventListener('load', async () => {
            if (await initWeb3()) {
                await loadCompanies();
            }
        });