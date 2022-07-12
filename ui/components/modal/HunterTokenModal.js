import { useContext, useState } from 'react';
import ContractContext from '../../contexts/Contract';
import TransactionContext from '../../contexts/Transaction';
import ModalContext from '../../contexts/Modal';
import PrimaryButton from '../button/Primary';
import SecondaryButton from '../button/Secondary';
import BaseModal from './BaseModal'
import { ethers } from 'ethers';

function HunterTokenModal() {
    const displayModal = useContext(ModalContext);
    const addTransaction = useContext(TransactionContext);
    const { contract, signer } = useContext(ContractContext);
    const [minting, setMinting] = useState(false);

    function mintHunterToken() {
        if ( minting ) return;
        setMinting(true);
        const tx = contract.mintHunterToken({ gasLimit: 300000, value: ethers.utils.parseEther("0.01") });
        addTransaction({
            id: Date.now(),
            text: 'Your Hunter Token is being minted. It may take a few minutes.',
            successText: 'Your Hunter Token is minted. Please refresh to continue.',
            failureText: 'There was a problem with minting your Hunter Token. Please try again.',
            promise: tx,
            next: () => displayModal({name: 'NO_MODAL'}),
        })
    }

    return (
        <BaseModal disconnected={false}>
            <div className="font-bold text-2xl mb-4">
                Buy a Hunter Token for Full Access!
            </div>
            <div className="flex items-center py-10">
                <div className="w-80 px-10">
                    <img src="/nft-display.png" />
                </div>
                <div className="">
                    <div className="font-semibold text-xl mb-2">Hunter Token Perks</div>
                    <div className="flex items-baseline">
                        <i className="fa-solid fa-circle-check text-green-700"></i>
                        <div className="grow pl-4"><span className="font-semibold">Add your ideas on IdeaHunter</span> for the world to see and vote on.</div>
                    </div>
                    <div className="flex items-baseline">
                        <i className="fa-solid fa-circle-check text-green-700"></i>
                        <div className="grow pl-4"><span className="font-semibold">Vote on ideas on IdeaHunter</span> to encourage amazing ideas.</div>
                    </div>
                    <div className="flex items-baseline">
                        <i className="fa-solid fa-circle-check text-green-700"></i>
                        <div className="grow pl-4"><span className="font-semibold">Host idea boards on IdeaHunter</span> for a trustable way to manage brainstorming.</div>
                    </div>
                </div>
            </div>
            <PrimaryButton value="Mint Hunter Token [0.01 ETH]" deactivated={minting} onClick={mintHunterToken} />
            <SecondaryButton value="Later" onClick={() => displayModal({name:'NO_MODAL'})} />
        </BaseModal>
    )
}

export default HunterTokenModal;