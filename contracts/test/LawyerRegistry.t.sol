// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {LawyerRegistry} from "../src/LawyerRegistry.sol";

contract LawyerRegistryTest is Test {
    LawyerRegistry public registry;
    address owner = address(this);
    address operator = address(0xBEEF);
    address applicant1 = address(0x1111);
    address applicant2 = address(0x2222);
    address outsider = address(0xDEAD);

    function setUp() public {
        registry = new LawyerRegistry(operator);
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    function test_constructor() public view {
        assertEq(registry.owner(), owner);
        assertEq(registry.operator(), operator);
    }

    // ─── applyForVerification (direct) ───────────────────────────────────────

    function test_applyDirect() public {
        vm.prank(applicant1);
        registry.applyForVerification("rootHash123");

        assertEq(uint(registry.getStatus(applicant1)), uint(LawyerRegistry.Status.Pending));
        assertEq(registry.applicantCount(), 1);
        assertEq(registry.applicantAt(0), applicant1);
    }

    function test_applyDirect_emitsEvent() public {
        vm.prank(applicant1);
        vm.expectEmit(true, false, false, false);
        emit LawyerRegistry.ApplicationSubmitted(applicant1, block.timestamp);
        registry.applyForVerification("rootHash123");
    }

    // ─── applyOnBehalf (operator) ────────────────────────────────────────────

    function test_applyOnBehalf_asOperator() public {
        vm.prank(operator);
        registry.applyOnBehalf(applicant1, "rootHash456");

        assertEq(uint(registry.getStatus(applicant1)), uint(LawyerRegistry.Status.Pending));
        assertEq(registry.applicantCount(), 1);
    }

    function test_applyOnBehalf_asOwner() public {
        registry.applyOnBehalf(applicant1, "rootHash789");
        assertEq(uint(registry.getStatus(applicant1)), uint(LawyerRegistry.Status.Pending));
    }

    function test_applyOnBehalf_revert_unauthorized() public {
        vm.prank(outsider);
        vm.expectRevert(LawyerRegistry.Unauthorized.selector);
        registry.applyOnBehalf(applicant1, "hash");
    }

    function test_applyOnBehalf_revert_zeroAddress() public {
        vm.prank(operator);
        vm.expectRevert(LawyerRegistry.ZeroAddress.selector);
        registry.applyOnBehalf(address(0), "hash");
    }

    // ─── Re-application after rejection ──────────────────────────────────────

    function test_reapplyAfterRejection() public {
        vm.prank(operator);
        registry.applyOnBehalf(applicant1, "hash1");

        registry.rejectLawyer(applicant1, "bad docs");

        vm.prank(operator);
        registry.applyOnBehalf(applicant1, "hash2");

        assertEq(uint(registry.getStatus(applicant1)), uint(LawyerRegistry.Status.Pending));
        // No duplicate in applicants
        assertEq(registry.applicantCount(), 1);
    }

    function test_reapply_revert_alreadyVerified() public {
        vm.prank(operator);
        registry.applyOnBehalf(applicant1, "hash1");
        registry.verifyLawyer(applicant1);

        vm.prank(operator);
        vm.expectRevert(LawyerRegistry.AlreadyVerified.selector);
        registry.applyOnBehalf(applicant1, "hash2");
    }

    // ─── verifyLawyer ────────────────────────────────────────────────────────

    function test_verifyLawyer() public {
        vm.prank(operator);
        registry.applyOnBehalf(applicant1, "hash");
        registry.verifyLawyer(applicant1);

        assertTrue(registry.isVerified(applicant1));
        assertEq(registry.verifiedCount(), 1);
        assertEq(registry.verifiedAt(0), applicant1);
    }

    function test_verifyLawyer_revert_notPending() public {
        vm.expectRevert(LawyerRegistry.NotPending.selector);
        registry.verifyLawyer(applicant1);
    }

    function test_verifyLawyer_revert_notOwner() public {
        vm.prank(operator);
        registry.applyOnBehalf(applicant1, "hash");

        vm.prank(operator);
        vm.expectRevert(LawyerRegistry.Unauthorized.selector);
        registry.verifyLawyer(applicant1);
    }

    // ─── rejectLawyer ────────────────────────────────────────────────────────

    function test_rejectLawyer() public {
        vm.prank(operator);
        registry.applyOnBehalf(applicant1, "hash");
        registry.rejectLawyer(applicant1, "insufficient docs");

        assertEq(uint(registry.getStatus(applicant1)), uint(LawyerRegistry.Status.Rejected));
    }

    function test_rejectLawyer_revert_notPending() public {
        vm.expectRevert(LawyerRegistry.NotPending.selector);
        registry.rejectLawyer(applicant1, "reason");
    }

    function test_rejectLawyer_revert_notOwner() public {
        vm.prank(operator);
        registry.applyOnBehalf(applicant1, "hash");

        vm.prank(outsider);
        vm.expectRevert(LawyerRegistry.Unauthorized.selector);
        registry.rejectLawyer(applicant1, "nope");
    }

    // ─── getRecord ───────────────────────────────────────────────────────────

    function test_getRecord() public {
        vm.prank(operator);
        registry.applyOnBehalf(applicant1, "myRootHash");

        (
            LawyerRegistry.Status status,
            string memory metadataURI,
            uint256 appliedAt,
            uint256 verifiedAt,
            string memory rejectionReason
        ) = registry.getRecord(applicant1);

        assertEq(uint(status), uint(LawyerRegistry.Status.Pending));
        assertEq(metadataURI, "myRootHash");
        assertGt(appliedAt, 0);
        assertEq(verifiedAt, 0);
        assertEq(bytes(rejectionReason).length, 0);
    }

    function test_getRecord_empty() public view {
        (LawyerRegistry.Status status,,,, ) = registry.getRecord(outsider);
        assertEq(uint(status), uint(LawyerRegistry.Status.None));
    }

    // ─── Applicant enumeration ───────────────────────────────────────────────

    function test_applicantEnumeration() public {
        vm.prank(operator);
        registry.applyOnBehalf(applicant1, "h1");
        vm.prank(operator);
        registry.applyOnBehalf(applicant2, "h2");

        assertEq(registry.applicantCount(), 2);
        assertEq(registry.applicantAt(0), applicant1);
        assertEq(registry.applicantAt(1), applicant2);
    }

    // ─── Verified list ───────────────────────────────────────────────────────

    function test_verifiedList() public {
        vm.prank(operator);
        registry.applyOnBehalf(applicant1, "h1");
        vm.prank(operator);
        registry.applyOnBehalf(applicant2, "h2");

        registry.verifyLawyer(applicant1);
        registry.verifyLawyer(applicant2);

        assertEq(registry.verifiedCount(), 2);
        assertEq(registry.verifiedAt(0), applicant1);
        assertEq(registry.verifiedAt(1), applicant2);
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    function test_setOperator() public {
        address newOp = address(0xCAFE);
        registry.setOperator(newOp);
        assertEq(registry.operator(), newOp);
    }

    function test_setOperator_revert_notOwner() public {
        vm.prank(outsider);
        vm.expectRevert(LawyerRegistry.Unauthorized.selector);
        registry.setOperator(outsider);
    }

    function test_transferOwnership() public {
        address newOwner = address(0xAAAA);
        registry.transferOwnership(newOwner);
        assertEq(registry.owner(), newOwner);
    }

    function test_transferOwnership_revert_zero() public {
        vm.expectRevert(LawyerRegistry.ZeroAddress.selector);
        registry.transferOwnership(address(0));
    }

    function test_transferOwnership_revert_notOwner() public {
        vm.prank(outsider);
        vm.expectRevert(LawyerRegistry.Unauthorized.selector);
        registry.transferOwnership(outsider);
    }
}
