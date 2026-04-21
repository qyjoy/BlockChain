"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Search, CheckCircle, XCircle } from "lucide-react"
import { FileUploader } from "@/components/file-uploader"
import { Web3Service } from "@/lib/web3"
import { generateFileHash } from "@/lib/hash"
import { toast, Toaster } from "sonner"

export default function VerifyPage() {
  const [verificationMethod, setVerificationMethod] = useState<"file" | "hash">("file")
  const [hashInput, setHashInput] = useState("")
  const [web3Service, setWeb3Service] = useState<Web3Service | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<{
    name: string;
    contractAddress: string;
  } | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    status: "success" | "error" | null
    message: string
    details?: {
      fileName?: string
      fileType?: string
      fileSize?: string
      timestamp?: string
      txHash?: string
      etherscanTxHash?: string
    }
  }>({ status: null, message: "" });

  // Initialize Web3Service when component mounts
  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        const service = new Web3Service();
        await service.initialize(); // Make sure to await initialization
        
        // Get network information
        const networkName = await service.getNetworkName();
        const contractAddress = await service.getContractAddress();
        
        setNetworkInfo({
          name: networkName,
          contractAddress: contractAddress
        });
        
        setWeb3Service(service);
        setIsInitialized(true);
        setInitError(null);
        
      } catch (error: any) {
        console.error('Initialization error:', error);
        setInitError(error.message || "Failed to initialize Web3");
        toast.error(`Failed to initialize: ${error.message}`);
      }
    };

    initializeWeb3();
  }, []);

  const ensureInitialized = async (): Promise<Web3Service | null> => {
    if (isInitialized && web3Service) {
      return web3Service;
    }

    try {
      const service = new Web3Service();
      await service.initialize();

      const networkName = await service.getNetworkName();
      const contractAddress = await service.getContractAddress();

      setNetworkInfo({
        name: networkName,
        contractAddress,
      });
      setWeb3Service(service);
      setIsInitialized(true);
      setInitError(null);
      return service;
    } catch (error: any) {
      const message = error.message || "Failed to initialize Web3";
      setInitError(message);
      toast.error(message);
      return null;
    }
  };

  const  handleFileUpload = async (files: File[]) => {
    const service = await ensureInitialized();
    if (!service) {
      toast.error(initError || "Please wait for Web3 initialization");
      return;
    }

    if (files.length === 0) return;

    try {
      setVerificationResult({ status: null, message: "Verifying file..." });

      const hash = await generateFileHash(files[0]);
      const result = await service.verifyHash(hash);

      if (result.exists) {
        const timestamp = new Date(result.timestamp! * 1000).toLocaleString();
        const txHash = await service.getHashTransactionHash(hash);

        setVerificationResult({
          status: "success",
          message: "File verified successfully!",
          details: {
            fileName: result.fileName,
            fileType: result.fileType,
            fileSize: result.fileSize,
            timestamp,
            txHash: hash,
            etherscanTxHash: txHash,
          },
        });
      } else {
        setVerificationResult({
          status: "error",
          message: "File not found in our records.",
        });
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationResult({
        status: "error",
        message: error.message || "Failed to verify file.",
      });
    }
  };

  const handleHashVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    const service = await ensureInitialized();
    if (!service) {
      toast.error(initError || "Please wait for Web3 initialization");
      return;
    }

    if (!hashInput) return;

    try {
      setVerificationResult({ status: null, message: "Verifying hash..." });
      
      const result = await service.verifyHash("0x"+hashInput);

      if (result.exists) {
        const timestamp = new Date(result.timestamp! * 1000).toLocaleString();
        
        // Get the actual transaction hash for Etherscan only
        const txHash = await service.getHashTransactionHash("0x"+hashInput);
        
        setVerificationResult({
          status: "success",
          message: "Hash verified successfully!",
          details: {
            fileName: result.fileName,
            fileType: result.fileType,
            fileSize: result.fileSize,
            timestamp,
            txHash: "0x"+hashInput, // Keep using input hash for display
            etherscanTxHash: txHash, // Add new field for Etherscan link
          },
        });
      } else {
        setVerificationResult({
          status: "error",
          message: "Hash not found in our records.",
        });
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationResult({
        status: "error",
        message: error.message || "Failed to verify hash.",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="top-right" />
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center gap-2 font-semibold" href="/">
          <Shield className="h-6 w-6" />
          <span>IP Shield</span>
        </Link>
        {networkInfo && (
          <div className="ml-4 text-sm text-muted-foreground">
            <span className="font-medium">{networkInfo.name}</span>
            <span className="mx-2">|</span>
            <span className="font-mono text-xs truncate" title={networkInfo.contractAddress}>
              Contract: {networkInfo.contractAddress.slice(0, 6)}...{networkInfo.contractAddress.slice(-4)}
            </span>
          </div>
        )}
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard/verify">
            Verify
          </Link>
        </nav>
      </header>
      <main className="flex-1 container max-w-7xl mx-auto py-6 px-4">
        <div className="grid gap-6 max-w-2xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Verify Intellectual Property</h1>
            <p className="text-muted-foreground">Check if a file or hash exists on the blockchain</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Verification Method</CardTitle>
              <CardDescription>Choose how you want to verify intellectual property</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={verificationMethod === "file" ? "default" : "outline"}
                  onClick={() => setVerificationMethod("file")}
                >
                  Upload File
                </Button>
                <Button
                  variant={verificationMethod === "hash" ? "default" : "outline"}
                  onClick={() => setVerificationMethod("hash")}
                >
                  Enter Hash
                </Button>
              </div>
            </CardContent>
          </Card>

          {verificationMethod === "file" ? (
            <Card>
              <CardHeader>
                <CardTitle>Upload File to Verify</CardTitle>
                <CardDescription>
                We&apos;ll calculate the hash of your file and check if it exists on the blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader
                  onFilesSelected={handleFileUpload}
                  disabled={!isInitialized || !web3Service}
                  disabledMessage={
                    initError
                      ? `${initError}. Reload after checking MetaMask.`
                      : "Waiting for Hardhat Local wallet and contract connection"
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Enter File Hash</CardTitle>
                <CardDescription>
                  Enter the SHA-256 hash of your file to verify its existence on the blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleHashVerify}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="hash">File Hash</Label>
                      <Input
                        id="hash"
                        placeholder="e.g., 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"
                        value={hashInput}
                        onChange={(e) => setHashInput(e.target.value)}
                      />
                    </div>
                    <Button type="submit">
                      <Search className="w-4 h-4 mr-2" />
                      Verify Hash
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {verificationResult.status !== null && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {verificationResult.status === "success" ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Verification Successful
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      Verification Failed
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{verificationResult.message}</p>

                {verificationResult.details && (
                  <div className="grid gap-2 text-sm">
                    {verificationResult.details.fileName && (
                      <div className="grid grid-cols-3 gap-1 py-1 border-b">
                        <span className="font-medium">File Name:</span>
                        <span className="col-span-2">{verificationResult.details.fileName}</span>
                      </div>
                    )}
                    {verificationResult.details.fileType && (
                      <div className="grid grid-cols-3 gap-1 py-1 border-b">
                        <span className="font-medium">File Type:</span>
                        <span className="col-span-2">{verificationResult.details.fileType}</span>
                      </div>
                    )}
                    {verificationResult.details.fileSize && (
                      <div className="grid grid-cols-3 gap-1 py-1 border-b">
                        <span className="font-medium">File Size:</span>
                        <span className="col-span-2">{verificationResult.details.fileSize}</span>
                      </div>
                    )}
                    {verificationResult.details.timestamp && (
                      <div className="grid grid-cols-3 gap-1 py-1 border-b">
                        <span className="font-medium">Timestamp:</span>
                        <span className="col-span-2">{verificationResult.details.timestamp}</span>
                      </div>
                    )}
                    {verificationResult.details.txHash && (
                      <div className="grid grid-cols-3 gap-1 py-1">
                        <span className="font-medium">Hash:</span>
                        <span className="col-span-2 truncate">{verificationResult.details.txHash}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              {verificationResult.status === "success" && verificationResult.details?.etherscanTxHash && (
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const explorerUrl = web3Service?.getBlockExplorerUrl(
                        verificationResult.details!.etherscanTxHash!,
                      );

                      if (explorerUrl) {
                        window.open(explorerUrl, "_blank");
                      }
                    }}
                  >
                    View on Blockchain Explorer
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}
        </div>
      </main>
      <footer className="border-t py-4 px-6">
        <div className="container flex flex-col sm:flex-row items-center justify-between">
          <p className="text-xs text-muted-foreground">IP Shield.</p>
          <p className="text-xs text-muted-foreground">Powered by Blockchain Technology</p>
        </div>
      </footer>
    </div>
  )
}
