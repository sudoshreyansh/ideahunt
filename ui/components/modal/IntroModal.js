import BaseModal from './BaseModal'
import PrimaryButton from '../button/Primary';
import ModalContext from '../../contexts/Modal';
import { useContext, useEffect, useState } from 'react';
import ContractContext from '../../contexts/Contract';
import SecondaryButton from '../button/Secondary';

function IntroContents_Intro({ next }) {
    return (
        <>
            <div className="font-bold mb-2 text-2xl">
                IdeaHunt
            </div>
            <div className="mb-10 text-sm">
                IdeaHunt is a place for people around the world to come together, share ideas and encourage those with great ideas. It also allows bounties, NFT Gating and much more!
            </div>
            <div className="mb-10 flex justify-between px-24 text-stone-800">
                <div className="text-center">
                    <div className='mb-4'>
                        <i className="fa-solid fa-clipboard-list text-6xl"></i>
                    </div>
                    <div className='font-semibold'>
                        Create Idea Boards
                    </div>
                </div>
                <div className="text-center">
                    <div className='mb-4'>
                        <i className="fa-solid fa-pencil text-6xl"></i>
                    </div>
                    <div className='font-semibold'>
                        Add Ideas on Boards
                    </div>
                </div>
                <div className="text-center">
                    <div className='mb-4'>
                        <i className="fa-solid fa-square-poll-vertical text-6xl"></i>
                    </div>
                    <div className='font-semibold'>
                        Vote Them
                    </div>
                </div>
            </div>
            <div className="text-sm">
                <PrimaryButton value="Next" onClick={next} />
            </div>
        </>
    )
}

function IntroContents_Gating({ next, back }) {
    return (
        <>
            <div className="font-bold mb-2 text-2xl">
                Gating
            </div>
            <div className="mb-10 text-sm">
                IdeaHunt has it&apos;s own NFT, Hunter NFT. Gating can be done through either the Hunter NFT or any other NFT, the Board Admin wants, provided it&apos;s available on Ethereum Rinkeby network for on-chain verification.
            </div>
            <div className="mb-10 flex justify-between px-40 text-stone-800">
                <div className="text-center">
                    <div className='mb-8'>
                        <img src="/nft-display.png" className="w-40 pt-4" />
                    </div>
                    <div className='font-semibold'>
                        Hunter NFT
                    </div>
                </div>
                <div className="text-center">
                    <div className='mb-4'>
                        <img src='https://imageio.forbes.com/specials-images/imageserve/6170e01f8d7639b95a7f2eeb/Sotheby-s-NFT-Natively-Digital-1-2-sale-Bored-Ape-Yacht-Club--8817-by-Yuga-Labs/0x0.png?format=png&width=960' className='w-40' />
                    </div>
                    <div className='font-semibold'>
                        3rd Party NFT
                    </div>
                </div>
            </div>
            <div className="text-sm">
                <PrimaryButton value="Next" onClick={next} />
                <SecondaryButton value="Back" onClick={back} />
            </div>
        </>
    )
}

function IntroContents_Hunter({ next, back }) {
    return (
        <>
            <div className="font-bold mb-2 text-2xl">
                Hunter Token
            </div>
            <div className="mb-10 text-sm">
                Hunter NFT is required to create new Boards and is the default Gating Token for adding ideas and voting when creating new Idea Boards.
            </div>
            <div className="mb-10 flex justify-center text-stone-800">
                <div className="text-center">
                    <div className='mb-6'>
                        <img src="/nft-display.png" className="w-40" />
                    </div>
                    <div className='font-semibold'>
                        Hunter NFT
                    </div>
                </div>
            </div>
            <div className="text-sm">
                <PrimaryButton value="Next" onClick={next} />
                <SecondaryButton value="Back" onClick={back} />
            </div>
        </>
    )
}

function Web3Connect({ next }) {
    const [wallet, setWallet] = useState();
    const approved = wallet && wallet.chain === '0x4';

    async function connectWallet() {
        try {
            const _wallet = {};
            if ( window.ethereum ) {
                _wallet.provider = window.ethereum;
                _wallet.chain = await _wallet.provider.request({ method: 'eth_chainId' });
                const accounts = await _wallet.provider.request({ method: 'eth_requestAccounts' });
                _wallet.account = accounts[0];

                setWallet(_wallet);
            }
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        if ( !wallet ) {
            connectWallet();
        }
    }, [wallet])

    return (
        <>
            <div className="font-bold mb-5 text-2xl">
                One Last Thing!
            </div>
            <div className="font-bold mb-2 text-xl">
                Connect Your Metamask Wallet (Rinkeby Chain)
            </div>
            <div className="mb-6 text-sm flex rounded-md p-2 items-center">
                <img src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" alt="Metamask Logo" className="block w-16" />
                <div className="pl-6 py-2 grow">
                    {
                        approved ?
                        <>
                            <div className="font-semibold">
                                {wallet.account}
                            </div>
                            <div className="text-sm">
                                Rinkeby Network
                            </div>
                        </> :
                        (
                            wallet ?
                            <>
                                <div className="font-semibold">
                                    {wallet.account}
                                </div>
                                <div className="text-sm">
                                    Unknown Network
                                </div>
                            </> :
                            <div className="font-semibold pb-6">
                                Not Connected
                            </div>
                        )
                    }
                </div>
                <div className="text-2xl pr-4">
                    { 
                        approved ? 
                        <i className="fa-solid fa-circle-check text-green-700"></i> :  
                        <i className="fa-solid fa-circle-xmark text-red-700"></i>
                    }
                </div>
            </div>
            <div className="text-sm">
                {
                    approved ?
                    <PrimaryButton value="Finish Setup" onClick={() => next(wallet.provider)} /> :
                    <PrimaryButton value="Connect to IdeaHunt" onClick={connectWallet} />
                }
            </div>
        </>
    )
}

function IntroModal() {
    const displayModal = useContext(ModalContext);
    const { setProvider } = useContext(ContractContext);
    const [pageIndex, setPageIndex] = useState(0);

    function updateWeb3Contract(provider) {
        displayModal({name: 'NO_MODAL'});
        setProvider(provider);
    }

    const IntroFlow = [
        <IntroContents_Intro key="intro-content" next={() => setPageIndex(1)} />,
        <IntroContents_Gating key="intro-content" next={() => setPageIndex(2)} back={() => setPageIndex(0)} />,
        <IntroContents_Hunter key="intro-content" next={() => setPageIndex(3)} back={() => setPageIndex(1)} />,
        <Web3Connect key="wallet-connect" next={updateWeb3Contract} back={() => setPageIndex(2)} />
    ]

    const contents = IntroFlow[pageIndex];

    return (
        <BaseModal disconnected={true}>
            {contents}
        </BaseModal>
    )
}

export default IntroModal;