import { useContext, useState } from 'react';
import PrimaryButton from '../button/Primary';
import BaseModal from './BaseModal'
import ContractContext from '../../contexts/Contract';
import ModalContext from '../../contexts/Modal';
import TransactionContext from '../../contexts/Transaction';
import SecondaryButton from '../button/Secondary';

function ProposalModal({ boardID }) {
    const [idea, setIdea] = useState('');
    const [link, setLink] = useState('');
    const [error, setError] = useState(false);
    const { contract } = useContext(ContractContext);
    const displayModal = useContext(ModalContext);
    const addTransaction = useContext(TransactionContext);
    const [submitting, setSubmitting] = useState(false);

    function addIdeaOnChain() {
        if ( idea === '' || idea.length > 280 ) return;
        if ( link != '' && link.slice(0, 7) != 'http://' && link.slice(0, 8) != 'https://' ) {
            setError(true);
            return;
        } else {
            setError(false);
        }

        if ( submitting ) return;
        setSubmitting(true);

        const tx = contract.addIdea(boardID, idea, link, { gasLimit: 300000 });
        
        addTransaction({
            id: Date.now(),
            text: 'Your idea is being added. It may take a few minutes.',
            successText: 'Your idea has been added.',
            failureText: 'There was a problem with adding your idea. Please try again.',
            promise: tx,
            next: () => displayModal({name: 'NO_MODAL'}),
        })
    }

    function handleChange(event) {
        setIdea(event.target.value.slice(0, 280))
    }

    function onCancel() {
        displayModal({
            name: 'NO_MODAL'
        });
    }

    return (
        <BaseModal disconnected={false}>
            <div className="font-bold text-2xl mb-4">
                Add Your Idea
            </div>
            <div className="mb-1">Idea Description: <span className='italic'>(in brief)</span></div>
            <textarea value={idea} placeholder="Explain your idea in brief" className="w-full h-32 border-solid border border-stone-600 resize-none p-2" onChange={handleChange}></textarea>
            <div className="text-sm text-right mb-4 text-stone-500">{idea.length} / 280</div>

            <div className="mb-1">Detailed Explanation URL: <span className='italic'>(if any)</span></div>
            <input type="text" value={link} placeholder="http://pastebin.com/XhxE" className="border-stone-600 border-solid border py-1 px-2 w-full block" onChange={e => setLink(e.target.value)} />
            <div className="mb-5 pt-1 text-sm text-red-600 font-semibold">{error ? 'Only HTTP(s) links are allowed.' : ''}</div>

            <PrimaryButton value="Add Your Idea" deactivated={submitting} onClick={addIdeaOnChain} />
            <div className='mb-2'></div>
            <SecondaryButton value="Back" onClick={onCancel} />
        </BaseModal>
    )
}

export default ProposalModal;