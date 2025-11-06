// "use client";
// import React, { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { Mail } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { getUserById, buyTrainer } from "@/lib/api/services/getstaff/staff";

// const BookingUserDetail = () => {
//   const { id } = useParams();
//   const [user, setUser] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [buying, setBuying] = useState(false);

//   const loggedInUser =
//     JSON.parse(localStorage.getItem("loggedInUser") || "{}");

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const token = localStorage.getItem("authToken") || "";
//         const res = await getUserById(id as string, token);
//         const userData = res?.data?.data?.user;
//         setUser(userData);
//       } catch (err) {
//         console.error("Error fetching user:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) fetchUser();
//   }, [id]);

//   if (loading) return <p className="mt-10 text-center">Loading...</p>;
//   if (!user) return <p className="mt-10 text-center">No user found.</p>;

//   const trainer = user.trainerProfile;

//   // ✅ Buy Trainer Plan (frontend API)
//   const handleBuyPlan = async () => {
//     try {
//       setBuying(true);
//       const token = localStorage.getItem("authToken") || "";

//       const res = await buyTrainer(user._id, token);

//       // ✅ Only success when backend returns message
//       if (res?.message) {
//         alert("Plan purchased successfully!");
//       } else {
//         alert("Failed to buy plan");
//       }
//     } catch (err: any) {
//       console.error("Error buying plan:", err);
//       alert(err?.message || "Failed to buy plan");
//     } finally {
//       setBuying(false);
//     }
//   };

//   const qualities =
//     trainer?.qualities?.length > 0
//       ? trainer.qualities
//       : ["Motivation", "Discipline", "HIIT"]; // ✅ Default fallback qualities

//   return (
//     <div className="mt-10 flex justify-center px-10">
//       <Card className="w-full max-w-md">
//         <CardContent className="flex flex-col items-center space-y-4 pt-6 pb-8">
//           <Avatar className="size-24">
//             <AvatarImage src={user.profileImage || undefined} />
//             <AvatarFallback>
//               {user.firstName?.[0]}
//               {user.lastName?.[0]}
//             </AvatarFallback>
//           </Avatar>

//           <h5 className="flex items-center justify-center gap-2 text-xl font-semibold">
//             {user.firstName} {user.lastName}
//             <Badge variant="info">{user.role}</Badge>
//           </h5>

//           <div className="text-muted-foreground mt-2 flex items-center justify-center gap-2 text-sm">
//             <Mail className="size-4" /> {user.email}
//           </div>

//           <Badge
//             variant={user.status === "active" ? "success" : "secondary"}
//             className="mt-3"
//           >
//             {user.status}
//           </Badge>

//           <Badge
//             variant={user.isEmailVerified ? "success" : "secondary"}
//             className="mt-3"
//           >
//             {user.isEmailVerified ? "Verified" : "Not Verified"}
//           </Badge>

//           {/* ✅ Trainer Section */}
//           {user.role === "staff" && trainer && (
//             <div className="mt-4 w-full text-sm space-y-2 text-center border-t pt-4">
//               <p>
//                 <strong>Trainer:</strong> Yes
//               </p>

//               {trainer.plan && (
//                 <p>
//                   <strong>Plan:</strong> {trainer.plan.name} — $
//                   {trainer.plan.price}
//                 </p>
//               )}

//               {trainer.availability?.days && (
//                 <p>
//                   <strong>Available Days:</strong> {trainer.availability.days}
//                 </p>
//               )}

//               <div>
//                 <strong>Qualities:</strong>
//                 <ul className="list-disc ml-6 mt-1 text-left">
//                   {qualities.map((q: string, index: number) => (
//                     <li key={index}>{q}</li>
//                   ))}
//                 </ul>
//               </div>

//               {/* ✅ BUY BUTTON */}
//               {loggedInUser.role !== "staff" && (
//                 <Button
//                   className="mt-4 w-full"
//                   onClick={handleBuyPlan}
//                   disabled={buying}
//                 >
//                   {buying ? "Processing..." : "Buy Plan"}
//                 </Button>
//               )}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default BookingUserDetail;

"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getUserById, buyTrainer } from "@/lib/api/services/getstaff/staff";

const BookingUserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  const loggedInUser =
    JSON.parse(localStorage.getItem("loggedInUser") || "{}");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken") || "";
        const res = await getUserById(id as string, token);

        const userData = res?.data?.data?.user || res?.data?.user || null;
        setUser(userData);
      } catch (err) {
        console.error("Error fetching user:", err);
        alert("Failed to fetch user details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  if (loading) return <p className="mt-10 text-center">Loading...</p>;
  if (!user) return <p className="mt-10 text-center">No user found.</p>;

  const trainer = user.trainerProfile;

  // ✅ Buy Trainer Plan (frontend API)
  const handleBuyPlan = async () => {
    try {
      setBuying(true);
      const token = localStorage.getItem("authToken") || "";
      const res = await buyTrainer(user._id, token);

      // 👇 Show backend message directly (success or fail)
      const backendMsg =
        res?.data?.message || res?.message || "Unexpected response from server.";
      alert(backendMsg);
    } catch (err: any) {
      console.error("Error buying plan:", err);

      // 👇 Show backend or fallback error message
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong while purchasing the plan.";
      alert(errMsg);
    } finally {
      setBuying(false);
    }
  };

  const qualities =
    trainer?.qualities?.length > 0
      ? trainer.qualities
      : ["Motivation", "Discipline", "HIIT"]; // Default fallback

  return (
    <div className="mt-10 flex justify-center px-10">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center space-y-4 pt-6 pb-8">
          <Avatar className="size-24">
            <AvatarImage src={user.profileImage || undefined} />
            <AvatarFallback>
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>

          <h5 className="flex items-center justify-center gap-2 text-xl font-semibold">
            {user.firstName} {user.lastName}
            <Badge variant="info">{user.role}</Badge>
          </h5>

          <div className="text-muted-foreground mt-2 flex items-center justify-center gap-2 text-sm">
            <Mail className="size-4" /> {user.email}
          </div>

          <Badge
            variant={user.status === "active" ? "success" : "secondary"}
            className="mt-3"
          >
            {user.status}
          </Badge>

          <Badge
            variant={user.isEmailVerified ? "success" : "secondary"}
            className="mt-3"
          >
            {user.isEmailVerified ? "Verified" : "Not Verified"}
          </Badge>

          {/* ✅ Trainer Section */}
          {user.role === "staff" && trainer && (
            <div className="mt-4 w-full text-sm space-y-2 text-center border-t pt-4">
              <p>
                <strong>Trainer:</strong> Yes
              </p>

              {trainer.plan && (
                <p>
                  <strong>Plan:</strong> {trainer.plan.name} — $
                  {trainer.plan.price}
                </p>
              )}

              {trainer.availability?.days && (
                <p>
                  <strong>Available Days:</strong> {trainer.availability.days}
                </p>
              )}

              <div>
                <strong>Qualities:</strong>
                <ul className="list-disc ml-6 mt-1 text-left">
                  {qualities.map((q: string, index: number) => (
                    <li key={index}>{q}</li>
                  ))}
                </ul>
              </div>

              {/* ✅ BUY BUTTON */}
              {loggedInUser.role !== "staff" && (
                <Button
                  className="mt-4 w-full"
                  onClick={handleBuyPlan}
                  disabled={buying}
                >
                  {buying ? "Processing..." : "Buy Plan"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingUserDetail;
