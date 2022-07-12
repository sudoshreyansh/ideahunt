import Head from 'next/head'
import { useContext, useEffect, useState } from 'react';
import ModalContext from '../contexts/Modal'
import ContractContext from '../contexts/Contract'
import Cards from '../components/cards'
import PrimaryButton from '../components/button/Primary';
import Loader from '../components/loader';
import Board from '../components/board';
import Link from 'next/link';
import Advertisement from '../components/advertisement';

export default function IndexPage () {
    const displayModal = useContext(ModalContext);
    const { contract, signer, addListener } = useContext(ContractContext);
    const [ boards, setBoards ] = useState([]);
    const [ isHunter, setIsHunter ] = useState(false);
    const [ userIdeas, setUserIdeas ] = useState([]);
    const [ showLoading, setShowLoading ] = useState(true);
    const [address, setAddress] = useState('');

    function ideaAdded(_uid, _boardID, _owner, _idea, _link) {
        setUserIdeas((lastIdeas) => {
            if ( _owner != address ) return lastIdeas;
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
        setUserIdeas((lastIdeas) => {
            let index = -1;
            if (
                lastIdeas.some((_idea, i) => {
                    if ( _idea.uid === _uid.toNumber() && _idea.boardID === _boardID.toNumber() ) {
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

    function boardAdded(_boardID, _admin, _name, _description) {
        setBoards((lastBoards) => {
            if (
                lastBoards.length !== _boardID.toNumber()
            ) {
                return lastBoards;
            } else {
                return [...lastBoards, {
                    name: _name,
                    description: _description,
                    voterGateToken: "0x0000000000000000000000000000000000000000",
                    writerGateToken: "0x0000000000000000000000000000000000000000",
                    admin: _admin,
                    open: true
                }];
            }
        })
    }

    async function fetchDetails() {
        addListener('NewIdeaEvent', ideaAdded);
        addListener('NewBoardEvent', boardAdded);
        addListener('NewVoteEvent', ideaVoted);

        const _boards = await contract.getBoards();
        const _isHunter = await contract.isHunter();
        const _userIdeas = await contract.getUserIdeas();
        const _address = await signer.getAddress();

        setIsHunter(_isHunter);
        setAddress(_address);

        setUserIdeas(_userIdeas.map(idea => ({
            uid: idea.uid.toNumber(),
            boardID: idea.boardID.toNumber(),
            idea: idea.idea,
            link: idea.link,
            owner: idea.owner,
            votes: idea.votes.toNumber(),
            voted: false
        })))

        setBoards(_boards.map(board => ({
            name: board.name,
            description: board.description,
            voterGateToken: board.voterGateToken,
            writerGateToken: board.writerGateToken,
            admin: board.admin,
            open: board.open
        })))

        setShowLoading(false);
    }

    function addBoard() {
        displayModal({
            name: 'NEW_BOARD_MODAL'
        })
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
                <title>Home - IdeaHunt</title>
            </Head>

            <div className="font-bold text-3xl mb-4">
                Let Your Creativity Flow!
            </div>
            {
                showLoading ?
                <Loader className="w-16 h-16 mx-auto my-10" /> : 
                <>
                    { isHunter ? <></> : <Advertisement /> }
                    <div className="font-semibold text-2xl">Your Ideas</div>
                    <Cards cards={userIdeas} address={address} missingText="You haven't added any ideas in any boards." />

                    <div className="font-semibold text-2xl mb-4">Explore Idea Boards</div>
                    {
                        boards.map((board, i) => (
                            <Link key={i} href={`/${i}`}>
                                <a><Board name={board.name} description={board.description} /></a>
                            </Link>
                        ))
                    }
                    <div className="mb-6"></div>
                    {
                        isHunter ?
                        <PrimaryButton value="+ Create A Board" onClick={addBoard} /> :
                        <></>
                    }
                </>
            }
        </>
    );
}