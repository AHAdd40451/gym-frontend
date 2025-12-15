// "use client";

// import React, { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { getSubscriptionById } from "@/lib/api/services/subcription/subcription";

// interface SubscriptionDetail {
//   id: string;
//   firstName: string;
//   planName: string;
//   startDate: string;
//   endDate: string;
// }

// const Page = () => {
//   const params = useParams(); // Next.js hook to get dynamic route params
//   const { id } = params as { id: string }; // id from URL
//   const [subscription, setSubscription] = useState<SubscriptionDetail | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchSubscription = async () => {
//       try {
//         setLoading(true);
//         const res = await getSubscriptionById(id); // API call
//         if (res?.data) {
//           setSubscription(res.data);
//         } else {
//           setError("Subscription not found");
//         }
//       } catch (err) {
//         console.error(err);
//         setError("Failed to fetch subscription");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSubscription();
//   }, [id]);

//   if (loading) {
//     return <div className="p-4">Loading subscription details...</div>;
//   }

//   if (error) {
//     return <div className="p-4 text-red-500">{error}</div>;
//   }

//   if (!subscription) {
//     return <div className="p-4">No subscription data available</div>;
//   }

//   return (
//     <div className="p-4">
//       <h1 className="text-xl font-bold mb-2">Subscription Details</h1>
//       <p><strong>ID:</strong> {subscription.id}</p>
//       <p><strong>User:</strong> {subscription.firstName}</p>
//       <p><strong>Plan:</strong> {subscription.planName}</p>
//       <p><strong>Start Date:</strong> {new Date(subscription.startDate).toLocaleString()}</p>
//       <p><strong>End Date:</strong> {new Date(subscription.endDate).toLocaleString()}</p>
//     </div>
//   );
// };

// export default Page;
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSubscriptionById } from "@/lib/api/services/subcription/subcription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SubscriptionDetail {
  id: string;
  firstName: string;
  planName: string;
  startDate: string;
  endDate: string;
}

export default function Page() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [subscription, setSubscription] = useState<SubscriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const res = await getSubscriptionById(id);
        if (res?.success && res.data) {
          setSubscription(res.data);
        } else {
          setError(res?.message || "Subscription not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch subscription");
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading subscription details...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  if (!subscription) return <div className="flex justify-center items-center h-screen">No subscription data available</div>;

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-96 min-h-[500px] p-6 relative shadow-lg hover:shadow-xl transition-shadow duration-300">
        <Button
          variant="outline"
          size="sm"
          className="absolute  left-10"
          onClick={() => router.back()}
        >
          Exit
        </Button>
        <CardHeader>
          <CardTitle className="text-2xl font-bold  mt-16">Subscription Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 mt-2 text-lg">
          <p><strong>ID:</strong> {subscription.id}</p>
          <p><strong>Name:</strong> {subscription.firstName}</p>
          <p><strong>Plan:</strong> {subscription.planName}</p>
          <p><strong>Start Date:</strong> {new Date(subscription.startDate).toLocaleDateString()}</p>
          <p><strong>End Date:</strong> {new Date(subscription.endDate).toLocaleDateString()}</p>
          <Badge variant="success" className="mt-2 text-lg">Active</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
