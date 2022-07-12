import ModalContext from '../contexts/Modal'
import IntroModal from '../components/modal/IntroModal';
import ProposalModal from '../components/modal/ProposalModal';
import HunterTokenModal from '../components/modal/HunterTokenModal';
import NewBoardModal from '../components/modal/NewBoardModal';
import { useReducer } from 'react';


const modals = {
    'INTRO_MODAL': IntroModal,
    'NEW_IDEA_MODAL': ProposalModal,
    'HUNTER_TOKEN_MODAL': HunterTokenModal,
    'NEW_BOARD_MODAL': NewBoardModal,
}


const reducer = (state, action) => {
    if ( modals[action.name] ) {
        return action;
    } else {
        return {name: 'NO_MODAL'};
    }
}

function ModalProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, {name: 'NO_MODAL'})
    const Modal = modals[state.name];

    return (
        <ModalContext.Provider value={dispatch}>
            {children}
            {
                state.name != 'NO_MODAL' ?
                <Modal {...state} /> :
                <></>
            }
        </ModalContext.Provider>
    )
}

export default ModalProvider;