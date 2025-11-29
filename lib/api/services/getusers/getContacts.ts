import { serverFetch } from "../../api-actions/server";
import { API_ENDPOINTS } from "../../constants/constants";

export interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  yourEmail: string;
  phone?: string;
  message?: string;
}


interface ContactsResponse {
  success: boolean;
  count: number;
  contacts: Contact[];
}


export async function getAllContacts(token: string): Promise<Contact[]> {
  try {

    const response = await serverFetch<ContactsResponse>(API_ENDPOINTS.CONTECTS.BASE, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });

    return response.data?.contacts || [];

  } catch (error) {
    console.error("Contacts fetch error:", error);
    return [];
  }
}


//Delete contact

interface DeleteContactResponse {
  success: boolean;
  message: string;
}

export async function deleteContact(token: string, contactId: string): Promise<boolean> {
  try {
    const endpoint = `${API_ENDPOINTS.CONTECTS.BASE}/${contactId}`;

    const response = await serverFetch<DeleteContactResponse>(endpoint, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

   
    return response.data?.success || false;

  } catch (error) {
    console.error("Delete contact error:", error);
    return false;
  }
}
