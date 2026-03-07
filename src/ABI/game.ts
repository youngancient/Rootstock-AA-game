export const GAME_ABI = [
    "event GoldMined(address indexed miner, uint256 amount)",
    "event PickaxeUpgraded(address indexed miner, uint256 newLevel)",

    // Read Functions (Views)
    "function BASE_MINE_AMOUNT() view returns (uint256)",
    "function UPGRADE_BASE_COST() view returns (uint256)",
    "function getPlayerStats(address _player) view returns (uint256 gold, uint256 level, uint256 nextUpgradeCost)",
    "function getUpgradeCost(address _player) view returns (uint256)",
    "function goldBalance(address) view returns (uint256)",
    "function pickaxeLevel(address) view returns (uint256)",

    // Write Functions (Transactions)
    "function mineGold()",
    "function upgradePickaxe()"
];
// paste in the ABI of the game contract here