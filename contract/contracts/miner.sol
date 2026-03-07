// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Miner {
    mapping(address => uint256) public goldBalance;
    mapping(address => uint256) public pickaxeLevel;

    event GoldMined(address indexed miner, uint256 amount);
    event PickaxeUpgraded(address indexed miner, uint256 newLevel);

    // Initial constants
    uint256 public constant BASE_MINE_AMOUNT = 1;
    uint256 public constant UPGRADE_BASE_COST = 10;

    constructor() {}

    // Function to mine gold. Higher pickaxe level = more gold.
    function mineGold() public {
        uint256 amount = BASE_MINE_AMOUNT + pickaxeLevel[msg.sender];
        goldBalance[msg.sender] += amount;
        emit GoldMined(msg.sender, amount);
    }

    // Function to upgrade pickaxe. Costs gold.
    function upgradePickaxe() public {
        uint256 cost = getUpgradeCost(msg.sender);
        require(goldBalance[msg.sender] >= cost, "Not enough gold to upgrade");

        goldBalance[msg.sender] -= cost;
        pickaxeLevel[msg.sender] += 1;
        
        emit PickaxeUpgraded(msg.sender, pickaxeLevel[msg.sender]);
    }

    // Helper to calculate upgrade cost based on current level
    function getUpgradeCost(address _player) public view returns (uint256) {
        // Simple linear scaling: 10, 20, 30...
        return UPGRADE_BASE_COST + (pickaxeLevel[_player] * UPGRADE_BASE_COST);
    }

    // Combined getter for UI efficiency
    function getPlayerStats(address _player) public view returns (uint256 gold, uint256 level, uint256 nextUpgradeCost) {
        return (goldBalance[_player], pickaxeLevel[_player], getUpgradeCost(_player));
    }
}
