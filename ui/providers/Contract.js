import ContractContext from '../contexts/Contract';
import { ethers } from "ethers";
import abi from '../config/abi.json'
import address from '../config/address'
import { useReducer, useEffect } from 'react'
import { checkEthereumConnection } from '../utils/utils'
import { useRouter } from 'next/router';

const listeners = {
    'NewIdeaEvent': false,
    'NewVoteEvent': false,
    'NewBoardEvent': false,
    'CloseBoardEvent': false
}

function addListener(event, listener) {
    listeners[event] = listener;
}

function resetListeners() {
    Object.keys(listeners).map(event => {
        listeners[event] = false;
    })
}

function subscribeToContract(contract) {
    Object.keys(listeners).map(event => {
        contract.on(event, (...params) => {
            if ( listeners[event] ) listeners[event](...params);
        })
    })
}

function contractReducer(state, provider) {
    if ( provider === false ) {
        return { contract: false, provider: false, signer: false }
    }

    if ( provider.isConnected() ) {
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = ethersProvider.getSigner();
        const contract = new ethers.Contract(address, abi.abi, signer);
        subscribeToContract(contract);

        return {contract, provider: ethersProvider, signer};
    }

    return state;
}

function ContractProvider({ children }) {
    const [{contract, provider, signer}, setProvider] = useReducer(contractReducer, {});
    const router = useRouter();

    async function setup() {
        if ( await checkEthereumConnection() === true ) {
            setProvider(window.ethereum);
        } else {
            setProvider(false);
        }
    }

    useEffect(() => {
        setup();
    }, [])

    useEffect(resetListeners, [router.asPath])

    return (
        <ContractContext.Provider value={{contract, provider, signer, setProvider, addListener}}>
            {children}
        </ContractContext.Provider>
    )
}

export default ContractProvider;