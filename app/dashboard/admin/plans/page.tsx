"use client";

import { useState } from "react";
import Create from "./Create";
import GetAll from "./GetAll";

function Page() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-6 space-y-6  min-h-screen">

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Plans Management</h1>
      </div>

      <div className=" p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Create Plan</h2>
        </div>

        <Create onCreated={() => setRefreshKey((key) => key + 1)} />
      </div>

      <div className=" p-4 rounded-lg shadow-sm border">


        <GetAll refreshKey={refreshKey} />
      </div>
    </div>
  );
}

export default Page;