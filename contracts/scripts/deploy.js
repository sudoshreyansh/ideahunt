const main = async () => {
    const [deployer] = await hre.ethers.getSigners();
    const accountBalance = await deployer.getBalance();
  
    console.log("Deploying contracts with account: ", deployer.address);
    console.log("Account balance: ", accountBalance.toString());
  
    const factory = await hre.ethers.getContractFactory("IdeaHunt");
    const tokenFactory = await hre.ethers.getContractFactory("IdeaHuntToken");
    
    const tokenContract = await tokenFactory.deploy();
    await tokenContract.deployed();

    const contract = await factory.deploy(tokenContract.address);
    await contract.deployed();

    let tx = await tokenContract.whitelist(contract.address);
    await tx.wait();
  
    console.log("Contract address: ", contract.address);
};
  
const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();
