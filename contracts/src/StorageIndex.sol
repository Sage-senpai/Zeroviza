// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  StorageIndex
 * @notice On-chain index that maps wallet addresses to their 0G Storage root hashes.
 *         Replaces SQLite — the contract is the mutable pointer; actual data lives on 0G.
 *
 *         Three root hashes per user:
 *           - historyRoot   → JSONL of chat messages on 0G Storage
 *           - profileRoot   → JSON user profile on 0G Storage
 *           - documentsRoot → JSON array of document metadata on 0G Storage
 *
 *         An operator (server wallet) can update mappings on behalf of users.
 *
 * @dev    Deployed on 0G Galileo Testnet (chainId 16602).
 */
contract StorageIndex {

    // ─── Types ────────────────────────────────────────────────────────────────

    struct Roots {
        string historyRoot;
        string profileRoot;
        string documentsRoot;
    }

    // ─── State ────────────────────────────────────────────────────────────────

    address public owner;
    address public operator;
    mapping(address => Roots) private _roots;

    // ─── Events ───────────────────────────────────────────────────────────────

    event RootsUpdated(address indexed user, string historyRoot, string profileRoot, string documentsRoot);
    event OperatorUpdated(address indexed newOperator);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error Unauthorized();
    error ZeroAddress();

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyAuthorized() {
        if (msg.sender != owner && msg.sender != operator) revert Unauthorized();
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address _operator) {
        if (_operator == address(0)) revert ZeroAddress();
        owner = msg.sender;
        operator = _operator;
        emit OwnershipTransferred(address(0), msg.sender);
        emit OperatorUpdated(_operator);
    }

    // ─── Write functions ─────────────────────────────────────────────────────

    /**
     * @notice Update all three root hashes for a user.
     *         Pass empty string to leave a root unchanged.
     */
    function updateRoots(
        address user,
        string calldata historyRoot,
        string calldata profileRoot,
        string calldata documentsRoot
    ) external onlyAuthorized {
        if (user == address(0)) revert ZeroAddress();

        Roots storage r = _roots[user];

        if (bytes(historyRoot).length > 0)   r.historyRoot   = historyRoot;
        if (bytes(profileRoot).length > 0)   r.profileRoot   = profileRoot;
        if (bytes(documentsRoot).length > 0) r.documentsRoot = documentsRoot;

        emit RootsUpdated(user, r.historyRoot, r.profileRoot, r.documentsRoot);
    }

    // ─── View functions ──────────────────────────────────────────────────────

    /**
     * @notice Get all root hashes for a user.
     */
    function getRoots(address user) external view returns (
        string memory historyRoot,
        string memory profileRoot,
        string memory documentsRoot
    ) {
        Roots storage r = _roots[user];
        return (r.historyRoot, r.profileRoot, r.documentsRoot);
    }

    // ─── Admin functions ─────────────────────────────────────────────────────

    function setOperator(address newOperator) external onlyOwner {
        if (newOperator == address(0)) revert ZeroAddress();
        operator = newOperator;
        emit OperatorUpdated(newOperator);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
