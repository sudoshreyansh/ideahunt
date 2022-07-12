import Head from 'next/head'
import { useContext, useEffect, useState } from 'react';
import ModalContext from '../contexts/Modal'
import ContractContext from '../contexts/Contract'
import Cards from '../components/cards'
import PrimaryButton from '../components/button/Primary';
import Loader from '../components/loader';
import AdminSettings from '../components/admin';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';

export default function BoardPage () {
    const displayModal = useContext(ModalContext);
    const { contract, signer, addListener } = useContext(ContractContext);
    const router = useRouter();
    const { boardID } = router.query;
    const [ board, setBoard ] = useState({});
    const [ canWrite, setCanWrite ] = useState(false);
    const [ canVote, setCanVote ] = useState(false);
    const [ ideas, setIdeas ] = useState([]);
    const [ showLoading, setShowLoading ] = useState(true);
    const [address, setAddress] = useState('');

    let bountyWinnerID = -1;
    if ( !board.open && board.bounty && board.bounty.toString() != '0' && ideas.length > 0 ) {
        bountyWinnerID = 0;
        ideas.forEach((idea, i) => {
            if ( idea.votes > ideas[bountyWinnerID].votes ) bountyWinnerID = i;
        })
    }

    function ideaAdded(_uid, _boardID, _owner, _idea, _link) {
        if ( _boardID.toNumber() != parseInt(boardID) ) return;
        setIdeas((lastIdeas) => {
            if (
                lastIdeas.some(_idea => _idea.uid === _uid.toNumber())
            ) {
                return lastIdeas;
            } else {
                return [...lastIdeas, {
                    uid: _uid.toNumber(),
                    boardID: _boardID.toNumber(),
                    owner: _owner,
                    idea: _idea,
                    link: _link,
                    votes: 0,
                    voted: false
                }];
            }
        })
    }

    function ideaVoted(_uid, _boardID, _voter, _votes) {
        if ( _boardID.toNumber() != parseInt(boardID) ) return;
        setIdeas((lastIdeas) => {
            let index = -1;
            if (
                lastIdeas.some((_idea, i) => {
                    if ( _idea.uid === _uid.toNumber() ) {
                        index = i;
                        return true;
                    }
                    return false;
                })
            ) {
                const newIdeas = [...lastIdeas];
                newIdeas[index].votes = _votes.toNumber();
                newIdeas[index].voted = _voter === address;
                return newIdeas;
            }
            return lastIdeas;
        });
    }

    function boardClosed(_boardID) {
        if ( _boardID.toNumber() == parseInt(boardID) ) closeBoard();
    }

    async function addIdea() {
        displayModal({
            name: 'NEW_IDEA_MODAL',
            boardID
        })
    }

    function closeBoard() {
        setBoard((lastBoard) => {
            if ( !lastBoard.open ) return lastBoard;

            const _board = {...lastBoard};
            _board.open = false;
            setCanWrite(false);
            setCanVote(false);

            return _board;
        });
    }

    async function fetchDetails() {
        addListener('NewIdeaEvent', ideaAdded);
        addListener('CloseBoardEvent', boardClosed);
        addListener('NewVoteEvent', ideaVoted);

        const _boards = await contract.getBoards();
        const _board = _boards[boardID];
        const _ideas = await contract.getIdeas(boardID);
        const _canWrite = await contract.canWrite(boardID);
        const _canVote = await contract.canVoteInBoard(boardID);
        const _address = await signer.getAddress();

        
        setAddress(_address);

        setIdeas(_ideas.map(idea => ({
            uid: idea.uid.toNumber(),
            boardID: idea.boardID.toNumber(),
            idea: idea.idea,
            link: idea.link,
            owner: idea.owner,
            votes: idea.votes.toNumber(),
            voted: idea.voted
        })))

        setBoard({
            name: _board.name,
            description: _board.description,
            voterGateToken: _board.voterGateToken,
            writerGateToken: _board.writerGateToken,
            admin: _board.admin,
            open: _board.open,
            bounty: _board.bounty
        })

        setCanWrite(_canWrite);
        setCanVote(_canVote);

        setShowLoading(false);
    }

    useEffect(() => {
        if ( contract === undefined ) return;

        if ( contract === false ) {
            displayModal({name: 'INTRO_MODAL'});
        } else {
            fetchDetails();
        }
    }, [contract])

    return (
        <>
            <Head>
                <title>{showLoading ? "IdeaHunt" : `${board.name} - IdeaHunt`}</title>
            </Head>
            {
                showLoading ?
                <Loader className="w-16 h-16 mx-auto my-10" /> : 
                <>
                    <div className="font-bold text-3xl mb-3 flex items-center justify-between pr-2">
                        <div className="">
                            {board.name}
                        </div>
                        <AdminSettings board={board} boardID={boardID} closeBoard={closeBoard} />
                    </div>
                    <div className="mb-4">
                        {board.description}<br /><br />
                        {
                            board.open ?
                            (
                                <>
                                    {
                                        canWrite ?
                                        <>
                                            <i className="fa-solid fa-circle-check text-green-600 mr-2"></i> Add new ideas
                                        </> :
                                        <>
                                            <i className="fa-solid fa-circle-xmark text-red-600 mr-2"></i> Add new ideas {board.writerGateToken === ethers.constants.AddressZero ? '(Hunters only)' : ''}
                                        </>
                                    }<br />
                                    {
                                        canVote ?
                                        <>
                                            <i className="fa-solid fa-circle-check text-green-600 mr-2"></i> Vote on ideas
                                        </> :
                                        <>
                                            <i className="fa-solid fa-circle-xmark text-red-600 mr-2"></i> Vote on ideas {board.voterGateToken === ethers.constants.AddressZero ? '(Hunters only)' : ''}
                                        </>
                                    }<br />
                                    {
                                        board.bounty.toString() != '0' ?
                                        <>
                                            <i className="fa-solid fa-circle-check text-green-600 mr-2"></i> Best idea bounty: {ethers.utils.formatEther(board.bounty)} ETH
                                        </> :
                                        <></>
                                    }
                                </>
                            ) :
                            <>
                                <i className="fa-solid fa-circle-exclamation text-blue-400 mr-2"></i> This board has been closed by the admin.
                                {
                                    bountyWinnerID > -1 ?
                                    <>
                                        <br />
                                        <i className="fa-solid fa-circle-check text-green-600 mr-2"></i> {ethers.utils.formatEther(board.bounty)} ETH Bounty Winner - Idea #{bountyWinnerID + 1}
                                    </> :
                                    <></>
                                }
                            </>
                        }
                    </div>
                    {
                        canWrite ?
                        <div className="w-80">
                            <PrimaryButton value="+ Add New Idea" onClick={addIdea} />
                        </div> :
                        <></>
                    }
                    <Cards cards={ideas} canVote={canVote} address={address} minimised={false} missingText="There are no ideas in this board." />
                </>
            }
        </>
    );
}