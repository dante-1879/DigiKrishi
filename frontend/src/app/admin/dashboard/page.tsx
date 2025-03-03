"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, CheckCircle, XCircle } from "lucide-react"

axios.defaults.withCredentials = true


export default function AdminDashboard() {
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/validate-admin")
        if (!data.isAdmin) {
          router.push("/admin/login")
        } else {
          await fetchRequests()
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/admin/login")
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const fetchRequests = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/v1/user/admin/verifyRequest",
        { withCredentials: true },
      )
      setRequests([response.data.requests])
    } catch (error) {
      console.error("Error fetching verification requests:", error)
      setRequests([])
    }
  }

  const updateRequestStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      await axios.put(
        `http://localhost:4000/api/v1/user/admin/verifyRequest/${id}`,
        { verifyStatus: status },
        { withCredentials: true },
      )
      await fetchRequests() // Refresh list after update
    } catch (error) {
      console.error("Error updating request status:", error)
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p>No verification requests found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow   key={request._id || `${request?.user?.username}-${request?.createdAt}`} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${request.user}`} />
                            <AvatarFallback>{request?.user?.username?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{request.user}</span>
                        </div>
                      </TableCell>
                      <TableCell>{request.role}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            request.verifyStatus === "pending"
                              ? "outline"
                              : request.verifyStatus === "approved"
                                ? "default"
                                : "destructive"
                          }
                          className="capitalize"
                        >
                          {request.verifyStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Verification Request Details</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4 space-y-4">
                              <div className="flex items-center space-x-4">
                                <Avatar className="w-16 h-16">
                                  <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${request.user}`} />
                                  <AvatarFallback>{request?.user?.username.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold">{request.user}</h3>
                                  <p className="text-sm text-muted-foreground">Role: {request.role}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                                  <Badge
                                    variant={
                                      request.verifyStatus === "pending"
                                        ? "outline"
                                        : request.verifyStatus === "approved"
                                          ? "default"
                                          : "destructive"
                                    }
                                    className="capitalize"
                                  >
                                    {request.verifyStatus}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                                  <p>{new Date(request.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                                  <p>{new Date(request.updatedAt).toLocaleString()}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Document</p>
                                <p>{request.govtDocument}</p>
                              </div>
                              {request.verifyStatus === "pending" && (
                                <div className="flex justify-end space-x-2 mt-6">
                                  <Button
                                    variant="outline"
                                    onClick={() => updateRequestStatus(request._id, "approved")}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => updateRequestStatus(request._id, "rejected")}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

