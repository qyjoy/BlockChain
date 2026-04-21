// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HashStorage {
    // Structure to store hash and file information
    struct HashData {
        bytes32 hash;
        string fileName;
        string fileType;
        string fileSize;
        uint256 timestamp;
        bool exists;
    }
    
    // Mapping to store HashData by hash
    mapping(bytes32 => HashData) public hashRecords;
    
    // Array to store all hashes for retrieval
    bytes32[] public allHashes;
    
    // Event to emit when new hash is stored
    event HashStored(
        bytes32 indexed hash, 
        string fileName, 
        string fileType,
        string fileSize,
        uint256 timestamp
    );

    // Function to store a hash with file information
    function storeHash(
        bytes32 _hash, 
        string memory _fileName,
        string memory _fileType,
        string memory _fileSize
    ) public {
        require(!hashRecords[_hash].exists, "Hash already exists");
        
        hashRecords[_hash] = HashData({
            hash: _hash,
            fileName: _fileName,
            fileType: _fileType,
            fileSize: _fileSize,
            timestamp: block.timestamp,
            exists: true
        });
        
        allHashes.push(_hash);
        emit HashStored(_hash, _fileName, _fileType, _fileSize, block.timestamp);
    }
    
    // Function to retrieve hash data
    function getHashData(bytes32 _hash) public view returns (
        bytes32,
        string memory,
        string memory,
        string memory,
        uint256
    ) {
        require(hashRecords[_hash].exists, "Hash does not exist");
        
        HashData memory data = hashRecords[_hash];
        return (
            data.hash,
            data.fileName,
            data.fileType,
            data.fileSize,
            data.timestamp
        );
    }
    
    // Function to get all stored hashes
    function getAllHashes() public view returns (bytes32[] memory) {
        return allHashes;
    }
    
    // Function to check if hash exists
    function hashExists(bytes32 _hash) public view returns (bool) {
        return hashRecords[_hash].exists;
    }
}