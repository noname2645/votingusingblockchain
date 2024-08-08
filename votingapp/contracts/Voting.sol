// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    mapping(uint256 => uint256) public votes;
    mapping(address => bool) public hasVoted;

    string[] public candidates = ["Apple", "Banana", "Cherry", "Date"];

    function vote(uint256 candidateId) public {
        require(!hasVoted[msg.sender], "You have already voted");
        require(candidateId < candidates.length, "Invalid candidate");

        votes[candidateId]++;
        hasVoted[msg.sender] = true;
    }

    function getVotes(uint256 candidateId) public view returns (uint256) {
        require(candidateId < candidates.length, "Invalid candidate");
        return votes[candidateId];
    }

    function getCandidates() public view returns (string[] memory) {
        return candidates;
    }
}