"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, FileText, Music, ImageIcon, File, Video, Package } from "lucide-react"
import { FileUploader } from "@/components/file-uploader"
import { AssetList } from "@/components/asset-list"
import { Web3Service } from "@/lib/web3"
import { generateFileHash } from "@/lib/hash"
import { toast, Toaster } from "sonner"

export default function Dashboard() {
  const [assets, setAssets] = useState<
    Array<{
      id: string
      name: string
      type: string
      size: string
      uploadDate: string
      status: "processing" | "verified" | "error"
      txHash?: string
      timestamp?: string
    }>
  >([]);
  const [web3Service, setWeb3Service] = useState<Web3Service | null>(null);
  const [networkInfo, setNetworkInfo] = useState<{
    name: string;
    contractAddress: string;
  } | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const initializeWeb3AndLoadAssets = async (): Promise<Web3Service | null> => {
    setIsInitializing(true);
    setInitError(null);

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

      const blockchainAssets = await service.getAllProtectedAssets();
      const formattedAssets = blockchainAssets.map((asset) => ({
        id: asset.hash,
        name: asset.fileName,
        type: asset.fileType,
        size: asset.fileSize,
        uploadDate: new Date(asset.timestamp * 1000).toISOString().split("T")[0],
        status: "verified" as const,
        txHash: asset.hash,
        timestamp: new Date(asset.timestamp * 1000).toLocaleString(),
      }));

      setAssets(formattedAssets);
      return service;
    } catch (error: any) {
      const message = error.message || "Failed to initialize Web3";
      setWeb3Service(null);
      setNetworkInfo(null);
      setInitError(message);
      toast.error(message);
      return null;
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    void initializeWeb3AndLoadAssets();
  }, []);

  const handleFileUpload = async (files: File[]) => {
    const service = web3Service ?? await initializeWeb3AndLoadAssets();

    if (!service) {
      toast.error(initError || "Web3 is not ready. Check MetaMask network and reload.");
      return;
    }

    // Add new files to UI immediately with processing status
    const newAssets = files.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: file.name,
      type: file.type,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadDate: new Date().toISOString().split("T")[0],
      status: "processing" as const,
    }));

    setAssets(prev => [...newAssets, ...prev]);

    // Process each file
    for (const [index, file] of files.entries()) {
      try {
        // Generate hash
        const hash = await generateFileHash(file);

        // Store hash and file information on blockchain
        const txHash = await service.storeHash(
          hash,
          file.name,
          file.type,
          `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        );

        // Update asset status
        setAssets(prev => prev.map(asset => {
          if (asset.id === newAssets[index].id) {
            return {
              ...asset,
              status: "verified",
              txHash,
              timestamp: new Date().toLocaleString(),
            };
          }
          return asset;
        }));

        toast.success(`File "${file.name}" has been protected`);
        
        // Refresh assets from blockchain
        const blockchainAssets = await service.getAllProtectedAssets();
        const formattedAssets = blockchainAssets.map(asset => ({
          id: asset.hash,
          name: asset.fileName,
          type: asset.fileType,
          size: asset.fileSize,
          uploadDate: new Date(asset.timestamp * 1000).toISOString().split('T')[0],
          status: "verified" as const,
          txHash: asset.hash,
          timestamp: new Date(asset.timestamp * 1000).toLocaleString(),
        }));
        setAssets(formattedAssets);

      } catch (error: any) {
        console.error(error);
        
        setAssets(prev => prev.map(asset => {
          if (asset.id === newAssets[index].id) {
            return {
              ...asset,
              status: "error",
            };
          }
          return asset;
        }));

        toast.error(error.message || `Failed to protect "${file.name}"`);
      }
    }
  };

  // Helper function to categorize files
  const getCategoryCounts = () => {
    return {
      documents: assets.filter(a => 
        a.type.includes('pdf') || 
        a.type.includes('document') || 
        a.type.includes('txt') ||
        a.type.includes('doc')
      ).length,
      music: assets.filter(a => 
        a.type.includes('audio') || 
        a.type.includes('mp3') || 
        a.type.includes('wav')
      ).length,
      images: assets.filter(a => 
        a.type.includes('image') || 
        a.type.includes('png') || 
        a.type.includes('jpg') || 
        a.type.includes('jpeg') || 
        a.type.includes('gif')
      ).length,
      videos: assets.filter(a => 
        a.type.includes('video') || 
        a.type.includes('mp4') || 
        a.type.includes('mov') || 
        a.type.includes('avi')
      ).length,
      others: assets.filter(a => {
        const isDocument = a.type.includes('pdf') || a.type.includes('document') || a.type.includes('txt') || a.type.includes('doc');
        const isMusic = a.type.includes('audio') || a.type.includes('mp3') || a.type.includes('wav');
        const isImage = a.type.includes('image') || a.type.includes('png') || a.type.includes('jpg') || a.type.includes('jpeg') || a.type.includes('gif');
        const isVideo = a.type.includes('video') || a.type.includes('mp4') || a.type.includes('mov') || a.type.includes('avi');
        return !isDocument && !isMusic && !isImage && !isVideo;
      }).length
    };
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
        <div className="grid gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Manage and protect your intellectual property</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assets.length}</div>
                <p className="text-xs text-muted-foreground">Protected items</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <File className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getCategoryCounts().documents}</div>
                <p className="text-xs text-muted-foreground">Protected documents</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Music</CardTitle>
                <Music className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getCategoryCounts().music}</div>
                <p className="text-xs text-muted-foreground">Protected audio files</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Images</CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getCategoryCounts().images}</div>
                <p className="text-xs text-muted-foreground">Protected images</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Videos</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getCategoryCounts().videos}</div>
                <p className="text-xs text-muted-foreground">Protected videos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Others</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getCategoryCounts().others}</div>
                <p className="text-xs text-muted-foreground">Other protected files</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload New Asset</CardTitle>
              <CardDescription>Upload your intellectual property to secure it on the blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader
                onFilesSelected={handleFileUpload}
                disabled={isInitializing || !web3Service}
                disabledMessage={
                  initError
                    ? `${initError}. Reload after checking MetaMask.`
                    : "Waiting for Hardhat Local wallet and contract connection"
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Protected Assets</CardTitle>
              <CardDescription>View and manage your intellectual property</CardDescription>
            </CardHeader>
            <CardContent>
              <AssetList assets={assets} />
            </CardContent>
          </Card>
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
