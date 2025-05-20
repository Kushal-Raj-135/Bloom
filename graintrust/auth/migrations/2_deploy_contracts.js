const SupplyChain = artifacts.require("SupplyChain");
// Other contracts (RawMaterial, Medicine, Transactions) are deployed BY SupplyChain

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(SupplyChain);
  const supplyChainInstance = await SupplyChain.deployed();
  console.log("SupplyChain deployed at:", supplyChainInstance.address);

  // --- Grant Initial Roles (Example) ---
  // The deployer (accounts[0]) is automatically ADMIN_ROLE
  const admin = accounts[0];
  console.log(`Admin Role granted to deployer: ${admin}`);
};