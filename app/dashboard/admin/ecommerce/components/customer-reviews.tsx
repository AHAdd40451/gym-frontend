"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Star } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { getAllReviews } from "@/lib/api/services/review/review";

type Review = {
  _id: string;
  name: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
};

export function EcommerceCustomerReviewsCard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch ALL reviews (same API as reviews page)
useEffect(() => {
  const fetchReviews = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const res = await getAllReviews(token);

    console.log("REVIEWS RESPONSE 👉", res); // 👈 debug (remove later)

    if (res?.data?.success) {
      setReviews(res.data.reviews || []);
    }

    setLoading(false);
  };

  fetchReviews();
}, []);


  // 🔹 Dashboard calculations (FRONTEND)
  const stats = useMemo(() => {
    const total = reviews.length;

    const ratingCount = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    let ratingSum = 0;

    reviews.forEach((r) => {
      ratingCount[r.rating as 1 | 2 | 3 | 4 | 5]++;
      ratingSum += r.rating;
    });

    const average = total ? (ratingSum / total).toFixed(1) : "0.0";

    return {
      total,
      average,
      ratingCount,
      recent: reviews.slice(0, 1)
    };
  }, [reviews]);

  if (loading) {
    return (
      <Card className="lg:col-span-12 xl:col-span-5">
        <CardContent className="p-6">Loading reviews...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-12 xl:col-span-5">
      <CardHeader>
        <CardTitle>Customer Reviews</CardTitle>
        <CardDescription>
          Based on {stats.total} customer reviews
        </CardDescription>
        <CardAction>
          {/* <Button size="sm" variant="outline">
            View All <ChevronRight />
          </Button> */}
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* ⭐ Average */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`size-6 ${
                    i <= Math.round(Number(stats.average))
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <div className="text-3xl font-bold">{stats.average}</div>
            <div className="text-sm text-muted-foreground">out of 5</div>
          </div>

          {/* 📊 Distribution */}
          <div className="space-y-3 lg:col-span-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.ratingCount[star as 1 | 2 | 3 | 4 | 5];
              const percentage = stats.total
                ? (count / stats.total) * 100
                : 0;

              return (
                <div key={star} className="flex items-center">
                  <div className="w-8 text-sm">{star} ★</div>
                  <div className="mx-2 h-3 flex-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-10 text-right text-sm text-muted-foreground">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 📝 Recent Review */}
        {stats.recent.map((review) => (
          <div
            key={review._id}
            className="mt-6 rounded-lg border bg-muted p-4"
          >
            <div className="mb-2 flex justify-between">
              <div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <h4 className="font-medium">{review.title}</h4>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toDateString()}
              </span>
            </div>

            <p className="mb-2 text-sm text-muted-foreground">
              {review.comment}
            </p>

            <span className="text-xs font-medium">{review.name}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
