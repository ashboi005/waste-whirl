// API base URL
const API_BASE_URL = "https://ohmsi5xapc.execute-api.ap-south-1.amazonaws.com/Prod"
// const API_BASE_URL = "https://jrwbl2n7-8000.inc1.devtunnels.ms"

// Types
export interface User {
  email: string
  firstName: string
  lastName: string
  role: string
  clerkId: string
  createdAt?: string
}

export interface UserDetails {
  phone?: string
  address?: string
  bio?: string
  clerkId: string
  profile_pic_url?: string
}

export interface CustomerDetails {
  wallet_address: string
  clerkId: string
}

export interface RagpickerDetails {
    wallet_address: string
    RFID?: string
    average_rating: number
    clerkId: string
    firstName: string
    lastName: string
    email: string
    role: string
    profile_pic_url?: string
    address?: string
    phone?: string
  }
  
  export interface RagpickerSummary {
    clerkId: string
    firstName: string
    lastName: string
    average_rating: number
    profile_pic_url?: string
  }
  

export interface Request {
  customer_clerkId: string
  ragpicker_clerkId: string
  id: number
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED"
  created_at: string
  updated_at?: string
  customer_name?: string
  ragpicker_name?: string
}

export interface Review {
  customer_clerkId: string
  ragpicker_clerkId: string
  rating: number
  review?: string
  id: number
  created_at: string
  customer_name?: string
  ragpicker_name?: string
}
export async function updateRequestSmartContract(
    requestId: number,
    smart_contract_address: string
  ): Promise<Request> {
    try {
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/smart-contract`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smart_contract_address }),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `HTTP error! status: ${response.status}`
        );
      }
  
      return await response.json();
    } catch (error) {
      console.error("Failed to update smart contract:", error);
      throw error; // Re-throw for handling in the UI
    }
  }

// API functions
export async function getUser(clerkId: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${clerkId}`)
  if (!response.ok) throw new Error("Failed to fetch user")
  return response.json()
}

export async function getUsers(limit = 100, skip = 0): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/users/?limit=${limit}&skip=${skip}`)
  if (!response.ok) throw new Error("Failed to fetch users")
  return response.json()
}

export async function createUser(userData: Omit<User, "createdAt">): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  })
  if (!response.ok) throw new Error("Failed to create user")
  return response.json()
}

export async function updateUser(clerkId: string, userData: Omit<User, "createdAt">): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${clerkId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  })
  if (!response.ok) throw new Error("Failed to update user")
  return response.json()
}

export async function deleteUser(clerkId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${clerkId}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete user")
}

// User details
export async function getUserDetails(clerkId: string): Promise<UserDetails> {
  const response = await fetch(`${API_BASE_URL}/users/${clerkId}/details`)
  if (!response.ok) throw new Error("Failed to fetch user details")
  return response.json()
}

export async function createUserDetails(
  clerkId: string,
  details: { phone?: string; address?: string; bio?: string; base64_image?: string; file_extension?: string },
): Promise<UserDetails> {
  const response = await fetch(`${API_BASE_URL}/users/${clerkId}/details`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details),
  })
  if (!response.ok) throw new Error("Failed to create user details")
  return response.json()
}

export async function updateUserDetails(
  clerkId: string,
  details: { phone?: string; address?: string; bio?: string; base64_image?: string; file_extension?: string },
): Promise<UserDetails> {
  const response = await fetch(`${API_BASE_URL}/users/${clerkId}/details`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details),
  })
  if (!response.ok) throw new Error("Failed to update user details")
  return response.json()
}

// Customer details
export async function getCustomerDetails(clerkId: string): Promise<CustomerDetails> {
  const response = await fetch(`${API_BASE_URL}/customers/${clerkId}/details`)
  if (!response.ok) throw new Error("Failed to fetch customer details")
  return response.json()
}

export async function createCustomerDetails(
  clerkId: string,
  details: { wallet_address: string },
): Promise<CustomerDetails> {
  const response = await fetch(`${API_BASE_URL}/customers/${clerkId}/details`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details),
  })
  if (!response.ok) throw new Error("Failed to create customer details")
  return response.json()
}

export async function updateCustomerDetails(
  clerkId: string,
  details: { wallet_address: string },
): Promise<CustomerDetails> {
  const response = await fetch(`${API_BASE_URL}/customers/${clerkId}/details`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details),
  })
  if (!response.ok) throw new Error("Failed to update customer details")
  return response.json()
}

// Ragpicker details
export async function getRagpickers(limit = 100, skip = 0): Promise<RagpickerSummary[]> {
  const response = await fetch(`${API_BASE_URL}/ragpickers/all-ragpickers/?limit=${limit}&skip=${skip}`)
  if (!response.ok) throw new Error("Failed to fetch ragpickers")
  return response.json()
}

export async function getRagpickerDetails(clerkId: string): Promise<RagpickerDetails> {
  const response = await fetch(`${API_BASE_URL}/ragpickers/${clerkId}/details`)
  if (!response.ok) throw new Error("Failed to fetch ragpicker details")
  return response.json()
}

export async function createRagpickerDetails(
  clerkId: string,
  details: { wallet_address: string },
): Promise<RagpickerDetails> {
  const response = await fetch(`${API_BASE_URL}/ragpickers/${clerkId}/details`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details),
  })
  if (!response.ok) throw new Error("Failed to create ragpicker details")
  return response.json()
}

export async function updateRagpickerDetails(
  clerkId: string,
  details: { wallet_address: string; RFID?: string },
): Promise<RagpickerDetails> {
  const response = await fetch(`${API_BASE_URL}/ragpickers/${clerkId}/details`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details),
  })
  if (!response.ok) throw new Error("Failed to update ragpicker details")
  return response.json()
}

// Requests
export async function createRequest(request: {
  customer_clerkId: string
  ragpicker_clerkId: string
}): Promise<Request> {
  const response = await fetch(`${API_BASE_URL}/requests/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
  if (!response.ok) throw new Error("Failed to create request")
  return response.json()
}

export async function getCustomerRequests(clerkId: string, status?: string): Promise<Request[]> {
  const url = status
    ? `${API_BASE_URL}/requests/customer/${clerkId}?status=${status}`
    : `${API_BASE_URL}/requests/customer/${clerkId}`

  const response = await fetch(url)
  if (!response.ok) throw new Error("Failed to fetch customer requests")
  return response.json()
}

export async function getRagpickerRequests(clerkId: string, status?: string): Promise<Request[]> {
  const url = status
    ? `${API_BASE_URL}/requests/ragpicker/${clerkId}?status=${status}`
    : `${API_BASE_URL}/requests/ragpicker/${clerkId}`

  const response = await fetch(url)
  if (!response.ok) throw new Error("Failed to fetch ragpicker requests")
  return response.json()
}

export async function getRequest(requestId: number): Promise<Request> {
  const response = await fetch(`${API_BASE_URL}/requests/${requestId}`)
  if (!response.ok) throw new Error("Failed to fetch request")
  return response.json()
}

export async function updateRequestStatus(
  requestId: number,
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED",
): Promise<Request> {
  const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  if (!response.ok) throw new Error("Failed to update request status")
  return response.json()
}

// Reviews
export async function createReview(review: {
  customer_clerkId: string
  ragpicker_clerkId: string
  rating: number
  review?: string
}): Promise<Review> {
  const response = await fetch(`${API_BASE_URL}/reviews/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(review),
  })
  if (!response.ok) throw new Error("Failed to create review")
  return response.json()
}

export async function getRagpickerReviews(clerkId: string): Promise<Review[]> {
  const response = await fetch(`${API_BASE_URL}/reviews/ragpicker/${clerkId}`)
  if (!response.ok) throw new Error("Failed to fetch ragpicker reviews")
  return response.json()
}
