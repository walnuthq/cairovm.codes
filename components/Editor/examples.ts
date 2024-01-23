import { ExampleCode } from './types'

const examples: ExampleCode = {
  Solidity: [
    `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract Counter {
    uint public count;

    // Function to get the current count
    function get() public view returns (uint) {
        return count;
    }

    // Function to increment count by 1
    function inc() public {
        count += 1;
    }

    // Function to decrement count by 1
    function dec() public {
        count -= 1;
    }
}`,
  ],
  Cairo: [
`fn main() -> felt252 {
    1
}`
  ],
  Bytecode: ['604260005260206000F3'],
  Mnemonic: [
    `PUSH1 0x42
PUSH1 0
MSTORE
PUSH1 32
PUSH1 0
RETURN`,
  ],
}

export default examples
