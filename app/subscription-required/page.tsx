"use client";

export default function SubscriptionRequiredPage() {
  const landingUrl = "https://main.dr1xf1baca1cv.amplifyapp.com/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white px-6">
      <div className="max-w-md w-full text-center bg-[#111111] border border-white/10 rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-3">
          Subscription Required
        </h1>

        <p className="text-gray-400 mb-6">
          Your account is created, but your subscription is not active yet.
          Please buy Buy Pro Plan to access your admin dashboard.
        </p>

        <a
          href={landingUrl}
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-semibold"
        >
          Buy Subscription
        </a>
      </div>
    </div>
  );
}