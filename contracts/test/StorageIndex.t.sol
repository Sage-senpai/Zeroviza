// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {StorageIndex} from "../src/StorageIndex.sol";

contract StorageIndexTest is Test {
    StorageIndex public index;
    address owner = address(this);
    address operator = address(0xBEEF);
    address user1 = address(0x1111);
    address user2 = address(0x2222);
    address outsider = address(0xDEAD);

    function setUp() public {
        index = new StorageIndex(operator);
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    function test_constructor() public view {
        assertEq(index.owner(), owner);
        assertEq(index.operator(), operator);
    }

    function test_constructor_revert_zeroOperator() public {
        vm.expectRevert(StorageIndex.ZeroAddress.selector);
        new StorageIndex(address(0));
    }

    // ─── updateRoots ─────────────────────────────────────────────────────────

    function test_updateRoots_asOwner() public {
        index.updateRoots(user1, "histHash1", "profHash1", "docsHash1");

        (string memory h, string memory p, string memory d) = index.getRoots(user1);
        assertEq(h, "histHash1");
        assertEq(p, "profHash1");
        assertEq(d, "docsHash1");
    }

    function test_updateRoots_asOperator() public {
        vm.prank(operator);
        index.updateRoots(user1, "h1", "p1", "d1");

        (string memory h, string memory p, string memory d) = index.getRoots(user1);
        assertEq(h, "h1");
        assertEq(p, "p1");
        assertEq(d, "d1");
    }

    function test_updateRoots_partialUpdate() public {
        index.updateRoots(user1, "h1", "p1", "d1");

        // Only update historyRoot — empty strings leave others unchanged
        index.updateRoots(user1, "h2", "", "");

        (string memory h, string memory p, string memory d) = index.getRoots(user1);
        assertEq(h, "h2");
        assertEq(p, "p1");  // unchanged
        assertEq(d, "d1");  // unchanged
    }

    function test_updateRoots_revert_unauthorized() public {
        vm.prank(outsider);
        vm.expectRevert(StorageIndex.Unauthorized.selector);
        index.updateRoots(user1, "h", "p", "d");
    }

    function test_updateRoots_revert_zeroUser() public {
        vm.expectRevert(StorageIndex.ZeroAddress.selector);
        index.updateRoots(address(0), "h", "p", "d");
    }

    function test_getRoots_empty() public view {
        (string memory h, string memory p, string memory d) = index.getRoots(user2);
        assertEq(bytes(h).length, 0);
        assertEq(bytes(p).length, 0);
        assertEq(bytes(d).length, 0);
    }

    function test_multipleUsers() public {
        index.updateRoots(user1, "h1", "p1", "d1");
        index.updateRoots(user2, "h2", "p2", "d2");

        (string memory h1,,) = index.getRoots(user1);
        (string memory h2,,) = index.getRoots(user2);
        assertEq(h1, "h1");
        assertEq(h2, "h2");
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    function test_setOperator() public {
        address newOp = address(0xCAFE);
        index.setOperator(newOp);
        assertEq(index.operator(), newOp);

        // New operator can update
        vm.prank(newOp);
        index.updateRoots(user1, "x", "y", "z");

        (string memory h,,) = index.getRoots(user1);
        assertEq(h, "x");
    }

    function test_setOperator_revert_notOwner() public {
        vm.prank(outsider);
        vm.expectRevert(StorageIndex.Unauthorized.selector);
        index.setOperator(outsider);
    }

    function test_setOperator_revert_zero() public {
        vm.expectRevert(StorageIndex.ZeroAddress.selector);
        index.setOperator(address(0));
    }

    function test_transferOwnership() public {
        address newOwner = address(0xAAAA);
        index.transferOwnership(newOwner);
        assertEq(index.owner(), newOwner);
    }

    function test_transferOwnership_revert_notOwner() public {
        vm.prank(outsider);
        vm.expectRevert(StorageIndex.Unauthorized.selector);
        index.transferOwnership(outsider);
    }

    function test_transferOwnership_revert_zero() public {
        vm.expectRevert(StorageIndex.ZeroAddress.selector);
        index.transferOwnership(address(0));
    }
}
