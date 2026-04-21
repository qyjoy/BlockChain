"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { FileText, Music, ImageIcon, File, ExternalLink, Info } from "lucide-react"
import { Web3Service } from "@/lib/web3"

interface Asset {
  id: string
  name: string
  type: string
  size: string
  uploadDate: string
  status: "processing" | "verified" | "error"
  txHash?: string
  timestamp?: string
  etherscanTxHash?: string
}

interface AssetListProps {
  assets: Asset[]
}

export function AssetList({ assets }: AssetListProps) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [web3Service, setWeb3Service] = useState<Web3Service | null>(null)

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        const service = new Web3Service();
        await service.initialize();
        setWeb3Service(service);
      } catch (error: any) {
        console.error('Failed to initialize Web3:', error);
      }
    };

    initializeWeb3();
  }, []);

  const getFileIcon = (type: string) => {
    if (type.includes("image")) return <ImageIcon className="w-4 h-4" />
    if (type.includes("audio")) return <Music className="w-4 h-4" />
    if (type.includes("pdf") || type.includes("document")) return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const getStatusBadge = (status: Asset['status']) => {
    switch (status) {
      case 'processing':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Processing
          </Badge>
        );
      case 'verified':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Verified
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Error
          </Badge>
        );
    }
  };

  const handleViewOnExplorer = async (asset: Asset) => {
    if (!web3Service) return;

    try {
      const txHash = await web3Service.getHashTransactionHash(asset.txHash!);
      const explorerUrl = web3Service.getBlockExplorerUrl(txHash);

      if (!explorerUrl) {
        return;
      }

      window.open(explorerUrl, '_blank');
    } catch (error: any) {
      console.error('Failed to get transaction hash:', error);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No assets found. Upload your first file to get started.
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {getFileIcon(asset.type)}
                    <span className="truncate max-w-[150px]">{asset.name}</span>
                  </TableCell>
                  <TableCell>{asset.type.split("/")[1]?.toUpperCase() || asset.type}</TableCell>
                  <TableCell>{asset.size}</TableCell>
                  <TableCell>{asset.uploadDate}</TableCell>
                  <TableCell>
                    {getStatusBadge(asset.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedAsset(asset)}>
                      <Info className="w-4 h-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedAsset} onOpenChange={(open) => !open && setSelectedAsset(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asset Details</DialogTitle>
            <DialogDescription>Information about your protected intellectual property</DialogDescription>
          </DialogHeader>

          {selectedAsset && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4 items-center">
                <span className="font-medium">File Name:</span>
                <span className="col-span-2 truncate">{selectedAsset.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <span className="font-medium">File Type:</span>
                <span className="col-span-2">{selectedAsset.type}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <span className="font-medium">File Size:</span>
                <span className="col-span-2">{selectedAsset.size}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <span className="font-medium">Upload Date:</span>
                <span className="col-span-2">{selectedAsset.uploadDate}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <span className="font-medium">Status:</span>
                <span className="col-span-2">
                  {getStatusBadge(selectedAsset.status)}
                </span>
              </div>

              {selectedAsset.status === "verified" && (
                <>
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <span className="font-medium">Timestamp:</span>
                    <span className="col-span-2">{selectedAsset.timestamp}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <span className="font-medium">Transaction Hash:</span>
                    <span className="col-span-2 truncate">{selectedAsset.txHash}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => handleViewOnExplorer(selectedAsset)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Blockchain Explorer
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
