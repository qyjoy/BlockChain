import Web3 from 'web3';
import { getContractConfig, type ContractConfig } from './contract-config';
import { ensureSupportedNetwork, getEthereumProvider, type EthereumProvider } from './ethereum';

export interface HashData {
  hash: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  timestamp: number;
}

export class Web3Service {
  private web3: Web3;
  private contract: any;
  private contractConfig: ContractConfig | null = null;
  private provider: EthereumProvider;

  constructor() {
    this.provider = getEthereumProvider();
    this.web3 = new Web3(this.provider as any);
  }

  async initialize(): Promise<void> {
    try {
      await ensureSupportedNetwork(this.provider);

      // Get contract configuration
      this.contractConfig = await getContractConfig();
      
      // Initialize contract
      this.contract = new this.web3.eth.Contract(
        this.contractConfig.abi,
        this.contractConfig.address
      );

      // Listen for network changes
      this.provider.on?.('chainChanged', () => {
        window.location.reload();
      });

    } catch (error: any) {
      throw new Error(`Failed to initialize Web3Service: ${error.message}`);
    }
  }

  async getContractAddress(): Promise<string> {
    if (!this.contractConfig) {
      throw new Error('Contract not initialized');
    }
    return this.contractConfig.address;
  }

  async getNetworkName(): Promise<string> {
    if (this.contractConfig) {
      return this.contractConfig.networkName;
    }

    const networkId = await this.web3.eth.net.getId();
    return `Network ${networkId.toString()}`;
  }

  async getCurrentChainId(): Promise<string> {
    try {
      const chainIdHex = await this.provider.request({
        method: "eth_chainId",
      });
      return parseInt(chainIdHex, 16).toString();
    } catch (error: any) {
      throw new Error(error.message || "Failed to read current network");
    }
  }

  async connectWallet(): Promise<string[]> {
    try {
      const accounts = await this.provider.request({ 
        method: 'eth_requestAccounts' 
      });
      return accounts;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to connect wallet');
    }
  }

  async storeHash(
    hash: string, 
    fileName: string, 
    fileType: string,
    fileSize: string
  ): Promise<string> {
    this.ensureInitialized();
    try {
      const accounts = await this.connectWallet();
      const result = await this.contract.methods
        .storeHash(hash, fileName, fileType, fileSize)
        .send({
          from: accounts[0]
        });
      console.log("txhash:", result.transactionHash)

      return result.transactionHash;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to store hash');
    }
  }

  async getAllProtectedAssets(): Promise<HashData[]> {
    this.ensureInitialized();
    try {
      const hashes = await this.contract.methods.getAllHashes().call();
      const assets: HashData[] = [];

      for (const hash of hashes) {
        const data = await this.contract.methods.getHashData(hash).call();
        assets.push({
          hash: data[0],
          fileName: data[1],
          fileType: data[2],
          fileSize: data[3],
          timestamp: Number(data[4])
        });
      }

      return assets;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch protected assets');
    }
  }

  async verifyHash(hash: string): Promise<{
    exists: boolean;
    fileName?: string;
    fileType?: string;
    fileSize?: string;
    timestamp?: number;
    transactionHash?: string;
  }> {
    this.ensureInitialized();
    try {
      const exists = await this.contract.methods.hashExists(hash).call();
      if (exists) {
        const data = await this.contract.methods.getHashData(hash).call();
        console.log("hash",hash);
        return { 
          exists, 
          fileName: data[1],
          fileType: data[2],
          fileSize: data[3],
          timestamp: Number(data[4]),
          transactionHash: hash
        };
      }
      return { exists };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to verify hash');
    }
  }

  async getHashTransactionHash(hash: string): Promise<string> {
    this.ensureInitialized();
    try {
      // Get past events for the HashStored event (this is the event name from your smart contract)
      const events = await this.contract.getPastEvents('HashStored', {
        filter: { hash: hash },
        fromBlock: 0,
        toBlock: 'latest'
      });

      if (events.length === 0) {
        throw new Error('No transaction found for this hash');
      }

      // Return the transaction hash of the event
      return events[0].transactionHash;
    } catch (error: any) {
      throw new Error(`Failed to get transaction hash: ${error.message}`);
    }
  }

  getBlockExplorerUrl(txHash: string): string | null {
    if (!this.contractConfig?.explorerTxBaseUrl) {
      return null;
    }

    return `${this.contractConfig.explorerTxBaseUrl}${txHash}`;
  }

  // Add check for contract initialization
  private ensureInitialized() {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }
  }
} 
