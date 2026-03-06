// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  LawyerRegistry
 * @notice On-chain verification registry for accredited immigration lawyers on Abobi Legal.
 *         The contract owner (deployer) is the admin who approves/rejects applications.
 *         An operator (server wallet) can submit applications on behalf of users.
 *         Profile metadata lives on 0G Storage; the contract stores the root hash as metadataURI.
 *
 * @dev    Deployed on 0G Galileo Testnet (chainId 16602).
 */
contract LawyerRegistry {

    // ─── Types ────────────────────────────────────────────────────────────────

    enum Status { None, Pending, Verified, Rejected }

    struct LawyerRecord {
        Status   status;
        string   metadataURI;   // 0G Storage root hash pointing to the full profile JSON
        uint256  appliedAt;     // unix timestamp
        uint256  verifiedAt;    // unix timestamp (0 if not yet verified)
        string   rejectionReason;
    }

    // ─── State ────────────────────────────────────────────────────────────────

    address public owner;
    address public operator;
    mapping(address => LawyerRecord) public lawyers;
    address[] private _verifiedList;
    address[] private _applicants;
    mapping(address => bool) private _hasApplied;

    // ─── Events ───────────────────────────────────────────────────────────────

    event ApplicationSubmitted(address indexed wallet, uint256 timestamp);
    event LawyerVerified(address indexed wallet, uint256 timestamp);
    event LawyerRejected(address indexed wallet, string reason, uint256 timestamp);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event OperatorUpdated(address indexed newOperator);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error Unauthorized();
    error AlreadyVerified();
    error NotPending();
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
        owner = msg.sender;
        operator = _operator;
        emit OwnershipTransferred(address(0), msg.sender);
        if (_operator != address(0)) {
            emit OperatorUpdated(_operator);
        }
    }

    // ─── Public functions ─────────────────────────────────────────────────────

    /**
     * @notice Submit (or re-submit) a lawyer verification application.
     *         Can be called directly by the applicant.
     * @param  metadataURI  0G Storage root hash pointing to full profile JSON.
     */
    function applyForVerification(string calldata metadataURI) external {
        _apply(msg.sender, metadataURI);
    }

    /**
     * @notice Submit (or re-submit) an application on behalf of a user.
     *         Only callable by owner or operator (server wallet).
     * @param  wallet       The applicant's wallet address.
     * @param  metadataURI  0G Storage root hash pointing to full profile JSON.
     */
    function applyOnBehalf(address wallet, string calldata metadataURI) external onlyAuthorized {
        if (wallet == address(0)) revert ZeroAddress();
        _apply(wallet, metadataURI);
    }

    // ─── Admin functions ────────────────────────────────────────────────────

    function verifyLawyer(address wallet) external onlyOwner {
        if (lawyers[wallet].status != Status.Pending) revert NotPending();
        lawyers[wallet].status    = Status.Verified;
        lawyers[wallet].verifiedAt = block.timestamp;
        _verifiedList.push(wallet);
        emit LawyerVerified(wallet, block.timestamp);
    }

    function rejectLawyer(address wallet, string calldata reason) external onlyOwner {
        if (lawyers[wallet].status != Status.Pending) revert NotPending();
        lawyers[wallet].status          = Status.Rejected;
        lawyers[wallet].rejectionReason = reason;
        emit LawyerRejected(wallet, reason, block.timestamp);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function setOperator(address newOperator) external onlyOwner {
        operator = newOperator;
        emit OperatorUpdated(newOperator);
    }

    // ─── View functions ──────────────────────────────────────────────────────

    function isVerified(address wallet) external view returns (bool) {
        return lawyers[wallet].status == Status.Verified;
    }

    function getStatus(address wallet) external view returns (Status) {
        return lawyers[wallet].status;
    }

    /**
     * @notice Returns the full record for a wallet (for off-chain reads).
     */
    function getRecord(address wallet) external view returns (
        Status   status,
        string memory metadataURI,
        uint256  appliedAt,
        uint256  verifiedAt,
        string memory rejectionReason
    ) {
        LawyerRecord storage r = lawyers[wallet];
        return (r.status, r.metadataURI, r.appliedAt, r.verifiedAt, r.rejectionReason);
    }

    function verifiedCount() external view returns (uint256) {
        return _verifiedList.length;
    }

    function verifiedAt(uint256 index) external view returns (address) {
        return _verifiedList[index];
    }

    function applicantCount() external view returns (uint256) {
        return _applicants.length;
    }

    function applicantAt(uint256 index) external view returns (address) {
        return _applicants[index];
    }

    // ─── Internal ────────────────────────────────────────────────────────────

    function _apply(address wallet, string calldata metadataURI) internal {
        if (lawyers[wallet].status == Status.Verified) revert AlreadyVerified();

        lawyers[wallet] = LawyerRecord({
            status:          Status.Pending,
            metadataURI:     metadataURI,
            appliedAt:       block.timestamp,
            verifiedAt:      0,
            rejectionReason: ""
        });

        if (!_hasApplied[wallet]) {
            _hasApplied[wallet] = true;
            _applicants.push(wallet);
        }

        emit ApplicationSubmitted(wallet, block.timestamp);
    }
}
