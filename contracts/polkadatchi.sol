// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title TamagotchiPet
 * @dev A blockchain-based virtual pet game where pets are NFTs with stats that decay over time
 */
contract TamagotchiPet is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    

    uint256 public constant MINT_PRICE = 0.01 ether;
    uint256 public constant MAX_STAT = 100;
    uint256 public constant DECAY_RATE = 1; // points per hour
    uint256 public constant FEED_INCREASE = 20;
    uint256 public constant PLAY_INCREASE = 15;
    

    struct Pet {
        string name;
        uint256 hunger; 
        uint256 happiness; 
        uint256 lastUpdate; 
        bool isAlive;
        uint256 birthTime;
        address owner;
    }
    
    // Mappings
    mapping(uint256 => Pet) public pets;
    mapping(address => uint256[]) public ownerToPets;
    
    // Events
    event PetMinted(uint256 indexed tokenId, address indexed owner, string name);
    event PetFed(uint256 indexed tokenId, uint256 newHunger);
    event PetPlayed(uint256 indexed tokenId, uint256 newHappiness);
    event PetDied(uint256 indexed tokenId, string cause);
    event StatsDecayed(uint256 indexed tokenId, uint256 hunger, uint256 happiness);
    
    constructor() ERC721("TamagotchiPet", "TAMA") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a new pet NFT
     * @param name The name for the new pet
     */
    function mintPet(string memory name) external payable {
        require(msg.value >= MINT_PRICE, "Insufficient payment for minting");
        require(bytes(name).length > 0, "Pet name cannot be empty");
        require(bytes(name).length <= 32, "Pet name too long");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        

        pets[tokenId] = Pet({
            name: name,
            hunger: 50,
            happiness: 50,
            lastUpdate: block.timestamp,
            isAlive: true,
            birthTime: block.timestamp,
            owner: msg.sender
        });
        
        // Add to owner's pet list
        ownerToPets[msg.sender].push(tokenId);
        

        _safeMint(msg.sender, tokenId);
        
        emit PetMinted(tokenId, msg.sender, name);
    }
    
    /**
     * @dev Feed the pet to increase hunger stat
     * @param tokenId The ID of the pet to feed
     */
    function feedPet(uint256 tokenId) external {
        require(_ownerOf(tokenId) != address(0), "Pet does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this pet");
        
        Pet storage pet = pets[tokenId];
        require(pet.isAlive, "Pet is dead");
        
        // Update stats first to check if pet died from decay
        _updatePetStats(tokenId);
        
        if (!pet.isAlive) {
            return; 
        }
        
        // Increase hunger (capped at MAX_STAT)
        pet.hunger = pet.hunger + FEED_INCREASE > MAX_STAT ? MAX_STAT : pet.hunger + FEED_INCREASE;
        pet.lastUpdate = block.timestamp;
        
        emit PetFed(tokenId, pet.hunger);
    }
    
    /**
     * @dev Play with the pet to increase happiness stat
     * @param tokenId The ID of the pet to play with
     */
    function playWithPet(uint256 tokenId) external {
        require(_ownerOf(tokenId) != address(0), "Pet does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this pet");
        
        Pet storage pet = pets[tokenId];
        require(pet.isAlive, "Pet is dead");
        

        _updatePetStats(tokenId);
        
        if (!pet.isAlive) {
            return; 
        }
        
        // Increase happiness (capped at MAX_STAT)
        pet.happiness = pet.happiness + PLAY_INCREASE > MAX_STAT ? MAX_STAT : pet.happiness + PLAY_INCREASE;
        pet.lastUpdate = block.timestamp;
        
        emit PetPlayed(tokenId, pet.happiness);
    }
    
    /**
     * @dev Update pet stats based on time passed since last interaction
     * @param tokenId The ID of the pet to update
     */
    function _updatePetStats(uint256 tokenId) internal {
        Pet storage pet = pets[tokenId];
        
        if (!pet.isAlive) {
            return;
        }
        
        uint256 timePassed = block.timestamp - pet.lastUpdate;
        uint256 hoursDecay = timePassed / 3600;
        
        if (hoursDecay > 0) {
            uint256 decay = hoursDecay * DECAY_RATE;
            
            // Apply decay to stats
            pet.hunger = pet.hunger > decay ? pet.hunger - decay : 0;
            pet.happiness = pet.happiness > decay ? pet.happiness - decay : 0;
            
            emit StatsDecayed(tokenId, pet.hunger, pet.happiness);
            
            // Check if pet died
            if (pet.hunger == 0 || pet.happiness == 0) {
                pet.isAlive = false;
                string memory cause = pet.hunger == 0 ? "starvation" : "sadness";
                emit PetDied(tokenId, cause);
            }
        }
    }
    
    /**
     * @dev Get current pet stats (automatically updates decay)
     * @param tokenId The ID of the pet
     * @return Pet data including current stats
     */
    function getPetStats(uint256 tokenId) external returns (Pet memory) {
        require(_ownerOf(tokenId) != address(0), "Pet does not exist");
        
        _updatePetStats(tokenId);
        return pets[tokenId];
    }
    
    /**
     * @dev Get pet stats without updating (view only)
     * @param tokenId The ID of the pet
     * @return Pet data with potentially outdated stats
     */
    function getPetStatsView(uint256 tokenId) external view returns (Pet memory) {
        require(_ownerOf(tokenId) != address(0), "Pet does not exist");
        return pets[tokenId];
    }
    
    /**
     * @dev Get all pets owned by an address
     * @param owner The address to query
     * @return Array of token IDs owned by the address
     */
    function getPetsByOwner(address owner) external view returns (uint256[] memory) {
        return ownerToPets[owner];
    }
    
    /**
     * @dev Calculate current pet stats without updating storage (for frontend)
     * @param tokenId The ID of the pet
     * @return currentHunger Current hunger after decay
     * @return currentHappiness Current happiness after decay
     * @return isCurrentlyAlive Whether pet would be alive after decay
     */
    function calculateCurrentStats(uint256 tokenId) external view returns (
        uint256 currentHunger,
        uint256 currentHappiness,
        bool isCurrentlyAlive
    ) {
        require(_ownerOf(tokenId) != address(0), "Pet does not exist");
        
        Pet memory pet = pets[tokenId];
        
        if (!pet.isAlive) {
            return (0, 0, false);
        }
        
        uint256 timePassed = block.timestamp - pet.lastUpdate;
        uint256 hoursDecay = timePassed / 3600;
        
        if (hoursDecay > 0) {
            uint256 decay = hoursDecay * DECAY_RATE;
            currentHunger = pet.hunger > decay ? pet.hunger - decay : 0;
            currentHappiness = pet.happiness > decay ? pet.happiness - decay : 0;
        } else {
            currentHunger = pet.hunger;
            currentHappiness = pet.happiness;
        }
        
        isCurrentlyAlive = currentHunger > 0 && currentHappiness > 0;
    }
    
    /**
     * @dev Get pet age in seconds
     * @param tokenId The ID of the pet
     * @return Age of the pet in seconds
     */
    function getPetAge(uint256 tokenId) external view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Pet does not exist");
        return block.timestamp - pets[tokenId].birthTime;
    }
    
    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Get contract balance
     * @return Current contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Override transfer functions to update pet owner in struct
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        address previousOwner = super._update(to, tokenId, auth);
        
        if (from != address(0) && to != address(0) && from != to) {
            // Update pet owner
            pets[tokenId].owner = to;
            
            // Remove from old owner's list
            _removePetFromOwner(from, tokenId);
            
            // Add to new owner's list  
            ownerToPets[to].push(tokenId);
        } else if (from == address(0) && to != address(0)) {
            // Minting case - already handled in mintPet function
        }
        
        return previousOwner;
    }
    
    /**
     * @dev Remove pet from owner's pet list
     */
    function _removePetFromOwner(address owner, uint256 tokenId) internal {
        uint256[] storage petList = ownerToPets[owner];
        for (uint256 i = 0; i < petList.length; i++) {
            if (petList[i] == tokenId) {
                petList[i] = petList[petList.length - 1];
                petList.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Get total number of minted pets
     * @return Total supply of pets
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Emergency function to update a pet's stats manually (only owner)
     * This is for extreme cases and debugging
     */
    function emergencyUpdatePet(
        uint256 tokenId,
        uint256 newHunger,
        uint256 newHappiness,
        bool newIsAlive
    ) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Pet does not exist");
        require(newHunger <= MAX_STAT && newHappiness <= MAX_STAT, "Stats exceed maximum");
        
        Pet storage pet = pets[tokenId];
        pet.hunger = newHunger;
        pet.happiness = newHappiness;
        pet.isAlive = newIsAlive;
        pet.lastUpdate = block.timestamp;
    }
}