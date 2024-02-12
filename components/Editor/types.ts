export enum LogType {
  Error,
  Info,
  Warn
}

export enum CodeType {
  Cairo = 'Cairo',
  Sierra = 'Sierra',
  CASM = 'CASM',
}

export enum ValueUnit {
  Wei = 'Wei',
  Gwei = 'Gwei',
  Finney = 'Finney',
  Ether = 'Ether',
}

export interface IConsoleOutput {
  type: LogType,
  message: string
}

export type ExampleCode = {
  [codeType in CodeType]: string[]
}

export interface MethodAbiInput {
  internalType: string
  name: string
  type: string
}

export interface Contract {
  code: string
  name: string
  abi: Array<MethodAbi>
}

export interface MethodAbi {
  name: string
  inputs: MethodAbiInput[]
  outputs: MethodAbiInput[]
  inputTypes: string
  stateMutability: 'nonpayable' | 'view' | 'payable'
  type: 'constructor' | 'function' | 'compiler'
}
