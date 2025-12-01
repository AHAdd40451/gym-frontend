"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button"; 
import { getAllContacts, Contact } from "@/lib/api/services/getusers/getContacts";

const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("No auth token found");
          setLoading(false);
          return;
        }

        const res = await getAllContacts(token);
        setContacts(res || []);
      } catch (err) {
        console.error("Error fetching contacts:", err);
        setError("Failed to fetch contacts");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleViewDetail = (id: string) => {
    router.push(`/dashboard/admin/contact/${id}`);
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
      {contacts.length > 0 ? (
        contacts.map((c) => (
          <Card key={c._id} className="hover:shadow-lg transition">
            <CardContent className="pt-6 pb-6 flex flex-col items-center space-y-4">
              <Avatar className="size-20">
                <AvatarFallback>{c.firstName?.[0] || "?"}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h5 className="text-xl font-semibold">
                  {c.firstName} {c.lastName}
                </h5>
                <div className="flex items-center justify-center gap-2 text-sm mt-2 text-muted-foreground">
                  <Mail className="size-4" /> {c.yourEmail}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => handleViewDetail(c._id)}
                >
                  View Details<ArrowRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-center mt-10 text-muted-foreground">No contacts found.</p>
      )}
    </div>
  );
};

export default ContactsPage;
