"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import {
  getRagpickers,
  getRagpickerDetails,
  createRequest,
  updateRequestSmartContract
} from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { CheckCircle2, Loader2, ExternalLink } from "lucide-react"

const JobFactoryABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "picker", "type": "address" }
    ],
    "name": "createJob",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "address", "name": "contractAddress", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "picker", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "JobCreated",
    "type": "event"
  }
] as const

// The factory contract address
const FACTORY_ADDRESS = "0x4E12Afb981D466290f4cC313a0DA58B6FD7A8997"
const TEST_USER_ID = "string"

export default function NewRequestPage() {
  const [step, setStep] = useState<"select" | "form" | "success">("select")
  const [ragpickers, setRagpickers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRagpicker, setSelectedRagpicker] = useState<any>(null)
  const [walletAddress, setWalletAddress] = useState("")
  const [ethAmount, setEthAmount] = useState("0.01")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdRequest, setCreatedRequest] = useState<any>(null)
  const [contractAddress, setContractAddress] = useState("")
  const [backendUpdated, setBackendUpdated] = useState(false)

  useEffect(() => {
    const loadRagpickers = async () => {
      try {
        console.log("Fetching ragpickers...")
        const data = await getRagpickers()
        console.log("RAGPICKERS =>", data)
        setRagpickers(data)
      } catch (error) {
        console.error("Error fetching ragpickers =>", error)
        toast({
          title: "Error",
          description: "Failed to load ragpickers",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadRagpickers()
  }, [])

  const handleSubmitRequest = async () => {
    if (!selectedRagpicker) {
      toast({
        title: "No Ragpicker Selected",
        description: "Please select a ragpicker before creating a request",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    console.log("Creating request for ragpicker ->", selectedRagpicker)

    try {
      // 1. Create request in backend
      const request = await createRequest({
        customer_clerkId: TEST_USER_ID,
        ragpicker_clerkId: selectedRagpicker.clerkId
      })
      console.log("createRequest SUCCESS =>", request)

      setCreatedRequest(request)
      toast({
        title: "Request Created",
        description: "Your request has been initialized",
      })

      // 2. Then fetch that ragpicker’s wallet address
      const ragpickerDetails = await getRagpickerDetails(selectedRagpicker.clerkId)
      console.log("ragpickerDetails =>", ragpickerDetails)

      setWalletAddress(ragpickerDetails.wallet_address)

      // 3. Switch to form step
      setStep("form")
      console.log("STEP set to ->", "form")
    } catch (error: any) {
      console.error("Error in handleSubmitRequest =>", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create request",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateContract = async () => {
    if (!walletAddress || !ethAmount || !createdRequest) return

    setIsSubmitting(true)
    setBackendUpdated(false)

    try {
      if (!window.ethereum) throw new Error("Please install MetaMask!")
      console.log("Creating contract on chain. ETH amount =", ethAmount)

      // Connect to MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Create contract
      const factory = new ethers.Contract(FACTORY_ADDRESS, JobFactoryABI, signer)
      const tx = await factory.createJob(walletAddress, {
        value: ethers.parseEther(ethAmount),
      })
      console.log("Transaction submitted =>", tx)

      const receipt = await tx.wait()
      console.log("Transaction receipt =>", receipt)

      // Grab the contract address from the event
      const event = receipt.logs.find((log: any) => log.fragment?.name === "JobCreated")
      const newContractAddress = event?.args?.contractAddress
      console.log("Contract Address =>", newContractAddress)

      if (!newContractAddress) throw new Error("No contract address in receipt")
      setContractAddress(newContractAddress)

      // Update backend
      await updateRequestSmartContract(createdRequest.id, newContractAddress)
      setBackendUpdated(true)
      console.log("Backend updated with contract address.")

      toast({
        title: "Success!",
        description: "Smart contract created and backend updated",
      })
      setStep("success")
    } catch (error: any) {
      console.error("Transaction failed =>", error)
      toast({
        title: "Error",
        description: error.reason || error.message || "Failed to create contract",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Waste Collection Request
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* STEP 1: SELECT RAGPICKER */}
          {step === "select" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-700">
                Select Ragpicker
              </h3>

              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {ragpickers.map((rp) => (
                    <label
                      key={rp.clerkId}
                      className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="ragpicker"
                        value={rp.clerkId}
                        checked={selectedRagpicker?.clerkId === rp.clerkId}
                        onChange={() => setSelectedRagpicker(rp)}
                        className="form-radio h-5 w-5 text-blue-600"
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          {rp.firstName} {rp.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Rating: {rp.average_rating}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <Button
                onClick={handleSubmitRequest}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Request...
                  </>
                ) : (
                  "Create Request"
                )}
              </Button>
            </div>
          )}

          {/* STEP 2: CREATE CONTRACT */}
          {step === "form" && (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="font-medium">Request Created Successfully</p>
                </div>
                <p className="text-sm mt-1 text-green-600">
                  Your request has been created. Please complete the payment to finalize.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border space-y-2">
                <p className="font-medium text-gray-800">
                  {selectedRagpicker?.firstName} {selectedRagpicker?.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Wallet Address:</span>
                </p>
                <p className="font-mono p-2 bg-white rounded text-sm break-all border">
                  {walletAddress || "Loading..."}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ETH Amount
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("select")}
                  className="flex-1 border-gray-300"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreateContract}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Contract...
                    </>
                  ) : (
                    "Create Smart Contract"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === "success" && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">
                  Contract Created!
                </h3>
                <p className="text-sm text-gray-500">
                  The smart contract has been deployed to the blockchain
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-medium text-gray-700">
                    Contract Address
                  </p>
                  <p className="mt-1 font-mono text-sm break-all">
                    {contractAddress}
                  </p>
                  <Link
                    href={`https://sepolia.etherscan.io/address/${contractAddress}`}
                    target="_blank"
                    className="inline-flex items-center mt-2 text-sm text-blue-600 hover:underline"
                  >
                    View on Etherscan <ExternalLink className="ml-1 h-4 w-4" />
                  </Link>
                </div>

                <div
                  className={`p-4 rounded-lg border ${
                    backendUpdated
                      ? "bg-green-50 border-green-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {backendUpdated ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />
                    )}
                    <p className="text-sm font-medium">
                      {backendUpdated
                        ? "Backend successfully updated with contract address"
                        : "Updating backend with contract address..."}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  setStep("select")
                  setSelectedRagpicker(null)
                  setContractAddress("")
                  setCreatedRequest(null)
                  setBackendUpdated(false)
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Create Another Request
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
