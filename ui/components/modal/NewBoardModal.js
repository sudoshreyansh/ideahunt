import BaseModal from './BaseModal'
import PrimaryButton from '../button/Primary';
import ModalContext from '../../contexts/Modal';
import { useContext, useState, useEffect } from 'react';
import ContractContext from '../../contexts/Contract';
import TransactionContext from '../../contexts/Transaction';
import SecondaryButton from '../button/Secondary';
import { ethers } from 'ethers';

const defaultTokenGate = '0x0000000000000000000000000000000000000000';
let failureCount = 0;

function NewBoardForm({ onSubmit, onCancel }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [voteToken, setVoteToken] = useState(defaultTokenGate);
    const [proposalToken, setProposalToken] = useState(defaultTokenGate);
    const [bounty, setBounty] = useState("0");
    const [bountyError, setBountyError] = useState(false);
    const [page, setPage] = useState(0);
    const [assets, setAssets] = useState({});
    const [openSeaFailed, setOpenSeaFailed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { signer } = useContext(ContractContext)

    function submitPartial() {
        if ( name === '' ) return;
        if ( description === '' ) return;

        setPage(1);
    }

    function submit() { 
        if ( isNaN(parseFloat(bounty)) || parseFloat(bounty) > 10  ) return setBountyError(true);

        if ( submitting ) return;
        setSubmitting(true);

        onSubmit([
            name,
            description,
            proposalToken === '' ? defaultTokenGate : proposalToken,
            voteToken === '' ? defaultTokenGate : voteToken,
            ethers.utils.parseEther(bounty)
        ]);
    }

    async function fetchAssets() {
        let assets;
        try {
            const address = await signer.getAddress();
            const res = await fetch(`https://testnets-api.opensea.io/api/v1/assets?owner=${address}&limit=50`);
            assets = (await res.json()).assets;
        } catch (e) {
            if ( failureCount < 3 ) {
                setTimeout(fetchAssets, 100);
                failureCount++;
            } else {
                failureCount = 0;
                assets = [];
                setOpenSeaFailed(true);
            }
        } 
        
        if ( !assets ) assets = [];

        const contractHolder = {
            [defaultTokenGate]: 'IdeaHunter Token (Default)'
        };
        assets.forEach(asset => {
            if ( 
                asset.asset_contract.schema_name === 'ERC721' && 
                asset.asset_contract.name !== 'IdeaHunter' &&
                asset.asset_contract.symbol !== 'IHT'
            ) {
                contractHolder[asset.asset_contract.address] = asset.asset_contract.name;
            }
        })

        setAssets(contractHolder);
    }

    useEffect(() => {
        fetchAssets()
    }, [])

    if ( page === 0 ) {
        return (
            <>
                <div className="mb-1">Board Name:</div>
                <input type="text" value={name} className="border-stone-600 border-solid border py-1 px-2 mb-1 w-full block" onChange={e => setName(e.target.value.slice(0, 50))} />
                <div className="text-sm text-right mb-4 text-stone-500">{name.length} / 50</div>
                
                <div className="mb-1">Board Description:</div>
                <textarea value={description} className="border-stone-600 border-solid border py-1 px-2 w-full h-40 resize-none" onChange={e => setDescription(e.target.value.slice(0, 280))}></textarea>
                <div className="text-sm text-right mb-6 text-stone-500">{description.length} / 280</div>

                <PrimaryButton value="Next" deactivated={submitting} onClick={() => submitPartial()} />
                <SecondaryButton value="Back" onClick={onCancel} />
            </>
        )
    } else {
        return (
            <>
                <div className="mb-1">Idea Proposal Rights NFT <span className="italic">(Ethereum Rinkeby only)</span>:</div>
                <select className="border-stone-600 border-solid border py-2 px-2 mb-6 w-full block" value={proposalToken} onChange={e => setProposalToken(e.target.value)}>
                    {
                        Object.keys(assets).map(asset => (
                            <option key={asset} value={asset}>{assets[asset]} {asset != defaultTokenGate ? '- ' + asset : ''}</option>
                        ))
                    }
                </select>
    
                <div className="mb-1">Voting Rights NFT <span className="italic">(Ethereum Rinkeby only)</span>:</div>
                <select className="border-stone-600 border-solid border py-2 px-2 mb-6 w-full block" value={voteToken} onChange={e => setVoteToken(e.target.value)}>
                    {
                        Object.keys(assets).map(asset => (
                            <option key={asset} value={asset}>{assets[asset]} {asset != defaultTokenGate ? '- ' + asset : ''}</option>
                        ))
                    }
                </select>
                
                <div className="mb-1">Bounty: (in ETH)</div>
                <input type="text" value={bounty} placeholder="0.00" className="border-stone-600 border-solid border py-1 px-2 mb-1 w-full block" onChange={e => setBounty(e.target.value)} />
                <div className='text-sm text-red-600 font-semibold mb-6'>
                {
                    bountyError ?
                    "Bounty should be valid decimal less than 10." :
                    <></>
                }
                </div>
                
                <div className='text-sm text-red-600 font-semibold mb-4'>
                {
                    openSeaFailed ?
                    "Could not connect to OpenSea servers for your Rinkeby NFTs. Please try again or choose the default." :
                    <></>
                }
                </div>

                <PrimaryButton value="Submit" deactivated={submitting} onClick={submit} />
                <SecondaryButton value="Back" onClick={() => setPage(0)} />
            </>
        )
    }
}

function NewBoardModal() {
    const displayModal = useContext(ModalContext);
    const { contract } = useContext(ContractContext);
    const addTransaction = useContext(TransactionContext);

    function onSubmit(form) {
        const tx = contract.addBoard(...form, { gasLimit: 300000, value: form[form.length - 1] });
        addTransaction({
            id: Date.now(),
            text: `${form[0]} is being added. It may take a few minutes.`,
            successText: `${form[0]} is added.`,
            failureText: `There was a problem with adding ${form[0]}. Please try again.`,
            promise: tx,
            next: () => displayModal({name: 'NO_MODAL'}),
        })
    }

    function onCancel() {
        displayModal({
            name: 'NO_MODAL'
        });
    }

    return (
        <BaseModal>
            <div className="font-bold text-2xl mb-4">
                Add New Idea Board
            </div>
            <NewBoardForm onSubmit={onSubmit} onCancel={onCancel} />
        </BaseModal>
    )
}

export default NewBoardModal;