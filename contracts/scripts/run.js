async function main() {
    const [owner, randomPerson] = await hre.ethers.getSigners();
    const IdeaHuntFactory = await hre.ethers.getContractFactory("IdeaHunt");
    const IdeaHuntTokenFactory = await hre.ethers.getContractFactory("IdeaHuntToken");
    
    const tokenContract = await IdeaHuntTokenFactory.deploy();
    await tokenContract.deployed();

    const contract = await IdeaHuntFactory.deploy(tokenContract.address);
    await contract.deployed();

    let tx = await tokenContract.whitelist(contract.address);
    await tx.wait();

    tx = await contract.mintHunterToken({gasLimit: 300000, value: ethers.utils.parseEther("0.01")});
    await tx.wait();

    tx = await contract.connect(randomPerson).mintHunterToken({gasLimit: 300000, value: ethers.utils.parseEther("0.01")});
    await tx.wait();

    tx = await contract.addBoard( "The Daily Board", "The Daily Board is the general ideas board featuring ideas from all Hunters.", hre.ethers.constants.AddressZero, hre.ethers.constants.AddressZero, ethers.utils.parseEther("0"), {gasLimit: 300000, value: ethers.utils.parseEther("0")});
    await tx.wait();


    console.log(await contract.getBoards());
    console.log(await contract.getIdeas(0));

    tx = await contract.closeBoard(0);
    await tx.wait();
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error.message);
        process.exit(1);
    });
