"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mail, MessageSquare, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { DialogClose } from "@/components/ui/dialog";
import { getAllContacts, Contact } from "@/lib/api/services/getusers/getContacts";
import { deleteContact } from "@/lib/api/services/getusers/getContacts"; 

const ContactDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const token = localStorage.getItem("authToken") || "";
        const contacts = await getAllContacts(token);
        const c = contacts.find((x) => x._id === id) || null;
        setContact(c);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchContact();
  }, [id]);

  const handleDelete = async () => {
  if (!contact) return;

  const token = localStorage.getItem("authToken") || "";
  setDeleting(true);

  try {
    const success = await deleteContact(token, contact._id);

    if (success) {
      toast.success("Contact deleted successfully!");
      router.back();
    } else {
      toast.error("Failed to delete contact. Try again.");
    }
  } catch (err) {
    console.error(err);
    toast.error("An error occurred while deleting the contact.");
  } finally {
    setDeleting(false);
  }
};


  if (loading) return <p className="mt-10 text-center">Loading...</p>;
  if (!contact) return <p className="mt-10 text-center text-red-500">Contact not found</p>;

  return (
    <div className="mt-10 flex justify-center px-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center space-y-4 pt-4 pb-8">
     
          <div className="mb-2 self-start">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-1">
              <ArrowLeft className="size-4" />
            </Button>
          </div>

     
          <Avatar className="size-24">
            <AvatarFallback>
              {contact.firstName?.[0]}
              {contact.lastName?.[0]}
            </AvatarFallback>
          </Avatar>

          
          <h5 className="flex items-center gap-2 text-xl font-semibold">
            {contact.firstName} {contact.lastName}
          </h5>

          <div className="text-muted-foreground mt-2 flex items-center justify-center gap-2 text-sm">
            <Mail className="size-4" /> {contact.yourEmail}
          </div>

         
          {contact.phone && <span className="mt-2 text-sm">📞 {contact.phone}</span>}

         
          {contact.message && (
            <div
              className="text-muted-foreground scrollbar-hide mt-4 flex gap-2 overflow-y-auto px-4 text-sm"
              style={{ maxHeight: "120px" }}
            >
              <MessageSquare className="mt-1 size-4" />
              <p>{contact.message}</p>
            </div>
          )}

        
      <Dialog>
  <DialogTrigger asChild>
    <Button
      variant="destructive"
      className="mt-6 w-full"
      disabled={deleting}
    >
      {deleting ? "Deleting..." : "Remove Contact"}
    </Button>
  </DialogTrigger>

  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle className="text-red-500">Delete Contact?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. Are you sure you want to permanently delete{" "}
        <strong>{contact.firstName} {contact.lastName}</strong>?
      </DialogDescription>
    </DialogHeader>

  <DialogFooter>
  <DialogClose asChild>
    <Button variant="outline">
      Cancel
    </Button>
  </DialogClose>

  <Button
    variant="destructive"
    onClick={handleDelete}
  >
    Yes, Delete
  </Button>
</DialogFooter>

  </DialogContent>
</Dialog>

        </CardContent>
      </Card>
    </div>
  );
};

export default ContactDetailPage;
