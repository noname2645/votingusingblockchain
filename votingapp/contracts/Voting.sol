// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    // Event to be emitted when a vote is cast
    event VotedEvent(uint256 indexed candidateId);

    // Structure to store candidate details
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    // Mapping of candidate ID to Candidate details
    mapping(uint256 => Candidate) public candidates;
    
    // Mapping of voter addresses to their voting status
    mapping(address => bool) public voters;
    
    // Total number of candidates
    uint256 public candidatesCount;

    constructor() {
        // Initial candidates can be added in the constructor if needed
        addCandidate("Alice");
        addCandidate("Bob");
    }

    // Function to add a new candidate
    function addCandidate(string memory _name) public {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    // Function to vote for a candidate
    function vote(uint256 _candidateId) public {
        require(!voters[msg.sender], "You have already voted.");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID.");

        // Mark the voter as having voted
        voters[msg.sender] = true;

        // Increase the vote count for the chosen candidate
        candidates[_candidateId].voteCount++;

        // Emit the VotedEvent
        emit VotedEvent(_candidateId);
    }

    // Function to get candidate details
    function getCandidate(uint256 _candidateId) public view returns (uint256 id, string memory name, uint256 voteCount) {
        Candidate memory candidate = candidates[_candidateId];
        return (candidate.id, candidate.name, candidate.voteCount);
    }
}
