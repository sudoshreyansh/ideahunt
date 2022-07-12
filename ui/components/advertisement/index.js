import { useContext } from 'react';
import ModalContext from '../../contexts/Modal'
import PrimaryButton from "../button/Primary";

function Advertisement() {
    const displayModal = useContext(ModalContext);

    async function mintToken() {
        displayModal({
            name: 'HUNTER_TOKEN_MODAL'
        })
    }

    return (
        <div className="flex items-center p-3 pl-5 pr-8 w-full mb-6">
            <img src="/nft-display.png" className="w-32" />
            <div className="grow pl-8">
                <div className="font-bold text-lg mb-1">
                    You are not a Hunter, Yet!
                </div>
                <div className="mb-4">
                    Get yourself a Hunter NFT, and become a part of the gang!
                </div>
                <div className="w-48 text-sm">
                    <PrimaryButton value="Mint Hunter Token Now!" onClick={mintToken} />
                </div>
            </div>
        </div>
    )
}

export default Advertisement;