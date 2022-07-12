import { useState, useContext } from "react";
import PrimaryButton from "../button/Primary";
import SecondaryButton from "../button/Secondary";
import ContractContext from "../../contexts/Contract";
import TransactionContext from "../../contexts/Transaction";

function AdminSettings({ boardID, board, closeBoard }) {
    const [ showAdmin, setShowAdmin ] = useState(false);
    const [ loading, setLoading ] = useState(false);
    const { contract } = useContext(ContractContext);
    const addTransaction = useContext(TransactionContext);

    function onClose() {
        if ( loading ) return;
        setLoading(true);

        const tx = contract.closeBoard(boardID, { gasLimit: 300000 });
        addTransaction({
            id: Date.now(),
            text: `${board.name} is being closed. It may take a few minutes.`,
            successText: `${board.name} has been closed.`,
            failureText: `${board.name} could not be closed. Please try again.`,
            promise: tx,
            next: () => setShowAdmin(false),
            success: () => closeBoard(),
            failure: () => setLoading(false)
        })
    }

    return (
        <i className="fa-solid fa-gear text-gray-600 cursor-pointer relative" onClick={() => setShowAdmin(!showAdmin)}>
            {
                showAdmin ?
                <div className="absolute right-0 top-full w-80 rounded border border-solid border-stone-600 text-black text-base font-normal p-4" onClick={e => e.stopPropagation()}>
                    {
                        board.open ?
                        <>
                            Do you want to close this board?<br />
                            <i className="text-sm">Bounties, if any will be automatically paid off to the highest voted idea.</i>
                            <div className="text-sm mt-4 flex">
                                <div className="w-14 mr-2">    
                                    <PrimaryButton value="Yes" deactivated={loading} onClick={onClose} />
                                </div>    
                                <SecondaryButton value="No" onClick={() => setShowAdmin(false)} />
                            </div>
                        </> :
                        <>
                            This board has been closed.
                        </>
                    }
                </div> :
                <></>
            }
        </i>
    )
}

export default AdminSettings;