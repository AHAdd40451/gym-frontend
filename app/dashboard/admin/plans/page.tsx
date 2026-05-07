import Create from "./Create";
import GetAll from "./GetAll";

function Page() {
  return (
    <div className="p-6 space-y-6  min-h-screen">
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Plans Management</h1>
      </div>

      <div className=" p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Create Plan</h2>
        </div>

        <Create />
      </div>

      <div className=" p-4 rounded-lg shadow-sm border">
       

        <GetAll />
      </div>
    </div>
  );
}

export default Page;