let web3;
        let contract;
        let isOwner = false;
        const contractAddress = "0x1fbce5764d704aefabfacd1602c8b5116abc1fcb";
        const abi = [
            {
                "inputs": [
                    {"internalType":"address","name":"_address","type":"address"},
                    {"internalType":"string","name":"_companyname","type":"string"}
                ],
                "name":"setCompany",
                "outputs":[],
                "stateMutability":"nonpayable",
                "type":"function"
            },
            {
                "inputs":[],
                "name":"owner",
                "outputs":[{"internalType":"address","name":"","type":"address"}],
                "stateMutability":"view",
                "type":"function"
            }
        ];

        async function initWeb3() {
            try {
                if (!window.ethereum) {
                    showAlert("<i class='fas fa-exclamation-circle'></i> Please install MetaMask to continue", "danger");
                    return false;
                }
                
                web3 = new Web3(window.ethereum);
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                contract = new web3.eth.Contract(abi, contractAddress);
                
                // Verify if current user is owner
                const accounts = await web3.eth.getAccounts();
                const ownerAddress = await contract.methods.owner().call();
                isOwner = accounts[0].toLowerCase() === ownerAddress.toLowerCase();
                
                if (!isOwner) {
                    showAlert("<i class='fas fa-exclamation-circle'></i> Only admin can register companies", "danger");
                    document.getElementById('registrationForm').style.display = 'none';
                }
                
                return true;

            } catch (error) {
                showAlert(`<i class='fas fa-times-circle'></i> Connection error: ${error.message}`, "danger");
                return false;
            }
        }

        async function registerCompany() {
            try {
                showLoading(true);
                const companyName = document.getElementById('companyName').value.trim();
                const companyAddress = document.getElementById('companyAddress').value.trim();

                // Validation
                if (!companyName || !companyAddress) {
                    throw new Error("All fields are required");
                }
                if (!web3.utils.isAddress(companyAddress)) {
                    throw new Error("Invalid Ethereum address");
                }
                if (!isOwner) {
                    throw new Error("Unauthorized access");
                }

                // Convert to checksum address
                const checksumAddress = web3.utils.toChecksumAddress(companyAddress);

                // Estimate gas
                const gasEstimate = await contract.methods.setCompany(
                    checksumAddress,
                    companyName
                ).estimateGas({ from: checksumAddress });

                // Send transaction
                const receipt = await contract.methods.setCompany(
                    checksumAddress,
                    companyName
                ).send({
                    from: checksumAddress,
                    gas: Math.floor(gasEstimate * 1.2)
                });

                showAlert(
                    `<i class='fas fa-check-circle'></i> Company registered successfully! TX Hash: ${receipt.transactionHash.substring(0, 12)}...`,
                    "success"
                );

                // Clear form
                document.getElementById('registrationForm').reset();

            } catch (error) {
                showAlert(`<i class='fas fa-times-circle'></i> Registration failed: ${error.message}`, "danger");
                console.error(error);
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

        // Initialize on load
        window.addEventListener('load', async () => {
            if (await initWeb3()) {
                // Add real-time address validation
                document.getElementById('companyAddress').addEventListener('input', (e) => {
                    const isValid = web3.utils.isAddress(e.target.value);
                    e.target.classList.toggle('is-invalid', !isValid);
                    e.target.classList.toggle('is-valid', isValid);
                });
            }
        });