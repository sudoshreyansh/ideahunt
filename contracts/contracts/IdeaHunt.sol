//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract IdeaHuntToken is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address private _owner;
    address private _whitelist;

    constructor() ERC721("IdeaHunter", "IHT") {
        _owner = msg.sender;
    }

    function whitelist(address whitelistAddress) public {
        require(msg.sender == _owner);
        _whitelist = whitelistAddress;
    }

    function mintHunterToken(address minter) external {
        require(msg.sender == _whitelist, "Only whitelisted can mint.");
        require(balanceOf(minter) == 0, "You can buy only one Hunter Token.");

        uint256 newItemId = _tokenIds.current();
        _mint(minter, newItemId);

        uint256 random = (block.difficulty + block.timestamp) % 100;
        if ( random < 65 && random > 45 ) {
            _setTokenURI(newItemId, "https://jsonkeeper.com/b/9KJM");
        } else {
            _setTokenURI(newItemId, "https://jsonkeeper.com/b/XEBX");
        }

        _tokenIds.increment();
    }
}

contract IdeaHunt {
    IdeaHuntToken private _tokenContract;
    address private _owner;
    uint256 private _totalBounty;

    struct Idea {
        string idea;
        string link;
        uint256 votes;
        address owner;
    }

    struct IdeaDTO {
        string idea;
        string link;
        uint256 votes;
        address owner;
        uint256 boardID;
        uint256 uid;
        bool voted;
    }

    struct Board {
        string name;
        string description;
        address voterGateToken;
        address writerGateToken;
        uint256 bounty;
        bool open;
        address admin;
    }

    Board[] private _boards;
    mapping(uint256 => Idea[]) private _ideas;
    mapping(uint256 => mapping(address => mapping(uint256 => bool))) private _voteCast;
    mapping(address => IERC721) private _contracts;

    event NewIdeaEvent(uint256 uid, uint256 boardID, address owner, string idea, string link);
    event NewBoardEvent(uint256 boardID, address admin, string name, string description);
    event NewVoteEvent(uint256 uid, uint256 boardID, address caster, uint256 votes);
    event CloseBoardEvent(uint256 boardID);

    constructor(address tokenContractAddress) {
        _tokenContract = IdeaHuntToken(tokenContractAddress);
        _owner = msg.sender;
    }

    modifier hasWriteAccess(uint256 boardID) {
        require(canWrite(boardID), "You need to be a hunter for this action.");
        _;
    }

    modifier hasVoteAccess(uint256 boardID, uint256 uid) {
        require(canVote(boardID, uid), "You can't vote or have already cast your vote.");
        _;
    }

    modifier hasHuntAccess() {
        require(isHunter(), "You are not a Hunter.");
        _;
    }

    function withdraw() public {
        require(msg.sender == _owner, "Only owner can withdraw");
        (bool success, ) = (msg.sender).call{value: (address(this).balance - _totalBounty)}("");
        require(success, "Transaction was not successful");
    }

    function mintHunterToken() payable public {
        require(msg.value == 0.01 ether, "Cost of the token is 0.01 ETH");
        _tokenContract.mintHunterToken(msg.sender);
    }

    function addBoard(string memory name, string memory description, address writerGateToken, address voterGateToken, uint256 bounty) payable public hasHuntAccess {
        require(bytes(description).length < 400, "Board description too long!");
        require(msg.value == bounty);
        Board memory board = Board(name, description, writerGateToken, voterGateToken, bounty, true, msg.sender);
        _boards.push(board);

        _totalBounty += bounty;

        if ( writerGateToken != address(0) ) {
            _contracts[writerGateToken] = IERC721(writerGateToken);
        }

        if ( voterGateToken != address(0) && voterGateToken != writerGateToken ) {
            _contracts[voterGateToken] = IERC721(voterGateToken);
        }

        emit NewBoardEvent(_boards.length - 1, msg.sender, name, description);
    }

    function addIdea(uint256 boardID, string memory ideaDescription, string memory ideaLink) public hasWriteAccess(boardID) {
        require(bytes(ideaDescription).length < 400, "Idea description too long!");
        Idea memory idea = Idea(ideaDescription, ideaLink, 0, msg.sender);
        _ideas[boardID].push(idea);
        
        uint256 uid = _ideas[boardID].length - 1;
        emit NewIdeaEvent(uid, boardID, msg.sender, ideaDescription, ideaLink);
    }

    function vote(uint256 boardID, uint256 uid) public hasVoteAccess(boardID, uid) {
        _voteCast[boardID][msg.sender][uid] = true;
        _ideas[boardID][uid].votes++;

        emit NewVoteEvent(uid, boardID, msg.sender, _ideas[boardID][uid].votes);
    }

    function closeBoard(uint256 boardID) public {
        require(boardID < _boards.length, "Invalid Board ID");
        require(_boards[boardID].admin == msg.sender, "You are not the Board Admin");

        uint256 boardIdeasCount = _ideas[boardID].length;
        uint256 highestVotesIdea = 0;

        if ( _boards[boardID].bounty > 0 && boardIdeasCount > 0 ) {
            for ( uint256 i = 1; i < boardIdeasCount; i++ ) {
                if ( _ideas[boardID][highestVotesIdea].votes < _ideas[boardID][i].votes ) {
                    highestVotesIdea = i;
                }
            }

            (bool success, ) = (_ideas[boardID][highestVotesIdea].owner).call{value: (_boards[boardID].bounty)}("");
            require(success);            
        }

        _boards[boardID].open = false;
        _totalBounty -= _boards[boardID].bounty;

        emit CloseBoardEvent(boardID);
    }

    function getBoards() public view returns(Board[] memory) {
        return _boards;
    }
    
    function getIdeas(uint256 boardID) public view returns(IdeaDTO[] memory) {
        uint256 boardIdeasCount = _ideas[boardID].length;
        IdeaDTO[] memory boardIdeas = new IdeaDTO[](boardIdeasCount);

        for ( uint256 i = 0; i < boardIdeasCount; i++ ) {
            boardIdeas[i] = IdeaDTO(_ideas[boardID][i].idea, _ideas[boardID][i].link, _ideas[boardID][i].votes, _ideas[boardID][i].owner, boardID, i, _voteCast[boardID][msg.sender][i]);
        }

        return boardIdeas;
    }

    function getUserIdeas() public view returns(IdeaDTO[] memory) {
        uint256 userIdeasCount = 0;
        for ( uint256 i = 0; i < _boards.length; i++ ) {
            for ( uint256 j = 0; j < _ideas[i].length; j++ ) {
                if ( _ideas[i][j].owner == msg.sender ) {
                    userIdeasCount++;
                }
            }
        }

        IdeaDTO[] memory userIdeas = new IdeaDTO[](userIdeasCount);
        uint256 k = 0;
        for ( uint256 i = 0; i < _boards.length; i++ ) {
            for ( uint256 j = 0; j < _ideas[i].length; j++ ) {
                if ( _ideas[i][j].owner == msg.sender ) {
                    Idea memory idea = _ideas[i][j];
                    userIdeas[k] = IdeaDTO(idea.idea, idea.link, idea.votes, idea.owner, i, j, false);
                    k++;
                }
            }
        }

        return userIdeas;
    }

    function canVote(uint256 boardID, uint256 uid) public view returns(bool) {
        require(canVoteInBoard(boardID), "No voting rights");
        require(uid < _ideas[boardID].length, "Invalid UID");

        return _ideas[boardID][uid].owner != msg.sender && !_voteCast[boardID][msg.sender][uid];
    }

    function canVoteInBoard(uint256 boardID) public view returns(bool) {
        require(boardID < _boards.length, "Invalid Board ID");
        Board memory board = _boards[boardID];

        bool hasGateAccess = false;
        if ( board.voterGateToken == address(0) ) {
            hasGateAccess = _tokenContract.balanceOf(msg.sender) > 0;
        } else {
            hasGateAccess = _contracts[board.voterGateToken].balanceOf(msg.sender) > 0;
        }

        return board.open && hasGateAccess;
    }

    function canWrite(uint256 boardID) public view returns(bool) {
        require(boardID < _boards.length, "Invalid Board ID");
        Board memory board = _boards[boardID];

        bool hasGateAccess = false;
        if ( board.writerGateToken == address(0) ) {
            hasGateAccess = _tokenContract.balanceOf(msg.sender) > 0;
        } else {
            hasGateAccess = _contracts[board.writerGateToken].balanceOf(msg.sender) > 0;
        }

        return board.open && hasGateAccess;
    }

    function isHunter() public view returns(bool) {
        return _tokenContract.balanceOf(msg.sender) > 0;
    }
}